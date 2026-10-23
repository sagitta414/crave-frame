import test from 'node:test';
import assert from 'node:assert/strict';
import {signatureEvenings,signatureFor} from '../product/signature-evenings.js';
import {mealById,showById,shows,defaults} from '../product/catalog.js';
import {curate,connection} from '../product/curation.js';
test('editorial evenings resolve real recipes and canonical title identities',()=>{
 assert.equal(signatureEvenings.length,20);
 for(const s of signatureEvenings){const meal=mealById(s.meal),show=showById(s.show);assert.ok(meal);assert.ok(show);assert.equal(signatureFor(meal,show),s);assert.ok(meal.minutes<=45);assert.ok(s.line.length<190);}
});
test('signature promotion never bypasses time or ingredient exclusions',()=>{
 const picks=curate({prefs:{...defaults,cookTime:15,watchTime:120},memory:{allergies:['milk']}});
 assert.ok(picks.every(p=>p.meal.minutes<=15));
 const meal=mealById('grilled-cheese-soup'),show=showById('paddington');assert.notEqual(connection(meal,show).kind,'On-screen food');
 assert.ok(!curate({mode:'watch',sourceId:show.id,prefs:{...defaults,cookTime:60,watchTime:180},memory:{dislikedMeals:[meal.id]}}).some(p=>p.meal.id===meal.id));
});

test('title-specific dinners respect the cooking budget and exclusions',()=>{
 const picks=(id,cookTime,memory={})=>curate({mode:'watch',sourceId:id,prefs:{...defaults,cookTime,watchTime:180},memory});
 assert.equal(picks('ratatouille',45)[0].meal.id,'story-ratatouille');
 assert.equal(picks('ratatouille',30)[0].meal.id,'tomato-pasta');
 assert.ok(picks('ratatouille',30).every(p=>p.meal.minutes<=30));
 assert.equal(picks('grand-budapest',30)[0].meal.id,'mushroom-toast');
 assert.ok(!picks('grand-budapest',30,{dislikedMeals:['mushroom-toast']}).some(p=>p.meal.id==='mushroom-toast'));
});

test('every built-in real title has at least two distinct editorial dinners',()=>{for(const show of shows.filter(s=>s.source)){const entries=signatureEvenings.filter(s=>signatureFor(mealById(s.meal),show)===s);assert.ok(new Set(entries.map(s=>s.meal)).size>=2,show.name);}});
