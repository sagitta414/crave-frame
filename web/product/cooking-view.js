const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cookingView(night,count){
 const ready=['ready','complete'].includes(night.status),delivery=night.fulfillment==='delivery';
 const index=Math.max(0,Math.min(Math.max(0,count-1),Number.isInteger(night.step)?night.step:0));
 return {ready,delivery,index,completed:ready?count:index,canEdit:!ready&&!delivery};
}
export function deliveryCompanion(night,show,timeline){
 return `<section class="panel"><p class="eyebrow">YOUR ORDER-OUT EVENING</p><h1>Dinner is on your delivery plan</h1><p>Next on your screen: ${esc(show.name)}</p>${timeline}<p>These times use the delivery estimate you entered. Check your delivery provider for live tracking; Crave Frame does not receive order updates.</p><p>Cooking steps and kitchen timers are paused for this evening. Manage the delivery plan on your TV.</p></section>`;
}
