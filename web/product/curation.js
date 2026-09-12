import {titleKey,distinctShows} from './identity.js';
import {pantryMatches} from './ingredients.js';
import {meals,shows} from './catalog.js';
import {ingredients} from './engine.js';
import {dietFits} from './diets.js';
import {pairingAffinity} from './pairing-affinity.js';
export {pairingAffinity} from './pairing-affinity.js';
export const connectionModes=['Mood','Setting','On-screen food'];
const firstSentence=value=>{const clean=String(value||'').replace(/\s+/g,' ').trim();if(!clean)return '';const match=clean.match(/^.*?[.!?](?:\s|$)/);return (match?match[0]:clean).slice(0,220);};
const ingredientPhrase=meal=>meal.ingredients.slice(0,2).map(i=>i[0].toLowerCase()).join(' and ');
const practicalFit=(meal,show)=>`${meal.minutes} minutes of cooking fits before the ${show.minutes}-minute ${show.kind==='TV episode'?'episode':'movie'}, so the food supports the plan as well as the mood.`;
export function connection(meal,show){
 const id=Number(show.provider?.id)||Number(show.id?.split('-').at(-1));
 const angle=id===24428||show.id==='avengers'?'The Avengers is built around very different heroes learning to act as one':id===120467||show.id==='grand-budapest'?'The Grand Budapest Hotel turns hospitality, ceremony and meticulous presentation into part of its world':show.id==='detectorists'?'Detectorists finds warmth in patient friendship and the quiet rhythms of the countryside':show.id==='before-sunrise'?'Before Sunrise lets conversation and an unhurried evening become the main event':null;
 const rat=show.id==='ratatouille'||show.provider?.id===2062||show.id==='tmdb-movie-2062';
 if(rat&&meal.id==='story-ratatouille'){const storyCue='Ratatouille places cooking, craft and a version of ratatouille at the center of the story.',tableEcho='Making our rustic vegetable version turns watching into a small act of cooking along, while staying clear that it is not Remy’s confit byaldi recipe.',fit=practicalFit(meal,show);return {kind:'On-screen food',storyCue,tableEcho,practicalFit:fit,text:`${storyCue} ${tableEcho} ${fit}`,source:'https://www.pbs.org/food/stories/get-creative-pixar-style-ratatouille'};}
 const storyCue=angle?angle+'.':firstSentence(show.description)||`${show.name} is presented as a ${String(show.genre||show.mood).toLowerCase()} ${show.kind==='TV episode'?'episode':'movie'}.`;
 const ingredients=ingredientPhrase(meal),sharedMood=meal.moods.includes(show.mood),format=String(meal.category||meal.cuisine||'supper').toLowerCase();
 if(show.cuisine&&show.cuisine!=='Any'&&meal.cuisine===show.cuisine){const tableEcho=`${meal.name} extends the setting through ${meal.cuisine} cuisine, using ${ingredients}; this is a creative interpretation rather than a claim that the dish appears on screen.`,fit=practicalFit(meal,show);return {kind:'Setting',storyCue,tableEcho,practicalFit:fit,text:`${storyCue} ${tableEcho} ${fit}`};}
 const tableEcho=meal.name+' is a practical '+meal.minutes+'-minute dinner option. No direct food connection to this title is claimed.';
 const fit=practicalFit(meal,show);return {kind:'Mood',pairingType:'practical',storyCue:'',tableEcho,practicalFit:fit,text:tableEcho+' '+fit};
}
export function curate({mode,sourceId,prefs,memory={},titles=[],members=[],pantry=[],dinnerAdapted=undefined,connectionMode='Mood'}){
 const pool=distinctShows([...shows.filter(s=>s.source),...titles]);
 const out=[];for(const show of pool){if(mode==='watch'&&titleKey(show)!==titleKey(sourceId))continue;if(show.minutes>prefs.watchTime||(prefs.format!=='Any'&&show.kind!==prefs.format)||(prefs.family&&!show.family))continue;
 for(const meal of meals){if(mode!=='meal'&&!meal.featuredRecipe)continue;if(mode==='meal'&&meal.id!==sourceId)continue;if(meal.minutes>prefs.cookTime||!dietFits(meal,prefs.diet)||(prefs.effort==='Easy'&&meal.effort!=='Easy'))continue;
 if(members.some(m=>(m.vetoes||[]).includes(meal.id+':'+show.id)||(m.vetoTitle&&show.name.toLowerCase().includes(m.vetoTitle.toLowerCase()))))continue;
 const avoided=[...(memory.dislikedIngredients||[]),...members.flatMap(m=>m.avoid||[])];if(ingredients(meal,prefs.people,dinnerAdapted===undefined?(prefs.diet==='Plant-based'||members.some(m=>m.diet==='Plant-based')):dinnerAdapted).some(i=>avoided.some(x=>i.name.toLowerCase().includes(x.toLowerCase()))))continue;
 if(members.some(m=>!dietFits(meal,m.diet)||show.minutes>m.watchTime||(m.format!=='Any'&&m.format!==show.kind)))continue;
 const c=connection(meal,show);if(connectionMode!=='Mood'&&c.kind!==connectionMode)continue;
 const matched=members.filter(m=>show.mood===m.mood||meal.moods.includes(m.mood)).length;
 const mealMatches=members.filter(m=>m.mealPreference&&m.mealPreference!=='Any'&&(meal.category||'').toLowerCase()===m.mealPreference.toLowerCase()).length;
 const pantryFound=pantryMatches(ingredients(meal,prefs.people,dinnerAdapted===undefined?prefs.diet==='Plant-based':dinnerAdapted),pantry).map(i=>i.name);
 const score=pairingAffinity(meal,show)+pantryFound.length*8+matched*40+mealMatches*40+(show.mood===prefs.mood?30:0)+(meal.moods.includes(show.mood)?20:0)+(memory.favoriteMeals?.includes(meal.id)?15:0)+(memory.shorter&&show.minutes<=45?25:0)-(memory.dislikedPairs?.includes(meal.id+':'+show.id)?60:0)-(memory.watched?.includes(show.id)?15:0)+(memory.favoriteCuisines?.includes(meal.cuisine)?15:0)-meal.minutes/10;
 out.push({meal,show,score,pantryMatches:pantryFound,connection:c,tradeoff:`Allow ${meal.minutes+show.minutes} minutes plus eating time if cooking before watching. ${meal.recipeNote||'Cooking times are estimates.'}`,ritual:'Finish the cooking, set the table, then start your movie or episode.',reasons:[c.text,members.length?`${matched} of ${members.length} mood preferences match. All submitted food, ingredient and viewing limits are respected.`:`${meal.minutes} min cooking · ${show.minutes} min viewing`]});}}
 return out.sort((a,b)=>b.score-a.score);
}
export function scheduleDinner(night,meal,dinnerAt,dinnerMinutes=25,now=Date.now()){
 const at=Date.parse(dinnerAt);if(!Number.isFinite(at)||at<now||at>now+7*86400000||!Number.isInteger(dinnerMinutes)||dinnerMinutes<10||dinnerMinutes>120)throw Error('Choose a future dinner time within seven days and 10–120 minutes at the table.');
 const start=at-meal.minutes*60000;if(start<now)throw Error('There is not enough cooking time before dinner. Choose a later time or a faster recipe.');
 return {...night,planStart:start,dinnerAt:at,dinnerMinutes};
}

