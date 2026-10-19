import {Text} from './TVText';
import React,{useState} from 'react';
import {View} from 'react-native';
import {TVButton as Button} from './TVButton';
const prompts:any={Romantic:'If tonight could take you anywhere, where would you go together?',Adventure:'Each predict one thing that might happen. Compare guesses after the credits.',Lighthearted:'Give your dinner and movie a ridiculous double-feature name.',Thoughtful:'What question would you want to ask the main character?',Cozy:'What is one small thing that made today better?'};
export function EveningFun({show}:any){const [open,setOpen]=useState(false);return <View style={{paddingVertical:16,gap:14}}><Button quiet onPress={()=>setOpen(!open)}>{open?'Close conversation break':'Optional conversation break'}</Button>{open&&<Text style={{fontSize:26,lineHeight:38,color:'#E5EDF8'}}>Before {show.name}: {show.family?"If you could invite one character to dinner, what would you ask them?":prompts[show.mood]||prompts.Cozy}</Text>}</View>;}
