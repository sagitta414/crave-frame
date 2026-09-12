import {Text} from './TVText';
import React,{useMemo,useState} from 'react';
import {Image,ScrollView,StyleSheet,View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {TVButton as Button} from './TVButton';
import {RecipeArt} from './RecipeArt';
import {mealById,showById} from './catalog/catalog';

const MODES=[
 {id:'premiere',number:'01',title:'Premiere Night',tag:'MAKE TONIGHT AN EVENT',description:'A countdown, cinematic menu reveal and opening-night ritual built around one feature.',prompt:'Create a home premiere around this exact title. Include a practical themed dinner, an opening countdown, a spoiler-free arrival ritual and a dessert for the credits.'},
 {id:'three-act',number:'02',title:'Three-Act Dinner',tag:'COURSES MEET STORY RHYTHM',description:'An opening bite, main course and credits treat timed around the watch without plot spoilers.',prompt:'Turn this movie into a spoiler-free three-act dinner: an opening bite, a main course, and a simple credits dessert. Keep the total cooking effort within my limits.'},
 {id:'double',number:'03',title:'Double Feature',tag:'TWO STORIES · ONE NIGHT',description:'AI chooses a companion movie and creates an intermission that connects both stories.',prompt:'Build a double feature from this title. Choose a compatible second movie, reuse ingredients across the meal and intermission snack, and keep the full evening practical.'},
 {id:'marathon',number:'04',title:'Franchise Marathon',tag:'ONE SHOP · MANY CHAPTERS',description:'Several installments, different dishes and overlapping ingredients to reduce waste.',prompt:'Plan a franchise marathon beginning with this title. Give each installment a distinct food moment while reusing ingredients and respecting my total time.'},
 {id:'era',number:'05',title:'Era Night',tag:'A DECADE YOU CAN TASTE',description:'The release period shapes the menu, typography, colors and optional table atmosphere.',prompt:'Create an era night grounded in this title’s release period or story period. Explain what is historically connected and what is creative inspiration.'},
 {id:'adaptation',number:'06',title:'Adaptation Battle',tag:'TWO VERSIONS ENTER',description:'Compare a remake, earlier film or book adaptation and give each version a distinct plate.',prompt:'Find a remake, earlier screen version, or related adaptation for this title. Design a two-version watch night with a different meal expression for each and explain the comparison.'},
];

const flavorFor=(show:any,meal:any)=>{
 const words=((show?.mood||'')+' '+(show?.overview||'')+' '+(show?.genres||[]).join(' ')).toLowerCase();
 if(/thrill|crime|mystery|suspense|dark/.test(words))return {tone:'Tense & precise',flavor:'Smoky depth',palette:['#12090d','#7A1730','#F0A06B'],note:'Measured heat and a clean finish echo the story’s controlled tension.'};
 if(/comedy|family|animation|joy/.test(words))return {tone:'Bright & playful',flavor:'Crisp comfort',palette:['#101B32','#315CFF','#FFA47E'],note:'Shareable textures keep the table relaxed while the story carries the energy.'};
 if(/romance|drama|tender/.test(words))return {tone:'Warm & intimate',flavor:'Silky richness',palette:['#241018','#A34F67','#FFD0AD'],note:'A slower, composed plate supports a story built around human connection.'};
 return {tone:'Cinematic & expansive',flavor:meal?.cuisine||'Layered comfort',palette:['#081321','#17496B','#F4C56A'],note:'Contrasting texture and a strong centerpiece match the scale of the screen.'};
};

export function CinemaIntelligence({pair,onPlan}:any){
 const f=flavorFor(pair.show,pair.meal),runtime=pair.show.minutes||120,serve=Math.max(8,Math.min(28,Math.round(runtime*.16)));
 return <View style={s.intelligence}>
  <View style={s.intro}><Text style={s.kicker}>FRAME-TO-FLAVOR AI</Text><Text style={s.title}>The movie directs the table.</Text><Text style={s.body}>{f.note} Crave Frame translated tone, pacing, palette and meal format—not just genre—into this plan.</Text></View>
  <View style={s.signalRow}>
   <View style={s.signal}><Text style={s.signalLabel}>STORY TONE</Text><Text style={s.signalValue}>{f.tone}</Text></View>
   <View style={s.signal}><Text style={s.signalLabel}>FLAVOR ARC</Text><Text style={s.signalValue}>{f.flavor}</Text></View>
   <View style={s.palette}>{f.palette.map(c=><View key={c} style={[s.swatch,{backgroundColor:c}]}/>)}</View>
  </View>
  <Text style={s.kicker}>THREE-ACT DINNER · SPOILER-FREE</Text>
  <View style={s.acts}>
   <View style={s.act}><Text style={s.actNo}>ACT I</Text><Text style={s.actTitle}>Opening bite</Text><Text style={s.actMeta}>Serve before play</Text></View>
   <View style={[s.act,s.actLead]}><Text style={s.actNo}>ACT II</Text><Text style={s.actTitle}>{pair.meal.name}</Text><Text style={s.actMeta}>Ready around minute {serve}</Text></View>
   <View style={s.act}><Text style={s.actNo}>ACT III</Text><Text style={s.actTitle}>Credits treat</Text><Text style={s.actMeta}>A simple final note</Text></View>
  </View>
  <View style={s.credits}><View style={{flex:1}}><Text style={s.signalLabel}>CREDITS EXPERIENCE</Text><Text style={s.creditsTitle}>Let the ending breathe.</Text><Text style={s.body}>Dessert, one thoughtful conversation prompt, and a related next-watch suggestion appear when the credits begin.</Text></View><Button onPress={()=>onPlan('Keep this exact title and dinner. Add a spoiler-free three-act serving plan plus a simple credits dessert and one thoughtful post-movie question.')}>Create the full arc ✦</Button></View>
 </View>;
}

export function CinematicModes({show,watchArt,onBack,onBuild,onMemory}:any){
 const [selected,setSelected]=useState('premiere');
 const mode=MODES.find(x=>x.id===selected)!;
 return <ScrollView testID="main-scroll" contentContainerStyle={s.page}>
  <Button style={{alignSelf:'flex-start'}} onPress={onBack}>← Back</Button>
  <View style={s.hero}>
   <Image source={watchArt(show,true)} style={StyleSheet.absoluteFill} resizeMode="cover"/>
   <LinearGradient colors={['#05070BF5','#05070B70','#05070BDD']} start={{x:0,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill}/>
   <View style={s.heroCopy}><Text style={s.kicker}>CINEMATIC NIGHTS</Text><Text style={s.heroTitle}>The movie sets the whole evening.</Text><Text style={s.body}>Choose a format. AI will ground the food, timing and atmosphere in {show.name}, then explain every creative leap.</Text><Button primary onPress={()=>onBuild(mode.prompt)}>{mode.title}: build with AI ✦</Button></View>
  </View>
  <Text style={s.sectionTitle}>Choose tonight’s format</Text>
  <View style={s.modeGrid}>{MODES.map(m=><Button key={m.id} card selected={selected===m.id} style={s.modeCard} onPress={()=>setSelected(m.id)}><Text style={s.modeNo}>{m.number}</Text><Text style={s.signalLabel}>{m.tag}</Text><Text style={s.modeTitle}>{m.title}</Text><Text style={s.modeBody}>{m.description}</Text></Button>)}</View>
  <View style={s.memoryBanner}><View style={{flex:1}}><Text style={s.kicker}>MOVIE MEMORY REEL</Text><Text style={s.title}>Your nights become the collection.</Text><Text style={s.body}>Revisit every pairing as a cinematic card with the title, meal, guests, date and the preference it taught Crave Frame.</Text></View><Button onPress={onMemory}>Open my reel →</Button></View>
 </ScrollView>;
}

export function MovieMemoryReel({house,onOpen}:any){
 const nights=[...(house?.nights||[])].reverse();
 return <View style={s.reel}>
  <View style={s.reelHeader}><View><Text style={s.kicker}>MOVIE MEMORY REEL</Text><Text style={s.title}>Every great night leaves a frame.</Text></View><Text style={s.reelCount}>{String(nights.length).padStart(2,'0')}</Text></View>
  {!nights.length?<Text style={s.body}>Your first completed pairing will appear here.</Text>:<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:18,paddingVertical:18}}>{nights.map((n:any,i:number)=>{const meal=mealById(n.mealId),show=n.show||showById(n.showId);return <Button key={n.id} card style={s.memoryCard} onPress={()=>onOpen(n)}><RecipeArt meal={meal} style={{height:150,width:'100%'}}/><View style={s.memoryCopy}><Text style={s.memoryIndex}>FRAME {String(nights.length-i).padStart(2,'0')}</Text><Text style={s.modeTitle}>{show?.name||'Your watch'}</Text><Text style={s.modeBody}>{meal?.name}</Text><Text style={s.learned}>{n.feedback?'✓ Shaped your next match':'Ready to rate'}</Text></View></Button>})}</ScrollView>}
 </View>;
}

