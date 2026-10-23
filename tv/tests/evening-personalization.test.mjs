import test from 'node:test';
import assert from 'node:assert/strict';
import {fitReasons,repeatPreferences,changeSummary} from '../src/evening-personalization.js';
import {rescueOptions} from '../src/catalog/planning.js';
import {defaults,mealById} from '../src/catalog/catalog.js';
import {cookingProfile} from '../src/catalog/cooking-profile.js';
import {ingredients} from '../src/catalog/engine.js';
import {ingredientBlocked} from '../src/catalog/food-restrictions.js';
const meal={id:'sample',minutes:20,cuisine:'Italian',foodType:'Vegetarian',ingredients:[['Mozzarella',100,'g']],swap:{from:'Mozzarella',to:'Plant-based mozzarella',amount:100,unit:'g'}};
test('personalization uses actual time, exclusions and explicit favorites only',()=>{
 const prefs={...defaults,cookTime:30,diet:'No preference',people:2};
 assert.deepEqual(fitReasons({meal},prefs),['Fits your 30-minute cooking limit']);
 assert.deepEqual(fitReasons({meal},{...prefs,cookTime:15},{allergies:['Milk']}),[]);
 const reasons=fitReasons({meal,adapted:true},prefs,{allergies:['Milk'],favoriteMeals:['sample']});
 assert.equal(reasons.length,3);assert.match(reasons[1],/exclusions/);assert.match(reasons[2],/favorite/);
 assert.ok(!fitReasons({meal},prefs,{favoriteMeals:['different']}).some(r=>r.includes('favorite')));
});
test('repeating settings keeps current restrictions and leaves saved history untouched',()=>{
 const saved={...defaults,people:4,cookTime:45,mood:'Cozy',diet:'No preference',family:false};
 const snapshot=structuredClone(saved),current={...defaults,diet:'Plant-based',family:true,cookLevel:'Beginner'};
 const next=repeatPreferences(saved,current);
 assert.equal(next.people,4);assert.equal(next.cookTime,45);assert.equal(next.mood,'Cozy');assert.equal(next.diet,'Plant-based');assert.equal(next.family,true);assert.equal(next.cookLevel,'Beginner');assert.deepEqual(saved,snapshot);
});
test('swap summary never claims unchanged title or servings when either changed',()=>{
 const night={showId:'one',prefs:{people:2}};
 assert.equal(changeSummary({minutes:30},{minutes:15},night,{showId:'one',people:2}),'15 minutes less cooking · Your movie or episode stays · Servings unchanged');
 assert.equal(changeSummary({minutes:15},{minutes:30},night,{showId:'two',people:3}),'15 minutes more cooking');
});
test('easier previews strictly reduce effort and preserve title, portions and exclusions',()=>{
 const night={mealId:'mushroom-toast',showId:'grand-budapest',prefs:{...defaults,cookTime:45,people:2},dinnerMinutes:25};
 const snapshot=structuredClone(night),memory={dislikedIngredients:['basil']};
 const options=rescueOptions(night,{delay:0,people:2,missing:[],allowWatchChange:false,differentDinner:true,easier:true},memory);
 assert.ok(options.length);
 for(const o of options){const m=mealById(o.mealId);assert.equal(o.showId,night.showId);assert.equal(o.people,2);assert.ok(cookingProfile(m).effortIndex<cookingProfile(mealById(night.mealId)).effortIndex);assert.ok(!ingredients(m,2,o.adapted).some(i=>ingredientBlocked(i.name,memory)));}
 assert.deepEqual(night,snapshot);
});
