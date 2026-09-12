const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const base64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
async function key(env){if(!env.INTEGRATION_ENCRYPTION_KEY)fail('Connection setup is unavailable.',503);return crypto.subtle.importKey('raw',bytes(env.INTEGRATION_ENCRYPTION_KEY),'AES-GCM',false,['encrypt','decrypt']);}
export async function tmdbToken(env){
 if(env.TMDB_ACCESS_TOKEN)return env.TMDB_ACCESS_TOKEN;
 if(!env.INTEGRATION_ENCRYPTION_KEY||!env.DB)return null;
 const row=await env.DB.prepare("SELECT ciphertext,iv FROM integrations WHERE id = 'tmdb'").first();if(!row)return null;
 return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(row.iv),additionalData:new TextEncoder().encode('supper-scene:tmdb:v1')},await key(env),bytes(row.ciphertext)));
}
export async function setupTmdb(request,env){
 const capability=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(!/^[a-f0-9]{64}$/.test(capability)||!env.TMDB_SETUP_HASH||await hash(capability)!==env.TMDB_SETUP_HASH)fail('This setup link is invalid.',403);
 const existing=await env.DB.prepare("SELECT id FROM integrations WHERE id = 'tmdb'").first();
 if(request.method==='GET')return {connected:!!existing||!!env.TMDB_ACCESS_TOKEN};
 if(request.method!=='POST')fail('Method not allowed.',405);
 if(existing||env.TMDB_ACCESS_TOKEN)fail('TMDB is already connected. This one-time link has been used.',409);
 if(Date.now()>Number(env.TMDB_SETUP_EXPIRES||0))fail('This setup link has expired. Ask for a new link.',410);
 const raw=await request.text();if(raw.length>5000)fail('Token is too long.',413);
 let input;try{input=JSON.parse(raw);}catch{fail('Enter a valid token.');}
 const token=typeof input.token==='string'?input.token.trim():'';
 if(!/^[A-Za-z0-9._-]{40,4000}$/.test(token))fail('Paste the API Read Access Token from your TMDB settings.');
 let response;try{response=await fetch('https://api.themoviedb.org/3/authentication',{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});}catch{fail('TMDB could not be reached. Try again shortly.',503);}
 if(!response.ok)fail(response.status===401?'TMDB did not accept that token. Check that you copied the API Read Access Token.':'TMDB is temporarily unavailable. Try again shortly.',response.status===401?400:503);
 const verified=await response.json();if(verified.success!==true)fail('TMDB could not verify that token.');
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('supper-scene:tmdb:v1')},await key(env),new TextEncoder().encode(token));
 const result=await env.DB.prepare('INSERT OR IGNORE INTO integrations (id,ciphertext,iv,updated) VALUES (?,?,?,?)').bind('tmdb',base64(encrypted),base64(iv),new Date().toISOString()).run();
 if(!result.meta.changes)fail('TMDB is already connected. This one-time link has been used.',409);
 return {connected:true};
}
