import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../product/main.js',import.meta.url),'utf8').split('\n').find(line=>line.startsWith('async function loadRoute('));
function setup(){
 const pending=[],events=[];
 const context={routeRevision:0,location:{hash:'#cook/A'},night:null,household:{memory:{}},syncError:true,route:()=>context.location.hash.slice(1).split('/')[0],routeId:()=>context.location.hash.split('/')[1],api:path=>new Promise((resolve,reject)=>pending.push({path,resolve,reject})),render:()=>events.push('render'),toast:message=>events.push(message),go:path=>events.push('go:'+path)};
 vm.createContext(context);vm.runInContext(source,context);return {context,pending,events};
}
test('slower old evening responses cannot replace the current route or feedback',async()=>{
 const {context:c,pending:p,events}=setup();const first=c.loadRoute();c.location.hash='#feedback/B';const second=c.loadRoute();
 p[1].resolve({id:'B',feedback:{meal:'again'}});await second;p[0].resolve({id:'A'});await first;
 assert.equal(c.night.id,'B');assert.equal(c.feedback.meal,'again');assert.deepEqual(events,['render']);
});
test('obsolete navigation errors do not redirect the user away from the new evening',async()=>{
 const {context:c,pending:p,events}=setup();const first=c.loadRoute();c.location.hash='#cook/B';const second=c.loadRoute();
 p[1].resolve({id:'B'});await second;p[0].reject(Error('Old evening expired'));await first;
 assert.equal(c.night.id,'B');assert.deepEqual(events,['render']);
});
test('even repeated loads of the same URL apply only the newest response',async()=>{
 const {context:c,pending:p}=setup();const first=c.loadRoute(),second=c.loadRoute();p[1].resolve({id:'A',step:2});await second;p[0].resolve({id:'A',step:0});await first;
 assert.equal(c.night.step,2);
});
test('active route failures still provide recovery',async()=>{
 const {context:c,pending:p,events}=setup();const load=c.loadRoute();p[0].reject(Error('Expired'));await load;assert.deepEqual(events,['Expired','go:saved']);
});
