import React,{useContext,useEffect,useMemo,useRef,useState} from 'react';
import {Animated,Platform,StyleSheet,Text,View} from 'react-native';
import {MotionContext} from './Motion';
import {TVButton as Button} from './TVButton';

const clamp=(n:number)=>Math.max(1,Math.min(5,Math.round(n)));
const words=(value:any)=>String(value||'').toLowerCase();
export function roomTheme(show:any){
 const hay=words([show?.name,show?.genre,show?.mood].join(' '));
 if(/dexter|crime|thriller|mystery|horror/.test(hay))return {accent:'#C33A50',glow:'#4A101E',name:'Noir tension',sound:'Low instrumental pulse'};
 if(/romance|romantic|drama/.test(hay))return {accent:'#C778C8',glow:'#351238',name:'Velvet glow',sound:'Warm cinematic strings'};
 if(/adventure|action|fantasy|science fiction/.test(hay))return {accent:'#58A9FF',glow:'#0E3154',name:'Electric horizon',sound:'Expansive instrumental score'};
 if(/comedy|lighthearted|family/.test(hay))return {accent:'#FFB35D',glow:'#4A2B0B',name:'Golden-hour lift',sound:'Bright acoustic rhythm'};
 return {accent:'#67D9BD',glow:'#133B35',name:'Soft-focus comfort',sound:'Quiet lounge instrumentals'};
}
function signalData(pair:any,prefs:any){
 const show=pair?.show||{},meal=pair?.meal||{},theme=roomTheme(show),profile=meal.cookingProfile||{};
 const tone=show.mood||String(show.genre||'Story-led').split(' · ')[0]||'Story-led';
 const flavor=meal.cuisine&&meal.cuisine!=='Any'?meal.cuisine:(meal.foodType||meal.category||'Balanced');
 const format=meal.category||(/taco|pizza|slider|wrap/i.test(meal.name||'')?'Shareable':'Plated');
 const effort=meal.effort||profile.effortLabel||((meal.minutes||30)<=30?'Easy':'Hands-on');
 const fit=pair?.compromises?.length?`${pair.compromises.filter((x:any)=>x.moodMatched&&x.mealMatched).length}/${pair.compromises.length} aligned`:pair?.pantryMatches?.length?'Pantry-aware':prefs?.people?`${prefs.people}-person fit`:'Household fit';
 return [
  {label:'Story tone',value:tone,score:show.mood===prefs?.mood?5:4,color:theme.accent},
  {label:'Flavor character',value:flavor,score:meal.cuisine===show.cuisine?5:4,color:'#FFA47E'},
  {label:'Meal format',value:format,score:/share|taco|pizza|slider|wrap/i.test(format+' '+meal.name)?5:4,color:'#F4CE65'},
  {label:'Effort',value:effort,score:(meal.minutes||30)<=30?5:(meal.minutes||30)<=45?4:3,color:'#73C9F4'},
  {label:'Household fit',value:fit,score:pair?.compromises?.length?3+pair.compromises.filter((x:any)=>x.moodMatched&&x.mealMatched).length/Math.max(1,pair.compromises.length)*2:pair?.evidence?.length?5:4,color:'#78DBB5'},
 ];
}
export function PairingDNA({pair,prefs,compact=false}:any){
 const reduced=useContext(MotionContext),signals=useMemo(()=>signalData(pair,prefs),[pair,prefs]);
 const reveal=useRef(signals.map(()=>new Animated.Value(reduced?1:0))).current;
 useEffect(()=>{if(reduced){reveal.forEach(x=>x.setValue(1));return;}Animated.stagger(80,reveal.map(x=>Animated.timing(x,{toValue:1,duration:380,useNativeDriver:true}))).start();},[pair?.meal?.id,pair?.show?.id,reduced]);
 if(compact)return <View style={i.dnaCompact} accessibilityLabel={'Pairing DNA: '+signals.map(x=>x.label+' '+x.value).join(', ')}><Text style={i.eyebrow}>PAIRING DNA</Text>{signals.map((x,n)=><Animated.View key={x.label} style={[i.dot,{backgroundColor:x.color,opacity:reveal[n],transform:[{scale:reveal[n]}]}]}/>)}</View>;
 return <View style={i.panel}><View style={i.rowBetween}><View><Text style={i.eyebrow}>PAIRING DNA · 5 SIGNALS</Text><Text style={i.title}>Why the match holds together</Text></View><Text style={i.calculated}>CALCULATED</Text></View>{signals.map((x,n)=><View key={x.label} style={i.signal}><View style={i.rowBetween}><Text style={i.signalLabel}>{x.label}</Text><Text style={[i.signalValue,{color:x.color}]}>{x.value}</Text></View><View style={i.segments}>{[1,2,3,4,5].map(seg=><Animated.View key={seg} style={[i.segment,{backgroundColor:seg<=clamp(x.score)?x.color:'#2B3340',opacity:reveal[n]}]}/>)}</View></View>)}<Text style={i.note}>Signals summarize catalog facts and approved preferences; they are explanations, not scientific percentages.</Text></View>;
}
export function connectionType(pair:any){
 if(pair?.pairingType)return pair.pairingType==='story'?{label:'FOOD FROM THE STORY',color:'#F4CE65',description:'Documented food; our recipe interpretation'}:pair.pairingType==='setting'?{label:'INSPIRED BY THE SETTING',color:'#73C9F4',description:'Creative interpretation, not verified on-screen food'}:{label:'JUST A GOOD DINNER',color:'#78DBB5',description:'Practical choice without a strong story connection'};
 const kind=String(pair?.connection?.kind||pair?.connectionKind||'Mood');
 const explanation=String(pair?.reason||pair?.connection?.text||'').toLowerCase();
 if(kind==='On-screen food')return {label:'ON-SCREEN CONNECTION',color:'#F4CE65',description:'Documented screen-to-table reference'};
 if(kind==='Setting')return {label:'SETTING-INSPIRED',color:'#73C9F4',description:'Cuisine echoes the story world'};
 if(/counterpoint|contrast/.test(explanation))return {label:'INTENTIONAL CONTRAST',color:'#C778C8',description:'Dinner balances the screen mood'};
 if(kind==='Story inspiration'||/story inspiration/.test(explanation))return {label:'STORY-INSPIRED',color:'#FFA47E',description:'The meal interprets a story idea'};
 return {label:'MOOD MATCH',color:'#78DBB5',description:'Food and story share an atmosphere'};
}
export function ConnectionBadge({pair,expanded=false}:any){const type=connectionType(pair);return <View accessibilityLabel={`${type.label}. ${type.description}`} style={[i.connection,{borderColor:type.color,backgroundColor:type.color+'1F'}]}><View style={[i.connectionDot,{backgroundColor:type.color}]}/><Text style={[i.connectionText,{color:type.color}]}>{type.label}</Text>{expanded&&<Text style={i.connectionDescription}> · {type.description}</Text>}</View>;}
export function EpisodeSignal({show}:any){
 const p=show?.provider;if(p?.type!=='tv'||!Number.isInteger(p.season)||!Number.isInteger(p.episode))return null;
 return <View style={i.panel}><View style={i.rowBetween}><Text style={i.eyebrow}>EPISODE-AWARE SIGNAL</Text><Text style={i.safe}>SPOILER-FREE</Text></View><Text style={i.title}>Season {p.season} · Episode {p.episode}{show.episodeName?' · '+show.episodeName:''}</Text><Text style={i.copy}>This match used the selected episode’s synopsis, {show.minutes}-minute runtime, series genre, and the mood you chose. It does not use later-episode context.</Text></View>;
}
export function DecisionReceipt({receipt}:any){
 const [open,setOpen]=useState(false);if(!receipt)return null;
 return <View style={i.panel}><View style={i.rowBetween}><View><Text style={i.eyebrow}>AI DECISION RECEIPT</Text><Text style={i.title}>From catalog to tonight</Text></View><Button quiet onPress={()=>setOpen(!open)}>{open?'Hide receipt':'See receipt'}</Button></View>{open&&<><View style={i.funnel}>{[
  [receipt.eligibleMeals,'eligible meals'],[receipt.eligibleShows,'eligible watches'],[receipt.candidatePairings,'candidate pairings'],[receipt.finalists,'finalists'],[1,'recommended']
 ].map((x:any,n)=><View key={x[1]} style={[i.funnelStep,{width:`${100-n*10}%`}]}><Text style={i.funnelNumber}>{x[0]}</Text><Text style={i.funnelText}>{x[1]}</Text></View>)}</View>{receipt.constraints?.length>0&&<Text style={i.copy}>Applied: {receipt.constraints.join(' · ')}</Text>}{receipt.alternatives?.map((x:any)=><View key={x.name} style={i.alternative}><Text style={i.eyebrow}>WHY IT DIDN’T LEAD</Text><Text style={i.altName}>{x.name}</Text><Text style={i.copy}>{x.whyNotFirst}</Text></View>)}<Text style={i.note}>Counts come from the eligible catalog used for this request. AI ranks the finalists; catalog rules enforce the limits.</Text></>}</View>;
}
export function RoomCue({show}:any){const t=roomTheme(show);return <View style={[i.room,{borderColor:t.accent,backgroundColor:t.glow+'CC'}]}><View><Text style={i.eyebrow}>LIVING ROOM MODE</Text><Text style={i.title}>{t.name}</Text></View><View style={{alignItems:'flex-end'}}><Text style={[i.signalValue,{color:t.accent}]}>SUGGESTED SOUND</Text><Text style={i.copy}>{t.sound}</Text></View></View>;}

