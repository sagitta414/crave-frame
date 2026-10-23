import test from 'node:test';import assert from 'node:assert/strict';
import {eveningWays,openingScene,privateTouch} from '../src/catalog/night-director.js';
test('effort alternatives do not invent recipes or duplicate a scarce choice',()=>{
 const pair={meal:{id:'a',name:'Dinner',minutes:20,effort:'Easy'},show:{id:'film',name:'Our film',minutes:90}};
 const ways=eveningWays([pair],pair.show);assert.equal(ways[0].pair,pair);assert.equal(ways[1].pair,null);assert.equal(ways[2].pair,null);
 assert.ok(eveningWays([pair],{id:'other'}).every(w=>!w.pair));assert.equal(openingScene(pair).detail,'20 min cooking · 90 min watching');
 assert.notDeepEqual(privateTouch(0,2),privateTouch(1,2));
});
