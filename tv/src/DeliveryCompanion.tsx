import {TonightsEdition} from './TonightsEdition';
import {eveningTheme} from './theme';
import React,{useRef,useState} from 'react';
import {ScrollView,TextInput,View} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {mealById,showById} from './catalog/catalog';
import {projectEvening} from './schedule';

export function DeliveryCompanion({night,phone,onPhone,onBack,onUpdate,onSaveEdition,onLoadEdition,busy,syncError}:any){
 const show=night.show||showById(night.showId),schedule=projectEvening(night,mealById(night.mealId),show).schedule;
 const [eta,setEta]=useState(''),[editing,setEditing]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState(''),lock=useRef(false);
 const canEdit=night.status==='planned'&&!night.watchStarted,minutes=Number(eta),valid=/^\d+$/.test(eta)&&Number.isInteger(minutes)&&minutes>=1&&minutes<=120;
 async function save(){if(lock.current||busy||!valid)return;lock.current=true;setSaving(true);setMessage('');try{const updated=await onUpdate({deliveryEtaMinutes:minutes});if(!updated){setMessage('Timing was not saved. Please try again.');return;}setEditing(false);setEta('');setMessage('Delivery timing updated. Dinner and viewing now use your new estimate.');}catch(e){setMessage(e.message||'Could not save timing. Try again.');}finally{lock.current=false;setSaving(false);}}
 async function advance(data:any){if(lock.current||busy)return;lock.current=true;setSaving(true);setMessage('');try{const updated=await onUpdate(data);if(!updated)setMessage('Could not save. Please try again.');}catch(e){setMessage(e.message||'Could not save. Please try again.');}finally{lock.current=false;setSaving(false);}}
 const clock=(at:number)=>new Date(at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
 const provider=night.orderPlan?.provider==='ubereats'?'Uber Eats':'DoorDash';
 return <ScrollView testID="main-scroll" contentContainerStyle={{padding:28,paddingBottom:90,gap:22,maxWidth:1000,width:'100%',alignSelf:'center'}}>
 <Text style={{fontSize:18,color:'#FFCA9F',fontWeight:'800'}}>YOUR ORDER-OUT EVENING</Text>
 <Text style={{fontSize:36,lineHeight:44,color:'#FFF6EE',fontWeight:'800'}}>Dinner has a delivery plan.</Text>
 <Text style={{fontSize:24,lineHeight:34,color:'#EAF0F8'}}>Later tonight · {show.name}</Text>
 {!phone&&onPhone&&<Button disabled={busy||saving} focusKey="delivery-send-phone" onPress={onPhone}>Send to phone</Button>}
 <View style={{padding:24,gap:18,borderRadius:20,backgroundColor:eveningTheme.surface}}>
 <Text style={{fontSize:26,lineHeight:36,color:'#FFF6EE'}}>{night.readyAt?'Dinner arrived':'Estimated dinner'} · {clock(schedule[2].at)}</Text>
 <Text style={{fontSize:26,lineHeight:36,color:'#FFF6EE'}}>Viewing {night.watchStarted?'started':'planned'} · {clock(schedule[3].at)}</Text>
 <Text style={{fontSize:21,lineHeight:31,color:eveningTheme.muted}}>{night.readyAt?'Arrival confirmed by your household.':'Based on your entered estimate. Open '+provider+' for live tracking; Crave Frame does not receive order updates.'}</Text>
 </View>
 <Text style={{fontSize:22,lineHeight:32,color:eveningTheme.muted}}>{night.readyAt?'Dinner is here. Enjoy your evening together.':'Cooking steps and kitchen timers are paused. Use the remaining estimate shown by your delivery provider.'}</Text>
 {canEdit&&onUpdate&&<View style={{gap:14}}><Button disabled={busy||saving} selected={editing} onPress={()=>setEditing(!editing)}>{editing?'Cancel timing change':'Update delivery timing'}</Button>{editing&&<><Text style={{fontSize:22,lineHeight:32,color:eveningTheme.muted}}>How many minutes from now? Enter 1–120 minutes. This updates dinner and viewing on both screens.</Text><TextInput accessibilityLabel="Remaining delivery minutes" keyboardType="number-pad" value={eta} onChangeText={setEta} editable={!busy&&!saving} maxLength={3} placeholder="Provider ETA in minutes" placeholderTextColor="#BACFC7" style={{color:'#FFF6EE',fontSize:24,padding:18,borderRadius:12,borderWidth:2,borderColor:'#679985'}}/>{valid&&<Text style={{fontSize:22,lineHeight:32,color:eveningTheme.muted}}>Estimated arrival: {clock(Date.now()+minutes*60000)}</Text>}<Button primary disabled={busy||saving||!valid} onPress={save}>{busy||saving?'Saving…':'Save delivery timing'}</Button></>}</View>}
 {!!message&&<Text accessibilityLiveRegion="polite" style={{fontSize:22,lineHeight:32,color:eveningTheme.muted}}>{message}</Text>}
 {!!syncError&&<Text accessibilityLiveRegion="polite" style={{fontSize:22,lineHeight:32,color:'#FFD3AA'}}>{syncError}</Text>}
 {onUpdate&&!['ready','complete'].includes(night.status)&&<Button primary disabled={busy||saving} onPress={()=>advance({deliveryArrived:true})}>Dinner has arrived</Button>}
 {onUpdate&&['ready','complete'].includes(night.status)&&!night.watchStarted&&<Button primary disabled={busy||saving} onPress={()=>advance({watchStarted:true})}>We’ve started watching</Button>}
 <TonightsEdition key={night.id} night={night} phone={phone} onUpdate={onUpdate} onSaveEdition={onSaveEdition} onLoadEdition={onLoadEdition} busy={busy}/>
 {phone?<Text style={{fontSize:20,lineHeight:30,color:eveningTheme.muted}}>This private link follows your shared evening. Keep it within your household.</Text>:<Button onPress={onBack}>Back to my evening</Button>}
 </ScrollView>;
}
