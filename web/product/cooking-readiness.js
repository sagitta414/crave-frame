import {ingredients,recipeSteps} from './engine.js';
import {cookingProfile} from './cooking-profile.js';
import {preparationNote} from './recipe-presentation.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const readinessKey=n=>JSON.stringify([n.id,n.mealId,n.prefs.people,n.adapted,n.prefs.cookLevel]);
export function readinessMarkup(n,meal){
 const list=ingredients(meal,n.prefs.people,n.adapted),profile=cookingProfile(meal);
 return `<section class="panel"><p class="eyebrow">RECIPE PREVIEW</p><h1>Ready to cook?</h1><h2>${esc(meal.name)}</h2><p>${n.prefs.people} servings · ${meal.minutes} min estimated</p><p>${esc(profile.equipment.join(' + '))}</p><ul>${list.map(i=>`<li>${i.amount} ${esc(i.unit)} · ${esc(i.name)}</li>`).join('')}</ul><p>${esc(preparationNote(meal,list)||'')}</p><details><summary>Review every cooking step</summary><ol>${recipeSteps(meal,n.adapted,n.prefs.cookLevel||'Regular',n.prefs.people).map(s=>`<li><h3>${esc(s.title)}</h3><p style="white-space:pre-line">${esc(s.instruction)}</p></li>`).join('')}</ol></details><p>Review package instructions. Times are estimates; these recipes await kitchen trials.</p><div id="cooking-readiness" data-plan="${esc(readinessKey(n))}">${['Ingredients and quantities checked','Equipment ready','Preparation instructions reviewed'].map((label,i)=>`<label class="check-row"><input type="checkbox" data-change="cook-ready" value="${i}"> ${label}</label>`).join('')}</div><button class="btn primary" data-action="cook-start" disabled>Start cooking</button></section>`;
}
