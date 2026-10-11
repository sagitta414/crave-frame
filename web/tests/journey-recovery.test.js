import test from 'node:test';
import assert from 'node:assert/strict';
import {openDb} from '../server/local-db.js';
import {api} from '../server/worker.js';
import {defaults,mealById} from '../product/catalog.js';
import {instructionForLevel} from '../product/cooking-level.js';
import {isStaleEvening} from '../product/evening.js';
test('clearing saved exclusions removes them after a fresh household read',async()=>{
 const DB=openDb(),env={DB};const call=async(path,method,data,key)=>(await api(new Request('https://test/api/'+path,{method,headers:{'content-type':'application/json',...(key?{'x-household-key':key}:{})},...(data?{body:JSON.stringify(data)}:{})}),env)).json();
 try{const h=await call('household','POST',{});await call('preferences','PUT',{prefs:defaults,memory:{shorter:false,allergies:['Milk'],dislikedIngredients:['mushrooms']}},h.key);await call('preferences','PUT',{prefs:defaults,memory:{shorter:false,allergies:[],dislikedIngredients:[]}},h.key);const read=await call('household','GET',null,h.key);assert.deepEqual(read.memory.allergies,[]);assert.deepEqual(read.memory.dislikedIngredients,[]);}finally{DB.close();}
});
test('finishing a flatbread does not repeat the sauce topping instruction',()=>{
 const meal={name:'Basil & tomato flatbreads'};
 assert.doesNotMatch(instructionForLevel('Scatter basil over the top and cut into wedges.','Regular',{meal,stepIndex:3}),/thin layer/);
 assert.match(instructionForLevel('Spread with tomato sauce, add mozzarella.','Regular',{meal,stepIndex:1}),/thin layer/);
});
test('old cooking sessions offer a fresh plan, while active and finished sessions do not',()=>{
 const now=Date.now(),old={status:'cooking',planStart:now-24*3600000,progressAt:now-20*3600000};
 assert.equal(isStaleEvening(old,now),true);assert.equal(isStaleEvening({...old,progressAt:now-60000},now),false);assert.equal(isStaleEvening({...old,status:'complete'},now),false);assert.equal(isStaleEvening({...old,watchStarted:now},now),false);assert.equal(isStaleEvening({...old,fulfillment:'delivery'},now),false);
});
