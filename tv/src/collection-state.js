// Apply an authoritative mutation response without unmounting unrelated drafts.
export function applyCollectionMutation(data,key,result){
 if(result?.deleted===true)return {...data,collections:data.collections.filter(c=>c.key!==key)};
 if(!result||result.key!==key)throw Error('Collection update could not be applied. Refresh and retry.');
 return {...data,collections:data.collections.map(c=>c.key===key?result:c)};
}
