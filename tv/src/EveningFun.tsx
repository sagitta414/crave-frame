import {Text} from './TVText';
import React,{useState} from 'react';
import {View} from 'react-native';
import {TVButton as Button} from './TVButton';
export function EveningFun({show}:any){const [open,setOpen]=useState(false);return <View style={{paddingVertical:16,gap:14}}><Button quiet onPress={()=>setOpen(!open)}>{open?'Close conversation break':'Optional conversation break'}</Button>{open&&<Text style={{fontSize:26,lineHeight:38,color:'#E5EDF8'}}>Before {show.name}: what made you choose it tonight, and what would make this a great evening for everyone?</Text>}</View>;}
