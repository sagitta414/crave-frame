export const nightDays=['Any day','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
export const nightVibes=['Unwind together','Playful date','Reconnect','Make it special'];
export const ritualChoices=['Follow tonight’s mood','No prompts',...nightVibes];
export const finishingTouches=['Choose one song together before pressing play.','Set out two glasses and your favorite place settings.','Give tonight a name that only the two of you would understand.'];
export function nightWelcome(day){return day&&day!=='Any day'?`${day}, just us.`:'A little time, just us.';}
export function chosenRitual(config={}){return config.ritualChoice==='No prompts'?null:nightRitual(nightVibes.includes(config.ritualChoice)?config.ritualChoice:config.vibe);}
export function sharedPaceCopy(prefs={}){return prefs.effort==='Easy'||prefs.energy==='Exhausted'?'An easy dinner, with room to make it special.':'Time to make something together, at your own pace.';}
export const coupleEnergy=['Keep it easy','Up for cooking together','Make it special'];
export function repeatEveningDraft(n){return {mode:'meal',sourceId:n.mealId,externalShow:n.show,prefs:{...n.prefs},pair:{mealId:n.mealId,showId:n.showId},adapted:n.adapted,confirmed:[],couplesNight:!!n.ourNight,themeId:n.themeId};}
export function sharedPace(prefs,members){
 const level=Math.min(...members.map(m=>Math.max(0,coupleEnergy.indexOf(m.energy||'Keep it easy'))));
 return {...prefs,...(level===0?{energy:'Exhausted',effort:'Easy',cookTime:Math.min(prefs.cookTime,30)}:level===1?{energy:'Up for cooking'}:{energy:'Make it special'})};
}
export function coupleRoles(swapped=false){return [
 {person:swapped?'Partner 2':'Partner 1',title:'Kitchen lead',task:'Follow the recipe and handle the cooking. Ask for help when you want it.'},
 {person:swapped?'Partner 1':'Partner 2',title:'Set the scene',task:'Set two places, choose a song together, and keep the table ready. No extra recipe needed.'}
 ];}
export function nightPreferences(ritual,memory={}){
 const soft=ritual.vibe==='Playful date'?{mood:'Lighthearted'}:ritual.vibe==='Reconnect'?{mood:'Romantic'}:ritual.vibe==='Make it special'?{energy:'Make it special'}:{energy:'Exhausted',mood:'Cozy'};
 return {...ritual.prefs,...soft,...(memory.preferredEffort==='Easy'?{effort:'Easy'}:{}),...(memory.shorter?{format:'TV episode',watchTime:Math.min(ritual.prefs.watchTime,45)}:{})};
}
export function nightRitual(vibe){
 if(vibe==='Playful date')return {title:'A little play, no pressure',before:'Give tonight’s dinner and show a ridiculous double-feature name.',question:'What tiny adventure would you like us to try next?',after:'Each pick your favorite moment after the credits.'};
 if(vibe==='Reconnect')return {title:'A little room for each other',before:'Settle in at the table. If you both want to, put distractions aside for dinner.',question:'What made you feel cared for this week?',after:'Name one small thing you would enjoy doing together soon.'};
 if(vibe==='Make it special')return {title:'Make an ordinary night an occasion',before:'Set the table and choose a song together while dinner finishes.',question:'Which memory of us would you happily relive?',after:'Give this evening a name in your collection.'};
 return {title:'You don’t have to make a big night of it',before:'Get comfortable, share dinner, and let the day slow down.',question:'What was one good little thing about your day?',after:'Decide whether this dinner deserves another night together.'};
}
export function nightShortlist(pairs,house){
 const favorite=new Set(house.memory?.favoriteMeals||[]),seenMeals=new Set((house.nights||[]).map(n=>n.mealId)),seenShows=new Set([...(house.memory?.watched||[]),...(house.nights||[]).map(n=>n.showId)]);
 const selected=[];
 const take=(pool,label,why)=>{const unused=pool.filter(p=>!selected.some(s=>s.meal.id===p.meal.id||s.show.id===p.show.id));if(unused.length)selected.push({...unused[0],nightLabel:label,nightWhy:why});};
 const easy=[...pairs].sort((a,b)=>Number(b.meal.effort==='Easy')-Number(a.meal.effort==='Easy')||a.meal.minutes-b.meal.minutes);
 const liked=easy.filter(p=>favorite.has(p.meal.id));
 take(liked.length?liked:easy,liked.length?'A familiar favorite':'An easy start',liked.length?'A dinner you marked “make again.”':'One of the lighter cooking choices available within your limits.');
 take(pairs.filter(p=>!seenMeals.has(p.meal.id)&&!seenShows.has(p.show.id)),'Something new','Neither this dinner nor title appears in your saved evening history.');
 take([...pairs].sort((a,b)=>Number(b.meal.effort!=='Easy')-Number(a.meal.effort!=='Easy')||(b.score||0)-(a.score||0)),'A little occasion','Add an optional table ritual to make this choice your own.');
 while(selected.length<3){const before=selected.length;take(pairs,'Another way to spend tonight','A distinct dinner and title within your limits.');if(before===selected.length)break;}
 return selected;
}
export function nightLearning(memory={}){return [memory.favoriteMeals?.length?'Dinners you liked help shape the favorite choice.':'Rate a dinner “make again” to build your favorites.',memory.preferredEffort==='Easy'?'You asked for easier cooking; this shortlist keeps that preference.':null,memory.shorter?'You asked for shorter viewing; episodes are limited to 45 minutes here.':null].filter(Boolean);}
