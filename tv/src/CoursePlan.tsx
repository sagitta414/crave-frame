import React from 'react';
import {View} from 'react-native';
import {Text} from './TVText';
export function CoursePlan({meal,people=2,adapted=false,compact=false}:any){
 if(!meal?.courses)return null;
 return <View style={{backgroundColor:'#101D30',borderColor:'#7387BD',borderWidth:1,borderRadius:16,padding:compact?14:22,gap:14,marginVertical:14}}>
  <Text style={{color:'#FFC6A6',fontSize:compact?21:28,fontWeight:'800'}}>Your three-act dinner</Text>
  <Text style={{color:'#E2E9F5',fontSize:20,lineHeight:28}}>{meal.minutes} min combined preparation · serves {people}. Eating and viewing time are separate.</Text>
  {meal.courses.map((course:any)=><View key={course.act} style={{gap:5}}>
   <Text style={{color:'#FFFFFF',fontSize:compact?20:25,fontWeight:'700'}}>Act {course.act} · {course.name}</Text>
   <Text style={{color:'#CAD7EB',fontSize:18,lineHeight:25}}>{course.minutes} min preparation · {course.serve}</Text>
   {!compact&&course.ingredients.map(([name,amount,unit]:any)=><Text key={name+unit} style={{color:'#CAD7EB',fontSize:18,lineHeight:25}}>{(adapted&&name===meal.swap.from?meal.swap.amount:amount)*people/2} {adapted&&name===meal.swap.from?meal.swap.unit:unit} · {adapted&&name===meal.swap.from?meal.swap.to:name}</Text>)}
  </View>)}
  {!compact&&<Text style={{color:'#AEBBD2',fontSize:18,lineHeight:25}}>Prepare and refrigerate the starter and dessert first, then cook the main. The cooking steps include all three. Serve dessert manually at the credits; no playback detection is required.</Text>}
 </View>;
}
