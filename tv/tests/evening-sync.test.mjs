import test from 'node:test';
import assert from 'node:assert/strict';
import {createEveningSync} from '../src/evening-sync.js';

function harness(read) {
  const applied=[],errors=[],scheduled=[];let revision=0;
  const sync=createEveningSync({read,apply:n=>applied.push(n),onError:e=>errors.push(e),version:()=>revision,blocked:()=>false,schedule:fn=>scheduled.push(fn),cancel:()=>{}});
  return {sync,applied,errors,scheduled,write:()=>revision++};
}
test('slow reads never overlap, and a local delay change wins over an older read',async()=>{
  let finish,calls=0;
  const h=harness(()=>{calls++;return new Promise(resolve=>finish=resolve);});
  const pending=h.sync.refresh();await h.sync.refresh();assert.equal(calls,1);
  h.write();finish({delay:0});await pending;assert.deepEqual(h.applied,[]);
  assert.equal(h.scheduled.length,1);h.sync.stop();
});
test('leaving a session discards its pending result',async()=>{
  let finish;const h=harness(()=>new Promise(resolve=>finish=resolve));
  const pending=h.sync.refresh();h.sync.stop();finish({id:'old'});await pending;
  assert.deepEqual(h.applied,[]);assert.equal(h.scheduled.length,0);
});
test('background pauses requests and resume immediately refreshes',async()=>{
  let calls=0;const h=harness(async()=>({step:++calls}));
  h.sync.setActive(false);await h.sync.refresh();assert.equal(calls,0);
  h.sync.setActive(true);await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(h.applied,[{step:1}]);h.sync.stop();
});
test('connection failure schedules recovery and a later read succeeds',async()=>{
  let calls=0;const h=harness(async()=>{if(!calls++)throw Error('offline');return {step:2};});
  await h.sync.refresh();assert.equal(h.errors.length,1);
  await h.scheduled[0]();assert.deepEqual(h.applied,[{step:2}]);h.sync.stop();
});

test('reconnect discards the pre-disconnect read and fetches saved progress without overlapping',async()=>{
 let finish,calls=0;const h=harness(()=>++calls===1?new Promise(resolve=>finish=resolve):Promise.resolve({step:3,timer:12345}));
 const old=h.sync.refresh();h.sync.setActive(false);h.sync.setActive(true);
 assert.equal(calls,1);finish({step:1,timer:null});await old;
 assert.deepEqual(h.applied,[]);await h.scheduled.at(-1)();
 assert.deepEqual(h.applied,[{step:3,timer:12345}]);assert.equal(calls,2);h.sync.stop();
});

test('room reveal wins over a pending voting poll and obsolete errors are ignored',async()=>{
 let finish,reject;const h=harness(()=>new Promise((resolve,fail)=>{finish=resolve;reject=fail;}));
 const old=h.sync.refresh();await h.sync.refresh();h.write();finish({phase:'voting'});await old;
 assert.deepEqual(h.applied,[]);
 const failing=h.sync.refresh();h.write();reject(Error('Old failure'));await failing;
 assert.deepEqual(h.errors,[]);h.sync.stop();
});

test('successful room polling clears connection errors without erasing form validation',async()=>{
 let attempts=0,connectionError='',formError='Choose a preference';
 const sync=createEveningSync({read:async()=>{if(!attempts++)throw Error('offline');return {phase:'revealed'};},apply:()=>{connectionError='';},onError:()=>{connectionError='offline';},version:()=>0,blocked:()=>false,schedule:()=>0,cancel:()=>{}});
 await sync.refresh();assert.equal(connectionError,'offline');await sync.refresh();
 assert.equal(connectionError,'');assert.equal(formError,'Choose a preference');sync.stop();
});
