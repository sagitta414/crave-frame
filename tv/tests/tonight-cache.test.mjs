import test from 'node:test';
import assert from 'node:assert/strict';
import {tonightEntry} from '../src/tonight-cache.js';
test('Tonight survives remounts, remembers selection and refreshes explicitly',async()=>{
 const entry=tonightEntry('household-a');let calls=0;const loader=async()=>({picks:[++calls]});
 await Promise.all([entry.load(loader),entry.load(loader)]);entry.position=2;
 const returned=tonightEntry('household-a');assert.equal(returned.position,2);
 assert.deepEqual((await returned.load(loader)).picks,[1]);assert.equal(calls,1);
 returned.clear();assert.equal(returned.position,0);assert.deepEqual((await returned.load(loader)).picks,[2]);
 assert.equal(tonightEntry('other-preferences').result,null);
});
test('failed Tonight request can retry and an obsolete response cannot replace a refresh',async()=>{
 const entry=tonightEntry('failure');await assert.rejects(entry.load(()=>{throw Error('offline');}));
 assert.equal(entry.pending,null);let finish;const old=entry.load(()=>new Promise(resolve=>{finish=resolve;}));
 await Promise.resolve();entry.clear();await entry.load(async()=>({picks:['new']}));
 finish({picks:['old']});await old;assert.deepEqual(entry.result.picks,['new']);
});
