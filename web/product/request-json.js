export async function requestJson(url,options={},timeoutMs=20000,fetcher=fetch){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetcher(url,{...options,signal:controller.signal});
  let result;try{result=await response.json();}catch(error){if(controller.signal.aborted)throw error;throw Error('The server is unavailable. Please try again.');}
  if(!response.ok)throw Error(result.error||'Something went wrong. Please try again.');
  return result;
 }catch(error){
  if(controller.signal.aborted)throw Error(options.method&&options.method!=='GET'?'The connection timed out. Check your saved progress before trying again.':'The connection timed out. Please try again.');
  throw error;
 }finally{clearTimeout(timer);}
}
