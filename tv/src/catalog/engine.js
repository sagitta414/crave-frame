import {instructionForLevel} from './cooking-level.js';
import {meals,shows,mealById,showById,defaults} from './catalog.js';
import {featuredEvenings} from './evening.js';
import {dietFits} from './diets.js';
import {pairingAffinity} from './pairing-affinity.js';
import {titleKey} from './identity.js';
import {voteFit} from './planning.js';
export function selectedWatchPrefs(prefs,show){return {...prefs,mood:show.mood,watchTime:Math.max(prefs.watchTime,[30,45,90,120,180,240,360,600].find(n=>n>=show.minutes)||600)};}
export function recommend({mode,sourceId,prefs=defaults,memory={},pantry=[],themedMealId=null,demoId=null,votes=[]}){
 const found=mode==='meal'?mealById(sourceId):showById(sourceId),source=mode==='watch'&&found?{...found,id:sourceId}:found;
 if(!source)return [];
 const candidates=mode==='meal'?shows.filter(s=>prefs.catalog==='Original demo titles'?!s.source&&!s.custom:!!s.source||s.custom):meals;
 const ranked=candidates.map(candidate=>{const meal=mode==='meal'?source:candidate;let show=mode==='meal'?candidate:source;
 if(!dietFits(meal,prefs.diet)||meal.minutes>prefs.cookTime||show.minutes>prefs.watchTime||(prefs.effort==='Easy'&&meal.effort!=='Easy')||(prefs.family&&!show.family)||(prefs.format!=='Any'&&show.kind!==prefs.format))return null;
 if((memory.dislikedIngredients||[]).some(term=>meal.ingredients.some(i=>i[0].toLowerCase().includes(term.toLowerCase()))))return null;
 let score=20;const reasons=[];if(prefs.diet==='No preference'&&meal.foodType)score+=12;
 if(mode==='watch'&&(prefs.pairingStyle||'Atmosphere')==='Atmosphere')score+=pairingAffinity(meal,show);
 if(votes.some(v=>v.veto===meal.id+':'+show.id))return null;
 const fits=voteFit(meal,show,votes);if(fits.length){const count=fits.filter(f=>f.matched).length;score+=count*35;reasons.push(count===fits.length?'Common ground: both mood choices fit this pairing.':'A compromise: '+count+' of '+fits.length+' mood choices fit; review it together.');}
 const demo=featuredEvenings.find(d=>d.id===demoId&&d.mealId===meal.id&&titleKey(d.showId)===titleKey(show));if(demo)show={...show,id:demo.showId};
 if(demo){score+=250;reasons.push(demo.reason);}
 if(memory.favoriteCuisines?.includes(meal.cuisine)){score+=30;reasons.unshift('Your saved taste: '+meal.cuisine+' cuisine inspiration');}
 if(memory.preferredEffort==='Easy'&&meal.effort==='Easy'){score+=20;reasons.unshift('Your saved preference: easier cooking');}
 if(mode==='watch'&&meal.id===themedMealId){score+=300;reasons.push('The inspired pairing you chose for movie night');}
 const style=prefs.pairingStyle||'Atmosphere';
 if(style==='Cuisine inspiration'){if(show.cuisine!=='Any'&&meal.cuisine===show.cuisine){score+=250;reasons.push(meal.cuisine+' cuisine inspiration chosen for this evening');}else reasons.push('A complementary dinner; no direct cuisine connection claimed');}
 if(style==='Practical'){const available=meal.ingredients.filter(x=>pantry.includes(x[0])).length;score+=available*12+(60-meal.minutes);reasons.push(available+' of '+meal.ingredients.length+' ingredients in your saved kitchen');reasons.push(meal.minutes+' minutes of cooking keeps this evening simple');}
 
 if(show.mood===prefs.mood){score+=style==='Atmosphere'?35:10;reasons.push(`Matches your ${prefs.mood.toLowerCase()} mood`);}
 if(meal.moods.includes(show.mood)){score+=style==='Atmosphere'?25:5;reasons.push(`${meal.name} fits the ${show.mood.toLowerCase()} direction for this evening`);}
 reasons.push(`${show.minutes} min to watch · ${meal.minutes} min to cook`);
 if(memory.shorter&&show.kind==='TV episode'&&show.minutes<=45){score+=45;reasons.unshift('Your feedback: shorter episodes under 45 minutes');}
 if(memory.favoriteMeals?.includes(meal.id)){score+=15;reasons.push('A dinner you said you would make again');}
 if(memory.preferredMood===show.mood){score+=8;reasons.push('A mood saved in your household preferences');}
 if(memory.watched?.includes(show.id)){score-=20;reasons.push('You have watched this one before');}
 if(memory.dislikedPairs?.includes(meal.id+':'+show.id)){score-=50;reasons.unshift('You preferred a different pairing last time');}
 return {meal,show,score,reasons:reasons.slice(0,4)};
 }).filter(Boolean).sort((a,b)=>b.score-a.score);
 if(mode==='meal')return ranked.slice(0,3);
 const picks=[],categories=new Set();
 while(picks.length<3&&ranked.length){const alternate=ranked.findIndex(p=>!categories.has(p.meal.category));const [pick]=ranked.splice(alternate<0?0:alternate,1);picks.push(pick);categories.add(pick.meal.category);}
 return picks;
}
export function ingredients(meal,people,adapted){return meal.ingredients.map(([name,amount,unit])=>adapted&&name===meal.swap.from?{name:meal.swap.to,amount:meal.swap.amount*people/2,unit:meal.swap.unit}:{name,amount:amount*people/2,unit});}
export function recipeSteps(meal,adapted,cookLevel='Confident'){return meal.steps.map(([title,instruction,seconds],stepIndex)=>({title,instruction:instructionForLevel(instruction.replace('{fat}',adapted?meal.swap.to.toLowerCase():meal.swap.from.toLowerCase()).replace('{finish}',adapted?meal.swap.to.toLowerCase():meal.swap.from.toLowerCase()),cookLevel,{meal,stepIndex,adapted}),seconds}));}
export function feedbackMemory(memory,night,feedback){const pair=night.mealId+':'+night.showId;return {...memory,dislikedMeals:feedback.meal==='skip'?[...new Set([...(memory.dislikedMeals||[]),night.mealId])]:(memory.dislikedMeals||[]).filter(x=>x!==night.mealId),favoriteCuisines:feedback.rememberCuisine?[...new Set([...(memory.favoriteCuisines||[]),mealById(night.mealId).cuisine])]:memory.favoriteCuisines,preferredEffort:feedback.preferEasy?'Easy':memory.preferredEffort,shorter:feedback.shorter,preferredMood:feedback.rememberMood?night.prefs.mood:memory.preferredMood,favoriteMeals:feedback.meal==='again'?[...new Set([...(memory.favoriteMeals||[]),night.mealId])]:(memory.favoriteMeals||[]).filter(x=>x!==night.mealId),dislikedPairs:feedback.pairing==='miss'?[...new Set([...(memory.dislikedPairs||[]),pair])]:(memory.dislikedPairs||[]).filter(x=>x!==pair),watched:[...new Set([...(memory.watched||[]),night.showId])]};}
