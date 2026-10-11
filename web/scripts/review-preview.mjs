// Isolated UI rehearsal: in-memory household, deterministic AI and catalog fixtures.
// Never imported by the production build. Does not read credentials or live data.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {openDb} from '../server/local-db.js';
import worker from '../server/worker.js';
import titles from '../product/title-metadata.json' with {type:'json'};
const DB=openDb(),root=resolve('dist/client'),nativeFetch=globalThis.fetch;
globalThis.fetch=async(input,init)=>{
 const url=String(input instanceof Request?input.url:input);
 if(!url.startsWith('https://api.themoviedb.org/3/'))return nativeFetch(input,init);
 const u=new URL(url),title=titles.find(t=>u.pathname.includes('/movie/'+t.provider.id));
 if(u.pathname.endsWith('/watch/providers'))return Response.json({results:{US:{flatrate:[]}}});
 if(u.pathname.includes('/search/'))return Response.json({results:titles.filter(t=>t.name.toLowerCase().includes((u.searchParams.get('query')||'').toLowerCase())).map(t=>({id:t.provider.id,title:t.name,media_type:'movie',release_date:t.releaseYear+'-01-01',runtime:t.minutes,overview:t.description,poster_path:t.posterPath}))});
 if(title)return Response.json({id:title.provider.id,title:title.name,runtime:title.minutes,overview:title.description,poster_path:title.posterPath,backdrop_path:title.backdropPath,release_date:title.releaseYear+'-01-01',genres:[]});
 return Response.json({results:[]});
};
const AI_GENERATE=async(_,input)=>{
 if(!input.allowedPairs)return {reviews:[]};
 const ordered=[...input.allowedPairs].sort((a,b)=>Number(b.includes('2062'))-Number(a.includes('2062'))),usedMeals=new Set(),usedShows=new Set(),picks=[];
 const fixed=new Set(ordered.map(id=>id.split('|')[1])).size===1,mealFixed=new Set(ordered.map(id=>id.split('|')[0])).size===1;
 for(const id of ordered){const [meal,show]=id.split('|');if((!mealFixed&&usedMeals.has(meal))||(!fixed&&usedShows.has(show)))continue;usedMeals.add(meal);usedShows.add(show);picks.push({id,pairingType:'practical'});if(picks.length===3)break;}
 return {picks};
};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const ASSETS={async fetch(req){try{let p=decodeURIComponent(new URL(req.url).pathname);if(p.endsWith('/'))p+='index.html';const file=resolve(root,'.'+p);if(!file.startsWith(root+sep))return new Response('Forbidden',{status:403});let content=await readFile(file);if(p.endsWith("index.html"))content=content.toString().replace("<head>","<head><script>Object.defineProperty(navigator,\"userAgent\",{value:\"Mozilla/5.0 Silk/130.2 AFTMM\"});</script>");return new Response(content,{headers:{'content-type':mime[extname(file)]||'application/octet-stream'}});}catch{return new Response('Not found',{status:404});}}};
const port=Number(process.env.REVIEW_PORT||4197);
const server=createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const r=await worker.fetch(new Request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})}),{DB,ASSETS,AI_GENERATE,TMDB_ACCESS_TOKEN:'review-fixture'});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}catch(e){res.writeHead(500);res.end(e.message);}});
server.listen(port,'127.0.0.1',()=>console.log(`Isolated review preview: http://127.0.0.1:${port}/tv/ (mock providers)`));
process.on('SIGINT',()=>server.close(()=>{DB.close();process.exit(0);}));
