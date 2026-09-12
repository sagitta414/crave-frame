import test from 'node:test';
import assert from 'node:assert/strict';
import {rescueOptions,pairingConnection} from '../product/planning.js';
import {mealById,showById,defaults} from '../product/catalog.js';
import {recommend} from '../product/engine.js';
test('rescue respects time, missing ingredients, household dislikes and guest counts',()=>{
 const n={mealId:'mushroom-toast',showId:'grand-budapest',prefs:{...defaults,cookTime:45},dinnerMinutes:25};
 const opts=rescueOptions(n,{delay:15,missing:['mushroom'],people:3,allowWatchChange:true},{dislikedIngredients:['basil']});assert.equal(opts.length,3);
 for(const o of opts){assert.ok(o.minutesSaved>=15);assert.equal(o.people,3);assert.ok(mealById(o.mealId).ingredients.every(i=>!/(mushroom|basil)/i.test(i[0])));}
 const keep=rescueOptions(n,{delay:0,missing:[],people:4,allowWatchChange:false});assert.ok(keep.every(o=>o.showId===n.showId));assert.equal(keep[0].mealId,n.mealId);
 assert.equal(rescueOptions(n,{delay:120,missing:[],people:2,allowWatchChange:false}).length,0);
});
test('each participant veto is honored and undo restores eligibility',()=>{
 const input={mode:'meal',sourceId:'mushroom-toast',prefs:defaults,votes:[{mood:'Cozy'},{mood:'Romantic'}]},first=recommend(input);
 assert.equal(first.length,3);assert.ok(first[0].reasons.some(r=>r.includes('mood choices')));
 const veto=first[0].meal.id+':'+first[0].show.id;input.votes[0].veto=veto;
 assert.ok(recommend(input).every(p=>p.meal.id+':'+p.show.id!==veto));delete input.votes[0].veto;assert.equal(recommend(input)[0].show.id,first[0].show.id);
});
test('connections distinguish sourced screen reference from setting and mood interpretation',()=>{
 const film=pairingConnection(mealById('pepper-pasta'),showById('ratatouille'));assert.ok(film.reference&&film.source);assert.match(film.text,/not the film/);
 assert.equal(pairingConnection(mealById('mushroom-toast'),showById('detectorists')).label,'Setting inspired');
 assert.equal(pairingConnection(mealById('flatbread'),showById('avengers')).label,'Mood pairing');
});

test('changed-mind recovery replaces dinner while keeping the requested title and limits',()=>{const night={mealId:'mushroom-toast',showId:'grand-budapest',prefs:{...defaults,cookTime:45},dinnerMinutes:25};const options=rescueOptions(night,{delay:0,people:2,missing:[],allowWatchChange:false,differentDinner:true});assert.ok(options.length);assert.ok(options.every(o=>o.mealId!==night.mealId&&o.showId===night.showId&&mealById(o.mealId).minutes<=45));});
