#!/usr/bin/env node
'use strict';
const {createHash}=require('node:crypto');
const {validate,dimensions}=require('./validate-dependencies.cjs');
const io=require('./dependency-io.cjs');
const id=(...parts)=>createHash('sha256').update(JSON.stringify(parts)).digest('hex').slice(0,24);
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
function redact(value){
 if(typeof value==='string')return value.replace(/https?:\/\/[^\s<>"']+/gi,raw=>{try{
  const url=new URL(raw);url.username='';url.password='';
  for(const key of [...url.searchParams.keys()])if(/token|auth|password|secret|key|signature|credential/i.test(key))url.searchParams.set(key,'REDACTED');
  return url.href;
 }catch{return '[invalid URL omitted]';}});
 if(Array.isArray(value))return value.map(redact);
 if(obj(value))return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,redact(v)]));
 return value;
}
const supported=c=>c.manager==='npm'?/^11\./.test(c.version):c.manager==='pnpm'&&/^10\./.test(c.version)&&Number(c.version.split('.')[1])>=23;
function normalize(input){
 if(!obj(input)||typeof input.source_revision!=='string'||!Array.isArray(input.manifests)||!Array.isArray(input.captures))throw Error('Expected source_revision, manifests and captures');
 const x={schema_version:1,source_revision:input.source_revision,generated_at:input.generated_at||new Date().toISOString(),instances:[],edges:[],advisories:[],actions:[],lessons:[],patches:[],evidence:[],coverage:{}};
 for(const d of dimensions)x.coverage[d]={status:'unavailable',scope:'not collected',evidence:[],gaps:['Not collected']};
 const cover=(dim,e,scope,gaps=[])=>{const c=x.coverage[dim];c.status=gaps.length||c.gaps.some(g=>g!=='Not collected')?'partial':'complete';c.scope=c.scope==='not collected'?scope:[...new Set([c.scope,scope])].join('; ');c.evidence.push(e.id);c.gaps=[...new Set([...c.gaps.filter(g=>g!=='Not collected'),...gaps])];};
 const instanceIds=new Set(),childrenByParent=new Map();
 const fail=(dim,e,gap)=>{e.status='error';const c=x.coverage[dim];c.gaps=[...new Set([...c.gaps.filter(g=>g!=='Not collected'),gap])];c.status=c.evidence.length?'partial':'unavailable';};
 const workspaceNames=new Map(input.manifests.filter(m=>m.data&&typeof m.data.name==='string').map(m=>[m.data.name,m.workspace]));
 const add=(name,version,workspace,location,provenance,evidence,parent,resolutionContext=null)=>{
  const key=id(workspace,location,name,version,provenance,resolutionContext);
  if(!instanceIds.has(key)){
   instanceIds.add(key);x.instances.push({id:key,name,version,workspace,location,provenance,evidence:[evidence],...(resolutionContext?{resolution_context:resolutionContext}:{})});
  }
  if(parent){
   if(!childrenByParent.has(parent))childrenByParent.set(parent,new Set());
   const children=childrenByParent.get(parent);
   if(!children.has(key)){children.add(key);x.edges.push({from:parent,to:key});}
  }
  return key;
 };
 for(const m of input.manifests){
  if(!obj(m.data)||typeof m.workspace!=='string')throw Error('Invalid manifest entry');
  const e={id:id('manifest',m.workspace),kind:'manifest',status:'ok',binding:'current',source_revision:x.source_revision,captured_at:x.generated_at};x.evidence.push(e);
  for(const field of ['dependencies','devDependencies','optionalDependencies','peerDependencies'])for(const [name,version] of Object.entries(m.data[field]||{})){
   if(typeof version!=='string')throw Error('Invalid declared dependency range');
   add(name,version,m.workspace,`${field}/${name}`,'declared',e.id);
  }
  cover('declarations',e,'explicit supplied manifests',m.data.workspaces?['Workspace expansion must be checked against supplied manifests']:[]);
 }
 const captureOrder={list:0,outdated:1,audit:2};
 for(const c of [...input.captures].sort((a,b)=>(captureOrder[a?.kind]??3)-(captureOrder[b?.kind]??3))){
  if(!obj(c)||typeof c.id!=='string')throw Error('Invalid capture');
  const e={id:c.id,kind:c.kind,status:'ok',binding:c.source_revision===x.source_revision?'current':c.source_revision?'historical':'unbound',source_revision:c.source_revision||null,captured_at:c.captured_at,manager:c.manager,version:c.version,exit_code:c.exit_code,scope:c.scope||'unspecified',filters:Array.isArray(c.filters)?c.filters:[],payload_digest:id(c.payload),acquisition:`${c.manager} ${c.kind} owner capture`};x.evidence.push(e);
  const dim={list:'resolutions',outdated:'outdated',audit:'advisories'}[c.kind];
  if(!dim){e.status='error';continue;}
  let gap='';
  if(!supported(c))gap='Unsupported package-manager adapter';
  else if(e.binding!=='current')gap='Capture is not bound to current source';
  else if(!obj(c.payload)&&!Array.isArray(c.payload))gap='Invalid captured JSON shape';
  else if(c.payload.error)gap='Package-manager acquisition failed';
  else if(!Number.isInteger(c.exit_code)||c.exit_code<0||c.exit_code>1)gap='Acquisition failed or exit code missing';
  if(gap){fail(dim,e,gap);continue;}
  const gaps=Array.isArray(c.filters)&&c.filters.length?['Acquisition filters limit coverage']:[];
  if(c.kind==='list'){
   const roots=Array.isArray(c.payload)?c.payload:[c.payload];
   if(!roots.length||roots.some(r=>!obj(r)||typeof r.name!=='string')){fail(dim,e,'Invalid tree shape');continue;}
   if(!['lockfile','installed'].includes(c.provenance)){fail(dim,e,'Tree provenance missing');continue;}
   if(c.exit_code!==0)gaps.push('Package tree reports dependency problems');
   const walk=(tree,workspace,location,parent,depth=0)=>{
    if(depth>64){gaps.push('Tree depth exceeds supported traversal');return;}
    for(const field of ['dependencies','devDependencies','optionalDependencies'])for(const [name,p] of Object.entries(tree[field]||{})){
     if(!obj(p)||typeof p.version!=='string'){gaps.push('Unresolved package instance');continue;}
     const workspaceRoot=depth===0&&c.manager==='npm'&&typeof p.resolved==='string'&&p.resolved.startsWith('file:')&&workspaceNames.has(name);
     const packageWorkspace=workspaceRoot?workspaceNames.get(name):workspace;
     const loc=workspaceRoot?'.':`${location}/${field}/${name}`;
     const context=c.manager==='pnpm'&&typeof p.path==='string'?p.path:null;
     const key=add(name,p.version,packageWorkspace,loc,c.provenance,e.id,parent,context);
     if(p.missing||p.invalid||p.extraneous||p.problems)gaps.push('Package tree contains unresolved or extraneous instances');
     walk(p,packageWorkspace,loc,key,depth+1);
    }
   };
   roots.forEach((r,i)=>{if(r.problems)gaps.push('Package-manager tree problems');walk(r,c.workspaces?.[i]||r.name,'.',null);});
   cover(dim,e,c.scope||'captured tree',gaps);
  }else if(c.kind==='outdated'){
   const entries=Array.isArray(c.payload)?c.payload:Object.entries(c.payload).map(([name,p])=>({name,...p}));
   for(const p of entries){
    if(!obj(p)||typeof p.name!=='string'){gaps.push('Unknown outdated output entry');continue;}
    const resolved=x.instances.filter(i=>i.provenance!=='declared');
    const workspaces=[...new Set(resolved.map(i=>i.workspace))];
    const entryWorkspace=typeof p.workspace==='string'?p.workspace:workspaces.includes(p.dependent)?p.dependent:null;
    const scope=entryWorkspace?[entryWorkspace]:Array.isArray(c.workspaces)?c.workspaces:workspaces.length===1?workspaces:[];
    let candidates=resolved.filter(i=>i.name===p.name&&scope.includes(i.workspace)&&typeof p.current==='string'&&i.version===p.current);
    if(typeof p.location==='string'){
     const clean=s=>s.replace(/^\.\//,'');
     candidates=candidates.filter(i=>{
      const loc=clean(i.location.replace(/\/(?:dependencies|devDependencies|optionalDependencies)\//g,'/node_modules/'));
      return [clean(i.location),loc,clean(`${i.workspace}/${loc}`)].includes(clean(p.location));
     });
    }
    const observation={wanted:typeof p.wanted==='string'?p.wanted:null,latest:typeof p.latest==='string'?p.latest:null,evidence:e.id};
    if(candidates.length===1)candidates[0].outdated=observation;
    else{
     gaps.push('Outdated observation has no unique workspace/version/location match');
     (e.unmapped_outdated??=[]).push({name:p.name,current:typeof p.current==='string'?p.current:null,...observation});
    }
   }
   gaps.push('Outdated observations apply only to captured package scope; missing entries do not prove freshness');
   cover(dim,e,c.scope||'captured outdated scope',gaps);
  }else{
   const findings=[];
   if(obj(c.payload.vulnerabilities)){
    for(const [name,v] of Object.entries(c.payload.vulnerabilities))for(const a of Array.isArray(v.via)?v.via:[])if(obj(a))findings.push({name,advisory:a});
   }else if(obj(c.payload.advisories)){
    for(const a of Object.values(c.payload.advisories))findings.push({name:a.module_name,advisory:a});
   }
   if(!obj(c.payload.vulnerabilities)&&!obj(c.payload.advisories)){fail(dim,e,'Unknown audit output shape');continue;}
   for(const {name,advisory:a} of findings){
    const aid=String(a.github_advisory_id||a.source||a.id||id(name,a.title));
    let entry=x.advisories.find(v=>v.id===aid);
    if(!entry){entry={id:aid,title:String(a.title||'Advisory match'),instances:[],evidence:[e.id]};x.advisories.push(entry);}
    for(const p of x.instances.filter(p=>p.name===name&&p.provenance!=='declared'))if(!entry.instances.includes(p.id))entry.instances.push(p.id);
    if(!entry.instances.length)gaps.push('Advisory could not be mapped to resolved inventory');
   }
   gaps.push('Advisory matches are candidates; verify affected ranges and actual instances before repair');
   cover(dim,e,c.scope||'captured audit scope',gaps);
  }
 }
 const sanitized=redact(x);const errors=validate(sanitized);if(errors.length)throw Error(errors.join('\n'));return sanitized;
}
module.exports={normalize};
if(require.main===module)io.run(()=>{
 if(process.argv.length!==4)throw Error('Usage: node normalize-dependencies.cjs CAPTURE.json NEW-DEPENDENCIES.json');
 io.write(process.argv[3],io.serialize(normalize(io.read(process.argv[2]))));
});
