import React,{useEffect,useRef,useState} from 'react';
import {ScrollView,View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {api,API_ORIGIN} from './api';
export function PhoneSearch({handoff,onSearch,onBack}:any){
 const [query,setQuery]=useState(''),[error,setError]=useState(''),callback=useRef(onSearch);callback.current=onSearch;
 useEffect(()=>{let active=true,timer:any;
 async function poll(){if(!active)return;if(Date.now()>handoff.expires){setError('This link expired. Go back to create a new one.');return;}
 try{const h=await api('household');if(!active)return;const q=h.searchHandoffs?.find((x:any)=>x.session===handoff.session)?.query;if(q){setQuery(q);const ok=await callback.current(q);if(active&&!ok)setError('Search could not finish. Retry below.');return;}setError('');}catch{if(active)setError('Reconnecting to your TV search…');}
 if(active)timer=setTimeout(poll,5000);
 }poll();return()=>{active=false;clearTimeout(timer);};},[handoff.key]);
 return <ScrollView testID="main-scroll" contentContainerStyle={{padding:36,paddingBottom:90,gap:24,alignItems:'center'}}><Text style={{fontSize:40,lineHeight:50,color:'#FFF6EE',fontWeight:'800'}}>Type on your phone. Choose on TV.</Text><Text style={{fontSize:25,lineHeight:35,color:'#D4DFEC'}}>Scan this code, enter a movie or series, and send the search here.</Text><View style={{padding:20,backgroundColor:'#FFF',borderRadius:18}}><QRCode value={API_ORIGIN+'/app/companion.html?key='+handoff.key} size={260}/></View><Text style={{fontSize:21,lineHeight:31,color:'#C7D6E7'}}>Private link · one search · expires in one hour. Anyone with it can send that search to this screen.</Text>{!!query&&<Text style={{fontSize:26,color:'#FFF'}}>{query}</Text>}{!!error&&<Text accessibilityLiveRegion="polite" style={{fontSize:23,color:'#FFD0AC'}}>{error}</Text>}{!!query&&!!error&&<Button onPress={async()=>{setError('');if(!await callback.current(query))setError('Search could not finish. Retry below.');}}>Retry search</Button>}<Button onPress={onBack}>Back to search</Button></ScrollView>;
}
