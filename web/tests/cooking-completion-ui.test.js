import {nightRitual,coupleRoles} from '../product/our-night.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {cookingView,deliveryCompanion} from '../product/cooking-view.js';
import {mealById,showById,defaults} from '../product/catalog.js';
import {recipeSteps,ingredients} from '../product/engine.js';
import {readinessKey,readinessMarkup} from '../product/cooking-readiness.js';
import {mealPhoto} from '../product/meal-photos.js';
import {existsSync} from 'node:fs';

const momentSource=readFileSync(new URL('../product/main.js',import.meta.url),'utf8').match(/^function coupleMoment\(.*$/m)[0];
const source=readFileSync(new URL('../product/main.js',import.meta.url),'utf8').match(/^function cookPage\(\).*$/m)[0];
function render(night){
 return vm.runInNewContext(momentSource+';'+source+';cookPage();',{nightRitual,coupleRoles,getNight:()=>night,night,mealById,showById,recipeSteps,ingredients,cookingView,deliveryCompanion,readinessKey,readinessMarkup,cookingChecks:new Map(),timelinePanel:()=>'<div>Timeline</div>',mealPhoto:()=>'/photo.jpg',esc:String,badge:String,button:(label,action)=>`<button data-action="${action}">${label}</button>`,formatTime:String,sharedKey:'private',household:{capabilities:{connected:false}}});
}
const base={id:'test',mealId:'mac-cheese-peas',showId:'paddington',prefs:defaults,adapted:false,step:0,status:'cooking'};
test('completed browser cooking pages celebrate without exposing timer or step mutations',()=>{
 for(const status of ['ready','complete']){
  const html=render({...base,status,step:mealById(base.mealId).steps.length-1});
  assert.match(html,/Recipe complete/);assert.match(html,/Dinner is ready/);
  assert.doesNotMatch(html,/data-action="(?:timer|step|finish-cooking)"/);
  assert.match(html,/Ingredients & approved changes/);
 }
});
test('delivery companion has the schedule and disclosure without cooking controls',()=>{
 const html=render({...base,fulfillment:'delivery',status:'planned'});
 assert.match(html,/YOUR ORDER-OUT EVENING/);assert.match(html,/Timeline/);
 assert.match(html,/does not receive order updates/);
 assert.doesNotMatch(html,/data-action="(?:timer|step|finish-cooking|cook-start)"/);
});
test('active cooking retains controls and stale step indices cannot crash recipe rendering',()=>{
 assert.match(render(base),/data-action="step"/);
 assert.match(render({...base,step:999}),/YOUR KITCHEN COMPANION/);
 assert.equal(cookingView({...base,step:-1},4).index,0);
 assert.match(render({...base,status:'planned'}),/Ready to cook/);
});
test('browser uses the dedicated sandwich image and preserves main-course artwork in composed meals',()=>{
 const meal=mealById('grilled-cheese-soup');
 assert.match(mealPhoto(meal),/grilled-cheese-soup-v2.png$/);
 assert.ok(existsSync(new URL('../product/'+mealPhoto(meal).replace('/app/',''),import.meta.url)));
 for(const id of ['grilled-cheese-soup','turkey-pita-pockets','mac-cheese-peas'])assert.equal(mealPhoto({id:'composed',mainMealId:id}),mealPhoto(mealById(id)));
});

test('couples phone completion offers an optional prompt without storing answers',()=>{const html=render({...base,status:'ready',ourNight:{vibe:'Reconnect'}});assert.match(html,/What made you feel cared for/);assert.match(html,/conversation starter · optional/);assert.doesNotMatch(html,/<textarea/);});
