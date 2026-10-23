import {eveningTheme} from '../src/theme.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
function harness(file,extra){const states=[],refs=[];let cursor=0,refCursor=0;const React={useState:v=>{const i=cursor++;if(!(i in states))states[i]=v;return [states[i],v=>states[i]=typeof v==='function'?v(states[i]):v];},useRef:v=>{const i=refCursor++;return refs[i]||=( {current:v});}};const jsx=(type,props)=>({type,props});const modules={'./theme':{eveningTheme},'react':React,'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{View:'View'},'./TVText':{Text:'Text'},'./TVButton':{TVButton:'Button'},'./catalog/engine':{ingredients:()=>[]},'./catalog/catalog':{mealById:()=>({})},'./ChangeOutcome':{ChangeOutcome:'Outcome'},...extra};const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/'+file,import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>{assert.ok(modules[id],id);return modules[id];}});return {render:props=>{cursor=0;refCursor=0;return exports.QuickEveningChanges(props);}};}
function nodes(n){return !n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(nodes):[n,...nodes(n.props?.children)];}
test('quick changes preview the same title, block double submission and keep cooking progress untouched',async()=>{
 const calls=[];let resolve,review,delays=0;const h=harness('QuickEveningChanges.tsx',{'./api':{api:(...args)=>{calls.push(args);return new Promise(r=>resolve=r);}}});
 const night={id:'night',status:'planned',mealId:'old',showId:'film',prefs:{people:2},step:0};const props={night,onReview:r=>review=r,onDelay:()=>delays++,busy:false};
 let tree=h.render(props);const buttons=()=>nodes(tree).filter(n=>n.type==='Button');const find=label=>buttons().find(b=>b.props.children===label);
 const request=find('Make tonight easier').props.onPress();find('Different food').props.onPress();assert.equal(calls.length,1);assert.equal(calls[0][0],'nights/night/rescue');assert.equal(calls[0][2].request.allowWatchChange,false);assert.equal(calls[0][2].request.easier,true);assert.equal(calls[0][2].apply,undefined);
 resolve({options:[{mealId:'new',showId:'film'}],revision:7});await request;tree=h.render(props);nodes(tree).find(n=>n.type==='Outcome').props.onReview();assert.equal(review.revision,7);assert.equal(review.request.people,2);assert.equal(review.choice.showId,'film');assert.equal(night.mealId,'old');
 night.status='cooking';night.step=2;tree=h.render(props);assert.equal(find('Different food'),undefined);assert.equal(find('Make tonight easier'),undefined);find('We’re running late').props.onPress();assert.equal(delays,1);assert.equal(night.step,2);
 night.fulfillment='delivery';assert.equal(h.render(props),null);
});
