import html from '@/out/workbench.html?raw';
export const dynamic='force-dynamic';
export async function GET(){return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
