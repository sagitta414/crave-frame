import React from 'react';
import {ScrollView,StyleSheet,View,useWindowDimensions} from 'react-native';
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
 const {width}=useWindowDimensions(),compact=width<1000,selected=destinations.some(d=>d.id===active)?active:'home';
 return <View testID="remote-row-navigation" style={[s.shell,{paddingHorizontal:compact?20:40}]}>
  <LinearGradient pointerEvents="none" colors={['#172234','#0A101C']} style={StyleSheet.absoluteFill}/>
  <View style={[s.layout,compact&&{flexDirection:'column',alignItems:'stretch',gap:8}]}>
   <View style={s.brand}>
    <View style={s.mark}><BrandMark prominent size={compact?48:60}/></View>
    <View style={{flexDirection:'row',alignItems:'baseline'}}><Text style={[s.wordmark,{fontSize:compact?28:34}]}>crave</Text><Text style={[s.wordmark,{fontSize:compact?28:34,color:'#FFD3AF'}]}> frame</Text></View>
   </View>
   {phone?<Text style={s.phone}>YOUR EVENING · ON YOUR PHONE</Text>:<View style={s.capsule}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
     {destinations.map(item=>{const current=selected===item.id;return <Button navigation compact selected={current} key={item.id} focusKey={'navigation-'+item.id} accessibilityLabel={item.label} onPress={()=>onNavigate(item.id)}>
      <View style={s.tabContent}><Ionicons accessible={false} name={current?item.activeIcon:item.icon} size={compact?22:25} color={current?'#162135':'#C7D8EE'}/><Text style={[s.tabText,{fontSize:compact?21:26,color:current?'#162135':'#E3ECF8'}]}>{item.label}</Text></View>
     </Button>;})}
    </ScrollView>
   </View>}
  </View>
  <LinearGradient pointerEvents="none" colors={['#A8CAFF00','#A8CAFF66','#FFD0AC66','#FFD0AC00']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.edge}/>
 </View>;
}
const s=StyleSheet.create({shell:{paddingVertical:14,backgroundColor:'#0B111D',zIndex:20},layout:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:28},brand:{flexDirection:'row',gap:14,alignItems:'center',flexShrink:0},mark:{borderRadius:18,shadowColor:'#9DBFFF',shadowOpacity:.3,shadowRadius:18,shadowOffset:{width:0,height:0}},wordmark:{fontWeight:'800',letterSpacing:-.7,color:'#F6F5F1'},capsule:{flexShrink:1,borderRadius:23,borderWidth:1,borderColor:'#637B9C55',backgroundColor:'#080E1BDD',shadowColor:'#000',shadowOpacity:.25,shadowRadius:12,shadowOffset:{width:0,height:4}},tabs:{gap:5,padding:7,alignItems:'center'},tabContent:{flexDirection:'row',alignItems:'center',gap:11},tabText:{lineHeight:36,fontWeight:'700'},phone:{color:'#C5D9F2',fontSize:24,fontWeight:'700'},edge:{position:'absolute',bottom:0,left:0,right:0,height:1}});
