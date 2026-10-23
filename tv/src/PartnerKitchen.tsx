import {TonightsEdition} from './TonightsEdition';
import React,{useEffect,useRef,useState} from 'react';
import {View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {partnerTasks} from './catalog/together-features';
import {showById} from './catalog/catalog';
import {projectEvening} from './schedule';
export function PartnerKitchen({night,meal,onUpdate,busy,tick,onRoleChange,onSaveEdition,onLoadEdition,phone=false}:any){
 const [person,setPerson]=useState(0),[role,setRole]=useState(0),[error,setError]=useState(''),lock=useRef(false),selection=useRef(0);
 useEffect(()=>{onRoleChange?.(role);},[role,onRoleChange]);
 useEffect(()=>{let live=true;const version=++selection.current;setPerson(0);setRole(0);Promise.all([AsyncStorage.getItem('cf-partner-person-'+night.id),AsyncStorage.getItem('cf-cook-role-'+night.id)]).then(([person,role])=>{if(live&&version===selection.current){if(['1','2'].includes(person||''))setPerson(Number(person));if(['1','2'].includes(role||''))setRole(Number(role));}}).catch(()=>{});return()=>{live=false;};},[night.id]);
 const tasks=partnerTasks(meal,night.prefs.people,night.adapted),schedule=projectEvening(night,meal,night.show||showById(night.showId),tick).schedule,ready=['ready','complete'].includes(night.status),feedback=night.partnerFeedback?.[person];
 async function write(value:any){if(lock.current||busy)return;lock.current=true;setError('');try{await onUpdate(value);}catch(e){setError(e.message||'Could not save. Try again.');}finally{lock.current=false;}}
 return <View style={{padding:24,borderRadius:22,gap:16,backgroundColor:'#18342F',borderWidth:1,borderColor:'#679985'}}><Text style={{fontSize:28,color:'#FFF3E7',fontWeight:'800'}}>Two people. One dinner.</Text><Text style={{fontSize:21,lineHeight:30,color:'#CEE6DF'}}>Open the same cooking link on both phones. Choose who you are, then your job tonight. Swapping jobs does not change whose feedback you save. These are shared household profiles, not private accounts.</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{[1,2].map(p=><Button key={p} selected={person===p} disabled={busy} onPress={()=>{selection.current++;setPerson(p);AsyncStorage.setItem('cf-partner-person-'+night.id,String(p)).catch(()=>setError('Partner number could not be remembered on this device.'));}}>I’m Partner {p}</Button>)}</View>
 {!ready&&<><Text style={{fontSize:22,color:'#FFE0C6'}}>My job tonight</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{[1,2].map(r=><Button key={r} selected={role===r} disabled={busy||!person} onPress={()=>{selection.current++;setRole(r);AsyncStorage.setItem('cf-cook-role-'+night.id,String(r)).catch(()=>setError('Job could not be remembered on this device.'));}}>{r===1?'Lead the cooking':'Prep & table'}</Button>)}</View></>}
 <Text style={{fontSize:22,color:'#FFDFC4'}}>Dinner {new Date(schedule[2].at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} · Watch {new Date(schedule[3].at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} · estimates</Text>
 {!ready&&role===1&&<Text style={{fontSize:23,lineHeight:33,color:'#FFF3E7'}}>You lead the recipe below. Your partner measures ingredients and gets the table ready alongside you. Keep the cooking steps in order.</Text>}
 {!ready&&role===2&&<><Text style={{fontSize:23,lineHeight:33,color:'#FFF3E7'}}>Your preparation list</Text>{tasks.map(t=><View key={t.id} style={{gap:6,padding:14,borderRadius:12,backgroundColor:'#102920'}}><Button disabled={busy} selected={!!night.partnerTasks?.[t.id]} onPress={()=>write({partnerTask:{id:t.id,done:!night.partnerTasks?.[t.id]}})}>{night.partnerTasks?.[t.id]?'✓ ':''}{t.title}</Button><Text style={{fontSize:19,lineHeight:27,color:'#CEE6DF'}}>{t.text}</Text></View>)}<Text style={{fontSize:20,lineHeight:29,color:'#CEE6DF'}}>Leave heat, cutting and recipe progression to the cooking partner. The full recipe remains below if you need to check it.</Text></>}
 {!ready&&role===1&&<Text style={{fontSize:20,color:'#CEE6DF'}}>{tasks.filter(t=>night.partnerTasks?.[t.id]).length} of {tasks.length} partner preparation tasks done.</Text>}
 {ready&&person>0&&<PartnerResponse key={person} person={person} feedback={feedback} watchStarted={!!night.watchStarted} busy={busy} onWrite={write}/>}

 {ready&&person>0&&<TonightsEdition key={night.id+person} night={night} person={person} phone={phone} onLoadEdition={onLoadEdition} onSaveEdition={onSaveEdition} onUpdate={onUpdate} busy={busy}/>}
 {!!error&&<Text accessibilityLiveRegion="polite" style={{fontSize:20,color:'#FFD0B9'}}>{error}</Text>}</View>;
}

export function PartnerResponse({person,feedback,watchStarted,busy,onWrite}:any){
 const [food,setFood]=useState(feedback?.food||''),[watch,setWatch]=useState(feedback?.watch||'');
 useEffect(()=>setFood(feedback?.food||''),[feedback?.food]);
 useEffect(()=>setWatch(feedback?.watch||''),[feedback?.watch]);
 return <View style={{gap:16}}><Text style={{fontSize:26,color:'#FFF3E7'}}>Partner {person}, would you do this again?</Text><Text style={{fontSize:20,lineHeight:28,color:'#CEE6DF'}}>Rate dinner now and viewing when you’re ready. Your answers guide Our Night In. Keep the same partner number, even when you swap kitchen jobs.</Text>{(['food','watch'] as const).filter(kind=>kind==='food'||watchStarted).map(kind=><View key={kind} style={{gap:10}}><Text style={{fontSize:22,color:'#FFE0C6'}}>{kind==='food'?'This dinner':'This movie or episode'}</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{['again','okay','skip'].map(value=><Button key={value} disabled={busy} selected={(kind==='food'?food:watch)===value} onPress={()=>kind==='food'?setFood(value):setWatch(value)}>{value==='again'?'Do it again':value==='okay'?'Okay':'Skip next time'}</Button>)}</View><Button primary disabled={busy||!(kind==='food'?food:watch)} onPress={()=>onWrite({partnerFeedback:{person,[kind]:kind==='food'?food:watch}})}>{kind==='food'?'Save dinner feedback':'Save viewing feedback'}</Button>{feedback?.[kind]&&<Text style={{fontSize:19,color:'#CEE6DF'}}>Saved: {feedback[kind]}</Text>}</View>)}{!watchStarted&&<Text style={{fontSize:20,lineHeight:28,color:'#CEE6DF'}}>Viewing feedback will open after you start the viewing timer on your evening plan. You can come back later.</Text>}{feedback&&<Button quiet disabled={busy} onPress={()=>onWrite({partnerFeedback:{person,food:'clear',watch:'clear'}})}>Remove my feedback for this evening</Button>}</View>;
}
