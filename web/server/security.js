// CSP permits the inline styles required by React Native Web, but not inline scripts.
export const CSP="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
export function secureResponse(response){
 const headers=new Headers(response.headers);
 headers.set('Content-Security-Policy',CSP);
 headers.set('X-Frame-Options','DENY');
 headers.set('X-Content-Type-Options','nosniff');
 headers.set('Referrer-Policy','no-referrer');
 headers.set('Strict-Transport-Security','max-age=31536000');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
