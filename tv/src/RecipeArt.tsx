import {Text} from './TVText';
import {mealPhotos} from './mealPhotos';
import {generatedMealPhotos} from './generatedMealPhotos';
import React,{useState} from 'react';
import {Image,View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
/** A text-free illustration when no photo exists. The meal name belongs outside the artwork. */
export function RecipeArt({meal,style,resizeMode="cover"}:any){const photo=mealPhotos[meal?.mainMealId||meal?.id], [failed,setFailed]=useState<any>(null);
 if(photo&&failed!==photo)return <View accessibilityLabel={`${meal?.name || 'Dish'}${(generatedMealPhotos[meal?.mainMealId||meal?.id]||(meal?.mainMealId||meal?.id)==='grilled-cheese-soup') ? ', AI-generated illustration' : ', illustrative photo'}`} style={[{overflow:'hidden'},style]}><Image source={photo} resizeMode={resizeMode} onError={()=>setFailed(photo)} style={{width:'100%',height:'100%'}}/>{<View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#101B2DEE',paddingVertical:4,paddingHorizontal:8,alignItems:'center'}}><Text style={{color:'#E8EDF5',fontSize:18,lineHeight:24}}>{meal?.twoAppetites?'Illustration · one version':meal?.courses?'Main course illustration':(generatedMealPhotos[meal?.mainMealId||meal?.id]||(meal?.mainMealId||meal?.id)==='grilled-cheese-soup')?'AI illustration':'Illustrative photo'}</Text></View>}</View>;
 return <View accessibilityLabel={(meal?.name||'Dinner')+' · photo not available'} style={[{backgroundColor:'#162132',overflow:'hidden'},style]}><LinearGradient colors={['#283D50','#101B2A']} style={{width:'100%',height:'100%',alignItems:'center',justifyContent:'center',gap:6,padding:8}}><View style={{width:48,height:48,borderRadius:24,borderWidth:2,borderColor:'#D8B895',alignItems:'center',justifyContent:'center'}}><Ionicons name="restaurant-outline" size={26} color="#FFD5BD"/></View><Text style={{color:'#D4DFEA',fontSize:22,lineHeight:30,textAlign:'center'}}>Photo unavailable</Text></LinearGradient></View>;
}
export function recipeImage(meal:any){return mealPhotos[meal?.id]||require('../assets/brand/crave-frame-3d-v5.png');}

