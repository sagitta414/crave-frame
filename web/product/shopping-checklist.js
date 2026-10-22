import {ingredients} from './engine.js';
import {pantryMatches} from './ingredients.js';
export function shoppingChecklist(meal,people,adapted=false,pantry=[]){
 const items=ingredients(meal,people,adapted),matched=new Set(pantryMatches(items,pantry).map(i=>i.name));
 const line=i=>`☐ ${i.amount} ${i.unit} ${i.name}`;
 const check=items.filter(i=>!matched.has(i.name)),verify=items.filter(i=>matched.has(i.name));
 return [`Crave Frame · ${meal.name}`,`${people} servings${adapted?' · adapted recipe':''}`,'','CHECK OR BUY',...(check.length?check.map(line):['All ingredients appear on your pantry list. Verify quantities before shopping.']),...(verify.length?['','ON YOUR PANTRY LIST — VERIFY QUANTITIES',...verify.map(line)]:[]),'','Check package ingredients and quantities before cooking.'].join('\n');
}
