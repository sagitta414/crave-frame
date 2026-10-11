import AsyncStorage from '@react-native-async-storage/async-storage';
import {createRecoveredHousehold} from './household-recovery';
export const API_ORIGIN=process.env.EXPO_PUBLIC_API_ORIGIN||(typeof window!=='undefined'&&window.location?.origin?window.location.origin:'https://screen-to-supper-storyboard.sagitta107.chatgpt.site');
import {mayCancelRequest,cancelPending} from './request-policy';
let householdKey='';
const pending=new Map<AbortController,boolean>();
export function cancelRequests(){cancelPending(pending);}

export async function api(path:string,method='GET',data?:any){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),(path==='ai'||path==='recommendations'||path==='browse'||path.endsWith('/match'))?45000:20000);pending.set(controller,mayCancelRequest(path,method));
 try{const r=await fetch(API_ORIGIN+'/api/'+path,{method,headers:{'content-type':'application/json',...(householdKey?{'x-household-key':householdKey}:{})},...(data!==undefined?{body:JSON.stringify(data)}:{}),signal:controller.signal});const body=await r.json();if(!r.ok)throw Object.assign(Error(body.error||'Could not connect. Try again.'),{status:r.status});return body;}catch(e){if(controller.signal.reason==='cancelled')throw Error('Request cancelled. If you were saving, check My evenings before trying again.');if(e.name==='AbortError')throw Error('That took too long. Please try again.');throw e;}finally{clearTimeout(timeout);pending.delete(controller);}
}
export async function publicApi(path:string,method='GET',data?:any){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);pending.set(controller,mayCancelRequest(path,method));
 try{const r=await fetch(API_ORIGIN+'/api/'+path,{method,headers:{'content-type':'application/json'},...(data!==undefined?{body:JSON.stringify(data)}:{}),signal:controller.signal});const body=await r.json();if(!r.ok)throw Object.assign(Error(body.error||'Could not connect. Try again.'),{status:r.status});return body;}catch(e){if(e.name==='AbortError')throw Error('That took too long. Please try again.');throw e;}finally{clearTimeout(timeout);pending.delete(controller);}
}
export async function openHousehold(){
 householdKey=await AsyncStorage.getItem('supper-scene-household')||'';
 if(householdKey)return api('household');
 const h=await api('household','POST');householdKey=h.key;await AsyncStorage.setItem('supper-scene-household',h.key);return h;
}

export async function recoverHousehold(){
 const h=await createRecoveredHousehold(()=>publicApi('household','POST'),key=>AsyncStorage.setItem('supper-scene-household',key));
 householdKey=h.key;return h;
}
