import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
import {mealById,showById,defaults} from '../src/catalog/catalog.js';
import {recipeSteps} from '../src/catalog/engine.js';
import {projectEvening} from '../src/schedule.js';
import {delayEvening} from '../src/catalog/evening.js';
import {heroPairingLine} from '../src/planning-ux.js';
import {signatureEvenings} from '../src/catalog/signature-evenings.js';
const jsx=(type,props)=>({type,props});
const nodes=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(nodes):[n,...nodes(n.props?.children)];
function component(name){const source=readFileSync(new URL('../src/Experience.tsx',import.meta.url),'utf8'),ast=ts.createSourceFile('Experience.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name),exports={};vm.runInNewContext(ts.transpileModule(fn.getText(ast),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:()=>({jsx,jsxs:jsx}),View:'View',Text:'Text',Button:'Button',BrandMark:'Brand',s:{},mealById,showById,recipeSteps,projectEvening,delayEvening,clock:n=>new Date(n).toISOString(),useEffect:()=>{},Platform:{OS:'android'},FocusScope:{Provider:'Scope'},delayChoices:[5,15,30]});return exports[name];}
const night={id:'n',mealId:'tomato-pasta',showId:'paddington',prefs:defaults,status:'planned',planStart:Date.now()+600000,created:new Date().toISOString()};
test('one primary action follows planning, cooking, viewing and recovery without duplicate phone buttons',()=>{
 const Advisor=component('TonightAdvisor'),cook=()=>{},phone=()=>{},watch=()=>{},review=()=>{};
 const props={night,onCook:cook,onPhone:phone,onWatch:watch,onReview:review};
 for(const [patch,extra,label,callback] of [[{}, {},'Send to phone',phone],[{status:'cooking'}, {},'Continue cooking',cook],[{status:'ready'}, {},'Start viewing',watch],[{}, {syncError:'offline'},'Reconnect phone',phone]]){
 const tree=Advisor({...props,...extra,night:{...night,...patch}}),buttons=nodes(tree).filter(n=>n.type==='Button'),primary=buttons.filter(n=>n.props.primary);
 assert.equal(primary.length,1);assert.ok(JSON.stringify(primary[0].props.children).includes(label));assert.equal(primary[0].props.onPress,callback);assert.equal(buttons.filter(n=>n.props.onPress===phone).length,1);
 }
});
test('delay summary shows the shared projection before and after without mutating the evening',()=>{
 const Delay=component('DelaySchedule'),before=projectEvening(night,mealById(night.mealId),showById(night.showId)).schedule,updated=delayEvening(night,15,Date.now(),before[2].at),after=projectEvening(updated,mealById(night.mealId),showById(night.showId)).schedule;
 const saved=JSON.stringify(night),tree=Delay({night,minutes:15,onApply:()=>{},busy:true}),text=JSON.stringify(tree);
 for(const time of [before[2].at,before[3].at,after[2].at,after[3].at])assert.ok(text.includes(new Date(time).toISOString()));
 assert.equal(JSON.stringify(night),saved);assert.equal(nodes(tree).find(n=>n.props?.focusKey==='apply-delay').props.disabled,true);
});
test('featured explanations remain brief and retain the full editorial wording separately',()=>{
 for(const entry of signatureEvenings){const line=heroPairingLine({meal:mealById(entry.meal),show:showById(entry.show)},entry);assert.ok(line.length<=160,line);assert.ok(entry.line.length);}
 const line=heroPairingLine({meal:{minutes:20},show:{name:'Unknown movie'}});assert.match(line,/20 minutes/);assert.doesNotMatch(line,/scene|on-screen/);
});
test('celebration is a single entrance, cleans up, and becomes static with reduced motion',()=>{
 let reduced=false,ref,previous,cleanup,starts=0,stops=0,current=1;
 class Value{constructor(n){current=n;}stopAnimation(){}setValue(n){current=n;}interpolate(){return 1;}}
 const React={useContext:()=>reduced,useRef:v=>ref||=( {current:v}),useEffect:(fn,deps)=>{if(!previous||deps.some((v,i)=>v!==previous[i])){cleanup?.();cleanup=fn();}previous=deps;}};
 const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/MomentReveal.tsx',import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>id==='react'?React:id==='react/jsx-runtime'?{jsx,jsxs:jsx}:id==='./Motion'?{MotionContext:{}}:{Animated:{View:'Animated',Value,timing:()=>({start:()=>starts++,stop:()=>stops++})}}});
 exports.MomentReveal({active:false});assert.equal(starts,0);exports.MomentReveal({active:true});assert.equal(starts,1);exports.MomentReveal({active:true});assert.equal(starts,1);
 reduced=true;exports.MomentReveal({active:true});assert.equal(stops,1);assert.equal(current,1);assert.equal(starts,1);
});
