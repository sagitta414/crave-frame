import {readyTogetherPlan} from './catalog/evening.js';
import {recipeSteps} from './catalog/engine.js';

// Use the cooking screen's recipe inputs for every TV schedule projection.
export function projectEvening(night,meal,show,now=Date.now()){
 const steps=recipeSteps(meal,night.adapted,night.prefs?.cookLevel||'Regular',night.prefs?.people||2);
 return readyTogetherPlan(night,meal,show,steps,now);
}
