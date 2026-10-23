import test from 'node:test';
import assert from 'node:assert/strict';
import {resetSearchScroll} from '../src/search-scroll.js';
test('Silk search resets the document rather than its non-scrolling inner view',()=>{
 const page={scrollTop:900};let innerCalls=0;
 const doc={querySelector:()=>null,documentElement:{getAttribute:()=> 'true'},scrollingElement:page};
 assert.equal(resetSearchScroll(doc,{scrollTo:()=>innerCalls++}),true);
 assert.equal(page.scrollTop,0);assert.equal(innerCalls,0);
});
test('browser and native search reset the view without moving the document',()=>{
 const calls=[],view={scrollTo:value=>calls.push(value)},page={scrollTop:120};
 resetSearchScroll({querySelector:()=>null,documentElement:{getAttribute:()=>null},scrollingElement:page},view);
 resetSearchScroll(null,view);
 assert.deepEqual(calls,[{y:0,animated:false},{y:0,animated:false}]);assert.equal(page.scrollTop,120);
});
test('a search response cannot scroll behind an open modal',()=>{
 const page={scrollTop:400};let calls=0;
 assert.equal(resetSearchScroll({querySelector:()=>({}),scrollingElement:page},{scrollTo:()=>calls++}),false);
 assert.equal(page.scrollTop,400);assert.equal(calls,0);
});
