import React from 'react';
import {Image} from 'react-native';

const mark=require('../assets/brand/crave-frame-3d-v5.png');

export function BrandMark({size=56}:{size?:number}){
 return <Image accessible={false} source={mark} resizeMode="contain" style={{width:size,height:size,borderRadius:size*.2}}/>;
}
