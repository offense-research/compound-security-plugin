'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const {validate}=require('./validate-dependencies.cjs');
const fresh=()=>structuredClone(require('../assets/dependencies.example.json'));
test('partial snapshot is valid without claiming clean coverage',()=>assert.deepEqual(validate(fresh()),[]));
for(const [name,change] of Object.entries({
 'dangling edge':x=>x.edges.push({from:'missing',to:'missing'}),
 'duplicate instance':x=>x.instances.push({...x.instances[0]}),
 'unavailable evidence cannot be complete':x=>x.coverage.advisories.status='complete',
 'unbound recommendation':x=>{x.actions[0].evidence=['unbound'];},
 'dangling advisory':x=>x.advisories.push({id:'GHSA-test',instances:['missing'],evidence:['manifest']}),
 'unknown lesson state':x=>x.lessons.push({label:'test',status:'trusted'})
})) test(name,()=>{const x=fresh();change(x);assert.ok(validate(x).length);});
test('malformed input returns errors',()=>{for(const x of [null,[],{},1])assert.ok(validate(x).length);});
test('malformed nested fields produce diagnostics rather than throwing',()=>{for(const mutate of [x=>{x.coverage.declarations.gaps=null;},x=>{x.actions[0].prerequisites={};},x=>{x.patches=[null];},x=>{x.instances[0].outdated={evidence:'missing'};}]){const x=structuredClone(require('../assets/dependencies.example.json'));mutate(x);assert.ok(validate(x).length);}});
test('actions reject existing historical, unbound, or failed evidence',()=>{for(const [binding,status] of [['historical','ok'],['unbound','ok'],['current','error']]){const x=fresh();x.evidence.push({id:'old',kind:'assessment',source_revision:x.source_revision,captured_at:x.generated_at,binding,status});x.actions[0].evidence=['old'];assert.ok(validate(x).includes('action needs current evidence'));}});
test('bare commit identity cannot satisfy source freshness contract',()=>{const x=fresh();x.source_revision='abc123';assert.ok(validate(x).some(e=>e.includes('composite sha256')));});
