import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults} from '../product/catalog.js';
import {ingredients} from '../product/engine.js';
import {titleKey} from '../product/identity.js';
function fixture(){const DB=openDb(),env={DB,AI_PROVIDER:'catalog'};return {DB,async call(path,method='GET',data,key=''){const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json','x-household-key':key},...(data?{body:JSON.stringify(data)}:{})}),env);return {status:r.status,data:await r.json()};}};}
test('three ways retain the selected story, saved limits and exclusions',async()=>{
 const {DB,call}=fixture();try{const key=(await call('household','POST',{})).data.key;
 assert.equal((await call('our-night/ways','POST',{showId:'before-sunrise'},key)).status,400);
 const prefs={...defaults,cookTime:45,watchTime:180,people:2};
 await call('our-night','PUT',{day:'Friday',vibe:'Reconnect',prefs,options:{region:'US',services:[],connectionMode:'Mood'}},key);
 const response=await call('our-night/ways','POST',{showId:'before-sunrise'},key);assert.equal(response.status,200);
 const pairs=response.data.ways.map(w=>w.pair).filter(Boolean);assert.ok(pairs.length);assert.equal(new Set(pairs.map(p=>p.meal.id)).size,pairs.length);
 assert.ok(pairs.every(p=>titleKey(p.show)===titleKey('before-sunrise')&&p.meal.minutes<=45&&p.show.minutes<=180));
 const easy=response.data.ways[0].pair;if(easy){assert.equal(easy.meal.effort,'Easy');assert.ok(easy.meal.minutes<=30);}
 const rejected=pairs[0];const saved=await call('nights','POST',{mealId:rejected.meal.id,showId:rejected.show.id,prefs:response.data.prefs,adapted:!!rejected.adapted,confirmed:ingredients(rejected.meal,2,!!rejected.adapted).map(i=>i.name)},key);assert.equal(saved.status,201);assert.equal((await call('nights/'+saved.data.id+'/feedback','POST',{meal:'skip',pairing:'okay',shorter:false,rememberMood:false},key)).status,200);
 const filtered=await call('our-night/ways','POST',{showId:'before-sunrise'},key);assert.ok(filtered.data.ways.every(w=>!w.pair||w.pair.meal.id!==pairs[0].meal.id));
 assert.equal((await call('our-night/ways','POST',{},key)).status,400);
 const missing=await call('our-night/ways','POST',{showId:'unknown-title'},key);assert.ok(missing.data.ways.every(w=>w.pair===null));
 }finally{DB.close();}
});
test('finishing touches are opt-in, per-member and absent from shared room data',async()=>{
 const {DB,call}=fixture();try{const host=(await call('household','POST',{})).data.key;
 const created=await call('rooms','POST',{maxMembers:2,prefs:{...defaults,cookTime:60,watchTime:180}},host);const room=created.data.key;
 const input={name:'Alex',mood:'Cozy',diet:'No preference',watchTime:180,format:'Any',avoid:[]};
 const a=(await call('room/'+room+'/join','POST',input)).data.memberKey,b=(await call('room/'+room+'/join','POST',{...input,name:'Sam'})).data.memberKey;
 assert.equal((await call('room/'+room+'/touch','POST',{memberKey:a})).status,409);
 const matched=await call('rooms/'+room+'/match','POST',{},host);assert.equal(matched.status,200);assert.ok(matched.data.picks.length);
 const pair=matched.data.picks[0],choice=pair.meal.id+':'+pair.show.id;
 await call('room/'+room+'/vote','POST',{memberKey:a,choice});await call('room/'+room+'/vote','POST',{memberKey:b,choice});
 await call('rooms/'+room+'/reveal','POST',{},host);
 assert.equal((await call('room/'+room+'/touch','POST',{})).status,403);
 assert.equal((await call('room/'+room+'/touch','POST',{memberKey:'f'.repeat(64)})).status,403);
 const one=await call('room/'+room+'/touch','POST',{memberKey:a}),two=await call('room/'+room+'/touch','POST',{memberKey:b});
 assert.equal(one.status,200);assert.equal(one.data.optional,true);assert.notEqual(one.data.touch.title,two.data.touch.title);
 assert.deepEqual((await call('room/'+room+'/touch','POST',{memberKey:a})).data,one.data);
 const shared=JSON.stringify((await call('room/'+room)).data);assert.ok(!shared.includes(one.data.touch.text));assert.ok(!shared.includes(a));assert.ok(!shared.includes(b));
 await DB.prepare('UPDATE rooms SET expires=?').bind(0).run();assert.equal((await call('room/'+room+'/touch','POST',{memberKey:a})).status,404);
 }finally{DB.close();}
});
