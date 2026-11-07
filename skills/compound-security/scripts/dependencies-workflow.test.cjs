'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {handoff,projectPatch}=require('./dependencies-workflow.cjs');
const fresh=()=>structuredClone(require('../assets/dependencies.example.json'));
test('handoff preserves scope and uses registered host identity',()=>{const x=handoff(fresh(),'sha256:1111111111111111111111111111111111111111111111111111111111111111','inspect-parser','codex-plugin');assert.equal(x.command,'$compound-security:cs-patch');assert.equal(x.context.source_revision,'sha256:1111111111111111111111111111111111111111111111111111111111111111');assert.equal(x.context.target,'example-parser');});
test('stale source and unknown host reject continuation',()=>{assert.throws(()=>handoff(fresh(),'changed','inspect-parser','codex-plugin'));assert.throws(()=>handoff(fresh(),'sha256:1111111111111111111111111111111111111111111111111111111111111111','inspect-parser','unknown'));});
test('metadata never becomes the command',()=>{const x=fresh();x.actions[0].target='$(touch /tmp/bad)';assert.equal(handoff(x,'sha256:1111111111111111111111111111111111111111111111111111111111111111','inspect-parser','claude-plugin').command,'/compound-security:cs-patch');});
test('patch projection preserves not-deployed status and historical identity',()=>{const p=structuredClone(require('../assets/patch-state.example.json'));const view=projectPatch(p);assert.equal(view.deployment.status,'not_deployed');assert.equal(view.source_revision,p.source_revision);});
test('composite source identity changes when dirty or dependency state changes',()=>{
 const {sourceRevision}=require('./dependency-source.cjs');const h='a'.repeat(64);const identity={commit:'same-commit',dirty_digest:h,manifests:{'package.json':h},lockfiles:{'package-lock.json':h},installed:null};
 const revision=sourceRevision(identity),x=fresh();x.source_revision=revision;for(const e of x.evidence)e.source_revision=revision;
 assert.equal(handoff(x,revision,'inspect-parser','codex-plugin').context.source_revision,revision);
 for(const change of [y=>{y.dirty_digest='b'.repeat(64);},y=>{y.lockfiles['package-lock.json']='b'.repeat(64);},y=>{y.installed={'node_modules/.package-lock.json':h};}]){const changed=structuredClone(identity);change(changed);assert.throws(()=>handoff(x,sourceRevision(changed),'inspect-parser','codex-plugin'),/Source changed/);}
 assert.throws(()=>sourceRevision({commit:'same-commit'}));
});
