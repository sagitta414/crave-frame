import {readdirSync,readFileSync,statSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),skip=new Set(['node_modules','.git','.local','.expo','dist','out','web-export','.gradle','.cxx','build','cdk.out','.release']);
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/gh[pousr]_[A-Za-z0-9]{30,}/,/github_pat_[A-Za-z0-9_]{40,}/,/art_v2_[A-Za-z0-9_]{15,}/,/AIza[0-9A-Za-z_-]{30,}/,/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,/\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/,/https?:\/\/[^\s/:]+:[^\s/@]{8,}@/,/(?:aws_secret_access_key|TMDB_ACCESS_TOKEN|INTEGRATION_ENCRYPTION_KEY)\s*[=:]\s*["']?(?!process\.env\.)[A-Za-z0-9/+_.=-]{32,}/i];
const forbidden=p=>/\.(key|jks|keystore|p12)$/i.test(p);
const found=new Set();let checked=0,binary=0,large=0;
function scan(path,bytes){if(forbidden(path)){found.add(path);return;}if(bytes.length>3000000){large++;return;}if(bytes.includes(0)){binary++;return;}checked++;if(patterns.some(re=>re.test(bytes.toString('utf8'))))found.add(path);}
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){if(skip.has(e.name)||e.isSymbolicLink())continue;const p=join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile())scan(relative(root,p),readFileSync(p));}}
if(process.argv.includes('--history')){
 const git=args=>execFileSync('git',['-c','safe.directory='+resolve(root).replaceAll('\\','/'),...args],{maxBuffer:256*1024*1024});
 const entries=git(['rev-list','--objects','--all']).toString().trim().split('\n').filter(x=>x.includes(' '));
 const paths=new Map(entries.map(x=>[x.slice(0,40),x.slice(41)]));
 const data=execFileSync('git',['-c','safe.directory='+resolve(root).replaceAll('\\','/'),'cat-file','--batch'],{input:[...paths.keys()].join('\n')+'\n',maxBuffer:256*1024*1024});
 let at=0;while(at<data.length){const end=data.indexOf(10,at);const [sha,type,size]=data.subarray(at,end).toString().split(' ');const length=Number(size);if(!Number.isFinite(length))throw Error('Cannot read history object metadata');at=end+1;if(type==='blob')scan(sha.slice(0,12)+':'+paths.get(sha),data.subarray(at,at+length));at+=length+1;}
}else walk(root);
if(found.size){console.error('Possible credentials (locations only):\n'+[...found].join('\n'));process.exit(1);}
console.log(`No configured credential patterns found in ${checked} text files/blobs; skipped ${binary} binary and ${large} oversized objects. This is not a comprehensive security audit.`);
