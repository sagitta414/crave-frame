import React from 'react';
import {StyleSheet,View,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {BrandMark} from './Brand';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';

const destinations=[
 {id:'home',label:'Tonight',icon:'sparkles-outline',activeIcon:'sparkles'},
 {id:'search',label:'Search',icon:'search-outline',activeIcon:'search'},
 {id:'saved',label:'My evenings',icon:'albums-outline',activeIcon:'albums'},
 {id:'kitchen',label:'Kitchen',icon:'options-outline',activeIcon:'options'},
] as const;

export function CinemaNavigation({active,onNavigate,phone=false}:any){
 const {width}=useWindowDimensions(),compact=width<1200,small=width<600,selected=destinations.some(d=>d.id===active)?active:'home';
 return <View testID="remote-row-navigation" style={[s.shell,{paddingHorizontal:small?16:compact?20:40,paddingVertical:small?8:12}]}>
  <LinearGradient pointerEvents="none" colors={['#142B2B','#091616']} style={StyleSheet.absoluteFill}/>
  <View style={[s.layout,compact&&{flexDirection:'column',alignItems:'stretch',gap:8}]}>
   <View style={s.brand}>
    <View style={s.mark}><BrandMark prominent size={small?40:52}/></View>
    <View style={{flexShrink:1,minWidth:0,gap:3}}><View style={{flexDirection:'row',alignItems:'baseline'}}><Text style={[s.wordmark,{fontSize:small?24:28}]}>Crave</Text><Text style={[s.wordmark,{fontSize:small?24:28,color:'#FFD3AF'}]}> Frame</Text></View>{width>=1600&&<Text numberOfLines={1} style={{fontSize:18,lineHeight:compact?23:28,color:'#CADBD5',maxWidth:520}}>Make a little time for each other.</Text>}</View>
   </View>
   {phone?<Text style={s.phone}>COOKING COMPANION</Text>:<View style={s.capsule}>
    <View style={[s.tabs,{flexDirection:'row',flexWrap:'nowrap'}]}>
     {destinations.map(item=>{const current=selected===item.id;return <Button navigation compact style={compact?{flex:1,minWidth:0}:undefined} selected={current} key={item.id} focusKey={'navigation-'+item.id} accessibilityLabel={item.label} onPress={()=>onNavigate(item.id)}>
      <View style={[s.tabContent,width<900&&{flexDirection:'column',gap:0}]}><Ionicons accessible={false} name={current?item.activeIcon:item.icon} size={width<900?18:23} color={current?'#102422':'#BCD7D1'}/><Text style={[s.tabText,{fontSize:width<600?16:width<900?24:28,lineHeight:width<600?24:width<900?32:38,color:current?'#102422':'#E3EEE9'}]}>{compact&&item.id==='saved'?'Evenings':item.label}</Text></View>
     </Button>;})}
    </View>
   </View>}
  </View>
  <LinearGradient pointerEvents="none" colors={['#79CEBD00','#79CEBD66','#FFD0AC66','#FFD0AC00']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.edge}/>
 </View>;
}
const s=StyleSheet.create({shell:{paddingVertical:14,backgroundColor:'#091616',zIndex:20},layout:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:28},brand:{flexDirection:'row',gap:14,alignItems:'center',flexShrink:1,minWidth:0},mark:{borderRadius:18,shadowColor:'#72C9BA',shadowOpacity:.3,shadowRadius:18,shadowOffset:{width:0,height:0}},wordmark:{fontWeight:'800',letterSpacing:-.7,color:'#F6F5F1'},capsule:{flexShrink:1,borderRadius:23,borderWidth:1,borderColor:'#578D8055',backgroundColor:'#081714DD',shadowColor:'#000',shadowOpacity:.25,shadowRadius:12,shadowOffset:{width:0,height:4}},tabs:{gap:5,padding:3,alignItems:'center'},tabContent:{flexDirection:'row',alignItems:'center',gap:11},tabText:{lineHeight:36,fontWeight:'700'},phone:{color:'#CADBD5',fontSize:16,fontWeight:'700'},edge:{position:'absolute',bottom:0,left:0,right:0,height:1}});
