import React,{useState} from 'react';
import {View} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {dinnerDecision} from './catalog/tonight-decision';
export function DinnerDecision({pair,prefs,pantry=[]}:any){const [expanded,setExpanded]=useState(false),d=dinnerDecision(pair.meal,pair.show,prefs,!!pair.adapted,pantry);return <View style={{gap:10,padding:18,borderRadius:18,backgroundColor:'#101E2DDD',borderWidth:1,borderColor:'#395163'}}>
 <Text style={{fontSize:22,lineHeight:30,color:'#DFF4E9',fontWeight:'700'}}>{pair.meal.effort} cooking · {d.total} min for the evening</Text>
 <Text style={{fontSize:19,lineHeight:28,color:'#B9CAD9'}}>Includes 25 minutes to eat. Recipe times are estimates.</Text>
 <Text numberOfLines={expanded?undefined:2} style={{fontSize:21,lineHeight:30,color:'#FFF0E0'}}>On your list · {d.items.slice(0,3).map(i=>i.name).join(' · ')}{d.items.length>3?' + '+(d.items.length-3)+' more':''}</Text>
 <Button compact quiet selected={expanded} onPress={()=>setExpanded(!expanded)}>{expanded?'Hide ingredients':`Check ingredients · ${d.check.length} to check`}</Button>
 {expanded&&<View style={{gap:9}}><Text style={{fontSize:19,lineHeight:28,color:'#CAD9E5'}}>For {prefs.people} people. Pantry matches use your saved list; check quantities and packaging before cooking.</Text>{d.items.map((item:any)=><Text key={item.name+item.unit} style={{fontSize:21,lineHeight:30,color:item.inPantry?'#AEE2C9':'#FFF0E0'}}>{item.amount} {item.unit} {item.name} · {item.inPantry?'On pantry list':'Check or buy'}</Text>)}</View>}
 </View>;}
