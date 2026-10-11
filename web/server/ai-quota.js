export const HOUSEHOLD_AI_LIMIT=1000;
export const GLOBAL_AI_LIMIT=2000;

export async function reserveAI(db,id,now=Date.now()){
 const day=new Date(now).toISOString().slice(0,10),resetsAt=Date.parse(day+'T00:00:00Z')+86400000;
 const household=id+':'+day,global='global:'+day;
 const reserve=(key,limit)=>db.prepare('INSERT INTO ai_usage (id,count) VALUES (?,1) ON CONFLICT(id) DO UPDATE SET count=count+1 WHERE count < ?').bind(key,limit).run();
 const exhausted=scope=>{
  const minutes=Math.ceil((resetsAt-now)/60000),wait=minutes>=60?Math.floor(minutes/60)+'h '+minutes%60+'m':minutes+'m';
  return Object.assign(Error(`Today's ${scope==='household'?'household':'site-wide'} AI allowance is used up. It resets in ${wait} (midnight UTC). Your saved evenings and cooking tools still work.`),{status:429,code:'AI_ALLOWANCE_EXHAUSTED',scope,resetsAt});
 };
 // Reserve the household first so rejected retries cannot consume the shared allowance.
 if(!(await reserve(household,HOUSEHOLD_AI_LIMIT)).meta.changes)throw exhausted('household');
 try{
  if(!(await reserve(global,GLOBAL_AI_LIMIT)).meta.changes)throw exhausted('global');
 }catch(error){
  await db.prepare('UPDATE ai_usage SET count=count-1 WHERE id=? AND count>0').bind(household).run();
  throw error;
 }
}
