import {Text} from './TVText';
import {mealPhotos} from './mealPhotos';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {Image,View,StyleSheet} from 'react-native';
import {BrandMark} from './Brand';
const photos=mealPhotos;
export function RecipeArt({meal,style}:any){const photo=photos[meal?.id],height=StyleSheet.flatten(style)?.height,compact=typeof height==='number'&&height<140;if(photo)return <Image source={photo} style={style}/>;return <View style={[{backgroundColor:'#1a2946',overflow:'hidden',justifyContent:'center'},style]}><LinearGradient colors={['#243957','#101b31']} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill}/><View style={{position:'absolute',width:150,height:150,borderRadius:75,borderWidth:1,borderColor:'#ffa47e33',right:-35,top:-35}}/><View style={{position:'absolute',width:115,height:115,borderRadius:58,borderWidth:1,borderColor:'#ffa47e33',right:-18,top:-18}}/><View style={{padding:compact?8:20}}><Text numberOfLines={1} style={{color:'#ffbd9e',fontSize:compact?10:12,fontWeight:'800',letterSpacing:1.2}}>{compact?'RECIPE':(meal?.category||'YOUR DINNER').toUpperCase()}</Text><Text numberOfLines={compact?2:3} style={{color:'#fff',fontSize:compact?12:23,fontWeight:'700',lineHeight:compact?16:29,marginTop:compact?4:12}}>{meal?.name}</Text>{!compact&&<><Text numberOfLines={2} style={{color:'#bdcce3',fontSize:15,lineHeight:22,marginTop:10}}>{meal?.ingredients?.slice(0,3).map((i:any)=>i[0]).join(' · ')}</Text><Text style={{color:'#ffbd9e',fontSize:13,marginTop:12}}>{meal?.minutes} minutes · Recipe card</Text></>}</View></View>;}

export function recipeImage(meal:any){return photos[meal?.id]||require('../assets/brand/crave-frame-3d-v5.png');}
