import {pairingEvidence} from './catalog/together-features';
import {Linking} from 'react-native';
import {TVButton as Button} from './TVButton';
import {pairingSummary} from './planning-ux';
import {Text} from './TVText';
import React from 'react';
import {View} from 'react-native';
import {practicalReason} from './catalog/recipe-presentation';
export function PairingReason({pair,compact=false}:any){
 const evidence=pairingEvidence(pair);
 const practical=(pair.pairingType||pair.connection?.pairingType)==='practical';
 const cue=pair.storyCue||pair.connection?.storyCue;
 const echo=practical?evidence.detail||practicalReason(pair):pair.tableEcho||pair.reason||pair.connection?.tableEcho;
 return <View style={{gap:8,marginVertical:compact?8:16}}>
  <Text style={{color:'#FFCCA7',fontSize:compact?17:19,fontWeight:'700'}}>{evidence.label}</Text>
  {!compact&&evidence.source&&evidence.source.startsWith('https://')&&<Button compact quiet onPress={()=>Linking.openURL(evidence.source).catch(()=>{})}>Read the reference ↗</Button>}
  {!compact&&!practical&&!!cue&&<Text style={{color:'#D2DDEE',fontSize:22,lineHeight:30}}>{cue}</Text>}
  <Text numberOfLines={undefined} style={{color:'#F0F3F8',fontSize:compact?20:24,lineHeight:compact?27:33}}>{compact?pairingSummary(pair):echo||'Chosen to fit your evening preferences.'}</Text>
  {!compact&&pair.evidenceQuote&&<View style={{borderLeftWidth:3,borderLeftColor:'#FFCFAD',paddingLeft:14}}><Text style={{color:'#FFCFAD',fontSize:20}}>Source excerpt</Text><Text style={{color:'#D2DDEE',fontSize:21,lineHeight:30}}>“{pair.evidenceQuote}”</Text></View>}
 </View>;
}
