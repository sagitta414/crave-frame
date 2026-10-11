import {cookingProfile} from './cooking-profile.js';
// Time estimates assume that explicitly cooked ingredients are ready to use.
export function readyIngredients(meal,items=meal?.ingredients||[]){return items.map(i=>i.name||i[0]).filter(name=>/^(?:fully\s+cooked|pre[- ]?cooked|cooked|ready[- ]cooked)\b/i.test(name));}
export function cookingTimeLabel(meal){return `${meal.minutes} min${readyIngredients(meal).length?' with prepared ingredients':''}`;}
export function preparationNote(meal,items){const names=readyIngredients(meal,items);return names.length?`Have these ready before the ${meal.minutes}-minute recipe: ${names.join(', ')}. Cooking them from raw takes extra time.`:'';}
export function practicalReason(pair){const m=pair.meal,p=cookingProfile(m);return [p.equipment.length?'Uses '+p.equipment.join(' and ').toLowerCase():p.steps+' recipe steps',p.prepSteps?p.prepSteps+' preparation step'+(p.prepSteps===1?'':'s'):'No cutting steps listed',pair.pantryMatches?.length?pair.pantryMatches.length+' pantry ingredients':'',readyIngredients(m).length?'Have '+readyIngredients(m).join(', ')+' ready':''].filter(Boolean).join(' · ')+'.';}
