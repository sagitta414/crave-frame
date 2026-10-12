import test from 'node:test';
import assert from 'node:assert/strict';
import {openDb} from '../server/local-db.js';
import {reserveAI} from '../server/ai-quota.js';
import {aiRequest} from '../server/ai.js';
import {defaults,meals} from '../product/catalog.js';
const now=Date.parse('2026-09-12T22:00:00Z'),day='2026-09-12';
const count=async(db,id)=>(await db.prepare('SELECT count FROM ai_usage WHERE id=?').bind(id+':'+day).first())?.count||0;
const seed=(db,id,n)=>db.prepare('INSERT INTO ai_usage (id,count) VALUES (?,?)').bind(id+':'+day,n).run();
test('testing can continue beyond the former household and shared limits',async()=>{
 const db=openDb();try{await seed(db,'home',100);await seed(db,'global',200);await reserveAI(db,'home',now);assert.equal(await count(db,'home'),101);assert.equal(await count(db,'global'),201);}finally{db.close();}
});
test('household rejection gives a reset time and consumes no shared allowance',async()=>{
 const db=openDb();try{await seed(db,'home',1000);await seed(db,'global',120);for(let i=0;i<3;i++)await assert.rejects(reserveAI(db,'home',now),e=>e.status===429&&e.scope==='household'&&e.resetsAt===Date.parse('2026-09-13T00:00:00Z')&&e.message.includes('2h 0m'));assert.equal(await count(db,'global'),120);assert.equal(await count(db,'home'),1000);}finally{db.close();}
});
test('global rejection releases the household reservation',async()=>{
 const db=openDb();try{await seed(db,'global',2000);await seed(db,'home',20);await assert.rejects(reserveAI(db,'home',now),e=>e.scope==='global');assert.equal(await count(db,'home'),20);assert.equal(await count(db,'global'),2000);}finally{db.close();}
});
test('concurrent households cannot exceed the shared cap',async()=>{
 const db=openDb();try{await seed(db,'global',1999);const results=await Promise.allSettled(['a','b','c'].map(id=>reserveAI(db,id,now)));assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(await count(db,'global'),2000);assert.equal((await count(db,'a'))+(await count(db,'b'))+(await count(db,'c')),1);}finally{db.close();}
});

test('valid no-match plans never reserve allowance or call the provider',async()=>{
 const DB=openDb();let calls=0;
 try{
  const env={DB,AI_GENERATE:async()=>{calls++;throw Error('Unexpected provider call');}};
  const house={prefs:defaults,nights:[],memory:{dislikedMeals:meals.map(m=>m.id)}};
  for(const cinematicFormat of [undefined,'three-act']){
   const result=await aiRequest(new Request('https://test/api/ai',{method:'POST',body:JSON.stringify({mode:'plan',primary:true,prompt:'Plan tonight',showId:'paddington',cinematicFormat})}),env,house,'home',0);
   assert.deepEqual(result.picks,[]);
  }
  assert.equal(calls,0);
  assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM ai_usage').first()).n,0);
 }finally{DB.close();}
});

test('provider attempts reserve both counters before calling and retain the charge on failure',async()=>{
 const DB=openDb();let calls=0;
 try{
  const env={DB,AI_GENERATE:async()=>{
   calls++;
   const rows=await DB.prepare('SELECT count FROM ai_usage').all();
   assert.equal(rows.results.length,2);assert.ok(rows.results.every(r=>r.count===1));
   throw Error('Provider failed');
  }};
  await assert.rejects(aiRequest(new Request('https://test/api/ai',{method:'POST',body:JSON.stringify({mode:'taste'})}),env,{nights:[],memory:{}},'home',0),/Provider failed/);
  assert.equal(calls,1);
  const rows=await DB.prepare('SELECT count FROM ai_usage').all();
  assert.ok(rows.results.every(r=>r.count===1));
 }finally{DB.close();}
});
