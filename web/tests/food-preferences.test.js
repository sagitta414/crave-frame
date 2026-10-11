import test from 'node:test';
import assert from 'node:assert/strict';
import {openDb} from '../server/local-db.js';
import {api} from '../server/worker.js';
import {eligiblePairs} from '../server/ai.js';
import {defaults,mealById} from '../product/catalog.js';
import {ingredients,recipeSteps} from '../product/engine.js';
import {ingredientBlocked} from '../product/food-restrictions.js';
import {proteinOptions} from '../product/protein-options.js';
import {ingredientAssessment} from '../product/food-restrictions.js';
test('composition records distinguish allergens, explicit exclusions and unknown products',()=>{
 assert.equal(ingredientBlocked('Ghee',{allergies:['Milk']}),true);
 assert.equal(ingredientBlocked('Sesame-free bread',{allergies:['Sesame']}),false);
 assert.equal(ingredientBlocked('Buckwheat',{allergies:['Wheat']}),false);
 assert.equal(ingredientBlocked('Unknown prepared sauce',{allergies:['Milk']}),true);
 assert.ok(ingredientAssessment('Unknown prepared sauce').unknown.includes('Milk'));
 assert.equal(ingredientBlocked('Eggplant',{allergies:['Egg']}),false);
});
test('direct swaps cannot silently replace ratatouille with a rice bowl',()=>{
 const original=mealById('story-ratatouille'),prefs={...defaults,cookTime:45};
 assert.deepEqual(proteinOptions(original,prefs,{}),[]);
 assert.ok(proteinOptions(original,prefs,{},true).length);
 assert.ok(proteinOptions(mealById('chicken-pepper-tacos'),prefs,{}).every(o=>o.sameRecipe));
});
test('explicit non-AI matching preserves selected title and exclusions without calling AI',async()=>{
 const DB=openDb(),env={DB,AI_GENERATE:()=>{throw Error('AI must not run');}};
 const call=async(path,data,key)=>{const r=await api(new Request('https://test/api/'+path,{method:'POST',headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},body:JSON.stringify(data||{})}),env);return {status:r.status,...await r.json()};};
 try{const h=await call('household');const result=await call('recipe-matches',{mode:'watch',sourceId:'avengers',prefs:{...defaults,watchTime:180,cookTime:30}},h.key);assert.equal(result.status,200);assert.equal(result.recommendationSource,'catalog');assert.ok(result.picks.length);assert.ok(result.picks.every(p=>p.show.id==='tmdb-movie-24428'&&p.meal.minutes<=30));assert.equal((await call('recipe-matches',{mode:'invalid',prefs:defaults},h.key)).status,400);}finally{DB.close();}
});
test('allergy groups screen related ingredients and explicit exclusions',()=>{
 for(const [allergy,name] of [['Milk','Parmesan'],['Egg','Mayonnaise'],['Fish','Ready-cooked salmon'],['Shellfish','Prawns'],['Soy','Tofu'],['Tree nuts','Pesto'],['Peanut','Peanut butter'],['Wheat','Couscous'],['Gluten','Barley'],['Sesame','Tahini']])assert.equal(ingredientBlocked(name,{allergies:[allergy]}),true,name);
 assert.equal(ingredientBlocked('Olive oil',{allergies:['Milk']}),false);
 assert.equal(ingredientBlocked('Cooked egg-free pasta',{allergies:['Egg']}),false);
 assert.equal(ingredientBlocked('Mushrooms',{dislikedIngredients:['mushroom']}),true);
});
test('AI choices and protein variants obey allergy, diet, effort and time restrictions',()=>{
 const memory={allergies:['Fish','Shellfish','Soy'],dislikedIngredients:['mushrooms']},prefs={...defaults,cookTime:30,watchTime:180};
 const pairs=eligiblePairs({memory},prefs,{showId:'avengers'});assert.ok(pairs.length);
 for(const p of pairs)assert.ok(!ingredients(p.meal,2,false).some(i=>ingredientBlocked(i.name,memory)));
 const options=proteinOptions(mealById('chicken-pepper-tacos'),prefs,memory);assert.equal(options.length,0,'Unknown soy composition in prepared ingredients must not be assumed safe');assert.ok(proteinOptions(mealById('chicken-pepper-tacos'),prefs,{}).some(o=>o.protein==='Turkey'&&o.sameRecipe));
 for(const o of options){assert.ok(!ingredients(o.meal,2,o.adapted).some(i=>ingredientBlocked(i.name,memory)));assert.ok(o.meal.minutes<=30);assert.equal(mealById(o.meal.id).id,o.meal.id);}
 assert.equal(proteinOptions(mealById('chicken-pepper-tacos'),{...prefs,cookTime:15},memory).every(o=>o.meal.minutes<=15),true);
 assert.ok(proteinOptions(mealById('chicken-pepper-tacos'),{...prefs,diet:'Plant-based'},{}).every(o=>o.meal.foodType==='Vegetarian'&&o.adapted));
});
test('kitchen allergies persist, reject unsafe saves and revised protein reaches phone recipe',async()=>{
 const DB=openDb(),env={DB};
 const call=async(path,method='GET',data,key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:r.status,data:await r.json()};};
 try{
  const {data:h}=await call('household','POST'),prefs={...defaults,cookTime:30,watchTime:180};
  assert.equal((await call('preferences','PUT',{prefs,memory:{shorter:false,allergies:['Shellfish'],dislikedIngredients:['mushroom']}},h.key)).status,200);
  assert.deepEqual((await call('household','GET',null,h.key)).data.memory.allergies,['Shellfish']);
  assert.equal((await call('preferences','PUT',{prefs,memory:{shorter:false,allergies:['invalid']}},h.key)).status,400);
  const shrimp=mealById('shrimp-pepper-tacos');assert.equal((await call('nights','POST',{mealId:shrimp.id,showId:'avengers',prefs,adapted:false,confirmed:ingredients(shrimp,2,false).map(i=>i.name)},h.key)).status,400);
  const result=await call('protein-options','POST',{mealId:'chicken-pepper-tacos',prefs},h.key);const turkey=result.data.options.find(o=>o.protein==='Turkey');assert.ok(turkey.sameRecipe);
  const saved=await call('nights','POST',{mealId:turkey.meal.id,showId:'avengers',prefs,adapted:turkey.adapted,confirmed:ingredients(turkey.meal,2,turkey.adapted).map(i=>i.name)},h.key);assert.equal(saved.status,201);
  const share=await call('nights/'+saved.data.id+'/share','POST',{},h.key),phone=await call('shared/'+share.data.key);
  assert.ok(phone.data.ingredients.some(i=>/turkey/i.test(i.name)));assert.ok(!phone.data.ingredients.some(i=>/chicken/i.test(i.name)));assert.ok(phone.data.steps.some(s=>/turkey/i.test(s.instruction)));assert.ok(recipeSteps(turkey.meal,false).every(s=>!/[{}]/.test(s.instruction)));
 }finally{DB.close();}
});
