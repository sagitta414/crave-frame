import {eveningTheme} from '../src/theme.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {mealById,defaults} from '../src/catalog/catalog.js';
import {ingredients,recipeSteps} from '../src/catalog/engine.js';
import {cookingCopy} from '../src/cooking-copy.js';
import {cookingProgress} from '../src/cooking-state.js';

test('recipe help opens ingredients and coaching, and can reopen after closing',()=>{
 const states=[],effects=[],deps=[];let cursor=0,effectCursor=0;
 const React={useRef:initial=>({current:initial}),useState:initial=>{const i=cursor++;if(!(i in states))states[i]=initial;return [states[i],v=>states[i]=typeof v==='function'?v(states[i]):v];},useEffect:(fn,next)=>{const i=effectCursor++;if(!deps[i]||next.some((v,j)=>v!==deps[i][j]))effects.push(fn);deps[i]=next;}};
 const jsx=(type,props)=>({type,props});
 const modules={'./theme':{eveningTheme},'./PartnerKitchen':{PartnerKitchen:'PartnerKitchen'},'./CoupleMoment':{CoupleMoment:'CoupleMoment'},'react':React,'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{ScrollView:'ScrollView',View:'View',StyleSheet:{create:x=>x},useWindowDimensions:()=>({width:1200})},'expo-linear-gradient':{LinearGradient:'Gradient'},'./TVText':{Text:'Text'},'./TVButton':{TVButton:'Button'},'./DinnerReady':{DinnerReady:'DinnerReady'},'./DeliveryCompanion':{DeliveryCompanion:'Delivery'},'./CookingChecklist':{CookingChecklist:'Checklist'},'./RecipeArt':{RecipeArt:'Art'},'./catalog/engine':{ingredients,recipeSteps},'./catalog/catalog':{mealById},'./cooking-copy':{cookingCopy},'./cooking-state':{cookingProgress}};
 const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/CookingScreen.tsx',import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>{assert.ok(modules[id],id);return modules[id];}});
 const night={mealId:'pepper-pasta',prefs:{...defaults,cookLevel:'Beginner'},step:0,status:'cooking',adapted:false};
 const render=(request,preview=false,previewStep=0,extra={})=>{cursor=0;effectCursor=0;const tree=exports.CookingScreen({night,tick:Date.now(),helpRequest:request,preview,previewStep,...extra});while(effects.length)effects.shift()();return tree;};
 const buttons=tree=>{if(!tree||typeof tree!=='object')return [];if(Array.isArray(tree))return tree.flatMap(buttons);return [...(tree.type==='Button'?[tree]:[]),...buttons(tree.props?.children)];};
 render(0);assert.equal(states[0],false);
 render(1);assert.equal(states[0],true);assert.equal(states[3],true);
 const close=buttons(render(1)).find(b=>b.props.children==='Hide ingredients');assert.ok(close);close.props.onPress();assert.equal(states[0],false);
 render(2);assert.equal(states[0],true);assert.equal(states[3],true);
 const find=(tree,type)=>!tree||typeof tree!=='object'?null:Array.isArray(tree)?tree.map(x=>find(x,type)).find(Boolean):tree.type===type?tree:find(tree.props?.children,type);
 night.status='planned';
 const preview=render(2,true);assert.equal(buttons(preview).find(b=>b.props.children==='Start cooking').props.disabled,true);
 find(preview,'Checklist').props.onReady(true);assert.equal(buttons(render(2,true)).find(b=>b.props.children==='Start cooking').props.disabled,false);
 night.prefs={...night.prefs,cookLevel:'Confident'};render(2,true);
 assert.equal(buttons(render(2,true)).find(b=>b.props.children==='Start cooking').props.disabled,true,'a changed guidance level requires preparation review');
 night.status='ready';
 assert.ok(find(render(2),'DinnerReady'),'completion shows the saved-viewing celebration');
 assert.ok(find(render(2,true),'DinnerReady'),'remote completion overrides a stale preview flag');
 assert.ok(!find(render(2,true),'Checklist'));
 night.status='cooking';assert.ok(!find(render(2,true),'Checklist'),'remote cooking start exits preview');
 for(const status of ['ready','complete']){night.status=status;for(let i=0;i<mealById(night.mealId).steps.length;i++){night.step=i;const labels=buttons(render(2)).map(b=>b.props.children);assert.ok(!labels.some(label=>['Start timer','Stop timer','← Previous','Next step →','Dinner is ready ✓'].includes(label)));}}
 night.status='planned';night.mealId='chicken-couscous-bowls';assert.doesNotThrow(()=>render(2,true,4));night.mealId='story-ratatouille';assert.doesNotThrow(()=>render(2,true,4),'shorter replacement recipe clamps the previous step');assert.doesNotThrow(()=>render(2,true,-1));
 let handoffs=0,starts=0;const handoffProps={onPhone:()=>handoffs++,onStart:()=>starts++};
 for(const status of ['planned','cooking','ready']){night.status=status;const tree=render(2,status==='planned',0,handoffProps);const send=buttons(tree).find(b=>b.props.children==='Send to phone');assert.ok(send,'handoff remains reachable in '+status);send.props.onPress();assert.equal(starts,0);}
 assert.equal(handoffs,3);assert.equal(buttons(render(2,false,0,{...handoffProps,busy:true})).find(b=>b.props.children==='Send to phone').props.disabled,true);
 assert.ok(!buttons(render(2,false,0,{...handoffProps,phone:true})).some(b=>b.props.children==='Send to phone'));
 night.status='planned';night.fulfillment='delivery';assert.ok(find(render(2,true),'Delivery'),'delivery never exposes recipe preview or cooking controls');
 assert.equal(buttons(render(2,true)).length,0);

 night.status='cooking';delete night.fulfillment;night.prefs.people=2;
 const flatten=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flatten):[n,...flatten(n.props?.children)];
 const phoneTree=flatten(render(0,false,0,{phone:true}));
 assert.ok(phoneTree.findIndex(n=>n.type==='PartnerKitchen')>phoneTree.findIndex(n=>n.type==='Gradient'),'phone recipe precedes optional partner roles');
 assert.equal(phoneTree.some(n=>n.type==='Art'),false,'active phone recipe omits the tall photo');
 night.status='ready';assert.ok(find(render(0,false,0,{phone:true}),'PartnerKitchen'),'ready dinner retains partner feedback and memories');
});
