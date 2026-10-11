// Original procedural score: no recordings, samples, or third-party melodies.
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const rate=32000,duration=48,count=rate*duration,left=new Float64Array(count),right=new Float64Array(count);
const hz=m=>440*2**((m-69)/12);
function note(m,start,len,gain,pan,pad=false){
 const freq=hz(m),first=Math.round(start*rate),n=Math.min(Math.round(len*rate),count-first);
 for(let j=0;j<n;j++){
  const t=j/rate,attack=Math.min(1,t/(pad?.8:.018)),release=Math.min(1,(len-t)/(pad?1.2:.35));
  const env=attack*release*(pad?.6+.4*Math.sin(Math.PI*t/len):Math.exp(-t/1.45));
  const sample=gain*env*(Math.sin(2*Math.PI*freq*t)+.21*Math.sin(2*Math.PI*freq*2*t)+.07*Math.sin(2*Math.PI*freq*3*t));
  left[first+j]+=sample*Math.sqrt((1-pan)/2);right[first+j]+=sample*Math.sqrt((1+pan)/2);
 }
}
// Eight six-second bars; sparse, warm electric-piano voicings and soft bass.
const chords=[[48,55,59,64],[45,52,55,60],[53,57,60,64],[43,50,57,62],[48,55,59,64],[45,52,57,60],[53,57,60,67],[48,55,60,64]];
chords.forEach((chord,bar)=>{
 note(chord[0]-12,bar*6,5.8,.075,0,true);
 chord.slice(1).forEach((pitch,i)=>note(pitch,bar*6+.12*i,5.7,.035,(i-1)*.3,true));
 [0,1.5,2.25,3.75,4.5].forEach((beat,i)=>note(chord[[2,3,1,3,2][i]]+12,bar*6+beat,2.6,.085,(i%2?.25:-.25)));
});
for(let i=count-1;i>=0;i--){for(const [seconds,gain] of [[.19,.16],[.37,.1],[.59,.06]]){const j=i-Math.round(seconds*rate);if(j>=0){left[i]+=right[j]*gain;right[i]+=left[j]*gain;}}}
let peak=0;for(let i=0;i<count;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
const out=Buffer.alloc(44+count*4);out.write('RIFF');out.writeUInt32LE(out.length-8,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(rate,24);out.writeUInt32LE(rate*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(count*4,40);
let square=0;for(let i=0;i<count;i++){const t=i/rate,fade=Math.min(1,t/1.4,(duration-t)/3);for(const [channel,samples] of [[0,left],[1,right]]){const sample=samples[i]/peak*.62*fade;square+=sample*sample;out.writeInt16LE(Math.round(sample*32767),44+i*4+channel*2);}}
writeFileSync(fileURLToPath(new URL('../assets/audio/evening-intro.wav',import.meta.url)),out);
console.log(JSON.stringify({duration,rate,channels:2,bytes:out.length,peakLimit:.62,rms:Math.sqrt(square/(count*2)),source:'original synthesis; no samples'}));
