// Stop only after the caller confirms persistence. A blocked or failed save retries.
export function createOrderConfirmationSync({read,apply,onError=()=>{},schedule=setTimeout,cancel=clearTimeout,interval=3000}){
 let stopped=false,done=false,running=false,timer;
 async function poll(){
  if(stopped||done||running)return;
  running=true;
  try{
   const data=await read();
   if(!stopped&&data.confirmation)done=(await apply(data.confirmation))===true;
  }catch(error){if(!stopped)onError(error);}
  finally{running=false;if(!stopped&&!done)timer=schedule(poll,interval);}
 }
 return {poll,stop(){stopped=true;cancel(timer);}};
}
