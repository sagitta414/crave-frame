// Conservative aliases: preparation and storage forms remain distinct.
export function ingredientKey(value){
 return String(value||'').toLowerCase().trim().replace(/[’']/g,'').replace(/[,()]/g,' ').replace(/\bscallions?\b/g,'spring onion').replace(/\bcourgettes?\b/g,'zucchini').replace(/\baubergines?\b/g,'eggplant').replace(/\bgarbanzo beans?\b/g,'chickpea').replace(/\bbell peppers?\b/g,'bell pepper').replace(/\btomatoes\b/g,'tomato').replace(/\bmushrooms\b/g,'mushroom').replace(/\bonions\b/g,'onion').replace(/\bchickpeas\b/g,'chickpea').replace(/\bpotatoes\b/g,'potato').replace(/\bcarrots\b/g,'carrot').replace(/\beggs\b/g,'egg').replace(/\s+/g,' ').trim();
}
export function pantryMatches(required,pantry=[]){return required.filter(i=>pantry.some(p=>ingredientKey(p)===ingredientKey(i.name)));}
