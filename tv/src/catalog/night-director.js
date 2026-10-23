import {titleKey} from './identity.js';
export function eveningWays(pairs,show){
 const pool=pairs.filter(p=>titleKey(p.show)===titleKey(show)),used=new Set();
 const pick=list=>{const p=list.find(p=>!used.has(p.meal.id));if(p)used.add(p.meal.id);return p||null;};
 const easy=pick([...pool].filter(p=>p.meal.effort==='Easy'&&p.meal.minutes<=30).sort((a,b)=>a.meal.minutes-b.meal.minutes));
 const together=pick(pool),special=pick(pool);
 return [{id:'easy',label:'Low effort',detail:'An easy recipe, ready in 30 cooking minutes or less.',pair:easy},{id:'together',label:'Cook together',detail:'Share the prep at your own pace. Recipe time stays the same.',pair:together},{id:'special',label:'Make it special',detail:'A different dinner, with an optional song or table setting. No extra purchase needed.',pair:special}];
}
export const privateTouches=[
 {title:'Set the opening mood',text:'If you feel like it, choose one song to play before dinner. Pick something you think the other person would enjoy.'},
 {title:'A little welcome',text:'If you feel like it, leave a short note at their place: one thing you appreciate about spending tonight together.'},
 {title:'Give tonight a name',text:'Think of a playful name for this dinner-and-story double feature. Share it when you sit down.'},
 {title:'Choose a small memory',text:'Think of a happy moment you shared. Bring it up over dinner only if it feels right.'}
];
export function privateTouch(index,seed=0){return privateTouches[(Math.abs(seed)*2+index)%privateTouches.length];}
export function openingScene(pair){return {title:'Tonight, just us.',line:pair.meal.shortName||pair.meal.name,story:pair.show.name,detail:pair.meal.minutes+' min cooking · '+pair.show.minutes+' min watching'};}
