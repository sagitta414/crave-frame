import {Text} from './TVText';
import React from 'react';
import {View,StyleSheet} from 'react-native';
import {RecipeArt} from './RecipeArt';
import {TVButton as Button} from './TVButton';
import {Reveal} from './Extras';
import {mealById} from './catalog/catalog';

export function ChangeOutcome({option,night,index,onReview}:any){
 const before=mealById(night.mealId),after=mealById(option.mealId);
 return <Reveal index={index}><View style={[s.card,index===0&&{borderColor:'#b78970'}]}>
  <View style={s.heading}><RecipeArt meal={after} style={{width:110,height:95,borderRadius:12}}/><View style={{flex:1}}><Text style={s.tag}>{option.aiExplained?(index===0?'AI RECOMMENDS':'AI ALTERNATIVE'):'CATALOG ALTERNATIVE'}</Text><Text style={s.title}>{after.name}</Text></View></View>
  <Text style={s.watch}>{option.showName}</Text>
  <View style={s.metrics}>{[{label:'SERVINGS',value:night.prefs.people+' → '+option.people},{label:'COOKING',value:before.minutes+' → '+after.minutes+' min'},{label:'RECIPE STEPS',value:before.steps.length+' → '+after.steps.length}].map(m=><View style={s.metric} key={m.label}><Text style={s.tag}>{m.label}</Text><Text style={s.value}>{m.value}</Text></View>)}</View>
  <Text style={s.body}>{option.decisionReason||option.tradeoff}</Text>
  {!!option.decisionTradeoff&&<Text style={s.tradeoff}>Tradeoff: {option.decisionTradeoff}</Text>}
  <Button primary={index===0} onPress={onReview}>Review this change →</Button>
  <Text style={s.note}>Estimated recipe times. Portions scale; larger batches may take longer. Nothing is saved yet.</Text>
 </View></Reveal>;
}
const s=StyleSheet.create({card:{backgroundColor:'#111b2b',borderWidth:1,borderColor:'#30405a',borderRadius:20,padding:22,marginVertical:12},heading:{flexDirection:'row',gap:18,alignItems:'center'},tag:{color:'#aebed8',fontSize:12,fontWeight:'700',letterSpacing:1.2},title:{color:'#fff',fontSize:25,fontWeight:'700',marginTop:6},watch:{color:'#ffb18d',fontSize:17,marginVertical:16},metrics:{flexDirection:'row',flexWrap:'wrap',gap:12,marginBottom:14},metric:{flexGrow:1,backgroundColor:'#1c2b40',padding:14,borderRadius:12},value:{color:'#fff',fontSize:23,fontWeight:'700',marginTop:8},body:{color:'#d4ddec',fontSize:18,lineHeight:27,marginBottom:14},tradeoff:{color:'#e9ba9d',fontSize:16,lineHeight:24,marginBottom:18},note:{color:'#a8b5ca',fontSize:13,lineHeight:19,marginTop:14}});
