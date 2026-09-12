import React from 'react';
import {Image,View} from 'react-native';

const mark=require('../assets/brand/crave-frame-3d-v5.png');

export function BrandMark({size=56,prominent=false}:{size?:number;prominent?:boolean}){
 return <View style={{width:size,height:size,overflow:'hidden',borderRadius:size*.2,borderWidth:prominent?2:0,borderColor:'#728CB7',backgroundColor:'#05070B',alignItems:'center',justifyContent:'center'}}><Image accessible={false} source={mark} resizeMode="contain" style={{width:size,height:size,borderRadius:size*.2,transform:[{scale:prominent?1.28:1}]}}/></View>;
}
