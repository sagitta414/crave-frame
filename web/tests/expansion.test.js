import test from 'node:test';
import assert from 'node:assert/strict';
import {expandedRecipes} from '../product/expanded-recipes.js';
import {movieNights} from '../product/movie-nights.js';
import {mealById,defaults,filterMeals} from '../product/catalog.js';
import {recommend} from '../product/engine.js';
test('400 distinct ingredient combinations across 20 cooking methods',()=>{
 assert.equal(expandedRecipes.length,400);
 assert.equal(new Set(expandedRecipes.map(m=>m.methodFamily)).size,20);
 assert.equal(new Set(expandedRecipes.map(m=>JSON.stringify(m.ingredients))).size,400);
 for(const m of expandedRecipes){assert.equal(m.steps.length,5);assert.ok(filterMeals(m.name,'All recipes',60,m.cuisine).some(x=>x.id===m.id));}
});
test('100 themes reference existing recipes without duplicate dishes or themes',()=>{
 assert.equal(movieNights.length,100);
 assert.equal(new Set(movieNights.map(t=>t.id)).size,100);
 assert.equal(new Set(movieNights.map(t=>t.mealId)).size,100);
 assert.equal(new Set(movieNights.map(t=>t.movie)).size,20);
 for(const t of movieNights){assert.equal(mealById(t.mealId).name,t.mealName);assert.match(t.description,/independent/i);}
});
test('selected theme is prioritized while cooking limits remain enforced',()=>{
 const meal=expandedRecipes[0],input={mode:'watch',sourceId:'grand-budapest',themedMealId:meal.id,prefs:{...defaults,cookTime:60}};
 assert.equal(recommend(input)[0].meal.id,meal.id);
 assert.ok(recommend({...input,prefs:{...input.prefs,cookTime:15}}).every(p=>p.meal.id!==meal.id&&p.meal.minutes<=15));
});
