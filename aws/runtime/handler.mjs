import pg from 'pg';
import {Signer} from '@aws-sdk/rds-signer';
import {SecretsManagerClient,GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';
import {S3Client} from '@aws-sdk/client-s3';
import {api} from '../../web/server/worker.js';
import {databaseAdapter} from './postgres.mjs';
import {mediaAdapter} from './media.mjs';
import {gatewayRequest,gatewayResponse} from './request.mjs';
import {databaseOptions} from './database-options.mjs';
pg.types.setTypeParser(20,value=>{const n=Number(value);if(!Number.isSafeInteger(n))throw Error('Integer outside supported range');return n;});
const secrets=new SecretsManagerClient({}),s3=new S3Client({});
let pool,config,expires=0;
async function secret(arn){return JSON.parse((await secrets.send(new GetSecretValueCommand({SecretId:arn}))).SecretString);}
async function settings(){if(!config||expires<Date.now()){config={runtime:await secret(process.env.RUNTIME_SECRET_ARN),edge:await secret(process.env.EDGE_SECRET_ARN)};expires=Date.now()+60000;}return config;}
export async function handler(event,context){
 if(context)context.callbackWaitsForEmptyEventLoop=false;
 const started=Date.now();let status=500;
 try{
  const {edge,runtime}=await settings();const {request,ip}=gatewayRequest(event,edge.token);
  if(!pool)pool=new pg.Pool(await databaseOptions(process.env,secret,options=>new Signer(options)));
  let response;
  if(new URL(request.url).pathname==='/api/health'){
   const result=await pool.query("SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1");
   const ready=result.rows[0]?.version==='001_initial.sql';
   response=Response.json({status:ready?'ready':'not-ready',version:process.env.DEPLOYMENT_VERSION},{status:ready?200:503});
  }else{
   const allowed=Object.fromEntries(['GCP_SERVICE_ACCOUNT_JSON','GCP_PROJECT_ID','GCP_MODEL','TMDB_ACCESS_TOKEN','INTEGRATION_ENCRYPTION_KEY'].filter(k=>typeof runtime[k]==='string'&&runtime[k]).map(k=>[k,runtime[k]]));
   response=await api(request,{...allowed,AI_PROVIDER:process.env.AI_PROVIDER||'catalog',DB:databaseAdapter(pool),MEDIA:mediaAdapter(s3,process.env.MEDIA_BUCKET),TRUSTED_CLIENT_IP:ip});
  }
  status=response.status;return await gatewayResponse(response);
 }catch(e){status=e.status||503;return await gatewayResponse(Response.json({error:status===403?'Forbidden':'Service temporarily unavailable'},{status}));}
 finally{console.log(JSON.stringify({event:'api_request',requestId:context?.awsRequestId,status,durationMs:Date.now()-started,version:process.env.DEPLOYMENT_VERSION}));}
}
