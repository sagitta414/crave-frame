import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
import {editionReady,editionNotes} from '../src/catalog/tonights-edition.js';
const nodes=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(nodes):[n,...nodes(n.props?.children)];
function harness(environment={}){let poll=()=>{};const states=[],refs=[],deps=[],effects=[],cleanups=[];let si=0,ri=0,ei=0;
 const React={useState:v=>{const i=si++;if(!(i in states))states[i]=v;return [states[i],v=>states[i]=typeof v==='function'?v(states[i]):v];},useRef:v=>refs[ri++]||={current:v},useEffect:(fn,values)=>{const i=ei++;if(!deps[i]||values.some((v,j)=>v!==deps[i][j]))effects.push(()=>{cleanups[i]?.();cleanups[i]=fn();});deps[i]=values;}};
 const jsx=(type,props)=>({type,props}),modules={'./MomentReveal':{MomentReveal:'MomentReveal'},'./theme':{eveningTheme:{}},react:React,'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{View:'View',TextInput:'Input'},'expo-linear-gradient':{LinearGradient:'Gradient'},'./TVText':{Text:'Text'},'./TVButton':{TVButton:'Button'},'./RecipeArt':{RecipeArt:'Art'},'./catalog/catalog':{mealById:()=>({name:'Dinner'})},'./catalog/tonights-edition':{editionReady,editionNotes},'./api':{api:()=>{throw Error('Phone must use scoped endpoint');}}};
 const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/TonightsEdition.tsx',import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{...environment,exports,require:id=>modules[id],setInterval:fn=>{poll=fn;return 0;},clearInterval:()=>{poll=()=>{};}});
 const render=props=>{si=ri=ei=0;const tree=exports.TonightsEdition(props);while(effects.length)effects.shift()();return tree;};render.poll=()=>poll();return render;
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const button=(tree,label)=>nodes(tree).find(n=>n.type==='Button'&&n.props.children===label);
const night={id:'n',prefs:{people:2},status:'ready',watchStarted:1,created:'2026-10-23',show:{name:'A movie'},edition:{responses:{1:{text:'A laugh',skipped:false},2:{skipped:true}}}};
test('reopened phone memory restores title, prevents unchanged save, and permits deliberate edits',async()=>{
 for(let reopen=0;reopen<2;reopen++){
 const render=harness(),writes=[],props={night,phone:true,onLoadEdition:async()=>({edition:{name:'Our Friday',notes:editionNotes(night),shared:false,revision:1,tonightsEdition:true}}),onSaveEdition:async name=>writes.push(name)};
 render(props);await flush();let tree=render(props);button(tree,'Keep a moment together · optional').props.onPress();render(props);await flush();tree=render(props);
 assert.equal(button(tree,'Saved privately ✓').props.disabled,true);
 const input=nodes(tree).find(n=>n.type==='Input'&&n.props.accessibilityLabel==='Tonight’s Edition title');assert.equal(input.props.value,'Our Friday');input.props.onChangeText('Our Saturday');tree=render(props);await button(tree,'Update saved memory').props.onPress();assert.deepEqual(writes,['Our Saturday']);assert.equal(button(render(props),'Saved privately ✓').props.disabled,true);
 }
});
test('failed saved-memory lookup offers retry and never silently presents a new save',async()=>{
 const render=harness(),props={night,phone:true,onLoadEdition:async()=>{throw Error('offline');}};render(props);await flush();let tree=render(props);button(tree,'Keep a moment together · optional').props.onPress();render(props);await flush();tree=render(props);assert.ok(button(tree,'Retry loading saved memory'));assert.ok(!button(tree,'Save privately'));
});

test('remote memory edits refresh clean screens and protect unsaved titles until reviewed',async()=>{
 const render=harness();let saved={name:'First',notes:editionNotes(night),shared:false,revision:1,tonightsEdition:true};
 const props={night,phone:true,onLoadEdition:async()=>({edition:saved})};render(props);await flush();let tree=render(props);button(tree,'Keep a moment together · optional').props.onPress();render(props);await flush();tree=render(props);
 const input=t=>nodes(t).find(n=>n.type==='Input'&&n.props.accessibilityLabel==='Tonight’s Edition title');
 saved={...saved,name:'Partner’s title',revision:2};render.poll();await flush();tree=render(props);assert.equal(input(tree).props.value,'Partner’s title');
 input(tree).props.onChangeText('My unsaved draft');tree=render(props);saved={...saved,name:'Another edit',revision:3};render.poll();await flush();tree=render(props);
 assert.equal(input(tree).props.value,'My unsaved draft');assert.equal(button(tree,'Update saved memory').props.disabled,true);
 button(tree,'Review latest saved version').props.onPress();render(props);await flush();tree=render(props);assert.equal(input(tree).props.value,'My unsaved draft');assert.equal(button(tree,'Update saved memory').props.disabled,false);assert.match(JSON.stringify(tree),/Another edit/);
});

test('memory lookup and polling run only while the eligible panel is open',async()=>{
 const render=harness();let reads=0;const props={night,phone:true,onLoadEdition:async()=>{reads++;return {edition:null};}};
 let tree=render(props);render.poll();await flush();assert.equal(reads,0);
 button(tree,'Keep a moment together · optional').props.onPress();render(props);await flush();assert.equal(reads,1);
 render.poll();await flush();assert.equal(reads,2);
 tree=render(props);button(tree,'Put this away').props.onPress();render(props);render.poll();await flush();assert.equal(reads,2);
 button(render(props),'Keep a moment together · optional').props.onPress();render({...props,night:{...night,watchStarted:null}});render.poll();await flush();assert.equal(reads,2);
});


test('background read failure preserves a loaded draft and hidden/offline panels do not poll',async()=>{
 const document={hidden:false},navigator={onLine:true},render=harness({document,navigator});let fail=false,reads=0;
 const props={night,phone:true,person:1,onLoadEdition:async()=>{reads++;if(fail)throw Error('offline');return {edition:{name:'Saved',notes:editionNotes(night),revision:1,shared:false,tonightsEdition:true}};}};
 let tree=render(props);button(tree,'Keep a moment together · optional').props.onPress();render(props);await flush();tree=render(props);
 const field=t=>nodes(t).find(n=>n.type==='Input'&&n.props.accessibilityLabel==='Tonight’s Edition title');
 assert.equal(nodes(tree).find(n=>n.type==='Input'&&n.props.accessibilityLabel==='A moment from tonight').props.value,'A laugh');
 field(tree).props.onChangeText('Keep this draft');render(props);fail=true;render.poll();await flush();tree=render(props);
 assert.equal(field(tree).props.value,'Keep this draft');assert.match(JSON.stringify(tree),/Connection interrupted/);
 const previous=reads;document.hidden=true;render.poll();await flush();assert.equal(reads,previous);document.hidden=false;navigator.onLine=false;render.poll();await flush();assert.equal(reads,previous);
});

test('delivery keepsake avoids presenting a recipe photo as the actual order and supports scoped unsharing',async()=>{
 const render=harness(),writes=[],props={night:{...night,fulfillment:'delivery',orderPlan:{query:'Our tacos'}},phone:true,onLoadEdition:async()=>({edition:{name:'Dinner',notes:editionNotes(night),shared:true,revision:7,tonightsEdition:true}}),onSaveEdition:async(name,guard)=>writes.push({name,guard})};
 let tree=render(props);button(tree,'Keep a moment together · optional').props.onPress();render(props);await flush();tree=render(props);
 assert.ok(!nodes(tree).some(n=>n.type==='Art'));assert.match(JSON.stringify(tree),/Our tacos/);
 await button(tree,'Stop sharing this memory').props.onPress();assert.equal(writes[0].guard.action,'unshare');assert.equal(writes[0].guard.expectedRevision,7);
});


test('answer updates refresh clean inputs but preserve and guard dirty drafts',async()=>{
 const render=harness(),writes=[];let props={night,phone:true,person:1,onLoadEdition:async()=>({edition:null}),onUpdate:async b=>{writes.push(b);return {...night,edition:{responses:{...night.edition.responses,1:{text:b.edition.text,skipped:false}}}};}};
 const field=t=>nodes(t).find(n=>n.type==='Input'&&n.props.accessibilityLabel==='A moment from tonight');
 let tree=render(props);button(tree,'Keep a moment together · optional').props.onPress();render(props);await flush();
 props={...props,night:{...night,edition:{responses:{...night.edition.responses,1:{text:'New remote answer',skipped:false}}}}};render(props);tree=render(props);assert.equal(field(tree).props.value,'New remote answer');
 field(tree).props.onChangeText('My draft');render(props);
 props={...props,night:{...night,edition:{responses:{...night.edition.responses,1:{text:'Changed again',skipped:false}}}}};render(props);tree=render(props);
 assert.equal(field(tree).props.value,'My draft');assert.equal(button(tree,'Replace my moment').props.disabled,true);
 button(tree,'Keep my draft after reviewing latest answer').props.onPress();tree=render(props);await button(tree,'Replace my moment').props.onPress();
 assert.equal(writes[0].edition.expectedResponse,JSON.stringify([false,'Changed again']));assert.equal(writes[0].edition.text,'My draft');
 props={...props,night:{...night,edition:{responses:{...night.edition.responses,1:{text:'My draft',skipped:false}}}}};render(props);tree=render(props);assert.equal(button(tree,'Replace my moment').props.disabled,false);
});

test('successful background recovery clears only the connection interruption message',async()=>{
 const render=harness();let fail=false;const props={night,phone:true,onLoadEdition:async()=>{if(fail)throw Error('offline');return {edition:null};}};
 let tree=render(props);button(tree,'Keep a moment together · optional').props.onPress();render(props);await flush();fail=true;render.poll();await flush();assert.match(JSON.stringify(render(props)),/Connection interrupted/);
 fail=false;render.poll();await flush();assert.doesNotMatch(JSON.stringify(render(props)),/Connection interrupted/);
});
