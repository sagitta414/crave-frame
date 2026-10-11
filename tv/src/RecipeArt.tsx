import {Text} from './TVText';
import {mealPhotos} from './mealPhotos';
import {generatedMealPhotos} from './generatedMealPhotos';
import React,{useState} from 'react';
import {Image,View,Text as Caption} from 'react-native';
/** A text-free illustration when no photo exists. The meal name belongs outside the artwork. */
export function RecipeArt({meal,style,resizeMode="cover"}:any){const photo=mealPhotos[meal?.mainMealId||meal?.id], [failed,setFailed]=useState<any>(null);
 if(photo&&failed!==photo)return <View accessibilityLabel={`${meal?.name || 'Dish'}${(generatedMealPhotos[meal?.id]||meal?.id==='grilled-cheese-soup') ? ', AI-generated illustration' : ''}`} style={[{overflow:'hidden'},style]}><Image source={photo} resizeMode={resizeMode} onError={()=>setFailed(photo)} style={{width:'100%',height:'100%'}}/>{(meal?.twoAppetites||meal?.courses||(generatedMealPhotos[meal?.id]||meal?.id==='grilled-cheese-soup')) && <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#101B2DEE',paddingVertical:4,paddingHorizontal:8,alignItems:'center'}}><Caption style={{color:'#E8EDF5',fontSize:18,lineHeight:24}}>{meal?.twoAppetites?'AI illustration · one version':meal?.courses?'Main course illustration':'AI illustration'}</Caption></View>}</View>;
 return <View accessibilityLabel={meal?.proteinBase?'Protein variation recipe card':'Recipe card'} style={[{backgroundColor:'#162132',padding:18,justifyContent:'center'},style]}><Text style={{color:'#91A8FF',fontSize:16,fontWeight:'800',letterSpacing:2,marginBottom:8}}>{meal?.proteinBase?'PROTEIN VARIATION':'RECIPE CARD'}</Text><Text style={{color:'#FFD5BD',fontSize:22,lineHeight:29,fontWeight:'700'}}>{meal?.name||'Your dinner'}</Text><Text style={{color:'#BCCBDE',fontSize:18,lineHeight:25,marginTop:10}}>{meal?.protein?meal.protein+' · '+meal.minutes+' min':meal?.category||'Your dinner'} · Photo not provided</Text></View>;
}
export function recipeImage(meal:any){return mealPhotos[meal?.id]||require('../assets/brand/crave-frame-3d-v5.png');}

