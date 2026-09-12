import test from 'node:test';
import assert from 'node:assert/strict';
import {eveningTimeline,featuredEvenings} from '../product/evening.js';
import {defaults,mealById,showById} from '../product/catalog.js';
import {recommend,feedbackMemory} from '../product/engine.js';
test('timeline includes prep in cooking time and follows actual viewing start',()=>{
 const n={planStart:1000000,dinnerMinutes:30},meal={minutes:40},show={minutes:143};const t=eveningTimeline(n,meal,show);
 assert.equal(t[1].minutes+t[0].minutes,40);assert.equal(t[3].at,1000000+70*60000);assert.equal(t[4].at,t[3].at+143*60000);
 assert.equal(eveningTimeline({...n,watchStarted:9000000},meal,show)[3].at,9000000);
});
test('three featured journeys produce three choices and the intended explained pairing',()=>{
 for(const d of featuredEvenings){const s=showById(d.showId);assert.ok(mealById(d.mealId));const picks=recommend({demoId:d.id,mode:d.mode,sourceId:d.mode==='meal'?d.mealId:d.showId,prefs:{...defaults,mood:s.mood,watchTime:180,cookTime:45}});assert.equal(picks.length,3);assert.equal(picks[0].meal.id,d.mealId);assert.equal(picks[0].show.id,d.showId);assert.ok(picks[0].reasons.includes(d.reason));}
});
test('disliked ingredients exclude meals and remembered cuisine and effort explain new rankings',()=>{
 const input={mode:'watch',sourceId:'grand-budapest',prefs:{...defaults,cookTime:60}};
 const memory={dislikedIngredients:['mushroom'],favoriteCuisines:['Americas'],preferredEffort:'Easy'};
 const picks=recommend({...input,memory});assert.ok(picks.length);assert.ok(picks.every(p=>p.meal.ingredients.every(i=>!i[0].toLowerCase().includes('mushroom'))));assert.ok(picks[0].reasons.some(r=>r.includes('saved')));
 const next=feedbackMemory({}, {mealId:'pepper-pasta',showId:'ratatouille',prefs:defaults},{meal:'again',pairing:'great',shorter:false,rememberMood:false,rememberCuisine:true,preferEasy:true});assert.deepEqual(next.favoriteCuisines,['Mediterranean']);assert.equal(next.preferredEffort,'Easy');
});
