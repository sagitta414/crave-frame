import {backToTop,pageUp,pageDown,mainPanel} from './SilkScrollAssist';
import {useEffect} from 'react';
import {Platform} from 'react-native';

/** Laptop preview of the TV's directional remote; native uses Fire OS focus. */
export function useWebRemote(){useEffect(()=>{
 if(Platform.OS!=='web')return;
 const rowMemory=new WeakMap<Element,HTMLElement>();
 const move=(e:KeyboardEvent)=>{
  if((e.key==='PageUp'||e.key==='Home')&&document.querySelector('[aria-modal="true"], [data-testid="phone-dialog"]'))return;
  if(e.key==='PageDown'&&!(document.activeElement as HTMLElement)?.matches('input,textarea,select,[contenteditable="true"]')){if(pageDown())e.preventDefault();return;}
  if(e.key==='PageUp'){if(pageUp()){e.preventDefault();}return;}
  if(e.key==='Home'&&!(document.activeElement as HTMLElement)?.matches('input,textarea')){if(backToTop())e.preventDefault();return;}
  if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
  const active=document.activeElement as HTMLElement;
  if(active?.matches('input,textarea,select,[contenteditable="true"]'))return;
  const scope=document.querySelector('[aria-modal="true"], [data-testid="phone-dialog"]')||document;
  let candidates=[...scope.querySelectorAll<HTMLElement>('[role="button"],input,textarea,select,a[href]')].filter(el=>el.getAttribute('aria-disabled')!=='true'&&!el.hasAttribute('disabled')&&el.getBoundingClientRect().width>0);
  if(!candidates.length)return;
  // Keep vertical navigation in the content before considering the paging dock.
  const panel=mainPanel(),vertical=e.key==='ArrowUp'||e.key==='ArrowDown';
  if(vertical&&panel?.contains(active)){
   const r=active.getBoundingClientRect(),sign=e.key==='ArrowDown'?1:-1;
   const content=candidates.filter(el=>panel.contains(el));
   if(content.some(el=>el!==active&&(el.getBoundingClientRect().top-r.top)*sign>4))candidates=content;
  }
 const rowOf=(el:HTMLElement)=>el.closest('[data-testid^="remote-row-"]');
 const currentRow=rowOf(active);if(currentRow)rowMemory.set(currentRow,active);
  const r=active?.getBoundingClientRect();let target:HTMLElement|undefined;
  if(!r||!candidates.includes(active))target=candidates[0];
  else {const horizontal=e.key==='ArrowLeft'||e.key==='ArrowRight',sign=e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1,cx=r.x+r.width/2,cy=r.y+r.height/2;
   let pool=candidates;
   if(horizontal&&currentRow)pool=candidates.filter(el=>rowOf(el)===currentRow);
   if(!horizontal&&currentRow){const rows=[...new Set(candidates.map(rowOf).filter(Boolean))] as Element[];const next=rows.filter(row=>row!==currentRow).map(row=>({row,dy:(row.getBoundingClientRect().top-currentRow.getBoundingClientRect().top)*sign})).filter(x=>x.dy>4).sort((a,b)=>a.dy-b.dy)[0]?.row;if(next){const members=candidates.filter(el=>rowOf(el)===next),remembered=rowMemory.get(next);target=remembered&&members.includes(remembered)?remembered:members.sort((a,b)=>Math.abs(a.getBoundingClientRect().x-cx)-Math.abs(b.getBoundingClientRect().x-cx))[0];}}
   if(!target)target=pool.filter(el=>el!==active).map(el=>{const b=el.getBoundingClientRect(),dx=b.x+b.width/2-cx,dy=b.y+b.height/2-cy;return {el,forward:(horizontal?dx:dy)*sign,cross:Math.abs(horizontal?dy:dx)};}).filter(x=>x.forward>4).sort((a,b)=>(a.forward+a.cross*3)-(b.forward+b.cross*3))[0]?.el;
  }
  if(!target&&e.key==='ArrowDown'&&pageDown()){e.preventDefault();return;}
  if(!target&&e.key==='ArrowUp'&&pageUp()){e.preventDefault();return;}
  if(target){e.preventDefault();target.focus();target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});}
 };
 window.addEventListener('keydown',move);return()=>window.removeEventListener('keydown',move);
},[]);}
