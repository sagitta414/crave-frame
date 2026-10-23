import test from 'node:test';
import assert from 'node:assert/strict';
import {nightShortlist,nightPreferences} from '../product/our-night.js';
import {ingredients} from '../product/engine.js';
import {connection} from '../product/curation.js';
import {mealById} from '../product/catalog.js';
test('couples shortlist respects gentle and romantic moods without filling gaps with thrillers',()=>{
 const pair=(id,mood)=>({meal:{id,minutes:15,effort:'Easy'},show:{id,mood}});
 const pool=[pair('crime','Adventure'),pair('romance','Romantic'),pair('cozy','Cozy')];
 assert.deepEqual(nightShortlist(pool,{}, {mood:'Romantic'}).map(p=>p.show.id),['romance']);
 assert.deepEqual(nightShortlist(pool,{}, {mood:'Cozy'}).map(p=>p.show.id),['cozy']);
 assert.deepEqual(nightShortlist([pool[0]],{}, {mood:'Romantic'}),[]);
 assert.equal(nightPreferences({vibe:'Make it special',prefs:{}}).mood,'Romantic');
});
test('ingredient quantities use singular units without changing recipe amounts',()=>{
 const m=mealById('pepper-pasta');
 assert.equal(ingredients(m,2,false).find(i=>i.name==='Garlic').unit,'clove');
 assert.equal(ingredients(m,4,false).find(i=>i.name==='Garlic').unit,'cloves');
});
test('everyday connections explain a concrete fit without inventing story evidence',()=>{
 const c=connection(mealById('pepper-pasta'),{id:'test',name:'Test story',minutes:54,kind:'TV episode',mood:'Adventure',cuisine:'Any'});
 assert.equal(c.pairingType,'practical');assert.equal(c.source,undefined);
 assert.match(c.tableEcho,/20-minute dinner/);assert.match(c.tableEcho,/54-minute episode/);
});
