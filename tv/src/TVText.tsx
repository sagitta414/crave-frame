import React from 'react';
import {isSilk} from './SilkPage';
import {Text as NativeText,TextProps,StyleSheet,useWindowDimensions,Platform} from 'react-native';
export function Text({style,...props}:TextProps){
 const {width}=useWindowDimensions(),flat=StyleSheet.flatten(style)||{};
 const size=typeof flat.fontSize==='number'?flat.fontSize:undefined;
 const minimum=Platform.OS==='web'&&isSilk(navigator.userAgent)?28:24;
 const adjustment=width>=900&&size!==undefined&&size<minimum?{fontSize:minimum,lineHeight:Math.max(Math.ceil(minimum*1.35),typeof flat.lineHeight==='number'?flat.lineHeight:0)}:undefined;
 return <NativeText {...props} style={[style,adjustment]}/>;
}
