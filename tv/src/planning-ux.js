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
  picks.length>1&&effort[i]===least&&effort.filter(v=>v===least).length===1?'Least cooking effort':null
 ].filter(Boolean));
}
export function pairingSummary(pair){
 const c=pair.connection||{},echo=pair.tableEcho||c.tableEcho||'';
 if(pair.pairingType!=='practical'&&c.pairingType!=='practical'&&/sandwich|toast|grilled cheese/i.test(pair.meal.name)&&(c.source?.includes('paddington.com')||pair.evidenceSource?.includes('paddington.com')))return 'A savory sandwich inspired by Paddington’s love of marmalade sandwiches.';
 if(pair.pairingType==='practical'||c.pairingType==='practical')return echo||`${pair.meal.name}: ${pair.meal.minutes} minutes to cook before you settle in. An everyday pairing chosen for your time and preferences.`;
 return echo.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim()||echo||`${pair.meal.name} is a ${pair.meal.minutes}-minute option for tonight.`;
}

export function heroPairingLine(pair,signature){
 if(signature?.heroLine)return signature.heroLine;
 if(signature){const first=signature.line?.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();return first&&first.length<=150?first:signature.title+'.';}
 return pair.meal.minutes+' minutes in the kitchen, then time for '+pair.show.name+'.';
}
