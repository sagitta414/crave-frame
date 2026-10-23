import test from 'node:test';
import assert from 'node:assert/strict';
import {sharedRevealCopy} from '../src/shared-reveal-copy.js';
test('reveal copy never exposes preferences before the reveal',()=>{
 const room={members:[{name:'Alex',mood:'Cozy',energy:'Exhausted'}],prefs:{cookTime:30,watchTime:90}};
 for(const phase of ['gathering','voting'])assert.equal(sharedRevealCopy({...room,phase}),null);
 const result=sharedRevealCopy({...room,phase:'revealed'});assert.match(result.choices,/Alex chose cozy/);assert.match(result.limits,/30 minutes cooking/);assert.ok(!JSON.stringify(result).includes('Exhausted'));assert.match(result.closing,/compromises/);
});
