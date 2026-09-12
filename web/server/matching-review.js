import {generate} from './vertex.js';
import {foodReferences,referenceFits} from './food-references.js';
import {connection} from '../product/curation.js';
import {ingredients} from '../product/engine.js';
import {resolvePick} from './pairing-quality.js';
export function shortlistPairs(pairs,limit=80){
 const meals=[...new Map(pairs.map(p=>[p.meal.id,p.meal])).values()];if(meals.length<=limit)return pairs;
 const selected=new Set(pairs.filter(p=>connection(p.meal,p.show).kind==='On-screen food').map(p=>p.meal.id));
 for(const p of pairs){if(selected.size>=12)break;if(foodReferences(p.show).some(r=>referenceFits(r,p.meal)))selected.add(p.meal.id);}
 for(const m of meals.filter(m=>m.familiar)){if(selected.size<limit)selected.add(m.id);}
 const groups=new Map();for(const m of meals){if(selected.has(m.id))continue;const key=m.category||'Other';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(m);}
 const hash=s=>{let n=0;for(const c of s)n=(n*31+c.charCodeAt(0))>>>0;return n;};const seed=pairs[0]?.show.id||'';for(const g of groups.values())g.sort((a,b)=>hash(seed+a.id)-hash(seed+b.id));
 while(selected.size<limit&&[...groups.values()].some(g=>g.length))for(const g of groups.values())if(g.length&&selected.size<limit)selected.add(g.shift().id);
 return pairs.filter(p=>selected.has(p.meal.id));
}
export async function reviewConnections(output,pairs,env,prefs,adapted){
 const candidates=(Array.isArray(output.picks)?output.picks:[]).slice(0,8).flatMap(p=>{const match=resolvePick(p,pairs);if(!match||p.pairingType!=='setting')return [];return [{...p,id:match.id,show:{id:match.show.id,name:match.show.name,description:match.show.description?.slice(0,1400)},meal:{name:match.meal.name,category:match.meal.category,ingredients:ingredients(match.meal,prefs.people,adapted).map(i=>i.name)},references:foodReferences(match.show).filter(r=>referenceFits(r,match.meal,ingredients(match.meal,prefs.people,adapted).map(i=>i.name)))}];});
 if(!candidates.length)return {...output,picks:(Array.isArray(output.picks)?output.picks:[]).map(p=>p&&({...p,connectionReviewed:false}))};
 const review=await generate(env,'You are a skeptical food-and-film editor. Assess each proposed dinner using ONLY its supplied title synopsis, curated references and actual ingredients. Return {reviews:[{id,verdict:"keep" or "practical",evidenceQuote,sourceId,storyCue,tableEcho,mealEvidence:[string]}]}. A quote existing is not enough: it must establish a concrete place, specific food, restaurant/food-truck/cafe occasion, or culinary activity that explains THIS dinner. Reject generic atmosphere, friendship, teamwork, plot layers, comfort and action metaphors. A whole continent or a hotel alone does not justify an arbitrary cuisine. Food-truck handheld meals or a plausible local dish for a named city can be interpretations; never claim they appeared on screen. Reject wrong regional cuisine, invented scenes, and ingredients missing from the supplied recipe. You may repair a sound proposal by quoting the actual synopsis and narrowing its explanation. For keep, evidenceQuote must be an exact 16–240 character excerpt of the supplied description OR the text of a supplied curated reference. sourceId is required only for a curated reference. mealEvidence must copy one or two exact supplied ingredient names that support the culinary link, not just oil or salt. storyCue and tableEcho must be short, specific and spoiler-free. tableEcho must name the dinner and the link, acknowledge reinterpretation where appropriate, and must not introduce new ingredients, cooking instructions or substitutions. Otherwise verdict practical. Copy each full id exactly. No numerical confidence or invented sources.',{candidates});
 const entries=Array.isArray(review.reviews)?review.reviews:[];
 return {...output,picks:(Array.isArray(output.picks)?output.picks:[]).map(p=>{const match=resolvePick(p,pairs),v=match&&entries.find(x=>x&&x.id===match.id);if(!p)return p;
  const actual=match?ingredients(match.meal,prefs.people,adapted).map(i=>i.name.toLowerCase()):[];
  const evidence=Array.isArray(v?.mealEvidence)?v.mealEvidence.filter(x=>typeof x==='string'&&actual.includes(x.toLowerCase())&&!/^(salt|water|olive oil|black pepper)$/i.test(x)).slice(0,2):[];
  const sourceOkay=!v?.sourceId||foodReferences(match?.show).some(r=>r.id===v.sourceId&&referenceFits(r,match.meal,actual));
  const forced=/\b(evokes?|ambiance|atmosphere|teamwork|friendship|foraging|plot layers|European street food)\b/i.test(String(v?.tableEcho||''));
  const keep=!forced&&sourceOkay&&v?.verdict==='keep'&&evidence.length>0&&typeof v.tableEcho==='string'&&v.tableEcho.length>=20&&typeof v.storyCue==='string';
  return {...p,...(keep?{pairingType:'setting',storyCue:v.storyCue,tableEcho:v.tableEcho,evidenceQuote:v.evidenceQuote,sourceId:v.sourceId,mealEvidence:evidence}:{pairingType:'practical'}),connectionReviewed:keep};
 })};
}
