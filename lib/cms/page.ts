import snapshot from '@/data/public-site.json';
export async function showroomPage(request:Request,html:string){
  const data=JSON.stringify({...snapshot.document,staticSite:true,preview:false}).replaceAll('<','\\u003c').replaceAll('>','\\u003e');
  const origin=new URL(request.url).origin;
  const content=html.replace(/<head>/i,`<head><base href="/"><script>window.SITE_BASE='/';window.GITHUB_PAGES_STATIC=true;window.CMS_DATA=${data};</script><link rel="canonical" href="${origin+new URL(request.url).pathname}">`);
  return new Response(content,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
