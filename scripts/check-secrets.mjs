import {readdirSync,readFileSync,statSync} from 'node:fs';
import {join,relative} from 'node:path';
const root=process.cwd(),skip=new Set(['node_modules','.git','.local','.expo','dist','out','web-export','.gradle','.cxx','build']);
const patterns=[/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,/gh[pousr]_[A-Za-z0-9]{30,}/,/github_pat_[A-Za-z0-9_]{40,}/,/art_v2_[A-Za-z0-9_]{15,}/,/AIza[0-9A-Za-z_-]{30,}/];
const found=[];let checked=0;
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){if(skip.has(e.name))continue;const p=join(dir,e.name);if(e.isDirectory()){walk(p);continue;}if(/\.(pem|key|jks|keystore|p12)$/.test(e.name)){found.push(relative(root,p));continue;}if(!/\.(js|mjs|cjs|jsx|ts|tsx|json|yml|yaml|md|html|xml|properties|gradle|ps1|sh|txt)$/.test(e.name)||statSync(p).size>3000000)continue;checked++;const text=readFileSync(p,'utf8');if(patterns.some(re=>re.test(text)))found.push(relative(root,p));}}
walk(root);if(found.length){console.error('Possible credentials (paths only):\n'+found.join('\n'));process.exit(1);}console.log('No configured credential patterns found in '+checked+' text files. This is not a comprehensive security audit.');
