export function eveningStage(night){
 if(night.watchStarted)return 3;
 if(night.status==='ready'||night.status==='complete')return 2;
 if(night.status==='cooking'&&night.step>0)return 1;
 return 0;
}
export function tasteClusters(nights,lookup){
 const groups=new Map();
 for(const n of nights){const meal=lookup(n.mealId);if(!meal)continue;const label=meal.cuisine+' · '+(n.prefs?.mood||'Any mood');
  if(!groups.has(label))groups.set(label,{label,cuisine:meal.cuisine,mood:n.prefs?.mood,nights:[],again:0});
  const g=groups.get(label);g.nights.push(n);if(n.feedback?.meal==='again')g.again++;
 }
 return [...groups.values()].sort((a,b)=>b.nights.length-a.nights.length||a.label.localeCompare(b.label));
}
export function voteSummary(room){
 const picks=room.picks||[],votes=room.votes||{},count=p=>votes[p.meal.id+':'+p.show.id]||0;
 const ordered=[...picks].sort((a,b)=>count(b)-count(a)),top=ordered[0],total=(room.members||[]).filter(m=>m.vote).length;
 return {top,total,tied:!!top&&ordered.length>1&&count(top)===count(ordered[1]),winningVotes:top?count(top):0};
}
