import {ingredientKey} from '../product/ingredients.js';
import {mealById} from '../product/catalog.js';
import {ingredients} from '../product/engine.js';
import {orderBrief} from '../product/evening.js';
import {aiRequest} from './ai.js';

const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const token=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
const reply=data=>new Response(JSON.stringify(data),{headers:{'content-type':'application/json','cache-control':'no-store','referrer-policy':'no-referrer'}});
const normalize=s=>s.trim().toLowerCase();
function section(name){const n=normalize(name);if(/chicken|beef|pork|turkey|salmon|tuna|shrimp|cod|sausage|lamb/.test(n))return 'Meat & seafood';if(/milk|cheese|butter|yogurt|cream|egg|mozzarella|parmesan/.test(n))return 'Dairy & eggs';if(/bread|tortilla|bun|pita|flatbread/.test(n))return 'Bakery';if(/tomato|onion|garlic|pepper|lemon|lime|lettuce|spinach|mushroom|carrot|potato|avocado|basil|parsley|cucumber|zucchini|broccoli/.test(n)&&!/canned|dried|powder|sauce|paste/.test(n))return 'Produce';return 'Pantry & other';}
function shopping(n,house){const meal=mealById(n.mealId),items=ingredients(meal,n.prefs.people,n.adapted).map(i=>({...i,section:section(i.name),pantryListed:(house.pantry||[]).some(p=>ingredientKey(p)===ingredientKey(i.name))}));const signature=JSON.stringify([n.mealId,n.prefs.people,n.adapted,items.map(i=>[i.name,i.amount,i.unit])]);const saved=n.shopping?.signature===signature?n.shopping:null;return {kind:'shopping',meal:meal.name,show:n.show?.name,people:n.prefs.people,mealId:n.mealId,adapted:n.adapted,signature,items,revision:n.shopping?.revision||0,approved:!!saved,enough:saved?.enough||[],missing:saved?items.filter(i=>!saved.enough.includes(i.name)):null};}

export async function createCompanion(env,id,row,b){
 if(!['pantry','shopping','order'].includes(b.kind))fail('Choose a phone handoff.');
 if(b.kind==='shopping'&&!row.data.nights.some(n=>n.id===b.nightId))fail('Save this evening first.',404);
 let changed=false,session;
 if(b.kind==='pantry')session='pantry:'+crypto.randomUUID();
 else if(b.kind==='shopping')session='shopping:'+b.nightId;
 else{
  const d=b.draft||{},meal=mealById(d.mealId),show=d.showId&&(d.show||row.data.titles?.find(s=>s.id===d.showId)||row.data.nights.find(n=>n.showId===d.showId)?.show);
  if(!meal||!show||!d.prefs||!Number.isInteger(d.prefs.people)||d.prefs.people<1||d.prefs.people>8)fail('Choose a valid pairing before ordering.');
  const brief=orderBrief(meal,d.prefs),strategy=brief.strategies.find(x=>x.id===b.strategy)?.id||'closest';session='order:'+crypto.randomUUID();
  const entry={session,nightId:typeof b.nightId==='string'?b.nightId:null,mealId:meal.id,mealName:meal.name,showId:d.showId,showName:String(show.name||'Your watch').slice(0,160),people:brief.people,diet:brief.diet,budget:brief.budget,strategies:brief.strategies,selectedStrategy:strategy,preferredProvider:row.data.orderPreferences?.provider||'',createdAt:Date.now(),confirmation:null};
  row.data.orderHandoffs=[entry,...(row.data.orderHandoffs||[]).filter(x=>x.createdAt>Date.now()-86400000)].slice(0,5);changed=true;
 }
 const key=token(),expires=Date.now()+(b.kind==='pantry'?3600000:b.kind==='order'?2*3600000:7*86400000);
 await env.DB.prepare('DELETE FROM shares WHERE household=? AND expires<?').bind(id,Date.now()).run();
 await env.DB.prepare('INSERT INTO shares(id,household,night,expires) VALUES(?,?,?,?)').bind(await digest(key),id,session,expires).run();
 return {key,session,expires,kind:b.kind,changed};
}

