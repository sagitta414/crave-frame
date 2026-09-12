import {Text} from './TVText';
import React,{useContext,useEffect,useRef,useState} from 'react';
import {Animated,Easing,Image,View,useWindowDimensions} from 'react-native';
import {STORY_SCENE_MS} from './EveningStory';
import {MotionContext} from './Motion';
const lines=[['Tonight deserves a plot twist.','Dinner. A good story. Your kind of evening.'],['Cue the cravings.','A little inspiration for your next big bite.'],['Give your sofa a supporting cast.','Something delicious belongs in this scene.'],['Less “what’s for dinner?”','More “let’s make a night of it.”']];
export function MatchingStage({compact=false,sceneIndex}:{compact?:boolean,sceneIndex?:number}){
 const reduced=useContext(MotionContext),{width,height}=useWindowDimensions(),small=width<700,short=height<650;
 const [scene,setScene]=useState(0),float=useRef(new Animated.Value(0)).current,reveal=useRef(new Animated.Value(1)).current;
 useEffect(()=>{if(reduced){float.setValue(.5);return;}const loop=Animated.loop(Animated.sequence([Animated.timing(float,{toValue:1,duration:2200,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.timing(float,{toValue:0,duration:2200,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));loop.start();const timer=setInterval(()=>setScene(v=>sceneIndex===undefined?(v+1)%lines.length:v),STORY_SCENE_MS);return()=>{loop.stop();clearInterval(timer);};},[reduced,sceneIndex]);
 useEffect(()=>{if(reduced){reveal.setValue(1);return;}reveal.setValue(0);const a=Animated.timing(reveal,{toValue:1,duration:450,easing:Easing.out(Easing.cubic),useNativeDriver:true});a.start();return()=>a.stop();},[scene,sceneIndex,reduced]);
 const cardWidth=small?108:compact||short?160:220,cardHeight=small?90:compact||short?116:166;
 return <View style={{alignItems:'center',justifyContent:'center',gap:compact||short?14:24,paddingVertical:compact?20:8,width:'100%'}}>
 <View accessible={false} pointerEvents="none" style={{height:cardHeight+28,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:small?14:32}}>
 <Animated.View style={{width:cardWidth,height:cardHeight,borderRadius:20,overflow:'hidden',borderWidth:2,borderColor:'#FFCEAD',transform:[{translateY:float.interpolate({inputRange:[0,1],outputRange:[-7,7]})},{rotate:'-7deg'}]}}><Image source={require('../assets/story/dinner-v1.jpg')} resizeMode="cover" style={{width:'100%',height:'100%'}}/><View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#0A101CDE',padding:8}}><Text style={{color:'#FFD2AD',fontSize:small?15:20,fontWeight:'900'}}>THE DINNER</Text></View></Animated.View>
 <Animated.View style={{width:small?44:68,height:small?44:68,borderRadius:40,backgroundColor:'#FFC49B',alignItems:'center',justifyContent:'center',opacity:float.interpolate({inputRange:[0,1],outputRange:[.65,1]}),transform:[{scale:float.interpolate({inputRange:[0,1],outputRange:[.9,1.12]})}]}}><Text style={{fontSize:small?30:46,color:'#131326',fontWeight:'900'}}>✦</Text></Animated.View>
 <Animated.View style={{width:cardWidth,height:cardHeight,borderRadius:20,overflow:'hidden',borderWidth:2,borderColor:'#B7CAFF',transform:[{translateY:float.interpolate({inputRange:[0,1],outputRange:[7,-7]})},{rotate:'7deg'}]}}><Image source={require('../assets/story/together-v1.jpg')} resizeMode="cover" style={{width:'100%',height:'100%'}}/><View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#0A101CDE',padding:8}}><Text style={{color:'#C9D8FF',fontSize:small?15:20,fontWeight:'900'}}>THE SHOW</Text></View></Animated.View>
 </View>
 <Animated.View style={{opacity:reveal,alignItems:'center',transform:[{translateY:reveal.interpolate({inputRange:[0,1],outputRange:[12,0]})}]}}><Text style={{fontSize:small?28:compact||short?38:54,lineHeight:small?35:compact||short?46:62,fontWeight:'900',color:'#FFF8EF',textAlign:'center',maxWidth:1000}}>{lines[sceneIndex??scene][0]}</Text>{!short&&<Text style={{fontSize:small?19:25,lineHeight:small?27:34,color:'#D8E1F0',textAlign:'center',marginTop:10}}>{lines[scene][1]}</Text>}</Animated.View>
 </View>;
}
