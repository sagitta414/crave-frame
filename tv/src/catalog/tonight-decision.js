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
export function dinnerDecision(meal,show,prefs,adapted=false,pantry=[]){
 const list=ingredients(meal,prefs.people,adapted),matched=new Set(pantryMatches(list,pantry).map(i=>i.name));
 return {total:meal.minutes+25+show.minutes,items:list.map(i=>({...i,inPantry:matched.has(i.name)})),check:list.filter(i=>!matched.has(i.name)),pantryCount:matched.size};
}
