// Only the existing, compatible ready-cooked protein recipe family can be split.
// IDs encode a checked recipe pair and a serving allocation, never free-form recipes.
export function twoAppetiteMeal(first,second,firstPeople,total){
 if(!first?.proteinBase||!second?.proteinBase||first.proteinBase!==second.proteinBase||first.id===second.id||first.courses||second.courses||!Number.isInteger(total)||total<2||total>8||!Number.isInteger(firstPeople)||firstPeople<1||firstPeople>=total)return null;
 if(JSON.stringify(first.ingredients.slice(1))!==JSON.stringify(second.ingredients.slice(1)))return null;
 const otherPeople=total-firstPeople,ratio=firstPeople/total;
 const ingredients=[[first.ingredients[0][0],first.ingredients[0][1]*ratio,first.ingredients[0][2]],[second.ingredients[0][0],second.ingredients[0][1]*(1-ratio),second.ingredients[0][2]],...first.ingredients.slice(1).map(i=>[...i])];
 const fish=/fish|salmon|tuna/i.test(first.ingredients[0][0]+' '+second.ingredients[0][0]);
 return {...first,id:`duo~${first.id}~${second.id}~${firstPeople}~${total}`,name:`${first.protein} + ${second.protein} · ${first.category}`,mainMealId:first.id,minutes:Math.max(first.minutes,second.minutes)+5,foodType:first.foodType==='Vegetarian'?second.foodType:first.foodType,
  plateFoodTypes:[first.foodType,second.foodType],twoAppetites:{firstId:first.id,secondId:second.id,firstPeople,otherPeople,total,firstProtein:first.protein,secondProtein:second.protein},ingredients,
  recipeNote:'Shared base, separate proteins. Allow five extra minutes; timing is an estimate, not kitchen-tested.',
  steps:[
   ['Set up two plates',`Make ${firstPeople} ${first.protein.toLowerCase()} serving(s) and ${otherPeople} ${second.protein.toLowerCase()} serving(s). Keep the proteins in separate pans with separate utensils. Use only the listed ready-cooked or ready-to-eat proteins, follow storage and reheating labels, and check all ingredient labels. Shared preparation is not an allergen-free guarantee.${fish?' Check fish carefully for bones.':''}`,0],
   [...first.steps[1]],
   [...first.steps[2]],
   ['Divide the shared base',`Before adding either protein, divide the vegetables and base into ${total} equal portions. Keep ${firstPeople} portion(s) for ${first.protein.toLowerCase()} and ${otherPeople} for ${second.protein.toLowerCase()}. Use separate serving utensils.`,0],
   ['Warm the two proteins',`Warm ${first.ingredients[0][0].toLowerCase()} and ${second.ingredients[0][0].toLowerCase()} separately, following each package’s directions until hot throughout. Add each only to its assigned portions. Do not substitute raw meat or seafood.`,0],
   ['Serve together',`Finish each portion with lemon juice and {finish}. Keep the two versions separate and serve immediately.`,0]
  ]};
}
export function resolveTwoAppetites(id,lookup){
 if(typeof id!=='string'||!id.startsWith('duo~'))return null;
 const parts=id.split('~');if(parts.length!==5)return null;
 return twoAppetiteMeal(lookup(parts[1]),lookup(parts[2]),Number(parts[3]),Number(parts[4]));
}
