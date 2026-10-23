import {ingredients} from './engine.js';
import {titleKey} from './identity.js';
// Independent preparation only. Never infer parallel heat/knife tasks from prose.
export function partnerTasks(meal,people,adapted){return [...ingredients(meal,people,adapted).map((i,index)=>({id:'ingredient-'+index,title:'Measure & set out '+i.name,text:i.amount+' '+i.unit+' · Keep raw ingredients separate; follow the recipe for washing, cutting and cooking.'})),{id:'table',title:'Set the table',text:'Set out plates, cutlery and drinks while your partner follows the cooking steps.'}];}
export function savePartnerFeedback(night,value,now=Date.now()){
 if(night.prefs.people!==2||!['ready','complete'].includes(night.status))throw Error('Partner feedback opens after dinner is ready for two.');
 if(!value||![1,2].includes(value.person))throw Error('Choose your partner number.');
 if(value.food==='clear'&&value.watch==='clear'){night.partnerFeedback={...night.partnerFeedback};delete night.partnerFeedback[value.person];return;}
 const fields=['food','watch'].filter(k=>value[k]!==undefined);
 if(!fields.length||fields.some(k=>!['again','okay','skip'].includes(value[k])))throw Error('Choose a dinner or viewing response.');
 if(fields.includes('watch')&&!night.watchStarted)throw Error('Save dinner feedback now. Viewing feedback opens after you start watching.');
 const previous=night.partnerFeedback?.[value.person]||{},next={...previous};
 for(const kind of fields){if(next[kind]!==value[kind]){next[kind]=value[kind];next[kind+'UpdatedAt']=now;}}
 night.partnerFeedback={...night.partnerFeedback,[value.person]:next};
}
export function partnerLearning(pairs,nights=[]){
 const latest=new Map(),times=new Map();
 for(const n of [...nights].sort((a,b)=>Date.parse(a.created)-Date.parse(b.created)))for(const person of [1,2]){const f=n.partnerFeedback?.[person];if(!f)continue;for(const kind of ['food','watch']){if(!['again','okay','skip'].includes(f[kind]))continue;const key=person+':'+kind+':'+(kind==='food'?n.mealId:titleKey(n.show||n.showId)),at=Number(f[kind+'UpdatedAt'])||Date.parse(n.created)||0;if(at>=(times.get(key)??-1)){times.set(key,at);latest.set(key,f[kind]);}}}
 const score=p=>[1,2].reduce((sum,person)=>sum+(latest.get(person+':food:'+p.meal.id)==='again'?25:0)+(latest.get(person+':watch:'+titleKey(p.show))==='again'?15:0),0);
 return pairs.filter(p=>![1,2].some(person=>latest.get(person+':food:'+p.meal.id)==='skip'||latest.get(person+':watch:'+titleKey(p.show))==='skip')).sort((a,b)=>score(b)-score(a));
}
export function revealEvening(room){
 if(room?.phase!=='revealed'||!room.members?.length||room.members.some(m=>!m.vote))return null;
 const votes=room.votes||{},ranked=[...(room.picks||[])].sort((a,b)=>(votes[b.meal.id+':'+b.show.id]||0)-(votes[a.meal.id+':'+a.show.id]||0));
 if(!ranked.length)return null;const top=ranked[0],count=votes[top.meal.id+':'+top.show.id]||0;
 if(!count)return null;
 const tied=ranked.filter(p=>(votes[p.meal.id+':'+p.show.id]||0)===count).length>1;
 return {pair:top,tied,cook:top.meal.minutes,dinner:25,watch:top.show.minutes,total:top.meal.minutes+25+top.show.minutes};
}
export function pairingEvidence(pair){const c=pair.connection||{},kind=c.kind;
 if(kind==='On-screen food'&&(pair.evidenceSource||c.source))return {label:'Documented food connection',detail:c.tableEcho||pair.tableEcho||c.text,source:pair.evidenceSource||c.source};
 if(kind==='Story inspiration'&&(pair.evidenceSource||c.source))return {label:'Story-inspired interpretation',detail:c.tableEcho||pair.tableEcho||c.text,source:pair.evidenceSource||c.source};
 if(kind==='Setting')return {label:'Setting-inspired interpretation',detail:c.tableEcho||pair.tableEcho||c.text};
 return {label:'Mood & pace match',detail:c.tableEcho||pair.tableEcho||pair.reason||'Chosen for your cooking time and viewing preferences.'};
}
