import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
import {PGlite} from '@electric-sql/pglite';
import {databaseAdapter,postgresSql} from '../runtime/postgres.mjs';
import {gatewayRequest,gatewayResponse} from '../runtime/request.mjs';
import {mediaAdapter} from '../runtime/media.mjs';
import {applyMigrations} from '../runtime/migrations.mjs';
import {api} from '../../web/server/worker.js';
import {reserveCreation} from '../../web/server/abuse-limits.js';
import {defaults,mealById} from '../../web/product/catalog.js';
import {ingredients} from '../../web/product/engine.js';
const migration={version:'001_initial.sql',sql:readFileSync('migrations/001_initial.sql','utf8')};
async function open(){const pg=new PGlite();const client={async query(sql,args){const r=args?await pg.query(sql,args):((await pg.exec(sql)).at(-1)||{rows:[],affectedRows:0});return {...r,rowCount:r.affectedRows||r.rows.length};}};await pg.exec(migration.sql);return {pg,client,DB:databaseAdapter(client)};}
test('SQL adapter keeps placeholders in literals and adapts SQLite-only clauses',()=>{
 assert.equal(postgresSql("SELECT '?' AS value WHERE id=?"),"SELECT '?' AS value WHERE id=$1");
 assert.equal(postgresSql('INSERT OR IGNORE INTO integrations(id) VALUES (?)'),'INSERT INTO integrations(id) VALUES ($1) ON CONFLICT DO NOTHING');
 assert.match(postgresSql("SELECT id FROM collections WHERE json_extract(data,'$.photo')=?"),/data::jsonb/);
});
test('CloudFront overwrites spoofed identity; direct gateway and spoofed headers fail closed',async()=>{
 const scope={};vm.runInNewContext(readFileSync('infrastructure/edge.js','utf8'),scope);
 const request={uri:'/api/household',headers:{host:{value:'test.cloudfront.net'},'x-crave-viewer-ip':{value:'attacker'},'x-crave-origin':{value:'attacker'},'cf-connecting-ip':{value:'attacker'}}};
 const transformed=scope.handler({request,viewer:{ip:'192.0.2.7'}});
 assert.equal(transformed.headers['x-crave-viewer-ip'].value,'192.0.2.7');assert.ok(!transformed.headers['x-crave-origin']);
 const event={version:'2.0',rawPath:'/api/household',requestContext:{http:{method:'POST',sourceIp:'192.0.2.99'}},headers:Object.fromEntries(Object.entries(transformed.headers).map(([k,v])=>[k,v.value]))};
 assert.throws(()=>gatewayRequest(event,'secret'),e=>e.status===403);
 event.headers['x-crave-origin']='secret';const adapted=gatewayRequest(event,'secret');assert.equal(adapted.ip,'192.0.2.7');assert.equal(adapted.request.url,'https://test.cloudfront.net/api/household');assert.equal(adapted.request.headers.get('cf-connecting-ip'),null);
 const response=await gatewayResponse(Response.json({error:'No'},{status:403}));assert.equal(response.statusCode,403);assert.equal(response.headers['x-frame-options'],'DENY');assert.equal(response.headers['cache-control'],'no-store');
});
test('PostgreSQL persistence, concurrency, household isolation, private sharing and photo cleanup',async()=>{
 const {pg,client,DB}=await open();const objects=new Map(),env={DB,AI_PROVIDER:'catalog',TRUSTED_CLIENT_IP:'192.0.2.1',MEDIA:{put:async(k,v)=>objects.set(k,v),get:async k=>objects.has(k)?{body:objects.get(k)}:null,delete:async k=>objects.delete(k)}};
 const call=async(path,method='GET',body,key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:key?{'x-household-key':key}:{},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,data:r.headers.get('content-type')?.includes('json')?await r.json():null};};
 try{
  const h=(await call('household','POST')).data;env.TRUSTED_CLIENT_IP='192.0.2.2';const other=(await call('household','POST')).data;
  const counters=await client.query("SELECT id FROM ai_usage WHERE id LIKE 'create:%' AND id NOT LIKE '%:global'");assert.equal(counters.rows.length,2);
  const meal=mealById('tomato-pasta'),body={mealId:meal.id,showId:'paddington',prefs:{...defaults,cookTime:30,watchTime:180},adapted:false,confirmed:ingredients(meal,2,false).map(i=>i.name)};
  const saved=await call('nights','POST',body,h.key);assert.equal(saved.status,201);const id=saved.data.id;
  assert.equal((await call('nights/'+id,'GET',null,other.key)).status,404);
  const share=await call('nights/'+id+'/share','POST',{},h.key);assert.equal(share.status,200);
  assert.equal((await call('shared/'+share.data.key+'/connect','POST',{})).status,200);
  assert.equal((await call('shared/'+share.data.key,'PATCH',{step:1})).status,200);
  assert.equal((await call('nights/'+id,'GET',null,h.key)).data.step,1);
  const handoff=await call('companion','POST',{kind:'shopping',nightId:id},h.key);assert.equal(handoff.status,200);assert.equal((await call('companion-link/'+handoff.data.key)).data.kind,'shopping');
  const row=(await client.query('SELECT id,revision FROM households ORDER BY id')).rows[0];
  const update=()=>DB.prepare('UPDATE households SET revision=revision+1 WHERE id=? AND revision=?').bind(row.id,row.revision).run();
  assert.equal((await update()).meta.changes,1);assert.equal((await update()).meta.changes,0);
  const memoryBody={nightId:id,requestId:'postgres_memory_request_123'};const collection=await call('collections','POST',memoryBody,h.key);assert.equal(collection.status,201);
  assert.equal((await call('collections','POST',memoryBody,h.key)).data.key,collection.data.key);assert.equal((await call('collections','POST',{nightId:id},h.key)).data.key,collection.data.key);
  const ck=collection.data.key,jpeg='data:image/jpeg;base64,/9j/2Q==';
  const first=await call('collections/'+ck+'/photo','PUT',{jpeg},h.key);assert.equal(first.status,200);
  const second=await call('collections/'+ck+'/photo','PUT',{jpeg},h.key);assert.equal(second.status,200);
  assert.equal(objects.has('photos/'+first.data.photo),false);assert.equal((await call('photo/'+first.data.photo)).status,404);
  assert.equal((await call('photo/'+second.data.photo+'?access='+second.data.photoAccess)).status,200);
  await call('collections/'+ck,'DELETE',null,h.key);assert.equal(objects.size,0);assert.equal((await call('collections','POST',memoryBody,h.key)).status,409);assert.equal((await call('collections','GET',null,h.key)).data.collections.length,0);const fresh=await call('collections','POST',{...memoryBody,requestId:'postgres_fresh_request_123'},h.key);assert.equal(fresh.status,201);assert.notEqual(fresh.data.key,ck);await call('collections/'+fresh.data.key,'PUT',{name:'New card',notes:'',shared:true},h.key);assert.equal((await call('collection-share/'+ck)).status,404);
  await call('nights/'+id+'/share','DELETE',null,h.key);assert.equal((await call('shared/'+share.data.key)).status,404);
  const reopened=databaseAdapter(client);assert.ok(await reopened.prepare('SELECT data FROM households WHERE id=?').bind(row.id).first());
 }finally{await pg.close();}
});
test('trusted client context yields distinct rate identities despite forged forwarding headers',async()=>{
 const {pg,DB}=await open();try{const req=new Request('https://test',{headers:{'cf-connecting-ip':'forged','x-forwarded-for':'forged'}});
 for(let i=0;i<20;i++)await reserveCreation(DB,req,Date.now(),'192.0.2.1');
 await assert.rejects(reserveCreation(DB,req,Date.now(),'192.0.2.1'),e=>e.status===429);
 await reserveCreation(DB,req,Date.now(),'192.0.2.2');
 }finally{await pg.close();}
});
test('media adapter only operates private photo keys, never public URLs',async()=>{
 const commands=[],store=mediaAdapter({send:async c=>{commands.push(c);return {Body:{transformToByteArray:async()=>new Uint8Array([1])}};}},'private');const key='photos/'+'a'.repeat(64);
 await store.put(key,new Uint8Array([1]));assert.equal(commands[0].input.ACL,undefined);assert.equal(commands[0].input.CacheControl,'no-store');await store.get(key);await store.delete(key);assert.equal(commands.length,3);assert.throws(()=>store.delete('../secret'));
});
test('migration ledger stages changes, detects checksum drift, and rolls back failing DDL',async()=>{
 const pg=new PGlite();const client={async query(sql,args){if(sql.includes('pg_advisory_'))return {rows:[]};return args?pg.query(sql,args):(await pg.exec(sql)).at(-1);}};
 try{
  assert.deepEqual((await applyMigrations(client,[migration])).pending,[migration.version]);
  await applyMigrations(client,[migration],{apply:true,target:migration.version});
  assert.deepEqual((await applyMigrations(client,[migration])).pending,[]);
  await assert.rejects(applyMigrations(client,[{...migration,sql:migration.sql+'\n-- changed'}]),/history/);
  await assert.rejects(applyMigrations(client,[migration,{version:'002_bad.sql',sql:'CREATE TABLE temporary_table(id text); SELECT missing_column;'}],{apply:true}));
  assert.equal((await pg.query("SELECT to_regclass('temporary_table') AS name")).rows[0].name,null);
  assert.equal((await pg.query('SELECT * FROM schema_migrations')).rows.length,1);
 }finally{await pg.close();}
});

