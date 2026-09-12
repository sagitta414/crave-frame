import test from 'node:test';
import assert from 'node:assert/strict';
import {foodPreferences,dietFits} from '../product/diets.js';
import {recommend} from '../product/engine.js';
import {defaults} from '../product/catalog.js';
test('food preferences select actual matching meals and keep animal proteins out of vegetarian results',()=>{
 assert.equal(defaults.diet,'No preference');
 for(const diet of foodPreferences){const picks=recommend({mode:'watch',sourceId:'avengers',prefs:{...defaults,diet,watchTime:180}});assert.equal(picks.length,3,diet);assert.ok(picks.every(p=>dietFits(p.meal,diet)));if(['Vegetarian','Plant-based'].includes(diet))assert.ok(picks.every(p=>!p.meal.foodType));}
});
