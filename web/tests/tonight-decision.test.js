import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tonightPreferences,dinnerDecision,tonightShortcuts,tonightShortcutState,eveningDuration,pairingInsight} from '../product/tonight-decision.js';
import {defaults,mealById,showById} from '../product/catalog.js';
import {recommend} from '../product/engine.js';
import {curate} from '../product/curation.js';
import {decisionHome} from '../product/decision-home.js';
test('quick starts preserve restrictive preferences and never extend the cooking budget',()=>{
 const p={...defaults,cookTime:15,diet:'Plant-based',family:true,eveningMinutes:90,people:4};
 for(const {id} of tonightShortcuts){const n=tonightPreferences(p,id);assert.equal(n.diet,p.diet);assert.equal(n.family,true);assert.equal(n.people,4);assert.equal(n.eveningMinutes,90);assert.equal(n.cookTime,15);}
 assert.equal(tonightPreferences(defaults,'easy').effort,'Easy');assert.equal(tonightPreferences(defaults,'family').family,true);
 assert.equal(defaults.effort,'Any');
});
test('decision facts scale quantities and distinguish pantry listing from shopping certainty',()=>{
 const meal=mealById('mac-cheese-peas'),show=showById('ratatouille');
 const d=dinnerDecision(meal,show,{...defaults,people:4},false,['Dry macaroni']);
 assert.equal(d.total,meal.minutes+25+show.minutes);assert.equal(d.items.find(i=>i.name==='Dry macaroni').amount,360);
 assert.equal(d.pantryCount,1);assert.ok(d.check.every(i=>i.name!=='Dry macaroni'));
});
test('home has a real featured match, one primary plan button and honest ingredient details',()=>{
 const picks=curate({prefs:defaults});assert.ok(picks.length);
 const html=decisionHome(picks,defaults,[]);assert.ok(html.includes(picks[0].meal.name.replaceAll('&','&amp;')));
 assert.equal((html.match(/class="btn primary"/g)||[]).length,1);assert.match(html,/Check or buy/);assert.match(html,/data-exclude=/);
 assert.match(decisionHome([],defaults),/No evening fits/);
});
test('same dinner new show excludes the original while retaining the meal and adaptation',()=>{
 const meal=mealById('pepper-pasta'),prefs={...defaults,watchTime:180};
 const initial=recommend({mode:'meal',sourceId:meal.id,prefs});assert.ok(initial.length);
 const picks=recommend({mode:'meal',sourceId:meal.id,prefs,excludeShowId:initial[0].show.id,dinnerAdapted:true});
 assert.ok(picks.length);assert.ok(picks.every(p=>p.meal.id===meal.id&&p.adapted&&p.show.id!==initial[0].show.id));
});
test('TV and browser decision helpers remain identical',()=>{
 assert.equal(readFileSync(new URL('../product/tonight-decision.js',import.meta.url),'utf8'),readFileSync(new URL('../../tv/src/catalog/tonight-decision.js',import.meta.url),'utf8'));
});
test('shortcut feedback reflects effective settings including stricter budgets',()=>{
 const p={...defaults,cookTime:15};
 assert.match(tonightShortcutState(p,'quick').detail,/15 min/);
 assert.equal(tonightShortcutState(p,'quick').active,true);
 assert.equal(tonightShortcutState(p,'easy').active,false);
 assert.equal(tonightShortcutState(tonightPreferences(p,'easy'),'easy').active,true);
 assert.equal(tonightShortcutState(tonightPreferences(p,'special'),'special').active,true);
 assert.equal(tonightShortcutState(p,'family').active,false);
});
test('readable duration and action order keep the main decision before ingredient detail',()=>{
 assert.equal(eveningDuration(45),'45 min');assert.equal(eveningDuration(120),'2 hr');assert.equal(eveningDuration(135),'2 hr 15 min');
 const html=decisionHome(curate({prefs:defaults}),defaults,[]);
 assert.ok(html.indexOf('data-action="home-plan"')<html.indexOf('<details>'));
 assert.match(html,/aria-pressed="true"/);
});
test('pairing explanations distinguish documented inspiration from practical matches',()=>{
 const pair={meal:mealById('mac-cheese-peas'),show:showById('ratatouille')};
 assert.match(pairingInsight(pair).text,/not a claim/);
 assert.equal(pairingInsight({...pair,connection:{kind:'Setting',tableEcho:'A setting interpretation.'}}).text,'A setting interpretation.');
 assert.equal(pairingInsight({...pair,connection:{kind:'Story inspiration',tableEcho:'A supported creative link.'}}).label,'Story-inspired dinner');
 // An arbitrary generated reason must not turn a practical match into an on-screen claim.
 assert.match(pairingInsight({...pair,reason:'This dish is in the movie.'}).text,/not a claim/);
});
test('evening preview exposes all phases and escapes external pairing text',()=>{
 const picks=curate({prefs:defaults});
 picks[0]={...picks[0],connection:{kind:'Setting',tableEcho:'<script>bad</script>'}};
 const html=decisionHome(picks,defaults,[]);
 assert.match(html,/Estimated evening sequence/);assert.match(html,/>Cook</);assert.match(html,/>Eat</);assert.match(html,/>Watch</);
 assert.match(html,/&lt;script&gt;bad/);assert.ok(!html.includes('<script>bad'));
 assert.match(html,/Why this pairing/);
});
