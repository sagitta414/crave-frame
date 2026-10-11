import test from 'node:test';
import assert from 'node:assert/strict';
import {aiRequest} from '../server/ai.js';
import {openDb} from '../server/local-db.js';
import {api} from '../server/worker.js';
import {defaults,mealById} from '../product/catalog.js';
import {ingredients,recipeSteps} from '../product/engine.js';
import {threeActMeal} from '../product/three-act.js';
import {proteinOptions} from '../product/protein-options.js';
const prefs={...defaults,people:4,cookTime:45,watchTime:180};
const input={mode:'plan',showId:'chef',cinematicFormat:'three-act',prompt:'For Chef: a three-act dinner',prefs};
const model=async(system,data)=>{
 assert.doesNotMatch(system,/Extract evening preferences/,'a structured selected-movie request must not ask for the title again');
 return data.indexedPairs?{picks:data.indexedPairs.slice(0,3).map(p=>({pairIndex:p.pairIndex,pairingType:'practical',tableEcho:'An everyday dinner.'}))}:{reviews:[]};
};
test('three-act request preserves movie, total time, three courses and quantities',async()=>{
 const DB=openDb();try{
 const r=await aiRequest(new Request('https://test/ai',{method:'POST',body:JSON.stringify(input)}),{DB,AI_GENERATE:model},{nights:[],memory:{}},'cinema',0);
 assert.ok(r.picks.length);for(const p of r.picks){assert.match(p.show.name,/Chef/);assert.equal(p.meal.courses.length,3);assert.ok(p.meal.minutes<=45);assert.equal(p.meal.minutes,p.meal.courses.reduce((n,c)=>n+c.minutes,0));assert.equal(mealById(p.meal.id).id,p.meal.id);assert.match(recipeSteps(p.meal,false,'Regular',4)[0].instruction,/320 g Cucumber/);assert.match(recipeSteps(p.meal,false,'Regular',4)[1].instruction,/480 g Strawberries/);}
 }finally{DB.close();}
});
test('three-act requests reject episodes, insufficient time and excluded courses',async()=>{
 const DB=openDb();try{const run=(patch,memory={})=>aiRequest(new Request('https://test/ai',{method:'POST',body:JSON.stringify({...input,...patch})}),{DB,AI_GENERATE:model},{nights:[],memory},'bounds',0);
 const episode=await run({showId:'detectorists'});assert.equal(episode.picks.length,0);assert.match(episode.answer,/Choose a movie/);
 const short=await run({prefs:{...prefs,cookTime:15}});assert.equal(short.picks.length,0);assert.match(short.answer,/10 minutes/);
 const blocked=await run({}, {dislikedIngredients:['strawberries','orange']});assert.equal(blocked.picks.length,0);assert.match(blocked.answer,/exclusions/);
 const fallback=await run({}, {dislikedIngredients:['cucumber','strawberries']});assert.ok(fallback.picks.every(p=>p.meal.starterId==='carrot'&&p.meal.dessertId==='orange'));
 }finally{DB.close();}
});
test('course recipe IDs reject forged side recipes and swaps preserve courses and total time',()=>{
 assert.equal(mealById('three-act-v1~chicken-pepper-tacos~unknown~orange'),undefined);
 const meal=threeActMeal(mealById('chicken-pepper-tacos'),'cucumber','strawberries');
 const options=proteinOptions(meal,prefs,{});assert.ok(options.some(o=>o.protein==='Turkey'));assert.ok(options.every(o=>o.meal.courses.length===3&&o.meal.minutes<=prefs.cookTime));
 assert.equal(proteinOptions(meal,{...prefs,cookTime:15},{}).length,0);
});
test('saved three-course recipe and phone cooking use all ingredients and scaled steps',async()=>{
 const DB=openDb(),env={DB};let key;
 const call=async(path,method,data)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},...(data?{body:JSON.stringify(data)}:{})}),env);return r.json();};
 try{
 key=(await call('household','POST',{})).key;
 const meal=threeActMeal(mealById('chicken-pepper-tacos'),'cucumber','strawberries');
 const n=await call('nights','POST',{mealId:meal.id,showId:'chef',prefs,adapted:false,confirmed:ingredients(meal,4,false).map(i=>i.name)});
 assert.equal(n.mealId,meal.id);
 const saved=await call('nights/'+n.id,'GET');assert.match(saved.steps[0].instruction,/320 g Cucumber/);assert.match(saved.steps[1].instruction,/480 g Strawberries/);assert.ok(saved.ingredients.some(i=>i.name==='Maple syrup'));assert.match(saved.steps.at(-1).instruction,/credits/);
 }finally{DB.close();}
});
