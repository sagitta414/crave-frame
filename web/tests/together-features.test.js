import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults,mealById} from '../product/catalog.js';
import {ingredients} from '../product/engine.js';
import {partnerTasks,partnerLearning,revealEvening,pairingEvidence,savePartnerFeedback} from '../product/together-features.js';
function fixture(){const DB=openDb(),env={DB,AI_PROVIDER:'catalog'};return {DB,async call(path,method='GET',data,key=''){const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json','x-household-key':key},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:r.status,data:await r.json()};}};}
test('partner preparation and separate feedback persist through phones without changing cooking progress',async()=>{
 const {DB,call}=fixture();try{
 const host=(await call('household','POST',{})).data.key,other=(await call('household','POST',{})).data.key;
 const meal=mealById('pepper-pasta'),prefs={...defaults,people:2};
 const created=await call('nights','POST',{mealId:meal.id,showId:'before-sunrise',prefs:{...prefs,watchTime:180},adapted:false,confirmed:ingredients(meal,2,false).map(i=>i.name)},host);assert.equal(created.status,201);
 const id=created.data.id,share=(await call('nights/'+id+'/share','POST',{},host)).data.key;
 assert.equal((await call('nights/'+id,'PATCH',{partnerTask:{id:'table',done:true}},other)).status,404);
 const path='shared/'+share;
 const done=await call(path,'PATCH',{mealId:meal.id,partnerTask:{id:'table',done:true}});assert.equal(done.status,200);assert.equal(done.data.step,0);assert.equal(done.data.status,'planned');
 const retry=await call(path,'PATCH',{mealId:meal.id,partnerTask:{id:'table',done:true}});assert.deepEqual(retry.data.partnerTasks,{table:true});
 assert.equal((await call(path,'PATCH',{partnerTask:{id:'bogus',done:true}})).status,400);
 assert.equal((await call(path,'PATCH',{mealId:'wrong',partnerTask:{id:'table',done:true}})).status,409);
 assert.equal((await call(path,'PATCH',{partnerFeedback:{person:1,food:'again',watch:'skip'}})).status,400);
 await call(path,'PATCH',{complete:true});
 await call('nights/'+id,'PATCH',{watchStarted:true},host);
 await call(path,'PATCH',{partnerFeedback:{person:1,food:'again',watch:'skip'}});
 const b=await call(path,'PATCH',{partnerFeedback:{person:2,food:'skip',watch:'again'}});assert.equal(b.status,200);assert.equal(b.data.status,'ready');assert.equal(b.data.partnerFeedback[1].food,'again');assert.equal(b.data.partnerFeedback[2].food,'skip');
 assert.equal((await call(path,'PATCH',{partnerFeedback:{person:3,food:'again',watch:'again'}})).status,400);
 assert.equal((await call(path,'PATCH',{partnerTask:{id:'table',done:false}})).status,409);
 await call('our-night','PUT',{day:'Friday',vibe:'Reconnect',prefs:{...prefs,watchTime:180},options:{services:[],region:'US'}},host);
 const ways=await call('our-night/ways','POST',{showId:'before-sunrise'},host);assert.equal(ways.status,200);assert.ok(ways.data.ways.every(w=>!w.pair||w.pair.meal.id!==meal.id));
 const house=(await call('household','GET',null,host)).data;assert.equal(house.nights[0].partnerFeedback[2].watch,'again');
 await call(path,'PATCH',{partnerFeedback:{person:2,food:'clear',watch:'clear'}});assert.equal((await call(path)).data.partnerFeedback[2],undefined);
 await DB.prepare('UPDATE shares SET expires=?').bind(0).run();assert.equal((await call(path,'PATCH',{partnerFeedback:{person:1,food:'okay',watch:'okay'}})).status,404);
 }finally{DB.close();}
});
test('partner learning respects either person and newer answers, with safe reveal ties',()=>{
 const p=(id,show)=>({meal:{id,minutes:20},show:{id:show,minutes:90}}),pairs=[p('a','x'),p('b','y'),p('c','z')];
 const nights=[{mealId:'a',showId:'x',created:'2026-01-01',partnerFeedback:{1:{food:'again',watch:'again'},2:{food:'skip',watch:'okay'}}}];
 assert.deepEqual(partnerLearning(pairs,nights).map(p=>p.meal.id),['b','c']);
 nights.push({mealId:'a',showId:'x',created:'2026-02-01',partnerFeedback:{2:{food:'again',watch:'okay'}}});assert.equal(partnerLearning(pairs,nights)[0].meal.id,'a');
 const room={phase:'voting',members:[{vote:'a:x'},{vote:'b:y'}],votes:{'a:x':1,'b:y':1},picks:pairs};assert.equal(revealEvening(room),null);
 room.phase='revealed';assert.equal(revealEvening(room).tied,true);assert.equal(revealEvening(room).total,135);room.members[0].vote=null;assert.equal(revealEvening(room),null);
});
test('adapted tasks use cooking ingredients and only sourced connections claim documentation',()=>{
 const meal=mealById('pepper-pasta'),tasks=partnerTasks(meal,2,true);for(const i of ingredients(meal,2,true))assert.ok(tasks.some(t=>t.title.includes(i.name)));
 assert.equal(pairingEvidence({connection:{kind:'On-screen food',text:'unsourced'}}).label,'Mood & pace match');
 assert.equal(pairingEvidence({connection:{kind:'On-screen food',source:'https://example.com',tableEcho:'Documented'}}).label,'Documented food connection');
 assert.equal(pairingEvidence({connection:{kind:'Story inspiration',source:'https://example.com'}}).label,'Story-inspired interpretation');
});

test('latest edited feedback wins across old nights; each field keeps its own timestamp',()=>{
 const pair={meal:{id:'pizza'},show:{id:'film'}};
 const old={created:'2026-01-01',mealId:'pizza',showId:'film',prefs:{people:2},status:'ready',watchStarted:1,partnerFeedback:{1:{food:'again',watch:'skip'}}};
 const newer={created:'2026-02-01',mealId:'pizza',showId:'film',partnerFeedback:{1:{food:'again',watch:'again'}}};
 const now=Date.parse('2026-03-01');savePartnerFeedback(old,{person:1,food:'skip'},now);
 assert.equal(partnerLearning([pair],[newer,old]).length,0);
 assert.equal(old.partnerFeedback[1].watchUpdatedAt,undefined,'editing dinner must not make an old viewing answer newer');
 savePartnerFeedback(old,{person:1,food:'again'},now+1);assert.equal(partnerLearning([pair],[newer,old]).length,1);
 savePartnerFeedback(old,{person:1,watch:'okay'},now+2);assert.equal(old.partnerFeedback[1].foodUpdatedAt,now+1);
 savePartnerFeedback(old,{person:1,watch:'okay'},now+3);assert.equal(old.partnerFeedback[1].watchUpdatedAt,now+2,'retry is idempotent');
});
test('dinner can be saved alone and watching must start before a viewing rating',()=>{
 const n={prefs:{people:2},status:'ready',watchStarted:null};
 savePartnerFeedback(n,{person:1,food:'again'},100);assert.equal(n.partnerFeedback[1].food,'again');assert.equal(n.partnerFeedback[1].watch,undefined);
 assert.throws(()=>savePartnerFeedback(n,{person:1,watch:'skip'},101),/after you start watching/);
 n.watchStarted=102;savePartnerFeedback(n,{person:1,watch:'okay'},103);assert.equal(n.partnerFeedback[1].foodUpdatedAt,100);assert.equal(n.partnerFeedback[1].watch,'okay');
 assert.throws(()=>savePartnerFeedback(n,{person:1,food:'clear'}),/response/);
 savePartnerFeedback(n,{person:1,food:'clear',watch:'clear'});assert.equal(n.partnerFeedback[1],undefined);
});
