import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';
const hash=async s=>Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))).toString('hex');
async function fixture(){const DB=openDb(),files=new Map(),key='a'.repeat(64),owner='b'.repeat(64),id=await hash(key),house=await hash(owner);const env={DB,MEDIA:{put:async(k,v)=>files.set(k,v),get:async k=>files.has(k)?{body:files.get(k)}:null,delete:async k=>files.delete(k)}};await DB.prepare('INSERT INTO households(id,data,revision,updated) VALUES(?,?,0,?)').bind(house,JSON.stringify({prefs:{},nights:[],memory:{},pantry:[]}),'2026').run();await DB.prepare('INSERT INTO collections(id,household,data) VALUES(?,?,?)').bind(id,house,JSON.stringify({key,name:'Test',notes:'',shared:false,photo:null})).run();return {DB,files,env,key,id,house,async call(path,method='GET',body,auth=false){const response=await api(new Request('https://test/api/'+path,{method,headers:auth?{'x-household-key':owner}:{},...(body?{body:JSON.stringify(body)}:{})}),env);return {status:response.status,data:response.headers.get('content-type')?.includes('json')?await response.json():null};}};}
const jpeg='data:image/jpeg;base64,/9j/2Q==';
test('unshare revokes view, owner-photo and editor grants; resharing never revives old URLs',async()=>{const f=await fixture();try{
 const list=await f.call('collections','GET',null,true);assert.ok(list.data.collections[0].photoAccess,'legacy owner gets photo grant');
 await f.call('collections/'+f.key+'/photo','PUT',{jpeg},true);
 await f.call('collections/'+f.key,'PUT',{name:'Test',notes:'',shared:true},true);
 const view=(await f.call('collection-share/'+f.key)).data,editor=(await f.call('collections/'+f.key+'/editor','POST',{},true)).data;
 const image=(access)=>f.call('photo/'+view.photo+(access?'?access='+access:''));
 assert.equal((await image()).status,404);assert.equal((await image(view.photoAccess)).status,200);
 const unshared=(await f.call('collections/'+f.key,'PUT',{name:'Test',notes:'',shared:false},true)).data;
 assert.equal((await image(view.photoAccess)).status,404);assert.equal((await image(editor.photoAccess)).status,404);assert.equal((await image(unshared.photoAccess)).status,200);
 assert.equal((await f.call('collection-editor/'+f.key,'PUT',{jpeg,editKey:editor.editKey})).status,403);
 await f.call('collections/'+f.key,'PUT',{name:'Test',notes:'',shared:true},true);assert.equal((await image(view.photoAccess)).status,404);
 const fresh=(await f.call('collections/'+f.key+'/editor','POST',{},true)).data;
 assert.equal((await f.call('collection-editor/'+f.key+'?editKey='+fresh.editKey)).status,200);
 await f.call('collections/'+f.key+'/editor','DELETE',null,true);assert.equal((await f.call('collection-editor/'+f.key+'?editKey='+fresh.editKey)).status,403);
 const expired=(await f.call('collections/'+f.key+'/editor','POST',{},true)).data;expired.editExpires=Date.now()-1;await f.DB.prepare('UPDATE collections SET data=? WHERE id=?').bind(JSON.stringify(expired),f.id).run();assert.equal((await f.call('collection-editor/'+f.key+'?editKey='+expired.editKey)).status,403);
}finally{f.DB.close();}});
test('upload rate allowance is daily and household-scoped, independent of the legacy global counter',async()=>{const f=await fixture();try{
 const day=new Date().toISOString().slice(0,10),budget='photo-upload:'+day+':'+f.house;
 await f.DB.prepare('INSERT INTO ai_usage(id,count) VALUES(?,?)').bind('storage:photo-upload-bytes',500*1024*1024).run();
 assert.equal((await f.call('collections/'+f.key+'/photo','PUT',{jpeg},true)).status,200);
 await f.DB.prepare('UPDATE ai_usage SET count=? WHERE id=?').bind(10*1024*1024,budget).run();assert.equal((await f.call('collections/'+f.key+'/photo','PUT',{jpeg},true)).status,429);
 const other='d'.repeat(64),otherId=await hash(other),otherEditor='e'.repeat(64);await f.DB.prepare('INSERT INTO collections(id,household,data) VALUES(?,?,?)').bind(otherId,'other-household',JSON.stringify({key:other,name:'Other',editKey:otherEditor,editExpires:Date.now()+10000})).run();assert.equal((await f.call('collection-editor/'+other,'PUT',{jpeg,editKey:otherEditor})).status,200);
 // The next day starts a fresh allowance.
 await f.DB.prepare('UPDATE ai_usage SET id=? WHERE id=?').bind('photo-upload:2000-01-01:'+f.house,budget).run();
 assert.equal((await f.call('collections/'+f.key+'/photo','PUT',{jpeg},true)).status,200);assert.equal(f.files.size,2);
 assert.equal(await f.DB.prepare('SELECT count FROM ai_usage WHERE id=?').bind('photo-upload:2000-01-01:'+f.house).first(),null);
}finally{f.DB.close();}});

