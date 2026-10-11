/** Silk uses a browser cursor; let its native page scrolling own vertical movement. */
export function isSilk(userAgent:string){return /Silk\/|\bAFT[A-Z0-9]+\b/i.test(userAgent);}
export function enableSilkPage(doc:Document){
 doc.documentElement.setAttribute('data-silk-page','true');
 const style=doc.createElement('style');
 style.textContent=`
 html[data-silk-page],html[data-silk-page] body{height:auto!important;min-height:100%;overflow-y:auto!important;overflow-x:hidden!important;background:#060B16}
 html[data-silk-page] #root{height:auto!important;min-height:100vh;display:block!important}
 html[data-silk-page] [data-testid="tv-app"]{min-height:100vh;padding-bottom:32px}
 html[data-silk-page] [data-testid="tv-shell"],html[data-silk-page] [data-testid="tv-main"],html[data-silk-page] [data-testid="tv-page"]{flex:none!important;height:auto!important;overflow:visible!important}
 html[data-silk-page] [data-testid="main-scroll"]{flex:none!important;height:auto!important;max-height:none!important;overflow-y:visible!important;overflow-x:visible!important}
 html[data-silk-page][data-silk-modal],html[data-silk-page][data-silk-modal] body{overflow:hidden!important}
 html[data-silk-page] [data-testid="premiere-loading"]{position:fixed!important}
 html[data-silk-page] [data-testid="tv-main"]{padding-right:0;padding-bottom:112px}
 /* The intro is a viewport, not a scrolling page. Its flex height cannot inherit
    from #root once Silk's normal pages use intrinsic document height. */
 html[data-silk-page] [data-testid="premiere-intro"]{position:fixed!important;top:0;right:0;bottom:0;left:0;height:100%!important;min-height:0;width:100%;z-index:60}
 html[data-silk-page] [data-testid="silk-scroll-assist"]{position:fixed!important;bottom:12px;right:24px;left:auto;width:auto;max-width:calc(100% - 48px);flex-direction:row!important;justify-content:center;padding:8px!important;margin:0;z-index:50;box-shadow:0 4px 24px #000}
 `;
 doc.head.appendChild(style);
 const lock=()=>doc.documentElement.toggleAttribute('data-silk-modal',!!doc.querySelector('[aria-modal="true"], [data-testid="phone-dialog"]'));
 const observer=new MutationObserver(lock);observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-modal']});lock();
 return()=>{observer.disconnect();doc.documentElement.removeAttribute('data-silk-modal');style.remove();doc.documentElement.removeAttribute('data-silk-page');};
}
