import {parentState,parental,kidsHouse} from './parental.js';
import {eveningStyles} from '../product/cooking-profile.js';
import {pairingEvidence} from '../product/evidence.js';
import {normalizeHouse,titleKey,canonicalPair} from '../product/identity.js';
import {approveGroup,options as validatePairingOptions} from './social.js';
import {createCompanion,publicCompanion} from './companion.js';
import {curated,social,publicSocial} from './social.js';
import {connection,groupFits,compromiseFacts} from '../product/curation.js';
import {availability} from './catalog.js';
import {aiRequest} from './ai.js';
import {foodPreferences,dietFits} from '../product/diets.js';
import {rescueOptions} from '../product/planning.js';
import {movieNightById} from '../product/movie-nights.js';
import {setupTmdb} from './integrations.js';
import {mealById,showById,defaults,moods} from '../product/catalog.js';
import {feedbackMemory,ingredients,recipeSteps} from '../product/engine.js';
import {delayEvening,orderOutEvening} from '../product/evening.js';
import {catalogRequest,selectShow} from './catalog.js';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
const token=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');
const validKey=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
function preferences(p){if(!p)fail('Please check your evening preferences.');p={...defaults,...p};if(!['Beginner','Regular','Confident'].includes(p.cookLevel)||!Number.isInteger(p.people)||p.people<1||p.people>8||!moods.includes(p.mood)||![30,45,90,120,180,240,360,600].includes(p.watchTime)||![15,30,45,60].includes(p.cookTime)||!['Any','Easy'].includes(p.effort)||!foodPreferences.includes(p.diet)||!['Any','Movie','TV episode'].includes(p.format)||!['Real titles','Original demo titles'].includes(p.catalog)||typeof p.family!=='boolean'||!['Atmosphere','Cuisine inspiration','Practical'].includes(p.pairingStyle))fail('Please check your evening preferences.');return Object.fromEntries(Object.keys(defaults).map(k=>[k,p[k]]));}
async function body(request){const raw=await request.text();if(raw.length>20000)fail('Request is too large.',413);try{return JSON.parse(raw);}catch{fail('Invalid request.');}}
async function getHouse(db,id){const row=await db.prepare('SELECT data,revision FROM households WHERE id = ?').bind(id).first();if(!row)fail('This household could not be found.',401);return {...row,data:normalizeHouse(JSON.parse(row.data))};}
async function saveHouse(db,id,row){const result=await db.prepare('UPDATE households SET data = ?, revision = revision + 1, updated = ? WHERE id = ? AND revision = ?').bind(JSON.stringify(row.data),new Date().toISOString(),id,row.revision).run();if(!result.meta.changes)fail('This evening changed on another screen. Reload and try again.',409);}
function nightView(night){const meal=mealById(night.mealId);return {...night,mealName:meal.name,showName:(night.show||showById(night.showId)).name,ingredients:ingredients(meal,night.prefs.people,night.adapted),steps:recipeSteps(meal,night.adapted,night.prefs.cookLevel||'Regular')};}
export async function api(request,env){try{
 const u=new URL(request.url),parts=u.pathname.split('/').filter(Boolean),method=request.method;
 if(method!=='GET'&&request.headers.get('origin')&&request.headers.get('origin')!==u.origin)fail('Origin not allowed.',403);
 if(!env.DB)fail('Shared storage is temporarily unavailable. Please try again.',503);
 const db=env.DB;
 if(parts[1]==='companion-link')return await publicCompanion(request,env,{getHouse,saveHouse});
 if(['room','collection-share','collection-editor','photo'].includes(parts[1])){const response=await publicSocial(request,env);if(response)return response;}
 if(u.pathname==='/api/setup/tmdb')return json(await setupTmdb(request,env));
 if(u.pathname==='/api/household'&&method==='POST'){
  const key=token(),id=await hash(key),data={prefs:{...defaults},memory:{shorter:false,favoriteMeals:[],watched:[]},pantry:[],nights:[]};
  await db.prepare('INSERT INTO households (id,data,revision,updated) VALUES (?,?,0,?)').bind(id,JSON.stringify(data),new Date().toISOString()).run();return json({key,...data},201);
 }
 if(parts[1]==='shared'){
  const shareKey=parts[2];if(!validKey(shareKey))fail('This cooking link is invalid.',404);
  const share=await db.prepare('SELECT household,night,expires FROM shares WHERE id = ?').bind(await hash(shareKey)).first();if(!share||share.expires<Date.now())fail('This cooking link has expired. Create a new one on the TV.',404);
  const row=await getHouse(db,share.household),night=row.data.nights.find(n=>n.id===share.night);if(!night)fail('This night is no longer available.',404);
  if(parts[3]==='connect'&&method==='POST'){const now=Date.now();if(!night.phoneSeenAt||now-night.phoneSeenAt>20000){night.phoneOpenedAt ||= now;night.phoneSeenAt=now;await saveHouse(db,share.household,row);}return json(nightView(night));}
  if(parts[3]==='ai'&&method==='POST'){const b=await body(request.clone());if(b.mode!=='coach')fail('Only cooking help is available on this link.',403);return json(await aiRequest(new Request(request,{body:JSON.stringify({...b,nightId:night.id})}),env,{nights:[night],memory:{}},share.household,row.revision));}
  if(method==='GET')return json(nightView(night));
  if(method==='PATCH'){const b=await body(request);applyCooking(night,b);await saveHouse(db,share.household,row);return json(nightView(night));}
  fail('Method not allowed.',405);
 }
 const key=request.headers.get('x-household-key');if(!validKey(key))fail('Open a household first.',401);
 const id=await hash(key),row=await getHouse(db,id);
 const parent=await parentState(db,id);
 if(['parental','kids'].includes(parts[1]))return await parental(request,db,id,row.data,parent);
 if(parent?.enabled){if(parts[1]==='household'&&method==='GET')return json(kidsHouse(parent,row.data));fail('Kids Kitchen is on. Ask a parent to unlock the grown-up area.',403);}
 if(parts[1]==='companion'&&method==='POST'){const handoff=await createCompanion(env,id,row,await body(request));if(handoff.changed)await saveHouse(db,id,row);delete handoff.changed;return json(handoff);}
 if(['browse','curate','options','rooms','schedule','collections'].includes(parts[1])){const response=await social(request,env,{id,row,save:()=>saveHouse(db,id,row)});if(response)return response;}
 if(parts[1]==='memory'&&method==='PATCH'){
  const b=await body(request),arrays=['favoriteMeals','favoriteCuisines','dislikedIngredients','dislikedPairs','watched'],scalars=['shorter','preferredMood','preferredEffort'];
  if(!arrays.includes(b.field)&&!scalars.includes(b.field))fail('Choose a saved preference to remove.');
  if(arrays.includes(b.field)){if(typeof b.value!=='string')fail('Choose an item to remove.');row.data.memory[b.field]=(row.data.memory[b.field]||[]).filter(x=>x!==(b.field==='watched'?titleKey(b.value):b.field==='dislikedPairs'?canonicalPair(b.value):b.value));}else row.data.memory[b.field]=b.field==='shorter'?false:b.field==='preferredEffort'?'Any':null;
  row.data.aiHistory=[];delete row.data.recommendationCache;await saveHouse(db,id,row);return json(row.data);
 }
 if(parts[1]==='recommendations'&&method==='POST'){
  const b=await body(request),p=preferences(b.prefs||row.data.prefs),source=b.sourceId||'',mode=b.mode||'',dinnerAdapted=typeof b.dinnerAdapted==='boolean'?b.dinnerAdapted:undefined,surprise=b.surprise===true,excludeShowId=typeof b.excludeShowId==='string'?b.excludeShowId.slice(0,160):'',seed=typeof b.seed==='string'?b.seed.slice(0,64):'';
  if(b.options)row.data.options=validatePairingOptions(b.options);
  const signature=JSON.stringify({version:42,allowRecent:b.allowRecent===true,refinement:b.refinement,avoidCuisine:b.avoidCuisine,p,source,mode,dinnerAdapted,surprise,excludeShowId,seed,nights:row.data.nights.map(n=>[n.mealId,n.showId]),memory:row.data.memory,pantry:row.data.pantry,options:row.data.options,titles:(row.data.titles||[]).map(t=>t.id)});
  const cacheKey=await hash(signature),cache=row.data.recommendationCache?.[cacheKey];if(b.refresh!==true&&cache?.signature===signature&&cache.expires>Date.now())return json(cache.result);
  let result;try{result=await aiRequest(new Request(request,{body:JSON.stringify({mode:'plan',primary:true,allowRecent:b.allowRecent===true,refinement:b.refinement,avoidCuisine:b.avoidCuisine,dinnerAdapted,surprise,excludeShowId,seed,prefs:p,prompt:'Choose three different evenings using my current preferences, pantry and effective saved feedback.',...(mode==='watch'?{showId:source}:mode==='meal'?{mealId:source}:{})})}),{...env,AI_TIMEOUT_MS:45000},row.data,id,row.revision);if(!result.picks?.length)return json({...result,recommendationSource:'unavailable',answer:result.answer+' You can include previously shown meals or adjust your limits.'});result={...result,recommendationSource:'ai'};}catch(e){return json({recommendationSource:'unavailable',picks:[],answer:e.status===429?'The AI allowance is currently used up. Please try again later.':'AI could not create a grounded match right now. Please retry. No automatic pairing has been substituted.'});}
  result.picks=eveningStyles((result.picks||[]).map(pair=>({...pair,evidence:pairingEvidence(pair,p,row.data.memory)})),row.data.memory);
  const fresh=await getHouse(db,id);fresh.data.recentPairings=[...(fresh.data.recentPairings||[]),...result.picks.filter(p=>p.aiExplained).map(p=>({mealId:p.meal.id,showId:p.show.id,meal:p.meal.name,show:p.show.name,at:Date.now()}))].slice(-36);fresh.data.recommendationCache={...(fresh.data.recommendationCache||{}),[cacheKey]:{signature,expires:Date.now()+(result.recommendationSource==='ai'?1800000:60000),result}};fresh.data.recommendationCache=Object.fromEntries(Object.entries(fresh.data.recommendationCache).filter(([,c])=>c?.expires>Date.now()).sort((a,b)=>b[1].expires-a[1].expires).slice(0,6));await saveHouse(db,id,fresh);return json(result);
 }
 if(parts[1]==='ai'){
  const historyRequest=request.clone();
  const result=await aiRequest(request,env,row.data,id,row.revision);
  if(result.picks){const opts=row.data.options||{};if(opts.connectionMode&&opts.connectionMode!=='Mood')result.picks=result.picks.filter(p=>connection(p.meal,p.show).kind===opts.connectionMode);if(opts.services?.length){const accepted=[];for(const p of result.picks){const a=await availability(env,p.show,opts.region);if(a.subscription.some(s=>opts.services.includes(s.id)))accepted.push({...p,availability:a});}result.picks=accepted;}if(!result.picks.length)result.answer='No AI pairing meets your current connection and subscription filters. Adjust these settings or use the catalog pairing controls.';}
  if(method==='POST'&&result.mode==='plan'&&result.picks?.length){
   const fresh=await getHouse(db,id);fresh.data.titles=[...new Map([...(fresh.data.titles||[]),...result.picks.map(p=>p.show).filter(s=>s.custom||s.provider)].map(s=>[s.id,s])).values()].slice(-80);
   fresh.data.recentPairings=[...(fresh.data.recentPairings||[]),...result.picks.map(p=>({mealId:p.meal.id,showId:p.show.id,meal:p.meal.name,show:p.show.name,at:Date.now()}))].slice(-36);
   fresh.data.aiHistory=[...(fresh.data.aiHistory||[]),{request:(await historyRequest.json().catch(()=>({}))).prompt||'',answer:result.answer,prefs:result.prefs,choices:result.picks.map(p=>({meal:p.meal.name,show:p.show.name}))}].slice(-4);
   await saveHouse(db,id,fresh);
  }
  return json(result);
 }
 if(parts[1]==='catalog'&&method==='GET')return json(await catalogRequest(u,env));
 if(u.pathname==='/api/catalog/select'&&method==='POST'){const show=await selectShow(await body(request),env);row.data.titles=[show,...(row.data.titles||[]).filter(s=>s.id!==show.id)].slice(0,40);await saveHouse(db,id,row);return json(show);}
 if(u.pathname==='/api/household'&&method==='GET')return json(row.data);
 if(u.pathname==='/api/preferences'&&method==='PUT'){
  const b=await body(request);row.data.prefs=preferences(b.prefs);
  if(b.memory){const m=b.memory;if(typeof m.shorter!=='boolean'||(m.preferredMood&&!moods.includes(m.preferredMood)))fail('Invalid saved preference.');const disliked=m.dislikedIngredients??row.data.memory.dislikedIngredients??[],cuisines=m.favoriteCuisines??row.data.memory.favoriteCuisines??[],effort=m.preferredEffort??row.data.memory.preferredEffort??'Any';if(!Array.isArray(disliked)||disliked.length>20||disliked.some(x=>typeof x!=='string'||!x.trim()||x.length>60)||!Array.isArray(cuisines)||cuisines.some(x=>!['European','Mediterranean','Asian','Americas'].includes(x))||!['Any','Easy'].includes(effort))fail('Check your saved food preferences.');row.data.memory={...row.data.memory,shorter:m.shorter,preferredMood:m.preferredMood||null,dislikedIngredients:[...new Set(disliked.map(x=>x.trim().toLowerCase()))],favoriteCuisines:[...new Set(cuisines)],preferredEffort:effort};}
  await saveHouse(db,id,row);return json(row.data);
 }
 if(u.pathname==='/api/pantry'&&method==='PUT'){const b=await body(request);if(!Array.isArray(b.items)||b.items.length>60||b.items.some(s=>typeof s!=='string'||s.length>80))fail('Invalid pantry items.');row.data.pantry=[...new Set(b.items)];row.data.pantryUpdatedAt=Date.now();delete row.data.recommendationCache;await saveHouse(db,id,row);return json(row.data);}
 if(u.pathname==='/api/nights'&&method==='POST'){
  const b=await body(request),meal=mealById(b.mealId),show=showById(b.showId)||row.data.titles?.find(s=>s.id===b.showId)||row.data.nights.find(n=>n.showId===b.showId)?.show,prefs=preferences(b.prefs);if(!meal||!show||typeof b.adapted!=='boolean')fail('Please choose a valid pairing.');
  if(!dietFits(meal,prefs.diet))fail('This meal does not match your food preference.');
  const delivery=b.fulfillment==='delivery';if(prefs.diet==='Plant-based'&&!b.adapted&&!delivery)fail('Approve the plant-based adaptation before continuing.');
  if(b.fulfillment!==undefined&&!['cook','delivery'].includes(b.fulfillment))fail('Choose cook or delivery.');const required=ingredients(meal,prefs.people,b.adapted).map(x=>x.name);if(required.some(name=>(row.data.memory?.dislikedIngredients||[]).some(term=>name.toLowerCase().includes(term.toLowerCase()))))fail('This recipe contains an ingredient you excluded. Review the recipe or your saved preferences.');
  const group=b.groupKey?await approveGroup(env,id,b.groupKey,meal,show,prefs,b.adapted):null;if(!delivery&&(!Array.isArray(b.confirmed)||required.some(n=>!b.confirmed.includes(n))))fail('Confirm every ingredient before starting this night.');
  if(row.data.nights.length>=60)fail('Your collection has 60 nights. Remove an older night to make room.');
  const themed=movieNightById(b.themeId);const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');const themeId=themed&&themed.mealId===meal.id&&normalize(themed.movie)===normalize(show.name)&&themed.year===show.releaseYear?themed.id:null;
  const ai=b.ai&&typeof b.ai.reason==='string'?Object.fromEntries(['reason','ritual','tradeoff'].map(k=>[k,String(b.ai[k]||'').slice(0,700)])):null;
  if(b.planStart!==undefined&&(!Number.isFinite(b.planStart)||b.planStart<Date.now()-300000||b.planStart>Date.now()+7*86400000))fail('Choose a valid start time.');
  const night={ai,group,planStart:b.planStart??Date.now(),dinnerMinutes:25,id:crypto.randomUUID(),themeId,mealId:meal.id,showId:show.id,show,prefs,adapted:b.adapted,confirmed:delivery?[]:required,created:new Date().toISOString(),step:0,timer:null,status:'planned',feedback:null,watchStarted:null};if(delivery){if(!b.orderOut||!Number.isInteger(b.orderOut.etaMinutes)||b.orderOut.etaMinutes<15||b.orderOut.etaMinutes>120||!['doordash','ubereats'].includes(b.orderOut.provider))fail('Choose a delivery provider and enter its 15–120 minute estimate.');try{Object.assign(night,orderOutEvening(night,meal,show,b.orderOut.etaMinutes));Object.assign(night.orderPlan,{provider:b.orderOut.provider,strategy:['closest','fastest','group'].includes(b.orderOut.strategy)?b.orderOut.strategy:'closest',query:String(b.orderOut.query||meal.name).slice(0,160),budget:String(b.orderOut.budget||'').slice(0,40),placedAt:Number(b.orderOut.placedAt)||Date.now()});row.data.orderPreferences={provider:night.orderPlan.provider,strategy:night.orderPlan.strategy};}catch(e){fail(e.message);}}row.data.nights.unshift(night);row.data.prefs=prefs;await saveHouse(db,id,row);return json(night,201);
 }
 if(parts[1]==='nights'&&parts[2]){
  const night=row.data.nights.find(n=>n.id===parts[2]);if(!night)fail('This night could not be found.',404);
  if(parts[3]==='rescue'&&method==='POST'){
   if(night.status!=='planned'||night.watchStarted)fail('Rescue is available before cooking or viewing begins.');
   const b=await body(request),r=b.request;
   if(!r||!Number.isInteger(r.delay)||r.delay<0||r.delay>120||!Number.isInteger(r.people)||r.people<1||r.people>8||typeof r.allowWatchChange!=='boolean'||!Array.isArray(r.missing)||r.missing.length>20||r.missing.some(x=>typeof x!=='string'||!x.trim()||x.length>80))fail('Check the changed plans.');
   if(r.differentDinner!==undefined&&typeof r.differentDinner!=='boolean')fail('Check the dinner preference.');if(r.easier!==undefined&&typeof r.easier!=='boolean')fail('Check the effort preference.');if(r.faster!==undefined&&typeof r.faster!=='boolean')fail('Check the cooking preference.');if(r.maxCookTime!==undefined&&![15,30,45,60].includes(r.maxCookTime))fail('Choose a supported cooking time.');if(r.preferPantry!==undefined&&typeof r.preferPantry!=='boolean')fail('Check pantry preference.');
   const options=rescueOptions(night,r,row.data.memory,row.data.titles||[],row.data.pantry||[]);
   if(!b.apply)return json({options,revision:row.revision});
   if(b.revision!==row.revision)fail('This plan changed. Find rescue options again before approving.',409);
   const choice=options.find(o=>o.mealId===b.mealId&&o.showId===b.showId);if(!choice)fail('Choose an available rescue option.');
   if(row.data.options?.services?.length){const a=await availability(env,choice.show,row.data.options.region);if(!a.subscription.some(p=>row.data.options.services.includes(p.id)))fail('This title is no longer listed on your selected services. Find alternatives again.');}
   const meal=mealById(choice.mealId);if(typeof b.adapted!=='boolean'||(night.prefs.diet==='Plant-based'&&!b.adapted))fail('Review the recipe adaptation.');
   if(night.group&&!groupFits(night,meal,choice.show,r.people,b.adapted))fail('This change conflicts with the group’s food, ingredient, veto or viewing limits. Choose another option.');
   const needed=ingredients(meal,r.people,b.adapted).map(i=>i.name);if(!Array.isArray(b.confirmed)||needed.some(i=>!b.confirmed.includes(i)))fail('Confirm the updated ingredients.');
   if(needed.some(i=>r.missing.some(x=>i.toLowerCase().includes(x.toLowerCase()))))fail('The adapted recipe still contains a missing ingredient. Choose another option.');
   if(night.group)night.group.compromises=compromiseFacts({meal,show:choice.show},night.group.members||[]);
   night.rescue={fromMeal:night.mealId,fromShow:night.showId,delay:r.delay,minutesSaved:choice.minutesSaved,at:new Date().toISOString()};
   Object.assign(night,{mealId:meal.id,showId:choice.showId,show:choice.show,prefs:{...night.prefs,people:r.people,effort:r.easier?'Easy':night.prefs.effort,cookTime:r.maxCookTime||night.prefs.cookTime,format:r.allowWatchChange?'Any':night.prefs.format},adapted:b.adapted,confirmed:needed,themeId:null,ai:null,step:0,timer:null,planStart:Math.max(night.planStart||Date.parse(night.created),Date.now())+r.delay*60000});
   await saveHouse(db,id,row);return json(nightView(night));
  }
  if(method==='GET')return json(nightView(night));
  if(parts[3]==='share'&&method==='POST'){const shareKey=token(),expires=Date.now()+4*3600000;await db.prepare('DELETE FROM shares WHERE household = ? AND night = ?').bind(id,night.id).run();await db.prepare('INSERT INTO shares (id,household,night,expires) VALUES (?,?,?,?)').bind(await hash(shareKey),id,night.id,expires).run();return json({key:shareKey,nightId:night.id,expires});}
  if(parts[3]==='share'&&method==='DELETE'){await db.prepare('DELETE FROM shares WHERE household = ? AND night = ?').bind(id,night.id).run();delete night.phoneOpenedAt;delete night.phoneSeenAt;await saveHouse(db,id,row);return json(nightView(night));}
  if(method==='DELETE'){row.data.nights=row.data.nights.filter(n=>n.id!==night.id);await saveHouse(db,id,row);await db.prepare('DELETE FROM shares WHERE household = ? AND night = ?').bind(id,night.id).run();return json(row.data);}
  if(parts[3]==='feedback'&&method==='POST'){
   const b=await body(request);if(!['again','okay','skip'].includes(b.meal)||!['great','okay','miss'].includes(b.pairing)||typeof b.shorter!=='boolean'||typeof b.rememberMood!=='boolean')fail('Please complete your feedback.');
   night.feedback={meal:b.meal,pairing:b.pairing,shorter:b.shorter,rememberMood:b.rememberMood,rememberCuisine:b.rememberCuisine===true,preferEasy:b.preferEasy===true};night.status='complete';row.data.memory=feedbackMemory(row.data.memory,night,night.feedback);await saveHouse(db,id,row);return json(row.data);
  }
  if(method==='PATCH'){const b=await body(request);if(b.delayMinutes!==undefined){try{Object.assign(night,delayEvening(night,b.delayMinutes));}catch(e){fail(e.message);}}else if(b.orderOut!==undefined){if(!b.orderOut||!Number.isInteger(b.orderOut.etaMinutes)||b.orderOut.etaMinutes<15||b.orderOut.etaMinutes>120||!['doordash','ubereats'].includes(b.orderOut.provider))fail('Choose a delivery provider and enter its 15–120 minute estimate.');try{const placedAt=night.orderPlan?.placedAt||Number(b.orderOut.placedAt)||Date.now();Object.assign(night,orderOutEvening(night,mealById(night.mealId),night.show||showById(night.showId),b.orderOut.etaMinutes));Object.assign(night.orderPlan,{provider:b.orderOut.provider,strategy:['closest','fastest','group'].includes(b.orderOut.strategy)?b.orderOut.strategy:'closest',query:String(b.orderOut.query||mealById(night.mealId).name).slice(0,160),budget:String(b.orderOut.budget||'').slice(0,40),placedAt});row.data.orderPreferences={provider:night.orderPlan.provider,strategy:night.orderPlan.strategy};}catch(e){fail(e.message);}}else if(b.fulfillment==='cook'){if(night.status!=='planned'||night.watchStarted)fail('Return to cooking before cooking or viewing begins.');night.planStart=night.scheduleChange?.kind==='order-out'?night.scheduleChange.previousStart:Date.now();delete night.fulfillment;delete night.orderPlan;delete night.scheduleChange;}else if(b.planStart!==undefined){if(!Number.isFinite(b.planStart)||b.planStart<Date.now()-86400000||b.planStart>Date.now()+366*86400000||!Number.isInteger(b.dinnerMinutes)||b.dinnerMinutes<10||b.dinnerMinutes>120)fail('Choose a valid start time and 10–120 minutes for dinner.');night.planStart=b.planStart;night.dinnerMinutes=b.dinnerMinutes;delete night.scheduleChange;}else if(b.watchStarted===true)night.watchStarted=Date.now();else applyCooking(night,b);await saveHouse(db,id,row);return json(nightView(night));}
 }
 fail('Not found.',404);
 }catch(error){return json({error:error.status?error.message:'Unable to save right now. Please try again.'},error.status||500);}}
function applyCooking(night,b){const max=mealById(night.mealId).steps.length-1;
 if(b.mealId!==undefined&&b.mealId!==night.mealId)fail('The recipe changed. Refresh the cooking steps before continuing.',409);
 if(b.step!==undefined){if(!Number.isInteger(b.step)||b.step<0||b.step>max)fail('Invalid cooking step.');night.step=b.step;night.status='cooking';night.timer=null;night.progressAt=Date.now();}
 if(b.timer!==undefined){if(b.timer!==null&&(!Number.isFinite(b.timer)||b.timer<Date.now()-1000||b.timer>Date.now()+7200000))fail('Invalid timer.');night.timer=b.timer;if(b.timer!==null)night.status='cooking';}
 if(b.complete===true){night.status='ready';night.timer=null;night.readyAt=Date.now();}
}
const worker={async fetch(request,env){const url=new URL(request.url);if(url.pathname.startsWith('/api/'))return api(request,env);if(url.pathname==='/app')return Response.redirect(url.origin+'/app/',302);if(env.ASSETS){const response=await env.ASSETS.fetch(request);const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','no-referrer');return new Response(response.body,{status:response.status,headers});}return new Response('Not found',{status:404});}};

export default worker;

