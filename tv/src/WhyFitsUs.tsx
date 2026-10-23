import React from 'react';
import {View} from 'react-native';
import {Text} from './TVText';
import {fitReasons} from './evening-personalization';
export function WhyFitsUs({pair,prefs,memory}:any){const reasons=fitReasons(pair,prefs,memory);if(!reasons.length)return null;return <View style={{gap:5}}><Text style={{fontSize:18,color:'#FFD1A8',fontWeight:'700'}}>WHY THIS FITS US</Text><Text style={{fontSize:20,lineHeight:29,color:'#CADBD5'}}>{reasons.join(' · ')}</Text></View>;}
