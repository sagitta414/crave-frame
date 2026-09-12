import React from 'react';
import {Image,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {RecipeArt} from './RecipeArt';
import {TVButton as Button} from './TVButton';
export function PairingHero({pair,source,pending=false,watchArt,onChoose,onDetails,onSearch,position=0,count=1,onPosition}:any){
 const {width,height}=useWindowDimensions(),wide=width>=900,matched=source==='ai'&&pair.aiExplained===true;
 return <View testID="remote-row-spotlight" style={[s.hero,{minHeight:wide?Math.max(440,Math.min(650,height*.66)):560}]}>
 <Image accessible={false} source={watchArt(pair.show,true)} style={StyleSheet.absoluteFill} resizeMode="cover"/>
 <LinearGradient colors={['#070B14FA','#070B14E8','#070B1430']} locations={[0,.4,1]} start={{x:0,y:.5}} end={{x:1,y:.5}} style={StyleSheet.absoluteFill}/>
 <LinearGradient colors={['#070B1420','transparent','#070B14']} locations={[0,.4,1]} style={StyleSheet.absoluteFill}/>
 <View style={[s.copy,{paddingHorizontal:wide?56:24,paddingTop:wide?38:30,paddingBottom:32,width:wide?'72%':'100%'}]}>
 <Text style={s.label}>{matched?'CURATED FOR YOUR EVENING':'FIND YOUR NEXT EVENING'}</Text>
 <Text accessibilityRole="header" style={[s.title,{fontSize:wide?(width>=1600?72:54):38,lineHeight:wide?(width>=1600?80:62):46}]}>{pair.show.name}</Text>
 <Text style={s.meta}>{pair.show.kind}  ·  {pair.show.minutes} min{matched?'  ·  '+pair.meal.minutes+' min cooking':''}</Text>
 {matched?<Text style={s.meal}>Paired with {pair.meal.name}</Text>:<Text style={s.description}>Choose a story. Find its dinner.</Text>}
 <View style={s.actions}><Button primary preferred focusKey="hero-choose" onPress={()=>onChoose(pair)}>{matched?'Plan this evening':'Find its dinner'}</Button>{matched?<Button focusKey="hero-details" onPress={()=>onDetails(pair)}>Pairing details</Button>:<Button focusKey="hero-search" onPress={onSearch}>Search a title</Button>}</View>
 {count>1&&<View style={s.actions}>{Array.from({length:count},(_,i)=><Button key={i} quiet selected={position===i} focusKey={'spotlight-'+i} onPress={()=>onPosition(i)}>{'0'+(i+1)}</Button>)}</View>}
 {pending&&<Text style={s.note}>Your AI dinner picks are on their way. You can browse now.</Text>}
 </View>
 {wide&&matched&&<View style={s.dinner}><RecipeArt meal={pair.meal} style={{width:'100%',aspectRatio:1.35,borderRadius:16}}/><Text style={s.dinnerLabel}>ON YOUR TABLE</Text></View>}
 </View>;
}
const s=StyleSheet.create({hero:{backgroundColor:'#070B14',justifyContent:'center',overflow:'hidden'},copy:{zIndex:1},label:{color:'#FFA47E',fontSize:20,fontWeight:'800',letterSpacing:2.4,marginBottom:20},title:{color:'#fff',fontWeight:'900',letterSpacing:-1.5,marginBottom:16},meta:{color:'#DCE5F4',fontSize:24,lineHeight:34,marginBottom:14},meal:{color:'#FFD5BD',fontSize:30,lineHeight:40,fontWeight:'700',marginBottom:10},description:{color:'#E2E9F4',fontSize:28,lineHeight:38,marginBottom:12},actions:{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:16},note:{color:'#CCD7E8',fontSize:20,lineHeight:29,marginTop:18},dinner:{position:'absolute',right:'4%',bottom:42,width:'23%',maxWidth:360,padding:6,borderRadius:20,backgroundColor:'#111927',borderWidth:1,borderColor:'#8A7563'},dinnerLabel:{color:'#FFD5BD',fontSize:18,fontWeight:'800',letterSpacing:2,padding:12,textAlign:'center'}});
