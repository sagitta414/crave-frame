import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
const nodes=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(nodes):[n,...nodes(n.props?.children)];
function harness(){const states=[],refs=[],deps=[],effects=[],stored=[];let si=0,ri=0,ei=0;
 const React={useState:v=>{const i=si++;if(!(i in states))states[i]=v;return [states[i],v=>states[i]=typeof v==='function'?v(states[i]):v];},useRef:v=>refs[ri++]||=( {current:v}),useEffect:(fn,values)=>{const i=ei++;if(!deps[i]||values.some((v,j)=>v!==deps[i][j]))effects.push(fn);deps[i]=values;}};
 const jsx=(type,props)=>({type,props});const modules={'./TonightsEdition':{TonightsEdition:'TonightsEdition'},'react':React,'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{View:'View'},'@react-native-async-storage/async-storage':{getItem:async()=>null,setItem:async(k,v)=>stored.push([k,v])},'./TVText':{Text:'Text'},'./TVButton':{TVButton:'Button'},'./catalog/together-features':{partnerTasks:()=>[]},'./catalog/catalog':{showById:()=>({})},'./schedule':{projectEvening:()=>({schedule:[{},{},{at:1000},{at:2000}]})}};
 const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/PartnerKitchen.tsx',import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>{assert.ok(modules[id],id);return modules[id];}});
 return {stored,render:(name,props)=>{si=ri=ei=0;const tree=exports[name](props);while(effects.length)effects.shift()();return tree;}};
}
test('switching kitchen jobs leaves partner identity and feedback attached to the same person',()=>{
 const h=harness(),roles=[],props={night:{id:'n',status:'cooking',prefs:{people:2},partnerFeedback:{1:{food:'again'}}},meal:{},onRoleChange:r=>roles.push(r)};
 let tree=h.render('PartnerKitchen',props);const buttons=()=>nodes(tree).filter(n=>n.type==='Button');
 buttons().find(n=>Array.isArray(n.props.children)&&n.props.children[1]===1).props.onPress();tree=h.render('PartnerKitchen',props);
 buttons().find(n=>n.props.children==='Prep & table').props.onPress();tree=h.render('PartnerKitchen',props);assert.equal(roles.at(-1),2);
 buttons().find(n=>n.props.children==='Lead the cooking').props.onPress();tree=h.render('PartnerKitchen',props);assert.equal(roles.at(-1),1);
 props.night.status='ready';tree=h.render('PartnerKitchen',props);const response=nodes(tree).find(n=>typeof n.type==='function'&&n.type.name==='PartnerResponse');assert.equal(response.props.person,1);assert.equal(response.props.feedback.food,'again');assert.equal(h.stored.filter(([k])=>k==='cf-partner-person-n').length,1);
});
test('dinner-only save is available before viewing and never fabricates a watch rating',()=>{
 const h=harness(),writes=[],props={person:1,watchStarted:false,onWrite:v=>writes.push(v)};let tree=h.render('PartnerResponse',props);
 let buttons=nodes(tree).filter(n=>n.type==='Button');assert.ok(!buttons.some(n=>n.props.children==='Save viewing feedback'));
 buttons.find(n=>n.props.children==='Do it again').props.onPress();tree=h.render('PartnerResponse',props);buttons=nodes(tree).filter(n=>n.type==='Button');const save=buttons.find(n=>n.props.children==='Save dinner feedback');assert.equal(save.props.disabled,false);save.props.onPress();assert.equal(writes[0].partnerFeedback.food,'again');assert.equal(writes[0].partnerFeedback.watch,undefined);
});
