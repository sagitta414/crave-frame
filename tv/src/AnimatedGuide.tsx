import React,{useEffect,useRef,useState} from 'react';
import {Animated,Easing,Image,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {BrandMark} from './Brand';

const scenes=[
 {title:'Pick your story.',detail:'Choose a movie or show.',hint:'Arrows move • Center selects',color:'#90B4FF',image:require('../assets/food/manor.jpg'),label:'01 / THE SCREEN'},
 {title:'Find your flavor.',detail:'Choose a dinner pairing.',hint:'Why this pairing explains the match.',color:'#FFC09A',image:require('../assets/food/pizza.jpg'),label:'02 / THE DINNER'},
 {title:'Make a night of it.',detail:'Plan your evening. Cook or order in.',hint:'Back returns to the previous screen.',color:'#A1E8CD',image:require('../assets/food/burgers.jpg'),label:'03 / YOUR EVENING'}
];

export function AnimatedGuide({reduced=false}:{reduced?:boolean}){
 const {width,height}=useWindowDimensions(),wide=width>=900;
 const [step,setStep]=useState(0),reveal=useRef(new Animated.Value(0)).current;
 useEffect(()=>{if(reduced)return;const a=setTimeout(()=>setStep(1),2400),b=setTimeout(()=>setStep(2),4800);return()=>{clearTimeout(a);clearTimeout(b);};},[reduced]);
 useEffect(()=>{if(reduced){reveal.setValue(1);return;}reveal.setValue(0);const animation=Animated.timing(reveal,{toValue:1,duration:620,easing:Easing.out(Easing.back(1.15)),useNativeDriver:true});animation.start();return()=>animation.stop();},[step,reduced]);
 const scene=scenes[step],artHeight=Math.min(height*(wide?.4:.23),360);
 if(reduced)return <View style={{maxWidth:1000,gap:20}}><Text style={s.eyebrow}>YOUR NIGHT IN THREE STEPS</Text>{scenes.map((item,i)=><View key={item.title} style={{flexDirection:'row',gap:20,alignItems:'center'}}><Image source={item.image} style={{width:90,height:70,borderRadius:12}}/><Text style={[s.detail,{flex:1}]}>{i+1}. {item.detail}</Text></View>)}<Text style={s.hint}>Arrows move • Center selects • Back returns</Text></View>;
 return <View style={{width:Math.min(width-48,1340),gap:24}}>
  <View style={s.steps}>{scenes.map((item,i)=><View key={item.label} style={[s.step,{borderColor:i===step?item.color:'#34435B',backgroundColor:i===step?'#1E2C46':'#0C1424'}]}><Text style={{fontSize:wide?24:18,fontWeight:'800',color:i===step?item.color:'#B6C5DF'}}>{i+1}  {['WATCH','DINE','ENJOY'][i]}</Text></View>)}</View>
  <View style={{flexDirection:wide?'row':'column',alignItems:'center',gap:wide?44:18}}>
   <Animated.View style={{width:wide?'46%':'90%',height:artHeight,opacity:reveal,transform:[{translateX:reveal.interpolate({inputRange:[0,1],outputRange:[-100,0]})},{rotate:reveal.interpolate({inputRange:[0,1],outputRange:['-9deg','-2deg']})},{scale:reveal.interpolate({inputRange:[0,1],outputRange:[.78,1]})}]}}>
    <View style={[s.art,{borderColor:scene.color}]}><Image source={scene.image} resizeMode="cover" style={StyleSheet.absoluteFill}/><LinearGradient colors={['transparent','#071023']} style={StyleSheet.absoluteFill}/><Text style={[s.artLabel,{color:scene.color}]}>{scene.label}</Text></View>
    {step===2&&<View style={s.mark}><BrandMark size={Math.min(110,artHeight*.4)}/></View>}
   </Animated.View>
   <Animated.View accessibilityLiveRegion="polite" style={{flex:wide?1:undefined,width:wide?undefined:'100%',opacity:reveal,transform:[{translateY:reveal.interpolate({inputRange:[0,1],outputRange:[40,0]})}]}}>
    <Text style={[s.title,{fontSize:wide?64:34,lineHeight:wide?72:42}]}>{scene.title}</Text>
    <Text style={[s.detail,{fontSize:wide?34:25,lineHeight:wide?44:33}]}>{scene.detail}</Text>
    <View style={[s.rule,{backgroundColor:scene.color}]}/>
    <Text style={[s.hint,{fontSize:wide?27:21,lineHeight:wide?36:29}]}>{scene.hint}</Text>
   </Animated.View>
  </View>
 </View>;
}
const s=StyleSheet.create({steps:{flexDirection:'row',gap:12,justifyContent:'center'},step:{paddingVertical:12,paddingHorizontal:18,borderWidth:2,borderRadius:12},eyebrow:{color:'#FFC09A',fontSize:26,fontWeight:'900'},title:{color:'#FFFFFF',fontWeight:'900',letterSpacing:-1,marginBottom:16},detail:{color:'#F2F5FC',fontSize:32,lineHeight:42,fontWeight:'700'},hint:{color:'#D0DCF1',fontSize:26,lineHeight:36},rule:{width:72,height:5,borderRadius:4,marginVertical:22},art:{flex:1,borderRadius:24,borderWidth:3,overflow:'hidden',backgroundColor:'#15233B'},artLabel:{position:'absolute',left:24,bottom:22,fontSize:24,fontWeight:'900',letterSpacing:2},mark:{position:'absolute',right:-12,top:-16,backgroundColor:'#0B1426',borderRadius:24,padding:4}});