export function understoodConstraints(prompt:string){const p=words(prompt),out:string[]=[];
 if(/suspense|thrill|tense|mystery/.test(p))out.push('Suspenseful story');
 const under=p.match(/under\s+(?:an?\s+)?(hour|\d+)\s*(?:minutes?|mins?)?/);if(under)out.push(under[1]==='hour'?'Watch ≤ 60m':`Watch < ${under[1]}m`);
 if(/easy|simple|low effort|quick/.test(p))out.push('Easy cooking');
 for(const food of ['chicken','beef','pork','fish','seafood','vegetarian','plant-based','pasta'])if(p.includes(food))out.push(food[0].toUpperCase()+food.slice(1)+' dinner');
 const guests=p.match(/(?:for|serves?)\s+(\d+)/);if(guests)out.push(guests[1]+' people');return out.slice(0,5);
}
export function VoicePlanner({value,onChange,onFocus}:any){const [listening,setListening]=useState(false),constraints=understoodConstraints(value);
 function speak(){const R=(globalThis as any).SpeechRecognition||(globalThis as any).webkitSpeechRecognition;if(Platform.OS==='web'&&R){const r=new R();r.lang='en-US';r.interimResults=false;r.onstart=()=>setListening(true);r.onend=()=>setListening(false);r.onerror=()=>setListening(false);r.onresult=(e:any)=>onChange(e.results[0][0].transcript);r.start();}else onFocus?.();}
 return <View style={i.voice}><View style={i.rowBetween}><View><Text style={i.eyebrow}>FIRE TV VOICE PLAN</Text><Text style={i.copy}>{listening?'Listening…':'Say the whole evening in one sentence.'}</Text></View><Button primary onPress={speak}>🎙 {listening?'Listening':Platform.OS==='web'?'Speak plan':'Use remote voice'}</Button></View>{constraints.length>0&&<View><Text style={i.eyebrow}>UNDERSTOOD CONSTRAINTS</Text><View style={i.chips}>{constraints.map(x=><Text key={x} style={i.chip}>✓ {x}</Text>)}</View></View>}<Text style={i.note}>{Platform.OS==='web'?'Voice support depends on this browser. You can edit the transcript before asking AI.':'Use the microphone on your Fire TV remote, then review the text before asking AI.'}</Text></View>;
}

