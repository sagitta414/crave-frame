import test from 'node:test';
import assert from 'node:assert/strict';
import {remoteResource} from '../src/remote-resource.js';

test('a failed availability request clears its error on same-key retry',async()=>{
 const states=[],resource=remoteResource(s=>states.push(s));
 await resource.load('title-a',async()=>{throw Error('offline');});
 assert.equal(states.at(-1).status,'error');
 const retry=resource.load('title-a',async()=>({subscription:['Netflix']}));
 assert.deepEqual(states.at(-1),{key:'title-a',status:'loading',data:null,error:''});
 await retry;
 assert.equal(states.at(-1).error,'');
 assert.deepEqual(states.at(-1).data.subscription,['Netflix']);
});

test('changing title or collection ignores an obsolete result and obsolete failure',async()=>{
 const states=[],resource=remoteResource(s=>states.push(s));let resolveOld,rejectOld;
 const old=resource.load('old',()=>new Promise(resolve=>{resolveOld=resolve;}));
 const failing=resource.load('old-error',()=>new Promise((_,reject)=>{rejectOld=reject;}));
 await resource.load('new',async()=>({name:'New collection'}));
 resolveOld({name:'Old collection'});rejectOld(Error('Old failure'));
 await Promise.all([old,failing]);
 assert.equal(states.at(-1).key,'new');
 assert.equal(states.at(-1).status,'ready');
 assert.equal(states.at(-1).data.name,'New collection');
});

test('empty collections are successful data, distinct from a failed shared link',async()=>{
 const states=[],resource=remoteResource(s=>states.push(s));
 await resource.load('collections',async()=>({collections:[]}));
 assert.equal(states.at(-1).status,'ready');
 assert.deepEqual(states.at(-1).data.collections,[]);
 await resource.load('shared',async()=>{throw Error('Sharing stopped');});
 assert.equal(states.at(-1).status,'error');
 assert.equal(states.at(-1).data,null);
});

test('leaving the screen prevents a pending request publishing its result',async()=>{
 const states=[],resource=remoteResource(s=>states.push(s));let finish;
 const pending=resource.load('shared',()=>new Promise(resolve=>{finish=resolve;}));
 resource.cancel();finish({name:'Late response'});await pending;
 assert.equal(states.length,1);
});

test('collection refresh retains data and drafts through success and failure, but not route changes',async()=>{
 const states=[],r=remoteResource(s=>states.push(s));const data={collections:[{key:'a',notes:'saved'}]};
 await r.load('collections',async()=>data,{keepData:true});
 let finish;const pending=r.load('collections',()=>new Promise(resolve=>finish=resolve),{keepData:true});
 assert.equal(states.at(-1).status,'ready');assert.equal(states.at(-1).data,data);
 finish(data);await pending;
 await r.load('collections',async()=>{throw Error('offline');},{keepData:true});assert.equal(states.at(-1).data,data);assert.equal(states.at(-1).status,'ready');assert.equal(states.at(-1).error,'offline');
 await r.load('other',async()=>{throw Error('missing');},{keepData:true});assert.equal(states.at(-1).data,null);
});


test('collection mutations replace stale grants and survive an older refresh',async()=>{
 const {applyCollectionMutation}=await import('../src/collection-state.js');
 const states=[],r=remoteResource(s=>states.push(s));
 const other={key:'b',notes:'keep draft mounted'};
 const old={collections:[{key:'a',editorKey:'old'},other]};
 await r.load('collections',async()=>old);
 let finish;const refresh=r.load('collections',()=>new Promise(resolve=>finish=resolve),{keepData:true});
 r.update('collections',data=>applyCollectionMutation(data,'a',{key:'a',editorKey:'new'}));
 assert.equal(states.at(-1).data.collections[0].editorKey,'new');
 assert.equal(states.at(-1).data.collections[1],other);
 finish(old);await refresh;
 assert.equal(states.at(-1).data.collections[0].editorKey,'new');
 r.update('collections',data=>applyCollectionMutation(data,'b',{deleted:true}));
 assert.deepEqual(states.at(-1).data.collections,[{key:'a',editorKey:'new'}]);
 const count=states.length;r.update('different',()=>{throw Error('wrong route');});assert.equal(states.length,count);
 assert.throws(()=>applyCollectionMutation(old,'a',{key:'b'}),/could not be applied/);
});

test('late mutation from previous route cannot cancel the current page load',async()=>{
 const states=[],r=remoteResource(s=>states.push(s));
 await r.load('collections',async()=>({collections:[]}));
 r.cancel();let finish;
 const pending=r.load('shared',()=>new Promise(resolve=>finish=resolve));
 r.update('collections',()=>{throw Error('obsolete mutation must not run');});
 finish({name:'Shared evening'});await pending;
 assert.equal(states.at(-1).key,'shared');assert.equal(states.at(-1).status,'ready');
 assert.equal(states.at(-1).data.name,'Shared evening');
 r.cancel();const count=states.length;r.update('shared',()=>({name:'late'}));assert.equal(states.length,count);
});
test('a rejected mutation transform does not cancel a valid refresh',async()=>{
 const states=[],r=remoteResource(s=>states.push(s));await r.load('collections',async()=>({value:1}));
 let finish;const pending=r.load('collections',()=>new Promise(resolve=>finish=resolve),{keepData:true});
 assert.throws(()=>r.update('collections',()=>{throw Error('bad response');}),/bad response/);
 finish({value:2});await pending;assert.equal(states.at(-1).data.value,2);
});
