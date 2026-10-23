import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
function load(file,modules){const exports={};const jsx=(type,props)=>({type,props});vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/'+file,import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>id==='react/jsx-runtime'?{jsx,jsxs:jsx}:modules[id],navigator:{userAgent:'Silk'}});return exports;}
const nodes=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(nodes):[n,...nodes(n.props?.children)];
test('phone dinner-ready exposes idempotent viewing action and disables it while saving',()=>{
 const {DinnerReady}=load('DinnerReady.tsx',{react:{},'react-native':{View:'View'},'./TVText':{Text:'Text'},'./TVButton':{TVButton:'Button'},'./Extras':{Reveal:'Reveal'}});
 const writes=[],props={night:{show:{name:'Movie'}},phone:true,onUpdate:b=>writes.push(b)};
 const control=p=>nodes(DinnerReady(p)).find(n=>n.type==='Button');
 control(props).props.onPress();assert.equal(writes[0].watchStarted,true);assert.equal(control({...props,busy:true}).props.disabled,true);assert.equal(control({...props,night:{...props.night,watchStarted:1}}).props.disabled,true);
});
test('Silk text keeps its couch-readable minimum below the desktop breakpoint',()=>{
 const {Text}=load('TVText.tsx',{react:{},'./SilkPage':{isSilk:()=>true},'react-native':{Text:'NativeText',StyleSheet:{flatten:s=>s},useWindowDimensions:()=>({width:720}),Platform:{OS:'web'}}});
 assert.equal(Text({style:{fontSize:18}}).props.style[1].fontSize,28);
});
