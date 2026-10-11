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
