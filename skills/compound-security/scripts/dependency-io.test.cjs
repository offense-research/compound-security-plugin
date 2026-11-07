'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const io=require('./dependency-io.cjs');
function dir(t){const p=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'dependency-io-')));fs.chmodSync(p,0o700);t.after(()=>fs.rmSync(p,{recursive:true,force:true}));return p;}
test('private outputs refuse overwrites and remain private',t=>{const p=path.join(dir(t),'out.json');io.write(p,'{}');assert.equal(fs.statSync(p).mode&0o777,0o600);assert.throws(()=>io.write(p,'changed'));assert.deepEqual(io.read(p),{});});
test('symlink and Git internal destinations are refused',t=>{const d=dir(t);fs.symlinkSync(d,path.join(d,'link'));assert.throws(()=>io.write(path.join(d,'link','out'),'x'),/Symlink/);assert.throws(()=>io.write(path.join(d,'.git','out'),'x'),/Git internal/);});
test('shared writable destinations and malformed inputs are refused',t=>{const d=dir(t);fs.writeFileSync(path.join(d,'bad'),'{');assert.throws(()=>io.read(path.join(d,'bad')));fs.chmodSync(d,0o777);assert.throws(()=>io.write(path.join(d,'out'),'x'),/writable/);fs.chmodSync(d,0o700);});
test('normalizer does not spawn processes or access network',()=>{
 const modules=[require('node:child_process'),require('node:http'),require('node:https'),require('node:net')];const originals=[];
 for(const mod of modules)for(const name of ['spawn','spawnSync','exec','execSync','execFile','execFileSync','fork','request','get','connect','createConnection'])if(typeof mod[name]==='function'){originals.push([mod,name,mod[name]]);mod[name]=()=>{throw Error('Unexpected process/network operation');};}
 const fetch=globalThis.fetch;globalThis.fetch=()=>{throw Error('Unexpected fetch');};
 try{const {normalize}=require('./normalize-dependencies.cjs');const x=normalize({source_revision:'synthetic',generated_at:'2026-11-06T00:00:00Z',manifests:[{workspace:'.',data:{dependencies:{foo:'1'}}}],captures:[]});assert.equal(x.instances.length,1);}finally{for(const [mod,name,fn] of originals)mod[name]=fn;globalThis.fetch=fetch;}
});
