import {reviewedDishImages} from './catalog/reviewed-dish-images';
import {TonightShortcuts} from './TonightShortcuts';
import {DinnerDecision} from './DinnerDecision';
import {emptyMatchAdvice,nextCookingLabel} from './catalog/evening-guidance';
import {HomeFeatureCard,homeFeatures} from './HomeFeatureCard';
import {WatchBites} from './TonightPersonality';
import {resumeEvening,choiceLabels} from './planning-ux';
import {mealPhotos} from './mealPhotos';
import {tonightEntry} from './tonight-cache';
import {isSilk} from './SilkPage';
import {browseTitleKey} from './catalog/identity';
import {cookingTimeLabel} from './catalog/recipe-presentation';
import {CoursePlan} from './CoursePlan';
import {proteinOptions} from './catalog/protein-options';
import {cinemaRows,eveningPalette,chooseSpotlight} from './cinema-model';
import {Text} from './TVText';
import {MatchingStage} from './MatchingStage';
import {PairingReason} from './PairingReason';
import {MealSignals} from './MealSignals';
import {PairingHero} from './PairingHero';
import {RecipeArt} from './RecipeArt';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Animated,Image,Linking,Platform,ScrollView,StyleSheet,View,useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {TVButton as Button} from './TVButton';
import {api} from './api';
import {curate,connection} from './catalog/curation';
import {mealById,shows} from './catalog/catalog';
import {recipeSteps} from './catalog/engine';
import {ConnectionBadge,DecisionReceipt} from './PairingIntelligence';
const availabilityCache=new Map<string,Promise<any>>();
export function AvailabilityBadge({show,region='US'}:any){const [data,setData]=useState<any>(null),[failed,setFailed]=useState(false);const provider=show.provider||(()=>{const m=show.source?.match(/themoviedb.org\/(movie|tv)\/(\d+)/);return m?{type:m[1],id:m[2]}:null;})();useEffect(()=>{let alive=true;setData(null);setFailed(false);if(!provider)return;const key=provider.type+provider.id+region;if(!availabilityCache.has(key))availabilityCache.set(key,api(`catalog/availability?type=${provider.type}&id=${provider.id}&region=${region}`).catch(e=>{availabilityCache.delete(key);throw e;}));availabilityCache.get(key)!.then(x=>{if(alive)setData(x);}).catch(()=>{if(alive)setFailed(true);});return()=>{alive=false;};},[show.id,region]);const sub=data?.subscription?.map((x:any)=>x.name).join(', '),rent=data?.rent?.map((x:any)=>x.name).join(', '),buy=data?.buy?.map((x:any)=>x.name).join(', ');return <View style={b.availability}><Text style={b.availabilityText}>{!provider||failed?'Availability unknown':!data?'Checking where to watch…':sub?'Subscription · '+sub:rent?'Rent · '+rent:buy?'Buy · '+buy:'No regional listing found'} · {region}</Text>{data&&<Text style={b.small}>JustWatch via TMDB{show.kind==='TV episode'?' · Series listing; check episode':''}</Text>}</View>;}
const scrollPositions:Record<string,{x:number,y:number}>={};
export function BrowseScroll({memoryKey,children,horizontal=false,style,contentContainerStyle,railRef}:any){const internalRef=useRef<ScrollView>(null),ref=railRef||internalRef,restored=useRef(false);return <ScrollView testID={horizontal?undefined:"main-scroll"} ref={ref} horizontal={horizontal} style={style} contentContainerStyle={contentContainerStyle} showsHorizontalScrollIndicator={false} scrollEventThrottle={100} onScroll={e=>{scrollPositions[memoryKey]=e.nativeEvent.contentOffset;}} onContentSizeChange={()=>{if(restored.current)return;restored.current=true;const p=scrollPositions[memoryKey];if(p)ref.current?.scrollTo({...p,animated:false});}}>{children}</ScrollView>;}
function Rail({title,subtitle,children,id}:any){
 const {width}=useWindowDimensions(),railRef=useRef<ScrollView>(null);
 const shift=(direction:number)=>{const key='rail-'+id,current=scrollPositions[key]||{x:0,y:0};const x=Math.max(0,current.x+direction*Math.max(340,width*.65));railRef.current?.scrollTo({x,y:0,animated:false});};
 return <View testID={'remote-row-'+id} style={[b.rail,{paddingLeft:width<900?20:52}]}><View style={{flexDirection:'row',alignItems:'center',gap:18,paddingRight:width<900?20:52}}><Text style={[b.h2,{flex:1}]}>{title}</Text><Button compact quiet accessibilityLabel={'Previous evenings in '+title} focusKey={id+'-left'} onPress={()=>shift(-1)}>←</Button><Button compact quiet accessibilityLabel={'More evenings in '+title} focusKey={id+'-right'} onPress={()=>shift(1)}>→</Button></View>{!!subtitle&&<Text style={b.small}>{subtitle}</Text>}<BrowseScroll railRef={railRef} horizontal memoryKey={'rail-'+id} contentContainerStyle={{padding:12,paddingRight:52,gap:24}}>{children}</BrowseScroll></View>;
}
export function EveningCard({pair,watchArt,onChoose,onFocus,focusKey,titleOnly=false}:any){
 const {width}=useWindowDimensions(),cardWidth=width<900?Math.min(320,width-56):Math.min(620,Math.max(400,(width-156)/2.5));
 return <Button card focusKey={focusKey} onFocus={onFocus} style={{width:cardWidth}} onPress={()=>onChoose(pair)}>
  <View style={{height:cardWidth*.62,backgroundColor:'#0B1019',overflow:'hidden'}}>
   <Image accessibilityLabel={pair.show.name+' artwork'} source={watchArt(pair.show,true)} resizeMode="cover" style={{width:'100%',height:'100%'}}/>
   <LinearGradient pointerEvents="none" colors={['transparent','#090E18B0']} style={StyleSheet.absoluteFill}/>
   {!titleOnly&&!!mealPhotos[pair.meal.mainMealId||pair.meal.id]&&<View style={{position:'absolute',right:14,bottom:14,width:'52%',aspectRatio:1.4,borderRadius:14,borderWidth:2,borderColor:'#E9D5BE',overflow:'hidden',backgroundColor:'#101827'}}><RecipeArt meal={pair.meal} resizeMode="cover" style={{width:'100%',height:'100%'}}/></View>}
  </View>
  <View style={{padding:20,backgroundColor:'#121B29',gap:10,minHeight:190}}><Text numberOfLines={2} style={{color:'#FFF8F0',fontSize:28,lineHeight:36,fontWeight:'800'}}>{pair.show.name}</Text>{!titleOnly&&<Text numberOfLines={2} style={{color:'#FFD8BC',fontSize:24,lineHeight:32}}>{pair.meal.shortName||pair.meal.name}</Text>}<Text style={{color:'#BECBDC',fontSize:22,lineHeight:30}}>{!titleOnly?pair.meal.minutes+' min cook · ':''}{pair.show.minutes} min watch</Text>{!titleOnly&&<WatchBites meal={pair.meal} compact/>}</View>
 </Button>;
}
export function Discover({onOurNight,house,prefs,options,watchArt,onChoose,onDetails,onPreferences,onSearch,onOpenNight,onGroup,onKitchen,onPantry,onSurprise,onReplay,onNewStory,onFeature,onChangeDinner,onChangeShow,onQuickPick,busy}:any){
 const {width}=useWindowDimensions(),wide=width>=900;
 const requestKey=JSON.stringify({household:house.id,prefs,memory:house.memory,pantry:house.pantry,options}),entry=tonightEntry(requestKey);
 const [result,setResult]=useState<any>(entry.result),[pending,setPending]=useState(!entry.result),[catalog,setCatalog]=useState<any[]>([]),[error,setError]=useState(''),[retry,setRetry]=useState(0),[more,setMore]=useState(false),[featuresExpanded,setFeaturesExpanded]=useState(false);
 useEffect(()=>{let active=true;setResult(entry.result);setPending(!entry.result);setError('');setCatalog([]);
  Promise.allSettled([entry.load(()=>api('recommendations','POST',{prefs,options,refresh:retry>0})),api('browse','POST',{prefs,options})]).then(([personal,browse])=>{if(!active)return;if(personal.status==='fulfilled')setResult(personal.value);if(browse.status==='fulfilled')setCatalog(browse.value.picks||[]);if(personal.status==='rejected'||browse.status==='rejected')setError('Some evening picks could not load. You can retry or search for a title.');setPending(false);});return()=>{active=false;};
 },[requestKey,retry]);
 const choices=result?.requestKey===requestKey?result.picks||[]:[],all=[...choices,...catalog];
 const spotlight=chooseSpotlight(all,(meal:any)=>!!mealPhotos[meal.mainMealId||meal.id],(meal:any)=>reviewedDishImages.has(meal.mainMealId||meal.id));
 const resume=resumeEvening(house.nights);
 const favorites=house.nights.filter((n:any)=>n.feedback?.meal==='again'&&n.feedback?.pairing!=='miss').map((n:any)=>({meal:mealById(n.mealId),show:n.show||shows.find((x:any)=>x.id===n.showId),saved:n,preservedDinner:{adapted:n.adapted,prefs:n.prefs},adapted:n.adapted})).filter((p:any)=>p.show&&p.meal);
 const rows=cinemaRows(all,favorites,(meal:any)=>!!mealPhotos[meal.mainMealId||meal.id]);
 const refresh=()=>{entry.clear();setRetry(v=>v+1);};
 const featurePreviews=<View testID="remote-row-make-it-yours" style={{marginHorizontal:wide?52:24,marginVertical:28,gap:18}}><View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:16}}><Text style={[b.h2,{flex:1}]}>Make tonight yours</Text><Button compact quiet focusKey="features-expand" selected={featuresExpanded} onPress={()=>setFeaturesExpanded(v=>!v)}>{featuresExpanded?'Show fewer':'Explore more →'}</Button></View><View style={{flexDirection:'row',flexWrap:'wrap',gap:20}}>{homeFeatures.slice(0,featuresExpanded?homeFeatures.length:2).map(feature=><HomeFeatureCard key={feature.id} feature={feature} style={{width:wide?'48%':'100%'}} onPress={()=>onFeature(feature.id,spotlight)}/>)}</View></View>;
 return <BrowseScroll memoryKey="discover" contentContainerStyle={{paddingBottom:70,backgroundColor:'#080C16'}}>
  {spotlight?<PairingHero pantry={house.pantry} onChangeShow={onChangeShow} prefs={prefs} onChangeDinner={onChangeDinner} pair={spotlight} watchArt={watchArt} onChoose={(p:any)=>p.saved?onReplay(p.saved):onChoose(p)} onDetails={onDetails}/>:<View style={[b.empty,{minHeight:360,justifyContent:'center'}]}><Text style={b.kicker}>YOUR EVENING STARTS HERE</Text><Text style={b.h2}>{pending?'Finding your kind of night…':'What works for tonight?'}</Text><Text style={b.meta}>Dinner and something to watch, planned together.</Text><View style={b.actions}><Button primary onPress={()=>onSearch('watch')}>Find a movie or show</Button><Button onPress={onSurprise}>Surprise me</Button></View></View>}
  <TonightShortcuts prefs={prefs} onChoose={onQuickPick} busy={busy||pending}/>
  {resume&&<View testID="remote-row-resume" style={{marginHorizontal:wide?52:24,marginBottom:28,padding:18,borderRadius:14,backgroundColor:'#172333',flexDirection:'row',alignItems:'center',gap:18}}><View style={{width:4,alignSelf:'stretch',backgroundColor:'#B7E8D2',borderRadius:4}}/><View style={{flex:1}}><Text style={{color:'#B7E8D2',fontSize:20}}>PICK UP YOUR EVENING</Text><Text numberOfLines={1} style={{color:'#FFF',fontSize:26,fontWeight:'700'}}>{resume.show?.name||'Your saved plan'}</Text></View><Button compact quiet focusKey={'resume'+resume.id} onPress={()=>onOpenNight(resume)}>{nextCookingLabel(resume)} →</Button></View>}

  {rows.map((row:any,index:number)=><React.Fragment key={row.id}><Rail id={row.id} title={row.title} subtitle={row.subtitle}>{row.pairs.map((p:any)=><EveningCard key={p.show.id+p.meal.id} pair={p} watchArt={watchArt} onChoose={p.saved?()=>onReplay(p.saved):onDetails} focusKey={row.id+p.show.id+p.meal.id}/>)}</Rail>{index===0&&<><View style={{marginHorizontal:wide?52:24,marginVertical:20,padding:24,borderRadius:22,backgroundColor:'#2D2030',borderWidth:1,borderColor:'#785565',gap:12}}><Text style={{fontSize:28,color:'#FFE2CF',fontWeight:'700'}}>Our night in</Text><Text style={{fontSize:22,lineHeight:30,color:'#DAC8D6'}}>A little less planning. A little more us.</Text><Button compact quiet onPress={onOurNight}>Plan time for two →</Button></View>{featurePreviews}</>}</React.Fragment>)}
  {!rows.length&&<><View style={{marginHorizontal:wide?52:24,marginVertical:20,padding:24,borderRadius:22,backgroundColor:'#2D2030',borderWidth:1,borderColor:'#785565',gap:12}}><Text style={{fontSize:28,color:'#FFE2CF',fontWeight:'700'}}>Our night in</Text><Text style={{fontSize:22,lineHeight:30,color:'#DAC8D6'}}>A little less planning. A little more us.</Text><Button compact quiet onPress={onOurNight}>Plan time for two →</Button></View>{featurePreviews}</>}
  {!pending&&!all.length&&<View style={b.empty}><Text style={b.meta}>{error||emptyMatchAdvice(prefs).text}</Text><Button onPress={()=>onPreferences()}>{emptyMatchAdvice(prefs).action}</Button></View>}
  {!!favorites.length&&<View testID="remote-row-repeat-dinner" style={{marginHorizontal:wide?52:24,marginBottom:28,padding:24,borderRadius:20,backgroundColor:'#142A2A',borderWidth:1,borderColor:'#47776A',gap:12}}><Text style={{fontSize:20,color:'#AEE2C9',fontWeight:'800'}}>ONE LESS DECISION</Text><Text style={{fontSize:30,lineHeight:40,color:'#FFF3E6'}}>A dinner you already liked.</Text><Text style={{fontSize:24,lineHeight:34,color:'#D4E4DE'}}>{favorites[0].meal.name}</Text><Button compact onPress={()=>onNewStory(favorites[0].saved)}>Make it again · find a new show →</Button></View>}
  <View testID="remote-row-discovery-tools" style={{marginHorizontal:wide?52:24,paddingTop:24,borderTopWidth:1,borderColor:'#2C384B',gap:18}}>
   <View style={b.actions}><Button compact quiet onPress={()=>onSearch('watch')}>Search titles</Button><Button compact quiet onPress={()=>onSearch('food')}>Start with dinner</Button><Button compact quiet disabled={pending} onPress={refresh}>{pending?'Finding evenings…':'Fresh suggestions'}</Button><Button compact quiet selected={more} onPress={()=>setMore(!more)}>{more?'Less':'More ways to plan'}</Button></View>
   {more&&<View style={b.actions}><Button onPress={onPantry}>Use my pantry</Button><Button onPress={onGroup}>Choose our adventure</Button><Button onPress={onSurprise}>Surprise me</Button><Button onPress={onKitchen}>Food & household settings</Button></View>}
   {!!error&&<Text style={b.small}>{error}</Text>}
  </View>
 </BrowseScroll>;
}
export function PairingComparison({onBrowseRecipes,onProtein,memory,selectedTitle,selectedShow,onDifferentTitle,discovery,message,source,receipt,picks,prefs,region,onChoose,onBack,onDetails,refinements,timeAlternative,onTimeAlternative,watchArt}:any){
 const emptyAdvice=emptyMatchAdvice(prefs,selectedShow);const labels=choiceLabels(picks,memory),[active,setActive]=useState(0),[more,setMore]=useState(false);
 useEffect(()=>{setActive(0);setMore(false);},[picks.map((p:any)=>p.meal.id+p.show.id).join('|')]);
 const {width,height}=useWindowDimensions(),silk=Platform.OS==='web'&&isSilk(navigator.userAgent),wide=!silk&&width>=1100,short=height<=800;
 const dinnerFirst=picks.length>0&&picks.every((p:any)=>p.meal.id===picks[0].meal.id)&&new Set(picks.map((p:any)=>p.show.id)).size>1,sameTitle=picks.length>0&&picks.every((p:any)=>browseTitleKey(p.show)===browseTitleKey(picks[0].show));
 const visible=silk?picks.slice(Math.min(active,picks.length-1),Math.min(active,picks.length-1)+1):picks;
 return <BrowseScroll memoryKey="pair-comparison" contentContainerStyle={{padding:width<900?20:short?24:40,paddingBottom:120}}>
  <Button compact quiet style={{alignSelf:'flex-start'}} onPress={onBack}>← Preferences</Button>
  <Text style={[b.h2,{marginTop:short?8:24}]}>{dinnerFirst?'Choose what to watch':sameTitle?picks[0].show.name:selectedTitle||(discovery?'Discover an evening':'Choose your evening')}</Text>
  <Text style={b.meta}>{dinnerFirst?picks[0].meal.name:prefs.people+' people · '+prefs.cookTime+' min cooking limit'}</Text>
  {dinnerFirst&&onProtein&&<Button onPress={()=>onProtein(picks[0],true)}>Choose another meal</Button>}
  {silk&&picks.length>1&&<View style={b.actions}>{picks.map((p:any,i:number)=><Button compact key={p.meal.id+p.show.id} selected={active===i} onPress={()=>setActive(i)}>{(dinnerFirst?'Watch ':'Dinner ')+(i+1)}</Button>)}</View>}
  {timeAlternative&&<View style={{backgroundColor:'#192A3D',padding:24,borderRadius:16,marginVertical:20}}><Text style={b.foodName}>{timeAlternative.pair.meal.name}</Text><Text style={b.small}>{timeAlternative.extraMinutes} min above your limit. Other preferences stay the same.</Text><Button onPress={()=>onTimeAlternative(timeAlternative)}>{'Use '+timeAlternative.prefs.cookTime+'-minute limit & review'}</Button></View>}
  {!picks.length?<View style={b.empty}><Text style={b.description}>{message||'No dinners fit these limits.'}</Text><Text style={b.small}>{emptyAdvice.text}</Text><Button primary onPress={emptyAdvice.destination==='choose'&&onDifferentTitle?onDifferentTitle:onBack}>{emptyAdvice.action}</Button></View>:<View style={{flexDirection:wide?'row':'column',gap:24,marginTop:short?12:24}}>{visible.map((p:any)=><View key={p.meal.id+p.show.id} style={[b.comparison,{flex:wide?1:undefined,flexDirection:silk?'row':'column'}]}>
   {dinnerFirst?<Image source={watchArt(p.show,true)} accessibilityLabel={p.show.name} resizeMode="cover" style={silk?{width:'36%',minHeight:320}:{width:'100%',height:short?120:210}}/>:<RecipeArt meal={p.meal} resizeMode="contain" style={silk?{width:'36%',minHeight:320,backgroundColor:'#111927'}:{width:'100%',height:short?120:210,backgroundColor:'#111927'}}/>}
   <View style={{padding:short?16:24,flex:1,gap:short?8:14}}>{!sameTitle&&!dinnerFirst&&<Text style={b.small}>{p.show.name}</Text>}<Text style={b.h3}>{dinnerFirst?p.show.name:p.meal.name}</Text><Text style={b.small}>{dinnerFirst?p.show.minutes+' min watching':cookingTimeLabel(p.meal)}</Text><Text style={b.foodName}>{labels[picks.indexOf(p)].join(' · ')||'Another evening to try'}</Text><Button primary={silk||picks.indexOf(p)===0} compact focusKey={'pick'+p.meal.id+p.show.id} onPress={()=>onChoose(p,'cook')}>Review this evening</Button><Button compact quiet focusKey={'info'+p.meal.id+p.show.id} onPress={()=>onDetails(p)}>Why this evening?</Button>{!dinnerFirst&&<PairingReason compact pair={p}/>}<DinnerDecision pair={p} prefs={prefs}/><CoursePlan meal={p.meal} people={prefs.people} compact/>{onProtein&&<Button compact quiet onPress={()=>onProtein(p,proteinOptions(p.meal,prefs,memory).length===0)}>Change protein or meal</Button>}{dinnerFirst&&<AvailabilityBadge show={p.show} region={region}/>}</View>
  </View>)}</View>}
  <Button quiet onPress={()=>setMore(!more)}>{more?'Hide dinner options':'More dinner options'}</Button>{more&&<>{refinements}<DecisionReceipt receipt={receipt}/>{source==='catalog'&&<Text style={b.small}>Matched from the recipe library using your preferences; no live AI was used.</Text>}{onBrowseRecipes&&<Button onPress={onBrowseRecipes}>Browse more choices</Button>}</>}
  <Text style={b.small}>Recipes are not kitchen-tested. Times are estimates.</Text>{sameTitle&&<AvailabilityBadge show={picks[0].show} region={region}/>}
 </BrowseScroll>;
}

