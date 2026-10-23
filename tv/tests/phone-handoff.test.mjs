import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
const nodes=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(nodes):[n,...nodes(n.props?.children)];
const jsx=(type,props)=>({type,props});
const modules={'./MomentReveal':{MomentReveal:'MomentReveal'},'./theme':{eveningTheme:{}},'./TVText':{Text:'Text'},react:{useState:v=>[v,()=>{}]},'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{ScrollView:'Scroll',View:'View',StyleSheet:{create:x=>x},useWindowDimensions:()=>({width:1280,height:720})},'react-native-qrcode-svg':{default:'QR'},'./TVButton':{TVButton:'Button'},'./catalog/catalog':{mealById:()=>({name:'Dinner'}),showById:()=>({name:'Movie'})}};
const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/PhoneHandoff.tsx',import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>modules[id]});
test('handoff shows actual expiry for a reused link and delivery-specific copy',()=>{
 const expires=Date.now()+7*60000;const format={month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'};
 let opened='';const share='https://example.test/tv/?cook=private';const props={night:{prefs:{people:2},fulfillment:'delivery'},share,expires,onOpenPhone:url=>opened=url};
 const tree=exports.PhoneHandoff(props),text=JSON.stringify(tree);assert.ok(text.includes(new Date(expires).toLocaleString([],format)));assert.doesNotMatch(text,/expires in 4 hours/);assert.match(text,/SCAN TO OPEN YOUR EVENING/);assert.doesNotMatch(text,/preparation as your job/);
 nodes(tree).find(n=>n.type==='Button'&&n.props.children==='Open delivery companion here ↗').props.onPress();assert.equal(opened,share);
 assert.match(JSON.stringify(exports.PhoneHandoff({...props,expires:undefined})),/expiry unavailable/);
 assert.match(JSON.stringify(exports.PhoneHandoff({...props,night:{prefs:{people:2}}})),/SCAN TO COOK/);
});
