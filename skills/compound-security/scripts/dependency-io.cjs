'use strict';
const fs=require('node:fs'),path=require('node:path');
const {readJsonSnapshot,safeDiagnostic}=require('./validate-closure.cjs');
function checkedPath(file){
 const full=path.resolve(file);let current=path.parse(full).root;
 for(const part of full.slice(current.length).split(path.sep)){
  if(part==='.git')throw Error('Git internal paths are forbidden');
  current=path.join(current,part);
  try{if(fs.lstatSync(current).isSymbolicLink())throw Error('Symlink paths are forbidden');}catch(e){if(e.code!=='ENOENT')throw e;}
 }
 return full;
}
function read(file){return readJsonSnapshot(checkedPath(file));}
function write(file,data){
 const full=checkedPath(file),parent=path.dirname(full),stat=fs.statSync(parent);
 if(typeof process.getuid==='function'&&stat.uid!==process.getuid())throw Error('Output parent must be owned by current user');
 if(stat.mode&0o022)throw Error('Output parent must not be writable by other users');
 fs.writeFileSync(full,data,{flag:'wx',mode:0o600});
}
function run(fn){try{fn();}catch(e){console.error(safeDiagnostic(e.message));process.exitCode=1;}}
module.exports={read,write,run};
