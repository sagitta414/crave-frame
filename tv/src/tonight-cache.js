// Session-only choices survive navigation; preference changes use a different entry.
const entries=new Map();
export function tonightEntry(key){
 if(!entries.has(key))entries.set(key,{result:null,position:0,pending:null,generation:0,
  clear(){this.generation++;this.result=null;this.pending=null;this.position=0;},
  load(loader){if(this.result)return Promise.resolve(this.result);if(this.pending)return this.pending;const generation=this.generation;this.pending=Promise.resolve().then(loader).then(result=>{if(generation===this.generation)this.result={...result,requestKey:key};return {...result,requestKey:key};}).finally(()=>{if(generation===this.generation)this.pending=null;});return this.pending;}
 });return entries.get(key);
}
