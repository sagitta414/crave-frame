import {DinnerDecision} from './DinnerDecision';
import React,{useState} from 'react';
import {Image,StyleSheet,View,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {RecipeArt} from './RecipeArt';
import {eveningPalette} from './cinema-model';
export function PairingHero({pair,prefs,watchArt,onChoose,onChangeDinner,onChangeShow,pantry}:any){
 const [details,setDetails]=useState(false),{width}=useWindowDimensions(),wide=width>=900,accent=eveningPalette(pair.show);
 return <View testID="remote-row-spotlight" style={s.hero}>
  <Image accessibilityLabel={pair.show.name+' artwork'} source={watchArt(pair.show,true)} resizeMode="cover" style={[StyleSheet.absoluteFill,{width:'100%',height:'100%'}]}/>
  <LinearGradient colors={['#070C17FA','#080C16DD','#080C1630']} locations={[0,.48,1]} start={{x:0,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill}/>
  <LinearGradient colors={['#080C1600','#080C16']} locations={[.55,1]} style={StyleSheet.absoluteFill}/>
  <View style={[s.layout,{paddingHorizontal:wide?58:24,flexDirection:wide?'row':'column'}]}>
   <View style={{flex:1,gap:12,minWidth:0,width:wide?undefined:'100%'}}>
    <Text style={[s.eyebrow,{color:accent}]}>LESS DECIDING. MORE EVENING.</Text>
    <Text accessibilityRole="header" style={[s.title,{fontSize:wide?64:40,lineHeight:wide?72:48}]}>{pair.show.name}</Text>
    <Text accessibilityLabel={pair.meal.name} numberOfLines={2} style={s.meal}>{pair.meal.shortName||pair.meal.name}</Text>
    <Text style={s.meta}>{pair.meal.minutes} min cooking · {pair.show.minutes} min watching</Text>
    <View style={s.actions}><Button primary compact preferred focusKey="hero-choose" onPress={()=>onChoose(pair)}>Plan this evening →</Button>{onChangeDinner&&<Button compact quiet onPress={()=>onChangeDinner(pair)}>Change dinner</Button>}{onChangeShow&&<Button compact quiet onPress={()=>onChangeShow(pair)}>Change show</Button>}</View><Button compact quiet selected={details} onPress={()=>setDetails(!details)}>{details?'Hide timing & ingredients':'Timing, ingredients & pairing details'}</Button>{details&&<DinnerDecision key={pair.meal.id+pair.show.id} pair={pair} prefs={prefs} pantry={pantry}/>}
   </View>
   <View style={{width:wide?'38%':'100%',maxWidth:680,alignSelf:'center',borderRadius:22,overflow:'hidden',borderWidth:1,borderColor:accent+'55'}}><RecipeArt meal={pair.meal} resizeMode="contain" style={{width:'100%',aspectRatio:1.5,backgroundColor:'#111A27'}}/></View>
  </View>
 </View>;
}
const s=StyleSheet.create({hero:{backgroundColor:'#080C16',overflow:'hidden'},layout:{minHeight:470,paddingTop:32,paddingBottom:34,gap:42,alignItems:'center'},eyebrow:{fontSize:20,fontWeight:'700',letterSpacing:4},title:{color:'#FFF8EF',fontWeight:'800',letterSpacing:-1.7,textShadowColor:'#0008',textShadowRadius:16},meal:{color:'#FFE0C8',fontSize:32,lineHeight:43,fontWeight:'600'},meta:{color:'#D7DFEB',fontSize:24,lineHeight:34},actions:{flexDirection:'row',flexWrap:'wrap',gap:14,marginTop:16}});
