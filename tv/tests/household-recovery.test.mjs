import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecoveredHousehold} from '../src/household-recovery.js';
import {artworkFor} from '../src/catalog/artwork.js';
test('failed creation never replaces existing household access',async()=>{
 let key='existing';
 await assert.rejects(createRecoveredHousehold(async()=>{throw Error('offline');},async value=>{key=value;}));
 assert.equal(key,'existing');
 await assert.rejects(createRecoveredHousehold(async()=>({}),async value=>{key=value;}));
 assert.equal(key,'existing');
});
test('new household is usable only after its key is persisted',async()=>{
 await assert.rejects(createRecoveredHousehold(async()=>({key:'new'}),async()=>{throw Error('storage full');}));
 let key='existing';const house=await createRecoveredHousehold(async()=>({key:'new'}),async value=>{key=value;});
 assert.equal(key,house.key);
});
test('title artwork uses verified metadata, never shared scenery',()=>{
 assert.equal(artworkFor({id:'detectorists'}),null);
 assert.match(artworkFor({id:'paddington'}).image,/image.tmdb.org/);
 assert.notEqual(artworkFor({id:'paddington'}).image,artworkFor({id:'chef'}).image);
 assert.equal(artworkFor({id:'unknown',scene:'manor'}),null);
});
