// Only explicitly enjoyed dinners may contribute to inferred favorite signals.
export function tasteSummary(nights=[],memory={},lookup=()=>null){
 const rated=nights.filter(n=>n.feedback),liked=rated.filter(n=>n.feedback.meal==='again');
 const counts=new Map();
 for(const n of liked){const cuisine=lookup(n.mealId)?.cuisine;if(cuisine)counts.set(cuisine,(counts.get(cuisine)||0)+1);}
 const cuisine=memory.favoriteCuisines?.[0]||[...counts].sort((a,b)=>b[1]-a[1])[0]?.[0]||'No saved preference';
 const minutes=liked.map(n=>lookup(n.mealId)?.minutes).filter(Number.isFinite);
 return {rated: rated.length,liked:liked.length,cuisine,minutes:minutes.length?Math.round(minutes.reduce((a,b)=>a+b,0)/minutes.length):null};
}
