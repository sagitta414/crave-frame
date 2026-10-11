import test from 'node:test';
import assert from 'node:assert/strict';
import {mayCancelRequest,cancelPending} from '../src/request-policy.js';
test('Back cancels suggestions but cannot cancel a timer stop or saved-plan write',async()=>{
 const timer=new AbortController(),suggestion=new AbortController(),save=new AbortController();
 const pending=new Map([[timer,mayCancelRequest('nights/test','PATCH')],[suggestion,mayCancelRequest('recommendations','POST')],[save,mayCancelRequest('nights','POST')]]);
 cancelPending(pending);assert.equal(timer.signal.aborted,false);assert.equal(save.signal.aborted,false);assert.equal(suggestion.signal.aborted,true);
 assert.equal(mayCancelRequest('shared/test','PATCH'),false);
});
