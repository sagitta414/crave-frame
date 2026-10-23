import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../tv');
export const policy=JSON.parse(readFileSync(new URL('./tv-security-patches.json',import.meta.url),'utf8'));
const hash=s=>createHash('sha256').update(s).digest('hex');
const read=p=>readFileSync(p,'utf8').replace(/\r\n/g,'\n');
export function verifyPatches(apply=false){
  const lock=JSON.parse(readFileSync(resolve(root,'package-lock.json'),'utf8'));
  for(const [name,version] of Object.entries(policy.versions)){
    const paths=Object.keys(lock.packages).filter(p=>p.endsWith('node_modules/'+name));
    if(!paths.length)throw Error('Missing security dependency: '+name);
    for(const location of paths){
      const base=resolve(root,location);
      if(lock.packages[location].version!==version || JSON.parse(read(resolve(base,'package.json'))).version!==version)throw Error('Review security patch for new version: '+name);
      for(const patch of policy.patches.filter(p=>p.package===name)){
        const path=resolve(base,patch.file),source=read(path),digest=hash(source);
        if(digest===patch.after)continue;
        if(!apply || digest!==patch.before)throw Error('Security patch missing or unexpected source: '+name+'/'+patch.file);
        const updated=source.split(patch.old).join(patch.new);
        if(hash(updated)!==patch.after)throw Error('Patch checksum mismatch');
        writeFileSync(path,updated);
      }
      if(policy.extra.package===name){
        const path=resolve(base,policy.extra.file);
        if(apply && !existsSync(path))writeFileSync(path,policy.extra.content);
        if(!existsSync(path) || hash(read(path))!==policy.extra.after)throw Error('AST guard missing or modified');
      }
    }
  }
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  verifyPatches(!process.argv.includes('--check'));
  console.log('TV security patch hashes verified (temporary mitigations; see docs/TV-SECURITY-PATCHES.md).');
}
