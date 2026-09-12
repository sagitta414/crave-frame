import {spawnSync} from 'node:child_process';
import {cpSync,mkdirSync,rmSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function run(dir,args){const win=process.platform==='win32';const result=spawnSync(win?'cmd.exe':'npm',win?['/d','/s','/c','npm',...args]:args,{cwd:resolve(root,dir),stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);}
switch(process.argv[2]){
 case 'setup':run('web',['ci']);run('tv',['ci']);break;
 case 'test':run('web',['test']);run('tv',['exec','--','tsc','--noEmit']);{const checked=spawnSync(process.execPath,['scripts/review-regressions.cjs'],{cwd:resolve(root,'tv'),stdio:'inherit'});if(checked.error)throw checked.error;if(checked.status!==0)process.exit(checked.status||1);}break;
 case 'build':{
 run('tv',['exec','--','expo','export','--platform','web','--output-dir','web-export']);
 const target=resolve(root,'web/product/tv');if(!target.startsWith(root+pathSeparator()))throw Error('Build output outside repository');
 rmSync(target,{recursive:true,force:true});mkdirSync(target,{recursive:true});cpSync(resolve(root,'tv/web-export'),target,{recursive:true});run('web',['run','build']);break;
 }
 default:throw Error('Use setup, test, or build');
}
function pathSeparator(){return process.platform==='win32'?'\\':'/';}
