import React from 'react';
import {View,Image,StyleSheet,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
export const homeFeatures=[
 {id:'energy',title:'Too tired to cook much?',detail:'Choose dinners that fit your energy.',action:'Find your pace →',accent:'#FFCAA7',image:require('../assets/story/arrival-v1.jpg')},
 {id:'plates',title:'One movie. Two appetites.',detail:'A shared base. Your own protein.',action:'Explore dinner options →',accent:'#B7E8D2',image:require('../assets/story/dinner-v1.jpg')},
 {id:'together',title:'Find a night you agree on.',detail:'Your phones. Private votes. A shared reveal.',action:'Invite your table →',accent:'#A2D9C7',image:require('../assets/story/together-v1.jpg')},
 {id:'bites',title:'Made for settling in.',detail:'Find handheld and softer bites.',action:'Choose your eating style →',accent:'#C6E5D7',image:require('../assets/story/dinner-v1.jpg')},
 {id:'touch',title:'Make it a little special.',detail:'One small touch. A better night in.',action:'Personalize this evening →',accent:'#FFD6A9',image:require('../assets/story/together-v1.jpg')}
];
export function HomeFeatureCard({feature,onPress,style}:any){const {width}=useWindowDimensions();return <Button card focusKey={'feature-'+feature.id} accessibilityLabel={feature.title+' '+feature.detail+' '+feature.action} onPress={onPress} style={[{width:width<900?Math.min(320,width-56):360},style]}><View style={s.card}><Image accessible={false} source={feature.image} resizeMode="cover" style={[StyleSheet.absoluteFill,{width:'100%',height:'100%'}]}/><LinearGradient colors={['#09161433','#091614EB','#091614']} locations={[0,.48,1]} style={StyleSheet.absoluteFill}/><View style={[s.accent,{backgroundColor:feature.accent}]}/><View style={s.copy}><Text style={s.title}>{feature.title}</Text><Text style={s.body}>{feature.detail}</Text><Text style={[s.action,{color:feature.accent}]}>{feature.action}</Text></View></View></Button>;}
const s=StyleSheet.create({card:{height:280,overflow:'hidden',borderRadius:14,justifyContent:'flex-end'},accent:{position:'absolute',top:22,left:24,height:4,width:42,borderRadius:4},copy:{padding:24,gap:10},title:{fontSize:29,lineHeight:36,fontWeight:'800',color:'#FFF7EF'},body:{fontSize:21,lineHeight:29,color:'#CDDCD3'},action:{fontSize:19,lineHeight:27,fontWeight:'700',marginTop:4}});
