const encoder=new TextEncoder();
const COOKIE='__Host-danny-owner';
const MAX_AGE=8*60*60;
const privateHeaders={'Cache-Control':'no-store, private','X-Robots-Tag':'noindex, nofollow','X-Frame-Options':'DENY','Referrer-Policy':'same-origin'};
const bytesToBase64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const fromBase64=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const json=(value,status=200,extra={})=>new Response(JSON.stringify(value),{status,headers:{...privateHeaders,'Content-Type':'application/json',...extra}});
const redirect=(url,extra={})=>new Response(null,{status:303,headers:{...privateHeaders,Location:url,...extra}});
async function sessionKey(env){return crypto.subtle.importKey('raw',encoder.encode(env.OWNER_SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function authenticated(request,env){
 if(!env.OWNER_SESSION_SECRET)return false;
 const token=request.headers.get('Cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!token||token.length>1024)return false;
 try{
  const [payload,signature,...rest]=token.split('.');if(rest.length||!signature)return false;
  if(!await crypto.subtle.verify('HMAC',await sessionKey(env),fromBase64(signature),encoder.encode(payload)))return false;
  const data=JSON.parse(new TextDecoder().decode(fromBase64(payload)));
  const now=Math.floor(Date.now()/1000);
  return data.sub==='DannyOng'&&Number.isInteger(data.exp)&&data.exp>now&&data.exp<=now+MAX_AGE;
 }catch{return false;}
}
async function correctPassword(password,stored){
 const [salt,expected]=stored.split(':');
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 const actual=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:fromBase64(salt),iterations:100000},key,256));
 const target=fromBase64(expected);if(target.length!==actual.length)return false;
 let mismatch=0;for(let i=0;i<actual.length;i++)mismatch|=actual[i]^target[i];return mismatch===0;
}
function protectResponse(response){return new Response(response.body,{status:response.status,statusText:response.statusText,headers:new Headers([...response.headers,...Object.entries(privateHeaders)])});}
export default{
 async fetch(request,env){
  const url=new URL(request.url);let path;
  try{path=decodeURIComponent(url.pathname).replace(/\/+/g,'/').toLowerCase();}catch{return new Response('Invalid path',{status:400});}
  if(path.startsWith('/api/owner/')){
   if(request.method!=='POST')return json({error:'Method not allowed.'},405,{'Allow':'POST'});
   if(request.headers.get('Origin')!==url.origin)return json({error:'Request not allowed.'},403);
   if(path==='/api/owner/logout')return redirect('/owner-login/',{'Set-Cookie':`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`});
   if(path!=='/api/owner/login')return json({error:'Not found.'},404);
   if(!env.OWNER_PASSWORD_HASH||!env.OWNER_SESSION_SECRET||!env.LOGIN_LIMITER)return json({error:'Owner login is temporarily unavailable.'},503);
   const {success}=await env.LOGIN_LIMITER.limit({key:'owner-login:'+request.headers.get('CF-Connecting-IP')});
   if(!success)return json({error:'Too many attempts. Please wait one minute and try again.'},429,{'Retry-After':'60'});
   if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Invalid request.'},400);
   const body=await request.text();if(body.length>1024)return json({error:'Invalid request.'},400);
   let data;try{data=JSON.parse(body);}catch{return json({error:'Invalid request.'},400);}
   if(typeof data.username!=='string'||typeof data.password!=='string'||data.password.length>128)return json({error:'Incorrect owner name or password.'},401);
   const valid=await correctPassword(data.password,env.OWNER_PASSWORD_HASH);
   if(data.username!=='DannyOng'||!valid)return json({error:'Incorrect owner name or password.'},401);
   const payload=bytesToBase64(encoder.encode(JSON.stringify({sub:'DannyOng',exp:Math.floor(Date.now()/1000)+MAX_AGE,nonce:crypto.randomUUID()})));
   const signature=bytesToBase64(await crypto.subtle.sign('HMAC',await sessionKey(env),encoder.encode(payload)));
   return json({ok:true},200,{'Set-Cookie':`${COOKIE}=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`});
  }
  const ownerPage=/^\/(studio|admin|workbench)(\/|\.html(?:\/|$)|$)/.test(path);
  const loginPage=/^\/owner-login(?:\/|$)/.test(path);
  if(ownerPage||loginPage){
   const loggedIn=await authenticated(request,env);
   if(ownerPage&&!loggedIn)return redirect('/owner-login/');
   if(loginPage&&loggedIn)return redirect('/studio/');
   return protectResponse(await env.ASSETS.fetch(request));
  }
  return env.ASSETS.fetch(request);
 }
};
