import test from 'node:test';
import assert from 'node:assert/strict';
import {eveningTimeline,readyTogetherPlan} from '../src/catalog/evening.js';
import {instructionForLevel} from '../src/catalog/cooking-level.js';
test('early cooking completion and viewing use actual times in chronological order',()=>{
 const night={planStart:10000000,cookingStartedAt:1000000,readyAt:2200000,watchStarted:2300000,status:'ready',dinnerMinutes:25};
 const meal={minutes:20},show={minutes:111};
 const base=eveningTimeline(night,meal,show);
 assert.equal(base[0].at,night.cookingStartedAt);assert.equal(base[2].at,night.readyAt);assert.equal(base[3].at,night.watchStarted);
 assert.ok(base.every((item,i)=>!i||item.at>=base[i-1].at));
 assert.deepEqual(readyTogetherPlan(night,meal,show).schedule,base);
});
test('baking a topping does not trigger topping preparation instructions',()=>{
 const ctx={meal:{name:'Pepperoni pizza',ingredients:[]},stepIndex:2};
 const text=instructionForLevel('Bake until the topping is bubbling.','Regular',ctx);
 assert.match(text,/oven mitts/);assert.doesNotMatch(text,/Spread this recipe/);
 assert.match(instructionForLevel('Spread the sauce.','Regular',ctx),/Spread this recipe/);
});
