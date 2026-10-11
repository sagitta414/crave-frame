import {build} from 'esbuild';
import {mkdirSync,cpSync,readFileSync,writeFileSync,existsSync,rmSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
for(const directory of ['out','dist']){const path=resolve(directory);if(dirname(path)!==process.cwd())throw Error('Build directory must be inside this project');rmSync(path,{recursive:true,force:true});}
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/client/app',{recursive:true});
cpSync('product/home.html','dist/client/index.html');
for(const file of ['index.html','style.css','ai.css','icon.svg','connect-tmdb.html','connect-tmdb.js','companion.html','companion.css','companion.js'])cpSync('product/'+file,'dist/client/app/'+file);
cpSync('product/images','dist/client/app/images',{recursive:true});
cpSync('product/tv','dist/client/tv',{recursive:true});
await build({entryPoints:[resolve('product/main.js')],bundle:true,format:'esm',target:'es2020',outfile:'dist/client/app/main.js',minify:true});
// Sites may serve asset HTML ahead of the Worker, independently of Wrangler routing.
// Keep documents in the Worker so their security headers cannot be bypassed.
const documentPages={};
for(const [url,file] of Object.entries({'/':'index.html','/app/':'app/index.html','/tv/':'tv/index.html','/app/companion.html':'app/companion.html','/app/connect-tmdb.html':'app/connect-tmdb.html'})){
 documentPages[url]=readFileSync('dist/client/'+file,'utf8');
 documentPages['/'+file]=documentPages[url];
 rmSync('dist/client/'+file);
}
await build({define:{__DOCUMENT_PAGES__:JSON.stringify(documentPages)},entryPoints:[resolve('server/worker.js')],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'dist/server/index.js',minify:true});
mkdirSync('dist/.openai',{recursive:true});cpSync('.openai/hosting.json','dist/.openai/hosting.json');cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
writeFileSync('dist/server/wrangler.json',JSON.stringify({name:'screen-to-supper',main:'index.js',compatibility_date:'2026-09-01',assets:{directory:'../client',binding:'ASSETS',run_worker_first:true},r2_buckets:[{binding:'MEDIA',bucket_name:'crave-frame-media'}],d1_databases:[{binding:'DB',database_name:'screen-to-supper',database_id:'local',migrations_dir:'../../drizzle'}]},null,2));
const html=documentPages['/app/'];if(!html.includes('main.js'))throw Error('Missing app entry point');
for(const name of ['toast','pasta','pizza','manor','coast','lake'])if(!existsSync('dist/client/app/images/'+name+'.png'))throw Error('Missing '+name+' artwork');
console.log('Built Supper & Scene at the main URL and /app/, with assets, API and database migrations.');
