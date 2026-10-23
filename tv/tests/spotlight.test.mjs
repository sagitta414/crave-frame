import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseSpotlight} from '../src/cinema-model.js';
const pair=(id,name)=>({meal:{id,name},show:{id:'show-'+id}});
test('spotlight prefers a reviewed recipe image and readable name within eligible results',()=>{
 const noPhoto=pair('a','A very long dinner name without a matching photograph'),long=pair('b','A very long dinner name with a matching photograph'),short=pair('c','Chicken quesadillas');
 assert.equal(chooseSpotlight([noPhoto,long,short],m=>m.id!=='a',m=>m.id==='c'),short);
 assert.equal(chooseSpotlight([noPhoto],()=>false),noPhoto);
 assert.equal(chooseSpotlight([],()=>true),undefined);
});
test('spotlight never mutates eligible choices or substitutes a different recipe',()=>{
 const list=[pair('a','Pasta'),pair('b','Tacos')],before=list.slice();
 const result=chooseSpotlight(list,()=>true);assert.equal(result,list[0]);assert.deepEqual(list,before);
});
