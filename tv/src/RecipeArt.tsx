import {reviewedDishImages} from './catalog/reviewed-dish-images';
import {Text as NativeText} from 'react-native';
import {Text} from './TVText';
import {mealPhotos} from './mealPhotos';
import {generatedMealPhotos} from './generatedMealPhotos';
import React,{useState} from 'react';
import {Image,View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
/** A text-free illustration when no photo exists. The meal name belongs outside the artwork. */
export function RecipeArt({meal,style,adapted=false,resizeMode="cover"}:any){const photo=mealPhotos[meal?.mainMealId||meal?.id], [failed,setFailed]=useState<any>(null);
 if(photo&&failed!==photo)return <View accessibilityLabel={`${meal?.name || 'Dish'}${adapted?', original recipe shown; substitutions are not pictured':''}${(reviewedDishImages.has(meal?.mainMealId||meal?.id)||generatedMealPhotos[meal?.mainMealId||meal?.id]||(meal?.mainMealId||meal?.id)==='grilled-cheese-soup') ? ', AI-generated illustration' : ', illustrative photo'}`} style={[{overflow:'hidden'},style]}><Image source={photo} resizeMode={resizeMode} onError={()=>setFailed(photo)} style={{width:'100%',flex:1,minHeight:0}}/>{<View style={{flexShrink:0,backgroundColor:'#0B201B',paddingVertical:4,paddingHorizontal:8,alignItems:'center'}}><Text style={{color:'#E8EDF5',fontSize:20,lineHeight:28}}>{adapted?((reviewedDishImages.has(meal?.mainMealId||meal?.id)||generatedMealPhotos[meal?.mainMealId||meal?.id])?'AI illustration · substitutions not pictured':'Illustrative photo · substitutions not pictured'):meal?.twoAppetites?'Illustration · one version':meal?.courses?'Main course illustration':(reviewedDishImages.has(meal?.mainMealId||meal?.id)||generatedMealPhotos[meal?.mainMealId||meal?.id]||(meal?.mainMealId||meal?.id)==='grilled-cheese-soup')?'AI illustration · original recipe':'Illustrative photo · original recipe'}</Text></View>}</View>;
 return <View accessibilityLabel={(meal?.name||'Dinner')+' · photo not available'} style={[{backgroundColor:'#162132',overflow:'hidden'},style]}><LinearGradient colors={['#283D50','#101B2A']} style={{width:'100%',height:'100%',alignItems:'center',justifyContent:'center',gap:6,padding:8}}><View style={{width:48,height:48,borderRadius:24,borderWidth:2,borderColor:'#D8B895',alignItems:'center',justifyContent:'center'}}><Ionicons name="restaurant-outline" size={26} color="#FFD5BD"/></View><Text style={{color:'#D4DFEA',fontSize:22,lineHeight:30,textAlign:'center'}}>Photo unavailable</Text></LinearGradient></View>;
}
export function recipeImage(meal:any){return mealPhotos[meal?.mainMealId||meal?.id]||require('../assets/brand/crave-frame-together-mark-v6.png');}

