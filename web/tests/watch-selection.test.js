import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,registerShows} from '../product/catalog.js';
import {selectedWatchPrefs,recommend} from '../product/engine.js';
test('searched Avengers movies receive sufficient viewing time and three dinners',()=>{
 for(const [id,minutes] of [[24428,143],[99861,141],[299536,149],[299534,181]]){
 const show={id:'tmdb-movie-'+id,name:'Avengers test '+id,minutes,kind:'Movie',mood:'Adventure',cuisine:'Any',family:false,source:'https://www.themoviedb.org/movie/'+id,provider:{type:'movie',id}};
 registerShows([show]);assert.equal(recommend({mode:'watch',sourceId:show.id,prefs:defaults}).length,0);
 const prefs=selectedWatchPrefs(defaults,show);assert.ok(prefs.watchTime>=minutes);assert.equal(prefs.cookTime,defaults.cookTime);assert.equal(prefs.diet,defaults.diet);
 assert.equal(recommend({mode:'watch',sourceId:show.id,prefs}).length,3);
 assert.equal(recommend({mode:'watch',sourceId:show.id,prefs:{...prefs,watchTime:120}}).length,0);
 }
});
test('selecting a shorter episode preserves the existing viewing budget',()=>{assert.equal(selectedWatchPrefs({...defaults,watchTime:240},{minutes:29,mood:'Cozy'}).watchTime,240);});
