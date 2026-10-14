import html from '@/out/cms-vehicle.html?raw';
import {showroomPage} from '@/lib/cms/page';
import {documentFor} from '@/lib/cms/service';
import {getStudioUser} from '@/lib/studio-auth';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const preview=new URL(request.url).searchParams.get('preview')==='1';if(preview&&!await getStudioUser())return new Response('Staff sign-in required',{status:401});const d=await documentFor(preview?'draft':'published');const v=d.document.vehicles.find((v:any)=>v.id===id&&(preview||['available','reserved','sold'].includes(v.status)));if(!v)return new Response('Vehicle not found. Browse the current inventory.',{status:404});return showroomPage(request,html.replace('Vehicle details · Danny Recon',`${v.brand} ${v.model} · Danny Recon`));}
