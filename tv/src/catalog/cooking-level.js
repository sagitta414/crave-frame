export const cookingLevels=['Beginner','Regular','Confident'];
const cues=[
 [/\b(simmer)\b/i,'Simmer means small, gentle bubbles rather than a rolling boil. Adjust the heat to keep it gentle.'],
 [/\b(whisk)\b/i,'Whisk in small circles, adding liquid a little at a time to help keep the mixture smooth.'],
 [/\b(drain)\b/i,'Set a colander securely in the sink before draining. Pour slowly, keeping your face and hands away from the steam.'],
 [/\b(roast|bake|oven)\b/i,'Preheat the oven before the food goes in. Use oven mitts to handle the hot tray.'],
 [/\b(chop|slice|dice|cut|mince)\b/i,'Use a steady cutting board. Curl the fingertips of your holding hand away from the blade; keep pieces a similar size.'],
 [/\b(skillet|pan|fry|toast)\b/i,'Keep the pan handle turned inward and watch the food as it cooks. Lower the heat if it starts to catch.'],
 [/\b(package|reheat)\b/i,'Read the package directions before starting this step; products can need different heating times.']
];
export function instructionForLevel(instruction,level='Regular',context={}){
 if(level==='Confident')return instruction;
 const {meal,stepIndex=0,adapted=false}=context;
 const items=meal?.ingredients?.map(i=>adapted&&i[0]===meal.swap.from?meal.swap.to:i[0])||[];
 const setup=meal&&stepIndex===0?'For '+meal.name+': measure out '+items.join(', ')+'. Keep the recipe quantities beside you before starting.':'';
 const specific=[];
 if(/pasta|spaghetti/i.test(meal?.name||'')&&/boil|simmer|drain/i.test(instruction))specific.push('For this pasta, taste a piece near the end of the recipe’s cooking time: it should be tender with a little bite. Keep the sauce ready so the drained pasta can go straight into it.');
 if(/taco|wrap|pita/i.test(meal?.name||'')&&/fill|assemble|serve/i.test(instruction))specific.push('For '+meal.name+', divide the filling between the wraps before adding toppings. Leave space around the edges so each portion is easy to hold.');
 if(/pizza|flatbread/i.test(meal?.name||'')&&/top|spread/i.test(instruction))specific.push('Spread this recipe’s sauce in a thin layer, leaving a small clear rim. Distribute the toppings evenly so the center is not overloaded.');
 if(/rice bowl/i.test(meal?.name||'')&&/serve|divide|bowl/i.test(instruction))specific.push('For '+meal.name+', divide the rice between the serving bowls first, then divide the prepared topping equally.');
 const detail=specific[0]||'';
 const matches=cues.filter(([pattern])=>pattern.test(instruction));
 if(level==='Beginner')return instruction+'\n\n'+([setup,detail,...matches.slice(0,detail?1:2).map(([,tip])=>tip)].filter(Boolean).join('\n\n')||'Read this step through first and set out the listed ingredients before starting.');
 if(detail)return instruction+'\n\nTip: '+detail;
 return instruction+(matches.length?'\n\nTip: '+matches[0][1]:'');
}
