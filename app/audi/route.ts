import html from '@/out/audi.html?raw';
import {showroomPage} from '@/lib/cms/page';
import {documentFor} from '@/lib/cms/service';
export const dynamic='force-dynamic';
export async function GET(request:Request){const preview=new URL(request.url).searchParams.get('preview')==='1';const d=await documentFor(preview?'draft':'published');if(!d.document.vehicles.some((v:any)=>v.id==='audi-s5'&&(preview||['available','reserved','sold'].includes(v.status))))return new Response('Vehicle not available',{status:404});return showroomPage(request,html);}
