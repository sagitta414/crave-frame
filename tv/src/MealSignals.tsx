import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {cookingProfile} from './catalog/cooking-profile';
export function MealSignals({meal,label,compact=false}:any){const profile=cookingProfile(meal);return <View style={s.wrap}>{!!label&&<Text style={[s.badge,s.purpose]}>{label}</Text>}{profile.badges.slice(0,compact?1:2).map((b:string)=><Text key={b} style={s.badge}>{b}</Text>)}</View>;}
const s=StyleSheet.create({wrap:{flexDirection:'row',flexWrap:'wrap',gap:7,marginVertical:10},badge:{fontSize:13,lineHeight:19,color:'#bdcbe0',borderWidth:1,borderColor:'#a9bad32a',paddingHorizontal:10,paddingVertical:5,borderRadius:20,backgroundColor:'#172237'},purpose:{color:'#ffd2bb',borderColor:'#e4a58055',backgroundColor:'#50342755'}});
