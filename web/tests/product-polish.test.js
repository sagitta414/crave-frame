import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {defaults,mealById} from '../product/catalog.js';
import {recommend} from '../product/engine.js';
import {curate} from '../product/curation.js';
import {nightChanged} from '../product/night-sync.js';
import {readinessKey,readinessMarkup} from '../product/cooking-readiness.js';
import {mealPhoto} from '../product/meal-photos.js';
import {reviewedDishImages} from '../product/reviewed-dish-images.js';

test('normal recommendations favor sourced food connections without breaking explicit choices or limits',()=>{
 const prefs={...defaults,cookTime:60,watchTime:180};
 for(const [sourceId,mealId] of [['ratatouille','story-ratatouille'],['avengers','turkey-pita-pockets'],['paddington','grilled-cheese-soup']]){
  const input={mode:'watch',sourceId,prefs};
  assert.equal(curate(input)[0].meal.id,mealId);
  assert.equal(recommend(input)[0].meal.id,mealId);
  for(const fn of [curate,recommend]){
   const filtered=fn({...input,memory:{dislikedMeals:[mealId]}});
   assert.ok(filtered.length);assert.ok(filtered.every(p=>p.meal.id!==mealId));
   assert.ok(fn({...input,prefs:{...prefs,cookTime:20}}).every(p=>p.meal.minutes<=20));
  }
 }
});
test('browser refresh detects delay, allowance, target and capabilities, and rejects a different evening response',()=>{
 const night={id:'one',mealId:'pepper-pasta',status:'cooking',step:1,prefs:defaults};
 assert.equal(nightChanged(night,structuredClone(night)),false);
 for(const changed of [{servingNotBefore:123},{timingAllowanceMinutes:15},{finishBy:456},{capabilities:{connected:false}},{phoneOpenedAt:789}])assert.equal(nightChanged(night,{...night,...changed}),true);
 assert.equal(nightChanged(night,{...night,id:'other',step:2}),false);
});
test('browser preparation preview includes scaled quantities and a fresh gate for changed plans',()=>{
 const night={id:'one',mealId:'mac-cheese-peas',prefs:{...defaults,people:4},adapted:false};
 const html=readinessMarkup(night,mealById(night.mealId));
 assert.match(html,/360 g · Dry macaroni/);
 assert.equal((html.match(/data-change="cook-ready"/g)||[]).length,3);
 assert.match(html,/data-action="cook-start" disabled/);
 assert.match(html,/Make it creamy/);
 assert.notEqual(readinessKey(night),readinessKey({...night,prefs:{...night.prefs,people:2}}));
 assert.notEqual(readinessKey(night),readinessKey({...night,adapted:true}));
});
test('reviewed core dish images resolve to distinct valid JPEG assets on both surfaces',()=>{
 const paths=new Set();
 for(const id of reviewedDishImages){
  const path=mealPhoto(mealById(id));paths.add(path);
  const web=new URL('../product'+path.replace('/app',''),import.meta.url),tv=new URL('../../tv/assets/meals/'+id+'-v2.jpg',import.meta.url);
  assert.ok(existsSync(web));assert.ok(existsSync(tv));
  const data=readFileSync(web);assert.ok(data.length>10000);assert.equal(data.readUInt16BE(0),0xffd8);assert.deepEqual(data,readFileSync(tv));
 }
 assert.equal(paths.size,7);
 assert.equal(mealPhoto({id:'composite',mainMealId:'mac-cheese-peas'}),mealPhoto(mealById('mac-cheese-peas')));
});
