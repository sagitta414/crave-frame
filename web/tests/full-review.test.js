import test from 'node:test';
import assert from 'node:assert/strict';
import {proteinRecipes,proteinVariations} from '../product/protein-recipes.js';
import {recipeSteps} from '../product/engine.js';
import {openDb} from '../server/local-db.js';
import {api} from '../server/worker.js';
import {defaults} from '../product/catalog.js';

test('all protein variants use directions for their actual ingredients',()=>{
 for(const meal of [...proteinRecipes,...proteinVariations]){
  const setup=meal.steps[0][1],names=meal.ingredients.map(i=>i[0]).join(' ');
  assert.equal(/check the fish for bones/i.test(setup),/salmon|tuna/i.test(meal.ingredients[0][0]));
  assert.equal(/\bdrain\b/i.test(setup),/\bCanned\b/.test(names));
  if(/Tortillas/.test(names))assert.match(meal.steps[4][1],/Fill the warm tortillas/);
 }
 const turkey=proteinVariations.find(m=>m.id==='chicken-pepper-tacos--turkey');
 assert.doesNotMatch(recipeSteps(turkey,false,'Regular')[0].instruction,/fish|canned|colander|steam/i);
});

test('recommendations survive a failed editorial review without unverified story claims',async()=>{
 const DB=openDb();let calls=0;
 const env={DB,AI_GENERATE:async(_,input)=>{calls++;if(input.candidates)throw Error('Editorial timeout');return {picks:input.allowedPairs.slice(0,3).map(id=>({id,pairingType:'setting',tableEcho:'An unverified story claim.'}))};}};
 try{
  const {key}=await (await api(new Request('https://test/api/household',{method:'POST'}),env)).json();
  const result=await (await api(new Request('https://test/api/recommendations',{method:'POST',headers:{'x-household-key':key},body:JSON.stringify({prefs:{...defaults,watchTime:180},refresh:true})}),env)).json();
  assert.equal(calls,2);assert.equal(result.recommendationSource,'ai');assert.ok(result.picks.length);
  assert.ok(result.picks.every(p=>p.tableEcho!=='An unverified story claim.'));
 }finally{DB.close();}
});

test('concierge preserves a specific no-result explanation',async()=>{
 const DB=openDb(),env={DB,AI_GENERATE:async()=>({clarification:'Which edition of the movie do you mean?'})};
 try{
  const {key}=await (await api(new Request('https://test/api/household',{method:'POST'}),env)).json();
  const result=await (await api(new Request('https://test/api/ai',{method:'POST',headers:{'x-household-key':key},body:JSON.stringify({mode:'plan',prompt:'A movie night'})}),env)).json();
  assert.equal(result.answer,'Which edition of the movie do you mean?');
 }finally{DB.close();}
});
