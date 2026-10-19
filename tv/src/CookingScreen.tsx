import {CookingChecklist} from './CookingChecklist';
import React,{useState,useEffect} from 'react';
import {cookingCopy} from './cooking-copy';
import {ScrollView,View,StyleSheet,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {RecipeArt} from './RecipeArt';
import {ingredients,recipeSteps} from './catalog/engine';
import {mealById} from './catalog/catalog';
import {cookingProgress} from './cooking-state';
export function CookingScreen({night,phone,preview,previewStep,onPreviewStep,onStart,onUpdate,onBack,onHelp,tick,busy,syncError,helpRequest=0}:any){
 const {width}=useWindowDimensions(),small=width<900,[details,setDetails]=useState(false),m=mealById(night.mealId),steps=recipeSteps(m,night.adapted,night.prefs.cookLevel||'Regular',night.prefs.people),index=preview?previewStep:night.step,step=steps[index],ready=['ready','complete'].includes(night.status),progress=cookingProgress(night,steps.length,preview),left=Math.max(0,Math.ceil(((night.timer||0)-tick)/1000));
 const [showCoaching,setShowCoaching]=useState(false),[checked,setChecked]=useState(false);
 useEffect(()=>setChecked(false),[night.id,night.mealId,night.prefs.people,night.adapted]);
 useEffect(()=>setShowCoaching(false),[night.id,index,preview]);
 useEffect(()=>{if(helpRequest){setDetails(true);setShowCoaching(true);}},[helpRequest]);
 const baseStep=recipeSteps(m,night.adapted,'Confident',night.prefs.people)[index];
 const copy=cookingCopy(step.instruction,baseStep.instruction);
 return <ScrollView testID="main-scroll" contentContainerStyle={{padding:small?20:40,paddingBottom:90,gap:20,maxWidth:1200,width:'100%',alignSelf:'center'}}>
 <Text style={s.kicker}>{preview?'RECIPE PREVIEW':phone?'YOUR KITCHEN COMPANION':'COOK AT YOUR PACE'}</Text><Text style={[s.title,{fontSize:small?32:44}]}>{m.name}</Text>
 {preview&&<CookingChecklist key={night.id+night.mealId+night.prefs.people+night.adapted} night={night} meal={m} onReady={setChecked}/>}
 <View style={{flexDirection:small?'column':'row',gap:24}}><View style={{width:small?'100%':'32%',gap:12}}><RecipeArt meal={m} resizeMode="cover" style={{width:'100%',height:small?180:260,borderRadius:20}}/><Text style={s.meta}>{night.prefs.people} servings · {night.prefs.cookLevel||'Regular'} guidance</Text><Text style={s.meta}>Later tonight · {night.show?.name||'Your selected story'}</Text></View>
 <LinearGradient colors={['#1C2A3C','#111B2A']} style={[s.panel,{flex:1}]}><Text style={s.encourage}>{preview?'Take a look before you begin.':ready?'✦ You made dinner happen.':index===0?'Let’s make something good.':index===steps.length-1?'The finishing touches. You’ve got this.':'One step at a time. You’re getting there.'}</Text>
 <Text style={s.meta}>{preview?'PREVIEW':'STEP'} {index+1} OF {steps.length}</Text><View accessibilityRole="progressbar" accessibilityLabel="Completed cooking steps" accessibilityValue={{min:0,max:steps.length,now:progress.completed}} style={{height:7,backgroundColor:'#34465D',borderRadius:7,overflow:'hidden'}}><View style={{height:7,width:(progress.percent+'%') as `${number}%`,backgroundColor:'#FFCA9F'}}/></View>
 {preview&&<Text style={s.meta}>Previewing does not advance saved progress or start timers.</Text>}<Text style={[s.title,{fontSize:small?30:40}]}>{step.title}</Text><Text style={[s.body,{fontSize:small?20:28,lineHeight:small?32:41}]}>{copy.action}</Text>
 {copy.safety.map((tip:string)=><Text key={tip} style={s.body}>{tip}</Text>)}
 {!!copy.tips.length&&<><Button compact quiet selected={showCoaching} onPress={()=>setShowCoaching(!showCoaching)}>{showCoaching?'Hide extra guidance':'Show me how'}</Button>{showCoaching&&copy.tips.map((tip:string)=><Text key={tip} style={s.body}>{tip}</Text>)}</>}
 {!preview&&step.seconds>0&&<View style={s.timer}><Text style={s.kicker}>KITCHEN TIMER</Text><Text accessibilityLiveRegion="none" style={s.digits}>{night.timer?left?Math.floor(left/60)+':'+String(left%60).padStart(2,'0'):'Time’s up':Math.round(step.seconds/60)+' min'}</Text><Button compact disabled={busy} onPress={()=>onUpdate({timer:night.timer?null:Date.now()+step.seconds*1000})}>{night.timer?'Stop timer':'Start timer'}</Button></View>}
 <View style={s.row}><Button compact disabled={busy||index===0} onPress={()=>preview?onPreviewStep(index-1):onUpdate({step:index-1})}>← Previous</Button>{preview?<><Button compact disabled={index===steps.length-1} onPress={()=>onPreviewStep(index+1)}>Next preview →</Button><Button compact primary disabled={busy||!checked} onPress={onStart}>Start cooking</Button></>:index===steps.length-1?<Button compact primary disabled={busy||ready} onPress={()=>onUpdate({complete:true})}>{ready?'Dinner marked ready ✓':'Dinner is ready ✓'}</Button>:<Button compact primary disabled={busy} onPress={()=>onUpdate({step:index+1})}>Next step →</Button>}</View>
 {ready&&<View accessibilityLiveRegion="polite" style={s.ready}><Text style={s.title}>Dinner is ready.</Text><Text style={s.body}>Your saved evening is updated. Time to sit down together.</Text>{!phone&&<Button compact primary onPress={onBack}>Back to my evening</Button>}</View>}
 {!!syncError&&<Text accessibilityLiveRegion="polite" style={s.warning}>{syncError}</Text>}
 <Button compact quiet selected={details} onPress={()=>setDetails(!details)}>{details?'Hide ingredients':'Ingredients & recipe details'}</Button>{details&&<View style={{gap:12}}>{ingredients(m,night.prefs.people,night.adapted).map((i:any)=><Text key={i.name+i.unit} style={s.body}>{i.amount} {i.unit} · {i.name}</Text>)}<Text style={s.meta}>Cooking times are estimates. Recipes have not yet been kitchen-tested.</Text></View>}{!phone&&<Button compact quiet onPress={onHelp}>Recipe help</Button>}
 <Text style={s.meta}>{phone?'Progress is shared with your TV. Keep this private link within your household.':'Use Send to phone from your evening plan to cook in the kitchen.'}</Text>
 </LinearGradient></View></ScrollView>;
}
const s=StyleSheet.create({panel:{padding:24,borderRadius:24,borderWidth:1,borderColor:'#35475F',gap:20},title:{color:'#FFF6EE',fontWeight:'800',lineHeight:46},kicker:{fontSize:17,color:'#FFCA9F',fontWeight:'800',letterSpacing:1.4},meta:{color:'#C4D2E3',fontSize:18,lineHeight:28},body:{color:'#EAF0F8',fontSize:23,lineHeight:34},encourage:{color:'#FFCA9F',fontSize:20,lineHeight:29,fontWeight:'600'},row:{flexDirection:'row',flexWrap:'wrap',gap:12},timer:{padding:20,gap:12,borderRadius:18,backgroundColor:'#0C1726'},digits:{fontSize:44,color:'#FFF',fontWeight:'800',fontVariant:['tabular-nums']},ready:{padding:20,gap:12,borderRadius:18,backgroundColor:'#14392E'},warning:{color:'#FFD3AA',fontSize:20,lineHeight:28}});
