import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {meals,shows,defaults} from '../src/catalog/catalog.js';
import {recommend,ingredients,recipeSteps} from '../src/catalog/engine.js';
test('native catalog preserves complete recipes and both planning directions',()=>{
 assert.equal(meals.length,519);
 for(const m of meals){assert.ok(ingredients(m,4,true).length);assert.ok(recipeSteps(m,true).every(s=>!/[{}]/.test(s.instruction)));}
 assert.equal(recommend({mode:'meal',sourceId:'mushroom-toast',prefs:defaults}).length,3);
 assert.equal(recommend({mode:'watch',sourceId:'avengers',prefs:{...defaults,watchTime:180}}).length,3);
});
test('native candidate limits preserve food preference and available time',()=>{
 const picks=recommend({mode:'watch',sourceId:'avengers',prefs:{...defaults,watchTime:180,diet:'Meat & poultry'}});
 assert.ok(picks.length);assert.ok(picks.every(p=>p.meal.foodType==='Meat & poultry'&&p.meal.minutes<=30));
 assert.equal(recommend({mode:'watch',sourceId:'avengers',prefs:{...defaults,watchTime:30}}).length,0);
});
test('Android launcher is TV-capable and requires no touchscreen',()=>{
 const manifest=readFileSync(new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url),'utf8');
 assert.match(manifest,/LEANBACK_LAUNCHER/);assert.match(manifest,/android.hardware.touchscreen" android:required="false"/);assert.match(manifest,/android:banner=/);
});
