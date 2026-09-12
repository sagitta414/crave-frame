import test from 'node:test';
import assert from 'node:assert/strict';
import {openDb} from '../server/local-db.js';
import {api} from '../server/worker.js';
import {meals,shows,defaults,mealById} from '../product/catalog.js';
import {recommend,ingredients,recipeSteps,feedbackMemory} from '../product/engine.js';
test('both starting points return eligible pairings with explanations',()=>{
 for(const meal of meals){const picks=recommend({mode:'meal',sourceId:meal.id,prefs:{...defaults,cookTime:60}});assert.equal(picks.length,3);assert.ok(picks.every(p=>p.meal.id===meal.id&&p.show.minutes<=120&&p.reasons.length>=2));}
 for(const show of shows){const picks=recommend({mode:'watch',sourceId:show.id,prefs:{...defaults,mood:show.mood,cookTime:60,watchTime:600}});assert.equal(picks.length,3);assert.ok(picks.every(p=>p.show.id===show.id));}
});
test('time, effort, format and household constraints are hard limits',()=>{
 const prefs={...defaults,catalog:'Original demo titles',watchTime:45,cookTime:15,family:true,effort:'Easy',format:'TV episode'};
 assert.equal(recommend({mode:'meal',sourceId:'mushroom-toast',prefs}).length,0);
 const picks=recommend({mode:'meal',sourceId:'flatbread',prefs});assert.ok(picks.length>0);assert.ok(picks.every(p=>p.show.minutes<=45&&p.show.family&&p.show.kind==='TV episode'&&p.meal.minutes<=15));
});
test('saved feedback visibly changes the next top recommendation',()=>{
 const input={mode:'meal',sourceId:'mushroom-toast',prefs:defaults};
 const before=recommend(input);const memory=feedbackMemory({}, {mealId:'mushroom-toast',showId:before[0].show.id,prefs:defaults},{meal:'again',shorter:true,rememberMood:true});
 const after=recommend({...input,memory});assert.equal(after[0].show.kind,'TV episode');assert.ok(after[0].show.minutes<=45);assert.ok(after[0].reasons.some(x=>x.includes('Your feedback')));assert.notEqual(before[0].show.id,after[0].show.id);
});
test('approved substitutions and scaled portions reach cooking instructions',()=>{
 for(const meal of meals){const list=ingredients(meal,4,true);assert.ok(!list.some(x=>x.name===meal.swap.from));assert.equal(list.find(x=>x.name===meal.swap.to).amount,meal.swap.amount*2);assert.ok(recipeSteps(meal,true).every(s=>!/[{}]/.test(s.instruction)));}
});
test('household persistence, ingredient gate, private sharing, phone progress and feedback',async()=>{
 const DB=openDb(),env={DB};let key='';
 const call=async(path,method='GET',data,k=key)=>{const r=await api(new Request('https://demo.test/api/'+path,{method,headers:{'content-type':'application/json',...(k?{'x-household-key':k}:{})},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:r.status,data:await r.json()};};
 try{
 const created=await call('household','POST');assert.equal(created.status,201);key=created.data.key;assert.equal(key.length,64);
 assert.equal((await call('household')).data.nights.length,0);
 const payload={mealId:'mushroom-toast',showId:'last-guest',prefs:defaults,adapted:true,confirmed:[]};
 assert.equal((await call('nights','POST',payload)).status,400);
 payload.confirmed=ingredients(mealById(payload.mealId),2,true).map(x=>x.name);
 const saved=await call('nights','POST',payload);assert.equal(saved.status,201);const id=saved.data.id;
 assert.equal((await call('household')).data.nights.length,1);
 const other=await call('household','POST');assert.equal((await call('nights/'+id,'GET',null,other.data.key)).status,404);
 const link=await call('nights/'+id+'/share','POST');const token=link.data.key;
 const phone=await call('shared/'+token,'GET',null,'');assert.equal(phone.status,200);assert.equal(phone.data.id,id);assert.ok(!('memory' in phone.data));assert.ok(!JSON.stringify(phone.data).includes(key));
 assert.equal((await call('shared/'+token,'PATCH',{step:2},'')).status,200);
 assert.equal((await call('nights/'+id)).data.step,2);
 assert.equal((await call('nights/'+id)).data.phoneOpenedAt,undefined);
 const connected=await call('shared/'+token+'/connect','POST',{},'');assert.equal(connected.status,200);assert.equal(connected.data.step,2);assert.ok(connected.data.phoneOpenedAt>0);
 assert.equal((await call('nights/'+id)).data.phoneOpenedAt,connected.data.phoneOpenedAt);
 assert.equal((await call('shared/'+'0'.repeat(64)+'/connect','POST',{},'')).status,404);
 assert.equal((await call('shared/'+token,'PATCH',{step:999},'')).status,400);
 const deadline=Date.now()+10000;await call('shared/'+token,'PATCH',{timer:deadline},'');assert.equal((await call('nights/'+id)).data.timer,deadline);
 await call('shared/'+token,'PATCH',{complete:true},'');const ready=(await call('nights/'+id)).data;assert.equal(ready.status,'ready');assert.ok(ready.readyAt>0);
 const disconnected=await call('nights/'+id+'/share','DELETE');assert.equal(disconnected.status,200);assert.equal(disconnected.data.phoneOpenedAt,undefined);assert.equal((await call('shared/'+token,'GET',null,'')).status,404);
 const nextLink=await call('nights/'+id+'/share','POST');const nextToken=nextLink.data.key;
 const feedback=await call('nights/'+id+'/feedback','POST',{meal:'again',pairing:'great',shorter:true,rememberMood:true});assert.equal(feedback.status,200);assert.equal((await call('household')).data.memory.shorter,true);
 assert.equal((await call('household','GET',null,'wrong-key')).status,401);
 await call('nights/'+id,'DELETE');assert.equal((await call('shared/'+nextToken,'GET',null,'')).status,404);
 }finally{DB.close();}
});
test('plant-based preference requires approval, malformed requests and cross-origin writes fail',async()=>{
 const DB=openDb();try{const created=await api(new Request('https://demo.test/api/household',{method:'POST'}),{DB});const {key}=await created.json();const meal=meals[0];const response=await api(new Request('https://demo.test/api/nights',{method:'POST',headers:{'x-household-key':key},body:JSON.stringify({mealId:meal.id,showId:shows[0].id,prefs:{...defaults,diet:'Plant-based'},adapted:false,confirmed:meal.ingredients.map(x=>x[0])})}),{DB});assert.equal(response.status,400);
 const cross=await api(new Request('https://demo.test/api/household',{method:'POST',headers:{origin:'https://other.test'}}),{DB});assert.equal(cross.status,403);
 const malformed=await api(new Request('https://demo.test/api/preferences',{method:'PUT',headers:{'x-household-key':key},body:'invalid'}),{DB});assert.equal(malformed.status,400);
 }finally{DB.close();}
});
