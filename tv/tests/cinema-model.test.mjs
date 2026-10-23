import test from 'node:test';
import assert from 'node:assert/strict';
import {cinemaRows,refinedPreferences,chooseSpotlight} from '../src/cinema-model.js';
const pair=(id,kind='Movie',minutes=90)=>({meal:{id:'meal-'+id,minutes:20,familiar:true},show:{id,name:id,kind,minutes,mood:'Cozy',family:true}});
test('evening shelves retain complete pairs, avoid duplicate titles, and separate episodes',()=>{
 const movie=pair('movie'),episode=pair('episode','TV episode',25),long=pair('long','TV episode',80);
 const rows=cinemaRows([movie,movie,episode,long]);
 assert.equal(rows.find(r=>r.id==='for-you').pairs.length,3);
 assert.equal(rows.length,1);
 assert.deepEqual(rows[0].pairs,[movie,episode,long]);
 assert.ok(!rows.some(r=>r.id==='favorites'));
});
test('refinement preserves dietary and audience limits and never raises a short cook limit',()=>{
 const prefs={diet:'Plant-based',family:true,people:3,watchTime:45,cookTime:15,effort:'Any',mood:'Adventure'};
 const next=refinedPreferences(prefs,pair('a'),'easy');
 assert.deepEqual(next,{...prefs,effort:'Easy'});
 assert.deepEqual(refinedPreferences(prefs,pair('a'),'similar'),{...prefs,mood:'Cozy'});
 assert.equal(prefs.effort,'Any');
});
test('shelves choose diverse existing dinners without inventing pairs or dropping a title',()=>{
 const first=pair('first'),second=pair('second');
 first.meal={...first.meal,id:'pizza',category:'Pizza'};
 second.meal={...second.meal,id:'pizza',category:'Pizza'};
 const alternative={...second,meal:{...second.meal,id:'pasta',category:'Pasta'}};
 const selected=cinemaRows([first,second,alternative],[],m=>m.id==='pizza')[0].pairs;
 assert.deepEqual(selected,[first,alternative]);
 assert.deepEqual(cinemaRows([first,second])[0].pairs,[first,second]);
});

test('discovery shelves never repeat a title and retain the small catalog',()=>{
 const inputs=Array.from({length:9},(_,i)=>pair('title-'+i,i%2?'TV episode':'Movie',25));
 const rows=cinemaRows(inputs),items=rows.flatMap(r=>r.pairs);
 assert.equal(rows[0].pairs.length,3);
 assert.equal(new Set(items.map(p=>p.show.id)).size,9);
 assert.equal(items.length,9);
});

test('spotlight prefers an eligible signature pairing without sacrificing reviewed imagery',()=>{
 const generic=pair('generic'); generic.meal.name='Easy dinner';
 const signature={meal:{id:'grilled-cheese-soup',name:'Grilled cheese and tomato soup',familiar:true},show:{id:'paddington',name:'Paddington'}};
 assert.equal(chooseSpotlight([generic,signature],()=>true,()=>true),signature);
 assert.equal(chooseSpotlight([generic,signature],m=>m.id===generic.meal.id,()=>true),generic);
 assert.equal(chooseSpotlight([generic],()=>true),generic);
 assert.equal(chooseSpotlight([],()=>true),undefined);
});
