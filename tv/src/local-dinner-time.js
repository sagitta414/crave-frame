// Reject calendar rollover and nonexistent local times before sending a schedule.
export function parseLocalDinnerTime(date,time){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Use YYYY-MM-DD and HH:MM.');
 const [year,month,day]=date.split('-').map(Number),[hour,minute]=time.split(':').map(Number);
 const value=new Date(date+'T'+time+':00');
 if(!Number.isFinite(value.getTime())||value.getFullYear()!==year||value.getMonth()!==month-1||value.getDate()!==day||value.getHours()!==hour||value.getMinutes()!==minute)throw Error('Choose a valid calendar date and local time.');
 return value.toISOString();
}

export function dinnerFormValues(night,now=new Date()){
 const saved=night?.dinnerAt?new Date(night.dinnerAt):null,value=saved&&Number.isFinite(saved.getTime())?saved:now;
 const pad=n=>String(n).padStart(2,'0');
 return {date:value.getFullYear()+'-'+pad(value.getMonth()+1)+'-'+pad(value.getDate()),time:saved&&Number.isFinite(saved.getTime())?pad(value.getHours())+':'+pad(value.getMinutes()):'19:30',duration:night?.dinnerMinutes||25};
}
