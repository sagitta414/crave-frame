export function eveningTimeline(night,meal,show){
 meal={...meal,minutes:meal.minutes+(night.fulfillment==='delivery'?0:Number(night.timingAllowanceMinutes)||0)};
 if(night.fulfillment==='delivery'&&night.orderPlan){
  const order=night.orderPlan,dinner=night.dinnerMinutes||25,watch=night.watchStarted||order.watchAt;
  return [{label:'Order marked placed',at:order.orderAt,minutes:5},{label:'Estimated delivery window',at:order.orderAt+5*60000,minutes:Math.max(0,order.etaMinutes-5)},{label:'Sit down to dinner',at:order.arrivalAt,minutes:dinner},{label:'Start watching',at:watch,minutes:show.minutes},{label:'Evening finishes',at:watch+show.minutes*60000,minutes:0}];
 }
 const plannedStart=night.planStart||Date.parse(night.created),start=Number(night.cookingStartedAt)||Math.min(plannedStart,Number(night.readyAt)||plannedStart),prep=Math.min(10,Math.max(3,Math.round(meal.minutes/4))),dinner=night.dinnerMinutes||25;
 return [{label:'Prep your ingredients',at:start,minutes:prep},{label:'Cook supper',at:Math.min(start+prep*60000,Number(night.readyAt)||Infinity),minutes:meal.minutes-prep},{label:'Sit down to dinner',at:Number(night.readyAt)||start+meal.minutes*60000,minutes:dinner},{label:'Start watching',at:night.watchStarted||start+(meal.minutes+dinner)*60000,minutes:show.minutes},{label:'Evening finishes',at:(night.watchStarted||start+(meal.minutes+dinner)*60000)+show.minutes*60000,minutes:0}];
}
export const orderOutChoices=[25,35,50];
export function orderBrief(meal,prefs={}){
 const people=Math.max(1,Math.min(8,Number(prefs.people)||1)),diet=prefs.diet||'Any',name=meal.name,cuisine=meal.cuisine||meal.category||'Local';
 const protein=/tuna/i.test(name)?'tuna':/salmon/i.test(name)?'salmon':/chicken/i.test(name)?'chicken':/beef/i.test(name)?'beef':/tofu/i.test(name)?'tofu':'';
 let alternatives=/quesadilla/i.test(name)?[name,'quesadillas','Mexican family meals']:/taco/i.test(name)?[name,'tacos','taco platters']:/curry/i.test(name)?[name,'curry','curry family meals']:/rice|grain|couscous|quinoa.*bowl/i.test(name)?[(protein?protein+' ':'')+'rice bowls','rice bowls','rice bowl platters']:/pizza|flatbread/i.test(name)?[name,'pizza and flatbread','pizza bundles']:/pasta|spaghetti/i.test(name)?[name,'pasta','pasta trays']:/noodle/i.test(name)?[name,'noodle dishes','noodle platters']:/soup|chowder/i.test(name)?[name,'soup','soup and sandwiches']:[name,meal.category||name,(meal.category||name)+' platters'];
 alternatives=[...new Set(alternatives)];
 const low=Math.max(24,people*14),high=Math.max(40,people*24);
 return {people,diet,budget:`$${low}–$${high}`,strategies:[
  {id:'closest',label:'Similar dish search',query:alternatives[0],detail:`Search terms based on ${name}. Check the actual menu before choosing.`},
  {id:'fastest',label:'Broader search',query:alternatives[1]||alternatives[0],detail:'Explore a broader category. Compare availability and delivery times in the provider app.'},
  {id:'group',label:'Sharing search',query:alternatives[2]||alternatives[0],detail:`Search for shareable portions for ${people}; confirm portion sizes with the restaurant.`}
 ]};
}
export function orderOutEvening(night,meal,show,etaMinutes=35,now=Date.now(),estimateAt=now){
 if(night.status!=='planned'||night.watchStarted)throw Error('Order-out changes are available before cooking or viewing begins.');
 if(!Number.isInteger(etaMinutes)||etaMinutes<15||etaMinutes>120)throw Error('Enter a delivery estimate from 15 to 120 minutes.');
 const baseNight={...night,planStart:night.scheduleChange?.kind==='order-out'?night.scheduleChange.previousStart:night.planStart,fulfillment:null,orderPlan:null},current=eveningTimeline(baseNight,meal,show),previousWatchAt=current[3].at,arrivalAt=estimateAt+etaMinutes*60000,watchAt=Math.max(previousWatchAt,arrivalAt+(night.dinnerMinutes||25)*60000),shiftMinutes=Math.max(0,Math.ceil((watchAt-previousWatchAt)/60000));
 return {...night,fulfillment:'delivery',planStart:now,orderPlan:{etaMinutes,orderAt:now,arrivalAt,watchAt,previousWatchAt},scheduleChange:{kind:'order-out',minutes:shiftMinutes,previousStart:baseNight.planStart||Date.parse(night.created),planStart:now,previousWatchAt,watchAt,at:new Date(now).toISOString()}};
}
export function readyTogetherPlan(night,meal,show,steps=[],now=Date.now()){
 const base=eveningTimeline(night,meal,show),schedule=base.map(item=>({...item}));
 if(night.watchStarted)return {schedule,shiftMinutes:0,state:'watching'};
 let dinnerAt=base[2].at;
 if(night.status==='cooking'){
  const list=steps.length?steps:[{}],weights=list.map(step=>Math.max(60,Number(step.seconds)||0)),total=weights.reduce((sum,value)=>sum+value,0),durations=weights.map(value=>(meal.minutes+(Number(night.timingAllowanceMinutes)||0))*60000*value/total),current=Math.min(list.length-1,Math.max(0,night.step||0)),later=durations.slice(current+1).reduce((sum,value)=>sum+value,0),anchor=Number(night.progressAt)||Number(night.planStart)||now;
  const projected=night.timer?Math.max(night.timer,now)+later:anchor+durations.slice(current).reduce((sum,value)=>sum+value,0);
  dinnerAt=Math.max(dinnerAt,projected,now);
 }else if(night.status==='ready'||night.status==='complete')dinnerAt=Number(night.readyAt)||now;
 if(night.status==='cooking')dinnerAt=Math.max(dinnerAt,Number(night.servingNotBefore)||0);
 const watchAt=Math.max(base[3].at,dinnerAt+(night.dinnerMinutes||25)*60000),shift=Math.max(0,watchAt-base[3].at);
 schedule[2].at=dinnerAt;schedule[3].at=watchAt;schedule[4].at=watchAt+show.minutes*60000;
 return {schedule,shiftMinutes:Math.ceil(shift/60000),state:night.status==='planned'?'waiting':night.status==='cooking'?'cooking':'ready'};
}
export const delayChoices=[15,30,45,60];
export function delayEvening(night,minutes,now=Date.now(),servingAt=now){
 if(!['planned','cooking'].includes(night.status)||night.watchStarted)throw Error('Delay changes are available before dinner is ready or viewing begins.');
 if(!delayChoices.includes(minutes))throw Error('Choose a 15, 30, 45, or 60 minute delay.');
 if(night.status==='cooking')return {...night,servingNotBefore:Math.max(Number(night.servingNotBefore)||0,servingAt,now)+minutes*60000,scheduleChange:{kind:'cooking-delay',minutes,at:new Date(now).toISOString()}};
 const savedStart=Number(night.planStart||Date.parse(night.created)),previousStart=Number.isFinite(savedStart)?savedStart:now,planStart=Math.max(previousStart,now)+minutes*60000;
 return {...night,planStart,scheduleChange:{kind:'delay',minutes,previousStart,planStart,at:new Date(now).toISOString()}};
}
export const featuredEvenings=[
 {id:'assemble',title:'Assemble at the table',showId:'avengers',mealId:'recipe-smoky-black-bean-tacos',mode:'watch',reason:'Build-your-own smoky bean tacos make a sharing supper before the Avengers assemble. Finish eating first, then settle in for the full action movie.'},
 {id:'paris',title:'A little Paris in your kitchen',showId:'ratatouille',mealId:'pepper-pasta',mode:'meal',reason:'Roasted peppers, basil and a hands-on sauce bring cooking to the center of the evening, echoing Ratatouille’s love of making food. This is an inspired pairing, not a dish from the film.'},
 {id:'quiet',title:'A quieter kind of treasure',showId:'detectorists',mealId:'mushroom-toast',mode:'watch',reason:'Earthy mushroom toast suits Detectorists’ gentle countryside atmosphere. Its 29-minute first episode leaves room for an unhurried dinner on a weeknight.'}
];

export function isStaleEvening(night,now=Date.now()){
 if(night.feedback||night.status==='complete'||night.watchStarted||night.fulfillment==='delivery')return false;
 const last=Number(night.progressAt||night.cookingStartedAt||night.planStart||Date.parse(night.created));
 return Number.isFinite(last)&&now-last>6*60*60000;
}
