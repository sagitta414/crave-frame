// Latest request wins, including retries and route changes.
export function remoteResource(publish) {
 let generation=0,last=null,activeKey=null;
 return {
  cancel(){generation++;activeKey=null;},
  update(key,transform){
   if(activeKey!==key||last?.key!==key)return;
   const data=transform(last.data);generation++;last={key,data};
   publish({key,status:'ready',data:last.data,error:''});
  },
  async load(key,request,{keepData=false}={}){
   const current=++generation;activeKey=key;
   const retained=keepData&&last?.key===key?last.data:null;
   publish(retained?{key,status:'ready',data:retained,error:'',refreshing:true}:{key,status:'loading',data:null,error:''});
   try {
    const data=await request();
    if(current===generation){last={key,data};publish({key,status:'ready',data,error:''});}
   } catch(error) {
    if(current===generation)publish({key,status:retained?'ready':'error',data:retained,error:error?.message||'Unable to load. Please try again.'});
   }
  }
 };
}
