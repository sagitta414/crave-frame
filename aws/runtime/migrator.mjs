import pg from 'pg';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {SecretsManagerClient,GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';
import {RDSClient,DescribeDBClusterSnapshotsCommand} from '@aws-sdk/client-rds';
import {applyMigrations} from './migrations.mjs';
const sm=new SecretsManagerClient({}),rds=new RDSClient({});
async function secret(id){return JSON.parse((await sm.send(new GetSecretValueCommand({SecretId:id}))).SecretString);}
export async function handler(event){
 let client;
 try{
  if(!['plan','apply'].includes(event.action))throw Error('Use plan or apply');
  if(event.action==='apply'){
   if(!event.snapshot)throw Error('A completed pre-migration snapshot is required');
   const result=await rds.send(new DescribeDBClusterSnapshotsCommand({DBClusterSnapshotIdentifier:event.snapshot})),snapshot=result.DBClusterSnapshots?.[0];
   if(snapshot?.DBClusterIdentifier!==process.env.CLUSTER_ID||snapshot.Status!=='available'||Date.now()-new Date(snapshot.SnapshotCreateTime).getTime()>3600000)throw Error('Snapshot must be available, belong to this cluster, and be less than one hour old');
  }
  const admin=await secret(process.env.ADMIN_SECRET_ARN),root=process.env.LAMBDA_TASK_ROOT||'.release/lambda';
  client=new pg.Client({host:process.env.DB_HOST,user:admin.username,password:admin.password,database:'craveframe',port:5432,ssl:{rejectUnauthorized:true,ca:readFileSync(join(root,'global-bundle.pem'),'utf8')},connectionTimeoutMillis:5000,statement_timeout:120000});await client.connect();
  const migrations=readdirSync(join(root,'migrations')).filter(n=>n.endsWith('.sql')).map(version=>({version,sql:readFileSync(join(root,'migrations',version),'utf8')}));
  const result=await applyMigrations(client,migrations,{target:event.target,apply:event.action==='apply'});
  if(event.action==='apply'){
   const credentials=await secret(process.env.APP_SECRET_ARN);
   if(!/^[a-zA-Z0-9]{32,}$/.test(credentials.password))throw Error('Invalid generated database credential');
   if(!(await client.query("SELECT 1 FROM pg_roles WHERE rolname='crave_app'")).rowCount)await client.query('CREATE ROLE crave_app LOGIN');
   await client.query("ALTER ROLE crave_app PASSWORD '"+credentials.password+"'");
   await client.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC');
   await client.query('GRANT CONNECT ON DATABASE craveframe TO crave_app');
   await client.query('GRANT USAGE ON SCHEMA public TO crave_app');
   await client.query('GRANT SELECT,INSERT,UPDATE,DELETE ON households,shares,integrations,ai_usage,collections,rooms,parent_controls TO crave_app');
   await client.query('GRANT SELECT ON schema_migrations TO crave_app');
  }
  console.log(JSON.stringify({event:'migration',action:event.action,version:process.env.DEPLOYMENT_VERSION,success:true}));return {ok:true,...result};
 }catch{console.error(JSON.stringify({event:'migration',success:false,action:event?.action}));return {ok:false,error:'Migration failed; inspect configuration, ledger and snapshot status. No credentials are logged.'};}
 finally{await client?.end();}
}
