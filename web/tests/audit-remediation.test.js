import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults,mealById,showById} from '../product/catalog.js';
import {ingredients,recipeSteps} from '../product/engine.js';
import {scheduleDinner} from '../product/curation.js';
import {rescueOptions} from '../product/planning.js';

async function fixture(){
 const DB=openDb();let key='';
 const call=async(path,method='GET',body)=>{
  const r=await api(new Request('https://test/api/'+path,{method,headers:{'x-household-key':key},...(body?{body:JSON.stringify(body)}:{})}),{DB,AI_PROVIDER:'catalog'});
  return {status:r.status,data:await r.json()};
 };
 key=(await call('household','POST',{})).data.key;
 const save=async(id='mushroom-toast',extra={})=>{const m=mealById(id);return call('nights','POST',{mealId:id,showId:'paddington',prefs:{...defaults,cookTime:60},adapted:false,confirmed:ingredients(m,2,false).map(i=>i.name),...extra});};
 return {DB,call,save};
}

test('rescue revalidates final adaptation against household exclusions without changing the saved night',async()=>{
 const f=await fixture();try{
  await f.call('preferences','PUT',{prefs:{...defaults,cookTime:60},memory:{shorter:false,allergies:['Milk']}});
  const m=mealById('recipe-coconut-chickpea-and-spinach-curry');
  const n=await f.save(m.id,{adapted:true,confirmed:ingredients(m,2,true).map(i=>i.name)});assert.equal(n.status,201);
  const request={delay:0,people:2,missing:[],allowWatchChange:false},path='nights/'+n.data.id;
  const preview=(await f.call(path+'/rescue','POST',{request})).data,c=preview.options.find(x=>x.mealId===m.id);assert.ok(c);
  const body={request,revision:preview.revision,apply:true,mealId:m.id,showId:c.showId,adapted:false,confirmed:ingredients(m,2,false).map(i=>i.name)};
  const rejected=await f.call(path+'/rescue','POST',body);assert.equal(rejected.status,400);assert.match(rejected.data.error,/excluded/);
  assert.equal((await f.call(path)).data.adapted,true);
  assert.equal((await f.call(path+'/rescue','POST',{...body,adapted:true,confirmed:ingredients(m,2,true).map(i=>i.name)})).status,200);
 }finally{f.DB.close();}
});

test('placed delivery cannot bypass cooking approval or change meals through rescue',async()=>{
 const f=await fixture();try{
  const n=await f.save('mushroom-toast',{prefs:{...defaults,diet:'Plant-based'},fulfillment:'delivery',orderOut:{etaMinutes:35,provider:'doordash'}});assert.equal(n.status,201);
  const path='nights/'+n.data.id;
  assert.equal((await f.call(path,'PATCH',{fulfillment:'cook'})).status,400);
  assert.equal((await f.call(path,'PATCH',{step:0})).status,409);
  assert.equal((await f.call(path+'/rescue','POST',{request:{delay:0,people:4,missing:[],allowWatchChange:false}})).status,400);
  assert.equal((await f.call(path,'PATCH',{planStart:Date.now(),dinnerMinutes:60})).status,400);
  assert.deepEqual((await f.call(path)).data.orderPlan,n.data.orderPlan);
  // Originally approved cooking plans can still be restored.
  const cook=(await f.save()).data,cp='nights/'+cook.id;
  await f.call(cp,'PATCH',{orderOut:{etaMinutes:30,provider:'doordash'}});
  assert.equal((await f.call(cp,'PATCH',{fulfillment:'cook'})).status,200);
 }finally{f.DB.close();}
});

test('dinner-first API returns three distinct watches for the selected dinner',async()=>{
 const f=await fixture();try{
  for(const id of ['mushroom-toast','pepper-pasta','flatbread']){
   const r=await f.call('recommendations','POST',{mode:'meal',sourceId:id,prefs:{...defaults,cookTime:60,watchTime:180}});
   assert.equal(r.status,200);assert.equal(r.data.picks.length,3,id);
   assert.equal(new Set(r.data.picks.map(p=>p.show.id)).size,3);assert.ok(r.data.picks.every(p=>p.meal.id===id));
  }
 }finally{f.DB.close();}
});

