import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,mealById} from '../product/catalog.js';
import {eligiblePairs,storyTimeAlternative,aiRequest} from '../server/ai.js';
import {shortlistPairs} from '../server/matching-review.js';
import {browseTitleKey} from '../product/identity.js';
import {cookingTimeLabel,preparationNote} from '../product/recipe-presentation.js';
import {openDb} from '../server/local-db.js';
import {validatePicks} from '../server/ai.js';

test('fully cooked meat and ready-cooked ingredients disclose preparation assumptions',()=>{
 for(const id of ['cheeseburgers-fries','spaghetti-meatballs','chicken-potatoes']){
  const meal=mealById(id);assert.match(cookingTimeLabel(meal),/prepared ingredients/);
  assert.match(preparationNote(meal),/Have these ready/);
 }
 assert.equal(preparationNote({minutes:20,ingredients:[['Raw beef',200,'g']]}),'');
});
test('narrow model suggestions receive distinct eligible dinner formats without invented story links',()=>{
 const pairs=eligiblePairs({memory:{}},prefs,{showId:'ratatouille'});
 const pasta=pairs.filter(p=>p.meal.category==='Pasta').slice(0,3);assert.equal(pasta.length,3);
 const results=validatePicks({picks:pasta.map(p=>({id:p.id,pairingType:'practical'}))},pairs,{fillDiversity:true});
 assert.equal(new Set(results.map(p=>p.meal.category)).size,3);
 assert.ok(results.every(p=>p.pairingType==='practical'&&p.meal.minutes<=30&&p.show.id==='ratatouille'));
 assert.equal(validatePicks({picks:[{id:'invented'}]},pairs,{fillDiversity:true}).length,0);
});

const prefs={...defaults,cookTime:30,watchTime:180,family:false};
test('a longer documented dinner is an explicit offer, preserving every other preference',()=>{
 const before=structuredClone(prefs),house={memory:{},pantry:[]};
 const offer=storyTimeAlternative(house,prefs,'ratatouille');
 assert.equal(offer.pair.meal.id,'story-ratatouille');assert.equal(offer.extraMinutes,15);
 assert.equal(offer.prefs.cookTime,45);assert.deepEqual({...offer.prefs,cookTime:30},before);assert.deepEqual(prefs,before);
 assert.ok(eligiblePairs(house,prefs,{showId:'ratatouille'}).every(p=>p.meal.minutes<=30));
 assert.equal(storyTimeAlternative({memory:{dislikedIngredients:['eggplant']}},prefs,'ratatouille'),null);
 assert.equal(storyTimeAlternative(house,prefs,'ratatouille',{avoid:['zucchini']}),null);
 assert.equal(storyTimeAlternative({memory:{dislikedMeals:['story-ratatouille']}},prefs,'ratatouille'),null);
 assert.equal(storyTimeAlternative(house,{...prefs,watchTime:30},'ratatouille'),null);
 assert.equal(storyTimeAlternative(house,{...prefs,cookTime:45},'ratatouille'),null);
});
test('the default AI menu prioritizes core recipes; explicit variations remain eligible',()=>{
 const all=eligiblePairs({memory:{}},{...prefs,cookTime:60},{showId:'avengers'}),menu=shortlistPairs(all);
 assert.ok(menu.length>=3);assert.ok(menu.every(p=>p.meal.catalogTier==='core'));
 assert.ok(menu.some(p=>p.meal.hasDishPhoto));
 const variation=all.find(p=>p.meal.catalogTier==='variation');assert.ok(variation);
 const explicit=shortlistPairs(eligiblePairs({memory:{}},{...prefs,cookTime:60},{showId:'avengers',mealId:variation.meal.id}));
 assert.equal(explicit.length,1);assert.equal(explicit[0].meal.id,variation.meal.id);
});
test('legacy episode names merge in browsing without merging different episodes or films',()=>{
 const legacy={id:'detectorists',kind:'TV episode',name:'Detectorists — S1 E1'};
 const imported={id:'provider-example',kind:'TV episode',name:'Detectorists — S1 E1: Episode 1',provider:{type:'tv',id:123,season:1,episode:1}};
 assert.equal(browseTitleKey(legacy),browseTitleKey(imported));
 assert.notEqual(browseTitleKey(legacy),browseTitleKey({...imported,provider:{...imported.provider,episode:2}}));
 assert.notEqual(browseTitleKey({id:'one',provider:{type:'movie',id:10}}),browseTitleKey({id:'two',provider:{type:'movie',id:20}}));
});
test('prepared ingredient assumptions are visible without changing recipe times',()=>{
 const m=mealById('expanded-sage-chickpea-and-squash-toasted-sandwiches');
 assert.equal(m.minutes,25);assert.match(cookingTimeLabel(m),/prepared ingredients/);
 assert.match(preparationNote(m),/Cooked butternut squash/);assert.match(preparationNote(m),/raw takes extra time/);
 assert.equal(preparationNote(mealById('story-ratatouille')),'');
});
test('a documented eligible dinner survives omission by the model',async()=>{
 const DB=openDb();try{
 const r=await aiRequest(new Request('https://test/api/ai',{method:'POST',body:JSON.stringify({mode:'plan',primary:true,prompt:'Find dinner.',showId:'ratatouille',prefs:{...prefs,cookTime:45}})}),{DB,AI_GENERATE:async(_,input)=>input.allowedPairs?{picks:input.allowedPairs.filter(id=>!id.startsWith('story-ratatouille|')).slice(0,3).map(id=>({id,pairingType:'practical'}))}:{reviews:[]}}, {prefs,memory:{},nights:[],pantry:[]},'documented-omission',0);
 assert.ok(r.picks.some(p=>p.meal.id==='story-ratatouille'&&p.pairingType==='story'));
 }finally{DB.close();}
});
