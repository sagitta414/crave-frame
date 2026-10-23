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
  assert.equal((await call('shared/'+share,'PATCH',{watchStarted:true},'')).status,409);
  await call('nights/'+n.id,'PATCH',{complete:true});assert.equal((await call('shared/'+share,'PATCH',{watchStarted:true},'')).status,200);
  const started=(await call('nights/'+n.id)).data.watchStarted;await call('shared/'+share,'PATCH',{watchStarted:true},'');assert.equal((await call('nights/'+n.id)).data.watchStarted,started);
  await call('shared/'+share,'PATCH',{edition:{person:1,text:'We laughed.',skip:false}},'');
  await call('shared/'+share,'PATCH',{edition:{person:2,skip:true}},'');
  assert.deepEqual((await call('shared/'+share+'/edition','GET',undefined,'')).data,{edition:null});
  const saved=await call('shared/'+share+'/edition','POST',{name:'Our night',nightId:other.id,shared:true},'');
  assert.equal(saved.status,200);assert.deepEqual(saved.data,{saved:true});
  await call('shared/'+share+'/edition','POST',{name:'Our night'},'');
  const cards=(await call('collections')).data.collections;assert.equal(cards.length,1);assert.equal(cards[0].sourceNightId,n.id);assert.equal(cards[0].shared,false);
  const loaded=(await call('shared/'+share+'/edition','GET',undefined,'')).data;assert.deepEqual(loaded,{edition:{name:'Our night',notes:'Partner 1: We laughed.',shared:false,revision:1,tonightsEdition:true}});
  assert.deepEqual((await call('nights/'+n.id+'/edition')).data,loaded);
  assert.equal((await call('nights/'+other.id+'/edition')).data.edition,null);
  const card=cards[0];await call('collections/'+card.key,'PUT',{name:card.name,notes:card.notes,shared:true});
  assert.equal((await call('shared/'+share+'/edition','POST',{name:'Another title'},'')).status,409);
  const beforeUnshare=(await call('shared/'+share+'/edition','GET',undefined,'')).data.edition;
  const oldPublic=(await call('collections')).data.collections[0].viewKey;
  assert.equal((await call('shared/'+share+'/edition','POST',{action:'unshare',expectedRevision:-1},'')).status,409);
  assert.equal((await call('shared/'+share+'/edition','POST',{action:'unshare',expectedRevision:beforeUnshare.revision,nightId:other.id},'')).status,200);
  assert.equal((await call('shared/'+share+'/edition','GET',undefined,'')).data.edition.shared,false);
  assert.equal((await call('collection-share/'+oldPublic,'GET',undefined,'')).status,404);
  const privateCard=(await call('collections')).data.collections[0];assert.equal(privateCard.editKey,null);assert.notEqual(privateCard.viewKey,oldPublic);
  assert.equal((await call('shared/'+share+'/edition','POST',{name:'Edited privately'},'')).status,200);
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
  assert.equal((await call(path,'PATCH',{watchStarted:true},'')).status,409);
  assert.equal((await call(path,'PATCH',{deliveryArrived:true},'')).data.status,'ready');
  const arrived=(await call(path)).data.readyAt;await call(path,'PATCH',{deliveryArrived:true},'');assert.equal((await call(path)).data.readyAt,arrived);
  assert.equal((await call(path,'PATCH',{watchStarted:true},'')).status,200);
  await call(path,'PATCH',{edition:{person:1,skip:true}},'');await call(path,'PATCH',{edition:{person:2,skip:true}},'');
  assert.equal((await call(path+'/edition','POST',{name:'Takeout together'},'')).status,200);
  assert.equal((await call(path+'/edition','GET',undefined,'')).data.edition.name,'Takeout together');
  assert.equal((await call(path,'PATCH',{edition:{person:1,text:'Stale',skip:false,expectedResponse:JSON.stringify([false,''])}},'')).status,409);
  assert.equal((await call(path,'PATCH',{edition:{person:1,text:'New moment',skip:false,expectedResponse:JSON.stringify([true,''])}},'')).status,200);
  const card=(await call('collections')).data.collections[0];assert.equal(card.fulfillment,'delivery');
  await call('collections/'+card.key,'PUT',{name:card.name,notes:card.notes,shared:true});
  const shared=(await call('collection-share/'+card.key,'GET',undefined,'')).data;assert.equal(shared.fulfillment,'delivery');assert.equal(shared.deliveryQuery,card.deliveryQuery);
  const row=await DB.prepare('SELECT id,data FROM collections').first();const old=JSON.parse(row.data);delete old.fulfillment;delete old.deliveryQuery;await DB.prepare('UPDATE collections SET data=? WHERE id=?').bind(JSON.stringify(old),row.id).run();
  assert.equal((await call('collections')).data.collections[0].fulfillment,'delivery');assert.equal((await call('collections/'+card.key,'PUT',{name:card.name,notes:card.notes,shared:true})).data.fulfillment,'delivery');assert.equal((await call('collection-share/'+card.key,'GET',undefined,'')).data.fulfillment,'delivery');
  assert.equal((await call(path,'PATCH',{deliveryEtaMinutes:40},'')).status,409);
 }finally{DB.close();}
});

