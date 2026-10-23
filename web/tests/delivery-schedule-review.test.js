import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults} from '../product/catalog.js';
import {api} from '../server/worker.js';
import {openDb} from '../server/local-db.js';

for(const platform of ['../product/evening.js','../../tv/src/catalog/evening.js']){
 const {eveningTimeline,delayEvening,orderOutEvening}=await import(platform);
 test(`${platform}: updated delivery waiting duration ends at the actual estimated arrival`,()=>{
  const start=1800000000000,minute=60000,meal={minutes:20},show={minutes:90};
  const base={status:'planned',planStart:start,dinnerMinutes:25};
  const order=orderOutEvening(base,meal,show,30,start+20*minute);
  order.orderPlan.orderAt=start;
  order.orderPlan.estimateUpdatedAt=start+20*minute;
  const timeline=eveningTimeline(order,meal,show);
  assert.equal(timeline[1].at+timeline[1].minutes*minute,timeline[2].at);
  assert.equal(timeline[0].at,start);
  assert.equal(timeline[2].at,start+50*minute);
  assert.throws(()=>delayEvening(order,15,start),/delivery estimate/i);
 });
}

test('delivery delay request fails without silently editing the saved plan',async()=>{
 const DB=openDb();
 try{
  const call=async(path,method,body,key)=>{
   const r=await api(new Request('https://test/api/'+path,{method,headers:{'x-household-key':key||''},...(body?{body:JSON.stringify(body)}:{})}),{DB});
   return {status:r.status,data:await r.json()};
  };
  const {data:house}=await call('household','POST',{});
  const {data:night,status}=await call('nights','POST',{mealId:'mushroom-toast',showId:'last-guest',prefs:defaults,adapted:false,confirmed:[],fulfillment:'delivery',orderOut:{provider:'doordash',etaMinutes:35}},house.key);
  assert.equal(status,201);
  const response=await call('nights/'+night.id,'PATCH',{delayMinutes:15},house.key);
  assert.equal(response.status,400);
  const {data:saved}=await call('nights/'+night.id,'GET',null,house.key);
  assert.equal(saved.planStart,night.planStart);
  assert.deepEqual(saved.orderPlan,night.orderPlan);
 }finally{DB.close();}
});
