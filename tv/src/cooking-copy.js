// Keep the recipe action and safety guidance visible; disclose extra coaching.
export function cookingCopy(instruction,baseInstruction){
 if(!instruction.startsWith(baseInstruction))return {action:instruction,safety:[],tips:[]};
 const extra=instruction.slice(baseInstruction.length).trim().split(/\n\n|\nTip: /).map(s=>s.replace(/^Tip: /,'').trim()).filter(Boolean);
 const safety=[],tips=[];
 for(const paragraph of extra){
  if(/safe|knife|blade|steam|hot |heat|oven mitt|package|pan handle|burn|temperature|cutting board/i.test(paragraph))safety.push(paragraph);
  else tips.push(paragraph);
 }
 return {action:baseInstruction,safety,tips};
}
