import {build} from 'esbuild';
import {mkdirSync,cpSync,readFileSync,writeFileSync,existsSync,rmSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=resolve('.release');
if(!existsSync('../web/dist/client/app/main.js')||!existsSync('../tv/web-export/index.html'))throw Error('Run npm run build from the repository root first');
let version=process.env.CRAVE_RELEASE_VERSION;
if(!version){const sha=execFileSync('git',['rev-parse','--short=12','HEAD'],{encoding:'utf8'}).trim();version=sha+'-'+new Date().toISOString().replace(/[^0-9]/g,'').slice(0,14);}
if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(version))throw Error('Invalid release version');
// Only remove the explicitly resolved generated build directories inside .release.
for(const name of ['static','lambda']){const path=join(root,name);if(!path.startsWith(root))throw Error('Invalid output');rmSync(path,{recursive:true,force:true});mkdirSync(path,{recursive:true});}
cpSync('../web/dist/client',join(root,'static'),{recursive:true});
for(const [from,to]of [['../web/product/index.html','index.html'],['../web/product/index.html','app/index.html'],['../tv/web-export/index.html','tv/index.html'],['../web/product/companion.html','app/companion.html'],['../web/product/connect-tmdb.html','app/connect-tmdb.html']])cpSync(from,join(root,'static',to));
writeFileSync(join(root,'static/version.json'),JSON.stringify({version}));
writeFileSync(join(root,'static/404.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><title>Crave Frame</title><h1>That page is unavailable</h1><a href="/">Plan an evening</a></html>');
for(const name of ['handler','migrator'])await build({entryPoints:['runtime/'+name+'.mjs'],outfile:join(root,'lambda',name+'.cjs'),platform:'node',target:'node22',format:'cjs',bundle:true,external:['pg-native'],sourcemap:false});
cpSync('migrations',join(root,'lambda/migrations'),{recursive:true});
const ca=await fetch('https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem');if(!ca.ok)throw Error('Cannot fetch AWS RDS CA bundle');const pem=await ca.text();if(!pem.includes('BEGIN CERTIFICATE')||pem.includes('PRIVATE KEY'))throw Error('Invalid CA bundle');writeFileSync(join(root,'lambda/global-bundle.pem'),pem);
writeFileSync(join(root,'version.json'),JSON.stringify({version}));console.log(JSON.stringify({event:'aws_build',version,staticReady:true,runtimeReady:true}));