export function discoveryCandidates(pairs,house,{surprise=false,excludeShowId='',seed=''}={}){
 const seenShows=new Set([...(house.memory?.watched||[]),...(house.nights||[]).map(n=>n.showId)].map(titleKey)),seenMeals=new Set((house.nights||[]).map(n=>n.mealId));
 let result=pairs.filter(p=>titleKey(p.show)!==titleKey(excludeShowId));
 if(!surprise)return result;
 result=result.filter(p=>!seenShows.has(titleKey(p.show))&&!(house.memory?.dislikedPairs||[]).includes(p.meal.id+':'+p.show.id));
 const rank=p=>{let hash=0;for(const c of seed+p.meal.id+p.show.id)hash=(hash*31+c.charCodeAt(0))>>>0;return (seenMeals.has(p.meal.id)?0:100000)+hash%10000;};
 return result.sort((a,b)=>rank(b)-rank(a)).map(p=>({...p,discoveryReason:`${p.show.name} is not in your saved viewing history. ${seenMeals.has(p.meal.id)?'A dinner you have planned before, with a different story.':p.meal.name+' is also new to your saved evenings.'} Your food, cooking effort and time limits still apply.`}));
}
export function compromiseFacts(pair,members){return members.map(m=>({id:m.id,name:m.name,mood:m.mood,moodMatched:pair.show.mood===m.mood||pair.meal.moods.includes(m.mood),mealPreference:m.mealPreference||'Any',mealMatched:!m.mealPreference||m.mealPreference==='Any'||(pair.meal.category||'').toLowerCase()===m.mealPreference.toLowerCase(),limits:`${pair.show.minutes} of ${m.watchTime} viewing minutes; ${m.diet}; submitted vetoes respected.`}));}

