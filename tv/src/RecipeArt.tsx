import {Text} from './TVText';
import {mealPhotos} from './mealPhotos';
import React,{useState} from 'react';
import {Image,View} from 'react-native';
/** A text-free illustration when no photo exists. The meal name belongs outside the artwork. */
export function RecipeArt({meal,style}:any){const photo=mealPhotos[meal?.id], [failed,setFailed]=useState<any>(null);
 if(photo&&failed!==photo)return <Image source={photo} resizeMode="cover" onError={()=>setFailed(photo)} style={style}/>;
 return <View accessibilityLabel="Dinner illustration; photo unavailable" style={[{backgroundColor:'#182638',overflow:'hidden',alignItems:'center',justifyContent:'center'},style]}><View style={{width:'64%',aspectRatio:1,borderRadius:999,backgroundColor:'#F1E8DD',borderWidth:8,borderColor:'#C7B9A7',alignItems:'center',justifyContent:'center'}}><View style={{width:'75%',height:'75%',borderRadius:999,borderWidth:2,borderColor:'#DDD0BE',alignItems:'center',justifyContent:'center'}}><View style={{width:'66%',height:'28%',borderRadius:99,backgroundColor:'#BF7A49',transform:[{rotate:'-25deg'}]}}/><View style={{width:'48%',height:'21%',marginTop:3,borderRadius:99,backgroundColor:'#75916A',transform:[{rotate:'15deg'}]}}/></View></View><View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#101B2DEE',paddingVertical:6,alignItems:'center'}}><Text style={{color:'#E8EDF5',fontSize:24,lineHeight:32}}>Illustration</Text></View></View>;
}
export function recipeImage(meal:any){return mealPhotos[meal?.id]||require('../assets/brand/crave-frame-3d-v5.png');}
