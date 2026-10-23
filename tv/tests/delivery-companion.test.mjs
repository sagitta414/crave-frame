import {eveningTheme} from '../src/theme.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {mealById,showById,defaults} from '../src/catalog/catalog.js';
import {projectEvening} from '../src/schedule.js';
import {orderOutEvening} from '../src/catalog/evening.js';

test('phone delivery view displays shared timing and honest tracking without cooking actions',async()=>{
 const states=[];let cursor=0;const useState=v=>{const i=cursor++;if(!(i in states))states[i]=v;return [states[i],next=>states[i]=next];};
 const jsx=(type,props)=>({type,props}),modules={'./theme':{eveningTheme},'react':{useState,useRef:v=>({current:v})},'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{ScrollView:'ScrollView',View:'View',TextInput:'Input'},'./TVText':{Text:'Text'},'./TVButton':{TVButton:'Button'},'./catalog/catalog':{mealById,showById},'./schedule':{projectEvening}};
 const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/DeliveryCompanion.tsx',import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>{assert.ok(modules[id],id);return modules[id];}});
 const meal=mealById('pepper-pasta'),show=showById('ratatouille'),base={id:'delivery',status:'planned',mealId:meal.id,showId:show.id,prefs:defaults,planStart:1800000000000,dinnerMinutes:25};
 const night={...base,...orderOutEvening(base,meal,show,30,1800000000000)};night.orderPlan.provider='ubereats';
 const tree=exports.DeliveryCompanion({night,phone:true,syncError:'Reconnecting'}),serialized=JSON.stringify(tree);
 assert.match(serialized,/Uber Eats/);assert.match(serialized,/does not receive order updates/);assert.match(serialized,/Reconnecting/);
 assert.ok(!serialized.includes('"type":"Button"'));
 const schedule=projectEvening(night,meal,show).schedule;
 for(const row of schedule.slice(2,4))assert.ok(serialized.includes(new Date(row.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})));
 cursor=0;const tv=JSON.stringify(exports.DeliveryCompanion({night,phone:false,onBack:()=>{}}));assert.match(tv,/Back to my evening/);
 const updates=[],nodes=t=>Array.isArray(t)?t.flatMap(nodes):t&&typeof t==='object'?[t,...nodes(t.props?.children)]:[];
 const render=()=>{cursor=0;return exports.DeliveryCompanion({night,phone:true,onUpdate:async body=>{updates.push(body);return night;}});};
 const find=(tree,label)=>nodes(tree).find(n=>n.type==='Button'&&n.props.children===label);
 find(render(),'Update delivery timing').props.onPress();
 let editing=render();assert.equal(find(editing,'Save delivery timing').props.disabled,true);
 nodes(editing).find(n=>n.type==='Input').props.onChangeText('5');
 editing=render();assert.equal(find(editing,'Save delivery timing').props.disabled,false);await find(editing,'Save delivery timing').props.onPress();
 assert.equal(updates.length,1);assert.equal(updates[0].deliveryEtaMinutes,5);
 assert.match(JSON.stringify(render()),/Delivery timing updated/);assert.ok(!find(render(),'Save delivery timing'));
 night.watchStarted=Date.now();assert.ok(!find(render(),'Save delivery timing'));

});
