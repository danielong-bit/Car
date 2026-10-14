import { getStudioUser } from '@/lib/studio-auth';
import { documentFor } from './service';
import { publicDocument } from './contracts.mjs';
export async function showroomPage(request:Request,html:string){
  const preview=new URL(request.url).searchParams.get('preview')==='1';
  if(preview&&!await getStudioUser())return new Response('Staff sign-in required',{status:401});
  const r=await documentFor(preview?'draft':'published');
  const content=preview?r.document:publicDocument(r.document);
  // Legacy HTML is a layout template, never the public source of stock or consent.
  if(/class="home(?: |")/.test(html)){
    const slide=html.match(/<article class="showcase-slide[^]*?<\/article>/)?.[0];
    html=html.replace(/<article class="showcase-slide[^]*?<\/article>/g,'');
    if(slide)html=html.replace(/(<body\b[^>]*>)/,'$1<template id="cmsShowcaseTemplate">'+slide+'</template>');
    html=html.replace(/<section class="customer-stories" id="customer-stories"[^]*?<\/section>/,'<section class="customer-stories" id="customer-stories"><p>Customer moments are shared after permission is recorded.</p></section>');
  }
  const data=JSON.stringify({...content,preview,revision:r.revision}).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
  const canonical=new URL(request.url);canonical.search='';canonical.hash='';const social='<link rel="canonical" href="'+canonical.toString()+'"><meta property="og:site_name" content="Danny Recon"><meta property="og:type" content="website"><meta property="og:url" content="'+canonical.toString()+'">';
  html=html.replace('<script src="/site-languages.js?v=26" defer></script>','');
  return new Response(html.replace('<head>','<head>'+social+'<base href="/"><link rel="stylesheet" href="/danny-interactions.css"><link rel="stylesheet" href="/cms.css"><script>window.CMS_DATA='+data+';</script>').replace('</body>','<script src="/cms-public.js?v=cms1"></script><script src="/danny-interactions.js" defer></script><script src="/select-home.js?v=25" defer></script><script src="/select-polish.js?v=25" defer></script><script src="/site-languages.js?v=26" defer></script></body>'),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':preview?'private, no-store':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN'}});
}
