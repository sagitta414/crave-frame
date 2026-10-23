import {signatureFor} from './catalog/signature-evenings.js';
import {browseTitleKey} from './catalog/identity.js';
const flagshipMeals=new Set(['tomato-pasta','margherita','grilled-cheese-soup','chicken-pepper-tacos','chicken-basil-pasta','beef-rice-bowls','salmon-lemon-pasta','tuna-rice-bowls']);
// Choose only from already eligible results; presentation never relaxes food/time filters.
export function chooseSpotlight(pairs,hasPhoto,reviewed=(meal)=>false){
 const valid=pairs.filter(p=>p?.meal&&p?.show);
 const photographed=valid.filter(p=>hasPhoto(p.meal));
 const candidates=photographed.length?photographed:valid;
 const score=p=>(signatureFor(p.meal,p.show)?3:0)+(reviewed(p.meal)?4:0)+((p.meal.shortName||p.meal.name).length<=38?2:0)+(p.meal.familiar?1:0);
 return [...candidates].sort((a,b)=>score(b)-score(a))[0];
}
export function eveningPalette(show){return ({Cozy:'#FFD2AA',Romantic:'#E9B4D6',Adventure:'#A4CFFF',Lighthearted:'#B7E8D2',Thoughtful:'#CDBEFF'})[show?.mood]||'#FFD2AA';}
export function cinemaRows(pairs,favorites=[],hasPhoto=(meal)=>false){
 const claimed=new Set(),shelfMeals=new Set();
 const unique=(items,limit=6,repeat=false)=>{
  const groups=new Map();for(const p of items){if(!p?.meal||!p?.show)continue;const key=browseTitleKey(p.show);if(!repeat&&claimed.has(key))continue;groups.set(key,[...(groups.get(key)||[]),p]);}
  const usedMeals=new Set(),usedCategories=new Set(),selected=[];
  for(const candidates of groups.values()){
   const score=p=>(!usedMeals.has(p.meal.id)?8:0)+(!shelfMeals.has(p.meal.id)?12:0)+(hasPhoto(p.meal)?3:0)+(p.meal.category&&!usedCategories.has(p.meal.category)?2:0)+(p.meal.familiar?1:0);
   const pick=[...candidates].sort((a,b)=>score(b)-score(a))[0];selected.push(pick);if(!repeat)claimed.add(browseTitleKey(pick.show));usedMeals.add(pick.meal.id);if(!repeat)shelfMeals.add(pick.meal.id);if(pick.meal.category)usedCategories.add(pick.meal.category);if(selected.length===limit)break;
  }return selected;
 };
 return [
  {id:'for-you',title:'Picked for your evening',pairs:unique(pairs,3)},
  {id:'everyday',title:'Familiar dinners for tonight',subtitle:'Simple favorites within your preferences. Cooking times are estimates.',pairs:unique(pairs.filter(p=>flagshipMeals.has(p.meal.id)&&hasPhoto(p.meal)),4)},
  {id:'quick-night',title:'A complete evening in an hour',subtitle:'Includes 25 minutes to sit down and eat.',pairs:unique(pairs.filter(p=>p.show.kind==='TV episode'&&p.meal.minutes+25+p.show.minutes<=60))},
  {id:'date-night',title:'Make a night of it',subtitle:'Romantic stories, with dinner already considered.',pairs:unique(pairs.filter(p=>p.show.mood==='Romantic'))},
  {id:'easy',title:'Easy dinners. Great movies.',pairs:unique(pairs.filter(p=>p.meal.minutes<=30&&(p.meal.familiar||p.meal.effort==='Easy')&&p.show.kind==='Movie'))},
  {id:'family',title:'Everyone’s kind of night',pairs:unique(pairs.filter(p=>p.show.family))},
  {id:'episodes',title:'One episode. One good dinner.',pairs:unique(pairs.filter(p=>p.show.kind==='TV episode'&&p.show.minutes<=60))},
  {id:'story',title:'Feeling inspired by the story?',subtitle:'Optional movie-inspired dinners, with the connection explained.',pairs:unique(pairs.filter(p=>['On-screen food','Story inspiration','Setting'].includes(p.connection?.kind)))},
  {id:'more',title:'More evenings to explore',pairs:unique(pairs,12)},
  {id:'favorites',title:'Your saved favorites',pairs:unique(favorites,12,true)}
 ].filter(row=>row.pairs.length);
}
export function refinedPreferences(prefs,pair,kind){
 if(kind==='easy')return {...prefs,effort:'Easy',cookTime:Math.min(prefs.cookTime,30)};
 if(kind==='similar')return {...prefs,mood:pair.show.mood||prefs.mood};
 return {...prefs};
}
