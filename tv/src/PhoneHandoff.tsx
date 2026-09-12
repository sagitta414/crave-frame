import {Text} from './TVText';
import React from 'react';
import {ScrollView,StyleSheet,View,useWindowDimensions} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {TVButton as Button} from './TVButton';
import {mealById,showById} from './catalog/catalog';
export function PhoneHandoff({night,share,syncError,onClose}:any){
 const {width,height}=useWindowDimensions(),wide=width>=850,meal=mealById(night.mealId),show=night.show||showById(night.showId),seen=night.phoneSeenAt||night.phoneOpenedAt,recent=seen&&Date.now()-seen<90000;
 return <ScrollView testID="handoff-scroll" style={{maxHeight:Math.max(240,height-80),width:'100%',maxWidth:1100}} contentContainerStyle={s.card}>
 <Text style={s.label}>CHOSEN ON TV · COOKED WITH YOUR PHONE</Text><Text style={s.title}>Take dinner to the kitchen.</Text>
 <View style={{flexDirection:wide?'row':'column',gap:28,alignItems:'center'}}><View style={{flex:wide?1:undefined,width:wide?undefined:'100%',gap:16}}><Text style={s.copy}>1. Open your phone camera and scan.</Text><Text style={s.copy}>2. Follow {meal.name} on your phone.</Text><Text style={s.copy}>3. Keep the TV here for the schedule and shared progress.</Text><Text style={s.note}>{show?.name} is saved in your plan. Open your streaming app when you’re ready to watch.</Text></View><View style={{alignItems:'center',gap:12}}><View style={{backgroundColor:'#FFF',padding:16,borderRadius:16}}><QRCode value={share} size={wide?224:190}/></View><Text style={s.label}>SCAN TO COOK</Text></View></View>
 <Text accessibilityLiveRegion="polite" style={[s.copy,{color:recent&&!syncError?'#A5ECCF':'#D7E1F0'}]}>{syncError?'Connection interrupted. Your saved progress is safe.':recent?'Phone connected. Your cooking progress is shared with the TV.':seen?'Phone idle. Reopen the recipe to reconnect.':'Waiting for your phone. You can also cook from the TV.'}</Text>
 <Button primary preferred onPress={onClose}>{recent?'Leave the schedule on TV →':'Back to my evening'}</Button><Text style={s.note}>Private link · expires in 4 hours. Anyone with it can update this evening’s cooking progress.</Text>
 </ScrollView>;
}
const s=StyleSheet.create({card:{backgroundColor:'#0C121D',padding:28,gap:20,borderWidth:2,borderColor:'#526792',borderRadius:22},label:{fontSize:20,lineHeight:28,color:'#FFCAA5',fontWeight:'800',letterSpacing:1},title:{fontSize:40,lineHeight:48,color:'#FFF',fontWeight:'900'},copy:{fontSize:25,lineHeight:35,color:'#EEF2FA'},note:{fontSize:19,lineHeight:28,color:'#BBC8DB'}});
