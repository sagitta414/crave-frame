// Compare the complete saved view: new scheduling fields must not silently stop syncing.
export function nightChanged(previous,next){return previous?.id===next?.id&&JSON.stringify(previous)!==JSON.stringify(next);}
// A response started before a local edit or navigation must never replace that edit.
export function canApplyNightPoll(started,current,startedRevision,currentRevision,busy){
 return !busy&&started===current&&startedRevision===currentRevision;
}
