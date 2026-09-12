import test from 'node:test';
import assert from 'node:assert/strict';
import {meals,defaults} from '../product/catalog.js';
import {recipeSteps} from '../product/engine.js';
import {openDb} from '../server/local-db.js';
import {api} from '../server/worker.js';
test('skill levels change guidance while preserving every recipe step and timer',()=>{
 for(const meal of meals){const base=recipeSteps(meal,true,'Confident');for(const level of ['Beginner','Regular']){const adapted=recipeSteps(meal,true,level);assert.equal(adapted.length,base.length);adapted.forEach((step,i)=>{assert.equal(step.seconds,base[i].seconds);assert.equal(step.title,base[i].title);assert.ok(step.instruction.startsWith(base[i].instruction));});}assert.ok(recipeSteps(meal,true,'Beginner').some((s,i)=>s.instruction!==base[i].instruction));}
});
test('cooking level persists and invalid values are rejected',async()=>{
 const DB=openDb(),env={DB};try{const {key}=await (await api(new Request('https://test/api/household',{method:'POST'}),env)).json();const headers={'content-type':'application/json','x-household-key':key};
 for(const level of ['Beginner','Confident']){const r=await api(new Request('https://test/api/preferences',{method:'PUT',headers,body:JSON.stringify({prefs:{...defaults,cookLevel:level}})}),env);assert.equal(r.status,200);const h=await (await api(new Request('https://test/api/household',{headers}),env)).json();assert.equal(h.prefs.cookLevel,level);}
 const bad=await api(new Request('https://test/api/preferences',{method:'PUT',headers,body:JSON.stringify({prefs:{...defaults,cookLevel:'invalid'}})}),env);assert.equal(bad.status,400);
 }finally{DB.close();}
});

test('beginner preparation names the actual recipe and approved substituted ingredients',()=>{const meal=meals.find(m=>m.id==='margherita');const step=recipeSteps(meal,true,'Beginner')[0];assert.ok(step.instruction.includes(meal.name));assert.ok(step.instruction.includes(meal.swap.to));assert.ok(!step.instruction.includes('measure out Mozzarella'));});
