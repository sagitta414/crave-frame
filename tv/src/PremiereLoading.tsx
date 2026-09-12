import {Text} from './TVText';
import {MatchingStage} from './MatchingStage';
import React,{useEffect,useRef,useState} from 'react';
import {Animated,Easing,Platform,StyleSheet,View,useWindowDimensions} from 'react-native';
import {MotionContext} from './Motion';
import {TVButton,FocusScope} from './TVButton';
import {StoryBackdrop,StoryBrand,StoryCaption,STORY_SCENE_MS,storyStyles as s} from './EveningStory';

export function PremiereLoading({reduced=false,boot=false,onCancel}:{reduced?:boolean,boot?:boolean,onCancel?:()=>void}){
 const [seconds,setSeconds]=useState(0),[shown,setShown]=useState(boot),[paused,setPaused]=useState(false),travel=useRef(new Animated.Value(0)).current;
 const {width,height}=useWindowDimensions(),small=width<900;
 useEffect(()=>{const reveal=setTimeout(()=>setShown(true),350),timer=setInterval(()=>setSeconds(v=>v+1),1000);return()=>{clearTimeout(reveal);clearInterval(timer);};},[]);
 useEffect(()=>{if(!shown||reduced||paused){travel.setValue(.35);return;}travel.setValue(0);const loop=Animated.loop(Animated.timing(travel,{toValue:1,duration:1700,easing:Easing.inOut(Easing.sin),useNativeDriver:true}));loop.start();return()=>loop.stop();},[reduced,shown,paused]);
 useEffect(()=>{if(!shown||Platform.OS!=='web')return;const previous=document.activeElement as HTMLElement;const frame=requestAnimationFrame(()=>[...document.querySelectorAll<HTMLElement>('[data-testid="premiere-loading"] [role="button"]')].at(-1)?.focus({preventScroll:true}));return()=>{cancelAnimationFrame(frame);if(previous?.isConnected)previous.focus({preventScroll:true});};},[shown]);
 const [step,setStep]=useState(0);useEffect(()=>{if(reduced||paused||!shown||step===2)return;const timer=setTimeout(()=>setStep(v=>Math.min(2,v+1)),STORY_SCENE_MS);return()=>clearTimeout(timer);},[shown,step,reduced,paused]);
 if(!shown)return null;
 return <MotionContext.Provider value={reduced||paused}><FocusScope.Provider value="loading-story"><View accessibilityViewIsModal {...(Platform.OS==='web'?{'aria-modal':true,role:'dialog'} as any:{})} testID="premiere-loading" style={[StyleSheet.absoluteFill,s.root,{zIndex:100}]}>
  <StoryBackdrop step={step} reduced={reduced||paused}/>
  <View style={{flex:1,paddingHorizontal:small?24:56,paddingTop:height<600?16:28,paddingBottom:24,justifyContent:'space-between'}}>
   <View style={[s.row,{justifyContent:'space-between'}]}><StoryBrand/>{!small&&<Text style={[s.label,{letterSpacing:2}]}>DINNER + A STORY · THE EVENING EDIT</Text>}</View>
   {boot?<StoryCaption step={step} reduced={reduced||paused} loading/>:<View style={{backgroundColor:'#060B16B8',borderRadius:28,padding:small?12:24}}><MatchingStage sceneIndex={step}/></View>}
   <View style={{gap:14,maxWidth:700}}>
    <Text accessibilityLiveRegion="polite" style={{fontSize:small?25:32,lineHeight:small?34:42,fontWeight:'800',color:'#FFF'}}>{seconds>=30?(onCancel?'Still working. You can cancel and try again.':'Still opening your household…'):boot?'Opening your Crave Frame household…':'Waiting for your result…'}</Text>
    <View accessibilityRole="progressbar" accessibilityLabel={boot?'Opening Crave Frame':'Request in progress'} style={{width:260,height:5,overflow:'hidden',borderRadius:4,backgroundColor:'#465168'}}><Animated.View style={{width:90,height:5,backgroundColor:'#FFD1AE',transform:[{translateX:travel.interpolate({inputRange:[0,1],outputRange:[-90,260]})}]}}/></View>
   </View>
  </View>
  <View style={[s.footer,s.row,{justifyContent:'space-between',paddingHorizontal:small?24:56}]}><Text style={[s.label,{maxWidth:small?400:660}]}>{seconds>=15?`${seconds}s elapsed${onCancel?' · You can cancel and retry.':' · Please check your connection if this continues.'}`:'Your result opens as soon as it is ready.'}</Text><View style={s.row}>{!reduced&&<TVButton quiet onPress={()=>setPaused(!paused)}>{paused?'Resume motion':'Pause motion'}</TVButton>}{onCancel&&<TVButton primary preferred onPress={onCancel}>Cancel request</TVButton>}</View></View>
 </View></FocusScope.Provider></MotionContext.Provider>;
}
