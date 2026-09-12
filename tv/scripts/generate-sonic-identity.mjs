import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const rate=44100,out=resolve(dirname(fileURLToPath(import.meta.url)),'../assets/audio');
mkdirSync(out,{recursive:true});
const envelope=(t,duration,attack=.035,release=.28)=>Math.min(1,t/attack)*Math.min(1,(duration-t)/release);
function write(name,duration,notes,shimmer=false){
 const samples=Math.floor(rate*duration),data=Buffer.alloc(samples*2),header=Buffer.alloc(44);
 for(let index=0;index<samples;index++){
  const t=index/rate;let sample=0;
  for(const [start,frequency,gain,length] of notes){const local=t-start;if(local>=0&&local<=length){const env=envelope(local,length);sample+=gain*env*(Math.sin(2*Math.PI*frequency*local)+.24*Math.sin(2*Math.PI*frequency*2*local));}}
  if(shimmer)sample+=.035*envelope(t,duration,.08,.4)*Math.sin(2*Math.PI*(900+420*t)*t);
  data.writeInt16LE(Math.round(Math.max(-1,Math.min(1,sample))*32767),index*2);
 }
 header.write('RIFF',0);header.writeUInt32LE(36+data.length,4);header.write('WAVE',8);header.write('fmt ',12);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*2,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(data.length,40);
 writeFileSync(resolve(out,name),Buffer.concat([header,data]));
}
// Original Crave Frame interval: a warm fifth resolving into a bright major sixth.
write('ident.wav',2.05,[[0,196,.22,1.45],[.18,293.66,.17,1.35],[.72,392,.16,1.15],[1.02,493.88,.18,.92]],true);
write('understood.wav',.72,[[0,293.66,.16,.46],[.16,392,.14,.48]],true);
write('reveal.wav',1.18,[[0,196,.18,.9],[.12,293.66,.16,.82],[.28,493.88,.17,.78]],true);
write('handoff.wav',.92,[[0,246.94,.14,.55],[.20,329.63,.14,.55],[.38,440,.12,.50]],true);
write('approved.wav',.82,[[0,293.66,.16,.52],[.14,369.99,.15,.52],[.27,493.88,.15,.50]],false);
