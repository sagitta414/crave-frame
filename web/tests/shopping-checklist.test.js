import test from 'node:test';
import assert from 'node:assert/strict';
import {shoppingChecklist} from '../product/shopping-checklist.js';
import {mealById} from '../product/catalog.js';
import {readinessMarkup} from '../product/cooking-readiness.js';
test('shopping export scales servings and keeps pantry verification separate',()=>{
 const text=shoppingChecklist(mealById('mac-cheese-peas'),4,false,['Dry macaroni']);
 assert.match(text,/4 servings/);assert.match(text,/360 g Dry macaroni/);
 assert.ok(text.indexOf('Dry macaroni')>text.indexOf('ON YOUR PANTRY LIST'));
 assert.match(text,/CHECK OR BUY/);assert.match(text,/Check package ingredients/);
});
test('shopping export uses approved adaptation rather than the replaced ingredient',()=>{
 const meal=mealById('flatbread'),text=shoppingChecklist(meal,2,true);
 assert.match(text,/adapted recipe/);assert.ok(text.includes(meal.swap.to));
 assert.ok(!text.split('\n').some(line=>line.endsWith(' '+meal.swap.from)));
 assert.ok(!text.includes('ON YOUR PANTRY LIST'));
});
test('all pantry matches still require quantity verification',()=>{
 const meal=mealById('flatbread'),text=shoppingChecklist(meal,2,false,meal.ingredients.map(i=>i[0]));
 assert.match(text,/All ingredients appear/);assert.match(text,/Verify quantities/);
});
test('phone preparation offers copying for the saved servings and adaptation',()=>{
 const meal=mealById('flatbread'),html=readinessMarkup({id:'night',mealId:meal.id,prefs:{people:4,cookLevel:'Regular'},adapted:true},meal);
 assert.match(html,/data-action="copy-ingredients"/);assert.match(html,/data-people="4" data-adapted="true"/);
 assert.match(html,/data-action="cook-start" disabled/);
});
