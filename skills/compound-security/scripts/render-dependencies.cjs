#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {validate}=require('./validate-dependencies.cjs');
const io=require('./dependency-io.cjs');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md=s=>escape(s).replace(/[\\`*_[\]()#!|]/g,'\\$&').replace(/[\r\n]/g,' ');
function render(x,options={}){
 const errors=validate(x);if(errors.length)throw Error(errors.join('\n'));
 const share=options.share===true,include=new Set(options.includeNames||[]);
 const name=p=>share&&!include.has(p.name)?`Package ${x.instances.indexOf(p)+1}`:p.name;
 const counts=`${x.instances.length} package instances · ${x.advisories.length} advisory identities · ${x.actions.length} proposed actions`;
 const label=options.label||(share?'Shared dependency summary':'Dependency inspection');
 const html=[`<header><p class="eyebrow">Compound Security · ${share?'Sharing projection':'Private local report'}</p><h1>${escape(label)}</h1><p class="muted">Captured ${escape(x.generated_at)}. ${share?'Review before sharing.':'Contains private repository facts; generate a sharing projection before forwarding.'}</p><p class="counts">${escape(counts)}</p></header>`];
 const markdown=[`# ${md(label)}`,`Captured ${md(x.generated_at)}. ${share?'Sharing projection; review before sharing.':'Private local report.'}`,counts];
 const section=(title,rows)=>{html.push(`<section><h2>${escape(title)}</h2>${rows.map(r=>`<article>${escape(r)}</article>`).join('')}</section>`);markdown.push(`## ${md(title)}`,...rows.map(r=>`- ${md(r)}`));};
 const actions=[...x.actions].sort((a,b)=>a.order-b.order);
 html.push('<section><h2>Recommended next actions</h2>');markdown.push('## Recommended next actions');
 if(!actions.length){const message='No assessed action yet. Resolve the coverage gaps or add an evidence-backed assessment; this does not mean the repository is secure.';html.push(`<p>${message}</p>`);markdown.push(message);}
 for(const a of actions){
  const title=share?`Dependency action ${a.order}`:a.title;
  const body=share?`${a.instances.length} affected instances; ${a.advisories.length} advisory identities. Proposed, not repaired. ${a.prerequisites.length} prerequisite actions. Verification pending.`:`${a.rationale} Uncertainty: ${a.uncertainty}. Evidence: ${a.evidence.join(', ')}. Prerequisites: ${a.prerequisites.join(', ')||'none recorded'}.`;
  html.push(`<article><h3>${a.order}. ${escape(title)}</h3><p>${escape(body)}</p><ul>${a.instances.map(key=>{const p=x.instances.find(p=>p.id===key);return `<li>${escape(name(p))}${share?'':` @ ${escape(p.version)}`}</li>`;}).join('')}</ul></article>`);
  markdown.push(`### ${a.order}. ${md(title)}`,md(body),...a.instances.map(key=>`- ${md(name(x.instances.find(p=>p.id===key)))}`));
 }
 html.push('</section>');
 section('Coverage and gaps',Object.entries(x.coverage).map(([d,c])=>share?`${d}: ${c.status}. ${c.gaps.length} recorded gaps; ask the technical owner for details.`:`${d}: ${c.status}. Scope: ${c.scope}. ${c.gaps.join('; ')||'No recorded gaps.'}`));
 if(!share){
  html.push('<section><h2>Dependency paths and inventory</h2><p>Expand an instance to inspect its parent paths. Use your browser’s Find command to locate a package. Declared ranges and resolved instances are separate observations.</p>');markdown.push('## Dependency paths and inventory');
  const byId=new Map(x.instances.map(p=>[p.id,p]));
  for(const p of x.instances){
   const parents=x.edges.filter(e=>e.to===p.id).map(e=>byId.get(e.from));
   const title=`${p.name} @ ${p.version} — ${p.workspace} (${p.provenance})`;
   const ancestry=parents.length?parents.map(n=>`${n.name} @ ${n.version} → ${p.name}`).join('; '):'No parent recorded in this capture';
   const detail=`${ancestry}. Location: ${p.location}. Evidence: ${p.evidence.join(', ')}.${p.outdated?` Wanted: ${p.outdated.wanted||'unknown'}; latest tag: ${p.outdated.latest||'unknown'}.`:''}`;
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
