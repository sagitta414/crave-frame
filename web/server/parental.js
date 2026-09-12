import {shows,meals} from '../product/catalog.js';
import {dietFits} from '../product/diets.js';
import {ingredients,recipeSteps} from '../product/engine.js';
import {kidsSteps} from '../product/kids-cooking.js';
const fail=(message,status=403)=>{throw Object.assign(Error(message),{status});};
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
export const parentState=(db,id)=>db.prepare('SELECT * FROM parent_controls WHERE household=?').bind(id).first();
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const activeSession=p=>{try{const session=JSON.parse(p?.session||'null');return session?.expires>Date.now()?session:null;}catch{return null;}};
const available=()=>shows.filter(s=>s.family===true);
const approvedShows=p=>available().filter(s=>JSON.parse(p?.approved||'[]').includes(s.id));
const safeShow=s=>({id:s.id,name:s.name,kind:s.kind,minutes:s.minutes,image:s.image,posterPath:s.posterPath,backdropPath:s.backdropPath,family:true});
export function kidsHouse(p,house){return {kidsMode:true,prefs:{...house.prefs,family:true,cookLevel:'Beginner'},memory:{},pantry:[],nights:[],titles:[],kidsTitles:approvedShows(p).map(safeShow)};}
async function pinHash(pin,salt){const enc=new TextEncoder(),key=await crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256);return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');}
async function verify(db,id,p,pin){if(!p)fail('Set up a parent PIN first.');if(p.locked_until>Date.now())fail('Too many attempts. Try again in 15 minutes.',429);const candidate=typeof pin==='string'&&/^\d{6}$/.test(pin)?await pinHash(pin,p.salt):'';let diff=candidate.length^p.pin_hash.length;for(let i=0;i<p.pin_hash.length;i++)diff|=(candidate.charCodeAt(i)||0)^p.pin_hash.charCodeAt(i);if(diff){await db.prepare('UPDATE parent_controls SET attempts=CASE WHEN locked_until>0 AND locked_until<=? THEN 1 ELSE attempts+1 END, locked_until=CASE WHEN (CASE WHEN locked_until>0 AND locked_until<=? THEN 1 ELSE attempts+1 END)>=5 THEN ? ELSE 0 END WHERE household=?').bind(Date.now(),Date.now(),Date.now()+900000,id).run();fail('That PIN did not match.');}await db.prepare('UPDATE parent_controls SET attempts=0,locked_until=0 WHERE household=?').bind(id).run();}
function childMeals(house){return meals.filter(m=>m.familiar&&m.minutes<=house.prefs.cookTime&&dietFits(m,house.prefs.diet)&&!(house.memory?.dislikedMeals||[]).includes(m.id)&&!ingredients(m,house.prefs.people,house.prefs.diet==='Plant-based').some(i=>(house.memory?.dislikedIngredients||[]).some(x=>i.name.toLowerCase().includes(x.toLowerCase()))));}
export async function parental(request,db,id,house,p){const url=new URL(request.url),kind=url.pathname.split('/')[2];if(request.method==='GET'&&kind==='kids')return reply({session:p?.enabled?activeSession(p):null});if(request.method==='GET')return reply(p?.enabled?{hasPin:true,enabled:true}:{hasPin:!!p,enabled:false,helperLevel:p?.helper_level||'Little helper',hasRecovery:!!p?.recovery_hash,approvedShowIds:JSON.parse(p?.approved||'[]'),titles:available().map(safeShow)});const raw=await request.text();if(raw.length>5000)fail('Request too large.',413);let b;try{b=JSON.parse(raw);}catch{fail('Check your request.',400);}
 if(kind==='parental'){
  if(!['enable','disable','change-pin','recovery-code','recover'].includes(b.action))fail('Choose a parent action.',400);
  if(b.action==='recover'){
   if(!p?.recovery_hash)fail('Use the recovery code saved by your parent.');
   if(p.locked_until>Date.now())fail('Too many attempts. Try again in 15 minutes.',429);
   if(typeof b.recoveryCode!=='string'||await digest(b.recoveryCode.trim().toUpperCase())!==p.recovery_hash){await verify(db,id,p,'');}
   if(typeof b.newPin!=='string'||!/^\d{6}$/.test(b.newPin))fail('Choose a six-digit PIN.',400);
   const salt=crypto.randomUUID();await db.prepare('UPDATE parent_controls SET salt=?,pin_hash=?,recovery_hash=NULL,enabled=0,session=NULL,attempts=0,locked_until=0 WHERE household=?').bind(salt,await pinHash(b.newPin,salt),id).run();return reply({recovered:true});
  }
  if(p)await verify(db,id,p,b.pin);else if(b.action!=='enable'||typeof b.pin!=='string'||!/^\d{6}$/.test(b.pin))fail('Choose a six-digit parent PIN.',400);
  if(b.action==='recovery-code'){const code=crypto.randomUUID().toUpperCase();await db.prepare('UPDATE parent_controls SET recovery_hash=? WHERE household=?').bind(await digest(code),id).run();return reply({recoveryCode:code});}
  if(b.action==='disable'){await db.prepare('UPDATE parent_controls SET enabled=0,session=NULL WHERE household=?').bind(id).run();return reply({enabled:false});}
  if(b.action==='change-pin'){if(typeof b.newPin!=='string'||!/^\d{6}$/.test(b.newPin))fail('Choose a six-digit PIN.',400);const salt=crypto.randomUUID();await db.prepare('UPDATE parent_controls SET salt=?,pin_hash=? WHERE household=?').bind(salt,await pinHash(b.newPin,salt),id).run();return reply({changed:true});}
  if(!Array.isArray(b.approvedShowIds)||!b.approvedShowIds.length||b.approvedShowIds.length>40||b.approvedShowIds.some(id=>!available().some(s=>s.id===id)))fail('Choose at least one title from the family shortlist.',400);
  if(!p){const salt=crypto.randomUUID();await db.prepare('INSERT INTO parent_controls(household,salt,pin_hash,enabled,approved) VALUES(?,?,?,1,?)').bind(id,salt,await pinHash(b.pin,salt),JSON.stringify([...new Set(b.approvedShowIds)])).run();}else await db.prepare('UPDATE parent_controls SET enabled=1,approved=? WHERE household=?').bind(JSON.stringify([...new Set(b.approvedShowIds)]),id).run();
  const helperLevel=['Little helper','Growing cook'].includes(b.helperLevel)?b.helperLevel:'Little helper';await db.prepare('UPDATE parent_controls SET helper_level=?,session=NULL WHERE household=?').bind(helperLevel,id).run();
  const code=!p?.recovery_hash?crypto.randomUUID().toUpperCase():null;if(code)await db.prepare('UPDATE parent_controls SET recovery_hash=? WHERE household=?').bind(await digest(code),id).run();
  await db.prepare('DELETE FROM shares WHERE household=?').bind(id).run();return reply({enabled:true,recoveryCode:code});
 }
 if(!p?.enabled)fail('Open Kids Kitchen first.');
 if(b.action==='progress'||b.action==='finish'){
  const session=activeSession(p);if(!session||session.id!==b.sessionId)fail('This cooking session has ended. Ask your grown-up to start again.',409);
  if(b.action==='finish'){await db.prepare('UPDATE parent_controls SET session=NULL WHERE household=? AND session=?').bind(id,p.session).run();return reply({finished:true});}
  if(!Number.isInteger(b.step)||b.step<0||b.step>=session.recipe.steps.length||Math.abs(b.step-session.step)>1)fail('Choose the current or next recipe step.',400);
  if(typeof b.done!=='boolean'||b.done&&b.step!==session.recipe.steps.length-1)fail('Finish the recipe steps first.',400);
  const seconds=session.recipe.steps[b.step].seconds||0;
  session.timer=b.timer==='start'?Date.now()+seconds*1000:b.timer==='clear'||b.step!==session.step?0:session.timer;
  session.step=b.step;session.done=b.done;
  const saved=await db.prepare('UPDATE parent_controls SET session=? WHERE household=? AND session=?').bind(JSON.stringify(session),id,p.session).run();if(!saved.meta.changes)fail('Progress changed on another screen. Reload to continue.',409);
  return reply({session});
 }
 if(!approvedShows(p).some(s=>s.id===b.showId))fail('Ask a parent to approve this title.');
 if(b.action==='choices')return reply({meals:childMeals(house).map(m=>({id:m.id,name:m.name,minutes:m.minutes,image:m.image})),source:'Family recipe shelf — choose your dinner together.'});
 if(b.action==='recipe'){await verify(db,id,p,b.pin);const meal=childMeals(house).find(m=>m.id===b.mealId);if(!meal)fail('This recipe does not fit your household food settings.');const adapted=house.prefs.diet==='Plant-based';const recipe={meal:{id:meal.id,name:meal.name},people:house.prefs.people,ingredients:ingredients(meal,house.prefs.people,adapted),steps:kidsSteps(recipeSteps(meal,adapted,'Confident'),meal,p.helper_level)};const session={id:crypto.randomUUID(),showId:b.showId,expires:Date.now()+4*3600000,recipe,step:0,timer:0,done:false};await db.prepare('UPDATE parent_controls SET session=? WHERE household=?').bind(JSON.stringify(session),id).run();return reply({...recipe,session});}
 fail('Choose an activity.',400);
}
