import test from 'node:test';
import assert from 'node:assert/strict';
import {tasteSummary} from '../src/taste-summary.js';
test('disliked and neutral dinners cannot become favorite cuisine or cooking rhythm',()=>{
 const lookup=id=>({cuisine:id==='liked'?'Italian':'French',minutes:id==='liked'?20:60});
 const summary=tasteSummary([{mealId:'bad',feedback:{meal:'skip'}},{mealId:'neutral',feedback:{meal:'okay'}},{mealId:'liked',feedback:{meal:'again'}}],{},lookup);
 assert.deepEqual(summary,{rated:3,liked:1,cuisine:'Italian',minutes:20});
 assert.equal(tasteSummary([{mealId:'bad',feedback:{meal:'skip'}}],{},lookup).minutes,null);
 assert.equal(tasteSummary([], {favoriteCuisines:['Mexican']},lookup).cuisine,'Mexican');
});
