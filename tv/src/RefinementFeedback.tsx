import React,{useState} from 'react';
import {View} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
export function RefinementFeedback({onRefine,busy}:any){
 const [open,setOpen]=useState(false);
 return <View style={{gap:14,marginVertical:14}}><Button quiet onPress={()=>setOpen(!open)}>{open?'Close feedback':'Not quite right?'}</Button>{open&&<><Text style={{fontSize:25,lineHeight:35,color:'#FFF'}}>What would help tonight?</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{[['easy','Too much work'],['another','Not hungry for this'],['another','Already had it'],['familiar','Something more familiar']].map(([kind,label])=><Button key={label} disabled={busy} onPress={()=>onRefine(kind)}>{label}</Button>)}</View><Text style={{fontSize:21,lineHeight:31,color:'#CAD7E6'}}>Changes these suggestions only. Your movie and food exclusions stay fixed. Permanent dislikes belong in your saved preferences.</Text></>}</View>;
}
