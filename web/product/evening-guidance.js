// Factual decision copy shared by browser, TV and phone; never relaxes preferences.
export function eveningFit(meal,show,prefs={}){
 const total=meal.minutes+25+show.minutes;
 const facts=[`${meal.minutes}-minute dinner`,meal.effort==='Easy'?'Easy cooking':`${meal.steps?.length||0} recipe steps`];
 if(prefs.eveningMinutes>0)facts.push(total<=prefs.eveningMinutes?`Fits your ${prefs.eveningMinutes}-minute evening`:`${total-prefs.eveningMinutes} min over your evening limit`);
 else facts.push(`${total} min including dinner and viewing`);
 return facts.join(' · ');
}
export function emptyMatchAdvice(prefs={},show){
 if(show&&prefs.family&&!show.family)return {text:'This title is not marked family-friendly in the catalog. Choose another title to keep your family filter.',action:'Choose a different title',destination:'choose'};
 if(show&&prefs.format&&prefs.format!=='Any'&&show.kind!==prefs.format)return {text:`You selected a ${show.kind.toLowerCase()}, but your format filter is ${prefs.format.toLowerCase()}. Review the format or choose another title.`,action:'Review viewing format',destination:'preferences'};
 if(show&&show.minutes>prefs.watchTime)return {text:`This title runs ${show.minutes} minutes; your viewing limit is ${prefs.watchTime}. Choose a shorter title or explicitly increase viewing time.`,action:'Review viewing time',destination:'preferences'};
 if(show&&prefs.eveningMinutes>0&&show.minutes+25>=prefs.eveningMinutes)return {text:`This title and 25 minutes for dinner use ${show.minutes+25} minutes before cooking. Your whole-evening limit is ${prefs.eveningMinutes} minutes. Choose a shorter watch or review that limit.`,action:'Review whole-evening time',destination:'preferences'};
 return {text:`No pairing meets every current choice. Cooking is limited to ${prefs.cookTime||30} minutes${prefs.eveningMinutes?`, with ${prefs.eveningMinutes} minutes for the whole evening`:''}. Try a different title or review time and format. Food exclusions remain active.`,action:'Review time & format',destination:'preferences'};
}
export function nextCookingLabel(night){return night.fulfillment==='delivery'?'View delivery plan':night.status==='planned'?'Check ingredients':night.status==='cooking'?'Continue cooking':night.status==='ready'||night.status==='complete'?'View cooking steps':'Open evening';}

export function changeDinnerDraft(draft,showId,mealId){return {...draft,mode:'watch',sourceId:showId,pair:null,ai:null,demoId:null,themeId:null,themedMealId:null,confirmed:[],excludedDinnerIds:[...new Set([...(draft.sourceId===showId?draft.excludedDinnerIds||[]:[]),mealId])]};}
