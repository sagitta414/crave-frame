import {Text} from './TVText';
import React,{useEffect,useRef} from 'react';
import {Animated,Easing,Image,StyleSheet,View,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {BrandMark} from './Brand';

// An illustrative everyday evening, not a customer testimonial or live request progress.
export const STORY_SCENE_MS=8000;
export const eveningStory=[
 {time:'6:15 PM',chapter:'HOME AT LAST',title:'Long day.\nTwo big questions.',detail:'Keys down. Everyone’s hungry. What should we watch?',instruction:'Pick a movie or show.',image:require('../assets/story/arrival-v1.jpg'),accent:'#B5CCFF'},
 {time:'6:18 PM',chapter:'A PLAN COMES TOGETHER',title:'Ratatouille tonight.\nPasta on the table.',detail:'For example: tomato pasta echoes the film’s love of simple, comforting food.',instruction:'Choose a pairing. See why it fits.',image:require('../assets/story/dinner-v1.jpg'),accent:'#FFCAA5'},
 {time:'7:00 PM',chapter:'THIS IS THE GOOD PART',title:'Dinner sorted.\nFeet up.',detail:'Dinner’s ready. Press play in your streaming app. Enjoy your evening together.',instruction:'Cook or order in. Then settle in.',image:require('../assets/story/together-v1.jpg'),accent:'#B2EDD6'}
];

export function StoryBackdrop({step,reduced=false}:{step:number,reduced?:boolean}){
 const {width}=useWindowDimensions();
 const motion=useRef(new Animated.Value(0)).current,fade=useRef(new Animated.Value(1)).current;
 useEffect(()=>{if(reduced){motion.setValue(0);fade.setValue(1);return;}motion.setValue(0);fade.setValue(.45);const animation=Animated.parallel([Animated.timing(motion,{toValue:1,duration:STORY_SCENE_MS,easing:Easing.out(Easing.quad),useNativeDriver:true}),Animated.timing(fade,{toValue:1,duration:500,useNativeDriver:true})]);animation.start();return()=>animation.stop();},[step,reduced]);
 return <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
  <Image source={eveningStory[Math.min(2,step+1)].image} style={{position:'absolute',width:1,height:1,opacity:0}}/>
  <Animated.Image source={eveningStory[step].image} resizeMode="cover" style={[StyleSheet.absoluteFill,{width:'100%',height:'100%',opacity:fade,transform:[{scale:motion.interpolate({inputRange:[0,1],outputRange:[1,1.055]})}]}]}/>
  {width<900&&<View style={[StyleSheet.absoluteFill,{backgroundColor:'#060B1699'}]}/>}
  <LinearGradient colors={['#060B16F5','#060B16D9','#060B1640','#060B160A']} locations={[0,.3,.65,1]} start={{x:0,y:.5}} end={{x:1,y:.5}} style={StyleSheet.absoluteFill}/>
  <LinearGradient colors={['#060B1655','transparent','#060B16FA']} locations={[0,.5,1]} style={StyleSheet.absoluteFill}/>
 </View>;
}
export function StoryBrand(){return <View style={{flexDirection:'row',gap:10,alignItems:'center'}}><BrandMark size={72}/><Text style={{fontSize:27,color:'#FFF7EF',fontWeight:'900',letterSpacing:.3}}>crave frame</Text></View>;}
export function StoryCaption({step,reduced=false,loading=false}:{step:number,reduced?:boolean,loading?:boolean}){
 const {width,height}=useWindowDimensions(),small=width<900,short=height<700,scene=eveningStory[step],reveal=useRef(new Animated.Value(1)).current;
 useEffect(()=>{if(reduced){reveal.setValue(1);return;}reveal.setValue(0);const a=Animated.timing(reveal,{toValue:1,duration:450,easing:Easing.out(Easing.cubic),useNativeDriver:true});a.start();return()=>a.stop();},[step,reduced]);
 return <Animated.View style={{maxWidth:small?620:Math.min(790,width*.6),opacity:reveal,transform:[{translateY:reveal.interpolate({inputRange:[0,1],outputRange:[18,0]})}]}}>
  <Text style={[storyStyles.chapter,{fontSize:small?17:22,color:scene.accent}]}>{scene.time}  /  {scene.chapter}</Text>
  <Text accessibilityRole="header" style={{color:'#FFF9F2',fontSize:short?36:small?38:64,lineHeight:short?42:small?44:72,fontWeight:'900',letterSpacing:-1.6,marginTop:short?8:14,marginBottom:short?8:16}}>{scene.title}</Text>
  <Text style={{fontSize:short?24:29,lineHeight:short?30:39,color:'#E3E8F0',maxWidth:720}}>{scene.detail}</Text>
  {!loading&&<View style={{borderLeftWidth:4,borderColor:scene.accent,paddingLeft:18,marginTop:short?10:22}}><Text style={{fontSize:short?24:29,lineHeight:short?30:39,color:'#FFF',fontWeight:'700'}}>{scene.instruction}</Text></View>}
 </Animated.View>;
}
export const storyStyles=StyleSheet.create({root:{flex:1,backgroundColor:'#060B16',overflow:'hidden'},chapter:{fontWeight:'800',letterSpacing:2},footer:{backgroundColor:'#080E1DEB',borderTopWidth:1,borderColor:'#72829B55',paddingVertical:18,paddingHorizontal:32,gap:12},row:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:14},label:{fontSize:21,lineHeight:29,color:'#D3DFEF'}});
