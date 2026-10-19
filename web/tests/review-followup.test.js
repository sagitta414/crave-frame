import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults,mealById,showById} from '../product/catalog.js';
import {ingredients,recipeSteps} from '../product/engine.js';
import {cookingView} from '../product/cooking-view.js';
import {projectEvening} from '../product/schedule.js';
import {projectEvening as tvProjection} from '../../tv/src/schedule.js';
import {readyTogetherPlan} from '../product/evening.js';
import {readyTogetherPlan as tvPlan} from '../../tv/src/catalog/evening.js';
const source=readFileSync(new URL('../product/main.js',import.meta.url),'utf8');
const fn=name=>source.split('\n').find(line=>line.startsWith('function '+name+'('));
const meal=mealById('pepper-pasta'),show=showById('ratatouille'),start=1800000000000;
const night={mealId:meal.id,showId:show.id,prefs:defaults,status:'cooking',step:0,adapted:false,planStart:start,progressAt:start,cookingStartedAt:start,dinnerMinutes:25};
test('browser renders the same delayed and late-progress schedule as TV',()=>{
 for(const n of [{...night,servingNotBefore:start+90*60000},{...night,step:1,progressAt:start+80*60000}]){
  const now=start+80*60000,expected=tvProjection(n,meal,show,now).schedule;
  assert.deepEqual(projectEvening(n,meal,show,now).schedule,expected);
  const html=vm.runInNewContext(fn('timelinePanel')+';timelinePanel(n)',{n,mealById,showById,projectEvening:(...args)=>projectEvening(...args,now),sharedKey:'test'});
  for(const entry of expected.slice(2,4))assert.ok(html.includes(new Date(entry.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})));
 }
});
test('timer expiry never discards the remaining steps or moves dinner earlier',()=>{
 for(const project of [readyTogetherPlan,tvPlan]){
  const n={...night,timer:start+20*60000},m={minutes:30},steps=[{seconds:60},{seconds:60}];
  const before=project(n,m,show,steps,start+19*60000).schedule;
  const expired=project(n,m,show,steps,start+20*60000).schedule;
  const overdue=project(n,m,show,steps,start+22*60000).schedule;
  assert.equal(before[2].at,start+35*60000);assert.equal(expired[2].at,before[2].at);
  assert.equal(overdue[2].at,start+37*60000);
 }
});
test('browser cooking page offers saved guidance when AI is off or unknown',()=>{
 for(const capabilities of [undefined,{connected:false,matchingMode:'catalog'},{connected:true,matchingMode:'ai'}]){
  const n={...night,capabilities};
  const html=vm.runInNewContext(fn('cookPage')+';cookPage()',{
   getNight:()=>n,mealById,showById,recipeSteps,ingredients,cookingView,timelinePanel:()=>'',mealPhoto:()=>'',esc:String,badge:()=>'',formatTime:String,sharedKey:'test',household:null,
   button:(label,action)=>'<button data-action="'+action+'">'+label+'</button>'
  });
  assert.equal(html.includes('data-action="ai-cook-help"'),capabilities?.connected===true);
  assert.equal(html.includes('data-action="recipe-help"'),capabilities?.connected!==true);
 }
});
test('delivery confirmation uses placement time, but updated ETA starts from now',async()=>{
 const DB=openDb(),env={DB,AI_PROVIDER:'catalog'};let key='';
 const call=async(path,method='GET',body)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'x-household-key':key},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,data:await r.json()};};
 try{
  key=(await call('household','POST')).data.key;
  const placedAt=Date.now()-10*60000,input={mealId:meal.id,showId:show.id,prefs:defaults,adapted:false,fulfillment:'delivery',orderOut:{etaMinutes:35,provider:'doordash',placedAt}};
  const created=await call('nights','POST',input);assert.equal(created.status,201);
  assert.equal(created.data.orderPlan.arrivalAt,placedAt+35*60000);
  const now=Date.now(),updated=await call('nights/'+created.data.id,'PATCH',{orderOut:{...input.orderOut,etaMinutes:20,updateEta:true}});
  assert.equal(updated.status,200);assert.equal(updated.data.orderPlan.placedAt,placedAt);
  assert.ok(updated.data.orderPlan.arrivalAt>=now+20*60000);
  const cooked=await call('nights','POST',{...input,fulfillment:'cook',confirmed:ingredients(meal,defaults.people,false).map(i=>i.name)});
  const switched=await call('nights/'+cooked.data.id,'PATCH',{orderOut:input.orderOut});
  assert.equal(switched.status,200);assert.equal(switched.data.orderPlan.arrivalAt,placedAt+35*60000);
  assert.equal((await call('nights','POST',{...input,orderOut:{...input.orderOut,placedAt:Date.now()+3600000}})).status,400);
 }finally{DB.close();}
});
test('shared cooking reads and writes expose current non-sensitive capabilities',async()=>{
 for(const connected of [false,true]){
  const DB=openDb(),env={DB,...(connected?{AI_GENERATE:async()=>({})}:{AI_PROVIDER:'catalog'})};let key='';
  const call=async(path,method='GET',body)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'x-household-key':key},...(body?{body:JSON.stringify(body)}:{})}),env);assert.ok(r.ok);return r.json();};
  try{
   const house=await call('household','POST');key=house.key;
   const n=await call('nights','POST',{mealId:meal.id,showId:show.id,prefs:defaults,adapted:false,confirmed:ingredients(meal,defaults.people,false).map(i=>i.name)});
   const share=await call('nights/'+n.id+'/share','POST',{});key='';
   for(const result of [await call('shared/'+share.key),await call('shared/'+share.key+'/connect','POST',{}),await call('shared/'+share.key,'PATCH',{step:0})]){
    assert.deepEqual(result.capabilities,house.capabilities);assert.equal(result.memory,undefined);assert.equal(result.key,undefined);
   }
  }finally{DB.close();}
 }
});

test('order confirmations are idempotent for creation and conversion, including after an ETA update',async()=>{
 const DB=openDb(),env={DB,AI_PROVIDER:'catalog'};let key='';const originalNow=Date.now;let now=originalNow();Date.now=()=>now;
 const call=async(path,method,body)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'x-household-key':key},...(body?{body:JSON.stringify(body)}:{})}),env);assert.ok(r.ok,await r.clone().text());return r.json();};
 try{
  key=(await call('household','POST')).key;
  for(const useId of [false,true])for(const create of [false,true]){
   const order={etaMinutes:35,provider:'doordash',placedAt:now,...(useId?{confirmationId:crypto.randomUUID()}:{})};
   const input={mealId:meal.id,showId:show.id,prefs:defaults,adapted:false,confirmed:ingredients(meal,defaults.people,false).map(i=>i.name),...(create?{fulfillment:'delivery',orderOut:order}:{})};
   let first=await call('nights','POST',input);if(!create)first=await call('nights/'+first.id,'PATCH',{orderOut:order});
   now+=10*60000;
   const retry=create?await call('nights','POST',input):await call('nights/'+first.id,'PATCH',{orderOut:order});
   assert.equal(retry.id,first.id);assert.deepEqual(retry.orderPlan,first.orderPlan);
   const updated=await call('nights/'+first.id,'PATCH',{orderOut:{...order,etaMinutes:20,updateEta:true}});
   assert.equal(updated.orderPlan.arrivalAt,now+20*60000);
   now+=5*60000;
   const late=await call('nights/'+first.id,'PATCH',{orderOut:order});assert.deepEqual(late.orderPlan,updated.orderPlan);
  }
  assert.equal((await call('household','GET')).nights.length,4);
 }finally{Date.now=originalNow;DB.close();}
});
