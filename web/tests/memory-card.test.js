import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults,mealById} from '../product/catalog.js';
test('memory saves are retry-safe, preserve edits and do not resurrect revoked public links',async()=>{
 const DB=openDb();let key='';
 const call=async(path,method='GET',data)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json','x-household-key':key},...(data?{body:JSON.stringify(data)}:{})}),{DB,AI_PROVIDER:'catalog'});return {status:r.status,data:await r.json()};};
 try{key=(await call('household','POST',{})).data.key;
 const night=await call('nights','POST',{mealId:'chickpea-pasta',showId:'grand-budapest',prefs:{...defaults,pairingStyle:'Practical'},adapted:false,confirmed:mealById('chickpea-pasta').ingredients.map(i=>i[0])});assert.equal(night.status,201);
 const body={nightId:night.data.id,name:'Our evening',notes:'Original',requestId:'memory_request_12345'};
 const [first,retry]=await Promise.all([call('collections','POST',body),call('collections','POST',body)]);
 assert.equal(first.data.key,retry.data.key);assert.equal((await call('collections')).data.collections.length,1);
 await call('collections/'+first.data.key,'PUT',{name:'Personal title',notes:'Keep this edit',shared:true});
 const again=await call('collections','POST',{...body,requestId:'new_session_request_123'});assert.equal(again.data.name,'Personal title');assert.equal(again.data.notes,'Keep this edit');assert.equal(again.data.shared,true);
 await call('collections/'+first.data.key,'DELETE');
 assert.equal((await call('collections','POST',body)).status,409);assert.equal((await call('collections')).data.collections.length,0);assert.equal((await call('collections/'+first.data.key,'PUT',{name:'Revive',notes:'',shared:true})).status,404);
 const fresh=await call('collections','POST',{...body,requestId:'different_request_12345'});assert.notEqual(fresh.data.key,first.data.key);
 await call('collections/'+fresh.data.key,'PUT',{name:'New card',notes:'',shared:true});
 assert.equal((await call('collection-share/'+first.data.key)).status,404);
 assert.equal((await call('collection-share/'+fresh.data.key)).status,200);
 assert.equal((await call('collections','POST',{...body,requestId:'bad'})).status,400);
 }finally{DB.close();}
});
