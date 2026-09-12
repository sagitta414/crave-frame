import {foodReferences,referenceFits} from './food-references.js';
import {titleKey} from '../product/identity.js';
const clean=s=>typeof s==='string'?s.trim():'';
const normalize=s=>clean(s).normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').toLowerCase().replace(/\s+/g,' ');
export function resolvePick(p,pairs){if(!p||typeof p!=='object')return null;const exact=pairs.find(x=>x.id===p.id);if(exact)return exact;const matches=pairs.filter(x=>x.meal.id===(p.mealId||p.id)&&(!p.showId||titleKey(x.show)===titleKey(p.showId)));return matches.length===1?matches[0]:null;}
export function groundPair(p,match,fallback,{requireReview=false}={}){
 let quote=clean(p.evidenceQuote).slice(0,240);const synopsis=clean(match.show.description?.slice(0,1400)),description=normalize(synopsis);
 // A reviewer can name a short place/food anchor. Display its original surrounding sentence.
 if(requireReview&&p.connectionReviewed&&quote.length>=4&&quote.length<16){const needle=normalize(quote),sentence=synopsis.split(/(?<=[.!?])\s+/).find(s=>normalize(s).includes(needle));if(sentence){const at=normalize(sentence).indexOf(needle);if((at===0||!/[a-z]/.test(normalize(sentence)[at-1]))&&(!/[a-z]/.test(normalize(sentence)[at+needle.length]||'')))quote=sentence.length<=240?sentence:sentence.slice(Math.max(0,at-80),Math.max(0,at-80)+240);}}

 const documented=fallback.kind==='On-screen food';
 const reference=foodReferences(match.show).find(r=>r.id===p.sourceId&&normalize(r.text)===normalize(quote)&&referenceFits(r,match.meal));
 const supported=p.pairingType==='setting'&&(!requireReview||p.connectionReviewed===true)&&quote.length>=16&&(reference||description.includes(normalize(quote)));
 const pairingType=documented?'story':supported?'setting':'practical';
 const practicalFit=match.meal.minutes+' minutes cooking · '+match.show.minutes+' minutes watching. Allow extra time to eat.';
 const tableEcho=pairingType==='practical'?match.meal.name+' is a '+match.meal.minutes+'-minute dinner'+(match.meal.effort==='Easy'?' with an easy recipe':'')+'. There is no supported food connection to this title.':documented?fallback.tableEcho:clean(p.tableEcho).slice(0,320);
 return {pairingType,evidenceQuote:supported?quote:'',evidenceSource:supported&&reference?reference.source:'',mealEvidence:supported?(p.mealEvidence||[]):[],connectionReviewed:supported&&p.connectionReviewed===true,evidenceBasis:documented?'Documented food reference':supported?(reference?'Inspired by a documented food reference':'Inspired by the supplied synopsis'):'Practical dinner choice',storyCue:documented?fallback.storyCue:supported?clean(p.storyCue).slice(0,280):'',tableEcho,practicalFit,reason:[tableEcho,practicalFit].join(' ')};
}
export function ingredientOverlap(a,b){const core=m=>new Set(m.ingredients.map(i=>i[0].toLowerCase().replace(/\b(canned|cooked|ready|drained|sliced|chopped|dairy.free)\b/g,'').replace(/[^a-z ]/g,'').replace(/\s+/g,' ').trim()).filter(n=>!/(oil|salt|water|pepper$|garlic|juice|yogurt|butter|paprika|cumin|oregano|basil|thyme)/.test(n)));const x=core(a),y=core(b);if(!x.size||!y.size)return 0;return [...x].filter(n=>y.has(n)).length/Math.min(x.size,y.size);}
export function diverseFinalists(candidates,pairs){
 const selected=[],multipleMeals=new Set(pairs.map(p=>p.meal.id)).size>1,multipleShows=new Set(pairs.map(p=>p.show.id)).size>1;
 const quality=p=>(p.pairingType==='story'?12:p.pairingType==='setting'?6:0)+(p.meal.familiar?2:0);
 while(selected.length<3){
  const eligible=candidates.filter(p=>!selected.some(x=>x.id===p.id||(multipleMeals&&x.meal.id===p.meal.id)||(multipleShows&&x.show.id===p.show.id)));
  if(!eligible.length)break;
  const score=p=>quality(p)-(selected.some(x=>x.meal.category&&x.meal.category===p.meal.category)?8:0)-(selected.some(x=>ingredientOverlap(x.meal,p.meal)>=.6)?10:0);
  eligible.sort((a,b)=>score(b)-score(a));selected.push(eligible[0]);
 }
 return selected;
}
