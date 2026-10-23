import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {mealById,defaults} from '../product/catalog.js';
import {recipeSteps} from '../product/engine.js';
import {curate} from '../product/curation.js';
import {createAiUI} from '../product/ai-ui.js';
import {curatedMovieNights,movieNightById,movieNights} from '../product/movie-nights.js';

test('catalog concierge bookmarks offer working planning actions without AI promises',async t=>{
 const previous=globalThis.document;globalThis.document={addEventListener(){}};t.after(()=>{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;});
 let destination='';const ui=createAiUI({get:()=>({household:{capabilities:{connected:false}},draft:{prefs:defaults}}),go:path=>destination=path});
 for(const html of [ui.home(),ui.page()]){assert.match(html,/data-action="start" data-mode="watch"/);assert.match(html,/data-mode="meal"/);assert.doesNotMatch(html,/Gemini|ai-send|Live AI is off/);}
 await ui.actions['ai-home']();assert.equal(destination,'home');
});
test('broccoli pasta only names its own sauce ingredients and does not repeat guidance',()=>{
 const meal=mealById('recipe-broccoli-and-garlic-pasta');
 for(const level of ['Beginner','Regular','Confident']){
  const steps=recipeSteps(meal,false,level,2),text=steps.map(s=>s.instruction).join('\n');
  assert.match(text,/broccoli/i);assert.doesNotMatch(text,/mushroom|zucchini|eggplant|tomato|spinach|basil|lemon/i);
  assert.ok((text.match(/For this pasta, taste/g)||[]).length<=1);
 }
 assert.equal(mealById('story-ratatouille').category,'Vegetable suppers');
});
test('editorial nights have distinct explanations, real meals and compatible saved links',()=>{
 assert.equal(curatedMovieNights.length,20);assert.equal(new Set(curatedMovieNights.map(n=>n.mealId)).size,20);
 for(const n of curatedMovieNights){assert.equal(mealById(n.mealId).name,n.mealName);assert.equal(movieNightById(n.id),n);assert.ok(n.description.length>60);}
 for(const n of movieNights)assert.equal(movieNightById(n.id),n);
 const hero=curate({prefs:defaults})[0];assert.ok(hero.meal.hasDishPhoto);
});
test('takeout needs an explicit valid ETA, survives other actions and clears on provider change',async()=>{
 const handlers=new Map(),nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{disabled:false,value:'',textContent:'',addEventListener:(type,fn)=>handlers.set(id+':'+type,fn)});return nodes.get(id);};
 let html='';const providers=['doordash','ubereats'].map(provider=>({dataset:{provider}}));
 const app={setAttribute(){},get innerHTML(){return html;},set innerHTML(value){html=value;node('#confirm-order').disabled=/id="confirm-order" disabled/.test(value);},querySelector:id=>node(id),querySelectorAll:selector=>selector==='[data-provider]'?providers:selector==='button'?[node('#confirm-order')]:[]};
 const fixture={kind:'order',meal:'Dinner',show:'Movie',people:2,diet:'No preference',budget:'£20',preferredProvider:'doordash',strategies:[{id:'same',label:'Same dish',query:'dinner',detail:'Find dinner'}]};
 const context=vm.createContext({document:{querySelector:id=>id==='#app'?app:id==='#status'?node(id):node(id)},location:{search:'?key=test'},URLSearchParams,AbortController,setTimeout,clearTimeout,setInterval(){},fetch:async()=>({ok:true,json:async()=>fixture}),navigator:{clipboard:{writeText:async()=>{}}}});
 vm.runInContext(readFileSync(new URL('../product/companion.js',import.meta.url),'utf8'),context);
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(html,/placeholder="Enter the provider estimate" required value=""/);assert.equal(node('#confirm-order').disabled,true);
 for(const value of ['', '0','14','121','35.5']){handlers.get('#eta:input')({target:{value}});assert.equal(node('#confirm-order').disabled,true);}
 handlers.get('#eta:input')({target:{value:'40'}});assert.equal(node('#confirm-order').disabled,false);
 providers[1].onclick();assert.equal(node('#confirm-order').disabled,true);
 await node('#copy').onclick();assert.equal(node('#confirm-order').disabled,true);
});