test('PostgreSQL edition recreation rotates access and preserves conflict checks',async()=>{
 const {pg,DB}=await open();let key='';const env={DB,AI_PROVIDER:'catalog',TRUSTED_CLIENT_IP:'192.0.2.88'};
 const call=async(path,method='GET',body,auth=key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'x-household-key':auth},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,data:await r.json()};};
 try{
 key=(await call('household','POST',{})).data.key;
 const n=(await call('nights','POST',{mealId:'tomato-pasta',showId:'paddington',prefs:{...defaults,watchTime:180},adapted:false,fulfillment:'delivery',orderOut:{etaMinutes:20,provider:'doordash',confirmationId:'postgres-edition'}})).data;
 assert.equal((await call('nights/'+n.id,'PATCH',{watchStarted:true})).status,409);
 for(const b of [{deliveryArrived:true},{watchStarted:true},{edition:{person:1,skip:true}},{edition:{person:2,skip:true}}])assert.equal((await call('nights/'+n.id,'PATCH',b)).status,200);
 const body={nightId:n.id,tonightsEdition:true,name:'Postgres memory',expectedRevision:null,expectedNotes:''};
 const first=await call('collections','POST',body);assert.equal(first.status,201);
 await call('collections/'+first.data.key,'PUT',{name:first.data.name,notes:first.data.notes,shared:true});
 const current=(await call('nights/'+n.id+'/edition')).data.edition;
 assert.equal((await call('nights/'+n.id+'/edition','POST',{action:'unshare',expectedRevision:current.revision-1})).status,409);
 assert.equal((await call('nights/'+n.id+'/edition','POST',{action:'unshare',expectedRevision:current.revision})).status,200);
 assert.equal((await call('nights/'+n.id+'/edition')).data.edition.shared,false);
 assert.equal((await call('collections/'+first.data.key,'DELETE')).status,200);
 assert.equal((await call('collections')).data.collections.length,0);
 assert.equal((await call('nights/'+n.id+'/edition')).data.edition,null);
 const restored=await call('collections','POST',body);assert.equal(restored.status,201);assert.notEqual(restored.data.key,first.data.key);
 assert.equal((await call('collections')).data.collections.length,1);
 assert.equal((await call('collections','POST',body)).status,409);
 assert.equal((await call('collection-share/'+first.data.key,'GET',undefined,'')).status,404);
 }finally{await pg.close();}
});