test('memory revisions and reviewed answers reject stale saves without overwriting another screen',async()=>{
 const DB=openDb();let key='';const call=async(path,method='GET',body,auth=key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json','x-household-key':auth},...(body?{body:JSON.stringify(body)}:{})}),{DB,AI_PROVIDER:'catalog'});return {status:r.status,data:await r.json()};};
 try{
 key=(await call('household','POST',{})).data.key;
 const n=(await call('nights','POST',{mealId:'chickpea-pasta',showId:'grand-budapest',prefs:defaults,adapted:false,fulfillment:'delivery',orderOut:{etaMinutes:35,provider:'ubereats',placedAt:Date.now(),confirmationId:'conflict'}})).data;
 const share=(await call('nights/'+n.id+'/share','POST',{})).data.key,p='shared/'+share;
 assert.equal((await call('nights/'+n.id,'PATCH',{watchStarted:true})).status,409);
 await call(p,'PATCH',{deliveryArrived:true},'');assert.equal((await call('nights/'+n.id,'PATCH',{watchStarted:true})).status,200);
 await call(p,'PATCH',{edition:{person:1,skip:true}},'');await call(p,'PATCH',{edition:{person:2,skip:true}},'');
 const save=(name,expectedRevision,expectedNotes='')=>call(p+'/edition','POST',{name,expectedRevision,expectedNotes},'');
 const first=await Promise.all([save('First screen',null),save('Second screen',null)]);
 assert.ok(first.some(r=>r.status===200));assert.ok(first.some(r=>r.status===409));assert.equal((await call('collections')).data.collections.length,1);
 const before=(await call(p+'/edition','GET',undefined,'')).data.edition;
 assert.equal((await save('Approved update',before.revision)).status,200);
 assert.equal((await save('Stale update',before.revision)).status,409);
 const current=(await call(p+'/edition','GET',undefined,'')).data.edition;assert.equal(current.name,'Approved update');
 await call(p,'PATCH',{edition:{person:1,skip:false,text:'A new answer'}},'');
 assert.equal((await save('Unreviewed answers',current.revision)).status,409);
 assert.equal((await call(p+'/edition','GET',undefined,'')).data.edition.name,'Approved update');
 const stranger=(await call('household','POST',{})).data.key;assert.equal((await call('nights/'+n.id+'/edition','GET',undefined,stranger)).status,404);
 }finally{DB.close();}
});

test('deleted edition can be recreated once with fresh access and old grants stay revoked',async()=>{
 const DB=openDb();let key='';const call=async(path,method='GET',body,auth=key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json','x-household-key':auth},...(body?{body:JSON.stringify(body)}:{})}),{DB,AI_PROVIDER:'catalog'});return {status:r.status,data:await r.json()};};
 try{
 key=(await call('household','POST',{})).data.key;
 const n=(await call('nights','POST',{mealId:'chickpea-pasta',showId:'grand-budapest',prefs:defaults,adapted:false,fulfillment:'delivery',orderOut:{etaMinutes:20,provider:'doordash',confirmationId:'restore'}})).data;
 for(const data of [{deliveryArrived:true},{watchStarted:true},{edition:{person:1,skip:true}},{edition:{person:2,skip:true}}])await call('nights/'+n.id,'PATCH',data);
 const share=(await call('nights/'+n.id+'/share','POST',{})).data.key;
 const payload={nightId:n.id,tonightsEdition:true,name:'First memory',expectedRevision:null,expectedNotes:''};
 let card=(await call('collections','POST',payload)).data;
 for(let cycle=0;cycle<2;cycle++){
 const old=card,editor=(await call('collections/'+old.key+'/editor','POST',{})).data.editKey;
 await call('collections/'+old.key,'PUT',{name:old.name,notes:old.notes,shared:true});
 const stale=(await call('nights/'+n.id+'/edition')).data.edition.revision;
 assert.equal((await call('collections/'+old.key,'DELETE')).status,200);
 assert.equal((await call('collections')).data.collections.length,0);
 assert.equal((await call('nights/'+n.id+'/edition')).data.edition,null);
 assert.equal((await call('collections','POST',{...payload,expectedRevision:stale})).status,409);
 const results=await Promise.all([call('shared/'+share+'/edition','POST',{...payload,name:'Recreated'},''),call('shared/'+share+'/edition','POST',{...payload,name:'Recreated'},'')]);
 assert.equal(results.filter(r=>r.status===200).length,1);assert.equal(results.filter(r=>r.status===409).length,1);
 const list=(await call('collections')).data.collections;assert.equal(list.length,1);card=list[0];assert.notEqual(card.key,old.key);assert.notEqual(card.photoAccess,old.photoAccess);assert.notEqual(card.viewKey,old.viewKey);assert.equal(card.photo,null);assert.equal(card.shared,false);assert.equal(card.editKey,null);
 await call('collections/'+card.key,'PUT',{name:card.name,notes:card.notes,shared:true});
 assert.equal((await call('collection-share/'+old.key,'GET',undefined,'')).status,404);
 assert.ok((await call('collection-editor/'+old.key+'?editKey='+editor,'GET',undefined,'')).status>=400);
 assert.equal((await call('collections/'+old.key,'PUT',{name:'stale',notes:'',shared:true})).status,404);
 }
 }finally{DB.close();}
});
