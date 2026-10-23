import {ingredientAssessment} from './ingredient-allergens.js';
export const foodPreferences=['No preference','Meat & poultry','Fish & seafood','Vegetarian','Plant-based'];
// Evaluate the adaptation the app can actually apply, not hypothetical extra swaps.
// Packaged ingredients still require label checks; this is not an allergy guarantee.
export function dietFits(meal,diet){
 const kinds=meal.plateFoodTypes||[meal.foodType||'Vegetarian'];
 if(!kinds.every(kind=>diet==='No preference'||(diet==='Meat & poultry'?kind==='Meat & poultry':diet==='Fish & seafood'?kind==='Fish & seafood':kind==='Vegetarian')))return false;
 if(diet!=='Plant-based')return true;
 return meal.ingredients.every(([original])=>{
  const name=original===meal.swap?.from?meal.swap.to:original;
  return !ingredientAssessment(name).contains.some(a=>['Milk','Egg','Fish','Shellfish'].includes(a))&&!/\b(honey|gelatin|gelatine|eggs?)\b/i.test(name.replace(/egg[- ]free/gi,''));
 });
}
