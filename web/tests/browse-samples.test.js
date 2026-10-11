import test from 'node:test';
import assert from 'node:assert/strict';
import {browseSamples} from '../server/browse-samples.js';
test('dashboard samples vary meal formats and retain only eligible input pairs',()=>{
 const pair=(id,category,familiar=true)=>({show:{id:'movie'},meal:{id,category,familiar},connection:{kind:'Mood'}});
 const input=[pair('pizza1','Pizza'),pair('pizza2','Pizza'),pair('pasta','Pasta'),pair('soup','Soup'),pair('wrap','Wrap')];
 const result=browseSamples(input);
 assert.equal(result.length,4);assert.equal(new Set(result.map(p=>p.meal.category)).size,4);
 assert.ok(result.every(p=>input.includes(p)));assert.deepEqual(browseSamples([]),[]);
});
test('each title appears before second dinners and the payload remains bounded',()=>{
 const input=Array.from({length:40},(_,i)=>Array.from({length:4},(_,j)=>({show:{id:String(i)},meal:{id:i+'-'+j,category:String(j),familiar:true}}))).flat();
 const result=browseSamples(input);assert.equal(result.length,120);assert.equal(new Set(result.slice(0,40).map(p=>p.show.id)).size,40);
});
