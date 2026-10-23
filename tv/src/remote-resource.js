// Latest request wins, including retries and route changes.
export function remoteResource(publish) {
 let generation=0;
 return {
  cancel(){generation++;},
  async load(key,request){
   const current=++generation;
   publish({key,status:'loading',data:null,error:''});
   try {
    const data=await request();
    if(current===generation)publish({key,status:'ready',data,error:''});
   } catch(error) {
    if(current===generation)publish({key,status:'error',data:null,error:error?.message||'Unable to load. Please try again.'});
   }
  }
 };
}
