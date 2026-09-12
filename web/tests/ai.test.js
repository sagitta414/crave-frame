import test from 'node:test';
import assert from 'node:assert/strict';
import {openDb} from '../server/local-db.js';
import {api} from '../server/worker.js';
import {eligiblePairs,validatePicks,aiPreferences} from '../server/ai.js';
import {defaults,mealById} from '../product/catalog.js';
import {ingredients} from '../product/engine.js';
test('AI candidates enforce diet, time, exclusions, fixed title and model cannot invent picks',()=>{
 const p=aiPreferences({diet:'Fish & seafood',cookTime:22,watchTime:180},defaults);
 assert.equal(p.cookTime,15);
 assert.equal(eligiblePairs({memory:{dislikedIngredients:['tuna']}},p,{showId:'avengers'}).length,0);
 const pairs=eligiblePairs({memory:{dislikedIngredients:['tuna']}},{...p,cookTime:30},{showId:'avengers'});
 assert.ok(pairs.length);assert.ok(pairs.every(p=>p.show.id==='avengers'&&p.meal.foodType==='Fish & seafood'&&p.meal.minutes<=30&&!p.meal.ingredients.some(i=>/tuna/i.test(i[0]))));
 const result=validatePicks({picks:[{id:'invented',reason:'bad'},{id:pairs[0].id,reason:'Good'},{id:pairs[0].id,reason:'Duplicate'}]},pairs);
 assert.equal(result.length,1);assert.match(result[0].reason,/no supported food connection/);
});
test('AI plan persists contextual history, accepts only catalog picks and keeps approval gate',async()=>{
 const DB=openDb();let calls=0;const env={DB,AI_GENERATE:async(system,input)=>{calls++;return input.allowedPairs?{headline:'Our night',answer:'Three options',picks:(()=>{const selected=[],meals=new Set(),shows=new Set();for(const id of input.allowedPairs){const [m,s]=id.split("|");if(!meals.has(m)&&!shows.has(s)){selected.push(id);meals.add(m);shows.add(s);}if(selected.length===3)break;}return selected;})().map(id=>({id,reason:'Fits your time',tradeoff:'A little prep',ritual:'Set the table'}))}:{prefs:{cookTime:30,watchTime:180},mealQuery:'chicken'};}};
 const call=async(path,method='GET',data,key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:r.status,...await r.json()};};
 try{const h=await call('household','POST');assert.equal((await call('ai','POST',{mode:'plan',prompt:'hello'})).status,401);
 const r=await call('ai','POST',{mode:'plan',prompt:'Chicken and adventure',prefs:defaults},h.key);assert.equal(r.status,200);assert.equal(r.picks.length,3);assert.equal(calls,2);
 const saved=await call('household','GET',null,h.key);assert.equal(saved.aiHistory[0].request,'Chicken and adventure');assert.equal(saved.nights.length,0);
 const pick=r.picks[0];const n=await call('nights','POST',{mealId:pick.meal.id,showId:pick.show.id,prefs:r.prefs,adapted:false,confirmed:[]},h.key);assert.equal(n.status,400);
 assert.equal((await call('ai','POST',{mode:'pantry',image:{mimeType:'text/html',data:'YWJj'}},h.key)).status,400);
 }finally{DB.close();}
});
test('shared cooking AI sees only the selected night and cannot access planning modes',async()=>{
 const DB=openDb();let captured;const env={DB,AI_GENERATE:async(_,input)=>{captured=input;return {answer:'Follow the recipe.',tips:['Check the texture.']};}};
 const call=async(path,method='GET',data,key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:r.status,...await r.json()};};
 try{const h=await call('household','POST'),n=await call('nights','POST',{mealId:'mushroom-toast',showId:'last-guest',prefs:defaults,adapted:true,confirmed:ingredients(mealById('mushroom-toast'),2,true).map(i=>i.name)},h.key),share=await call('nights/'+n.id+'/share','POST',{},h.key);
 const r=await call('shared/'+share.key+'/ai','POST',{mode:'coach',prompt:'Help with this step'});assert.equal(r.status,200);assert.equal(captured.meal,'Mushroom toast & crispy potatoes');assert.ok(!captured.memory);assert.ok(!captured.history);
 assert.equal((await call('shared/'+share.key+'/ai','POST',{mode:'taste'})).status,403);
 }finally{DB.close();}
});
test('daily global AI allowance cannot be bypassed with a new household',async()=>{
 const DB=openDb(),env={DB,AI_GENERATE:async()=>({answer:'Ready',tips:[]})};
 const call=async(path,method,data,key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},body:JSON.stringify(data)}),env);return {status:r.status,...await r.json()};};
 try{await DB.prepare('INSERT INTO ai_usage (id,count) VALUES (?,200)').bind('global:'+new Date().toISOString().slice(0,10)).run();const h=await call('household','POST',{});assert.equal((await call('ai','POST',{mode:'taste'},h.key)).status,429);}finally{DB.close();}
});

test('cooking shares identify their evening and expiry; renewing revokes only that evening',async()=>{const DB=openDb(),env={DB};const call=async(path,method='GET',data,key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:r.status,...await r.json()};};try{const h=await call('household','POST'),body={mealId:'mushroom-toast',showId:'last-guest',prefs:defaults,adapted:true,confirmed:ingredients(mealById('mushroom-toast'),2,true).map(i=>i.name)},a=await call('nights','POST',body,h.key),b=await call('nights','POST',body,h.key),sa=await call('nights/'+a.id+'/share','POST',{},h.key),sb=await call('nights/'+b.id+'/share','POST',{},h.key);assert.equal(sa.nightId,a.id);assert.equal(sb.nightId,b.id);assert.notEqual(sa.key,sb.key);assert.ok(sa.expires>Date.now());const renewed=await call('nights/'+a.id+'/share','POST',{},h.key);assert.notEqual(renewed.key,sa.key);assert.equal((await call('shared/'+sa.key+'/connect','POST',{})).status,404);assert.equal((await call('shared/'+sb.key+'/connect','POST',{})).id,b.id);}finally{DB.close();}});
