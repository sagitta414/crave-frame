import React from 'react';
import {View,useWindowDimensions} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {tonightShortcuts} from './catalog/tonight-decision';
export function TonightShortcuts({prefs,onChoose,busy}:any){const {width}=useWindowDimensions();return <View testID="remote-row-tonight-shortcuts" style={{paddingHorizontal:width>=900?52:24,paddingVertical:22,gap:14,backgroundColor:'#0D1522'}}>
 <View style={{flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap',gap:8}}><Text style={{fontSize:25,fontWeight:'800',color:'#FFF3E6'}}>What works for tonight?</Text><Text style={{fontSize:19,color:'#B8C9D8'}}>{prefs.people} people · your food preferences stay in place</Text></View>
 <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{tonightShortcuts.map(item=><Button key={item.id} compact quiet focusKey={'tonight-'+item.id} disabled={busy} onPress={()=>onChoose(item.id)} style={{flexGrow:1,flexBasis:width<700?'44%':'22%',borderRadius:16,backgroundColor:'#192639',borderWidth:1,borderColor:'#38495F'}}><View style={{gap:5,paddingVertical:8}}><Text style={{fontSize:23,fontWeight:'700',color:'#FFE0C6'}}>{item.symbol} {item.label}</Text><Text style={{fontSize:18,color:'#BDCBDB'}}>{item.detail}</Text></View></Button>)}</View>
 </View>;}
