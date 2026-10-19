import {cookingProfile} from './catalog/cooking-profile.js';
import {isStaleEvening} from './catalog/evening.js';
export function resumeEvening(nights=[]){return nights.find(n=>!n.feedback&&n.status!=='complete'&&!isStaleEvening(n))||null;}
export function choiceLabels(picks,memory={}){
 const effort=picks.map(p=>cookingProfile(p.meal).effortIndex),least=Math.min(...effort);
 const strength=p=>p.connection?.kind==='On-screen food'?3:p.evidenceSource&&p.pairingType==='story'?2:p.evidenceSource&&p.pairingType==='setting'?1:0;
 const closest=Math.max(0,...picks.map(strength));
 return picks.map((p,i)=>[
  closest>0&&strength(p)===closest?'Closest story connection':null,
  memory.favoriteMeals?.includes(p.meal.id)?'Familiar favorite':p.meal.familiar?'Familiar choice':null,
  picks.length>1&&effort[i]===least?'Least cooking effort':null
 ].filter(Boolean));
}
export function pairingSummary(pair){
 const c=pair.connection||{},echo=pair.tableEcho||c.tableEcho||'';
 if(pair.pairingType!=='practical'&&c.pairingType!=='practical'&&/sandwich|toast|grilled cheese/i.test(pair.meal.name)&&(c.source?.includes('paddington.com')||pair.evidenceSource?.includes('paddington.com')))return 'A savory sandwich inspired by Paddington’s love of marmalade sandwiches.';
 if(pair.pairingType==='practical'||c.pairingType==='practical')return `${pair.meal.name} fits your cooking time; no direct story-food connection is claimed.`;
 return echo.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim()||echo||`${pair.meal.name} is a ${pair.meal.minutes}-minute option for tonight.`;
}
