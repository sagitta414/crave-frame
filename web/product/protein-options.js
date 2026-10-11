import {proteinVariations} from './protein-recipes.js';
import {threeActMeal} from './three-act.js';
import {meals,mealById} from './catalog.js';
import {ingredients} from './engine.js';
import {dietFits} from './diets.js';
import {ingredientBlocked} from './food-restrictions.js';
export const proteinChoices=['Chicken','Turkey','Beef','Salmon','Tuna','Shrimp','Tofu','Chickpeas'];
export function proteinOptions(original,prefs,memory={},allowAlternatives=false){
 if(original.courses)return proteinOptions(mealById(original.mainMealId),{...prefs,cookTime:prefs.cookTime-10},memory,allowAlternatives).map(option=>({...option,meal:threeActMeal(option.meal,original.starterId,original.dessertId)})).filter(option=>option.meal&&!ingredients(option.meal,prefs.people,option.adapted).some(i=>ingredientBlocked(i.name,memory)));
 const adaptation=m=>prefs.diet==='Plant-based'||ingredients(m,prefs.people,false).some(i=>ingredientBlocked(i.name,memory));
 const eligible=[...meals,...proteinVariations].filter(m=>m.id!==original.id&&m.protein!==original.protein&&m.protein&&dietFits(m,prefs.diet)&&m.minutes<=prefs.cookTime&&(prefs.effort!=='Easy'||m.effort==='Easy')&&!(memory.dislikedMeals||[]).includes(m.id)&&!ingredients(m,prefs.people,adaptation(m)).some(i=>ingredientBlocked(i.name,memory)));
 return proteinChoices.flatMap(protein=>{
  const candidates=eligible.filter(m=>m.protein===protein&&(allowAlternatives||m.proteinBase===(original.proteinBase||original.id))).sort((a,b)=>Number(b.proteinBase===(original.proteinBase||original.id))-Number(a.proteinBase===(original.proteinBase||original.id))||Number(b.category===original.category)-Number(a.category===original.category)||a.minutes-b.minutes);
  const meal=candidates[0];return meal?[{protein,meal,adapted:adaptation(meal),sameRecipe:meal.proteinBase===(original.proteinBase||original.id)}]:[];
 });
}
