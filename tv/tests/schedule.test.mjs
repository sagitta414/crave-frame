import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectEvening} from '../src/schedule.js';
import {mealById,showById,defaults} from '../src/catalog/catalog.js';
import {recipeSteps} from '../src/catalog/engine.js';
import {delayEvening,readyTogetherPlan,orderOutEvening} from '../src/catalog/evening.js';
const start=1800000000000,minute=60000,meal=mealById('pepper-pasta'),show=showById('ratatouille');
const base={status:'planned',planStart:start,created:new Date(start).toISOString(),prefs:defaults,step:0,adapted:false,dinnerMinutes:25};
test('delayed cooking and late progress project current dinner and watch without editing the plan',()=>{
 const now=start+45*minute,cooking={...base,status:'cooking',cookingStartedAt:start,progressAt:now,step:1};
 const original=structuredClone(cooking),before=projectEvening(cooking,meal,show,now);
 assert.ok(before.schedule[2].at>start+meal.minutes*minute);
 const delayed=delayEvening(cooking,15,now,before.schedule[2].at),after=projectEvening(delayed,meal,show,now);
 assert.equal(after.schedule[2].at,before.schedule[2].at+15*minute);
 assert.equal(after.schedule[3].at,after.schedule[2].at+25*minute);
 assert.deepEqual(cooking,original);
 for(const n of [cooking,delayed])assert.deepEqual(projectEvening(n,meal,show,now).schedule,readyTogetherPlan(n,meal,show,recipeSteps(meal,n.adapted,n.prefs.cookLevel,n.prefs.people),now).schedule);
});
test('planned, ready, delivery and viewing schedules retain their anchors',()=>{
 const planned=projectEvening(base,meal,show,start).schedule;
 assert.equal(planned[2].at,start+meal.minutes*minute);
 const readyAt=start+50*minute;
 const ready=projectEvening({...base,status:'ready',readyAt},meal,show,readyAt+minute).schedule;
 assert.equal(ready[2].at,readyAt);assert.equal(ready[3].at,readyAt+25*minute);
 const delivery=orderOutEvening(base,meal,show,50,start);
 const schedule=projectEvening(delivery,meal,show,start).schedule;
 assert.equal(schedule[2].at,delivery.orderPlan.arrivalAt);assert.equal(schedule[3].at,delivery.orderPlan.watchAt);
 assert.equal(projectEvening({...base,watchStarted:readyAt},meal,show,readyAt).schedule[3].at,readyAt);
});
test('dashboard, Tonight strip, live timeline and preview all use the shared projection',()=>{
 for(const file of ['../src/EveningDashboard.tsx','../App.tsx','../src/Experience.tsx']){
  const source=readFileSync(new URL(file,import.meta.url),'utf8');
  assert.match(source,/projectEvening/);assert.doesNotMatch(source,/eveningTimeline|readyTogetherPlan/);
 }
});
