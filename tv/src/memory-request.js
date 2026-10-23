// Keep a retry token stable while the screen remains open; not an authorization token.
export function memoryRequestId(){return Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+'_'+Math.random().toString(36).slice(2);}
