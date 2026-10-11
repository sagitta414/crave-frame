import React,{useEffect,useRef,useState} from 'react';
import {Animated,Easing,Image,Platform,ScrollView,StyleSheet,View,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Text} from './TVText';
import {BrandMark} from './Brand';
import {MotionContext} from './Motion';
import {TVButton,FocusScope} from './TVButton';

export function PremiereLoading({reduced=false,boot=false,onCancel,context}:{context?:string,reduced?:boolean,boot?:boolean,onCancel?:()=>void}){
 const {width,height}=useWindowDimensions(),wide=width>=1000,short=height<650;
 const [seconds,setSeconds]=useState(0),[shown,setShown]=useState(boot),[paused,setPaused]=useState(false);
 const drift=useRef(new Animated.Value(0)).current,still=reduced||paused;
 useEffect(()=>{const reveal=setTimeout(()=>setShown(true),350),clock=setInterval(()=>setSeconds(s=>s+1),1000);return()=>{clearTimeout(reveal);clearInterval(clock);};},[]);
 useEffect(()=>{if(!shown||still){drift.setValue(.5);return;}const loop=Animated.loop(Animated.sequence([Animated.timing(drift,{toValue:1,duration:4200,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.timing(drift,{toValue:0,duration:4200,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));loop.start();return()=>loop.stop();},[shown,still]);
 useEffect(()=>{if(!shown||Platform.OS!=='web')return;const previous=document.activeElement as HTMLElement;const frame=requestAnimationFrame(()=>[...document.querySelectorAll<HTMLElement>('[data-testid="premiere-loading"] [role="button"]')].at(-1)?.focus({preventScroll:true}));return()=>{cancelAnimationFrame(frame);if(previous?.isConnected)previous.focus({preventScroll:true});};},[shown]);
 if(!shown)return null;
 const float=drift.interpolate({inputRange:[0,1],outputRange:[-9,9]});
 return <MotionContext.Provider value={still}><FocusScope.Provider value="loading-cinema"><View testID="premiere-loading" accessibilityViewIsModal {...(Platform.OS==='web'?{'aria-modal':true,role:'dialog','aria-label':'Loading your evening'} as any:{})} style={[StyleSheet.absoluteFill,s.root]}>
  <Image accessible={false} source={require('../assets/story/together-v1.jpg')} resizeMode="cover" style={[StyleSheet.absoluteFill,{width:'100%',height:'100%',opacity:.25}]}/>
  <LinearGradient colors={['#080D1BF2','#111D35B8','#080D1BF5']} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill}/>
  <Animated.View pointerEvents="none" style={[s.glow,{opacity:drift.interpolate({inputRange:[0,1],outputRange:[.18,.4]}),transform:[{scale:drift.interpolate({inputRange:[0,1],outputRange:[.9,1.08]})}]}]}/>
  <ScrollView contentContainerStyle={{flexGrow:1,padding:wide?48:24,gap:short?16:28,justifyContent:'center'}}>
   <View style={s.brand}><BrandMark size={short?64:86}/><Text style={s.wordmark}>crave frame</Text></View>
   <View style={{flexDirection:wide?'row':'column',alignItems:'center',gap:wide?48:20,maxWidth:1400,width:'100%',alignSelf:'center'}}>
    <View style={{flex:wide?1:undefined,width:wide?undefined:'100%',gap:18}}><Text style={s.kicker}>DINNER. SOMETHING TO WATCH. SORTED.</Text><Text style={[s.title,{fontSize:short?36:wide?58:40,lineHeight:short?44:wide?66:48}]}>Leave the day behind.<Text style={{color:'#FFD0AB'}}>{'\n'}Make a night of it.</Text></Text><Text style={s.body}>Less deciding. Dinner that fits. Time together.</Text></View>
    <View accessible={false} style={{width:wide?430:Math.min(340,width-48),height:short?140:wide?280:200,alignItems:'center',justifyContent:'center'}}>
     <Animated.View style={[s.photo,{left:0,top:4,width:'57%',height:'82%',transform:[{translateY:float},{rotate:'-8deg'}],borderColor:'#F0BD94'}]}><Image source={require('../assets/story/dinner-v1.jpg')} style={s.image}/><View style={s.caption}><Text style={s.captionText}>THE DINNER</Text></View></Animated.View>
     <Animated.View style={[s.photo,{right:0,bottom:0,width:'57%',height:'82%',transform:[{translateY:Animated.multiply(float,-1)},{rotate:'7deg'}],borderColor:'#ABC6EF'}]}><Image source={require('../assets/story/together-v1.jpg')} style={s.image}/><View style={s.caption}><Text style={s.captionText}>THE STORY</Text></View></Animated.View>
     <View style={s.spark}><Text style={{fontSize:32,color:'#161B29'}}>✦</Text></View>
    </View>
   </View>
   <View style={s.status}><View accessibilityRole="progressbar" accessibilityLabel="Request in progress" style={{height:4,overflow:'hidden',backgroundColor:'#334159',borderRadius:3}}><Animated.View style={{height:4,width:'35%',backgroundColor:'#FFCCAB',opacity:still?1:drift,transform:[{translateX:still?0:drift.interpolate({inputRange:[0,1],outputRange:[0,240]})}]}}/></View><Text accessibilityLiveRegion="polite" style={s.statusText}>{seconds>=30?'Taking longer than usual. Your result will open when ready.':context||(boot?'Opening your evening…':'Bringing your evening together…')}</Text><View style={s.footer}><Text style={s.time}>{seconds}s elapsed</Text>{!reduced&&<TVButton compact quiet onPress={()=>setPaused(!paused)}>{paused?'Resume motion':'Pause motion'}</TVButton>}{onCancel&&<TVButton compact onPress={onCancel}>Cancel suggestions</TVButton>}</View></View>
  </ScrollView>
 </View></FocusScope.Provider></MotionContext.Provider>;
}
const s=StyleSheet.create({root:{zIndex:100,backgroundColor:'#080D1B'},glow:{position:'absolute',right:-100,top:-160,width:640,height:640,borderRadius:320,backgroundColor:'#587EC0'},brand:{flexDirection:'row',alignItems:'center',gap:18,maxWidth:1400,width:'100%',alignSelf:'center'},wordmark:{fontSize:35,lineHeight:44,color:'#FFF6ED',fontWeight:'900'},kicker:{fontSize:18,lineHeight:26,color:'#ADC8F2',fontWeight:'800',letterSpacing:1.5},title:{fontWeight:'900',color:'#FFF8F0',letterSpacing:-1.5},body:{fontSize:25,lineHeight:35,color:'#D1DDEE'},photo:{position:'absolute',overflow:'hidden',borderRadius:22,borderWidth:2,backgroundColor:'#152039'},image:{width:'100%',height:'100%',resizeMode:'cover'},caption:{position:'absolute',bottom:0,left:0,right:0,padding:12,backgroundColor:'#0A1424D9'},captionText:{fontSize:17,lineHeight:24,color:'#FFF2E5',fontWeight:'800',letterSpacing:1.5},spark:{width:58,height:58,borderRadius:29,alignItems:'center',justifyContent:'center',backgroundColor:'#FFD0AB',borderWidth:4,borderColor:'#172238'},status:{maxWidth:1400,width:'100%',alignSelf:'center',gap:14,marginTop:8},statusText:{fontSize:25,lineHeight:34,color:'#F4F7FD',fontWeight:'600'},footer:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:14},time:{fontSize:18,lineHeight:26,color:'#AFC2DC',flexGrow:1}});