const s=StyleSheet.create({page:{padding:32,paddingBottom:90,maxWidth:1500,width:'100%',alignSelf:'center'},hero:{minHeight:430,borderRadius:22,overflow:'hidden',marginTop:22,justifyContent:'center'},heroCopy:{padding:44,maxWidth:720},heroTitle:{color:'#fff',fontSize:48,lineHeight:55,fontWeight:'900',letterSpacing:-1.2,marginBottom:12},kicker:{color:'#FFA47E',fontSize:14,fontWeight:'900',letterSpacing:2.2,marginBottom:10},title:{color:'#fff',fontSize:29,lineHeight:36,fontWeight:'800',marginBottom:8},body:{color:'#D5DCE7',fontSize:18,lineHeight:28,marginVertical:8},sectionTitle:{color:'#fff',fontSize:28,fontWeight:'800',marginTop:32,marginBottom:16},modeGrid:{flexDirection:'row',flexWrap:'wrap',gap:16},modeCard:{width:310,minHeight:205,padding:22,alignItems:'flex-start'},modeNo:{color:'#59677B',fontSize:36,fontWeight:'900',position:'absolute',right:18,top:12},modeTitle:{color:'#fff',fontSize:22,lineHeight:28,fontWeight:'800',marginTop:10},modeBody:{color:'#B9C3D2',fontSize:16,lineHeight:24,marginTop:7},memoryBanner:{marginTop:34,padding:28,borderRadius:18,borderWidth:1,borderColor:'#315CFF77',backgroundColor:'#10192AEE',flexDirection:'row',alignItems:'center',gap:24},intelligence:{backgroundColor:'#0B111BEE',borderWidth:1,borderColor:'#33455E',borderRadius:20,padding:28,marginVertical:22},intro:{maxWidth:900},signalRow:{flexDirection:'row',flexWrap:'wrap',gap:14,alignItems:'stretch',marginVertical:20},signal:{minWidth:210,backgroundColor:'#141D2A',borderRadius:12,padding:18},signalLabel:{color:'#94A5BB',fontSize:12,fontWeight:'900',letterSpacing:1.6},signalValue:{color:'#fff',fontSize:20,fontWeight:'800',marginTop:8},palette:{flexDirection:'row',height:76,flex:1,minWidth:260,borderRadius:12,overflow:'hidden'},swatch:{flex:1},acts:{flexDirection:'row',flexWrap:'wrap',gap:12,marginVertical:15},act:{flex:1,minWidth:220,padding:20,borderRadius:14,backgroundColor:'#121A26',borderWidth:1,borderColor:'#29364A'},actLead:{borderColor:'#FFA47EAA',backgroundColor:'#22181A'},actNo:{color:'#FFA47E',fontSize:12,fontWeight:'900',letterSpacing:1.7},actTitle:{color:'#fff',fontSize:20,fontWeight:'800',marginTop:9},actMeta:{color:'#AEBACA',fontSize:15,marginTop:7},credits:{flexDirection:'row',flexWrap:'wrap',gap:20,alignItems:'center',borderTopWidth:1,borderTopColor:'#2C394B',paddingTop:22,marginTop:8},creditsTitle:{color:'#fff',fontSize:22,fontWeight:'800',marginTop:6},reel:{backgroundColor:'#0B111BDD',borderWidth:1,borderColor:'#2C394B',borderRadius:18,padding:24,marginVertical:22},reelHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},reelCount:{fontSize:54,fontWeight:'900',color:'#315CFF'},memoryCard:{width:285,overflow:'hidden'},memoryCopy:{padding:16,alignItems:'flex-start'},memoryIndex:{color:'#FFA47E',fontSize:12,fontWeight:'900',letterSpacing:1.5,marginBottom:8},learned:{color:'#9EC9B3',fontSize:14,fontWeight:'700',marginTop:12}});
