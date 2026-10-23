import {eveningTheme} from '../src/theme.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
import {ingredients} from '../src/catalog/engine.js';

test('preview uses adapted cooking ingredients and scoped Back respects pending start',async()=>{
 const meal={id:'pizza',name:'Margherita pizza',minutes:20,ingredients:[['Mozzarella',100,'g'],['Basil',4,'leaves']],swap:{from:'Mozzarella',to:'Plant-based mozzarella',amount:100,unit:'g'}};
 const pair={meal,show:{id:'film',name:'Film'},adapted:true},prefs={people:2};
 const effects=[],cleanups=[];let scoped,backs=0,resolveStart;
 const React={useState:v=>[v,()=>{}],useRef:v=>({current:v}),useContext:()=>true,useEffect:f=>effects.push(f)};
 const jsx=(type,props)=>({type,props});
 const modules={'./theme':{eveningTheme},'./PairingReason':{PairingReason:'PairingReason'},'react':React,'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{ScrollView:'Scroll',View:'View',Animated:{Value:class{stopAnimation(){}},View:'Animated'},AccessibilityInfo:{},useWindowDimensions:()=>({width:1200})},'expo-linear-gradient':{LinearGradient:'Gradient'},'./TVText':{Text:'Text'},'./TVButton':{TVButton:'Button'},'./RecipeArt':{RecipeArt:'Art'},'./Motion':{MotionContext:{}},'./catalog/night-director':{openingScene:()=>({})},'./useRemoteResource':{useRemoteResource:()=>({status:'ready',data:{prefs,ways:[{id:'easy',label:'Easy',pair}]}})},'./api':{api:()=>{}},'./catalog/engine':{ingredients}};
 const exports={};
 vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/NightDirector.tsx',import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>{assert.ok(modules[id],id);return modules[id];}});
 const tree=exports.NightDirector({pair,prefs,onBack:()=>backs++,onStart:()=>new Promise(r=>resolveStart=r),registerPreviewBack:fn=>{scoped=fn;return()=>{scoped=null;};}});
 for(const effect of effects){const cleanup=effect();if(cleanup)cleanups.push(cleanup);}
 const nodes=[];function walk(n){if(Array.isArray(n))return n.forEach(walk);if(n&&typeof n==='object'){nodes.push(n);walk(n.props?.children);}}walk(tree);
 const texts=nodes.filter(n=>n.type==='Text').map(n=>n.props.children);
 assert.ok(texts.includes(ingredients(meal,2,true).map(i=>i.name).join(' · ')));
 assert.ok(!texts.includes('Mozzarella · Basil'));
 const back=nodes.find(n=>n.type==='Button'&&n.props.children==='← Back to our choices');
 back.props.onPress();assert.equal(backs,1);
 assert.equal(scoped(),true);assert.equal(backs,2);
 const start=nodes.find(n=>n.type==='Button'&&n.props.children==='Start our evening →');
 const pending=start.props.onPress();
 scoped();back.props.onPress();assert.equal(backs,2,'both Back paths stay during a pending start');
 resolveStart();await pending;scoped();assert.equal(backs,3);
 cleanups.forEach(f=>f());assert.equal(scoped,null,'unmount removes scoped handler');
});
