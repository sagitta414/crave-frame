export function eveningTimeline(night,meal,show){
 if(night.fulfillment==='delivery'&&night.orderPlan){
  const order=night.orderPlan,dinner=night.dinnerMinutes||25,watch=night.watchStarted||order.watchAt;
  return [{label:'Order marked placed',at:order.orderAt,minutes:5},{label:'Estimated delivery window',at:order.orderAt+5*60000,minutes:Math.max(0,order.etaMinutes-5)},{label:'Sit down to dinner',at:order.arrivalAt,minutes:dinner},{label:'Start watching',at:watch,minutes:show.minutes},{label:'Evening finishes',at:watch+show.minutes*60000,minutes:0}];
 }
 const start=night.planStart||Date.parse(night.created),prep=Math.min(10,Math.max(3,Math.round(meal.minutes/4))),dinner=night.dinnerMinutes||25;
 return [{label:'Prep your ingredients',at:start,minutes:prep},{label:'Cook supper',at:start+prep*60000,minutes:meal.minutes-prep},{label:'Sit down to dinner',at:start+meal.minutes*60000,minutes:dinner},{label:'Start watching',at:night.watchStarted||start+(meal.minutes+dinner)*60000,minutes:show.minutes},{label:'Evening finishes',at:(night.watchStarted||start+(meal.minutes+dinner)*60000)+show.minutes*60000,minutes:0}];
}
export const orderOutChoices=[25,35,50];
export function orderBrief(meal,prefs={}){
 const people=Math.max(1,Math.min(8,Number(prefs.people)||1)),diet=prefs.diet||'Any',name=meal.name,cuisine=meal.cuisine||meal.category||'Local';
 let alternatives=/taco|quesadilla/i.test(name)?['tacos','burrito bowls','quesadillas']:/pasta|spaghetti|noodle/i.test(name)?['pasta','Italian bowls','noodle dishes']:/pizza|flatbread/i.test(name)?['pizza','flatbread','shareable Italian']:/mushroom|toast/i.test(name)?['mushroom flatbread','truffle pizza','vegetarian bistro']:/curry|rice/i.test(name)?['curry','rice bowls','family meals']:/soup/i.test(name)?['soup','noodle soup','comfort food']:[name,`${cuisine} bowls`,`${cuisine} family meal`];
 alternatives=[...new Set(alternatives)];
 const low=Math.max(24,people*14),high=Math.max(40,people*24);
 return {people,diet,budget:`$${low}–$${high}`,strategies:[
  {id:'closest',label:'Closest match',query:alternatives[0],detail:`Preserves the strongest flavor and format connection to ${name}.`},
  {id:'fastest',label:'Fastest arrival',query:alternatives[1]||alternatives[0],detail:'A broader search that is easier to find nearby. Compare the provider’s real ETA.'},
  {id:'group',label:'Best for the group',query:alternatives[2]||alternatives[0],detail:`Look for shareable portions that can feed ${people} without rebuilding the pairing.`}
 ]};
}
export function orderOutEvening(night,meal,show,etaMinutes=35,now=Date.now()){
 if(night.status!=='planned'||night.watchStarted)throw Error('Order-out changes are available before cooking or viewing begins.');
 if(!Number.isInteger(etaMinutes)||etaMinutes<15||etaMinutes>120)throw Error('Enter a delivery estimate from 15 to 120 minutes.');
 const baseNight={...night,planStart:night.scheduleChange?.kind==='order-out'?night.scheduleChange.previousStart:night.planStart,fulfillment:null,orderPlan:null},current=eveningTimeline(baseNight,meal,show),previousWatchAt=current[3].at,arrivalAt=now+etaMinutes*60000,watchAt=Math.max(previousWatchAt,arrivalAt+(night.dinnerMinutes||25)*60000),shiftMinutes=Math.max(0,Math.ceil((watchAt-previousWatchAt)/60000));
 return {...night,fulfillment:'delivery',planStart:now,orderPlan:{etaMinutes,orderAt:now,arrivalAt,watchAt,previousWatchAt},scheduleChange:{kind:'order-out',minutes:shiftMinutes,previousStart:baseNight.planStart||Date.parse(night.created),planStart:now,previousWatchAt,watchAt,at:new Date(now).toISOString()}};
}
export function readyTogetherPlan(night,meal,show,steps=[],now=Date.now()){
 const base=eveningTimeline(night,meal,show),schedule=base.map(item=>({...item}));
 if(night.watchStarted)return {schedule,shiftMinutes:0,state:'watching'};
 let dinnerAt=base[2].at;
 if(night.status==='cooking'){
  const list=steps.length?steps:[{}],weights=list.map(step=>Math.max(60,Number(step.seconds)||0)),total=weights.reduce((sum,value)=>sum+value,0),durations=weights.map(value=>meal.minutes*60000*value/total),current=Math.min(list.length-1,Math.max(0,night.step||0)),later=durations.slice(current+1).reduce((sum,value)=>sum+value,0),anchor=Number(night.progressAt)||Number(night.planStart)||now;
  const projected=night.timer&&night.timer>now?night.timer+later:anchor+durations.slice(current).reduce((sum,value)=>sum+value,0);
  dinnerAt=Math.max(dinnerAt,projected,now);
 }else if(night.status==='ready'||night.status==='complete')dinnerAt=Number(night.readyAt)||now;
 const watchAt=Math.max(base[3].at,dinnerAt+(night.dinnerMinutes||25)*60000),shift=Math.max(0,watchAt-base[3].at);
 schedule[2].at=dinnerAt;schedule[3].at=watchAt;schedule[4].at=watchAt+show.minutes*60000;
 return {schedule,shiftMinutes:Math.ceil(shift/60000),state:night.status==='planned'?'waiting':night.status==='cooking'?'cooking':'ready'};
}
export const delayChoices=[15,30,45,60];
export function delayEvening(night,minutes,now=Date.now()){
 if(night.status!=='planned'||night.watchStarted)throw Error('Delay changes are available before cooking or viewing begins.');
 if(!delayChoices.includes(minutes))throw Error('Choose a 15, 30, 45, or 60 minute delay.');
 const savedStart=Number(night.planStart||Date.parse(night.created)),previousStart=Number.isFinite(savedStart)?savedStart:now,planStart=Math.max(previousStart,now)+minutes*60000;
 return {...night,planStart,scheduleChange:{kind:'delay',minutes,previousStart,planStart,at:new Date(now).toISOString()}};
}
export const featuredEvenings=[
 {id:'assemble',title:'Assemble at the table',showId:'avengers',mealId:'recipe-smoky-black-bean-tacos',mode:'watch',reason:'Build-your-own smoky bean tacos make a sharing supper before the Avengers assemble. Finish eating first, then settle in for the full action movie.'},
 {id:'paris',title:'A little Paris in your kitchen',showId:'ratatouille',mealId:'pepper-pasta',mode:'meal',reason:'Roasted peppers, basil and a hands-on sauce bring cooking to the center of the evening, echoing Ratatouille’s love of making food. This is an inspired pairing, not a dish from the film.'},
 {id:'quiet',title:'A quieter kind of treasure',showId:'detectorists',mealId:'mushroom-toast',mode:'watch',reason:'Earthy mushroom toast suits Detectorists’ gentle countryside atmosphere. Its 29-minute first episode leaves room for an unhurried dinner on a weeknight.'}
];
