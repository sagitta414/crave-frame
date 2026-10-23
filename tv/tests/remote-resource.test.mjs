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
