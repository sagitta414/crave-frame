import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults,mealById} from '../product/catalog.js';
import {ingredients} from '../product/engine.js';
import {mealPhoto} from '../product/meal-photos.js';

test('stale screens and repeated commands preserve completed, delivery, and viewing state',async()=>{
 const DB=openDb(),env={DB,AI_PROVIDER:'catalog'};let key='';
 const call=async(path,method='GET',body)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'x-household-key':key},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:r.status,data:await r.json()};};
 try{
  key=(await call('household','POST')).data.key;
  const meal=mealById('pepper-pasta'),input={mealId:meal.id,showId:'ratatouille',prefs:defaults,adapted:false,confirmed:ingredients(meal,defaults.people,false).map(i=>i.name)};
  const n=(await call('nights','POST',input)).data,path='nights/'+n.id;
  const share=(await call(path+'/share','POST')).data.key;
  await call(path,'PATCH',{step:0});
  const timer=Date.now()+60000;await call(path,'PATCH',{timer});
  const repeated=await call('shared/'+share,'PATCH',{step:0});assert.equal(repeated.data.timer,timer);
  const ready=(await call(path,'PATCH',{complete:true})).data;
  await new Promise(resolve=>setTimeout(resolve,5));
  assert.equal((await call('shared/'+share,'PATCH',{complete:true})).data.readyAt,ready.readyAt);
  for(const patch of [{step:0},{timer:Date.now()+60000}])assert.equal((await call('shared/'+share,'PATCH',patch)).status,409);
  assert.equal((await call(path)).data.status,'ready');
  const started=(await call(path,'PATCH',{watchStarted:true})).data.watchStarted;
  await new Promise(resolve=>setTimeout(resolve,5));
  assert.equal((await call(path,'PATCH',{watchStarted:true})).data.watchStarted,started);
  await call(path+'/feedback','POST',{meal:'again',pairing:'great',shorter:false,rememberMood:false});
  assert.equal((await call(path,'PATCH',{complete:true})).data.status,'complete');
  assert.equal((await call(path,'PATCH',{step:0})).status,409);
  const d=(await call('nights','POST',{...input,fulfillment:'delivery',orderOut:{provider:'doordash',etaMinutes:30,placedAt:Date.now()}})).data;
  const dshare=(await call('nights/'+d.id+'/share','POST')).data.key;
  for(const patch of [{step:0},{timer:Date.now()+60000},{complete:true}])for(const url of ['nights/'+d.id,'shared/'+dshare])assert.equal((await call(url,'PATCH',patch)).status,409);
  assert.equal((await call('nights/'+d.id)).data.status,'planned');
 }finally{DB.close();}
});
test('unillustrated recipes never borrow unrelated category food photos',()=>{
 assert.equal(mealPhoto({id:'missing',image:'pizza'}),'/app/images/recipe-placeholder.svg');
 assert.match(mealPhoto(mealById('mac-cheese-peas')),/mac-cheese-peas-v2.jpg/);
});
