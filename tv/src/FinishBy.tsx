import React,{useState} from 'react';
import {View} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {projectEvening} from './schedule';
export function FinishBy({night,meal,show,onSave,busy,nights=[]}:any){
 const [open,setOpen]=useState(false),finish=projectEvening(night,meal,show).schedule[4].at;
 const clock=(at:number)=>new Date(at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
 const choices=[60,90,120,180].map(minutes=>({minutes,at:Date.now()+minutes*60000}));
 const longer=nights.filter((n:any)=>n.feedback?.timing==='longer').length;
 const late=night.finishBy?Math.max(0,Math.ceil((finish-night.finishBy)/60000)):0;
 return <View style={{padding:24,gap:16,backgroundColor:'#122332',borderRadius:20}}><Text style={{fontSize:25,lineHeight:35,color:'#FFF'}}>Estimated finish · {clock(finish)}{night.timingAllowanceMinutes?` · includes ${night.timingAllowanceMinutes} min extra prep`:""}</Text>
 {!!night.finishBy&&<Text accessibilityLiveRegion="polite" style={{fontSize:23,lineHeight:33,color:late?'#FFD0AE':'#A8E4C9'}}>{late?`${late} min past your ${clock(night.finishBy)} target. Choose a shorter watch or simpler dinner before cooking.`:`Fits your ${clock(night.finishBy)} finish target.`} This includes dinner and viewing time.</Text>}
 {open&&night.status==='planned'&&night.fulfillment!=='delivery'&&!night.watchStarted&&<><Text style={{fontSize:22,lineHeight:32,color:"#D5E0EC"}}>{longer>=2?`You reported needing longer on ${longer} evenings. Add a little room to this plan?`:"Want extra preparation time? It shifts dinner and viewing estimates, not recipe timers."}</Text><View style={{flexDirection:"row",flexWrap:"wrap",gap:12}}>{[0,5,10,15,20,30].map(minutes=><Button key={minutes} selected={(night.timingAllowanceMinutes||0)===minutes} disabled={busy} onPress={()=>onSave({timingAllowanceMinutes:minutes})}>{minutes?`+${minutes} min`:'No extra time'}</Button>)}</View></>}<Button quiet onPress={()=>setOpen(!open)}>{open?'Hide timing options':'Finish target & extra preparation time'}</Button>
 {open&&<><Text style={{fontSize:21,lineHeight:31,color:'#D5E0EC'}}>Set a target for this evening. It does not shorten cooking steps or change your plan.</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{choices.map(c=><Button key={c.minutes} disabled={busy} onPress={()=>onSave({finishBy:c.at})}>By {clock(c.at)} · {c.minutes} min from now</Button>)}{!!night.finishBy&&<Button disabled={busy} onPress={()=>onSave({finishBy:null})}>Clear target</Button>}</View></>}
 </View>;
}
