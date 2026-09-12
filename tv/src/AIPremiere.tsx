import React from 'react';
import {View,Text} from 'react-native';
import {TVButton as Button} from './TVButton';
export function AIPremiere({picks,onComplete}:any){return <View style={{padding:40,gap:24}}><Text style={{color:'#fff',fontSize:36}}>{picks.length} dinner choices ready</Text><Button primary preferred onPress={onComplete}>See my choices</Button></View>;}
