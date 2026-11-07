#!/usr/bin/env node
'use strict';
const {safeDiagnostic}=require('./validate-closure.cjs');
const {isSourceRevision}=require('./dependency-source.cjs');
const dimensions=['declarations','resolutions','outdated','advisories','usage'];
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string'&&x.trim().length>0;
function validate(x){
 const errors=[]; const check=(v,m)=>{if(!v)errors.push(m);};
 if(!object(x))return ['snapshot must be an object'];
 check(x.schema_version===1,'schema_version must be 1');
 check(isSourceRevision(x.source_revision),'source_revision must be a composite sha256 identity');
 check(text(x.generated_at)&&Number.isFinite(Date.parse(x.generated_at)),'generated_at required');
 const sets={};
 for(const key of ['evidence','instances','advisories','actions']){
  check(Array.isArray(x[key]),`${key} must be an array`);sets[key]=new Map();
  for(const entry of Array.isArray(x[key])?x[key]:[]){
   if(!object(entry)){errors.push(`${key} entry must be an object`);continue;}
   check(text(entry.id)&&!sets[key].has(entry.id),`${key} IDs must be unique`);sets[key].set(entry.id,entry);
  }
 }
 const references=(ids,set,label,nonempty=false)=>{
  check(Array.isArray(ids)&&(!nonempty||ids.length>0)&&ids.every(id=>text(id)&&set.has(id)),`${label} has invalid references`);
 };
 for(const e of sets.evidence.values()){
  check(['current','historical','unbound'].includes(e.binding),'invalid evidence binding');
  check(['ok','error'].includes(e.status),'invalid evidence status');
  check(text(e.kind)&&text(e.captured_at)&&Number.isFinite(Date.parse(e.captured_at)),'evidence kind/date required');
  if(e.binding==='current')check(e.source_revision===x.source_revision,'current evidence revision mismatch');
 }
 const current=ids=>Array.isArray(ids)&&ids.length>0&&ids.every(id=>{const e=sets.evidence.get(id);return e&&e.binding==='current'&&e.status==='ok';});
 for(const dimension of dimensions){
  const c=x.coverage?.[dimension];
  if(!object(c)){errors.push(`${dimension} coverage required`);continue;}
  check(['complete','partial','unavailable'].includes(c.status),`${dimension} invalid coverage`);
  check(text(c.scope)&&Array.isArray(c.gaps)&&c.gaps.every(text),`${dimension} scope/gaps required`);
  references(c.evidence,sets.evidence,dimension);
  if(c.status==='complete')check(current(c.evidence)&&Array.isArray(c.gaps)&&c.gaps.length===0,`${dimension} complete requires current successful evidence without gaps`);
  if(c.status!=='complete')check(Array.isArray(c.gaps)&&c.gaps.length>0,`${dimension} incomplete requires gap`);
 }
 for(const p of sets.instances.values()){
  check(text(p.name)&&text(p.version)&&text(p.workspace)&&text(p.location),'instance identity required');
  check(['declared','lockfile','installed'].includes(p.provenance),'invalid instance provenance');
  references(p.evidence,sets.evidence,'instance evidence',true);
  if(p.outdated!==undefined){
   check(object(p.outdated),'outdated must be an object');
   if(object(p.outdated)){
    check([p.outdated.wanted,p.outdated.latest].every(v=>v===null||text(v)),'invalid outdated versions');
    check(current([p.outdated.evidence]),'outdated needs current evidence');
   }
  }
  if(p.usage!==undefined){
   check(object(p.usage)&&text(p.usage.observation)&&text(p.usage.intent),'usage observation/intent required');
   if(object(p.usage)){references(p.usage.evidence,sets.evidence,'usage evidence',true);check(current(p.usage.evidence),'usage needs current evidence');}
  }
  check(current(p.evidence),'current inventory needs current evidence');
 }
 check(Array.isArray(x.edges),'edges must be an array');
 for(const e of Array.isArray(x.edges)?x.edges:[])check(object(e)&&sets.instances.has(e.from)&&sets.instances.has(e.to),'dangling edge');
 for(const a of sets.advisories.values()){
  references(a.instances,sets.instances,'advisory instances');references(a.evidence,sets.evidence,'advisory evidence',true);
  check(current(a.evidence),'current advisory needs current evidence');
 }
 for(const a of sets.actions.values()){
  if(a.category!==undefined)check(['upgrade','investigate','mitigate','defer'].includes(a.category),'invalid action category');
  check(text(a.title)&&text(a.rationale)&&text(a.uncertainty)&&text(a.target),'action explanation/target required');
  check(Number.isInteger(a.order)&&a.order>0,'action order required');
  references(a.instances,sets.instances,'action instances',true);references(a.advisories,sets.advisories,'action advisories');
  references(a.evidence,sets.evidence,'action evidence',true);check(current(a.evidence),'action needs current evidence');
  references(a.prerequisites,sets.actions,'action prerequisites');
  check(!Array.isArray(a.prerequisites)||!a.prerequisites.includes(a.id),'action cannot require itself');
  for(const id of Array.isArray(a.prerequisites)?a.prerequisites:[])check(sets.actions.get(id)?.order<a.order,'prerequisite must precede action');
 }
 check(Array.isArray(x.lessons),'lessons must be an array');
 for(const l of Array.isArray(x.lessons)?x.lessons:[])check(object(l)&&text(l.label)&&['applied','stale','not_applicable'].includes(l.status),'invalid lesson');
 if(x.patches!==undefined){
  check(Array.isArray(x.patches),'patches must be an array');
  for(const p of Array.isArray(x.patches)?x.patches:[]){
   if(!object(p)){errors.push('invalid patch projection');continue;}
   check(text(p.source_revision),'patch source required');
   for(const [key,states] of Object.entries({security:['pending','advisory_resolved','exploit_verified'],compatibility:['pending','passed','failed'],deployment:['not_deployed','staging_verified','deployed','observed','rolled_back']}))check(object(p[key])&&states.includes(p[key].status),`invalid patch ${key}`);
  }
 }
 return errors;
}
module.exports={validate,dimensions};
if(require.main===module){try{
 if(process.argv.length!==3)throw Error('Usage: node validate-dependencies.cjs DEPENDENCIES.json');
 const errors=validate(require('./dependency-io.cjs').read(process.argv[2]));if(errors.length)throw Error(errors.join('\n'));
 console.log('Dependency record consistent; assertions are not proof of evidence truth.');
}catch(e){console.error(safeDiagnostic(e.message));process.exitCode=1;}}
