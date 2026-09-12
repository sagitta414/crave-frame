import test from 'node:test';
import assert from 'node:assert/strict';
import {eveningStage,tasteClusters,voteSummary} from '../src/experience-model.js';
import {delayEvening,eveningTimeline,orderOutEvening,readyTogetherPlan} from '../src/catalog/evening.js';
test('timeline uses saved actions, never elapsed planning estimates',()=>{
 assert.equal(eveningStage({status:'planned',step:0,planStart:1}),0);
 assert.equal(eveningStage({status:'cooking',step:0}),0);
 assert.equal(eveningStage({status:'cooking',step:2}),1);
 assert.equal(eveningStage({status:'ready',step:3}),2);
 assert.equal(eveningStage({status:'ready',watchStarted:123}),3);
});
test('constellation groups actual evenings and counts positive feedback only',()=>{
 const nights=[{mealId:'a',prefs:{mood:'Cozy'},feedback:{meal:'again'}},{mealId:'b',prefs:{mood:'Cozy'},feedback:{meal:'skip'}},{mealId:'c',prefs:{mood:'Adventure'}}];
 const groups=tasteClusters(nights,id=>({cuisine:id==='c'?'Italian':'Mexican'}));
 assert.equal(groups.length,2);assert.equal(groups[0].nights.length,2);assert.equal(groups[0].again,1);assert.equal(tasteClusters([],()=>null).length,0);
});
test('group reveal reports ties and counts votes without mutating the shortlist',()=>{
 const picks=[{meal:{id:'a'},show:{id:'a'}},{meal:{id:'b'},show:{id:'b'}}],room={picks,members:[{vote:'b:b'},{vote:'a:a'},{}],votes:{'a:a':1,'b:b':1}};
 assert.equal(voteSummary(room).tied,true);assert.equal(voteSummary(room).total,2);
 assert.equal(voteSummary({...room,votes:{'b:b':2}}).top.meal.id,'b');assert.equal(picks[0].meal.id,'a');
});
test('delay shifts the schedule while preserving the selected dinner and watch',()=>{
 const now=1_800_000_000_000,night={status:'planned',planStart:now+10*60000,created:new Date(now).toISOString(),mealId:'meal-1',showId:'show-1',dinnerMinutes:25},meal={minutes:30},show={minutes:90};
 const before=eveningTimeline(night,meal,show),afterNight=delayEvening(night,30,now),after=eveningTimeline(afterNight,meal,show);
 assert.equal(afterNight.mealId,night.mealId);assert.equal(afterNight.showId,night.showId);assert.equal(afterNight.scheduleChange.minutes,30);
 assert.deepEqual(after.map((item,i)=>item.at-before[i].at),[30,30,30,30,30].map(x=>x*60000));
 assert.throws(()=>delayEvening(night,25,now));
});
test('order out preserves the pairing and rebuilds the timeline around delivery',()=>{
 const now=1_800_000_000_000,night={status:'planned',planStart:now,created:new Date(now).toISOString(),mealId:'meal-1',showId:'show-1',dinnerMinutes:25},meal={minutes:30},show={minutes:90};
 const ordered=orderOutEvening(night,meal,show,35,now),timeline=eveningTimeline(ordered,meal,show);
 assert.equal(ordered.mealId,night.mealId);assert.equal(ordered.showId,night.showId);assert.equal(ordered.fulfillment,'delivery');
 assert.equal(ordered.orderPlan.arrivalAt,now+35*60000);assert.equal(timeline[0].label,'Order marked placed');assert.equal(timeline[1].label,'Estimated delivery window');assert.equal(timeline[2].at,ordered.orderPlan.arrivalAt);assert.equal(timeline[3].at,ordered.orderPlan.watchAt);
 const exact=orderOutEvening(night,meal,show,42,now);assert.equal(exact.orderPlan.etaMinutes,42);
 assert.throws(()=>orderOutEvening(night,meal,show,10,now));assert.throws(()=>orderOutEvening(night,meal,show,121,now));
});
test('ready together moves serving and watch estimates when cooking runs late',()=>{
 const now=1_800_000_000_000,meal={minutes:30},show={minutes:90},steps=[{},{},{},{}];
 const night={status:'cooking',step:1,planStart:now-35*60000,progressAt:now,created:new Date(now).toISOString(),dinnerMinutes:25};
 const plan=readyTogetherPlan(night,meal,show,steps,now);
 const fiveMinutesLater=readyTogetherPlan(night,meal,show,steps,now+5*60000);
 assert.equal(plan.state,'cooking');
 assert.ok(plan.shiftMinutes>0);
 assert.equal(fiveMinutesLater.schedule[2].at,plan.schedule[2].at);
 assert.equal(plan.schedule[3].at,plan.schedule[2].at+25*60000);
 assert.equal(plan.schedule[4].at,plan.schedule[3].at+90*60000);
});
