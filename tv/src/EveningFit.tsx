import React from 'react';
import {View} from 'react-native';
import {Text} from './TVText';
import {eveningFit} from './catalog/evening-guidance';
export function EveningFit({meal,show,prefs}:any){return <View style={{gap:6,marginVertical:8}}><Text style={{color:'#A9DDCB',fontSize:18,fontWeight:'700'}}>WHY THIS FITS TONIGHT</Text><Text style={{color:'#E8EEF7',fontSize:22,lineHeight:32}}>{eveningFit(meal,show,prefs)}</Text></View>;}
