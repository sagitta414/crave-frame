import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cookingProgress} from '../src/cooking-state.js';
test('last cooking step is not complete until dinner is marked ready; previews never complete steps',()=>{
 assert.deepEqual(cookingProgress({status:'cooking',step:4},5),{completed:4,percent:80});
 assert.deepEqual(cookingProgress({status:'ready',step:4},5),{completed:5,percent:100});
 assert.deepEqual(cookingProgress({status:'ready',step:4},5,true),{completed:0,percent:0});
 assert.deepEqual(cookingProgress({status:'planned',step:0},5),{completed:0,percent:0});
});
test('TV QR and legacy cooking links converge on the same cooking component',()=>{
 const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
 const web=readFileSync(new URL('../../web/product/main.js',import.meta.url),'utf8');
 assert.match(app,/setShare\(API_ORIGIN\+'\/tv\/\?cook='/);
 assert.match(app,/return <CookingScreen night=\{night\} phone=\{!!cookKey\}/);
 assert.match(web,/location.replace\('\/tv\/\?cook='\+encodeURIComponent\(sharedKey\)\)/);
 assert.match(web,/shareLink=location.origin\+'\/tv\/\?cook='/);
});
