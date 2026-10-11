import test from 'node:test';
import assert from 'node:assert/strict';
import {meals,shows,defaults} from '../product/catalog.js';
import {allergyOptions,ingredientAssessment} from '../product/ingredient-allergens.js';
import {ingredientBlocked} from '../product/food-restrictions.js';
import {dietFits} from '../product/diets.js';
import {ingredients,recipeSteps,suggestedAdaptation} from '../product/engine.js';
import {eligiblePairs} from '../server/ai.js';
import {curate} from '../product/curation.js';
import {curated} from '../server/social.js';

test('every catalog and substitution ingredient has an explicit allergen record',()=>{
 const names=new Set();
 for(const meal of meals){
  for(const [name] of meal.ingredients)names.add(name);
  if(meal.swap?.from)names.add(meal.swap.from);
  if(meal.swap?.to)names.add(meal.swap.to);
 }
 const unknown=[...names].filter(name=>ingredientAssessment(name).unknown.length===allergyOptions.length).sort();
 assert.deepEqual(unknown,[],'Missing explicit composition records: '+unknown.join(', '));
});

test('a common exclusion still leaves meaningfully different quick dinners',()=>{
 const memory={allergies:['Milk'],dislikedIngredients:['mushrooms']};
 const prefs={people:4,diet:'Vegetarian'};
 const suitable=meals.filter(meal=>meal.minutes<=30&&dietFits(meal,prefs.diet)&&!ingredients(meal,prefs.people,suggestedAdaptation(meal,prefs,memory)).some(({name})=>ingredientBlocked(name,memory)));
 const categories=new Set(suitable.map(meal=>meal.category));
 assert.ok(suitable.length>=3,'Expected at least three suitable dinners');
 assert.ok(categories.size>=3,'Expected at least three meal formats, received '+[...categories].join(', '));
 const pairs=eligiblePairs({memory},{...defaults,...prefs,cookTime:30,watchTime:180},{showId:'avengers',allowRecent:true});
 assert.ok(new Set(pairs.map(pair=>pair.meal.category)).size>=3);
 assert.ok(pairs.some(pair=>pair.adapted),'Expected safe substitutions to remain available for review');
 const chef=shows.find(show=>show.name==='Chef');
 const catalog=curate({mode:'watch',sourceId:chef.id,prefs:{...defaults,...prefs,cookTime:30,watchTime:120},memory,titles:[chef]});
 assert.ok(new Set(catalog.map(pair=>pair.meal.category)).size>=3,'Catalog fallback should preserve varied safe dinners');
 assert.ok(catalog.some(pair=>pair.adapted),'Catalog fallback should preselect a safe substitution');
});

test('noodle instructions name only the selected vegetables and sauce',()=>{
 const meal=meals.find(item=>item.name==='Sweetcorn & snow pea noodles');
 const text=recipeSteps(meal,false,'Regular',4).map(step=>step.instruction).join(' ');
 assert.match(text,/sweetcorn/i);
 assert.match(text,/snow peas/i);
 assert.doesNotMatch(text,/mushrooms|carrots|cabbage|green beans|broccoli|peanut butter|miso|edamame/i);
});

test('catalog recommendations present three distinct safe meal formats',async()=>{
 const chef=shows.find(show=>show.name==='Chef');
 const prefs={...defaults,people:4,cookTime:30,watchTime:120,diet:'Vegetarian'};
 const result=await curated({},
  {prefs,memory:{allergies:['Milk'],dislikedIngredients:['mushrooms']},pantry:[],nights:[],titles:[chef],options:{region:'US',services:[],connectionMode:'Mood'}},
  {mode:'watch',sourceId:chef.id,prefs});
 assert.equal(result.picks.length,3);
 assert.equal(new Set(result.picks.map(pair=>pair.meal.category)).size,3);
 assert.ok(result.picks.every(pair=>!ingredients(pair.meal,prefs.people,pair.adapted).some(({name})=>ingredientBlocked(name,{allergies:['Milk'],dislikedIngredients:['mushrooms']}))));
});