test('schedule transitions retain cooking delays, delivery anchors and shared watch calculations on both clients',async()=>{
 const start=1800000000000,minute=60000,now=start+30*minute,meal={minutes:30},show={minutes:90};
 for(const path of ['../product/evening.js','../../tv/src/catalog/evening.js']){
  const {readyTogetherPlan,delayEvening,orderOutEvening}=await import(path);
  const base={status:'planned',planStart:start,dinnerMinutes:25};
  const cooking={...base,status:'cooking',cookingStartedAt:start,progressAt:now,step:1},steps=[{seconds:600},{seconds:1200}];
  const original=readyTogetherPlan(cooking,meal,show,steps,now);
  const delayed=delayEvening(cooking,15,now,original.schedule[2].at);
  const before=readyTogetherPlan(delayed,meal,show,steps,now),after=readyTogetherPlan({...delayed,watchStarted:now},meal,show,steps,now);
  assert.equal(after.schedule[2].at,before.schedule[2].at);assert.equal(after.schedule[3].at,now);
  const delivery={...orderOutEvening(base,meal,show,35,start),status:'complete',dinnerMinutes:60};
  const a=readyTogetherPlan(delivery,meal,show,[],now),b=readyTogetherPlan(delivery,meal,show,[],now+minute);
  assert.deepEqual(a.schedule,b.schedule);assert.equal(a.schedule[2].at,delivery.orderPlan.arrivalAt);
  assert.equal(a.schedule[3].at,delivery.orderPlan.arrivalAt+60*minute);
 }
});

test('deadline and saved-start edits use preparation allowance and reject finished sessions',async()=>{
 const start=Date.now(),m=mealById('mushroom-toast'),target=start+120*60000;
 const scheduled=scheduleDinner({timingAllowanceMinutes:30},m,new Date(target).toISOString(),25,start);
 assert.equal(scheduled.planStart+(m.minutes+30)*60000,target);
 assert.throws(()=>scheduleDinner({timingAllowanceMinutes:30},m,new Date(start+(m.minutes+10)*60000).toISOString(),25,start));
 const late={mealId:'recipe-coconut-chickpea-and-spinach-curry',showId:'paddington',show:showById('paddington'),planStart:start-60*60000,finishBy:start+120*60000,prefs:{...defaults,cookTime:60},adapted:true,dinnerMinutes:25};
 const options=rescueOptions(late,{delay:0,people:2,missing:[],allowWatchChange:false});
 assert.ok(options.every(o=>o.total<=120));assert.ok(!options.some(o=>o.mealId===late.mealId));
 const f=await fixture();try{
  const n=(await f.save()).data,path='nights/'+n.id;await f.call(path,'PATCH',{step:0});await f.call(path,'PATCH',{complete:true});
  const before=(await f.call(path)).data;
  assert.equal((await f.call(path,'PATCH',{planStart:Date.now()+86400000,dinnerMinutes:60})).status,400);
  assert.equal((await f.call(path)).data.planStart,before.planStart);
 }finally{f.DB.close();}
});

test('collections retain adaptations and the shared recreation passes them to review',async()=>{
 const f=await fixture();try{
  const m=mealById('mushroom-toast'),n=(await f.save(m.id,{adapted:true,confirmed:ingredients(m,2,true).map(i=>i.name)})).data;
  const c=(await f.call('collections','POST',{nightId:n.id})).data;assert.equal(c.adapted,true);
  await f.call('collections/'+c.key,'PUT',{name:c.name,notes:'',shared:true});
  assert.equal((await f.call('collection-share/'+c.key)).data.adapted,true);
  const source=readFileSync(new URL('../../tv/src/Extras.tsx',import.meta.url),'utf8');
  assert.match(source,/adapted:shared.adapted/);assert.match(source,/Stopping sharing revokes existing photo and editor links/);
 }finally{f.DB.close();}
});

test('kids recipes preserve eight-serving guidance and eggplant shopping uses Produce',async()=>{
 const f=await fixture();try{
  const n=(await f.save('story-ratatouille')).data;
  const link=(await f.call('companion','POST',{kind:'shopping',nightId:n.id})).data;
  assert.equal((await f.call('companion-link/'+link.key)).data.items.find(i=>i.name==='Eggplant').section,'Produce');
  await f.call('preferences','PUT',{prefs:{...defaults,people:8}});
  const titles=(await f.call('parental')).data.titles,showId=titles[0].id;
  await f.call('parental','POST',{action:'enable',pin:'123456',approvedShowIds:[showId]});
  const mealId=(await f.call('kids','POST',{action:'choices',showId})).data.meals[0].id;
  const r=await f.call('kids','POST',{action:'recipe',showId,mealId,pin:'123456'});assert.equal(r.status,200);
  assert.equal(r.data.people,8);assert.equal(r.data.steps[0].adultInstruction,recipeSteps(mealById(mealId),r.data.adapted,'Confident',8)[0].instruction);
  assert.match(r.data.steps[0].adultInstruction,/For 8 people/);
 }finally{f.DB.close();}
});
