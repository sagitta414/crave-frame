import React,{useState} from 'react';
import {TextInput,View} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {allergyOptions} from './catalog/food-restrictions';
import {foodPreferences} from './catalog/diets';

export function FoodSettings({memory,prefs,onSave}:any){
 const [allergies,setAllergies]=useState<string[]>(memory.allergies||[]),[avoid,setAvoid]=useState((memory.dislikedIngredients||[]).join(', ')),[draft,setDraft]=useState(prefs),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const reset=()=>{setAllergies(memory.allergies||[]);setAvoid((memory.dislikedIngredients||[]).join(', '));setDraft(prefs);setError('');};
 const save=async()=>{setSaving(true);setError('');try{await onSave({prefs:draft,allergies,avoid:avoid.split(',').map((x:string)=>x.trim()).filter(Boolean)});}catch(e:any){setError(e.message||'Could not save. Please try again.');}finally{setSaving(false);}};
 const label={fontSize:24,color:'#FFD1B6',fontWeight:'800' as const,marginTop:20};
 const row={flexDirection:'row' as const,flexWrap:'wrap' as const,gap:14,marginVertical:12};
 return <View><Text style={label}>ALLERGY EXCLUSIONS</Text><Text style={{fontSize:22,lineHeight:32,color:'#E4EAF3'}}>Ingredients with known or unknown selected allergens are excluded. Check package labels and cross-contact; this is not an allergy-safety certification.</Text><View style={row}>{allergyOptions.map((v:string)=><Button key={v} selected={allergies.includes(v)} disabled={saving} onPress={()=>setAllergies(a=>a.includes(v)?a.filter(x=>x!==v):[...a,v])}>{(allergies.includes(v)?'✓ ':'')+v}</Button>)}</View><Text style={label}>OTHER INGREDIENTS TO AVOID</Text><TextInput editable={!saving} value={avoid} onChangeText={setAvoid} accessibilityLabel="Other ingredients to avoid" placeholder="mushrooms, cilantro" placeholderTextColor="#8991a1" style={{color:'#fff',borderWidth:3,borderColor:'#71829B',padding:20,fontSize:25,marginVertical:18}}/><Button disabled={saving||!avoid} onPress={()=>setAvoid('')}>Clear avoided ingredients</Button><Text style={label}>FOOD PREFERENCE</Text><View style={row}>{foodPreferences.map((v:string)=><Button key={v} disabled={saving} selected={draft.diet===v} onPress={()=>setDraft({...draft,diet:v})}>{v}</Button>)}</View><Text style={label}>COOKING LEVEL</Text><View style={row}>{['Beginner','Regular','Confident'].map(v=><Button key={v} disabled={saving} selected={draft.cookLevel===v} onPress={()=>setDraft({...draft,cookLevel:v})}>{v}</Button>)}</View><Text style={{fontSize:22,color:'#E4EAF3'}}>Changes apply when saved. An empty avoid list removes all saved ingredient exclusions.</Text>{!!error&&<Text accessibilityLiveRegion="polite" style={{fontSize:24,color:'#FFB18F'}}>{error}</Text>}<View style={row}><Button primary disabled={saving} onPress={save}>{saving?'Saving…':'Save food preferences'}</Button><Button disabled={saving} onPress={reset}>Discard food changes</Button></View></View>;
}
