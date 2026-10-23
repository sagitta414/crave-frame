import {useEffect,useRef,useState} from 'react';
import {remoteResource} from './remote-resource';
export function useRemoteResource(key:string,request:()=>Promise<any>){
 const [state,setState]=useState<any>({key,status:'loading',data:null,error:''});
 const [attempt,setAttempt]=useState(0);
 const loader=useRef(request);loader.current=request;
 const resource=useRef<any>(null);
 if(!resource.current)resource.current=remoteResource(setState);
 useEffect(()=>{resource.current.load(key,()=>loader.current());return()=>resource.current.cancel();},[key,attempt]);
 return {...(state.key===key?state:{key,status:'loading',data:null,error:''}),retry:()=>setAttempt(v=>v+1)};
}
