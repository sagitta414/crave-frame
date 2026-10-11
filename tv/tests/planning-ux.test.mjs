import test from 'node:test';
import assert from 'node:assert/strict';
import {choiceLabels,pairingSummary,resumeEvening} from '../src/planning-ux.js';
const meal=(id,minutes,familiar=false)=>({id,name:id,minutes,familiar,ingredients:[],steps:[]});
test('choice labels distinguish saved favorites, documented links and estimated effort',()=>{
 const pairs=[{meal:meal('sandwich',20,true),pairingType:'story',evidenceSource:'https://example.com'},{meal:meal('pasta',10,true)},{meal:meal('pie',40)}];
 const labels=choiceLabels(pairs,{favoriteMeals:['sandwich']});
 assert.ok(labels[0].includes('Closest story connection'));assert.ok(labels[0].includes('Familiar favorite'));
 assert.ok(labels[1].includes('Least cooking effort'));assert.ok(!labels[1].includes('Familiar favorite'));assert.deepEqual(labels[2],[]);
 assert.ok(!choiceLabels([{meal:meal('toast',10),pairingType:'story'}])[0].includes('Closest story connection'));
});
test('brief pairing explanation keeps the interpretation honest',()=>{
 assert.equal(pairingSummary({meal:meal('Sandwich',15),connection:{source:'https://store.paddington.com/news'}}),'A savory sandwich inspired by Paddington’s love of marmalade sandwiches.');
 assert.match(pairingSummary({meal:meal('Pasta',20),pairingType:'practical'}),/no direct story-food connection/);
});
test('return visits resume a current unfinished evening and exclude completed feedback',()=>{
 const n={id:'tonight',status:'planned',created:new Date().toISOString(),planStart:Date.now()};
 assert.equal(resumeEvening([{...n,id:'done',feedback:{}},n]).id,'tonight');
 assert.equal(resumeEvening([{...n,status:'complete'}]),null);
 assert.equal(resumeEvening([{...n,created:'2020-01-01',planStart:1}]),null);
});
