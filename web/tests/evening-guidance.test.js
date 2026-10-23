import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {eveningFit,emptyMatchAdvice,nextCookingLabel,changeDinnerDraft} from '../product/evening-guidance.js';
import {defaults,mealById,showById} from '../product/catalog.js';
import {recommend} from '../product/engine.js';
test('fit summary counts dinner time and never calls an over-budget evening a fit',()=>{
 const meal=mealById('grilled-cheese-soup'),show={minutes:90};
 const total=meal.minutes+25+90;
 assert.match(eveningFit(meal,show,{eveningMinutes:total}),new RegExp('Fits your '+total));
 assert.match(eveningFit(meal,show,{eveningMinutes:total-10}),/10 min over/);
 assert.match(eveningFit(meal,show,{}),new RegExp(total+' min including'));
});
test('empty-state advice identifies incompatible title filters without changing food limits',()=>{
 const prefs=Object.freeze({...defaults,family:true,watchTime:60,eveningMinutes:90});
 assert.equal(emptyMatchAdvice(prefs,{kind:'Movie',minutes:100,family:false}).destination,'choose');
 assert.match(emptyMatchAdvice(prefs,{kind:'Movie',minutes:100,family:true}).text,/viewing limit is 60/);
 assert.match(emptyMatchAdvice({...prefs,watchTime:180},{kind:'Movie',minutes:80,family:true}).text,/105 minutes before cooking/);
 assert.match(emptyMatchAdvice({...prefs,format:'TV episode'},{kind:'Movie',minutes:50,family:true}).text,/format filter/);
 assert.match(emptyMatchAdvice(prefs).text,/Food exclusions remain active/);
 assert.equal(prefs.family,true);assert.equal(prefs.watchTime,60);
});
test('change dinner keeps the watch and preferences, excludes the rejected dish only for this draft',()=>{
 const prefs={...defaults,cookTime:60,watchTime:180},show=showById('paddington');
 const original={mode:'meal',sourceId:'grilled-cheese-soup',prefs,pair:{mealId:'grilled-cheese-soup',showId:show.id},confirmed:['bread']};
 const next=changeDinnerDraft(original,show.id,'grilled-cheese-soup');
 assert.equal(next.sourceId,show.id);assert.equal(next.prefs,prefs);assert.equal(next.mode,'watch');assert.deepEqual(next.confirmed,[]);
 assert.equal(original.mode,'meal');assert.equal(original.excludedDinnerIds,undefined);
 const memory={dislikedIngredients:['peanut'],dislikedMeals:next.excludedDinnerIds};
 const picks=recommend({...next,memory});assert.ok(picks.length);assert.ok(picks.every(p=>p.show.id===show.id&&p.meal.id!=='grilled-cheese-soup'&&p.meal.minutes<=prefs.cookTime));
 assert.equal(nextCookingLabel({status:'planned'}),'Get ready to cook');assert.equal(nextCookingLabel({status:'cooking'}),'Continue cooking');assert.equal(nextCookingLabel({status:'ready'}),'View cooking steps');assert.equal(nextCookingLabel({status:'planned',fulfillment:'delivery'}),'View delivery plan');
});
test('browser and TV use the same guidance rules',()=>{
 assert.equal(readFileSync(new URL('../product/evening-guidance.js',import.meta.url),'utf8'),readFileSync(new URL('../../tv/src/catalog/evening-guidance.js',import.meta.url),'utf8'));
});
