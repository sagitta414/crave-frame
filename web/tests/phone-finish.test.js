import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults,mealById} from '../product/catalog.js';

test('cooking link can save only its own private edition without exposing collection credentials',async()=>{
 const DB=openDb();let key='';
 const call=async(path,method='GET',body,auth=key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json','x-household-key':auth},...(body?{body:JSON.stringify(body)}:{})}),{DB,AI_PROVIDER:'catalog'});return {status:r.status,data:await r.json()};};
 try{
  key=(await call('household','POST',{})).data.key;
  const create=async()=> (await call('nights','POST',{mealId:'chickpea-pasta',showId:'grand-budapest',prefs:defaults,adapted:false,confirmed:mealById('chickpea-pasta').ingredients.map(i=>i[0])})).data;
  const n=await create(),other=await create(),share=(await call('nights/'+n.id+'/share','POST',{})).data.key;
  assert.equal((await call('shared/'+share+'/edition','POST',{name:'Our night'},'')).status,400);
  await call('nights/'+n.id,'PATCH',{complete:true});await call('nights/'+n.id,'PATCH',{watchStarted:true});
  await call('shared/'+share,'PATCH',{edition:{person:1,text:'We laughed.',skip:false}},'');
  await call('shared/'+share,'PATCH',{edition:{person:2,skip:true}},'');
  const saved=await call('shared/'+share+'/edition','POST',{name:'Our night',nightId:other.id,shared:true},'');
  assert.equal(saved.status,200);assert.deepEqual(saved.data,{saved:true});
  await call('shared/'+share+'/edition','POST',{name:'Our night'},'');
  const cards=(await call('collections')).data.collections;assert.equal(cards.length,1);assert.equal(cards[0].sourceNightId,n.id);assert.equal(cards[0].shared,false);
  const card=cards[0];await call('collections/'+card.key,'PUT',{name:card.name,notes:card.notes,shared:true});
  assert.equal((await call('shared/'+share+'/edition','POST',{name:'Another title'},'')).status,409);
  await DB.prepare('UPDATE shares SET expires=?').bind(0).run();
  assert.equal((await call('shared/'+share+'/edition','POST',{name:'Expired'},'')).status,404);
 }finally{DB.close();}
});

test('phone ETA changes preserve provider and placement, reject invalid or no-longer-editable plans',async()=>{
 const DB=openDb();let key='';
 const call=async(path,method='GET',body,auth=key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json','x-household-key':auth},...(body?{body:JSON.stringify(body)}:{})}),{DB,AI_PROVIDER:'catalog'});return {status:r.status,data:await r.json()};};
 try{
  key=(await call('household','POST',{})).data.key;
  const placedAt=Date.now()-60000;
  const n=(await call('nights','POST',{mealId:'chickpea-pasta',showId:'grand-budapest',prefs:defaults,adapted:false,fulfillment:'delivery',orderOut:{etaMinutes:35,provider:'ubereats',placedAt,confirmationId:'phone-test'}})).data;
  const share=(await call('nights/'+n.id+'/share','POST',{})).data.key,path='shared/'+share;
  for(const value of [0,-1,121,20.5,'30'])assert.equal((await call(path,'PATCH',{deliveryEtaMinutes:value},'')).status,400);
  const before=Date.now(),result=await call(path,'PATCH',{deliveryEtaMinutes:5,orderOut:{provider:'doordash'}},'');
  assert.equal(result.status,200);assert.equal(result.data.orderPlan.provider,'ubereats');assert.equal(result.data.orderPlan.placedAt,placedAt);assert.equal(result.data.orderPlan.orderAt,placedAt);assert.equal(result.data.orderPlan.confirmationKey,'phone-test');assert.ok(result.data.orderPlan.arrivalAt>=before+5*60000);
  assert.equal((await call('nights/'+n.id)).data.orderPlan.arrivalAt,result.data.orderPlan.arrivalAt);
  await call('nights/'+n.id,'PATCH',{watchStarted:true});assert.equal((await call(path,'PATCH',{deliveryEtaMinutes:40},'')).status,409);
 }finally{DB.close();}
});
