export function cookingProgress(night,total,preview=false){
 const completed=preview?0:['ready','complete'].includes(night.status)?total:Math.max(0,Math.min(total,night.step||0));
 return {completed,percent:total?completed/total*100:0};
}
