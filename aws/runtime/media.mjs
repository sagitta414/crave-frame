import {PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
export function mediaAdapter(client,bucket){
 const key=value=>{if(!/^photos\/[a-f0-9]{64}$/.test(value))throw Error('Invalid media key');return value;};
 return {
  put:(name,body,options={})=>client.send(new PutObjectCommand({Bucket:bucket,Key:key(name),Body:body,ContentType:options.httpMetadata?.contentType||'image/jpeg',CacheControl:'no-store'})),
  async get(name){try{const result=await client.send(new GetObjectCommand({Bucket:bucket,Key:key(name)}));return {body:await result.Body.transformToByteArray()};}catch(e){if(e.name==='NoSuchKey'||e.$metadata?.httpStatusCode===404)return null;throw e;}},
  delete:name=>client.send(new DeleteObjectCommand({Bucket:bucket,Key:key(name)}))
 };
}