test('ordinary private notes edits preserve the active editor and photo grants',async()=>{const f=await fixture();try{
 await f.call('collections','GET',null,true);
 const editor=(await f.call('collections/'+f.key+'/editor','POST',{},true)).data;
 const saved=await f.call('collections/'+f.key,'PUT',{name:'Renamed',notes:'A note',shared:false},true);
 assert.equal(saved.status,200);assert.equal(saved.data.editKey,editor.editKey);assert.equal(saved.data.photoAccess,editor.photoAccess);
 assert.equal((await f.call('collection-editor/'+f.key+'?editKey='+editor.editKey)).status,200);
}finally{f.DB.close();}});

test('legacy shared photos acquire a valid view grant directly and through the owner library',async()=>{const f=await fixture();try{
 const upload=(await f.call('collections/'+f.key+'/photo','PUT',{jpeg},true)).data;
 const legacy={...upload,shared:true};delete legacy.photoAccess;delete legacy.viewKey;
 await f.DB.prepare('UPDATE collections SET data=? WHERE id=?').bind(JSON.stringify(legacy),f.id).run();
 const shared=await f.call('collection-share/'+f.key);assert.equal(shared.status,200);assert.ok(shared.data.photoAccess);
 assert.equal((await f.call('photo/'+upload.photo+'?access='+shared.data.photoAccess)).status,200);
 assert.equal((await f.call('photo/'+upload.photo)).status,404);
 await f.DB.prepare('UPDATE collections SET data=? WHERE id=?').bind(JSON.stringify(legacy),f.id).run();
 const owner=await f.call('collections','GET',null,true);assert.ok(owner.data.collections[0].viewKey);
 const view=await f.call('collection-share/'+f.key);assert.equal((await f.call('photo/'+upload.photo+'?access='+view.data.photoAccess)).status,200);
}finally{f.DB.close();}});

test('failed retired-photo deletion does not report a failed save and is retried durably',async()=>{const f=await fixture();try{
 const first=(await f.call('collections/'+f.key+'/photo','PUT',{jpeg},true)).data;
 const remove=f.env.MEDIA.delete;f.env.MEDIA.delete=async()=>{throw Error('Simulated object-store outage');};
 const second=await f.call('collections/'+f.key+'/photo','PUT',{jpeg},true);assert.equal(second.status,200);assert.notEqual(second.data.photo,first.photo);
 assert.equal((await f.call('photo/'+first.photo+'?access='+first.photoAccess)).status,404);
 assert.equal((await f.call('photo/'+second.data.photo+'?access='+second.data.photoAccess)).status,200);
 assert.ok(await f.DB.prepare('SELECT id FROM ai_usage WHERE id=?').bind('photo-delete:'+first.photo).first());
 f.env.MEDIA.delete=remove;await f.call('collections','GET',null,true);assert.equal(f.files.has('photos/'+first.photo),false);assert.equal(f.files.has('photos/'+second.data.photo),true);
 assert.equal(await f.DB.prepare('SELECT id FROM ai_usage WHERE id=?').bind('photo-delete:'+first.photo).first(),null);
 // Deleting the collection also succeeds without leaving a misleading failure to retry.
 f.env.MEDIA.delete=async()=>{throw Error('Simulated outage');};assert.equal((await f.call('collections/'+f.key,'DELETE',null,true)).status,200);
 f.env.MEDIA.delete=remove;await f.call('collections','GET',null,true);assert.equal(f.files.size,0);
}finally{f.DB.close();}});
