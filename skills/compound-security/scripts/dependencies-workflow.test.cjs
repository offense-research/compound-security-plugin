'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {handoff,projectPatch}=require('./dependencies-workflow.cjs');
const fresh=()=>structuredClone(require('../assets/dependencies.example.json'));
test('handoff preserves scope and uses registered host identity',()=>{const x=handoff(fresh(),'synthetic-source','inspect-parser','codex-plugin');assert.equal(x.command,'$compound-security:cs-patch');assert.equal(x.context.source_revision,'synthetic-source');assert.equal(x.context.target,'example-parser');});
test('stale source and unknown host reject continuation',()=>{assert.throws(()=>handoff(fresh(),'changed','inspect-parser','codex-plugin'));assert.throws(()=>handoff(fresh(),'synthetic-source','inspect-parser','unknown'));});
test('metadata never becomes the command',()=>{const x=fresh();x.actions[0].target='$(touch /tmp/bad)';assert.equal(handoff(x,'synthetic-source','inspect-parser','claude-plugin').command,'/compound-security:cs-patch');});
test('patch projection preserves not-deployed status and historical identity',()=>{const p=structuredClone(require('../assets/patch-state.example.json'));const view=projectPatch(p);assert.equal(view.deployment.status,'not_deployed');assert.equal(view.source_revision,p.source_revision);});
