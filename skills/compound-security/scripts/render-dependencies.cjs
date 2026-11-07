#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {validate,dimensions}=require('./validate-dependencies.cjs');
const io=require('./dependency-io.cjs');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md=s=>escape(s).replace(/[\\`*_[\]()#!|]/g,'\\$&').replace(/[\r\n]/g,' ');
function render(x,options={}){
 const errors=validate(x);if(errors.length)throw Error(errors.join('\n'));
 const share=options.share===true,include=new Set(options.includeNames||[]);
 const byId=new Map(x.instances.map(p=>[p.id,p]));
 const ordinal=new Map(x.instances.map((p,i)=>[p.id,i+1]));
 const name=p=>share&&!include.has(p.name)?`Package ${ordinal.get(p.id)}`:p.name;
 const counts=`${x.instances.length} package instances · ${x.advisories.length} advisory identities · ${x.actions.length} proposed actions`;
 const capturedAt=share?new Date(x.generated_at).toISOString():x.generated_at;
 const label=options.label||(share?'Shared dependency summary':'Dependency inspection');
 const html=[`<header><p class="eyebrow">Compound Security · ${share?'Sharing projection':'Private local report'}</p><h1>${escape(label)}</h1><p class="muted">Captured ${escape(capturedAt)}. ${share?'Review before sharing.':'Contains private repository facts; generate a sharing projection before forwarding.'}</p><p class="counts">${escape(counts)}</p></header>`];
 const markdown=[`# ${md(label)}`,`Captured ${md(capturedAt)}. ${share?'Sharing projection; review before sharing.':'Private local report.'}`,counts];
 const section=(title,rows)=>{html.push(`<section><h2>${escape(title)}</h2>${rows.map(r=>`<article>${escape(r)}</article>`).join('')}</section>`);markdown.push(`## ${md(title)}`,...rows.map(r=>`- ${md(r)}`));};
 const actions=[...x.actions].sort((a,b)=>a.order-b.order);
 html.push('<section><h2>Recommended next actions</h2>');markdown.push('## Recommended next actions');
 if(!actions.length){const message='No assessed action yet. Resolve the coverage gaps or add an evidence-backed assessment; this does not mean the repository is secure.';html.push(`<p>${message}</p>`);markdown.push(message);}
 for(const a of actions){
  const title=share?`${a.category||'investigate'}: Dependency action ${a.order}`:a.title;
  const body=share?`${a.instances.length} affected instances; ${a.advisories.length} advisory identities. Proposed, not repaired. ${a.prerequisites.length} prerequisite actions. Verification pending.`:`${a.rationale} Uncertainty: ${a.uncertainty}. Evidence: ${a.evidence.join(', ')}. Advisory references: ${a.advisories.join(', ')||'none'}. Prerequisites: ${a.prerequisites.join(', ')||'none recorded'}.`;
  html.push(`<article><h3>${a.order}. ${escape(title)}</h3><p>${escape(body)}</p><ul>${a.instances.map(key=>{const p=byId.get(key);return `<li>${escape(name(p))}${share?'':` @ ${escape(p.version)}`}</li>`;}).join('')}</ul></article>`);
  markdown.push(`### ${a.order}. ${md(title)}`,md(body),...a.instances.map(key=>`- ${md(name(byId.get(key)))}`));
 }
 html.push('</section>');
 section('Coverage and gaps',dimensions.map(d=>[d,x.coverage[d]]).map(([d,c])=>share?`${d}: ${c.status} within the owner's stated capture scope (scope withheld). ${c.gaps.length} recorded gaps; ask the technical owner for details.`:`${d}: ${c.status}. Scope: ${c.scope}. ${c.gaps.join('; ')||'No recorded gaps.'}`));
 if(!share){
  section('Advisory observations',x.advisories.map(a=>`${a.id}: ${a.title||'Untitled advisory'}. Candidate match; verify affected ranges. Instances: ${a.instances.map(id=>{const p=byId.get(id);return `${p.name} @ ${p.version} (${p.workspace}, ${p.location})`;}).join('; ')||'unmapped'}. Evidence: ${a.evidence.join(', ')}.`));
  html.push('<section><h2>Dependency paths and inventory</h2><p>Expand an instance to inspect its parent paths. Use your browser’s Find command to locate a package. Declared ranges and resolved instances are separate observations.</p>');markdown.push('## Dependency paths and inventory');
  const parentsByChild=new Map();
  for(const edge of x.edges){
   if(!parentsByChild.has(edge.to))parentsByChild.set(edge.to,[]);
   parentsByChild.get(edge.to).push(byId.get(edge.from));
  }
  for(const p of x.instances){
   const parents=parentsByChild.get(p.id)||[];
   const title=`${p.name} @ ${p.version} — ${p.workspace} (${p.provenance})`;
   const ancestry=parents.length?parents.map(n=>`${n.name} @ ${n.version} → ${p.name}`).join('; '):'No parent recorded in this capture';
   const detail=`${ancestry}. Location: ${p.location}.${p.resolution_context?` Resolution context: ${p.resolution_context}.`:''} Evidence: ${p.evidence.join(', ')}.${p.usage?` Usage: ${p.usage.observation}. Intent: ${p.usage.intent}. Usage evidence: ${p.usage.evidence.join(', ')}.`:' Usage and historical intent: unknown.'}${p.outdated?` Wanted: ${p.outdated.wanted||'unknown'}; latest tag: ${p.outdated.latest||'unknown'}.`:''}`;
   html.push(`<details><summary>${escape(title)}</summary><p>${escape(detail)}</p></details>`);markdown.push(`- ${md(title)}: ${md(detail)}`);
  }
  html.push('</section>');
  section('Lessons used',x.lessons.map(l=>`${l.label}: ${l.status}`));
 }
 const patches=Array.isArray(x.patches)?x.patches:[];
 section('Repair evidence',patches.map((p,i)=>{
  const current=p.source_revision===x.source_revision;
  const status=key=>['pending','advisory_resolved','exploit_verified','passed','failed','not_deployed','staging_verified','deployed','observed','rolled_back'].includes(p[key]?.status)?p[key].status:'pending';
  return `Patch ${i+1}: ${current?'recorded for this source':'historical; refresh required'}. Security: ${status('security')}; compatibility: ${status('compatibility')}; deployment: ${status('deployment')}.`;
 }));
 const footer='Advisory matches are not confirmed exploits. Proposed actions are not verified fixes. This report cannot authorize repair or establish production health.';
 html.push(`<footer>${footer}</footer>`);markdown.push(footer);
 return {html:fs.readFileSync(path.join(__dirname,'../assets/dependencies-report.html'),'utf8').replace('{{CONTENT}}',()=>html.join('\n')),markdown:markdown.join('\n\n')+'\n'};
}
module.exports={render};
if(require.main===module)io.run(()=>{
 const [input,output,...args]=process.argv.slice(2);
 if(!input||!output||args.some(a=>a!=='--share'&&!a.startsWith('--label=')&&!a.startsWith('--include-name=')))throw Error('Usage: node render-dependencies.cjs INPUT NEW-OUTPUT-PREFIX [--share] [--label=LABEL] [--include-name=NAME]');
 const result=render(io.read(input),{share:args.includes('--share'),label:args.find(a=>a.startsWith('--label='))?.slice(8),includeNames:args.filter(a=>a.startsWith('--include-name=')).map(a=>a.slice(15))});
 io.write(output+'.html',result.html);io.write(output+'.md',result.markdown);
});
