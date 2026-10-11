// Expand the dashboard with real, already-filtered pairs; never invent sample plans.
export function browseSamples(ranked,limit=120){
 const titles=new Map();
 for(const pair of ranked){const group=titles.get(pair.show.id)||[];group.push(pair);titles.set(pair.show.id,group);}
 const groups=[...titles.values()].map(candidates=>{
  const picks=[],meals=new Set(),categories=new Set();
  while(picks.length<4){
   const remaining=candidates.filter(p=>!meals.has(p.meal.id));if(!remaining.length)break;
   const score=p=>(!categories.has(p.meal.category)?20:0)+(p.meal.familiar?8:0)+(['On-screen food','Story inspiration'].includes(p.connection?.kind)?10:0);
   const pick=remaining.sort((a,b)=>score(b)-score(a))[0];picks.push(pick);meals.add(pick.meal.id);categories.add(pick.meal.category);
  }
  return picks;
 });
 const picks=[];for(let i=0;i<4;i++)for(const group of groups)if(group[i]&&picks.length<limit)picks.push(group[i]);return picks;
}
