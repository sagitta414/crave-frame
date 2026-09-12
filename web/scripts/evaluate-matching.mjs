import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {aiRequest} from '../server/ai.js';
import {generate} from '../server/vertex.js';
import {openDb} from '../server/local-db.js';
import {defaults} from '../product/catalog.js';
if(!process.argv.includes('--live'))throw Error('Use --live to authorize billable model evaluation. Credentials remain local.');
const provider={GCP_SERVICE_ACCOUNT_JSON:process.env.GCP_SERVICE_ACCOUNT_JSON||readFileSync('.local/vertex-account.json','utf8'),...(process.env.GCP_PROJECT_ID?{GCP_PROJECT_ID:process.env.GCP_PROJECT_ID}:{})};
const DB=openDb(),house={prefs:defaults,memory:{},nights:[],pantry:[],recentPairings:[]},results=[];
const titles=process.argv.find(a=>a.startsWith('--titles='))?.slice(9).split(',')||['grand-budapest','avengers','ratatouille','chef','paddington','before-sunrise','detectorists','only-murders'];
try{for(const showId of titles){let calls=0;const started=Date.now();try{const r=await aiRequest(new Request('https://evaluation/api/ai',{method:'POST',body:JSON.stringify({mode:'plan',primary:true,prompt:'Find familiar dinners with concrete connections to this title.',showId,prefs:{...defaults,cookTime:45,watchTime:180}})}),{DB,AI_GENERATE:async(s,i)=>{calls++;const r=await generate(provider,s,i);if(process.env.EVAL_TRACE&&i.candidates)console.log(JSON.stringify({review:r}));return r;} },house,'local-evaluation',0);
 const picks=r.picks.map(p=>({id:p.id,meal:p.meal.name,category:p.meal.category,familiar:p.meal.familiar===true,type:p.pairingType,quote:p.evidenceQuote,source:p.evidenceSource,connection:p.tableEcho,mealEvidence:p.mealEvidence,reviewed:p.connectionReviewed,repeated:house.recentPairings.some(x=>x.mealId===p.meal.id)}));
 results.push({title:showId,seconds:Math.round((Date.now()-started)/100)/10,calls,answer:r.answer,picks});for(const p of r.picks)house.recentPairings.push({mealId:p.meal.id,showId:p.show.id});
 }catch(e){results.push({title:showId,seconds:Math.round((Date.now()-started)/100)/10,calls,error:e.message});}
 console.log(JSON.stringify(results.at(-1)));mkdirSync('docs',{recursive:true});writeFileSync('docs/ai-evaluation-latest.json',JSON.stringify({date:new Date().toISOString(),model:'gemini-2.5-flash',scope:'One live sequential pass; not a benchmark or user study',results},null,2));
 }}finally{DB.close();}
