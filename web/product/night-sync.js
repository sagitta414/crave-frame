// Compare the complete saved view: new scheduling fields must not silently stop syncing.
export function nightChanged(previous,next){return previous?.id===next?.id&&JSON.stringify(previous)!==JSON.stringify(next);}
