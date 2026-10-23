import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults,mealById} from '../product/catalog.js';
import {ingredients} from '../product/engine.js';
import {readinessKey} from '../product/cooking-readiness.js';

test('current exclusions protect saved and shared cooking starts and progress without erasing the session',async()=>{
 const DB=openDb();let key='';
 const call=async(path,method='GET',body)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'x-household-key':key},...(body?{body:JSON.stringify(body)}:{})}),{DB});return {status:r.status,data:await r.json()};};
 try{
  key=(await call('household','POST',{})).data.key;
  const meal=mealById('recipe-coconut-chickpea-and-spinach-curry');
  const n=(await call('nights','POST',{mealId:meal.id,showId:'paddington',prefs:{...defaults,cookTime:60},adapted:false,confirmed:ingredients(meal,2,false).map(i=>i.name)})).data;
  const own='nights/'+n.id,shared='shared/'+(await call(own+'/share','POST',{})).data.key;
  const settings=allergies=>call('preferences','PUT',{prefs:{...defaults,cookTime:60},memory:{shorter:false,allergies}});
  await settings(['Milk']);
  for(const path of [own,shared]){
   for(const update of [{step:0},{timer:Date.now()+60000},{complete:true}])assert.equal((await call(path,'PATCH',update)).status,409);
   const view=(await call(path)).data;assert.deepEqual(view.cookingBlockedIngredients,['Plain yogurt']);assert.equal(view.status,'planned');
   assert.notEqual(readinessKey(view),readinessKey({...view,cookingBlockedIngredients:[]}));
  }
  await settings(['Shellfish']);
  assert.equal((await call(shared,'PATCH',{step:0})).status,200);
  const timer=Date.now()+60000;await call(own,'PATCH',{timer});const active=(await call(own)).data;
  await settings(['Milk']);
  assert.equal((await call(shared,'PATCH',{step:1})).status,409);
  const blocked=(await call(own)).data;assert.equal(blocked.timer,timer);assert.equal(blocked.step,active.step);
  // Stopping a timer remains possible; proceeding with conflicting ingredients does not.
  assert.equal((await call(shared,'PATCH',{timer:null})).status,200);
  await settings([]);assert.deepEqual((await call(shared)).data.cookingBlockedIngredients,[]);
  assert.equal((await call(shared,'PATCH',{step:1})).status,200);
 }finally{DB.close();}
});
