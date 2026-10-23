import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const braces=require('braces'),forge=require('node-forge');

test('brace patterns reject excessive depth before recursive walkers',()=>{
  for(const input of ['{'.repeat(4000)+'a,b'+'}'.repeat(4000),'('.repeat(4000)+'x'+')'.repeat(4000)]){
    for(const fn of [braces,braces.parse,braces.compile,braces.expand,braces.stringify]){
      assert.throws(()=>fn(input),e=>e instanceof SyntaxError && /safety limit/.test(e.message));
    }
  }
});
test('direct AST callers cannot bypass depth limits or supply cycles',()=>{
  let ast={type:'text',value:'x'};
  for(let n=0;n<4000;n++)ast={type:'root',nodes:[ast]};
  const cycle={type:'root',nodes:[]};cycle.nodes.push(cycle);
  for(const input of [ast,cycle])for(const fn of [braces.compile,braces.expand,braces.stringify]){
    assert.throws(()=>fn(input),e=>e instanceof SyntaxError && /safety limit/.test(e.message));
  }
});
test('ordinary Metro brace patterns keep their behavior',()=>{
  assert.deepEqual(braces.expand('src/{a,b}.{js,ts}'),['src/a.js','src/a.ts','src/b.js','src/b.ts']);
  assert.equal(braces.compile('src/{a,b}.js'),'src/(a|b).js');
  assert.deepEqual(braces.expand('{1..3}'),['1','2','3']);
  assert.equal(braces.stringify(braces.parse('src/{a,b}.js')),'src/{a,b}.js');
});
test('RSA rejects extra nested DigestAlgorithm elements, accepts valid signatures',()=>{
  const keys=forge.pki.rsa.generateKeyPair({bits:1024,e:65537});
  const md=forge.md.sha256.create().update('security regression');
  const digest=md.digest().getBytes();
  assert.equal(keys.publicKey.verify(digest,keys.privateKey.sign(md)),true);
  assert.equal(keys.publicKey.verify(forge.md.sha256.create().update('different').digest().getBytes(),keys.privateKey.sign(md)),false);
  const a=forge.asn1;
  const node=(type,constructed,value)=>a.create(a.Class.UNIVERSAL,type,constructed,value);
  for(const withNull of [true,false]){
    const children=[node(a.Type.OID,false,a.oidToDer(forge.pki.oids.sha256).getBytes())];
    if(withNull)children.push(node(a.Type.NULL,false,''));
    children.push(node(a.Type.OCTETSTRING,false,'unconsumed garbage'));
    const der=a.toDer(node(a.Type.SEQUENCE,true,[node(a.Type.SEQUENCE,true,children),node(a.Type.OCTETSTRING,false,digest)])).getBytes();
    const signature=keys.privateKey.sign(der,'NONE');
    assert.throws(()=>keys.publicKey.verify(digest,signature),/DigestInfo/);
  }
});
