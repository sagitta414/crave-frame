// Recipes use ready-cooked proteins; follow their package storage and reheating directions.
const recipes=[
 ['chicken-pepper-tacos','Chicken & pepper tacos','Meat & poultry','Tacos & wraps','tacos','Americas',20,'Ready-cooked chicken strips',250,'Sliced bell peppers',150,'Tortillas',6,'pieces'],
 ['chicken-basil-pasta','Chicken & basil pasta','Meat & poultry','Pasta','pasta','Mediterranean',25,'Ready-cooked chicken strips',250,'Cherry tomatoes, halved',200,'Dry pasta',180,'g'],
 ['beef-rice-bowls','Beef & broccoli rice bowls','Meat & poultry','Rice bowls','bowl','Asian',20,'Ready-cooked beef strips',250,'Small broccoli florets',200,'Ready-cooked rice',300,'g'],
 ['turkey-pita-pockets','Turkey & pepper pita pockets','Meat & poultry','Tacos & wraps','tacos','Mediterranean',20,'Ready-cooked turkey strips',250,'Sliced bell peppers',150,'Pita breads',2,'pieces'],
 ['salmon-lemon-pasta','Salmon & lemon pasta','Fish & seafood','Pasta','pasta','Mediterranean',25,'Ready-cooked boneless salmon',250,'Frozen peas',150,'Dry pasta',180,'g'],
 ['tuna-rice-bowls','Tuna & sweetcorn rice bowls','Fish & seafood','Rice bowls','bowl','Americas',15,'Canned tuna, drained',240,'Canned sweetcorn, drained',150,'Ready-cooked rice',300,'g'],
 ['shrimp-pepper-tacos','Shrimp & pepper tacos','Fish & seafood','Tacos & wraps','tacos','Americas',20,'Ready-cooked peeled shrimp',250,'Sliced bell peppers',150,'Tortillas',6,'pieces'],
 ['chicken-couscous-bowls','Chicken & zucchini couscous bowls','Meat & poultry','Grain bowls','bowl','Mediterranean',25,'Ready-cooked chicken strips',250,'Zucchini, diced small',200,'Dry couscous',150,'g']
];
export const proteinRecipes=recipes.map(([id,name,foodType,category,image,cuisine,minutes,protein,amount,veg,vegAmount,base,baseAmount,unit])=>({id,name,foodType,category,image,cuisine,minutes,effort:'Easy',moods:['Cozy','Adventure','Lighthearted','Romantic'],subtitle:'An everyday supper with ready-cooked '+(foodType==='Fish & seafood'?'seafood.':'meat or poultry.'),ingredients:[[protein,amount,'g'],[veg,vegAmount,'g'],[base,baseAmount,unit],['Olive oil',1,'tbsp'],['Lemon juice',1,'tbsp'],['Dried basil',1,'tsp'],['Plain yogurt',60,'g']],swap:{from:'Plain yogurt',to:'Unsweetened plant yogurt',amount:60,unit:'g',reason:'Use plant yogurt for the topping if preferred. This change does not remove the meat or seafood and does not make the meal vegetarian or plant-based.'},steps:[
 ['Get ready','Use refrigerated ready-cooked protein within its package storage guidance. Prepare the vegetables, drain canned ingredients, and check fish for bones. These steps do not cook raw meat or seafood.',0],
 ['Prepare the base',base==='Dry pasta'?'Boil pasta in water according to its package until tender. Reserve a little cooking water, then drain.':base==='Dry couscous'?'Place couscous in a heatproof bowl. Add boiling water in the amount directed on its package, cover for the stated time, then fluff with a fork.':base==='Ready-cooked rice'?'Heat the ready-cooked rice according to its package until steaming hot. Keep covered while you finish the topping.':'Warm the breads according to their package directions. Keep covered so they stay soft.',0],
 ['Cook the vegetables','Heat olive oil in a skillet over medium heat. Add the prepared vegetables and a splash of water. Cook, stirring, until tender and hot throughout, about 5–8 minutes. Add dried basil.',300],
 ['Warm the protein','Add the ready-cooked protein to the vegetables. Follow its package reheating directions, warming until hot throughout and adding a splash of water if dry. Break tuna or salmon gently into chunks. Do not use raw protein with these instructions.',0],
 ['Serve','Combine with the prepared base or fill the warm breads. Finish with lemon juice and {finish}. Divide between the planned number of people and serve immediately.',0]
 ]}));

