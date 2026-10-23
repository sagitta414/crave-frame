import test from 'node:test';
import assert from 'node:assert/strict';
import {viewingFit} from '../product/viewing-fit.js';
import {connection,curate} from '../product/curation.js';
import {mealById,defaults} from '../product/catalog.js';

test('imported genre provides a practical explanation without invented scenes or food claims',()=>{
 const meal=mealById('chicken-quesadillas'),show={id:'tmdb-tv-999-1-1',name:'An imported mystery',genre:'Crime · Mystery',minutes:40,kind:'TV episode',cuisine:'Any',mood:'Cozy',source:'https://example.test/title'};
 const why=connection(meal,show);
 assert.equal(why.pairingType,'practical');assert.match(why.text,/An imported mystery/);assert.match(why.text,/serving interruptions/);assert.match(why.text,/not a dish from the story/);
 assert.notEqual(viewingFit(meal,show).line,viewingFit(meal,{...show,genre:'Romance'}).line);
 assert.equal(viewingFit(meal,{...show,genre:''}),null);
 const picks=curate({mode:'watch',sourceId:show.id,titles:[show],prefs:{...defaults,cookTime:15,watchTime:45},memory:{dislikedMeals:[meal.id]}});
 assert.ok(picks.every(p=>p.meal.minutes<=15&&p.meal.id!==meal.id));
});

test('practical suggestions do not invent serving vessels for non-bowl meals',()=>{const fit=viewingFit({name:'Roast chicken and potatoes',minutes:30},{name:'A comedy',genre:'Comedy'});assert.match(fit.line,/Serve Roast chicken/);assert.doesNotMatch(fit.line,/bowls/);assert.ok(viewingFit({name:'Pizza'},{name:'Mystery',genre:'Mystery'}).score<=10);});


test('editorial choices cover three distinct dinners per built-in title and preserve imported episode identity',async()=>{
 const {signatureEvenings,signatureFor}=await import('../product/signature-evenings.js');
 const counts=new Map();for(const entry of signatureEvenings){assert.equal(mealById(entry.meal).id,entry.meal);const group=counts.get(entry.show)||new Set();assert.ok(!group.has(entry.meal));group.add(entry.meal);counts.set(entry.show,group);}
 for(const choices of counts.values())assert.ok(choices.size>=3);
 const meal=mealById('loaded-baked-potatoes');
 assert.ok(signatureFor(meal,{id:'imported',name:'Detectorists — S1 E1',kind:'TV episode',provider:{type:'tv',id:61897,season:1,episode:1}}));
 assert.equal(signatureFor(meal,{id:'different',name:'Detectorists — S2 E1',kind:'TV episode',provider:{type:'tv',id:61897,season:2,episode:1}}),undefined);
});
