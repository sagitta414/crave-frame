import React from 'react';
import {Text as NativeText,TextProps,StyleSheet,useWindowDimensions} from 'react-native';
export function Text({style,...props}:TextProps){
 const {width}=useWindowDimensions(),flat=StyleSheet.flatten(style)||{};
 const size=typeof flat.fontSize==='number'?flat.fontSize:undefined;
 const adjustment=width>=900&&size!==undefined&&size<24?{fontSize:24,lineHeight:Math.max(32,typeof flat.lineHeight==='number'?flat.lineHeight:0)}:undefined;
 return <NativeText {...props} style={[style,adjustment]}/>;
}
