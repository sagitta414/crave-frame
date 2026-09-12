import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
import {catalogRequest,selectShow} from '../server/catalog.js';
import {recommend} from '../product/engine.js';
import {defaults,mealById} from '../product/catalog.js';

test('custom title survives saved night and shared cooking, arbitrary links are discarded',async()=>{
 const DB=openDb();let key='';
 const call=async(p,method='GET',data,auth=key)=>{const r=await api(new Request('https://demo.test/api/'+p,{method,headers:{'x-household-key':auth},...(data?{body:JSON.stringify(data)}:{})}),{DB});return {status:r.status,data:await r.json()};};
 try{
 key=(await call('household','POST')).data.key;
 assert.equal((await call('catalog/status')).data.connected,false);
 assert.equal((await call('catalog/search?q=Arrival')).status,503);
 const show=(await call('catalog/select','POST',{name:'My obscure movie',minutes:105,kind:'Movie',mood:'Adventure',cuisine:'Asian',source:'javascript:alert(1)'})).data;
 assert.equal(show.source,undefined);
 const created=await call('nights','POST',{mealId:'chickpea-pasta',showId:show.id,prefs:{...defaults,pairingStyle:'Practical'},adapted:false,confirmed:mealById('chickpea-pasta').ingredients.map(i=>i[0])});
 assert.equal(created.status,201);
 const n=(await call('nights/'+created.data.id)).data;assert.equal(n.showName,'My obscure movie');assert.equal(n.show.minutes,105);
 const share=(await call('nights/'+n.id+'/share','POST')).data;
 assert.equal((await call('shared/'+share.key,'GET',null,'')).data.showName,'My obscure movie');
 assert.equal((await call('catalog/select','POST',{name:'Bad',minutes:0})).status,400);
 }finally{DB.close();}
});
test('pairing styles use cuisine matches and actual pantry coverage',()=>{
 const input={mode:'watch',sourceId:'grand-budapest',prefs:{...defaults,cookTime:60}};
 const cuisine=recommend({...input,prefs:{...input.prefs,pairingStyle:'Cuisine inspiration'}});
 assert.equal(cuisine[0].meal.cuisine,'European');
 const practical=recommend({...input,prefs:{...input.prefs,pairingStyle:'Practical'},pantry:mealById('pepper-pasta').ingredients.map(i=>i[0])});
 assert.equal(practical[0].meal.id,'pepper-pasta');assert.ok(practical[0].reasons[0].includes('6 of 6'));
});
test('TMDB search excludes people and season selection uses episode runtime (mocked provider)',async()=>{
 const original=globalThis.fetch;
 const env={TMDB_ACCESS_TOKEN:'test-token'};
 globalThis.fetch=async(url,options)=>{assert.equal(options.headers.Authorization,'Bearer test-token');const data=url.includes('search/multi')?{results:[{id:1,media_type:'person',name:'Actor'},{id:2,media_type:'tv',name:'Example',first_air_date:'2020-01-01'}]}:url.includes('/episode/')?{name:'The arrival',runtime:43,overview:'Episode synopsis'}:{name:'Example',genres:[{name:'Drama'}],overview:'Series synopsis'};return Response.json(data);};
 try{const results=await catalogRequest(new URL('https://demo.test/api/catalog/search?q=Example'),env);assert.equal(results.results.length,1);assert.equal(results.results[0].year,'2020');const show=await selectShow({provider:{type:'tv',id:2,season:1,episode:3},mood:'Cozy',cuisine:'European',minutes:90,family:true},env);assert.equal(show.minutes,43);assert.ok(show.name.includes('S1 E3'));assert.equal(show.family,false);assert.equal(show.source,'https://www.themoviedb.org/tv/2');}finally{globalThis.fetch=original;}
});
