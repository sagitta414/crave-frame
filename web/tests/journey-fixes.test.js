import test from 'node:test';
import assert from 'node:assert/strict';
import {orderBrief,delayEvening,readyTogetherPlan} from '../product/evening.js';
import {mealById,defaults} from '../product/catalog.js';
import {foodReferences} from '../server/food-references.js';
import {aiRequest} from '../server/ai.js';
import {openDb} from '../server/local-db.js';
test('takeout searches preserve dish format without asserting speed or a ranked match',()=>{
 const tuna=orderBrief({name:'Tuna & sweetcorn rice bowls',category:'Rice bowls'});
 assert.equal(tuna.strategies[0].query,'tuna rice bowls');
 assert.ok(tuna.strategies.every(x=>!/fastest|best|closest|strongest/i.test(x.label+' '+x.detail)));
 assert.match(orderBrief({name:'Chicken quesadillas'}).strategies[0].query,/quesadilla/);
});
test('a cooking delay preserves the live step and timer and moves serving later',()=>{
 const now=10e6,n={status:'cooking',mealId:'garlic-toast',planStart:now-1e6,cookingStartedAt:now-1e6,step:1,timer:now+10000,dinnerMinutes:25};
 const delayed=delayEvening(n,30,now),meal=mealById(n.mealId),show={minutes:90};
 assert.equal(delayed.step,n.step);assert.equal(delayed.timer,n.timer);assert.equal(delayed.cookingStartedAt,n.cookingStartedAt);
 assert.ok(readyTogetherPlan(delayed,meal,show,[],now).schedule[2].at>=now+30*60000);
 const later=now+45*60000,shortDelay=delayEvening(n,15,now,later);
 assert.equal(readyTogetherPlan(shortDelay,meal,show,[],now).schedule[2].at,later+15*60000);
 assert.throws(()=>delayEvening({...n,watchStarted:now},30,now));
});
test('The Bear first-season premise supports a sourced interpretation even if the model misses it',async()=>{
 const DB=await openDb(':memory:');try{
 const show={id:'tmdb-tv-136315-1-1',name:'The Bear — S1 E1: System',provider:{type:'tv',id:136315,season:1,episode:1},source:'https://www.themoviedb.org/tv/136315',kind:'TV episode',minutes:28,mood:'Cozy',cuisine:'Any',description:'A chef returns to run the family business.'};
 const prefs={...defaults,watchTime:180,cookTime:30,family:false};
 const r=await aiRequest(new Request('https://example.test/api/ai',{method:'POST',body:JSON.stringify({mode:'plan',prompt:'Find a dinner for this episode.',showId:show.id,prefs})}),{DB,AI_GENERATE:async(_,input)=>input.allowedPairs?{picks:input.allowedPairs.filter(id=>!id.includes('grilled-cheese')).slice(0,3).map(id=>({id,pairingType:'practical'}))}:{reviews:[]}}, {titles:[show],prefs,memory:{},nights:[],pantry:[]},'bear-review',0);
 const interpretation=r.picks.find(p=>p.evidenceSource?.includes('disneyplus'));
 assert.ok(interpretation);assert.equal(interpretation.pairingType,'setting');assert.match(interpretation.tableEcho,/not a dish verified/);
 assert.equal(foodReferences({...show,name:'The Bear — S2 E1: Beef',provider:{...show.provider,season:2}}).length,0);
 }finally{DB.close();}
});
