import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaults,mealById} from '../../web/product/catalog.js';
import {ingredients} from '../../web/product/engine.js';
const output=JSON.parse(readFileSync('outputs.json','utf8')).CraveFrameAmazon2026;
const origin=output.Origin;
assert.match(origin,/^https:\/\/[-a-z0-9]+\.cloudfront\.net$/);
function security(r){for(const h of ['content-security-policy','strict-transport-security','x-frame-options','x-content-type-options','referrer-policy'])assert.ok(r.headers.get(h),'Missing '+h);assert.equal(r.headers.get('x-frame-options'),'DENY');assert.equal(r.headers.get('x-content-type-options'),'nosniff');}
async function request(path,method='GET',body,key,expected=200){const r=await fetch(origin+path,{method,headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});security(r);assert.equal(r.status,expected,'Unexpected status for '+path.split('/').slice(0,3).join('/'));return r;}
for(const path of ['/','/app/','/tv/','/app/style.css','/version.json'])await request(path);
const health=await (await request('/api/health')).json();assert.equal(health.status,'ready');assert.equal(health.version,output.Version);
assert.equal((await (await request('/version.json')).json()).version,output.Version);
const missing=await fetch(origin+'/missing-page-smoke');security(missing);assert.ok([403,404].includes(missing.status));
await request('/api/missing','GET',null,null,401);
const direct=await fetch(output.DirectApiOrigin+'/api/health');assert.equal(direct.status,403);
const bucket=await fetch('https://'+output.MediaBucket+'.s3.amazonaws.com/');assert.equal(bucket.status,403);
const household=await (await request('/api/household','POST')).json();
const other=await (await request('/api/household','POST')).json();assert.notEqual(household.key,other.key);
const meal=mealById('tomato-pasta');let night,collection,photo;
try{
 night=await (await request('/api/nights','POST',{mealId:meal.id,showId:'paddington',prefs:{...defaults,cookTime:30,watchTime:180},adapted:false,confirmed:ingredients(meal,2,false).map(x=>x.name)},household.key,201)).json();
 await request('/api/nights/'+night.id,'GET',null,other.key,404);
 const share=await (await request('/api/nights/'+night.id+'/share','POST',{},household.key)).json();
 await request('/tv/?cook='+encodeURIComponent(share.key));
 await request('/api/shared/'+share.key+'/connect','POST',{});
 await request('/api/shared/'+share.key,'PATCH',{step:1});
 assert.equal((await (await request('/api/nights/'+night.id,'GET',null,household.key)).json()).step,1);
 collection=await (await request('/api/collections','POST',{nightId:night.id},household.key,201)).json();
 const uploaded=await (await request('/api/collections/'+collection.key+'/photo','PUT',{jpeg:'data:image/jpeg;base64,/9j/2Q=='},household.key)).json();photo=uploaded.photo;
 await request('/api/photo/'+photo);
 const object=await fetch('https://'+output.MediaBucket+'.s3.amazonaws.com/photos/'+photo);assert.equal(object.status,403);
 await request('/api/collections/'+collection.key,'DELETE',null,household.key);collection=null;
 await request('/api/photo/'+photo,'GET',null,null,404);
 await request('/api/nights/'+night.id+'/share','DELETE',null,household.key);
 await request('/api/shared/'+share.key,'GET',null,null,404);
 console.log(JSON.stringify({event:'smoke',status:'passed',version:output.Version,checks:['documents','assets','errors','security-headers','readiness','version','direct-origin-denial','private-media','household-isolation','persistence','phone-sync','qr-route','revocation','media-cleanup']}));
}finally{
 if(collection)await request('/api/collections/'+collection.key,'DELETE',null,household.key);
 if(night)await request('/api/nights/'+night.id,'DELETE',null,household.key);
}
// The two empty smoke households remain. No keys, link tokens, IPs or bodies are logged.
