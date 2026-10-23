import assert from 'node:assert/strict';
import {defaults,mealById} from '../web/product/catalog.js';
import {ingredients} from '../web/product/engine.js';
// Run after npm run dev. Uses disposable local households; never targets production.
const origin='http://127.0.0.1:4178';let count=0;
async function call(path,method='GET',body,key,expected=200){const r=await fetch(origin+path,{method,headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});assert.equal(r.status,expected,path.split('?')[0]);for(const h of ['content-security-policy','x-frame-options','x-content-type-options','referrer-policy'])assert.ok(r.headers.get(h),'Missing '+h);count++;return r;}
for(const p of ['/','/app/','/tv/','/app/style.css','/app/main.js','/app/companion.html','/app/companion.js','/app/connect-tmdb.html'])await call(p);
await call('/missing-smoke-document','GET',null,null,404);
await call('/api/household','GET',null,null,401);
const house=await(await call('/api/household','POST',{},null,201)).json();
const other=await(await call('/api/household','POST',{},null,201)).json();assert.notEqual(house.key,other.key);
const meal=mealById('tomato-pasta');let night;
try{
 night=await(await call('/api/nights','POST',{mealId:meal.id,showId:'paddington',prefs:{...defaults,cookTime:30,watchTime:180},adapted:false,confirmed:ingredients(meal,2,false).map(i=>i.name)},house.key,201)).json();
 await call('/api/nights/'+night.id,'GET',null,other.key,404);
 const share=await(await call('/api/nights/'+night.id+'/share','POST',{},house.key)).json();
 await call('/api/shared/'+share.key+'/connect','POST',{});
 await call('/api/shared/'+share.key,'PATCH',{step:1});
 const saved=await(await call('/api/nights/'+night.id,'GET',null,house.key)).json();assert.equal(saved.step,1);
 await call('/api/nights/'+night.id,'PATCH',{complete:true},house.key);
 await call('/api/shared/'+share.key,'PATCH',{watchStarted:true});
 const watched=await(await call('/api/nights/'+night.id,'GET',null,house.key)).json();assert.ok(watched.watchStarted);
 await call('/api/nights/'+night.id+'/share','DELETE',null,house.key);
 await call('/api/shared/'+share.key,'GET',null,null,404);
}finally{if(night)await call('/api/nights/'+night.id,'DELETE',null,house.key);}
console.log('PASS: '+count+' local HTTP checks: documents, headers, authentication, isolation, saving, phone progress, completion, viewing, revocation and cleanup. Empty test households remain locally.');
