import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {meals,mealById,mealCuisines,filterMeals,moods} from '../product/catalog.js';
import {ingredients,recipeSteps} from '../product/engine.js';

test('pantry markup stays literal after household and phone input paths',async()=>{
 const DB=openDb();const env={DB,AI_PROVIDER:'catalog'};
 try{
  const call=async(path,method='GET',data,key)=>{const response=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},...(data?{body:JSON.stringify(data)}:{})}),env);assert.ok(response.ok,await response.clone().text());return response.json();};
  const house=await call('household','POST');
  const values=['<strong data-review="pantry">Test ingredient</strong>',"Oats & 'seeds'",'</label><button>False action</button>'];
  const direct=await call('pantry','PUT',{items:values},house.key);
  const link=await call('companion','POST',{kind:'pantry'},house.key);
  const phone=await call('companion-link/'+link.key);
  await call('companion-link/'+link.key+'/confirm','POST',{items:values,revision:phone.revision});
  const refreshed=await call('household','GET',undefined,house.key);
  const source=readFileSync(new URL('../product/main.js',import.meta.url),'utf8');
  const render=source.slice(source.indexOf('function kitchen()'),source.indexOf('function render()'));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  for(const household of [direct,refreshed]){
   assert.deepEqual(household.pantry,values);
   const html=vm.runInNewContext(render+';kitchen()',{household,kitchenPantryDraft:null,meals,moods,esc,title:()=>'',button:()=>'',mealById});
   for(const value of values){assert.ok(html.includes('>'+esc(value)+'</label>'));assert.ok(html.includes('value="'+esc(value)+'"'));}
   assert.ok(!html.includes('<strong data-review='));assert.ok(!html.includes('<button>False action</button>'));
  }
 }finally{DB.close();}
});

test('explicit cuisine survives initialization and has a usable filter',()=>{
 assert.equal(mealById('story-ratatouille').cuisine,'European');
 assert.ok(filterMeals('ratatouille','All recipes',60,'European').some(m=>m.id==='story-ratatouille'));
 assert.ok(mealCuisines.every(c=>typeof c==='string'&&c.trim()));
});

test('serving counts scale ingredients without fixed two-person plating or time multiplication',()=>{
 for(const people of [1,4,8]){
  for(const meal of meals){
   const steps=recipeSteps(meal,false,'Confident',people),text=steps.map(s=>s.instruction).join(' ');
   assert.doesNotMatch(text,/two (?:bowls|generous servings|personal pizzas|ovenproof dishes|large sheets|slices of bread)|Form four thin patties/,meal.id);
   assert.match(steps[0].instruction,new RegExp('For '+people+' person|For '+people+' people'));
   assert.match(steps[0].instruction,/do not multiply cooking time/);
   assert.deepEqual(steps.map(s=>s.seconds),recipeSteps(meal,false,'Confident',2).map(s=>s.seconds));
   assert.equal(ingredients(meal,people,false)[0].amount,meal.ingredients[0][1]*people/2);
  }
 }
});

test('pasta prepares first and cooks alongside sauce, preserving four-step saved progress',()=>{
 const pastas=meals.filter(m=>m.id.startsWith('recipe-')&&m.category==='Pasta');
 assert.equal(pastas.length,10);
 for(const meal of pastas){
  const steps=recipeSteps(meal,false,'Confident',2);
  assert.equal(steps.length,4);assert.match(steps[0].instruction,/leave the pasta uncooked/);
  assert.match(steps[1].instruction,/Cook for 5 minutes/);
  assert.match(steps[2].instruction,/Meanwhile, continue cooking the vegetables/);
  assert.match(steps[2].instruction,/If the sauce finishes first/);
  assert.doesNotMatch(steps.map(s=>s.instruction).join(' '),/,\s*[.;]/);
 }
});
