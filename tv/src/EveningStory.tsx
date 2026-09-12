import {Text} from './TVText';
import React,{useEffect,useRef} from 'react';
import {Animated,Easing,Image,StyleSheet,View,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {BrandMark} from './Brand';

// An illustrative everyday evening, not a customer testimonial or live request progress.
export const eveningStory=[
 {time:'6:15 PM',chapter:'HOME AT LAST',title:'Long day.\nTwo big questions.',detail:'What’s for dinner? What’s worth watching?',instruction:'Pick a movie or show.',image:require('../assets/story/arrival-v1.jpg'),accent:'#B5CCFF'},
 {time:'6:18 PM',chapter:'A PLAN COMES TOGETHER',title:'Pick the story.\nFind your dinner.',detail:'Something familiar. A little more inspired.',instruction:'Choose a pairing. See why it fits.',image:require('../assets/story/dinner-v1.jpg'),accent:'#FFCAA5'},
 {time:'7:00 PM',chapter:'THIS IS THE GOOD PART',title:'Dinner sorted.\nFeet up.',detail:'An ordinary Tuesday. A night worth keeping.',instruction:'Cook or order in. Then settle in.',image:require('../assets/story/together-v1.jpg'),accent:'#B2EDD6'}
];

export function StoryBackdrop({step,reduced=false}:{step:number,reduced?:boolean}){
 const {width}=useWindowDimensions();
 const motion=useRef(new Animated.Value(0)).current,fade=useRef(new Animated.Value(1)).current;
 useEffect(()=>{if(reduced){motion.setValue(0);fade.setValue(1);return;}motion.setValue(0);fade.setValue(.45);const animation=Animated.parallel([Animated.timing(motion,{toValue:1,duration:7000,easing:Easing.out(Easing.quad),useNativeDriver:true}),Animated.timing(fade,{toValue:1,duration:500,useNativeDriver:true})]);animation.start();return()=>animation.stop();},[step,reduced]);
 return <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
  <Image source={eveningStory[Math.min(2,step+1)].image} style={{position:'absolute',width:1,height:1,opacity:0}}/>
  <Animated.Image source={eveningStory[step].image} resizeMode="cover" style={[StyleSheet.absoluteFill,{opacity:fade,transform:[{scale:motion.interpolate({inputRange:[0,1],outputRange:[1,1.055]})}]}]}/>
  {width<900&&<View style={[StyleSheet.absoluteFill,{backgroundColor:'#060B1699'}]}/>}
  <LinearGradient colors={['#060B16F5','#060B16D9','#060B1640','#060B160A']} locations={[0,.3,.65,1]} start={{x:0,y:.5}} end={{x:1,y:.5}} style={StyleSheet.absoluteFill}/>
  <LinearGradient colors={['#060B1655','transparent','#060B16FA']} locations={[0,.5,1]} style={StyleSheet.absoluteFill}/>
 </View>;
}
export function StoryBrand(){return <View style={{flexDirection:'row',gap:10,alignItems:'center'}}><BrandMark size={72}/><Text style={{fontSize:27,color:'#FFF7EF',fontWeight:'900',letterSpacing:.3}}>crave frame</Text></View>;}
export function StoryCaption({step,reduced=false,loading=false}:{step:number,reduced?:boolean,loading?:boolean}){
 const {width,height}=useWindowDimensions(),small=width<900,short=height<600,scene=eveningStory[step],reveal=useRef(new Animated.Value(1)).current;
 useEffect(()=>{if(reduced){reveal.setValue(1);return;}reveal.setValue(0);const a=Animated.timing(reveal,{toValue:1,duration:450,easing:Easing.out(Easing.cubic),useNativeDriver:true});a.start();return()=>a.stop();},[step,reduced]);
 return <Animated.View style={{maxWidth:small?620:Math.min(790,width*.6),opacity:reveal,transform:[{translateY:reveal.interpolate({inputRange:[0,1],outputRange:[18,0]})}]}}>
  <Text style={[storyStyles.chapter,{fontSize:small?17:22,color:scene.accent}]}>{scene.time}  /  {scene.chapter}</Text>
  <Text accessibilityRole="header" style={{color:'#FFF9F2',fontSize:small?38:Math.min(short?52:72,Math.max(48,width*.047)),lineHeight:small?44:Math.min(short?60:80,Math.max(56,width*.047+8)),fontWeight:'900',letterSpacing:-1.6,marginTop:14,marginBottom:16}}>{scene.title}</Text>
  {!short&&<Text style={{fontSize:small?23:29,lineHeight:small?31:39,color:'#E3E8F0',maxWidth:620}}>{scene.detail}</Text>}
  {!loading&&<View style={{borderLeftWidth:4,borderColor:scene.accent,paddingLeft:18,marginTop:22}}><Text style={{fontSize:small?23:29,lineHeight:small?31:39,color:'#FFF',fontWeight:'700'}}>{scene.instruction}</Text></View>}
 </Animated.View>;
}
export const storyStyles=StyleSheet.create({root:{flex:1,backgroundColor:'#060B16',overflow:'hidden'},chapter:{fontWeight:'800',letterSpacing:2},footer:{backgroundColor:'#080E1DEB',borderTopWidth:1,borderColor:'#72829B55',paddingVertical:18,paddingHorizontal:32,gap:12},row:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:14},label:{fontSize:21,lineHeight:29,color:'#D3DFEF'}});
