import {ingredients} from './catalog/engine.js';
import {ingredientBlocked} from './catalog/food-restrictions.js';
import {dietFits} from './catalog/diets.js';
export function fitReasons(pair,prefs,memory={}){
 const meal=pair.meal,reasons=[];if(Number.isFinite(prefs.cookTime)&&meal.minutes<=prefs.cookTime)reasons.push('Fits your '+prefs.cookTime+'-minute cooking limit');
 const exclusions=[...(memory.allergies||[]),...(memory.dislikedIngredients||[])];
 if(exclusions.length&&dietFits(meal,prefs.diet)&&!ingredients(meal,prefs.people,!!pair.adapted).some(i=>ingredientBlocked(i.name,memory)))reasons.push('Matches your saved ingredient exclusions');
 if(memory.favoriteMeals?.includes(meal.id))reasons.push('A dinner you saved as a favorite');
 else if(memory.favoriteCuisines?.includes(meal.cuisine))reasons.push('A cuisine you asked us to remember');
 return reasons.slice(0,3);
}
export function repeatPreferences(saved,current){return {...saved,diet:current.diet??saved.diet,family:current.family??saved.family,cookLevel:current.cookLevel??saved.cookLevel};}
export function changeSummary(before,after,night,option){const delta=before.minutes-after.minutes;return [delta>0?delta+' minutes less cooking':delta<0?(-delta)+' minutes more cooking':'Cooking time unchanged',option.showId===night.showId?'Your movie or episode stays':null,option.people===night.prefs.people?'Servings unchanged':null].filter(Boolean).join(' · ');}
