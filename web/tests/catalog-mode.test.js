import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {curated} from '../server/social.js';
import {openDb} from '../server/local-db.js';
import {defaults} from '../product/catalog.js';
const prefs={...defaults,cookTime:45,watchTime:180};

test('Food settings save returns current capabilities for replacement household state',async()=>{
 for(const connected of [false,true]){
  const DB=openDb(),env={DB,...(connected?{AI_GENERATE:async()=>({})}:{AI_PROVIDER:'catalog'})};
  try{
   const house=await (await api(new Request('https://test/api/household',{method:'POST'}),env)).json();
   const headers={'x-household-key':house.key,'content-type':'application/json'};
   const response=await api(new Request('https://test/api/preferences',{method:'PUT',headers,body:JSON.stringify({prefs:{...prefs,diet:'Vegetarian'}})}),env);
   assert.equal(response.status,200);
   const saved=await response.json();
   assert.equal(saved.prefs.diet,'Vegetarian');
   assert.equal(saved.capabilities.connected,connected);
   assert.deepEqual(saved.capabilities,house.capabilities);
   const refreshed=await (await api(new Request('https://test/api/household',{headers}),env)).json();
   assert.deepEqual(saved.capabilities,refreshed.capabilities);
  }finally{DB.close();}
 }
});

test('catalog mode skips configured AI, caches results and avoids earlier suggestions on refresh',async()=>{
 const DB=openDb();let calls=0;
 const env={DB,AI_PROVIDER:'catalog',GCP_SERVICE_ACCOUNT_JSON:'obsolete',AI_GENERATE:()=>{calls++;throw Error('Must not call AI');}};
 try{
  const house=await (await api(new Request('https://test/api/household',{method:'POST'}),env)).json();
  assert.equal(house.capabilities.matchingMode,'catalog');
  const request=async(path,body)=>{const r=await api(new Request('https://test/api/'+path,{method:body?'POST':'GET',headers:{'x-household-key':house.key,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})}),env);assert.equal(r.status,200);return r.json();};
  assert.equal((await request('ai')).connected,false);
  const input={mode:'watch',sourceId:'avengers',prefs};
  const first=await request('recommendations',input);
  assert.equal(first.recommendationSource,'catalog');assert.equal(first.aiEnabled,false);assert.equal(first.failureCode,null);
  assert.equal(first.picks.length,3);assert.ok(first.picks.every(p=>!p.aiExplained));
  assert.match(first.answer,/no live AI was used/);
  const cached=await request('recommendations',input);assert.deepEqual(cached.picks,first.picks);
  const next=await request('recommendations',{...input,refresh:true});
  assert.ok(next.picks.length);assert.ok(next.picks.every(p=>!first.picks.some(old=>old.meal.id===p.meal.id)));
  assert.equal(calls,0);
 }finally{DB.close();}
});

test('documented titles get different ingredient-grounded dinners plus familiar alternatives',async()=>{
 const first=[];
 for(const sourceId of ['avengers','paddington','grand-budapest']){
  const result=await curated({}, {memory:{}},{mode:'watch',sourceId,prefs,personalized:true});
  assert.equal(result.picks[0].connection.kind,'Story inspiration');
  assert.ok(result.picks[0].evidenceSource.startsWith('https://'));
  assert.ok(result.picks.filter(p=>p.meal.familiar).length>=2);
  first.push(result.picks[0].meal.id);
 }
 assert.equal(new Set(first).size,3);
});

test('catalog refinements honor exclusions, familiar meals and explicit revisit',async()=>{
 const base=await curated({}, {memory:{}},{mode:'watch',sourceId:'avengers',prefs,personalized:true});
 const rejected=base.picks[0].meal.id;
 const house={memory:{dislikedMeals:[rejected],dislikedIngredients:['peanut']},recentPairings:base.picks.map(p=>({mealId:p.meal.id}))};
 const result=await curated({},house,{mode:'watch',sourceId:'avengers',prefs,personalized:true,refinement:'familiar',allowRecent:true});
 assert.ok(result.picks.length);assert.ok(result.picks.every(p=>p.meal.familiar&&p.meal.id!==rejected&&!p.meal.ingredients.some(i=>/peanut/i.test(i[0]))));
});

test('household mutations preserve current capabilities in catalog and connected modes',async()=>{
 for(const connected of [false,true]){
  const DB=openDb(),env={DB,...(connected?{AI_GENERATE:async()=>({})}:{AI_PROVIDER:'catalog'})};
  try{
   const house=await (await api(new Request('https://test/api/household',{method:'POST'}),env)).json();
   const headers={'x-household-key':house.key,'content-type':'application/json'};
   const call=async(path,method='GET',body)=>{const r=await api(new Request('https://test/api/'+path,{method,headers,...(body?{body:JSON.stringify(body)}:{})}),env);assert.ok(r.ok,await r.clone().text());return r.json();};
   const {ingredients}=await import('../product/engine.js');
   const {mealById}=await import('../product/catalog.js');
   const night=await call('nights','POST',{mealId:'pepper-pasta',showId:'ratatouille',prefs,adapted:false,confirmed:ingredients(mealById('pepper-pasta'),prefs.people,false).map(i=>i.name)});
   const feedback=await call('nights/'+night.id+'/feedback','POST',{meal:'again',pairing:'great',shorter:true,rememberMood:true});
   assert.ok(feedback.memory.favoriteMeals.includes(night.mealId));
   const removed=await call('memory','PATCH',{field:'favoriteMeals',value:night.mealId});
   assert.ok(!removed.memory.favoriteMeals.includes(night.mealId));
   const pantry=await call('pantry','PUT',{items:['tomato']});
   const deleted=await call('nights/'+night.id,'DELETE');
   for(const result of [feedback,removed,pantry,deleted]){
    assert.equal(result.capabilities.connected,connected);
    assert.deepEqual(result.capabilities,(await call('household')).capabilities);
   }
  }finally{DB.close();}
 }
});

test('personalized imported-episode choices use different dinner categories within saved limits',async()=>{
 const show={id:'tmdb-tv-1405-1-1',name:'Dexter — S1 E1: Dexter',kind:'TV episode',minutes:53,mood:'Suspenseful',genre:'Crime',family:false,custom:true,description:'A crime drama in Miami.',provider:{type:'tv',id:1405,season:1,episode:1}};
 const p={...defaults,cookTime:30,watchTime:120};
 const house={memory:{dislikedIngredients:['mushroom']},titles:[show]};
 const r=await curated({},house,{mode:'watch',sourceId:show.id,prefs:p,personalized:true});
 assert.equal(r.picks.length,3);assert.equal(new Set(r.picks.map(x=>x.meal.category)).size,3);
 assert.ok(r.picks.every(x=>x.show.id===show.id&&x.meal.minutes<=30&&!x.meal.ingredients.some(i=>/mushroom/i.test(i[0]))));
 const repeated=await curated({}, {...house,recentPairings:r.picks.map(x=>({mealId:x.meal.id}))},{mode:'watch',sourceId:show.id,prefs:p,personalized:true});
 assert.ok(repeated.picks.every(x=>!r.picks.some(old=>old.meal.id===x.meal.id)));
});
