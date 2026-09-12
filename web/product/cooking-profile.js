// Descriptive signals from written steps; not measured active time or kitchen-tested workload.
export function cookingProfile(meal){
 const steps=meal.steps||[],text=steps.map(s=>s[1]).join(' ').toLowerCase();
 const prepSteps=steps.filter(s=>/\b(chop|slice|mince|dice|peel|grate|halve|cut)\b/i.test(s[1])).length;
 const equipment=[];
 if(/\b(oven|bake|roast)\b/.test(text))equipment.push('Oven');
 if(/\b(pan|skillet|frying pan)\b/.test(text))equipment.push('Pan');
 if(/\b(pot|saucepan)\b/.test(text))equipment.push('Pot');
 if(/\bblender\b/.test(text))equipment.push('Blender');
 const readyCooked=meal.ingredients.some(i=>/\b(cooked|ready.cooked|canned|tinned)\b/i.test(i[0]));
 const badges=[steps.length+' recipe steps'];
 if(equipment.length)badges.push(equipment.join(' + '));
 else if(prepSteps)badges.push(prepSteps+' prep '+(prepSteps===1?'step':'steps'));
 if(readyCooked)badges.push('Uses prepared ingredients');
 return {steps:steps.length,prepSteps,equipment,readyCooked,badges,effortIndex:meal.minutes+steps.length*4+prepSteps*3+equipment.length*2,note:'Estimated workload from recipe time, written steps, prep actions and named equipment. Not measured active cooking time.'};
}
export function eveningStyles(picks,memory={}){
 if(!picks.length)return picks;
 const easiest=[...picks].sort((a,b)=>cookingProfile(a.meal).effortIndex-cookingProfile(b.meal).effortIndex)[0];
 const other=picks.filter(p=>p!==easiest);
 const familiar=other.find(p=>memory.favoriteMeals?.includes(p.meal.id))||other.find(p=>memory.favoriteCuisines?.includes(p.meal.cuisine))||other[0];
 return picks.map(p=>({...p,cookingProfile:cookingProfile(p.meal),eveningStyle:p===easiest?'Easiest of these':p===familiar?(memory.favoriteMeals?.includes(p.meal.id)?'A dinner you loved':memory.favoriteCuisines?.includes(p.meal.cuisine)?'Your familiar flavors':'Comfort pick'):'A different direction',styleReason:p===easiest?'Lowest estimated workload among these choices, using recipe time, steps, preparation and named equipment.':p===familiar?(memory.favoriteMeals?.includes(p.meal.id)?'You explicitly saved this meal as a favorite.':memory.favoriteCuisines?.includes(p.meal.cuisine)?'Matches a cuisine you saved.':'An alternative for your selected evening preferences; no past preference is assumed.'):'A different meal-and-watch combination within the same limits; not a claim that you have never tried it.'}));
}
