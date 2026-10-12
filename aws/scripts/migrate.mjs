import {readFileSync} from 'node:fs';
import {RDSClient,CreateDBClusterSnapshotCommand,waitUntilDBClusterSnapshotAvailable} from '@aws-sdk/client-rds';
import {LambdaClient,InvokeCommand} from '@aws-sdk/client-lambda';
const outputs=JSON.parse(readFileSync('outputs.json','utf8')).CraveFrameAmazon2026;
const action=process.argv[2]||'plan',target=process.argv[3];if(!['plan','apply'].includes(action))throw Error('Use plan or apply [target.sql]');
let snapshot;
if(action==='apply'){
 const rds=new RDSClient({});snapshot='crave-pre-migration-'+Date.now();
 await rds.send(new CreateDBClusterSnapshotCommand({DBClusterIdentifier:outputs.ClusterId,DBClusterSnapshotIdentifier:snapshot}));
 console.log(JSON.stringify({event:'backup_requested',snapshot}));
 const waiter=await waitUntilDBClusterSnapshotAvailable({client:rds,maxWaitTime:3600,minDelay:20,maxDelay:40},{DBClusterSnapshotIdentifier:snapshot});
 if(waiter.state!=='SUCCESS')throw Error('Backup did not complete; migration not invoked');
}
const result=await new LambdaClient({}).send(new InvokeCommand({FunctionName:outputs.MigratorName,Payload:Buffer.from(JSON.stringify({action,target,snapshot}))}));
if(result.FunctionError)throw Error('Migration invocation failed');const body=JSON.parse(Buffer.from(result.Payload).toString());console.log(JSON.stringify(body));if(!body.ok)process.exitCode=1;
