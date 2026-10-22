import React,{useState} from 'react';
import {View} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {dinnerDecision,pairingInsight} from './catalog/tonight-decision';
export function DinnerDecision({pair,prefs,pantry=[]}:any){const [expanded,setExpanded]=useState(false),[why,setWhy]=useState(false),d=dinnerDecision(pair.meal,pair.show,prefs,!!pair.adapted,pantry),insight=pairingInsight(pair);return <View style={{gap:10,padding:18,borderRadius:18,backgroundColor:'#101E2DDD',borderWidth:1,borderColor:'#395163'}}>
 <Text style={{fontSize:22,lineHeight:30,color:'#DFF4E9',fontWeight:'700'}}>{pair.meal.effort} cooking · {d.duration} together</Text>
 <View accessibilityLabel="Estimated evening sequence" style={{flexDirection:'row',gap:8}}>{[{label:'Cook',minutes:pair.meal.minutes},{label:'Eat',minutes:25},{label:'Watch',minutes:pair.show.minutes}].map((phase,i)=><View key={phase.label} style={{flex:1,padding:10,borderRadius:12,backgroundColor:['#293A45','#303329','#24304B'][i]}}><Text style={{fontSize:23,lineHeight:30,fontWeight:'700',color:'#FFF3E4'}}>{phase.minutes} min</Text><Text style={{fontSize:19,color:'#CDDCE4'}}>{phase.label}</Text></View>)}</View>
 <Text style={{fontSize:18,lineHeight:26,color:'#B9CAD9'}}>Cooking first, then dinner and viewing. Times are estimates.</Text>
 <Text numberOfLines={expanded?undefined:2} style={{fontSize:21,lineHeight:30,color:'#FFF0E0'}}>Ingredients · {d.items.slice(0,3).map(i=>i.name).join(' · ')}{d.items.length>3?' + '+(d.items.length-3)+' more':''}</Text>
 <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}><Button compact quiet selected={expanded} onPress={()=>setExpanded(!expanded)}>{expanded?'Hide ingredients':`Check ingredients · ${d.check.length} to check`}</Button><Button compact quiet selected={why} onPress={()=>setWhy(!why)}>{why?'Hide pairing reason':'Why this pairing?'}</Button></View>
 {why&&<View style={{gap:8,padding:14,borderLeftWidth:3,borderLeftColor:'#FFD0AB'}}><Text style={{fontSize:21,fontWeight:'700',color:'#FFE1C5'}}>{insight.label}</Text><Text style={{fontSize:20,lineHeight:29,color:'#D8E3EC'}}>{insight.text}</Text></View>}
 {expanded&&<View style={{gap:9}}><Text style={{fontSize:19,lineHeight:28,color:'#CAD9E5'}}>For {prefs.people} people. Pantry matches use your saved list; check quantities and packaging before cooking.</Text>{d.items.map((item:any)=><Text key={item.name+item.unit} style={{fontSize:21,lineHeight:30,color:item.inPantry?'#AEE2C9':'#FFF0E0'}}>{item.amount} {item.unit} {item.name} · {item.inPantry?'On pantry list':'Check or buy'}</Text>)}</View>}
 </View>;}