export async function publicCompanion(req,env,{getHouse,saveHouse}){
 const u=new URL(req.url),a=u.pathname.split('/').filter(Boolean),key=a[2];
 if(!/^[a-f0-9]{64}$/.test(key||''))fail('This phone link is invalid.',404);
 const share=await env.DB.prepare('SELECT household,night,expires FROM shares WHERE id=?').bind(await digest(key)).first();
 if(!share||share.expires<Date.now()||!/^pantry:|^shopping:|^order:/.test(share.night))fail('This link expired. Create another on the TV.',404);
 const row=await getHouse(env.DB,share.household),house=row.data;
 if(share.night.startsWith('pantry:')){
  if(req.method==='GET')return reply({revision:await digest(JSON.stringify(house.pantry||[])),kind:'pantry',items:house.pantry||[],expires:share.expires,confirmed:house.pantryConfirmedSession===share.night});
  if(req.method!=='POST')fail('Method not allowed.',405);
  const raw=await req.text();if(raw.length>1450000)fail('Choose a smaller photo.',413);let b;try{b=JSON.parse(raw);}catch{fail('Invalid request.');}
  if(a[3]==='identify')return reply(await aiRequest(new Request(req,{body:JSON.stringify({mode:'pantry',image:b.image})}),env,house,share.household,row.revision));
  if(a[3]!=='confirm')fail('Not found.',404);
  if(!Array.isArray(b.items)||b.items.length>60||b.items.some(s=>typeof s!=='string'||!s.trim()||s.length>80))fail('Review up to 60 ingredient names.');
  if(b.revision!==await digest(JSON.stringify(house.pantry||[])))fail('The pantry changed on another screen. Reload the latest pantry before confirming.',409);
  house.pantry=[...new Set(b.items.map(s=>s.trim()))];house.pantryUpdatedAt=Date.now();house.pantryConfirmedSession=share.night;delete house.recommendationCache;
  await saveHouse(env.DB,share.household,row);return reply({confirmed:true,revision:await digest(JSON.stringify(house.pantry)),items:house.pantry});
 }
 if(share.night.startsWith('order:')){
  const handoff=(house.orderHandoffs||[]).find(x=>x.session===share.night);if(!handoff)fail('This order handoff is no longer available.',404);
  const view={kind:'order',meal:handoff.mealName,show:handoff.showName,people:handoff.people,diet:handoff.diet,budget:handoff.budget,strategies:handoff.strategies,selectedStrategy:handoff.selectedStrategy,preferredProvider:handoff.preferredProvider,confirmation:handoff.confirmation,expires:share.expires};
  if(req.method==='GET')return reply(view);
  if(req.method!=='POST'||a[3]!=='confirm')fail('Method not allowed.',405);
  const raw=await req.text();if(raw.length>5000)fail('Request too large.',413);let b;try{b=JSON.parse(raw);}catch{fail('Invalid request.');}
  const strategy=handoff.strategies.find(x=>x.id===b.strategy),provider=b.provider,etaMinutes=Number(b.etaMinutes);
  if(!strategy)fail('Choose an ordering strategy.');if(!['doordash','ubereats'].includes(provider))fail('Choose DoorDash or Uber Eats.');if(!Number.isInteger(etaMinutes)||etaMinutes<15||etaMinutes>120)fail('Enter the provider estimate from 15 to 120 minutes.');if(handoff.confirmation)return reply(view);
  handoff.confirmation={provider,etaMinutes,strategy:strategy.id,query:strategy.query,budget:handoff.budget,placedAt:Date.now()};await saveHouse(env.DB,share.household,row);
  return reply({...view,selectedStrategy:strategy.id,confirmation:handoff.confirmation});
 }
 const n=house.nights.find(n=>n.id===share.night.slice('shopping:'.length));if(!n)fail('This evening was removed.',404);
 let data=shopping(n,house);
 if(req.method==='GET')return reply({...data,expires:share.expires});
 if(req.method!=='POST'||a[3]!=='confirm')fail('Method not allowed.',405);
 const raw=await req.text();if(raw.length>15000)fail('Request too large.',413);let b;try{b=JSON.parse(raw);}catch{fail('Invalid request.');}
 if(b.revision!==data.revision)fail('Someone updated the shopping list. Refresh the approved plan before confirming your changes.',409);
 if(b.signature!==data.signature)fail('The recipe or guest count changed. Refresh before confirming.',409);
 if(!Array.isArray(b.enough)||b.enough.some(name=>!data.items.some(i=>i.name===name)))fail('Confirm ingredients from this recipe.');
 n.shopping={revision:data.revision+1,signature:data.signature,enough:[...new Set(b.enough)],approvedAt:Date.now()};await saveHouse(env.DB,share.household,row);
 return reply(shopping(n,house));
}
