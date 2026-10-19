import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults,mealById,showById} from '../product/catalog.js';
import {ingredients,recipeSteps} from '../product/engine.js';
import {readyTogetherPlan} from '../product/evening.js';
import {projectEvening} from '../../tv/src/schedule.js';
import {eligiblePairs,aiPreferences} from '../server/ai.js';
import {curated} from '../server/social.js';
test('catalog and AI candidates honor the whole evening budget including time to eat',async()=>{
 const prefs={...defaults,eveningMinutes:90,watchTime:180,cookTime:45},house={prefs,memory:{},pantry:[],nights:[],titles:[]};
 const ai=eligiblePairs(house,prefs),catalog=await curated({},house,{prefs,personalized:true});
 assert.ok(ai.length);assert.ok(catalog.picks.length);
 for(const pair of [...ai,...catalog.picks])assert.ok(pair.meal.minutes+25+pair.show.minutes<=90);
 assert.equal(aiPreferences({eveningMinutes:120}).eveningMinutes,120);
 assert.equal(aiPreferences({eveningMinutes:-9}).eveningMinutes,0);
});
test('phone search links expose only a single search and preserve household isolation',async()=>{
 const DB=openDb(),env={DB,AI_PROVIDER:'catalog'};
 try{
 const household=async()=> (await api(new Request('https://test/api/household',{method:'POST'}),env)).json();
 const a=await household(),b=await household();
 const call=(path,method='GET',body,key)=>api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},...(body?{body:JSON.stringify(body)}:{})}),env);
 const link=await (await call('companion','POST',{kind:'search'},a.key)).json();
 const view=await (await call('companion-link/'+link.key)).json();
 assert.deepEqual(Object.keys(view).sort(),['expires','kind','query']);
 assert.equal((await call('companion-link/'+link.key+'/confirm','POST',{query:'x'.repeat(81)})).status,400);
 assert.equal((await call('companion-link/'+link.key+'/confirm','POST',{query:'Paddington'})).status,200);
 assert.equal((await call('companion-link/'+link.key+'/confirm','POST',{query:'Paddington'})).status,200);
 assert.equal((await call('companion-link/'+link.key+'/confirm','POST',{query:'Other'})).status,409);
 const ah=await (await call('household','GET',null,a.key)).json(),bh=await (await call('household','GET',null,b.key)).json();
 assert.equal(ah.searchHandoffs[0].query,'Paddington');assert.equal(bh.searchHandoffs,undefined);
 assert.equal((await call('companion-link/'+link.key+'/identify','POST',{image:'unexpected'})).status,405);
 DB.prepare('UPDATE shares SET expires = ?').bind(1).run();
 assert.equal((await call('companion-link/'+link.key)).status,404);
 }finally{DB.close();}
});
test('finish targets and explicit preparation allowance persist without changing recipe timers',async()=>{
 const DB=openDb(),env={DB,AI_PROVIDER:'catalog'};
 try{
 const h=await (await api(new Request('https://test/api/household',{method:'POST'}),env)).json();
 const call=async(path,method='GET',body)=>api(new Request('https://test/api/'+path,{method,headers:{'x-household-key':h.key,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})}),env);
 const meal=mealById('pepper-pasta'),show=showById('ratatouille');
 const created=await call('nights','POST',{mealId:meal.id,showId:show.id,prefs:defaults,adapted:false,confirmed:ingredients(meal,2,false).map(i=>i.name)});
 assert.equal(created.status,201);const night=await created.json(),target=Date.now()+3*3600000;
 assert.equal((await call('nights/'+night.id,'PATCH',{finishBy:-1})).status,400);
 assert.equal((await call('nights/'+night.id,'PATCH',{timingAllowanceMinutes:900})).status,400);
 assert.equal((await call('nights/'+night.id,'PATCH',{finishBy:target})).status,200);
 const saved=await (await call('nights/'+night.id,'PATCH',{timingAllowanceMinutes:15})).json();
 assert.equal(saved.finishBy,target);assert.equal(saved.timingAllowanceMinutes,15);
 const steps=recipeSteps(meal,false,'Regular',2),before=readyTogetherPlan(night,meal,show,steps),after=readyTogetherPlan(saved,meal,show,steps);
 assert.equal(after.schedule[2].at-before.schedule[2].at,15*60000);
 assert.equal(after.schedule[4].at-before.schedule[4].at,15*60000);
 assert.deepEqual(projectEvening(saved,meal,show).schedule,after.schedule);
 assert.deepEqual(saved.steps.map(x=>x.seconds),steps.map(x=>x.seconds));
 assert.equal((await call('nights/'+night.id,'PATCH',{step:0})).status,200);
 assert.equal((await call('nights/'+night.id,'PATCH',{timingAllowanceMinutes:10})).status,400);
 assert.equal((await call('nights/'+night.id+'/feedback','POST',{meal:'okay',pairing:'okay',shorter:false,rememberMood:false,reason:'invented'})).status,400);
 const feedback=await (await call('nights/'+night.id+'/feedback','POST',{meal:'okay',pairing:'okay',shorter:false,rememberMood:false,reason:'effort',timing:'longer',preferEasy:true})).json();
 assert.equal(feedback.nights[0].feedback.timing,'longer');assert.equal(feedback.memory.preferredEffort,'Easy');assert.equal(feedback.capabilities.matchingMode,'catalog');
 }finally{DB.close();}
});