export function groupFits(night,meal,show,people,adapted=night.adapted){
 const members=night.group?.members||[];
 return people>=members.length&&!members.some(m=>!dietFits(meal,m.diet)||(m.diet==='Plant-based'&&!adapted)||show.minutes>m.watchTime||(m.format!=='Any'&&m.format!==show.kind)||(m.vetoes||[]).includes(meal.id+':'+show.id)||(m.vetoTitle&&show.name.toLowerCase().includes(m.vetoTitle.toLowerCase()))||ingredients(meal,people,adapted).some(i=>(m.avoid||[]).some(x=>i.name.toLowerCase().includes(x))));
}

export function groupAlternatives(ranked,members){
 const metrics=p=>{const f=compromiseFacts(p,members),scores=f.map(m=>Number(m.moodMatched)+Number(m.mealMatched));return {total:scores.reduce((a,b)=>a+b,0),minimum:Math.min(...scores),both:f.filter(m=>m.moodMatched&&m.mealMatched).length};};
 const strategies=[{label:'Best overall agreement',sort:(a,b)=>metrics(b).total-metrics(a).total||b.score-a.score},{label:'Least individual compromise',sort:(a,b)=>metrics(b).minimum-metrics(a).minimum||metrics(b).both-metrics(a).both||b.score-a.score},{label:'Fastest dinner',sort:(a,b)=>a.meal.minutes-b.meal.minutes||metrics(b).total-metrics(a).total}];
 const selected=[];
 for(const strategy of strategies){const remaining=ranked.filter(p=>!selected.some(x=>x.meal.id===p.meal.id&&titleKey(x.show)===titleKey(p.show)));const distinct=remaining.filter(p=>!selected.some(x=>x.meal.id===p.meal.id||titleKey(x.show)===titleKey(p.show)));const differentMeals=remaining.filter(p=>!selected.some(x=>x.meal.id===p.meal.id));const candidates=(distinct.length?distinct:differentMeals.length?differentMeals:remaining).sort(strategy.sort);if(!candidates.length)continue;const best=candidates[0],m=metrics(best),label=strategy.label==='Fastest dinner'?'Quickest remaining option':strategy.label;selected.push({...best,strategy:label,strategyDetail:`${selected.length?'Among remaining distinct alternatives: ':''}${m.total} of ${members.length*2} mood and meal-style preferences met; ${m.both} people have both matched. ${best.meal.minutes} minutes cooking.`});}
 return selected;
}
