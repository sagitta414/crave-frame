import {readFileSync,writeFileSync} from 'node:fs';

const path=new URL('../App.tsx',import.meta.url);
let source=readFileSync(path,'utf8');

const edits=[
 [
  '<Heading kicker="YOUR COLLECTION">Good nights are worth keeping.</Heading><View style={s.wrap}>',
  '<Heading kicker="YOUR COLLECTION">Good nights are worth keeping.</Heading><MovieMemoryReel house={house} onOpen={openNight}/><View style={s.wrap}>'
 ],
 [
  "<Button onPress={()=>nav('together')}>Plan with friends</Button></View><Button style={{alignSelf:\"flex-start\",marginTop:12}}",
  "<Button onPress={()=>nav('together')}>Plan with friends</Button><Button onPress={()=>root('cinematic')}>Cinematic Nights ◈</Button></View><Button style={{alignSelf:\"flex-start\",marginTop:12}}"
 ],
 [
  "memory:()=> <ScrollView contentContainerStyle={s.content}><Heading kicker='YOUR TASTE, YOUR CONTROL'>What we remember</Heading><TasteMemory house={house} onUpdate={setHouse}/></ScrollView>,home:Home,",
  "memory:()=> <ScrollView contentContainerStyle={s.content}><Heading kicker='YOUR TASTE, YOUR CONTROL'>What we remember</Heading><TasteMemory house={house} onUpdate={setHouse}/></ScrollView>,cinematic:Cinematic,home:Home,"
 ],
];

for(const [before,after] of edits){
 if(source.includes(after))continue;
 if(!source.includes(before))throw new Error('Movie Nights integration point not found: '+before.slice(0,80));
 source=source.replace(before,after);
}
writeFileSync(path,source);
console.log('Integrated Cinematic Nights, Frame-to-Flavor and the Movie Memory Reel.');
