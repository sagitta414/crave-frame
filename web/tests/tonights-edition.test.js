import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {defaults,mealById} from '../product/catalog.js';
import {respondToEdition,editionReady,editionNotes} from '../product/tonights-edition.js';
test('edition supports two optional moments, bounded input and no automatic readiness before viewing',()=>{
 const night={prefs:{people:2},status:'ready',watchStarted:null};assert.throws(()=>respondToEdition(night,{person:1,skip:false,text:'A laugh'}));night.watchStarted=1;
 respondToEdition(night,{person:1,skip:false,text:' The laugh we needed. '});assert.equal(editionReady(night),false);assert.throws(()=>editionNotes(night));
 respondToEdition(night,{person:2,skip:true});assert.equal(editionReady(night),true);assert.equal(editionNotes(night),'Partner 1: The laugh we needed.');
 assert.throws(()=>respondToEdition(night,{person:2,skip:false,text:'x'.repeat(281)}));
 respondToEdition(night,{person:1,skip:true});assert.equal(editionNotes(night),'');
});
test('private edition saves are retry-safe and never append answers to an already shared card',async()=>{
 const DB=openDb();let key='';const call=async(path,method='GET',data,k=key)=>{const r=await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json','x-household-key':k},...(data?{body:JSON.stringify(data)}:{})}),{DB,AI_PROVIDER:'catalog'});return {status:r.status,data:await r.json()};};
 try{key=(await call('household','POST',{})).data.key;const other=(await call('household','POST',{})).data.key;
 const n=(await call('nights','POST',{mealId:'chickpea-pasta',showId:'grand-budapest',prefs:defaults,adapted:false,confirmed:mealById('chickpea-pasta').ingredients.map(i=>i[0])})).data;
 const body={nightId:n.id,tonightsEdition:true,name:'Friday, finally ours'};
 assert.equal((await call('collections','POST',body)).status,400);
 await call('nights/'+n.id,'PATCH',{complete:true});await call('nights/'+n.id,'PATCH',{watchStarted:true});
 const share=(await call('nights/'+n.id+'/share','POST',{})).data.key;
 assert.equal((await call('nights/'+n.id,'PATCH',{edition:{person:1,skip:false,text:'Test'}},other)).status,404);
 await call('shared/'+share,'PATCH',{edition:{person:1,skip:false,text:'We laughed.'}},'');
 await call('shared/'+share,'PATCH',{edition:{person:2,skip:false,text:'The music.'}},'');
 const saved=await call('collections','POST',body);assert.equal(saved.status,201);assert.equal(saved.data.shared,false);assert.equal(saved.data.tonightsEdition,true);assert.match(saved.data.notes,/We laughed/);
 assert.equal((await call('collections','POST',body)).data.key,saved.data.key);assert.equal((await call('collections')).data.collections.length,1);
 assert.equal((await call('collection-share/'+saved.data.key)).status,404);
 await call('collections/'+saved.data.key,'PUT',{name:saved.data.name,notes:saved.data.notes,shared:true});
 await call('shared/'+share,'PATCH',{edition:{person:1,skip:false,text:'New personal answer'}},'');
 assert.equal((await call('collections','POST',body)).status,409);assert.ok(!(await call('collection-share/'+saved.data.key)).data.notes.includes('New personal answer'));
 await DB.prepare('UPDATE shares SET expires=?').bind(0).run();assert.equal((await call('shared/'+share,'PATCH',{edition:{person:2,skip:true}},'')).status,404);
 }finally{DB.close();}
});
