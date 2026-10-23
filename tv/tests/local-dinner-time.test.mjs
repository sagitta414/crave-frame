import test from 'node:test';
import assert from 'node:assert/strict';
import {parseLocalDinnerTime} from '../src/local-dinner-time.js';
test('impossible dinner dates and malformed times are rejected instead of normalized',()=>{
 for(const date of ['2026-02-30','2026-02-29','2026-04-31','2026-13-01','2026-00-01','2026-01-00'])assert.throws(()=>parseLocalDinnerTime(date,'19:30'),/valid calendar/);
 for(const time of ['24:00','19:60','7:30','bad'])assert.throws(()=>parseLocalDinnerTime('2026-10-24',time),/HH:MM/);
});
test('valid local dinner times and leap days retain their calendar components',()=>{
 for(const date of ['2028-02-29','2026-10-24']){const value=new Date(parseLocalDinnerTime(date,'19:30'));assert.equal(value.getFullYear(),Number(date.slice(0,4)));assert.equal(value.getMonth()+1,Number(date.slice(5,7)));assert.equal(value.getDate(),Number(date.slice(8)));assert.equal(value.getHours(),19);assert.equal(value.getMinutes(),30);}
});

test('editing a saved schedule prefills the saved local date, time and table duration',async()=>{
 const {dinnerFormValues}=await import('../src/local-dinner-time.js');
 const at=new Date(2026,10,3,20,15).getTime();assert.deepEqual(dinnerFormValues({dinnerAt:at,dinnerMinutes:45}),{date:'2026-11-03',time:'20:15',duration:45});
 assert.deepEqual(dinnerFormValues({},new Date(2026,9,22,12)),{date:'2026-10-22',time:'19:30',duration:25});
});
