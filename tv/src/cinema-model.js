import {browseTitleKey} from './catalog/identity.js';
export function eveningPalette(show){return ({Cozy:'#FFD2AA',Romantic:'#E9B4D6',Adventure:'#A4CFFF',Lighthearted:'#B7E8D2',Thoughtful:'#CDBEFF'})[show?.mood]||'#FFD2AA';}
export function cinemaRows(pairs,favorites=[],hasPhoto=(meal)=>false){
 const claimed=new Set();
 const unique=(items,limit=6,repeat=false)=>{
  const groups=new Map();for(const p of items){if(!p?.meal||!p?.show)continue;const key=browseTitleKey(p.show);if(!repeat&&claimed.has(key))continue;groups.set(key,[...(groups.get(key)||[]),p]);}
  const usedMeals=new Set(),usedCategories=new Set(),selected=[];
  for(const candidates of groups.values()){
   const score=p=>(!usedMeals.has(p.meal.id)?8:0)+(hasPhoto(p.meal)?3:0)+(p.meal.category&&!usedCategories.has(p.meal.category)?2:0)+(p.meal.familiar?1:0);
   const pick=[...candidates].sort((a,b)=>score(b)-score(a))[0];selected.push(pick);if(!repeat)claimed.add(browseTitleKey(pick.show));usedMeals.add(pick.meal.id);if(pick.meal.category)usedCategories.add(pick.meal.category);if(selected.length===limit)break;
  }return selected;
 };
 return [
  {id:'for-you',title:'Picked for your evening',pairs:unique(pairs,3)},
  {id:'quick-night',title:'Dinner + an episode in an hour',subtitle:'Cooking and viewing together: 60 minutes or less.',pairs:unique(pairs.filter(p=>p.show.kind==='TV episode'&&p.meal.minutes+p.show.minutes<=60))},
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