const i=StyleSheet.create({panel:{backgroundColor:'#111722F2',borderWidth:1,borderColor:'#334155',borderRadius:16,padding:24,marginVertical:14},rowBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:18},eyebrow:{color:'#B8C4D5',fontSize:14,fontWeight:'900',letterSpacing:1.8,marginBottom:7},title:{color:'#F7F8F4',fontSize:24,fontWeight:'800'},calculated:{color:'#78DBB5',fontSize:14,fontWeight:'900',letterSpacing:1.4},signal:{marginTop:18},signalLabel:{color:'#E8EDF4',fontSize:18,fontWeight:'700'},signalValue:{fontSize:15,fontWeight:'900',textTransform:'uppercase'},segments:{flexDirection:'row',gap:7,marginTop:9},segment:{height:7,flex:1,borderRadius:4},note:{color:'#A5B0C0',fontSize:15,lineHeight:22,marginTop:16},dnaCompact:{flexDirection:'row',alignItems:'center',gap:7,marginVertical:9},dot:{width:9,height:9,borderRadius:5},safe:{backgroundColor:'#183B34',color:'#79E0BE',fontSize:14,fontWeight:'900',paddingHorizontal:12,paddingVertical:7,borderRadius:20},copy:{color:'#D1D9E5',fontSize:18,lineHeight:27,marginTop:8},funnel:{marginVertical:16,gap:7},funnelStep:{alignSelf:'center',backgroundColor:'#202B3A',borderRadius:8,paddingHorizontal:16,paddingVertical:10,flexDirection:'row',alignItems:'baseline',gap:9},funnelNumber:{color:'#FFA47E',fontWeight:'900',fontSize:22},funnelText:{color:'#DDE5EF',fontSize:17},alternative:{borderTopWidth:1,borderTopColor:'#293648',paddingTop:13,marginTop:13},altName:{color:'#F4F7FA',fontSize:18,fontWeight:'800'},room:{borderWidth:1,borderRadius:16,padding:20,marginVertical:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:20},voice:{backgroundColor:'#111722',borderWidth:1,borderColor:'#48627C',borderRadius:16,padding:24,marginVertical:16},chips:{flexDirection:'row',flexWrap:'wrap',gap:9,marginTop:9},chip:{color:'#DFF8EE',backgroundColor:'#17362F',borderRadius:20,paddingHorizontal:14,paddingVertical:9,fontSize:16,fontWeight:'700'},connection:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',borderWidth:1,borderRadius:18,paddingHorizontal:11,paddingVertical:7,marginVertical:5},connectionDot:{width:8,height:8,borderRadius:4,marginRight:8},connectionText:{fontSize:12,fontWeight:'900',letterSpacing:1.1},connectionDescription:{color:'#C7D0DE',fontSize:13,fontWeight:'600'}});
