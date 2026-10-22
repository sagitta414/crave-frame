import {ingredients} from './engine.js';
import {pantryMatches} from './ingredients.js';
export const tonightShortcuts=[
 {id:'easy',label:'I’m tired',detail:'Easy cooking · up to 30 min',symbol:'☾'},
 {id:'quick',label:'30-minute cooking',detail:'Keep dinner manageable',symbol:'◷'},
 {id:'family',label:'Family night',detail:'Family-filtered viewing',symbol:'♡'},
 {id:'special',label:'Something special',detail:'A little more occasion',symbol:'✦'}
];
export function tonightPreferences(prefs,id){
 const next={...prefs};
 if(id==='easy')Object.assign(next,{energy:'Exhausted',effort:'Easy',cookTime:Math.min(prefs.cookTime,30)});
 if(id==='quick')next.cookTime=Math.min(prefs.cookTime,30);
 if(id==='family')next.family=true;
 if(id==='special')next.energy='Make it special';
 return next;
}
export function tonightShortcutState(prefs,id){
 const minutes=Math.min(prefs.cookTime,30);
 if(id==='easy')return {active:prefs.energy==='Exhausted'&&prefs.effort==='Easy'&&prefs.cookTime<=30,detail:`Easy cooking · up to ${minutes} min`};
 if(id==='quick')return {active:prefs.cookTime<=30,detail:`Up to ${minutes} min · cooking time`};
 if(id==='family')return {active:!!prefs.family,detail:'Family-filtered viewing'};
 return {active:prefs.energy==='Make it special',detail:'A little more occasion'};
}
export function eveningDuration(minutes){const hours=Math.floor(minutes/60),rest=minutes%60;return hours?`${hours} hr${rest?' '+rest+' min':''}`:`${rest} min`;}
export function pairingInsight(pair){
 const c=pair.connection||{};
 if(c.kind==='On-screen food'||c.kind==='Story inspiration')return {label:'Story-inspired dinner',text:c.tableEcho||c.text||'Inspired by the story; this recipe is our interpretation.'};
 if(c.kind==='Setting')return {label:'Inspired by the setting',text:c.tableEcho||'A creative interpretation of the setting, not a dish verified on screen.'};
 return {label:'A practical evening match',text:`${pair.meal.name} takes about ${pair.meal.minutes} minutes to cook, followed by ${pair.show.minutes} minutes of viewing. This is a practical dinner choice, not a claim that the dish appears in the story.`};
}
export function dinnerDecision(meal,show,prefs,adapted=false,pantry=[]){
 const list=ingredients(meal,prefs.people,adapted),matched=new Set(pantryMatches(list,pantry).map(i=>i.name));
 return {total:meal.minutes+25+show.minutes,duration:eveningDuration(meal.minutes+25+show.minutes),items:list.map(i=>({...i,inPantry:matched.has(i.name)})),check:list.filter(i=>!matched.has(i.name)),pantryCount:matched.size};
}
