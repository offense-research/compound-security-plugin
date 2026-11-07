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
