function handler(event) {
 var request=event.request;
 if(request.uri==='/api'||request.uri.indexOf('/api/')===0){
  request.headers['x-crave-viewer-ip']={value:event.viewer.ip};
  request.headers['x-crave-public-host']={value:request.headers.host.value};
  delete request.headers['x-crave-origin'];
  delete request.headers['cf-connecting-ip'];
  delete request.headers['x-forwarded-for'];
  delete request.headers.forwarded;
 }else{
  if(request.uri==='/app'||request.uri==='/tv')return {statusCode:302,headers:{location:{value:request.uri+'/'},'cache-control':{value:'no-store'},'strict-transport-security':{value:'max-age=31536000'},'x-frame-options':{value:'DENY'},'x-content-type-options':{value:'nosniff'},'referrer-policy':{value:'no-referrer'},'content-security-policy':{value:"default-src 'none'; frame-ancestors 'none'"}}};
  if(request.uri.endsWith('/'))request.uri+='index.html';
 }
 return request;
}
