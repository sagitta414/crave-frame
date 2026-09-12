import AsyncStorage from '@react-native-async-storage/async-storage';
export const API_ORIGIN=process.env.EXPO_PUBLIC_API_ORIGIN||(typeof window!=='undefined'&&window.location?.origin?window.location.origin:'https://screen-to-supper-storyboard.sagitta107.chatgpt.site');
let householdKey='';
const pending=new Set<AbortController>();
export function cancelRequests(){for(const c of pending)c.abort('cancelled');}

export async function api(path:string,method='GET',data?:any){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),(path==='ai'||path==='recommendations'||path==='browse'||path.endsWith('/match'))?45000:20000);pending.add(controller);
 try{const r=await fetch(API_ORIGIN+'/api/'+path,{method,headers:{'content-type':'application/json',...(householdKey?{'x-household-key':householdKey}:{})},...(data!==undefined?{body:JSON.stringify(data)}:{}),signal:controller.signal});const body=await r.json();if(!r.ok)throw Error(body.error||'Could not connect. Try again.');return body;}catch(e){if(controller.signal.reason==='cancelled')throw Error('Request cancelled. If you were saving, check My nights before trying again.');if(e.name==='AbortError')throw Error('That took too long. Please try again.');throw e;}finally{clearTimeout(timeout);pending.delete(controller);}
}
export async function publicApi(path:string,method='GET',data?:any){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);pending.add(controller);
 try{const r=await fetch(API_ORIGIN+'/api/'+path,{method,headers:{'content-type':'application/json'},...(data!==undefined?{body:JSON.stringify(data)}:{}),signal:controller.signal});const body=await r.json();if(!r.ok)throw Error(body.error||'Could not connect. Try again.');return body;}catch(e){if(e.name==='AbortError')throw Error('That took too long. Please try again.');throw e;}finally{clearTimeout(timeout);pending.delete(controller);}
}
export async function openHousehold(){
 householdKey=await AsyncStorage.getItem('supper-scene-household')||'';
 if(householdKey)return api('household');
 const h=await api('household','POST');householdKey=h.key;await AsyncStorage.setItem('supper-scene-household',h.key);return h;
}
