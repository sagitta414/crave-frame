import React,{useEffect,useRef,useState} from 'react';
import {ScrollView,View,useWindowDimensions} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {api,API_ORIGIN} from './api';
export function PhoneSearch({handoff,onSearch,onBack}:any){
 const {width}=useWindowDimensions();
 const [searching,setSearching]=useState(false),running=useRef(false),generation=useRef(0);
 const [query,setQuery]=useState(''),[error,setError]=useState(''),callback=useRef(onSearch);callback.current=onSearch;
 async function search(q:string){if(running.current)return;const token=generation.current;running.current=true;setSearching(true);setError('');try{const ok=await callback.current(q);if(token===generation.current&&!ok)setError('Search could not finish. Retry below.');}catch{if(token===generation.current)setError('Search could not finish. Retry below.');}finally{if(token===generation.current){running.current=false;setSearching(false);}}}
 useEffect(()=>{let active=true,timer:any;generation.current++;running.current=false;setSearching(false);setQuery('');setError('');
 async function poll(){if(!active)return;if(Date.now()>handoff.expires){setError('This link expired. Go back to create a new one.');return;}
 try{const h=await api('household');if(!active)return;const q=h.searchHandoffs?.find((x:any)=>x.session===handoff.session)?.query;if(q){setQuery(q);await search(q);return;}setError('');}catch{if(active)setError('Reconnecting to your TV search…');}
 if(active)timer=setTimeout(poll,5000);
 }poll();return()=>{active=false;generation.current++;clearTimeout(timer);};},[handoff.key]);
 return <ScrollView testID="main-scroll" contentContainerStyle={{padding:36,paddingBottom:90,gap:24,alignItems:'center'}}><Text style={{fontSize:width<600?30:40,lineHeight:width<600?40:50,color:'#FFF6EE',fontWeight:'800'}}>Type on your phone. Choose on TV.</Text><Text style={{fontSize:25,lineHeight:35,color:'#D4DFEC'}}>Scan this code, enter a movie or series, and send the search here.</Text><View style={{padding:20,backgroundColor:'#FFF',borderRadius:18}}><QRCode value={API_ORIGIN+'/app/companion.html?key='+handoff.key} size={Math.min(260,Math.max(140,width-120))}/></View><Text style={{fontSize:21,lineHeight:31,color:'#C7D6E7'}}>Private link · one search · expires in one hour. Anyone with it can send that search to this screen.</Text>{searching&&<Text accessibilityLiveRegion="polite" style={{fontSize:23,color:'#D4DFEC'}}>Finding your title…</Text>}{!!query&&<Text style={{fontSize:26,color:'#FFF'}}>{query}</Text>}{!!error&&<Text accessibilityLiveRegion="polite" style={{fontSize:23,color:'#FFD0AC'}}>{error}</Text>}{!!query&&!!error&&<Button disabled={searching} onPress={()=>search(query)}>Retry search</Button>}<Button onPress={onBack}>Back to search</Button></ScrollView>;
}
