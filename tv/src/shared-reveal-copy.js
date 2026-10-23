export function sharedRevealCopy(room){
 if(room?.phase!=='revealed')return null;
 const choices=(room.members||[]).filter(m=>m.mood).map(m=>(m.name||'A guest')+' chose '+m.mood.toLowerCase());
 return {choices:choices.join(' · '),limits:room.prefs?room.prefs.cookTime+' minutes cooking · '+room.prefs.watchTime+' minutes viewing · '+room.members.length+' at the table':'',closing:'Your choices shaped this shortlist. Check the matches and compromises below, then choose your evening.'};
}
