const rejected=()=>Object.assign(Error('Too many new requests. Please try again later.'),{status:429});
// Atomic counters shared by all households. Only trust the edge-supplied client IP.
export async function reserveCreation(db,request,now=Date.now()){
 const day=new Date(now).toISOString().slice(0,10);
 const ip=request.headers.get('cf-connecting-ip')||'local';
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(day+':'+ip)))).map(b=>b.toString(16).padStart(2,'0')).join('');
 const local='create:'+day+':'+digest,global='create:'+day+':global';
 const reserve=(id,limit)=>db.prepare('INSERT INTO ai_usage(id,count) VALUES(?,1) ON CONFLICT(id) DO UPDATE SET count=count+1 WHERE count < ?').bind(id,limit).run();
 if(!(await reserve(local,20)).meta.changes)throw rejected();
 try{if(!(await reserve(global,500)).meta.changes)throw rejected();}
 catch(e){await db.prepare('UPDATE ai_usage SET count=count-1 WHERE id=? AND count>0').bind(local).run();throw e;}
 // Retain only seven days of creation counters; they contain no raw IP addresses.
 await db.prepare("DELETE FROM ai_usage WHERE id LIKE 'create:%' AND substr(id,8,10) < ?").bind(new Date(now-7*86400000).toISOString().slice(0,10)).run();
}
