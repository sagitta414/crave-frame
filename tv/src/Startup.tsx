import {isSilk} from './SilkPage';
import {Text} from './TVText';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,Platform,ScrollView,View,useWindowDimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAudioPlayer,useAudioPlayerStatus} from 'expo-audio';
import {playCue} from './Sonic';
import {TVButton,FocusScope} from './TVButton';
import {MotionContext} from './Motion';
import {StoryBackdrop,StoryBrand,StoryCaption,StoryProgress,eveningStory,STORY_SCENE_MS,storyStyles as s} from './CinematicStory';

export function Startup({onComplete,soundEnabled=true}:{onComplete:()=>void,soundEnabled?:boolean}){
 const {width,height}=useWindowDimensions(),small=width<900,silk=Platform.OS==='web'&&isSilk(navigator.userAgent);const help='Arrows move · Center selects · Back returns';
 const [step,setStep]=useState(0),[reduced,setReduced]=useState(true),[ready,setReady]=useState(false),[paused,setPaused]=useState(false),[controls,setControls]=useState(false);
 const ended=useRef(false),callback=useRef(onComplete);callback.current=onComplete;
 const ident=useAudioPlayer(require('../assets/audio/ident.wav'));
 const music=useAudioPlayer(require('../assets/audio/evening-intro.wav'));
 const musicStatus=useAudioPlayerStatus(music);
 const resumeMusic=useRef(false);
 useEffect(()=>{if(paused){resumeMusic.current=music.playing;music.pause();}else if(resumeMusic.current){resumeMusic.current=false;music.play();}},[paused,music]);
 const toggleMusic=()=>{if(music.playing){music.pause();return;}music.volume=.32;music.loop=true;music.play();if(paused)setPaused(false);};
 const finish=useCallback(()=>{if(!ended.current){ended.current=true;music.pause();callback.current();}},[music]);
 useEffect(()=>{let live=true;const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',v=>{setReduced(v);if(v)setPaused(true);});Promise.all([AccessibilityInfo.isReduceMotionEnabled().catch(()=>true),AsyncStorage.getItem('cf-reduced-motion').catch(()=>null),AsyncStorage.getItem('cf-sound-enabled').catch(()=>null)]).then(([system,saved,sound])=>{if(!live)return;setReduced(system||saved==='true');setReady(true);if(!system&&saved!=='true'&&soundEnabled&&sound==='true')playCue(ident,.22);});return()=>{live=false;sub.remove();};},[]);
 // Preserve time already watched when the viewer pauses and resumes.
 const sceneElapsed=useRef(0),lastScene=useRef(step);
 useEffect(()=>{if(lastScene.current!==step){lastScene.current=step;sceneElapsed.current=0;}if(!ready||reduced||paused||step===eveningStory.length-1)return;const began=Date.now(),timer=setTimeout(()=>{if(step<eveningStory.length-1)setStep(step+1);},Math.max(0,STORY_SCENE_MS-sceneElapsed.current));return()=>{sceneElapsed.current+=Date.now()-began;clearTimeout(timer);};},[step,ready,reduced,paused,finish]);
 useEffect(()=>{if(Platform.OS!=='web')return;const frame=requestAnimationFrame(()=>document.querySelector<HTMLElement>('[data-testid="premiere-intro"] [data-testid="intro-actions"] [role="button"]')?.focus({preventScroll:true}));return()=>cancelAnimationFrame(frame);},[]);
 return <MotionContext.Provider value={reduced||paused}><FocusScope.Provider value="intro-story"><View style={[s.root,Platform.OS==='web'?({overflow:'clip'} as any):null]} testID="premiere-intro">
  <StoryBackdrop step={step} reduced={reduced} paused={paused}/>
  <ScrollView style={{flex:1}} contentContainerStyle={{flexGrow:1,paddingHorizontal:small?24:40,paddingTop:24,paddingBottom:16,justifyContent:'space-between',gap:10}}>
   <View style={[s.row,{justifyContent:'space-between'}]}><StoryBrand/></View>
   <View style={{paddingVertical:4}}><StoryCaption step={step} reduced={reduced||paused}/></View>
   <StoryProgress step={step} paused={paused||!ready} reduced={reduced}/>
  </ScrollView>
  <View style={[s.footer,{paddingHorizontal:small?24:40,paddingVertical:10}]}>
   <View testID="intro-actions" style={[s.row,{justifyContent:'space-between'}]}>
    <View style={s.row}><TVButton compact primary preferred onPress={finish}>Plan my evening →</TVButton><TVButton compact quiet selected={controls} onPress={()=>setControls(!controls)}>{controls?'Hide story controls':'Story controls'}</TVButton></View>
    {!silk&&height>=700&&!small&&<Text style={[s.label,{maxWidth:400}]}>{help}</Text>}
   </View>
   {controls&&<View style={[s.row,{flexWrap:'wrap',paddingTop:10}]} ><TVButton compact quiet onPress={()=>step===eveningStory.length-1?finish():setStep(step+1)}>{step===eveningStory.length-1?'Continue to my evening':'Next scene →'}</TVButton>{!reduced&&step<eveningStory.length-1&&<TVButton compact quiet onPress={()=>setPaused(!paused)}>{paused?'Resume':'Pause'}</TVButton>}{step>0&&<TVButton compact quiet onPress={()=>setStep(step-1)}>Previous</TVButton>}<TVButton compact quiet onPress={toggleMusic}>{musicStatus.playing?'Mute music':'Play music'}</TVButton></View>}
   {!silk&&height>=700&&small&&<Text style={s.label}>{help}</Text>}
  </View>
 </View></FocusScope.Provider></MotionContext.Provider>;
}
