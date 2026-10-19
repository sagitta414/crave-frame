import test from 'node:test';
import assert from 'node:assert/strict';
import {canApplyNightPoll} from '../product/night-sync.js';
import {requestJson} from '../product/request-json.js';
import {readinessKey,readinessMarkup} from '../product/cooking-readiness.js';
import {defaults,mealById} from '../product/catalog.js';
import {pairingConnection} from '../product/planning.js';

test('late polling cannot replace a local edit, navigation, or pending mutation',()=>{
 const original={id:'night',step:1};
 assert.equal(canApplyNightPoll(original,original,2,2,false),true);
 assert.equal(canApplyNightPoll(original,{...original,step:2},2,2,false),false);
 assert.equal(canApplyNightPoll(original,original,2,3,false),false);
 assert.equal(canApplyNightPoll(original,original,2,2,true),false);
});
test('preparation checks survive unchanged-plan refreshes but use a different key for recipe changes',()=>{
 const n={id:'night',mealId:'mac-cheese-peas',prefs:defaults};
 const html=readinessMarkup(n,mealById(n.mealId),[0,1,2]);
 assert.equal((html.match(/ checked>/g)||[]).length,3);
 assert.doesNotMatch(html,/data-action="cook-start" disabled/);
 assert.match(readinessMarkup(n,mealById(n.mealId),[0]),/data-action="cook-start" disabled/);
 assert.notEqual(readinessKey(n),readinessKey({...n,adapted:true}));
 assert.notEqual(readinessKey(n),readinessKey({...n,prefs:{...defaults,people:4}}));
});
test('requests return server errors and bound stalled reads and writes without automatic replay',async()=>{
 assert.deepEqual(await requestJson('/ok',{},100,async()=>({ok:true,json:async()=>({saved:true})})),{saved:true});
 await assert.rejects(requestJson('/bad',{},100,async()=>({ok:false,json:async()=>({error:'Expired link'})})),/Expired link/);
 const stalled=async(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('aborted'))));
 await assert.rejects(requestJson('/slow',{},5,stalled),/timed out. Please try again/);
 await assert.rejects(requestJson('/save',{method:'PATCH'},5,stalled),/Check your saved progress/);
});
test('pairing explanation uses sourced inspiration only when the selected dish fits',()=>{
 const show={id:'avengers',name:'The Avengers',mood:'Adventure'};
 const inspired=pairingConnection(mealById('turkey-pita-pockets'),show);
 assert.equal(inspired.label,'Story inspired');
 assert.match(inspired.text,/not the film recipe/);
 assert.ok(inspired.source);
 assert.equal(pairingConnection(mealById('mac-cheese-peas'),show).label,'Mood pairing');
});
