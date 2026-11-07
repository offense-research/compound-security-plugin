'use strict';
const {createHash}=require('node:crypto');
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const digest=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const isSourceRevision=x=>typeof x==='string'&&/^sha256:[a-f0-9]{64}$/.test(x);
function sourceRevision(identity){
 if(!object(identity)||!['commit','dirty_digest','manifests','lockfiles','installed'].every(k=>Object.hasOwn(identity,k)))throw Error('Composite source identity requires commit, dirty_digest, manifests, lockfiles and installed');
 if(identity.commit!==null&&(typeof identity.commit!=='string'||!identity.commit.trim()))throw Error('Invalid commit identity');
 if(!digest(identity.dirty_digest))throw Error('Dirty-source digest required');
 const sortedDigests=(value,label)=>{
  if(!object(value)||!Object.entries(value).every(([path,hash])=>path.length>0&&digest(hash)))throw Error(`Invalid ${label} digest map`);
  return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0));
 };
 const canonical={commit:identity.commit,dirty_digest:identity.dirty_digest,manifests:sortedDigests(identity.manifests,'manifest'),lockfiles:sortedDigests(identity.lockfiles,'lockfile'),installed:identity.installed===null?null:sortedDigests(identity.installed,'installed-state')};
 if(!Object.keys(canonical.manifests).length)throw Error('At least one manifest digest required');
 return 'sha256:'+createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}
module.exports={sourceRevision,isSourceRevision};
