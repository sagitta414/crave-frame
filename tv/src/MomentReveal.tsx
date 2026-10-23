import React,{useContext,useEffect,useRef} from 'react';
import {Animated,Platform} from 'react-native';
import {MotionContext} from './Motion';
/** One short entrance, no loop, no layout movement or focus changes. */
export function MomentReveal({active=true,children}:any){
 const reduced=useContext(MotionContext),value=useRef(new Animated.Value(1)).current;
 useEffect(()=>{value.stopAnimation();if(!active||reduced){value.setValue(1);return;}value.setValue(0);const motion=Animated.timing(value,{toValue:1,duration:320,useNativeDriver:Platform?.OS==='android'||Platform?.OS==='ios'});motion.start();return()=>motion.stop();},[active,reduced,value]);
 return <Animated.View style={{opacity:value,transform:[{scale:value.interpolate({inputRange:[0,1],outputRange:[.98,1]})}]}}>{children}</Animated.View>;
}
