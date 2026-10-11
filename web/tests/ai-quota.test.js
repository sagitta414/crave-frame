import test from 'node:test';
import assert from 'node:assert/strict';
import {openDb} from '../server/local-db.js';
import {reserveAI} from '../server/ai-quota.js';
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
