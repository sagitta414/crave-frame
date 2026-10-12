import test from 'node:test';
import assert from 'node:assert/strict';
import {cookingCopy} from '../src/cooking-copy.js';
test('coaching can collapse without hiding the action or safety guidance',()=>{
 const base='Drain the pasta carefully.';
 const copy=cookingCopy(base+'\n\nKeep your face away from the steam.\n\nTaste the pasta for a little bite.',base);
 assert.equal(copy.action,base);
 assert.deepEqual(copy.safety,['Keep your face away from the steam.']);
 assert.deepEqual(copy.tips,['Taste the pasta for a little bite.']);
});
test('unrecognized or unchanged instructions remain fully visible',()=>{
 assert.deepEqual(cookingCopy('Different recipe instruction','Original'),{action:'Different recipe instruction',safety:[],tips:[]});
 assert.deepEqual(cookingCopy('Bake for 20 minutes.','Bake for 20 minutes.'),{action:'Bake for 20 minutes.',safety:[],tips:[]});
});