const proteins=[['Chicken','Ready-cooked chicken strips','Meat & poultry'],['Turkey','Ready-cooked turkey strips','Meat & poultry'],['Beef','Ready-cooked beef strips','Meat & poultry'],['Salmon','Ready-cooked boneless salmon','Fish & seafood'],['Tuna','Canned tuna, drained','Fish & seafood'],['Shrimp','Ready-cooked peeled shrimp','Fish & seafood'],['Tofu','Ready-to-eat firm tofu, cubed','Vegetarian'],['Chickpeas','Canned chickpeas, drained','Vegetarian']];
export const proteinVariations=[];
const originals=[...proteinRecipes];
for(const base of originals){
 base.protein=proteins.find(p=>base.ingredients[0][0].toLowerCase().includes(p[0].toLowerCase()))?.[0];base.proteinBase=base.id;
 for(const [protein,ingredient,foodType] of proteins){if(protein===base.protein)continue;
 const name=base.name.replace(/^(Chicken|Turkey|Beef|Salmon|Tuna|Shrimp)/,protein);
 proteinVariations.push({...base,id:base.id+'--'+protein.toLowerCase(),name,protein,proteinBase:base.id,foodType,subtitle:'Protein variation using ready-cooked or ready-to-eat ingredients.',ingredients:base.ingredients.map((i,n)=>n===0?[ingredient,i[1],i[2]]:[...i]),swap:{...base.swap,reason:foodType==='Vegetarian'?'Use plant yogurt and check the base ingredients for a plant-based meal.':'This topping change does not remove the meat or seafood.'},steps:base.steps.map((step,n)=>n===3?[step[0],'Warm the '+ingredient.toLowerCase()+' separately following its package instructions until hot throughout, then combine with the vegetables. Do not substitute raw meat or seafood.',step[2]]:[...step])});
 }
}

// Build instructions from the final ingredient list, including protein swaps.
for(const meal of [...proteinRecipes,...proteinVariations]){
 const [protein,veg,base]=meal.ingredients.map(i=>i[0]);
 const canned=meal.ingredients.map(i=>i[0]).filter(n=>/^Canned /i.test(n));
 const fish=/salmon|tuna/i.test(protein),bread=/tortillas|pita/i.test(base);
 meal.steps=[
  ['Get ready',`Set out ${protein.toLowerCase()} and ${veg.toLowerCase()}. Follow the protein package storage guidance.${canned.length?' Drain '+canned.map(n=>n.replace(/, drained$/,'').toLowerCase()).join(' and ')+'.':''}${fish?' Check the fish for bones.':''} These instructions use ready-cooked or ready-to-eat protein, not raw meat or seafood.`,0],
  ['Prepare the base',base==='Dry pasta'?'Bring a pot of water to a boil and read the pasta package cooking time. Leave the pasta uncooked while you start the vegetables.':base==='Dry couscous'?'Place the couscous in a heatproof bowl. Add boiling water in the amount directed on its package, cover for the stated time, then fluff with a fork.':base==='Ready-cooked rice'?'Heat the ready-cooked rice according to its package until steaming hot. Keep covered while you finish the topping.':`Warm the ${base.toLowerCase()} according to their package directions. Keep covered so they stay soft.`,0],
  ['Cook the vegetables',`Heat olive oil in a skillet over medium heat. Add the ${veg.toLowerCase()} and a splash of water. Cook, stirring, until tender and hot throughout, about 5–8 minutes. Add dried basil.`,300],
  ['Warm the protein',`Warm the ${protein.toLowerCase()} separately following its package instructions until hot throughout, then combine with the vegetables.${base==='Dry pasta'?' While the protein heats, cook the pasta for its package time. Keep the cooked topping warm over low heat if it finishes first. Reserve a little pasta water before draining; combine the pasta with the hot topping promptly.':''}${fish?' Break the fish gently into chunks.':''} Do not substitute raw meat or seafood.`,0],
  ['Serve',`${bread?'Fill the warm '+base.toLowerCase()+' with the protein and vegetables.':'Combine the protein and vegetables with the '+base.replace(/^(Dry|Ready-cooked) /,'').toLowerCase()+'.'} Finish with lemon juice and {finish}. Divide between the planned number of people and serve immediately.`,0]
 ];
}
