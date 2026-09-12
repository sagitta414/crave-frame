import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults,mealById,showById} from '../product/catalog.js';
import {ingredients} from '../product/engine.js';
import {curate,scheduleDinner} from '../product/curation.js';
import {catalogRequest} from '../server/catalog.js';
const fixture=()=>{const DB=openDb(),files=new Map(),env={DB,MEDIA:{put:async(k,v)=>files.set(k,v),get:async k=>files.has(k)?{body:files.get(k)}:null,delete:async k=>files.delete(k)}};return {DB,async call(path,method='GET',data,key=''){const r=await api(new Request('https://cf.test/api/'+path,{method,headers:{'content-type':'application/json','x-household-key':key,origin:'https://cf.test'},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:r.status,data:r.headers.get('content-type')?.includes('json')?await r.json():await r.arrayBuffer()};}};};
test('group links isolate households; voting requires guest keys and unanimous submission before reveal',async()=>{
 const f=fixture();try{const owner=(await f.call('household','POST',{})).data.key,other=(await f.call('household','POST',{})).data.key;
 const created=await f.call('rooms','POST',{prefs:{...defaults,cookTime:60,watchTime:180}},owner);assert.equal(created.status,201);const k=created.data.key;
 const b={name:'A',mood:'Cozy',diet:'Vegetarian',watchTime:180,format:'Any',avoid:['mushroom']};
 const a=await f.call('room/'+k+'/join','POST',b);const guest2=await f.call('room/'+k+'/join','POST',{...b,name:'B',mood:'Adventure'});assert.equal(a.status,200);assert.ok(a.data.memberKey);
 assert.equal((await f.call('rooms/'+k+'/match','POST',{},other)).status,403);
 const matched=await f.call('rooms/'+k+'/match','POST',{},owner);assert.equal(matched.data.picks.length,3);assert.ok(matched.data.picks.every(p=>p.meal.ingredients.every(i=>!i[0].toLowerCase().includes('mushroom'))));
 const view=(await f.call('room/'+k)).data;assert.ok(!JSON.stringify(view).includes(a.data.memberKey));assert.ok(!JSON.stringify(view).includes(owner));assert.ok(!view.members[0].token);
 const choice=view.picks[0].meal.id+':'+view.picks[0].show.id;
 assert.equal((await f.call('room/'+k+'/vote','POST',{choice,memberKey:'0'.repeat(64)})).status,403);
 await f.call('room/'+k+'/vote','POST',{choice,memberKey:a.data.memberKey});assert.equal((await f.call('rooms/'+k+'/reveal','POST',{},owner)).status,400);
 await f.call('room/'+k+'/vote','POST',{choice,memberKey:guest2.data.memberKey});assert.equal((await f.call('rooms/'+k+'/reveal','POST',{},owner)).data.phase,'revealed');
 await f.call('rooms/'+k+'/reopen','POST',{},owner);assert.equal((await f.call('room/'+k)).data.picks.length,0);
 }finally{f.DB.close();}
});
test('group dietary contradictions produce no false compromise',()=>{const members=[{diet:'Meat & poultry',watchTime:180,format:'Any',mood:'Cozy',avoid:[]},{diet:'Vegetarian',watchTime:180,format:'Any',mood:'Cozy',avoid:[]}];assert.equal(curate({prefs:{...defaults,cookTime:60,watchTime:180},members}).length,0);});
test('on-screen mode has a sourced actual dish and does not invent connections',()=>{const a=curate({mode:'watch',sourceId:'ratatouille',prefs:{...defaults,cookTime:60,watchTime:180},connectionMode:'On-screen food'});assert.equal(a.length,1);assert.equal(a[0].meal.id,'story-ratatouille');assert.ok(a[0].connection.source);assert.equal(curate({mode:'watch',sourceId:'avengers',prefs:{...defaults,cookTime:60,watchTime:180},connectionMode:'On-screen food'}).length,0);});
test('deadline calculation includes prep once and rejects impossible times',()=>{const now=Date.now(),m={minutes:30},at=now+90*60000;const n=scheduleDinner({},m,new Date(at).toISOString(),25,now);assert.equal(n.planStart,at-30*60000);assert.throws(()=>scheduleDinner({},m,new Date(now+10*60000).toISOString(),25,now));});
test('delay action moves only the schedule and records the visible change',async()=>{
 const f=fixture();try{const key=(await f.call('household','POST',{})).data.key,m=mealById('mushroom-toast');const saved=(await f.call('nights','POST',{mealId:m.id,showId:'last-guest',prefs:defaults,adapted:true,confirmed:ingredients(m,2,true).map(x=>x.name)},key)).data;
 const delayed=await f.call('nights/'+saved.id,'PATCH',{delayMinutes:30},key);assert.equal(delayed.status,200);assert.equal(delayed.data.mealId,saved.mealId);assert.equal(delayed.data.showId,saved.showId);assert.equal(delayed.data.scheduleChange.minutes,30);assert.ok(delayed.data.planStart>=saved.planStart+30*60000);
 assert.equal((await f.call('nights/'+saved.id,'PATCH',{delayMinutes:25},key)).status,400);
 }finally{f.DB.close();}
});
test('order-out action preserves the pairing and saves a delivery-aware schedule',async()=>{
 const f=fixture();try{const key=(await f.call('household','POST',{})).data.key,m=mealById('mushroom-toast');const saved=(await f.call('nights','POST',{mealId:m.id,showId:'last-guest',prefs:defaults,adapted:true,confirmed:ingredients(m,2,true).map(x=>x.name)},key)).data;
 const ordered=await f.call('nights/'+saved.id,'PATCH',{orderOut:{etaMinutes:35,provider:'doordash'}},key);assert.equal(ordered.status,200);assert.equal(ordered.data.mealId,saved.mealId);assert.equal(ordered.data.showId,saved.showId);assert.equal(ordered.data.fulfillment,'delivery');assert.equal(ordered.data.orderPlan.etaMinutes,35);assert.equal(ordered.data.orderPlan.provider,'doordash');assert.equal(ordered.data.scheduleChange.kind,'order-out');assert.ok(ordered.data.orderPlan.watchAt>=ordered.data.orderPlan.arrivalAt+25*60000);
 const exact=await f.call('nights/'+saved.id,'PATCH',{orderOut:{etaMinutes:42,provider:'doordash',strategy:'fastest',query:'vegetarian bistro',budget:'$28–$48'}},key);assert.equal(exact.status,200);assert.equal(exact.data.orderPlan.etaMinutes,42);assert.equal(exact.data.orderPlan.strategy,'fastest');assert.equal((await f.call('household','GET',null,key)).data.orderPreferences.provider,'doordash');assert.equal((await f.call('nights/'+saved.id,'PATCH',{orderOut:{etaMinutes:10,provider:'doordash'}},key)).status,400);const cooking=await f.call('nights/'+saved.id,'PATCH',{fulfillment:'cook'},key);assert.equal(cooking.status,200);assert.equal(cooking.data.fulfillment,undefined);assert.equal(cooking.data.orderPlan,undefined);
 }finally{f.DB.close();}
});
test('a pairing can start in order-out mode without recipe confirmation',async()=>{
 const f=fixture();try{const key=(await f.call('household','POST',{})).data.key,m=mealById('mushroom-toast');const ordered=await f.call('nights','POST',{mealId:m.id,showId:'last-guest',prefs:defaults,adapted:false,confirmed:[],fulfillment:'delivery',orderOut:{etaMinutes:35,provider:'ubereats'}},key);assert.equal(ordered.status,201);assert.equal(ordered.data.fulfillment,'delivery');assert.equal(ordered.data.confirmed.length,0);assert.equal(ordered.data.orderPlan.etaMinutes,35);assert.equal(ordered.data.orderPlan.provider,'ubereats');
 }finally{f.DB.close();}
});
test('private order handoff moves provider choice and exact ETA from phone to TV',async()=>{
 const f=fixture();try{const key=(await f.call('household','POST',{})).data.key,meal=mealById('mushroom-toast'),show=showById('last-guest');const created=await f.call('companion','POST',{kind:'order',strategy:'fastest',draft:{mealId:meal.id,showId:show.id,show,prefs:defaults,adapted:true}},key);assert.equal(created.status,200);assert.equal(created.data.kind,'order');
 const phone=await f.call('companion-link/'+created.data.key);assert.equal(phone.status,200);assert.equal(phone.data.kind,'order');assert.equal(phone.data.selectedStrategy,'fastest');assert.equal(phone.data.strategies.length,3);assert.ok(phone.data.budget.startsWith('$'));
 const confirmed=await f.call('companion-link/'+created.data.key+'/confirm','POST',{provider:'ubereats',strategy:'fastest',etaMinutes:42});assert.equal(confirmed.status,200);assert.equal(confirmed.data.confirmation.etaMinutes,42);assert.equal(confirmed.data.confirmation.provider,'ubereats');assert.equal((await f.call('household','GET',null,key)).data.nights.length,0);assert.equal((await f.call('companion-link/'+created.data.key+'/confirm','POST',{provider:'ubereats',strategy:'fastest',etaMinutes:121})).status,400);
 }finally{f.DB.close();}
});
test('saved scheduling syncs to phone and collections revoke access without sharing household state',async()=>{
 const f=fixture();try{const key=(await f.call('household','POST',{})).data.key,other=(await f.call('household','POST',{})).data.key,m=mealById('mushroom-toast');const saved=await f.call('nights','POST',{mealId:m.id,showId:'last-guest',prefs:defaults,adapted:true,confirmed:ingredients(m,2,true).map(x=>x.name)},key);const n=saved.data;assert.equal(saved.status,201);
 const share=(await f.call('nights/'+n.id+'/share','POST',{},key)).data.key;
 const at=new Date(Date.now()+3*3600000).toISOString();assert.equal((await f.call('schedule','POST',{nightId:n.id,dinnerAt:at,dinnerMinutes:30},other)).status,404);const scheduled=await f.call('schedule','POST',{nightId:n.id,dinnerAt:at,dinnerMinutes:30},key);assert.equal(scheduled.status,200);assert.equal((await f.call('shared/'+share)).data.planStart,Date.parse(at)-m.minutes*60000);
 const c=(await f.call('collections','POST',{nightId:n.id,name:'Quiet night',notes:'A favorite'},key)).data;assert.equal((await f.call('collection-share/'+c.key)).status,404);assert.equal((await f.call('collections/'+c.key,'PUT',{name:'Changed',notes:'',shared:true},other)).status,404);
 await f.call('collections/'+c.key,'PUT',{name:c.name,notes:c.notes,shared:true},key);const publicEntry=(await f.call('collection-share/'+c.key)).data;assert.ok(publicEntry.meal);assert.ok(!JSON.stringify(publicEntry).includes(key));assert.ok(!publicEntry.memory);
 assert.equal((await f.call('collections/'+c.key+'/photo','PUT',{jpeg:'data:image/jpeg;base64,AAAA'},key)).status,400);
 assert.equal((await f.call('collection-editor/'+c.key+'?editKey='+other)).status,403);
 assert.equal((await f.call('collection-editor/'+c.key+'?editKey='+c.editKey)).status,200);
 const uploaded=await f.call('collection-editor/'+c.key,'PUT',{editKey:c.editKey,jpeg:'data:image/jpeg;base64,/9j/2Q=='});assert.equal(uploaded.status,200);assert.equal((await f.call('photo/'+uploaded.data.photo)).status,200);assert.ok(!(await f.call('collection-share/'+c.key)).data.editKey);
 await f.call('collections/'+c.key,'PUT',{name:c.name,notes:c.notes,shared:false},key);assert.equal((await f.call('collection-share/'+c.key)).status,404);
 }finally{f.DB.close();}
});
test('streaming search excludes rental-only listings and respects region (mocked TMDB)',async()=>{
 const original=globalThis.fetch;let regional=false;globalThis.fetch=async url=>{url=String(url);if(url.includes('search/multi'))return Response.json({results:[{id:1,media_type:'movie',title:'Included'},{id:2,media_type:'movie',title:'Rent only'}]});return Response.json({results:{US:url.includes('/movie/1/')?{flatrate:[{provider_id:8,provider_name:'Netflix'}],link:'https://www.themoviedb.org/movie/1/watch'}:{rent:[{provider_id:8,provider_name:'Netflix'}]}}});};try{const r=await catalogRequest(new URL('https://cf.test/api/catalog/search?q=test&region=US&services=8'),{TMDB_ACCESS_TOKEN:'test'});assert.equal(r.results.length,1);assert.equal(r.results[0].name,'Included');const gb=await catalogRequest(new URL('https://cf.test/api/catalog/search?q=test&region=GB&services=8'),{TMDB_ACCESS_TOKEN:'test'});assert.equal(gb.results.length,0);}finally{globalThis.fetch=original;}
});
