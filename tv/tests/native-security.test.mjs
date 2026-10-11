import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('release cannot silently fall back to the debug signing identity',()=>{
 const gradle=readFileSync('android/app/build.gradle','utf8');
 assert.match(gradle,/release \{\s*signingConfig signingConfigs.release/);
 assert.match(gradle,/throw new GradleException\('Release signing credentials/);
 const config=JSON.parse(readFileSync('app.json','utf8'));
 assert.ok(config.expo.plugins.includes('./plugins/with-security.cjs'));
});
test('cloud backup and device transfer exclude household credentials',()=>{
 const manifest=readFileSync('android/app/src/main/AndroidManifest.xml','utf8');
 assert.match(manifest,/android:allowBackup="false"/);
 assert.match(manifest,/android:dataExtractionRules="@xml\/data_extraction_rules"/);
 const rules=readFileSync('android/app/src/main/res/xml/data_extraction_rules.xml','utf8');
 for(const section of ['cloud-backup','device-transfer']){
  const body=rules.split('<'+section+'>')[1].split('</'+section+'>')[0];
  for(const domain of ['root','file','database','sharedpref'])assert.ok(body.includes('domain="'+domain+'" path="."'));
 }
});
