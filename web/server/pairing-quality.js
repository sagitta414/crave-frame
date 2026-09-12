const clean=s=>typeof s==='string'?s.trim():'';
const normalize=s=>clean(s).toLowerCase().replace(/\s+/g,' ');
export function groundPair(p,match,fallback){
 const quote=clean(p.evidenceQuote).slice(0,240),description=normalize(match.show.description?.slice(0,1400));
 const documented=fallback.kind==='On-screen food';
 const supported=p.pairingType==='setting'&&quote.length>=16&&description.includes(normalize(quote));
 const pairingType=documented?'story':supported?'setting':'practical';
 const practicalFit=match.meal.minutes+' minutes cooking · '+match.show.minutes+' minutes watching. Allow extra time to eat.';
 const tableEcho=pairingType==='practical'?match.meal.name+' is a '+match.meal.minutes+'-minute dinner option. There is no supported food connection to this title.':documented?fallback.tableEcho:clean(p.tableEcho).slice(0,320);
 return {pairingType,evidenceQuote:supported?quote:'',evidenceBasis:documented?'Documented food reference':supported?'Inspired by the supplied synopsis':'Practical dinner choice',storyCue:documented?fallback.storyCue:supported?clean(p.storyCue).slice(0,280):'',tableEcho,practicalFit,reason:[tableEcho,practicalFit].join(' ')};
}
export function diverseFinalists(candidates,pairs){
 const selected=[],multipleMeals=new Set(pairs.map(p=>p.meal.id)).size>1,multipleShows=new Set(pairs.map(p=>p.show.id)).size>1;
 const quality=p=>(p.pairingType==='story'?12:p.pairingType==='setting'?6:0)+(p.meal.familiar?2:0);
 while(selected.length<3){
  const eligible=candidates.filter(p=>!selected.some(x=>x.id===p.id||(multipleMeals&&x.meal.id===p.meal.id)||(multipleShows&&x.show.id===p.show.id)));
  if(!eligible.length)break;
  const score=p=>quality(p)-(selected.some(x=>x.meal.category&&x.meal.category===p.meal.category)?8:0);
  eligible.sort((a,b)=>score(b)-score(a));selected.push(eligible[0]);
 }
 return selected;
}
