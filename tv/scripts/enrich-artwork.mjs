import {writeFileSync} from 'node:fs';
const base='https://screen-to-supper-storyboard.sagitta107.chatgpt.site/api/';
const house=await (await fetch(base+'household',{method:'POST'})).json();
async function api(path,data){const r=await fetch(base+path,{method:data?'POST':'GET',headers:{'content-type':'application/json','x-household-key':house.key},...(data?{body:JSON.stringify(data)}:{})});if(!r.ok)throw Error('Catalog artwork request failed');return r.json();}
const result=[];
for(const [name,year] of [['The Avengers','2012'],['Ratatouille','2007'],['The Grand Budapest Hotel','2014'],['Chef','2014'],['Paddington','2014'],['Before Sunrise','1995']]){
 const hits=await api('catalog/search?q='+encodeURIComponent(name)),hit=hits.results.find(h=>h.type==='movie'&&h.year===year&&h.name===name);if(!hit)continue;
 const d=await api('catalog/details?type=movie&id='+hit.id);const show=await api('catalog/select',{provider:{type:'movie',id:hit.id},minutes:d.minutes,mood:name==='The Avengers'?'Adventure':name==='Before Sunrise'?'Romantic':'Cozy',cuisine:'Any'});result.push(show);
}
writeFileSync('src/featured.json',JSON.stringify(result,null,2));console.log('Resolved artwork for '+result.length+' movie editions.');
