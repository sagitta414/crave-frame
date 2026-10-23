import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {meals,mealById,defaults,moods} from '../product/catalog.js';
import {dietFits} from '../product/diets.js';
import {curate} from '../product/curation.js';
import {ingredients,recipeSteps} from '../product/engine.js';
import {ingredientAssessment} from '../product/ingredient-allergens.js';
import {twoAppetiteMeal} from '../product/two-appetites.js';
import {proteinVariations} from '../product/protein-recipes.js';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';

test('order-out projection requires a supplied delivery estimate on web and TV',async()=>{
 for(const path of ['../product/evening.js','../../tv/src/catalog/evening.js']){
  const {orderOutEvening}=await import(path);
  const night={status:'planned',planStart:1800000000000};
  assert.throws(()=>orderOutEvening(night,{minutes:20},{minutes:90}),/delivery estimate/);
  assert.equal(orderOutEvening(night,{minutes:20},{minutes:90},42,1800000000000).orderPlan.arrivalAt,1800000000000+42*60000);
 }
});

test('changed shared recipe and scheduling modules stay identical on web and TV',()=>{
 for(const name of ['catalog','cooking-level','curation','diets','engine','evening','expanded-recipes','movie-nights','protein-recipes','recipe-library','two-appetites']){
  const web=readFileSync(new URL(`../product/${name}.js`,import.meta.url),'utf8').replaceAll('\r\n','\n');
  const tv=readFileSync(new URL(`../../tv/src/catalog/${name}.js`,import.meta.url),'utf8').replaceAll('\r\n','\n');
  assert.equal(tv,web,name);
 }
});

test('plant-based eligibility checks the real adaptation and API rejects incomplete swaps',async()=>{
 for(const id of ['grilled-cheese-soup','loaded-baked-potatoes','mac-cheese-peas']){
  assert.equal(dietFits(mealById(id),'Vegetarian'),true);
  assert.equal(dietFits(mealById(id),'Plant-based'),false,id);
 }
 const picks=curate({prefs:{...defaults,diet:'Plant-based'}});assert.ok(picks.length);
 for(const p of picks){assert.equal(p.adapted,true);for(const i of ingredients(p.meal,2,true))assert.ok(!ingredientAssessment(i.name).contains.some(a=>['Milk','Egg','Fish','Shellfish'].includes(a)),i.name);}
 const DB=openDb();try{
  const h=await(await api(new Request('https://test/api/household',{method:'POST'}),{DB})).json();
  const m=mealById('grilled-cheese-soup');
  const response=await api(new Request('https://test/api/nights',{method:'POST',headers:{'x-household-key':h.key},body:JSON.stringify({mealId:m.id,showId:'paddington',prefs:{...defaults,diet:'Plant-based'},adapted:true,confirmed:ingredients(m,2,true).map(i=>i.name)})}),{DB});
  assert.equal(response.status,400);assert.match((await response.json()).error,/food preference/);
 }finally{DB.close();}
});

test('kitchen rerenders preserve unchecked, checked and custom unsaved pantry choices',()=>{
 const main=readFileSync(new URL('../product/main.js',import.meta.url),'utf8');
 const render=main.slice(main.indexOf('function kitchen()'),main.indexOf('function render()'));
 const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const household={pantry:['Pasta'],memory:{}};
 const c=vm.createContext({household,kitchenPantryDraft:['Broccoli','Custom oats'],meals,moods,esc,title:()=>'',button:()=>'',mealById});
 const html=vm.runInContext(render+';kitchen()',c);
 assert.match(html,/value="Broccoli" checked/);assert.match(html,/value="Custom oats" checked/);assert.doesNotMatch(html,/value="Pasta" checked/);
 c.household={...household,memory:{shorter:true}};
 assert.match(vm.runInContext('kitchen()',c),/value="Custom oats" checked/);
 c.kitchenPantryDraft=[];assert.doesNotMatch(vm.runInContext('kitchen()',c),/value="Pasta" checked/);
});

test('failed phone handoff has a working retry without changing the evening',async()=>{
 const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{disabled:false,value:'',textContent:'',addEventListener(){}});return nodes.get(id);};
 let attempts=0;const app={innerHTML:'',setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[]};
 const context=vm.createContext({document:{querySelector:id=>id==='#app'?app:node(id)},location:{search:'?key=test'},URLSearchParams,AbortController,setTimeout,clearTimeout,setInterval(){},fetch:async()=>{attempts++;if(attempts===1)throw Error('Offline');return {ok:true,json:async()=>({kind:'search',query:'Dexter'})};}});
 vm.runInContext(readFileSync(new URL('../product/companion.js',import.meta.url),'utf8'),context);await new Promise(r=>setImmediate(r));
 assert.match(app.innerHTML,/Try again/);assert.equal(node('#status').textContent,'Offline');
 await node('#retry-link').onclick();assert.equal(attempts,2);assert.match(app.innerHTML,/Sent to your TV/);assert.match(app.innerHTML,/Dexter/);
});

test('protein and split pasta plans defer pasta until the topping is warming',()=>{
 const first=mealById('chicken-basil-pasta'),second=proteinVariations.find(m=>m.proteinBase===first.id&&m.protein==='Tofu');
 for(const meal of [first,second]){const steps=recipeSteps(meal,false,'Confident',2);assert.match(steps[1].instruction,/Leave the pasta uncooked/);assert.match(steps[3].instruction,/While the protein heats, cook the pasta/);}
 const split=twoAppetiteMeal(first,second,1,2);const steps=recipeSteps(split,false,'Confident',2);
 assert.match(steps[3].instruction,/Keep the pasta uncooked/);assert.match(steps[4].instruction,/Meanwhile, cook the pasta/);
});

test('catalog instructions stay complete at every level, adaptation and serving boundary',()=>{
 assert.equal(new Set(meals.map(m=>m.id)).size,meals.length);
 for(const m of meals)for(const adapted of [false,true])for(const level of ['Beginner','Regular','Confident'])for(const people of [1,8]){
  const steps=recipeSteps(m,adapted,level,people);assert.equal(steps.length,m.steps.length);
  for(const step of steps){assert.ok(step.title&&step.instruction);assert.doesNotMatch(step.instruction,/\{(?:fat|finish)\}|undefined|NaN/,m.id);assert.ok(Number.isFinite(step.seconds)&&step.seconds>=0,m.id);}
 }
});
