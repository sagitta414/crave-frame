import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../App.tsx',import.meta.url),'utf8').split('\n').find(line=>line.includes('const back=useCallback')).replace('const back=','var back=');
function setup(overrides={}){
 const c={useCallback:f=>f,showIntro:false,requestLock:{current:false},dialog:'',delayOpen:false,orderOpen:false,error:'',stack:['cook'],page:'cook',cookKey:'shared',restoreOffset:{current:0},pageOffsets:{current:[]},...overrides};
 c.setStack=value=>{c.stack=typeof value==='function'?value(c.stack):value;};c.setError=value=>c.error=value;c.setDialog=value=>c.dialog=value;
 vm.createContext(c);vm.runInContext(source,c);return c;
}
test('shared cooking Back closes overlays first and never enters household discovery',()=>{
 const c=setup({dialog:'phone',error:'offline'});c.back();assert.equal(c.dialog,'');assert.equal(c.error,'offline');
 c.back();assert.equal(c.error,'');c.back();assert.equal(c.stack.join(','),'cook');
 const nested=setup({page:'night',stack:['cook','night']});nested.back();assert.equal(nested.stack.join(','),'cook');
});
test('ordinary household Back still restores its previous page',()=>{
 const c=setup({cookKey:'',stack:['home','night','cook']});c.back();assert.equal(c.stack.join(','),'home,night');
});
