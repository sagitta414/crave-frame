import React from 'react';
import {View} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {Reveal} from './Extras';
export function DinnerReady({night,phone,onBack,onUpdate,busy}:any){return <Reveal><View accessibilityLiveRegion="polite" style={{padding:24,gap:14,borderRadius:20,backgroundColor:'#14392E',borderWidth:1,borderColor:'#79CBA9'}}><Text style={{fontSize:36,lineHeight:44,color:'#FFF6EE',fontWeight:'800'}}>✦ Dinner is ready.</Text><Text style={{fontSize:24,lineHeight:34,color:'#D9F4E7'}}>The rest of tonight is yours.</Text><Text style={{fontSize:26,lineHeight:36,color:'#FFF'}}>{night.show?.name||'Your saved viewing choice'}</Text><Text style={{fontSize:20,lineHeight:30,color:'#C3DDD2'}}>Open your streaming app when you are ready. Crave Frame does not start playback.</Text>{phone&&onUpdate&&<Button primary disabled={busy||!!night.watchStarted} onPress={()=>onUpdate({watchStarted:true})}>{night.watchStarted?"Viewing time saved ✓":"We’re starting our show"}</Button>}{!phone&&<Button primary preferred onPress={onBack}>See my evening →</Button>}</View></Reveal>;}
