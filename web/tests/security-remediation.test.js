import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker,{api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {aiRequest} from '../server/ai.js';
import {reserveCreation} from '../server/abuse-limits.js';

test('invalid AI input never consumes either allowance or calls the provider',async()=>{
 const DB=openDb();try{
  const env={DB,AI_GENERATE:()=>{throw Error('Must not call provider');}};
  for(const body of [null,{mode:'bad'},{mode:'pantry',image:{}},{mode:'coach',prompt:'Help',nightId:'missing'},{mode:'rescue',prompt:'Help'},{mode:'group',prompt:'Help',group:[]}]){
   await assert.rejects(aiRequest(new Request('https://test/api/ai',{method:'POST',body:JSON.stringify(body)}),env,{nights:[],memory:{}},'home',0),e=>e.status===400);
  }
  assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM ai_usage').first()).n,0);
 }finally{DB.close();}
});
test('HTML assets receive enforcing headers and use the Worker path',async()=>{
 const response=await worker.fetch(new Request('https://test/tv/'),{ASSETS:{fetch:async()=>new Response('<html></html>',{headers:{'content-type':'text/html'}})}});
 assert.match(response.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
 assert.match(response.headers.get('Content-Security-Policy'),/script-src 'self';/);
 assert.equal(response.headers.get('X-Frame-Options'),'DENY');
 assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff');
 assert.equal(response.headers.get('Referrer-Policy'),'no-referrer');
 assert.match(response.headers.get('Strict-Transport-Security'),/max-age=/);
 assert.match(readFileSync('build-app.mjs','utf8'),/run_worker_first:true/);
});
test('new household identities do not bypass edge creation limits',async()=>{
 const DB=openDb(),request=new Request('https://test/api/household',{headers:{'cf-connecting-ip':'192.0.2.5'}}),now=Date.parse('2026-10-10T12:00:00Z');
 try{
  for(let i=0;i<20;i++)await reserveCreation(DB,request,now);
  await assert.rejects(reserveCreation(DB,request,now),e=>e.status===429);
  assert.equal((await DB.prepare('SELECT count FROM ai_usage WHERE id=?').bind('create:2026-10-10:global').first()).count,20);
  await DB.prepare('UPDATE ai_usage SET count=500 WHERE id=?').bind('create:2026-10-10:global').run();
  await assert.rejects(reserveCreation(DB,new Request('https://test',{headers:{'cf-connecting-ip':'192.0.2.6'}}),now),e=>e.status===429);
 }finally{DB.close();}
});
test('owner and editor replacements revoke old photos; orphan keys cannot be read',async()=>{
 const DB=openDb(),files=new Map(),env={DB,MEDIA:{put:async(k,v)=>files.set(k,v),get:async k=>files.has(k)?{body:files.get(k)}:null,delete:async k=>files.delete(k)}};
 const key='a'.repeat(64),id='collection-id',homeKey='b'.repeat(64),digest=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))).map(b=>b.toString(16).padStart(2,'0')).join('');
 const call=async(path,method='GET',body)=>api(new Request('https://test/api/'+path,{method,headers:{'x-household-key':homeKey},...(body?{body:JSON.stringify(body)}:{})}),env);
 try{
  const owner=await digest(homeKey),collectionId=await digest(key);
  await DB.prepare('INSERT INTO households(id,data,revision,updated) VALUES(?,?,0,?)').bind(owner,JSON.stringify({prefs:{},nights:[],memory:{},pantry:[]}),'2026-10-10').run();
  await DB.prepare('INSERT INTO collections(id,household,data) VALUES(?,?,?)').bind(collectionId,owner,JSON.stringify({key,name:'Test',photo:null,editKey:'c'.repeat(64),editExpires:Date.now()+3600000})).run();
  const jpeg='data:image/jpeg;base64,/9j/2Q==';
  const first=await (await call('collections/'+key+'/photo','PUT',{jpeg})).json();
  assert.ok(first.photo);assert.equal((await call('photo/'+first.photo+'?access='+first.photoAccess)).status,200);
  const second=await (await call('collections/'+key+'/photo','PUT',{jpeg})).json();
  assert.ok(second.photo);assert.equal(files.has('photos/'+first.photo),false);assert.equal((await call('photo/'+first.photo)).status,404);
  const third=await (await call('collection-editor/'+key,'PUT',{jpeg,editKey:'c'.repeat(64)})).json();
  assert.equal(files.has('photos/'+second.photo),false);assert.equal((await call('photo/'+third.photo+'?access='+third.photoAccess)).status,200);
  // Simulate a concurrent collection edit: a rejected new upload must be removed.
  env.DB={prepare(sql){const statement=DB.prepare(sql);if(sql.startsWith('UPDATE collections SET'))return {bind(){return {run:async()=>({meta:{changes:0}})};}};return statement;}};
  assert.equal((await call('collections/'+key+'/photo','PUT',{jpeg})).status,409);
  assert.equal(files.size,1);assert.ok(files.has('photos/'+third.photo));env.DB=DB;
  await DB.prepare('UPDATE ai_usage SET count=? WHERE id=?').bind(10*1024*1024,'photo-upload:'+new Date().toISOString().slice(0,10)+':'+owner).run();
  assert.equal((await call('collections/'+key+'/photo','PUT',{jpeg})).status,429);assert.equal(files.size,1);
  await call('collections/'+key,'DELETE');assert.equal(files.size,0);assert.equal((await call('photo/'+third.photo)).status,404);
  files.set('photos/'+key,new Uint8Array([255,216,255]));assert.equal((await call('photo/'+key)).status,404);
 }finally{DB.close();}
});
test('remote genre text is escaped in both selection and preference markup',()=>{
 const source=readFileSync('product/main.js','utf8');
 assert.ok(source.includes('${esc(s.genre)}'));
 assert.ok(source.includes('${esc(food?source.effort:source.genre)}'));
 assert.ok(!source.includes('${food?source.effort:source.genre}'));
});
