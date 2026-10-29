import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../../owner-worker.mjs';

function environment(vehicles,{missing=false}={}){
 const reads=[];
 const env={
  ASSETS:{async fetch(request){
   const url=new URL(request.url);reads.push({path:url.pathname,validator:request.headers.get('If-None-Match')});
   if(url.pathname==='/404')return new Response('Vehicle not found');
   if(missing&&url.pathname.startsWith('/vehicle/'))return new Response('Not found',{status:404});
   if(request.headers.has('If-None-Match'))return new Response(null,{status:304,headers:{ETag:'static-build'}});
   return new Response('<html><head></head><main id="vehicleContent"></main></html>',{headers:{'Content-Type':'text/html',ETag:'static-build','Last-Modified':'Wed, 21 Oct 2026 00:00:00 GMT'}});
  }},
  CONTENT_STORE:{idFromName(name){assert.equal(name,'showroom');return name;},get(){return {async fetch(request){assert.equal(new URL(request.url).pathname,'/api/content/published');return Response.json({document:{vehicles,profile:{},finance:{rate:6,tenure:7,downPayment:10}}});}};}}
 };
 return {env,reads};
}

test('vehicle publication is re-read despite the static asset conditional validator',async()=>{
 const {env,reads}=environment([{id:'current-car',stockId:'CURRENT'}]);
 const previous=globalThis.HTMLRewriter;
 // Platform stand-in preserves headers, as the real HTMLRewriter does.
 globalThis.HTMLRewriter=class{on(){return this;}transform(response){return response;}};
 try{
  const response=await worker.fetch(new Request('https://example.com/vehicle/current-car/',{headers:{'If-None-Match':'static-build','If-Modified-Since':'Wed, 21 Oct 2026 00:00:00 GMT'}}),env);
  assert.equal(response.status,200);
  assert.equal(reads[0].validator,null);
  assert.equal(response.headers.get('ETag'),null);
  assert.equal(response.headers.get('Last-Modified'),null);
  assert.equal(response.headers.get('Cache-Control'),'no-store');
 }finally{globalThis.HTMLRewriter=previous;}
});

test('a removed generated vehicle is not shown from an obsolete snapshot',async()=>{
 const {env}=environment([]);
 const response=await worker.fetch(new Request('https://example.com/vehicle/removed/'),env);
 assert.equal(response.status,404);
 assert.equal(await response.text(),'Vehicle not found');
});

test('an unknown vehicle route does not expose the Audi fallback as that car',async()=>{
 const {env}=environment([],{missing:true});
 const response=await worker.fetch(new Request('https://example.com/vehicle/missing/'),env);
 assert.equal(response.status,404);
 assert.equal(await response.text(),'Vehicle not found');
});

test('homepage uses the current publication before the first render, without a static validator',async()=>{
 const {env,reads}=environment([{id:'fresh-photo',stockId:'NEW',gallery:[{url:'/assets/uploads/new.webp'}]}]);
 const previous=globalThis.HTMLRewriter;const injected=[];
 globalThis.HTMLRewriter=class{on(selector,handler){if(selector==='head')handler.element({append(html){injected.push(html);}});return this;}transform(response){return response;}};
 try{
  const response=await worker.fetch(new Request('https://example.com/',{headers:{'If-None-Match':'static-build'}}),env);
  assert.equal(response.status,200);assert.equal(reads[0].validator,null);
  assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(response.headers.get('ETag'),null);
  assert.match(injected.join(''),/CMS_CONTENT_CURRENT=true/);assert.match(injected.join(''),/new.webp/);
 }finally{globalThis.HTMLRewriter=previous;}
});

test('publication failure never falls back to outdated public photos',async()=>{
 const {env}=environment([]);env.CONTENT_STORE.get=()=>({fetch:async()=>new Response('Unavailable',{status:503})});
 const response=await worker.fetch(new Request('https://example.com/'),env);
 assert.equal(response.status,503);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.doesNotMatch(await response.text(),/CMS_DATA|static-build/);
});
