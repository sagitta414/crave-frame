import {dietFits} from '../product/diets.js';
import {ingredients} from '../product/engine.js';
import {ingredientBlocked} from '../product/food-restrictions.js';

export function validateCookingPlan(meal,prefs,adapted,confirmed,memory={}){
 const reject=message=>{throw Object.assign(Error(message),{status:400});};
 if(!meal||typeof adapted!=='boolean'||!dietFits(meal,prefs.diet))reject('Review the recipe and your food preference.');
 if(prefs.diet==='Plant-based'&&!adapted)reject('Approve the plant-based adaptation before cooking.');
 const needed=ingredients(meal,prefs.people,adapted).map(i=>i.name);
 if(needed.some(name=>ingredientBlocked(name,memory)))reject('This recipe contains an ingredient you excluded. Review the adaptation or choose another recipe.');
 if(!Array.isArray(confirmed)||needed.some(name=>!confirmed.includes(name)))reject('Review and confirm every ingredient before cooking.');
 return needed;
}
