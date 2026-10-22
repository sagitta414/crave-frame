import test from 'node:test';
import assert from 'node:assert/strict';
import {databaseOptions} from '../runtime/database-options.mjs';
test('existing secret-based deployment retains TLS and refreshes rotated credentials',async()=>{
 let password='first';
 const options=await databaseOptions({DB_HOST:'private.example',APP_SECRET_ARN:'test'},async()=>({username:'crave_app',password}),()=>{throw Error('Must not use IAM');});
 assert.equal(await options.password(),'first');password='rotated';assert.equal(await options.password(),'rotated');
 assert.equal(options.ssl.rejectUnauthorized,true);assert.equal(options.user,'crave_app');
});
test('IAM deployment retains temporary token authentication',async()=>{
 const options=await databaseOptions({DB_HOST:'proxy.example',AWS_REGION:'us-east-1'},()=>{throw Error('Unexpected secret');},args=>{assert.equal(args.hostname,'proxy.example');return {getAuthToken:async()=> 'temporary'};});
 assert.equal(await options.password(),'temporary');
});
test('secret configuration fails closed without falling back to IAM or an administrator',async()=>{
 await assert.rejects(databaseOptions({APP_SECRET_ARN:'test'},async()=>({username:'crave_admin',password:'no'}),()=>{}),/Invalid application/);
});
