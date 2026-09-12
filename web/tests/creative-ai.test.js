import test from 'node:test';
import assert from 'node:assert/strict';
import {eligiblePairs} from '../server/ai.js';
import {defaults} from '../product/catalog.js';
import {openDb} from '../server/local-db.js';
import {api} from '../server/worker.js';
test('AI can choose outside the featured shortlist and excludes recent dinners',()=>{
 const prefs={...defaults,cookTime:60,watchTime:180};
 const pairs=eligiblePairs({memory:{}},prefs,{showId:'avengers'});
 assert.ok(new Set(pairs.map(p=>p.meal.id)).size>100);
 assert.ok(pairs.some(p=>!p.meal.featuredRecipe));
 const recent=pairs.slice(0,12).map(p=>({mealId:p.meal.id}));
 const fresh=eligiblePairs({memory:{},recentPairings:recent},prefs,{showId:'ratatouille'});
 assert.ok(fresh.every(p=>!recent.some(r=>r.mealId===p.meal.id)));
});
test('AI failures do not silently substitute catalog choices',async()=>{
 const DB=openDb(),env={DB,AI_GENERATE:async()=>{throw Error('Provider offline');}};
 try{const created=await api(new Request('https://test/api/household',{method:'POST'}),env),{key}=await created.json();
 const response=await api(new Request('https://test/api/recommendations',{method:'POST',headers:{'content-type':'application/json','x-household-key':key},body:JSON.stringify({mode:'watch',sourceId:'avengers',prefs:{...defaults,watchTime:180}})}),env);
 const result=await response.json();assert.equal(result.recommendationSource,'unavailable');assert.deepEqual(result.picks,[]);
 }finally{DB.close();}
});
import {validatePicks} from '../server/ai.js';
test('AI recipe-only IDs resolve only when the selected title is unambiguous',()=>{
 const fixed=eligiblePairs({memory:{}},{...defaults,cookTime:45,watchTime:180},{showId:'avengers'});
 const result=validatePicks({picks:[{id:fixed[0].meal.id,reason:'Specific connection'}]},fixed);assert.equal(result.length,1);assert.equal(result[0].show.id,'avengers');
 const open=eligiblePairs({memory:{}},{...defaults,cookTime:45,watchTime:180});assert.equal(validatePicks({picks:[{id:open[0].meal.id,reason:'Ambiguous'}]},open).length,0);
});

import {feedbackMemory} from '../product/engine.js';
test('refinements preserve title and enforce familiar, cuisine and rejected meals',()=>{
 const prefs={...defaults,cookTime:60,watchTime:180};
 const familiar=eligiblePairs({memory:{}},prefs,{showId:'avengers',familiarOnly:true});assert.ok(familiar.length);assert.ok(familiar.every(p=>p.meal.familiar&&p.show.id==='avengers'));
 const cuisine=familiar[0].meal.cuisine;
 const other=eligiblePairs({memory:{}},prefs,{showId:'avengers',avoidCuisine:cuisine});assert.ok(other.length);assert.ok(other.every(p=>p.meal.cuisine!==cuisine&&p.show.id==='avengers'));
 const night={mealId:familiar[0].meal.id,showId:'avengers',prefs};const memory=feedbackMemory({},night,{meal:'skip',pairing:'miss'});
 assert.ok(!eligiblePairs({memory},prefs,{showId:'avengers'}).some(p=>p.meal.id===night.mealId));
 const restored=feedbackMemory(memory,night,{meal:'again',pairing:'great'});assert.ok(!restored.dislikedMeals.includes(night.mealId));assert.ok(restored.favoriteMeals.includes(night.mealId));
});
test('unsupported AI links default to a practical dinner label',()=>{const pairs=eligiblePairs({memory:{}},{...defaults,cookTime:45,watchTime:180},{showId:'avengers'});assert.equal(validatePicks({picks:[{id:pairs[0].id,reason:'A dinner'}]},pairs)[0].pairingType,'practical');});

test('explicit revisit restores shown familiar meals but never rejected meals',()=>{
 const prefs={...defaults,cookTime:60,watchTime:180};const all=eligiblePairs({memory:{}},prefs,{showId:'avengers',familiarOnly:true});assert.ok(all.length>=25);
 const house={memory:{dislikedMeals:[all[0].meal.id]},recentPairings:all.map(p=>({mealId:p.meal.id}))};
 assert.equal(eligiblePairs(house,prefs,{showId:'avengers',familiarOnly:true}).length,0);
 const restored=eligiblePairs(house,prefs,{showId:'avengers',familiarOnly:true,allowRecent:true});assert.equal(restored.length,all.length-1);assert.ok(restored.every(p=>p.show.id==='avengers'&&p.meal.familiar));
});

test('home revisits reuse AI results; deliberate refresh and changed preferences regenerate',async()=>{const DB=openDb();let calls=0;const env={DB,AI_GENERATE:async(_,input)=>{calls++;if(!input.allowedPairs)return {setting:'Everyday dinner',culinaryDirections:[]};const ids=[],seen=new Set();for(const id of input.allowedPairs){const meal=id.split('|')[0];if(!seen.has(meal)){ids.push(id);seen.add(meal);}if(ids.length===3)break;}return {answer:'Three practical dinners for your evening.',picks:ids.map(id=>({id,pairingType:'practical',storyCue:'No strong documented food connection for this title.',tableEcho:'A familiar everyday dinner with no claimed screen reference.',practicalFit:'Fits the selected cooking and viewing time budgets.'}))};}};try{const {key}=await (await api(new Request('https://test/api/household',{method:'POST'}),env)).json();const get=async data=>(await api(new Request('https://test/api/recommendations',{method:'POST',headers:{'content-type':'application/json','x-household-key':key},body:JSON.stringify(data)}),env)).json();const body={prefs:{...defaults,cookTime:60,watchTime:180}};const first=await get(body);assert.equal(first.recommendationSource,'ai');assert.ok(first.picks.length);const count=calls;const second=await get(body);assert.deepEqual(second,first);assert.equal(calls,count);await get({...body,refresh:true});assert.ok(calls>count);const refreshed=calls;await get({...body,prefs:{...body.prefs,cookTime:30}});assert.ok(calls>refreshed);}finally{DB.close();}});
