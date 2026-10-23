import React from 'react';
import {Image,View} from 'react-native';

const mark=require('../assets/brand/crave-frame-together-mark-v6.png');

export function BrandMark({size=56,prominent=false}:{size?:number;prominent?:boolean}){
 return <View style={{width:size,height:size,overflow:'hidden',borderRadius:size*.2,borderWidth:0,backgroundColor:'#05070B',alignItems:'center',justifyContent:'center'}}><Image accessible={false} source={mark} resizeMode="contain" style={{width:size,height:size,borderRadius:size*.2,transform:[{scale:1.14}]}}/></View>;
}