const b=StyleSheet.create({household:{paddingHorizontal:52,paddingVertical:16,flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:12},hero:{overflow:'hidden'},heroLayout:{padding:52,gap:42,alignItems:'center'},heroTitle:{color:'#fff',fontWeight:'900',letterSpacing:-1.5,marginVertical:14},heroMeal:{fontSize:32,color:'#FFC0A3',fontWeight:'800',marginBottom:14},kicker:{color:'#C6D1FF',fontSize:18,fontWeight:'900',letterSpacing:2.3,marginBottom:10},meta:{color:'#E8EDF5',fontSize:28,lineHeight:38,marginVertical:7,fontWeight:'600'},small:{color:'#C8D1DE',fontSize:24,lineHeight:34},description:{color:'#F0F3F8',fontSize:23,lineHeight:34,marginVertical:14},actions:{flexDirection:'row',flexWrap:'wrap',gap:16,marginVertical:18},rail:{paddingLeft:52,marginBottom:44},h2:{color:'#fff',fontSize:38,lineHeight:46,fontWeight:'800',marginBottom:14},h3:{color:'#fff',fontSize:32,lineHeight:40,fontWeight:'800',textShadowColor:'#000',textShadowRadius:8},episode:{color:'#E2E7EF',fontSize:18,lineHeight:25,marginTop:4},foodName:{color:'#FFC0A3',fontSize:30,lineHeight:40,fontWeight:'800'},copy:{padding:19,backgroundColor:'#0D131E'},copyRest:{paddingVertical:15},cardTitleOverlay:{position:'absolute',left:18,right:156,bottom:16},focusHint:{color:'#EEF3FF',fontSize:18,fontWeight:'800',marginTop:7},eveningCard:{width:420,gap:10,minHeight:310},infoButton:{alignSelf:'stretch',justifyContent:'center',minHeight:58},smallDish:{position:'absolute',right:14,bottom:12,width:122,height:98,borderRadius:12,borderWidth:2,borderColor:'#ffffff88'},cardBadge:{position:'absolute',left:12,top:12,backgroundColor:'#05070BEF',color:'#fff',paddingHorizontal:12,paddingVertical:8,borderRadius:18,fontSize:20,fontWeight:'900',letterSpacing:.8},hubs:{flexDirection:'row',flexWrap:'wrap',gap:14,paddingHorizontal:52,marginBottom:38},footer:{margin:52,padding:36,backgroundColor:'#111A29',borderRadius:18},empty:{padding:52,gap:16},availability:{paddingVertical:14,minHeight:64},availabilityText:{color:'#C8D4FF',fontSize:20,lineHeight:29},comparison:{backgroundColor:'#0F1622',borderRadius:18,overflow:'hidden',borderWidth:2,borderColor:'#45597A'},progress:{height:5,backgroundColor:'#304264',marginTop:10,borderRadius:3}});



