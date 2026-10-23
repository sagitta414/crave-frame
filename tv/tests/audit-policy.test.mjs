import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assess} from '../../scripts/audit-tv.mjs';
const now=new Date('2026-10-23T00:00:00Z');
const advisory={name:'braces',url:'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm'};
const report=()=>({auditReportVersion:2,metadata:{vulnerabilities:{high:2}},vulnerabilities:{braces:{severity:'high',via:[advisory]},metro:{severity:'high',via:['braces']}}});
test('only exact mitigated advisories and their dependents pass',()=>{
  assert.deepEqual(assess(report(),now),['braces','metro']);
  const r=report();r.vulnerabilities.braces.via.push({name:'braces',url:'https://github.com/advisories/GHSA-new-issue'});
  assert.throws(()=>assess(r,now),/Unmitigated/);
});
test('expired exceptions and audit errors fail closed',()=>{
  assert.throws(()=>assess(report(),new Date('2026-11-05T00:00:00Z')),/expired/);
  assert.throws(()=>assess({error:{code:'offline'}},now),/failed/);
});
test('unknown dependencies, cycles and empty advisory lists cannot pass',()=>{
  for(const via of [['missing'],['metro'],[]]){
    const r=report();r.vulnerabilities.metro.via=via;
    assert.throws(()=>assess(r,now),/Unmitigated/);
  }
});
test('dependency cycles must resolve exclusively to mitigated advisories',()=>{
  const r=report();r.vulnerabilities.metro.via=['expo','braces'];
  r.vulnerabilities.expo={severity:'high',via:['metro']};
  assert.equal(assess(r,now).length,3);
  r.vulnerabilities.expo.via.push({name:'expo',url:'https://github.com/advisories/GHSA-new'});
  assert.throws(()=>assess(r,now),/Unmitigated/);
});
