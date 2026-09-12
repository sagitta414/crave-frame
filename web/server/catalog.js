import {tmdbToken} from './integrations.js';
const error=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export async function tmdb(env,path){
 const accessToken=await tmdbToken(env);
 if(!accessToken)error('Live catalog search is not connected yet. Use a featured title or add your own below.',503);
 const r=await fetch('https://api.themoviedb.org/3/'+path,{headers:{Authorization:'Bearer '+accessToken},signal:AbortSignal.timeout(8000)});
 if(!r.ok)error('The movie catalog is unavailable. Try again or add the title yourself.',503);
 return r.json();
}
export async function catalogRequest(url,env){
 const q=url.searchParams.get('q')||'',type=url.searchParams.get('type'),id=url.searchParams.get('id'),season=url.searchParams.get('season');
 if(url.pathname.endsWith('/status'))return {connected:!!(await tmdbToken(env))};
 if(url.pathname.endsWith('/services')){const region=url.searchParams.get('region')||'US';if(!/^[A-Z]{2}$/.test(region))error('Choose a valid region.');const [m,t]=await Promise.all(['movie','tv'].map(k=>tmdb(env,'watch/providers/'+k+'?watch_region='+region)));return {providers:[...new Map([...m.results,...t.results].map(p=>[p.provider_id,p])).values()].sort((a,b)=>(a.display_priority||0)-(b.display_priority||0)).map(p=>({id:p.provider_id,name:p.provider_name,logo:p.logo_path})),region};}
 if(url.pathname.endsWith('/availability'))return availability(env,{provider:{type,id:Number(id)}},url.searchParams.get('region')||'US');
 if(url.pathname.endsWith('/search')){if(q.trim().length<2||q.length>120)error('Enter between 2 and 120 characters.');const d=await tmdb(env,'search/multi?include_adult=false&query='+encodeURIComponent(q));let results=d.results.filter(x=>['tv','movie'].includes(x.media_type)&&!x.adult).slice(0,18).map(x=>({id:x.id,type:x.media_type,name:x.title||x.name,year:(x.release_date||x.first_air_date||'').slice(0,4),description:(x.overview||'').slice(0,400),posterPath:x.poster_path||null}));const serviceText=url.searchParams.get('services');if(serviceText){const ids=serviceText.split(',').map(Number);if(ids.length>12||ids.some(x=>!Number.isInteger(x)||x<1))error('Invalid service filter.');const checked=[];for(let i=0;i<results.length;i+=4)checked.push(...await Promise.all(results.slice(i,i+4).map(async x=>({...x,availability:await availability(env,{provider:{type:x.type,id:x.id}},url.searchParams.get('region')||'US')}))));results=checked.filter(x=>x.availability.subscription.some(p=>ids.includes(p.id)));}return {results};}
 if(!['tv','movie'].includes(type)||!/^\d{1,10}$/.test(id||''))error('Choose a valid catalog title.');
 if(season!==null){if(!/^\d{1,4}$/.test(season))error('Invalid season.');const d=await tmdb(env,`tv/${id}/season/${season}`);return {episodes:(d.episodes||[]).map(e=>({number:e.episode_number,name:e.name,minutes:e.runtime||null,description:(e.overview||'').slice(0,300)}))};}
 const d=await tmdb(env,`${type}/${id}`);if(d.adult)error('This title is unavailable.');return {name:d.title||d.name,minutes:d.runtime||null,description:d.overview||'',seasons:(d.seasons||[]).filter(s=>s.season_number>=0).map(s=>({number:s.season_number,name:s.name})),genres:(d.genres||[]).map(g=>g.name)};
}
const providerCache=new Map();
export async function availability(env,show,region='US'){
 const key=JSON.stringify([show.provider||show.source||show.id,region]),now=Date.now(),cached=providerCache.get(key);if(cached&&cached.until>now)return cached.value;
 const entry={until:now+300000,value:fetchAvailability(env,show,region)};providerCache.set(key,entry);if(providerCache.size>300)providerCache.delete(providerCache.keys().next().value);
 try{return await entry.value;}catch(e){if(providerCache.get(key)===entry)providerCache.delete(key);throw e;}
}
async function fetchAvailability(env,show,region='US'){
 if(!/^[A-Z]{2}$/.test(region))error('Choose a valid region.');
 const p=show.provider||(()=>{const m=(show.source||'').match(/themoviedb\.org\/(movie|tv)\/(\d+)/);return m?{type:m[1],id:Number(m[2])}:null;})();
 if(!p||!['movie','tv'].includes(p.type)||!Number.isInteger(p.id)||p.id<1)return {region,subscription:[],rent:[],buy:[],link:null,unknown:true};
 const d=await tmdb(env,`${p.type}/${p.id}/watch/providers`),r=d.results?.[region];
 const map=key=>(r?.[key]||[]).map(x=>({id:x.provider_id,name:x.provider_name,logo:x.logo_path}));
 return {region,subscription:map('flatrate'),rent:map('rent'),buy:map('buy'),link:r?.link||null,unknown:!r,credit:'Availability data from JustWatch via TMDB',checkedAt:new Date().toISOString()};
}
export function manualShow(data){
 if(!data||typeof data.name!=='string'||!data.name.trim()||data.name.length>160||!Number.isInteger(data.minutes)||data.minutes<1||data.minutes>600||!['Movie','TV episode'].includes(data.kind)||!['Cozy','Lighthearted','Adventure','Romantic'].includes(data.mood)||!['Any','European','Mediterranean','Asian','Americas'].includes(data.cuisine))error('Enter a title, viewing time, format, mood, and cuisine inspiration.');
 // Store plain text only. Source links, artwork, ratings and verified claims cannot be supplied by clients.
 const name=data.name.trim().replace(/[<>&"']/g,'');
 return {id:'custom-'+crypto.randomUUID(),name,kind:data.kind,minutes:data.minutes,mood:data.mood,cuisine:data.cuisine,scene:data.mood==='Cozy'?'manor':data.mood==='Adventure'?'lake':'coast',family:data.family===true,genre:'Your selection',rating:'Not verified',description:'Title and runtime entered by you. Pairings reflect your chosen mood and cuisine inspiration.',tags:['Your selection'],pairing:'Your chosen atmosphere guides this dinner pairing.',custom:true};
}
export async function selectShow(data,env){
 if(!data.provider)return manualShow(data);
 const {type,id,season,episode}=data.provider;
 if(!['movie','tv'].includes(type)||!Number.isInteger(id)||id<1)error('Invalid catalog title.');
 const d=await tmdb(env,`${type}/${id}`);if(d.adult)error('This title is unavailable.');
 let name=d.title||d.name,minutes=d.runtime,description=d.overview,episodeName='';
 if(type==='tv'){
  if(!Number.isInteger(season)||season<0||season>999||!Number.isInteger(episode)||episode<1||episode>9999)error('Choose a season and episode.');
  const e=await tmdb(env,`tv/${id}/season/${season}/episode/${episode}`);
  episodeName=e.name||'';name+=` — S${season} E${episode}: ${episodeName}`;minutes=e.runtime;description=e.overview;
 }
 const show=manualShow({...data,name:name.slice(0,160),minutes:minutes||data.minutes,kind:type==='tv'?'TV episode':'Movie',family:false});
 return {...show,id:`tmdb-${type}-${id}`+(type==='tv'?`-${season}-${episode}`:''),genre:(d.genres||[]).map(g=>g.name).join(' · '),description:(description||'').slice(0,800),episodeName,source:`https://www.themoviedb.org/${type}/${id}`,rating:'Not verified',releaseYear:(d.release_date||d.first_air_date||'').slice(0,4),posterPath:d.poster_path||null,backdropPath:d.backdrop_path||null,provider:data.provider,runtimeSource:minutes?'TMDB':'Entered by you',custom:false};
}
