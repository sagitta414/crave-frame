import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const mainSource=readFileSync(new URL('../product/main.js',import.meta.url),'utf8');
const source=mainSource.slice(mainSource.indexOf('async function loadRoute('),mainSource.indexOf('function button('));
const saveSource=readFileSync(new URL('../product/main.js',import.meta.url),'utf8').split('\n').find(line=>line.startsWith('async function cookUpdate('));
function setup(){
 const pending=[],events=[];
 const context={app:{innerHTML:''},header:()=>'',footer:()=>'',button:(label,action)=>'<button data-action="'+action+'">'+label+'</button>',esc:s=>s.replaceAll('<','&lt;'),$:()=>({focus:()=>events.push('focus-recovery')}),routeRevision:0,location:{hash:'#cook/A'},night:null,household:{memory:{}},syncError:true,route:()=>context.location.hash.slice(1).split('/')[0],routeId:()=>context.location.hash.split('/')[1],api:path=>new Promise((resolve,reject)=>pending.push({path,resolve,reject})),render:()=>events.push('render'),toast:message=>events.push(message),go:path=>events.push('go:'+path)};
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
 const {context:c,pending:p,events}=setup();const load=c.loadRoute();p[0].reject(Error('Expired'));await load;assert.match(c.app.innerHTML,/Expired/);assert.match(c.app.innerHTML,/data-action="retry-route"/);assert.deepEqual(events,['focus-recovery']);
});
test('late cooking save completes without overwriting a newly selected evening',async()=>{
 const {context:c,pending:p,events}=setup();c.night={id:'A',mealId:'pepper-pasta'};c.sharedKey='';vm.runInContext(saveSource,c);
 const save=c.cookUpdate({step:1});c.location.hash='#cook/B';const load=c.loadRoute();p[1].resolve({id:'B',step:2});await load;p[0].resolve({id:'A',step:1});
 assert.equal(await save,false);assert.equal(c.night.id,'B');assert.deepEqual(events,['render']);
});
test('save response is ignored after leaving and returning to the same evening',async()=>{
 const {context:c,pending:p}=setup();c.night={id:'A',mealId:'pepper-pasta'};c.sharedKey='';vm.runInContext(saveSource,c);
 const save=c.cookUpdate({step:1});const load=c.loadRoute();p[1].resolve({id:'A',step:2});await load;p[0].resolve({id:'A',step:1});assert.equal(await save,false);assert.equal(c.night.step,2);
});
test('cooking save still applies when the user remains on the same view',async()=>{
 const {context:c,pending:p,events}=setup();c.night={id:'A',mealId:'pepper-pasta'};c.sharedKey='';vm.runInContext(saveSource,c);
 const save=c.cookUpdate({step:1});p[0].resolve({id:'A',step:1});assert.equal(await save,true);assert.equal(c.night.step,1);assert.deepEqual(events,['render']);
});
