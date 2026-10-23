import React,{useState} from 'react';
import {View} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {ingredients} from './catalog/engine';
import {cookingProfile} from './catalog/cooking-profile';
import {preparationNote} from './catalog/recipe-presentation';
export function CookingChecklist({night,meal,onReady}:any){
 const [checked,setChecked]=useState<string[]>([]),profile=cookingProfile(meal),items=ingredients(meal,night.prefs.people,night.adapted);
 const alreadyConfirmed=items.every((i:any)=>(night.confirmed||[]).includes(i.name));
 const checks=alreadyConfirmed?['Equipment and preparation ready']:['Ingredients and quantities checked','Equipment and preparation ready'];
 const toggle=(label:string)=>{const next=checked.includes(label)?checked.filter(x=>x!==label):[...checked,label];setChecked(next);onReady(next.length===checks.length);};
 return <View style={{padding:24,gap:16,borderRadius:20,backgroundColor:'#132739'}}>
 <Text style={{fontSize:30,color:'#FFF6EE',fontWeight:'800'}}>Your kitchen starts here.</Text>
 <Text style={{fontSize:20,lineHeight:29,color:'#AEE2C9'}}>Check what you need, then start step one. Your TV keeps the evening in sync.</Text>
 <Text style={{fontSize:22,lineHeight:32,color:'#D9E4EF'}}>{night.prefs.people} servings · {meal.minutes} min estimated · {profile.equipment.join(' + ')||'Check equipment in the recipe steps'}</Text>
 {alreadyConfirmed?<Text style={{fontSize:22,lineHeight:32,color:'#AEE2C9'}}>✓ Ingredients confirmed when you saved this evening. Review them in Ingredients &amp; recipe details below.</Text>:items.map((i:any)=><Text key={i.name+i.unit} style={{fontSize:23,lineHeight:33,color:'#FFF'}}>{i.amount} {i.unit} · {i.name}</Text>)}
 {!!preparationNote(meal,items)&&<Text style={{fontSize:22,lineHeight:32,color:'#FFD1AA'}}>{preparationNote(meal,items)}</Text>}
 <Text style={{fontSize:21,lineHeight:31,color:'#D9E4EF'}}>Review the steps and package instructions first. Cooking times are estimates; these recipes still await kitchen trials.</Text>
 <Text accessibilityLiveRegion="polite" style={{fontSize:20,color:'#FFDFC2'}}>{checked.length} of {checks.length} preparation checks complete</Text>
 {checks.map(label=><Button key={label} selected={checked.includes(label)} onPress={()=>toggle(label)}>{checked.includes(label)?'✓ ':''}{label}</Button>)}
 </View>;
}
