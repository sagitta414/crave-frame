import test from 'node:test';
import assert from 'node:assert/strict';
import {createOrderConfirmationSync} from '../src/order-confirmation-sync.js';
const confirmation={confirmationId:'one',etaMinutes:35};
test('blocked and failed saves retry; only successful persistence completes polling',async()=>{
 let attempt=0;const scheduled=[];
 const sync=createOrderConfirmationSync({read:async()=>({confirmation}),apply:async()=>{attempt++;if(attempt===1)return undefined;if(attempt===2)throw Error('offline');return true;},schedule:fn=>scheduled.push(fn),cancel:()=>{}});
 await sync.poll();assert.equal(scheduled.length,1);
 await scheduled.shift()();assert.equal(scheduled.length,1);
 await scheduled.shift()();assert.equal(scheduled.length,0);assert.equal(attempt,3);
 await sync.poll();assert.equal(attempt,3);
});
test('closing a handoff before its read completes prevents applying confirmation',async()=>{
 let finish,applied=0,scheduled=0;
 const sync=createOrderConfirmationSync({read:()=>new Promise(resolve=>finish=resolve),apply:async()=>{applied++;return true;},schedule:()=>scheduled++,cancel:()=>{}});
 const pending=sync.poll();sync.stop();finish({confirmation});await pending;
 assert.equal(applied,0);assert.equal(scheduled,0);
});
test('polling waits for the save and never overlaps requests',async()=>{
 let finish,reads=0,applied=0;const scheduled=[];
 const sync=createOrderConfirmationSync({read:async()=>{reads++;return {confirmation};},apply:()=>{applied++;return new Promise(resolve=>finish=resolve);},schedule:fn=>scheduled.push(fn),cancel:()=>{}});
 const pending=sync.poll();await new Promise(resolve=>setImmediate(resolve));await sync.poll();assert.equal(reads,1);assert.equal(applied,1);finish(true);await pending;assert.equal(scheduled.length,0);
});
