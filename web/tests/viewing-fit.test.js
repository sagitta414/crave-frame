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
