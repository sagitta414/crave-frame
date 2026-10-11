import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults,mealById} from '../product/catalog.js';
import {ingredients,recipeSteps} from '../product/engine.js';
import {twoAppetiteMeal} from '../product/two-appetites.js';
import {dietFits} from '../product/diets.js';
import {snackability,tonightScore,specialTouch} from '../product/tonight-personality.js';
const fixture=()=>{const DB=openDb();return {DB,async call(path,method='GET',data,key=''){const r=await api(new Request('https://cf.test/api/'+path,{method,headers:{'content-type':'application/json',origin:'https://cf.test','x-household-key':key},...(data?{body:JSON.stringify(data)}:{})}),{DB,AI_PROVIDER:'catalog'});return {status:r.status,data:await r.json()};}};};
const duo=()=>twoAppetiteMeal(mealById('chicken-pepper-tacos'),mealById('chicken-pepper-tacos--tofu'),1,2);
test('two appetites scales separate proteins and prepares the shared base once',()=>{
 const m=duo();assert.ok(m);assert.deepEqual(mealById(m.id),m);
 const list=ingredients(m,2,false);
 assert.equal(list.find(i=>i.name==='Ready-cooked chicken strips').amount,125);
 assert.equal(list.find(i=>i.name==='Ready-to-eat firm tofu, cubed').amount,125);
 assert.equal(list.find(i=>i.name==='Tortillas').amount,6);
 const steps=recipeSteps(m,false,'Beginner',2);
 assert.equal(steps.filter(s=>s.title==='Prepare the base').length,1);
 assert.match(steps.find(s=>s.title==='Warm the two proteins').instruction,/separately/);
 assert.equal(m.minutes,25);
 assert.equal(twoAppetiteMeal(mealById('chicken-pepper-tacos'),mealById('chicken-basil-pasta'),1,2),null);
 assert.equal(twoAppetiteMeal(mealById('chicken-pepper-tacos'),mealById('chicken-pepper-tacos--tofu'),2,2),null);
 assert.equal(mealById('duo~bad~bad~1~2'),undefined);
 assert.equal(dietFits(m,'Vegetarian'),false);
 assert.equal(dietFits(m,'Meat & poultry'),false);
 const three=twoAppetiteMeal(mealById('chicken-pepper-tacos'),mealById('chicken-pepper-tacos--tofu'),1,3);
 assert.equal(ingredients(three,3,false).find(i=>i.name==='Ready-cooked chicken strips').amount,125);
 assert.equal(ingredients(three,3,false).find(i=>i.name==='Ready-to-eat firm tofu, cubed').amount,250);
});
test('energy and viewing style influence ranking without changing recipe times',()=>{
 const easy=mealById('garlic-toast'),slow=mealById('roasted-pasta');
 assert.ok(tonightScore(easy,{energy:'Exhausted'})>tonightScore(slow,{energy:'Exhausted'}));
 assert.equal(snackability(mealById('flatbread')).couch,true);
 assert.equal(snackability({name:'Tomato soup',category:'Soup'}).couch,false);
 assert.equal(snackability({name:'Crunchy toast',category:'Toast'}).quiet,false);
 assert.match(specialTouch(easy,{mood:'Adventure'}).detail,/spoiler-free/);
 assert.equal(easy.minutes,15);
});
test('split dinner, special touch, ingredients and steps survive save and phone handoff',async()=>{
 const f=fixture();try{
 const key=(await f.call('household','POST',{})).data.key,m=duo(),prefs={...defaults,specialTouch:true,energy:'Exhausted',viewingStyle:'Couch friendly'};
 const saved=await f.call('nights','POST',{mealId:m.id,showId:'last-guest',prefs,adapted:false,confirmed:ingredients(m,2,false).map(i=>i.name)},key);
 assert.equal(saved.status,201,JSON.stringify(saved.data));
 const share=(await f.call('nights/'+saved.data.id+'/share','POST',{},key)).data.key;
 const phone=(await f.call('shared/'+share)).data;
 assert.equal(phone.prefs.specialTouch,true);assert.equal(phone.prefs.energy,'Exhausted');
 assert.equal(phone.ingredients.filter(i=>/chicken|tofu/i.test(i.name)).length,2);
 assert.ok(phone.steps.some(s=>s.title==='Warm the two proteins'));
 const bad=await f.call('nights','POST',{mealId:m.id,showId:'last-guest',prefs:{...prefs,people:3},adapted:false,confirmed:ingredients(m,3,false).map(i=>i.name)},key);
 assert.equal(bad.status,400);
 const short=await f.call('nights','POST',{mealId:m.id,showId:'last-guest',prefs:{...prefs,cookTime:15},adapted:false,confirmed:ingredients(m,2,false).map(i=>i.name)},key);
 assert.equal(short.status,400);
 assert.equal((await f.call('preferences','PUT',{prefs:{...prefs,energy:'invalid'}},key)).status,400);
 }finally{f.DB.close();}
});
test('new shared reveals hide individual preferences and votes until everyone submits',async()=>{
 const f=fixture();try{
 const key=(await f.call('household','POST',{})).data.key;
 const room=(await f.call('rooms','POST',{prefs:{...defaults,cookTime:60,watchTime:180}},key)).data.key;
 const input={name:'Alex',mood:'Cozy',diet:'Vegetarian',watchTime:180,format:'Any',avoid:['mushroom'],mealPreference:'Pasta'};
 const one=(await f.call('room/'+room+'/join','POST',input)).data;
 const two=(await f.call('room/'+room+'/join','POST',{...input,name:'Sam',mood:'Adventure'})).data;
 let view=(await f.call('room/'+room)).data;
 assert.equal(view.privateChoices,true);assert.equal(view.members[0].mood,undefined);assert.equal(view.members[0].avoid,undefined);
 view=(await f.call('rooms/'+room+'/match','POST',{},key)).data;
 assert.ok(view.picks.length);assert.equal(view.picks[0].compromises,undefined);
 const choice=view.picks[0].meal.id+':'+view.picks[0].show.id;
 await f.call('room/'+room+'/vote','POST',{memberKey:one.memberKey,choice});
 view=(await f.call('room/'+room)).data;assert.equal(view.members[0].vote,'submitted');assert.deepEqual(view.votes,{});
 assert.equal((await f.call('rooms/'+room+'/reveal','POST',{},key)).status,400);
 await f.call('room/'+room+'/vote','POST',{memberKey:two.memberKey,choice});
 view=(await f.call('rooms/'+room+'/reveal','POST',{},key)).data;
 assert.equal(view.phase,'revealed');assert.equal(view.members[0].mood,'Cozy');assert.equal(view.votes[choice],2);
 }finally{f.DB.close();}
});
