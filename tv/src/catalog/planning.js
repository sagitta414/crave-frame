import {cookingProfile} from './cooking-profile.js';
import {titleKey,distinctShows} from './identity.js';
import {ingredients} from './engine.js';
import {pantryMatches as pantryEvidence} from './ingredients.js';
import {dietFits} from './diets.js';
import {meals,shows,mealById} from './catalog.js';
export function pairingConnection(meal,show){
 if(show.id==='ratatouille'||show.id==='tmdb-movie-2062')return {label:'Cooking inspired',text:'A hands-on dinner echoes this story’s love of cooking. Your selected recipe is an independent pairing, not the film’s recipe.',reference:'On screen: Remy’s ratatouille is a version of confit byaldi.',source:'https://www.pbs.org/food/stories/get-creative-pixar-style-ratatouille'};
 if(show.id==='detectorists'&&meal.name.toLowerCase().includes('mushroom'))return {label:'Setting inspired',text:'Earthy mushrooms evoke the countryside setting of Detectorists. This is an interpretation of the setting, not a claim that the characters eat this dish.',source:show.source};
 if(show.id==='avengers'||show.id==='tmdb-movie-24428')return {label:'Mood pairing',text:'A sharing supper fits the ensemble adventure. Finish dinner before the action starts; no on-screen food connection is claimed.'};
 return {label:'Mood pairing',text:meal.moods.includes(show.mood)?meal.name+' fits the '+show.mood.toLowerCase()+' atmosphere selected for '+show.name+'. This is a mood interpretation.':'A practical companion for '+show.name+', chosen around your evening preferences. No direct food or setting connection is established.'};
}
export function voteFit(meal,show,votes){return (votes||[]).map(v=>({mood:v.mood,matched:show.mood===v.mood||meal.moods.includes(v.mood)}));}
export function rescueOptions(night,request,memory={},extraShows=[],pantry=[]){
 const original=mealById(night.mealId),foundShow=night.show||shows.find(s=>titleKey(s)===titleKey(night.showId)),oldShow=foundShow&&{...foundShow,id:night.showId},dinner=night.dinnerMinutes||25;
 const available=original.minutes+dinner+oldShow.minutes-request.delay;
 const watchPool=distinctShows([oldShow,...shows,...extraShows].filter(s=>s&&(s.source||s.custom||night.prefs.catalog==='Original demo titles')));
 const blocked=[...(memory.dislikedIngredients||[]),...request.missing];
 const out=[];
 for(const meal of meals){const adapted=meal.id===original.id?night.adapted:night.prefs.diet==='Plant-based';
  if(request.easier&&(meal.effort!=='Easy'||(original.effort==='Easy'&&cookingProfile(meal).effortIndex>=cookingProfile(original).effortIndex)))continue;
  if((request.faster&&meal.minutes>=original.minutes)||(!meal.featuredRecipe&&meal.id!==original.id)||meal.minutes>(request.maxCookTime||night.prefs.cookTime)||!dietFits(meal,night.prefs.diet)||meal.minutes>night.prefs.cookTime||(night.prefs.effort==='Easy'&&meal.effort!=='Easy')||ingredients(meal,request.people,adapted).some(i=>blocked.some(b=>i.name.toLowerCase().includes(b.toLowerCase()))))continue;
  for(const show of watchPool){
   if(!request.allowWatchChange&&titleKey(show)!==titleKey(oldShow))continue;
   if(show.minutes>night.prefs.watchTime||(night.prefs.family&&!show.family)||(!request.allowWatchChange&&night.prefs.format!=='Any'&&show.kind!==night.prefs.format))continue;
   const total=meal.minutes+dinner+show.minutes;if(total>available)continue;
   const saved=original.minutes+oldShow.minutes-meal.minutes-show.minutes;
   const pantryMatches=pantryEvidence(ingredients(meal,request.people,adapted),pantry).length;
   const score=(request.preferPantry?pantryMatches*30:0)+(titleKey(show)===titleKey(oldShow)?100:0)+(meal.id===original.id?65:0)+(show.mood===night.prefs.mood?20:0)+(meal.moods.includes(show.mood)?15:0)+(memory.favoriteCuisines?.includes(meal.cuisine)?10:0)-Math.max(0,saved-request.delay)/10;
   const evidence=[titleKey(show)===titleKey(oldShow)?oldShow.name+' stays fixed.':'Watch changes to '+show.name+'.',night.prefs.people+' → '+request.people+' servings; ingredient quantities are recalculated.',original.minutes+' → '+meal.minutes+' min estimated cooking.',original.effort+' → '+meal.effort+' cooking; '+original.steps.length+' → '+meal.steps.length+' recipe steps.'];
   out.push({evidence,adapted,mealId:meal.id,showId:request.allowWatchChange?show.id:night.showId,mealName:meal.name,showName:show.name,mealMinutes:meal.minutes,showMinutes:show.minutes,people:request.people,pantryMatches,minutesSaved:saved,total,score,show,tradeoff:meal.id===original.id?(titleKey(show)===titleKey(oldShow)?'Keep your pairing; update portions and timing.':'Keep dinner and choose a shorter watch.'):(titleKey(show)===titleKey(oldShow)?'Keep your watch and change dinner.':'Change both dinner and the watch to fit.')});
  }
 }
 out.sort((a,b)=>b.score-a.score);const selected=[],used=new Set();
 for(const option of out){const signature=option.mealId+':'+option.showId;if(!used.has(signature)){selected.push(option);used.add(signature);}if(selected.length===3)break;}
 return selected;
}
