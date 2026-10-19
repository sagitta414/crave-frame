import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {mealById,showById,defaults} from '../src/catalog/catalog.js';
import {projectEvening} from '../src/schedule.js';
import {orderOutEvening} from '../src/catalog/evening.js';

test('phone delivery view displays shared timing and honest tracking without cooking actions',()=>{
 const jsx=(type,props)=>({type,props}),modules={'react':{},'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{ScrollView:'ScrollView',View:'View'},'./TVText':{Text:'Text'},'./TVButton':{TVButton:'Button'},'./catalog/catalog':{mealById,showById},'./schedule':{projectEvening}};
 const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/DeliveryCompanion.tsx',import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>{assert.ok(modules[id],id);return modules[id];}});
 const meal=mealById('pepper-pasta'),show=showById('ratatouille'),base={id:'delivery',status:'planned',mealId:meal.id,showId:show.id,prefs:defaults,planStart:1800000000000,dinnerMinutes:25};
 const night={...base,...orderOutEvening(base,meal,show,30,1800000000000)};night.orderPlan.provider='ubereats';
 const tree=exports.DeliveryCompanion({night,phone:true,syncError:'Reconnecting'}),serialized=JSON.stringify(tree);
 assert.match(serialized,/Uber Eats/);assert.match(serialized,/does not receive order updates/);assert.match(serialized,/Reconnecting/);
 assert.ok(!serialized.includes('"type":"Button"'));
 const schedule=projectEvening(night,meal,show).schedule;
 for(const row of schedule.slice(2,4))assert.ok(serialized.includes(new Date(row.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})));
 const tv=JSON.stringify(exports.DeliveryCompanion({night,phone:false,onBack:()=>{}}));assert.match(tv,/Back to my evening/);
});
