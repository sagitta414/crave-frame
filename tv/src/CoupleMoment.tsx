import React,{useState} from 'react';
import {View} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {nightRitual} from './catalog/our-night';
export function CoupleMoment({night}:any){const [open,setOpen]=useState(false);if(!night.ourNight)return null;const r=nightRitual(night.ourNight.vibe);return <View style={{padding:24,borderRadius:22,backgroundColor:'#2B202B',borderWidth:1,borderColor:'#785565',gap:12}}><Text style={{fontSize:26,color:'#FFE2CB',fontWeight:'700'}}>A moment for us</Text><Text style={{fontSize:22,lineHeight:32,color:'#E8D8DF'}}>{r.before}</Text><Button quiet selected={open} onPress={()=>setOpen(!open)}>{open?'Put the question away':'A conversation starter · optional'}</Button>{open&&<Text style={{fontSize:26,lineHeight:36,color:'#FFE2CB'}}>{r.question}</Text>}<Text style={{fontSize:18,lineHeight:27,color:'#CCBAC8'}}>Skip this whenever you like. {r.after}</Text></View>;}
