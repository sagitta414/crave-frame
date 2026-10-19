import React from 'react';
import {Image,StyleSheet,View,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Text} from './TVText';
import {RecipeArt} from './RecipeArt';
import {projectEvening} from './schedule';
import {eveningPalette} from './cinema-model';
export function EveningDashboard({night,meal,show,watchArt}:any){
 const {width}=useWindowDimensions(),wide=width>=1000,accent=eveningPalette(show),schedule=projectEvening(night,meal,show).schedule;
 return <View style={{marginTop:24,marginBottom:24,borderRadius:24,overflow:'hidden',backgroundColor:'#101A29'}}>
  <Image source={watchArt(show,true)} style={[StyleSheet.absoluteFill,{width:'100%',height:'100%'}]}/><LinearGradient colors={['#080D18F5','#080D18E0','#080D1890']} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill}/>
  <View style={{padding:width<900?24:36,flexDirection:wide?'row':'column',gap:32,alignItems:wide?'center':'stretch'}}>
   <View style={{flex:1,gap:12}}><Text style={{fontSize:22,color:accent,fontWeight:'700',letterSpacing:2}}>YOUR NIGHT, ALL TOGETHER</Text><Text style={{fontSize:width<900?36:48,lineHeight:width<900?44:58,color:'#FFF8F0',fontWeight:'800'}}>{show.name}</Text><Text style={{fontSize:28,lineHeight:38,color:'#FFE0C9'}}>{meal.name}</Text><Text style={{fontSize:23,lineHeight:32,color:'#CCD8E6'}}>{night.prefs.people} people · {night.fulfillment==='delivery'?'Takeout evening':(night.prefs.cookLevel||'Regular')+' cooking guidance'}</Text>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:32,marginTop:14}}>{schedule.slice(2,4).map((item:any)=><View key={item.label} style={{borderLeftWidth:3,borderLeftColor:accent,paddingLeft:18}}><Text style={{fontSize:21,color:'#C5D2E3'}}>{item.label}</Text><Text style={{fontSize:38,lineHeight:48,color:'#FFF',fontWeight:'800',fontVariant:['tabular-nums']}}>{new Date(item.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</Text></View>)}</View>
   </View>
   <RecipeArt meal={meal} resizeMode="contain" style={{width:wide?'32%':'100%',aspectRatio:1.5,borderRadius:18,backgroundColor:'#101827'}}/>
  </View>
 </View>;
}
