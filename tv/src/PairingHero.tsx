import {Text} from './TVText';
import React from 'react';
import {Image,StyleSheet,View,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {RecipeArt} from './RecipeArt';
import {TVButton as Button} from './TVButton';
export function PairingHero({pair,source,pending=false,watchArt,onChoose,onDetails,onSearch,position=0,count=1,onPosition}:any){
 const {width,height}=useWindowDimensions(),wide=width>=900,matched=source==='ai'&&pair.aiExplained===true;
 return <View testID="remote-row-spotlight" style={[s.hero,{minHeight:wide?Math.max(300,Math.min(460,height*.48)):440}]}>
 <Image accessible={false} source={watchArt(pair.show,true)} style={StyleSheet.absoluteFill} resizeMode="cover"/>
 <LinearGradient colors={['#070B14FA','#070B14E8','#070B1430']} locations={[0,.4,1]} start={{x:0,y:.5}} end={{x:1,y:.5}} style={StyleSheet.absoluteFill}/>
 <LinearGradient colors={['#070B1420','transparent','#070B14']} locations={[0,.4,1]} style={StyleSheet.absoluteFill}/>
 <View style={[s.copy,{paddingHorizontal:wide?48:24,paddingTop:wide?20:24,paddingBottom:20,width:wide&&matched?'64%':'100%'}]}>
 <Text style={s.label}>{matched?'TONIGHT’S PICK':'WHAT ARE WE WATCHING?'}</Text>
 <Text accessibilityRole="header" style={[s.title,{fontSize:wide?(width>=1600?72:54):38,lineHeight:wide?(width>=1600?80:62):46}]}>{pair.show.name}</Text>
 <Text style={s.meta}>{pair.show.kind}  ·  {pair.show.minutes} min{matched?'  ·  '+pair.meal.minutes+' min cooking':''}</Text>
 {matched?<Text style={s.meal}>Paired with {pair.meal.name}</Text>:<Text style={s.description}>Choose a story. Find its dinner.</Text>}
 <View style={s.actions}><Button compact primary preferred focusKey="hero-choose" onPress={()=>onChoose(pair)}>{matched?'Plan this evening':'Find its dinner'}</Button><Button compact quiet focusKey="hero-search" onPress={onSearch}>Change title</Button></View>
 {count>1&&<View style={s.actions}>{Array.from({length:count},(_,i)=><Button compact key={i} quiet selected={position===i} focusKey={'spotlight-'+i} onPress={()=>onPosition(i)}>{'0'+(i+1)}</Button>)}</View>}
 {pending&&<Text style={s.note}>Your AI dinner picks are on their way. You can browse now.</Text>}
 </View>
 {wide&&matched&&<View style={s.dinner}><RecipeArt meal={pair.meal} style={{width:'100%',aspectRatio:1.25,borderRadius:18}}/></View>}
 </View>;
}
const s=StyleSheet.create({hero:{backgroundColor:'#070B14',justifyContent:'center',overflow:'hidden'},copy:{zIndex:1},label:{color:'#FFA47E',fontSize:20,fontWeight:'800',letterSpacing:2.4,marginBottom:10},title:{color:'#fff',fontWeight:'900',letterSpacing:-1.5,marginBottom:16},meta:{color:'#DCE5F4',fontSize:24,lineHeight:34,marginBottom:14},meal:{color:'#FFD5BD',fontSize:30,lineHeight:40,fontWeight:'700',marginBottom:10},description:{color:'#E2E9F4',fontSize:28,lineHeight:38,marginBottom:12},actions:{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:16},note:{color:'#CCD7E8',fontSize:20,lineHeight:29,marginTop:18},dinner:{position:'absolute',right:'5%',bottom:48,width:'27%',maxWidth:340,padding:0,overflow:'hidden',borderRadius:20,backgroundColor:'#111927',borderWidth:1,borderColor:'#8A7563'},dinnerLabel:{color:'#FFD5BD',fontSize:18,fontWeight:'800',letterSpacing:2,padding:12,textAlign:'center'}});
