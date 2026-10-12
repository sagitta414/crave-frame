import {timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';
import {secureResponse} from '../../web/server/security.js';
export function gatewayRequest(event,edgeToken){
 const h=new Headers(event.headers||{}),provided=h.get('x-crave-origin')||'';
 const left=Buffer.from(provided),right=Buffer.from(edgeToken||'');
 if(!right.length||left.length!==right.length||!timingSafeEqual(left,right))throw Object.assign(Error('Forbidden'),{status:403});
 // Only the authenticated distribution may supply this header; its viewer function
 // overwrites any client value using event.viewer.ip, never X-Forwarded-For.
 const ip=h.get('x-crave-viewer-ip'),host=h.get('x-crave-public-host');
 if(!isIP(ip||'')||!host||!/^[-a-z0-9.]+\.cloudfront\.net$/.test(host))throw Object.assign(Error('Invalid edge context'),{status:403});
 if(event.version!=='2.0'||!event.requestContext?.http)throw Object.assign(Error('Invalid gateway context'),{status:400});
 const method=event.requestContext.http.method;
 for(const name of ['cf-connecting-ip','x-forwarded-for','forwarded','x-crave-origin','x-crave-viewer-ip','x-crave-public-host','host','content-length'])h.delete(name);
 const body=event.body?Buffer.from(event.body,event.isBase64Encoded?'base64':'utf8'):undefined;
 if(body?.length>1500000)throw Object.assign(Error('Request too large'),{status:413});
 return {ip,request:new Request('https://'+host+event.rawPath+(event.rawQueryString?'?'+event.rawQueryString:''),{method,headers:h,...(!['GET','HEAD'].includes(method)&&body?{body}:{} )})};
}
export async function gatewayResponse(response){
 const secured=secureResponse(response),headers=Object.fromEntries(secured.headers);
 headers['cache-control']='no-store';
 return {statusCode:secured.status,headers,isBase64Encoded:true,body:Buffer.from(await secured.arrayBuffer()).toString('base64')};
}
