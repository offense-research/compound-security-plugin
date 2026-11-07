'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {render}=require('./render-dependencies.cjs');
const fresh=()=>structuredClone(require('../assets/dependencies.example.json'));
test('reports share counters and coverage',()=>{const {html,markdown}=render(fresh());for(const s of ['1 package instances','0 advisory identities','advisories: unavailable','Inspect parser upgrade options']){assert.ok(html.includes(s));assert.ok(markdown.includes(s));}});
test('untrusted markup is inert in both formats',()=>{const x=fresh();x.actions[0].title='<script>alert(1)</script>';const r=render(x);assert.ok(!r.html.includes('<script>'));assert.ok(!r.markdown.includes('<script>'));});
test('sharing excludes arbitrary prose and names by default',()=>{const x=fresh();x.actions[0].rationale='SECRET';x.instances[0].name='private-package';const r=render(x,{share:true,label:'Team'});assert.ok(!JSON.stringify(r).includes('SECRET'));assert.ok(!JSON.stringify(r).includes('private-package'));assert.ok(r.html.includes('Dependency action 1'));});
test('explicitly included name can be shared without raw record',()=>{const x=fresh();const r=render(x,{share:true,includeNames:['example-parser']});assert.ok(r.html.includes('example-parser'));assert.ok(!r.html.includes('synthetic-source'));});
test('invalid records fail before rendering',()=>{const x=fresh();x.edges=[{from:'bad',to:'bad'}];assert.throws(()=>render(x));});
