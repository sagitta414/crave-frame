import {MomentReveal} from './MomentReveal';
import {eveningTheme} from './theme';
import {Text} from './TVText';
import React,{useState} from 'react';
import {ScrollView,StyleSheet,View,useWindowDimensions} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {TVButton as Button} from './TVButton';
import {mealById,showById} from './catalog/catalog';
export function PhoneHandoff({night,share,syncError,onClose,onOpenPhone,onCloseLabel,expires}:any){
 const [help,setHelp]=useState(false),delivery=night.fulfillment==='delivery';
 const expiry=Number.isFinite(expires)?new Date(expires).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}):null;
 const {width,height}=useWindowDimensions(),wide=width>=850,meal=mealById(night.mealId),show=night.show||showById(night.showId),seen=night.phoneSeenAt||night.phoneOpenedAt,recent=seen&&Date.now()-seen<90000;
 return <ScrollView testID="handoff-scroll" style={{maxHeight:Math.max(240,height-80),width:'100%',maxWidth:1100}} contentContainerStyle={s.card}>
 <Text style={s.label}>{delivery?'YOUR EVENING · ON YOUR PHONE':'CHOSEN ON TV · COOKED WITH YOUR PHONE'}</Text><Text style={s.title}>{delivery?'Keep your delivery evening together.':'Take dinner to the kitchen.'}</Text>
 <View style={{flexDirection:wide?'row':'column',gap:28,alignItems:'center'}}><View style={{flex:wide?1:undefined,width:wide?undefined:'100%',gap:16}}><Text style={s.copy}>1. Open your phone camera and scan.</Text>{help&&<><Text style={s.copy}>{delivery?'2. Update the delivery estimate and confirm arrival.':'2. Follow '+meal.name+' on your phone.'}</Text><Text style={s.copy}>3. Keep the TV here for the schedule and shared progress.</Text><Text style={s.note}>{show?.name} is saved in your plan. Open your streaming app when you’re ready to watch.</Text></>}<Text style={s.copy}>{meal.name}</Text><Button onPress={()=>setHelp(!help)}>{help?'Hide help':'How it works'}</Button></View><View style={{alignItems:'center',gap:12}}><View style={{backgroundColor:'#FFF',padding:16,borderRadius:16}}><QRCode value={share} size={wide?280:Math.min(240,Math.max(160,width-128))}/></View><Text style={s.label}>{delivery?'SCAN TO OPEN YOUR EVENING':'SCAN TO COOK'}</Text></View></View>
 <MomentReveal active={!!recent&&!syncError}><Text accessibilityLiveRegion="polite" style={[s.copy,{color:recent&&!syncError?'#A5ECCF':'#D7E1F0'}]}>{syncError?'Connection interrupted. Last saved progress is retained; new changes may not have reached the other screen.':recent?(delivery?'✓ You’re connected—your evening is ready.':'✓ You’re connected—let’s cook.'):seen?'Phone idle. Reopen the companion to reconnect.':'Waiting for your phone. You can also continue from the TV.'}</Text></MomentReveal>
 {!delivery&&night.prefs.people===2&&<Text style={s.copy}>Cooking together? Scan this same code on both phones. Choose your partner number, then pick cooking or preparation as your job tonight. Both share the dinner schedule.</Text>}<Button onPress={()=>onOpenPhone(share)}>{delivery?'Open delivery companion here ↗':'Open cooking companion here ↗'}</Button><Button primary preferred onPress={onClose}>{onCloseLabel||(recent?'Leave the schedule on TV →':'Back to my evening')}</Button><Text style={s.note}>Private link · {expiry?'expires '+expiry:'expiry unavailable; reopen Send to phone to refresh'}. Anyone with it can update this evening’s progress.</Text>
 </ScrollView>;
}
const s=StyleSheet.create({card:{backgroundColor:eveningTheme.surface,padding:28,gap:20,borderWidth:2,borderColor:eveningTheme.border,borderRadius:22},label:{fontSize:20,lineHeight:28,color:'#FFCAA5',fontWeight:'800',letterSpacing:1},title:{fontSize:40,lineHeight:48,color:'#FFF',fontWeight:'900'},copy:{fontSize:25,lineHeight:35,color:'#EEF2FA'},note:{fontSize:19,lineHeight:28,color:eveningTheme.muted}});
