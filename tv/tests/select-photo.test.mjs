import test from 'node:test';import assert from 'node:assert/strict';import {convertPhoto} from '../src/select-photo.js';
for(const failure of ['context','draw','encode','dimensions',null])test('photo conversion settles and releases URL: '+failure,async()=>{
 const revoked=[];class Image{width=failure==='dimensions'?0:400;height=300;set src(v){queueMicrotask(()=>this.onload());}}
 const env={Image,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL:u=>revoked.push(u)},document:{createElement:()=>({getContext:()=>failure==='context'?null:{drawImage(){if(failure==='draw')throw Error('draw failed');}},toDataURL(){if(failure==='encode')throw Error('encode failed');return 'data:image/jpeg;base64,abc';}})}};
 const p=convertPhoto({size:100},env);if(failure)await assert.rejects(p);else assert.equal(await p,'data:image/jpeg;base64,abc');assert.deepEqual(revoked,['blob:test']);
});