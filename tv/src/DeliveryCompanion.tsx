import React from 'react';
import {ScrollView,View} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {mealById,showById} from './catalog/catalog';
import {projectEvening} from './schedule';

export function DeliveryCompanion({night,phone,onBack,syncError}:any){
 const show=night.show||showById(night.showId),schedule=projectEvening(night,mealById(night.mealId),show).schedule;
 const clock=(at:number)=>new Date(at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
 const provider=night.orderPlan?.provider==='ubereats'?'Uber Eats':'DoorDash';
 return <ScrollView testID="main-scroll" contentContainerStyle={{padding:28,paddingBottom:90,gap:22,maxWidth:1000,width:'100%',alignSelf:'center'}}>
 <Text style={{fontSize:18,color:'#FFCA9F',fontWeight:'800'}}>YOUR ORDER-OUT EVENING</Text>
 <Text style={{fontSize:36,lineHeight:44,color:'#FFF6EE',fontWeight:'800'}}>Dinner has a delivery plan.</Text>
 <Text style={{fontSize:24,lineHeight:34,color:'#EAF0F8'}}>Later tonight · {show.name}</Text>
 <View style={{padding:24,gap:18,borderRadius:20,backgroundColor:'#132739'}}>
 <Text style={{fontSize:26,lineHeight:36,color:'#FFF6EE'}}>Estimated dinner · {clock(schedule[2].at)}</Text>
 <Text style={{fontSize:26,lineHeight:36,color:'#FFF6EE'}}>Viewing {night.watchStarted?'started':'planned'} · {clock(schedule[3].at)}</Text>
 <Text style={{fontSize:21,lineHeight:31,color:'#D9E4EF'}}>Based on your entered estimate. Open {provider} for live tracking; Crave Frame does not receive order updates.</Text>
 </View>
 <Text style={{fontSize:22,lineHeight:32,color:'#D9E4EF'}}>Cooking steps and kitchen timers are paused. Update the delivery estimate from your evening plan on the TV.</Text>
 {!!syncError&&<Text accessibilityLiveRegion="polite" style={{fontSize:22,lineHeight:32,color:'#FFD3AA'}}>{syncError}</Text>}
 {phone?<Text style={{fontSize:20,lineHeight:30,color:'#C4D2E3'}}>This private link follows your shared evening. Keep it within your household.</Text>:<Button onPress={onBack}>Back to my evening</Button>}
 </ScrollView>;
}
