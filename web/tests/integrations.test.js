import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomBytes} from 'node:crypto';
import {openDb} from '../server/local-db.js';
import {api} from '../server/worker.js';
import {tmdbToken} from '../server/integrations.js';
test('phone setup requires capability, validates token, encrypts storage, and cannot replace connection',async()=>{
 const DB=openDb(),cap=randomBytes(32).toString('hex'),token='a'.repeat(80),env={DB,TMDB_SETUP_HASH:createHash('sha256').update(cap).digest('hex'),TMDB_SETUP_EXPIRES:String(Date.now()+60000),INTEGRATION_ENCRYPTION_KEY:randomBytes(32).toString('base64')};
 const original=globalThis.fetch;let valid=false;globalThis.fetch=async()=>Response.json(valid?{success:true}:{success:false},{status:valid?200:401});
 const call=async(method,auth=cap,origin='https://demo.test')=>{const r=await api(new Request('https://demo.test/api/setup/tmdb',{method,headers:{authorization:'Bearer '+auth,origin},...(method==='POST'?{body:JSON.stringify({token})}:{})}),env);return {status:r.status,body:await r.json()};};
 try{
 assert.equal((await call('GET','bad')).status,403);
 assert.equal((await call('POST',cap,'https://evil.test')).status,403);
 assert.equal((await call('POST')).status,400);assert.equal(await tmdbToken(env),null);
 valid=true;env.TMDB_SETUP_EXPIRES='1';assert.equal((await call('POST')).status,410);env.TMDB_SETUP_EXPIRES=String(Date.now()+60000);
 assert.deepEqual((await call('POST')).body,{connected:true});
 const stored=await DB.prepare("SELECT * FROM integrations WHERE id='tmdb'").first();assert.ok(!JSON.stringify(stored).includes(token));assert.equal(await tmdbToken(env),token);
 assert.equal((await call('POST')).status,409);assert.deepEqual((await call('GET')).body,{connected:true});
 }finally{globalThis.fetch=original;DB.close();}
});
