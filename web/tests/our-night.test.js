import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults} from '../product/catalog.js';
import {ingredients} from '../product/engine.js';
import {createOurNightUI} from '../product/our-night-view.js';
import {nightShortlist,nightPreferences,nightRitual,nightVibes,sharedPace,coupleRoles,repeatEveningDraft,chosenRitual,nightWelcome,sharedPaceCopy} from '../product/our-night.js';
const fixture=()=>{const DB=openDb(),env={DB,AI_PROVIDER:'catalog'};return {DB,async call(path,method='GET',data,key=''){const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json','x-household-key':key},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:r.status,data:await r.json()};}};};
test('night-in rhythm persists, isolates households, preserves capabilities and validates input',async()=>{
 const f=fixture();try{const a=(await f.call('household','POST',{})).data,b=(await f.call('household','POST',{})).data;
 const saved=await f.call('our-night','PUT',{day:'Friday',vibe:'Reconnect',prefs:{...defaults,people:2},options:{services:[],region:'US'}},a.key);
 assert.equal(saved.status,200);assert.deepEqual(saved.data.capabilities,a.capabilities);
 assert.equal((await f.call('household','GET',null,a.key)).data.ourNight.day,'Friday');
 assert.equal((await f.call('household','GET',null,b.key)).data.ourNight,undefined);
 assert.equal((await f.call('our-night','POST',{},b.key)).status,400);
 assert.equal((await f.call('our-night','PUT',{day:'bad',vibe:'Reconnect',prefs:defaults},a.key)).status,400);
 assert.equal((await f.call('our-night','PUT',{day:'Friday',vibe:'Reconnect',prefs:{...defaults,people:99}},a.key)).status,400);
 assert.equal((await f.call('our-night','DELETE',null,a.key)).status,200);
 assert.equal((await f.call('our-night','POST',{},a.key)).status,400);
 }finally{f.DB.close();}
});
test('night-in shortlist respects saved limits and current ingredient exclusions',async()=>{
 const f=fixture();try{const h=(await f.call('household','POST',{})).data;
 await f.call('preferences','PUT',{prefs:defaults,memory:{shorter:false,allergies:[],dislikedIngredients:['mushroom']}},h.key);
 await f.call('our-night','PUT',{day:'Saturday',vibe:'Unwind together',prefs:{...defaults,cookTime:15,watchTime:90,effort:'Easy'}},h.key);
 const r=await f.call('our-night','POST',{},h.key);assert.equal(r.status,200);assert.ok(r.data.picks.length>0);assert.ok(r.data.picks.length<=3);
 assert.ok(r.data.picks.every(p=>p.meal.minutes<=15&&p.show.minutes<=90&&p.meal.effort==='Easy'&&!p.meal.ingredients.some(i=>/mushroom/i.test(i[0]))));
 assert.equal(new Set(r.data.picks.map(p=>p.meal.id)).size,r.data.picks.length);
 assert.equal(new Set(r.data.picks.map(p=>p.show.id)).size,r.data.picks.length);
 const p=r.data.picks[0],saved=await f.call('nights','POST',{couplesNight:true,mealId:p.meal.id,showId:p.show.id,prefs:r.data.prefs,adapted:!!p.adapted,confirmed:ingredients(p.meal,r.data.prefs.people,p.adapted).map(i=>i.name)},h.key);
 assert.equal(saved.status,201);assert.equal(saved.data.ourNight.vibe,'Unwind together');
 await f.call('our-night','PUT',{day:'Friday',vibe:'Reconnect',prefs:defaults},h.key);
 const share=await f.call('nights/'+saved.data.id+'/share','POST',{},h.key);
 const phone=await f.call('shared/'+share.data.key);assert.equal(phone.data.ourNight.vibe,'Unwind together');
 }finally{f.DB.close();}
});
test('vibes only adjust soft preferences; opted-in feedback keeps stricter limits',()=>{
 for(const vibe of nightVibes){const p=nightPreferences({vibe,prefs:{...defaults,cookTime:15,watchTime:30,people:2,family:true,diet:'Plant-based'}},{shorter:true,preferredEffort:'Easy'});assert.equal(p.cookTime,15);assert.equal(p.watchTime,30);assert.equal(p.diet,'Plant-based');assert.equal(p.family,true);assert.equal(p.effort,'Easy');assert.equal(p.format,'TV episode');assert.ok(nightRitual(vibe).question);}
 assert.equal(nightPreferences({vibe:'Reconnect',prefs:defaults}).mood,'Romantic');
});
test('shortlist never manufactures favorites or new-history claims',()=>{
 const p=(m,s)=>({meal:{id:m,minutes:15,effort:'Easy'},show:{id:s},score:1});
 const pairs=[p('a','a'),p('b','b'),p('c','c')];
 const selected=nightShortlist(pairs,{memory:{favoriteMeals:['b']},nights:[{mealId:'a',showId:'a'}]});
 assert.equal(selected[0].meal.id,'b');assert.equal(selected[0].nightLabel,'A familiar favorite');
 assert.equal(selected[1].meal.id,'c');assert.equal(selected[1].nightLabel,'Something new');
 assert.equal(nightShortlist([],{}).length,0);
 assert.equal(nightShortlist([pairs[0]],{}).length,1);
});
test('night-in shared model stays identical on TV and browser',()=>{
 assert.equal(readFileSync(new URL('../product/our-night.js',import.meta.url),'utf8'),readFileSync(new URL('../../tv/src/catalog/our-night.js',import.meta.url),'utf8'));
});
test('browser setup saves edited rhythm and preserves the selected pair for review',async()=>{
 let house={prefs:defaults,memory:{},nights:[]},selection=null;
 const pair={meal:{id:'a',name:'Dinner',minutes:15},show:{id:'b',name:'A show'},nightLabel:'An easy start'};
 const ui=createOurNightUI({getHouse:()=>house,getPrefs:()=>defaults,setHouse:h=>house=h,render:()=>{},select:(p,prefs)=>selection={p,prefs},continueDinner:()=>{},qr:async()=>'',api:async(path,method,body)=>method==='PUT'?{...house,ourNight:body}:{picks:[pair],prefs:house.ourNight.prefs,learning:[]}});
 ui.actions['our-setting']({dataset:{field:'vibe',value:'Reconnect'}});
 ui.actions['our-setting']({dataset:{field:'cookTime',value:'15'}});
 assert.match(ui.page(),/<details class="panel" open>/);
 await ui.actions['our-save']();assert.equal(house.ourNight.vibe,'Reconnect');assert.equal(house.ourNight.prefs.cookTime,15);
 ui.actions['our-pick']({dataset:{index:'0'}});assert.equal(selection.p,pair);assert.equal(selection.prefs.people,2);
 ui.actions['our-question']();assert.match(ui.page(),/What made you feel cared for/);
});
test('couple voting rooms admit two guests and keep votes private until both submit',async()=>{
 const f=fixture();try{const h=(await f.call('household','POST',{})).data;
 const r=await f.call('rooms','POST',{name:'Our night in',maxMembers:2,prefs:defaults},h.key),k=r.data.key;
 assert.equal(r.status,201);assert.equal(r.data.room.maxMembers,2);
 const guest={name:'A',energy:'Keep it easy',mood:'Cozy',diet:'No preference',watchTime:120,format:'Any',avoid:[]};
 const a=(await f.call('room/'+k+'/join','POST',guest)).data;
 assert.equal((await f.call('rooms/'+k+'/match','POST',{},h.key)).status,400);
 const b=(await f.call('room/'+k+'/join','POST',{...guest,name:'B',energy:'Make it special'})).data;
 assert.equal((await f.call('room/'+k+'/join','POST',{...guest,name:'C'})).status,400);
 const m=await f.call('rooms/'+k+'/match','POST',{},h.key);assert.ok(m.data.picks.length);
 assert.equal(m.data.prefs.effort,'Easy');assert.ok(m.data.picks.every(p=>p.meal.effort==='Easy'&&p.meal.minutes<=30));
 assert.ok(m.data.members.every(member=>!('energy' in member)));
 const p=m.data.picks[0],choice=p.meal.id+':'+p.show.id;
 await f.call('room/'+k+'/vote','POST',{choice,memberKey:a.memberKey});
 assert.equal((await f.call('rooms/'+k+'/reveal','POST',{},h.key)).status,400);
 assert.deepEqual((await f.call('room/'+k)).data.votes,{});
 await f.call('room/'+k+'/vote','POST',{choice,memberKey:b.memberKey});
 const revealed=await f.call('rooms/'+k+'/reveal','POST',{},h.key);assert.equal(revealed.data.votes[choice],2);
 assert.ok(revealed.data.members.every(member=>!('energy' in member)));
 const saved=await f.call('nights','POST',{groupKey:k,mealId:p.meal.id,showId:p.show.id,prefs:m.data.prefs,adapted:!!p.adapted,confirmed:ingredients(p.meal,2,p.adapted).map(i=>i.name)},h.key);
 assert.equal(saved.status,201);assert.ok(saved.data.group.members.every(member=>!('energy' in member)));
 }finally{f.DB.close();}
});
test('shared energy respects the gentler preference without widening hard limits',()=>{
 const p={...defaults,cookTime:15,diet:'Plant-based',family:true,watchTime:30};
 const result=sharedPace(p,[{energy:'Make it special'},{energy:'Keep it easy'}]);
 assert.equal(result.energy,'Exhausted');assert.equal(result.effort,'Easy');assert.equal(result.cookTime,15);assert.equal(result.diet,p.diet);assert.equal(result.family,true);assert.equal(result.watchTime,30);
 assert.equal(sharedPace(p,[{energy:'Make it special'},{energy:'Up for cooking together'}]).energy,'Up for cooking');
 assert.equal(sharedPace(p,[{energy:'Make it special'},{energy:'Make it special'}]).energy,'Make it special');
 assert.equal(sharedPace(p,[{},{}]).effort,'Easy');
});
test('role swap changes suggested people without inventing new recipe steps',()=>{
 const a=coupleRoles(),b=coupleRoles(true);
 assert.equal(a[0].person,b[1].person);assert.equal(a[1].person,b[0].person);
 assert.equal(a[0].task,b[0].task);assert.match(a[0].task,/Follow the recipe/);assert.match(a[1].task,/No extra recipe/);
});
test('repeat starts an unconfirmed draft without copying old timing or room access',()=>{
 const n={id:'old',mealId:'a',showId:'b',prefs:{...defaults},adapted:true,ourNight:{vibe:'Reconnect'},planStart:123,timer:345,step:3,status:'complete',watchStarted:234,groupKey:'old-room',confirmed:['old ingredient']};
 const d=repeatEveningDraft(n);assert.deepEqual(d.confirmed,[]);assert.equal(d.adapted,true);assert.equal(d.couplesNight,true);assert.deepEqual(d.pair,{mealId:'a',showId:'b'});
 for(const k of ['id','planStart','timer','step','watchStarted','status','groupKey'])assert.ok(!(k in d));
 d.prefs.people=4;assert.equal(n.prefs.people,2);assert.deepEqual(n.confirmed,['old ingredient']);
});
test('favorite rituals are independent of mood and no-prompts is explicit',()=>{
 assert.equal(chosenRitual({vibe:'Reconnect',ritualChoice:'No prompts'}),null);
 assert.deepEqual(chosenRitual({vibe:'Reconnect',ritualChoice:'Playful date'}),nightRitual('Playful date'));
 assert.deepEqual(chosenRitual({vibe:'Reconnect'}),nightRitual('Reconnect'));
 assert.equal(nightWelcome('Friday'),'Friday, just us.');assert.equal(nightWelcome('Any day'),'A little time, just us.');
 assert.match(sharedPaceCopy({effort:'Easy'}),/An easy dinner/);
});
test('ritual preference persists through old clients and is validated without changing matching prefs',async()=>{
 const f=fixture();try{const h=(await f.call('household','POST',{})).data,payload={day:'Friday',vibe:'Reconnect',prefs:defaults};
 const a=await f.call('our-night','PUT',{...payload,ritualChoice:'No prompts'},h.key);assert.equal(a.status,200);
 const b=await f.call('our-night','PUT',payload,h.key);assert.equal(b.data.ourNight.ritualChoice,'No prompts');assert.deepEqual(b.data.ourNight.prefs,defaults);
 assert.equal((await f.call('our-night','PUT',{...payload,ritualChoice:'unrecognized'},h.key)).status,400);
 const r=await f.call('our-night','POST',{},h.key),p=r.data.picks[0];assert.ok(p);
 const n=await f.call('nights','POST',{couplesNight:true,mealId:p.meal.id,showId:p.show.id,prefs:r.data.prefs,adapted:!!p.adapted,confirmed:ingredients(p.meal,r.data.prefs.people,p.adapted).map(i=>i.name)},h.key);
 assert.equal(n.data.ourNight.ritualChoice,'No prompts');
 }finally{f.DB.close();}
});
