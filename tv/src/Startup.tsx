import {isSilk} from './SilkPage';
import {Text} from './TVText';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,Platform,View,useWindowDimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAudioPlayer} from 'expo-audio';
import {playCue} from './Sonic';
import {TVButton,FocusScope} from './TVButton';
import {MotionContext} from './Motion';
import {StoryBackdrop,StoryBrand,StoryCaption,eveningStory,storyStyles as s} from './EveningStory';

export function Startup({onComplete,soundEnabled=true}:{onComplete:()=>void,soundEnabled?:boolean}){
 const {width,height}=useWindowDimensions(),small=width<900;const help=Platform.OS==='web'&&isSilk(navigator.userAgent)?'Move the cursor with arrows · Center clicks · Move down to scroll':'Arrows move · Center selects · Back returns';
 const [step,setStep]=useState(0),[reduced,setReduced]=useState(true),[ready,setReady]=useState(false),[paused,setPaused]=useState(false);
 const ended=useRef(false),callback=useRef(onComplete);callback.current=onComplete;
 const ident=useAudioPlayer(require('../assets/audio/ident.wav'));
 const finish=useCallback(()=>{if(!ended.current){ended.current=true;callback.current();}},[]);
 useEffect(()=>{let live=true;const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',v=>{setReduced(v);if(v)setPaused(true);});Promise.all([AccessibilityInfo.isReduceMotionEnabled().catch(()=>true),AsyncStorage.getItem('cf-reduced-motion').catch(()=>null),AsyncStorage.getItem('cf-sound-enabled').catch(()=>null)]).then(([system,saved,sound])=>{if(!live)return;setReduced(system||saved==='true');setReady(true);if(!system&&saved!=='true'&&soundEnabled&&sound==='true')playCue(ident,.22);});return()=>{live=false;sub.remove();};},[]);
 // Three 3-second scenes. Manual browsing and reduced motion never auto-advance.
 useEffect(()=>{if(!ready||reduced||paused)return;const timer=setTimeout(()=>{if(step<2)setStep(step+1);else finish();},3000);return()=>clearTimeout(timer);},[step,ready,reduced,paused,finish]);
 useEffect(()=>{if(Platform.OS!=='web')return;const frame=requestAnimationFrame(()=>document.querySelector<HTMLElement>('[data-testid="premiere-intro"] [data-testid="intro-actions"] [role="button"]')?.focus({preventScroll:true}));return()=>cancelAnimationFrame(frame);},[]);
 return <MotionContext.Provider value={reduced}><FocusScope.Provider value="intro-story"><View style={s.root} testID="premiere-intro">
  <StoryBackdrop step={step} reduced={reduced||paused}/>
  <View style={{flex:1,paddingHorizontal:small?24:56,paddingTop:height<600?16:28,paddingBottom:20,justifyContent:'space-between'}}>
   <View style={[s.row,{justifyContent:'space-between'}]}><StoryBrand/>{!small&&<Text style={[s.label,{letterSpacing:2}]}>A NIGHT LIKE YOURS</Text>}</View>
   <View style={{paddingVertical:16}}><StoryCaption step={step} reduced={reduced||paused}/></View>
   <View style={[s.row,{gap:10}]}>{eveningStory.map((scene,i)=><View key={scene.time} style={{width:small?55:90,height:5,borderRadius:3,backgroundColor:i===step?scene.accent:i<step?'#A0AEC1':'#536078'}}/>)}<Text style={[s.label,{marginLeft:8}]}>{step+1} / 3{!paused&&!reduced?' · 9-second intro':''}</Text></View>
  </View>
  <View style={[s.footer,{paddingHorizontal:small?24:56}]}>
   <View testID="intro-actions" style={[s.row,{justifyContent:'space-between'}]}>
    <View style={s.row}><TVButton primary preferred onPress={finish}>Start my evening →</TVButton><TVButton onPress={()=>{if(reduced||paused){if(step===2)finish();else setStep(step+1);}else setPaused(true);}}>{reduced||paused?step===2?'Finish story':'Next scene →':'Pause story'}</TVButton>{(paused||reduced)&&step>0&&<TVButton quiet onPress={()=>setStep(step-1)}>Previous</TVButton>}</View>
    {!small&&<Text style={[s.label,{maxWidth:400}]}>{help}</Text>}
   </View>
   {small&&<Text style={s.label}>{help}</Text>}
  </View>
 </View></FocusScope.Provider></MotionContext.Provider>;
}
