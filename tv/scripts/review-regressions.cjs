const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const exportsObject={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/SilkScrollAssist.tsx','utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText,{exports:exportsObject,require:()=>({}),document:{}});
let focused='',modal=false;const button={closest:()=>null,getAttribute:()=>null,getBoundingClientRect:()=>({width:100,top:50,bottom:100}),focus:()=>{focused='page';}};
const panel={scrollTop:600,scrollHeight:1600,clientHeight:500,getBoundingClientRect:()=>({width:1000,height:500,top:0,bottom:500}),querySelectorAll:()=>[button]};
const doc={defaultView:{innerHeight:720},querySelector:s=>s.includes('aria-modal')?(modal?{}:null):{focus:()=>{focused='menu';}},querySelectorAll:s=>{assert.equal(s,'[data-testid="main-scroll"]');return [panel];}};
assert.equal(exportsObject.pageUp(doc),true);assert.equal(panel.scrollTop,225);assert.equal(focused,'');assert.equal(exportsObject.backToTop(doc),true);assert.equal(panel.scrollTop,0);assert.equal(focused,'menu');
panel.scrollTop=600;modal=true;assert.equal(exportsObject.pageUp(doc),false);assert.equal(exportsObject.backToTop(doc),false);assert.equal(panel.scrollTop,600);assert.equal(focused,'menu');
console.log('PASS: explicit page target, page-up distance, focus restoration, modal isolation');

modal=false;panel.scrollTop=0;
assert.equal(exportsObject.pageDown(doc),true);assert.equal(panel.scrollTop,375);
panel.scrollTop=1000;assert.equal(exportsObject.pageDown(doc),true);assert.equal(panel.scrollTop,1100);
assert.equal(exportsObject.pageDown(doc),false);
modal=true;panel.scrollTop=0;assert.equal(exportsObject.pageDown(doc),false);assert.equal(panel.scrollTop,0);
console.log('PASS: page down from top, bounded bottom, modal isolation');

modal=false;panel.scrollTop=600;focused='dock';doc.activeElement={closest:()=>({})};
exportsObject.pageUp(doc);assert.equal(focused,'dock');
exportsObject.pageDown(doc);assert.equal(focused,'dock');
console.log('PASS: both paging controls retain dock focus');

const silk={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/SilkPage.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:silk});
assert.equal(silk.isSilk('Mozilla/5.0 Silk/130.2 like Chrome'),true);assert.equal(silk.isSilk('Mozilla/5.0 AFTMM'),true);assert.equal(silk.isSilk('Chrome/130.0 Safari/537'),false);
modal=false;doc.documentElement={getAttribute:()=> 'true'};doc.scrollingElement={scrollTop:0,clientHeight:720,scrollHeight:2400};
assert.equal(exportsObject.mainPanel(doc),doc.scrollingElement);exportsObject.pageDown(doc);assert.equal(doc.scrollingElement.scrollTop,540);exportsObject.pageUp(doc);assert.equal(doc.scrollingElement.scrollTop,0);
modal=true;assert.equal(exportsObject.pageDown(doc),false);
console.log('PASS: Silk detection, document scrolling in both directions, modal isolation');
