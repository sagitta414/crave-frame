import test from 'node:test';
import assert from 'node:assert/strict';
import {meals,filterMeals,defaults} from '../product/catalog.js';
import {recipeLibrary} from '../product/recipe-library.js';
import {recommend,ingredients,recipeSteps} from '../product/engine.js';
test('527 unique recipes have complete quantities, substitutions and cooking steps',()=>{
 assert.equal(meals.length,527);assert.equal(recipeLibrary.length,100);assert.equal(new Set(meals.map(m=>m.id)).size,527);assert.equal(new Set(meals.map(m=>m.name)).size,527);
 for(const m of meals){assert.ok(m.minutes>0&&m.minutes<=60,m.name);assert.ok(m.ingredients.length>=5,m.name);assert.equal(new Set(m.ingredients.map(i=>i[0])).size,m.ingredients.length,m.name);assert.ok(m.ingredients.every(([n,a,u])=>n&&Number.isFinite(a)&&a>0&&u),m.name);assert.equal(m.ingredients.filter(i=>i[0]===m.swap.from).length,1,m.name);assert.ok(m.steps.length>=4,m.name);assert.ok(recipeSteps(m,true).every(s=>s.title&&s.instruction.length>25&&!/[{}]/.test(s.instruction)),m.name);assert.ok(ingredients(m,8,true).every(i=>i.amount>0),m.name);}
 const signatures=new Set(recipeLibrary.map(m=>JSON.stringify(m.ingredients.map(i=>i[0]).sort((a,b)=>a.localeCompare(b)))));assert.equal(signatures.size,100,'Recipe ingredient profiles must differ');
});
test('different watch choices lead with different familiar dinners',async()=>{
 const {curate}=await import('../product/curation.js');
 const ids=['grand-budapest','detectorists','only-murders','chef','ratatouille','paddington','before-sunrise','avengers'];
 const leads=ids.map(sourceId=>curate({mode:'watch',sourceId,prefs:{...defaults,cookTime:60,watchTime:180},memory:{},titles:[]})[0]?.meal);
 assert.ok(leads.every(Boolean));
 assert.ok(leads.every(meal=>meal.familiar),leads.map(meal=>meal.name).join(', '));
 assert.ok(new Set(leads.map(meal=>meal.id)).size>=6,leads.map(meal=>meal.name).join(', '));
});
test('ingredient, category and cooking-time filters work together',()=>{
 const result=filterMeals('BLACK BEANS','Tacos & wraps',30);assert.ok(result.length>=3);assert.ok(result.every(m=>m.category==='Tacos & wraps'&&m.minutes<=30));
 assert.equal(filterMeals('','Salads',15).length,10);assert.equal(filterMeals('','Tray bakes',30).length,0);assert.equal(filterMeals('nonsense ingredient').length,0);
});
test('watch-first recommendations offer different eligible dinner categories',()=>{
 const picks=recommend({mode:'watch',sourceId:'ratatouille',prefs:{...defaults,cookTime:60,mood:'Adventure'}});assert.equal(picks.length,3);assert.equal(new Set(picks.map(p=>p.meal.category)).size,3);assert.ok(picks.every(p=>p.meal.minutes<=60));
});
