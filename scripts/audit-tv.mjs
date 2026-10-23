import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {policy,verifyPatches} from './tv-security-patches.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const allowed={'GHSA-vfj7-8cjw-p6xm':'braces','GHSA-86w9-cpqp-85rv':'node-forge'};
export function assess(report,now=new Date()){
  if(now>=new Date(policy.expires+'T00:00:00Z'))throw Error('Temporary TV security exceptions expired; review upstream fixes.');
  if(report.error || report.auditReportVersion!==2 || !report.vulnerabilities || !report.metadata?.vulnerabilities)throw Error('Unrecognized or failed npm audit response');
  const findings=report.vulnerabilities;
  function mitigated(name){
    const seen=new Set();let advisoryCount=0;
    function visit(current){
      if(seen.has(current))return true;
      seen.add(current);
      const item=findings[current];
      if(!item || !Array.isArray(item.via) || !item.via.length)return false;
      return item.via.every(v=>{
        if(typeof v==='string')return visit(v);
        const id=v.url?.split('/').pop();
        advisoryCount++;
        return allowed[id]===current && v.name===current && v.url==='https://github.com/advisories/'+id;
      });
    }
    return visit(name) && advisoryCount>0;
  }
  const blocked=Object.entries(findings).filter(([name,v])=>['high','critical'].includes(v.severity)&&!mitigated(name)).map(([name])=>name);
  if(blocked.length)throw Error('Unmitigated high/critical vulnerabilities: '+blocked.join(', '));
  return Object.keys(findings).filter(name=>mitigated(name));
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    verifyPatches();
    const tests=spawnSync(process.execPath,['--test','tv/tests/dependency-security.test.mjs'],{cwd:root,stdio:'inherit'});
    if(tests.status!==0)throw Error('Dependency security regression tests failed');
    const win=process.platform==='win32';
    const audit=spawnSync(win?'cmd.exe':'npm',win?['/d','/s','/c','npm','--prefix','tv','audit','--json']:['--prefix','tv','audit','--json'],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
    if(audit.error || ![0,1].includes(audit.status))throw Error('npm audit could not run');
    const report=JSON.parse(audit.stdout);
    const mitigated=assess(report);
    console.log(JSON.stringify(report.metadata.vulnerabilities));
    console.log('Registry advisories remain visible. Verified local mitigations:',mitigated.join(', ')||'none');
    console.log('Exceptions expire '+policy.expires+'. New high/critical advisories still fail.');
  }catch(error){console.error(error.message);process.exitCode=1;}
}
