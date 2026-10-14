import { cmsRequest } from '@/lib/cms/service';
export const dynamic='force-dynamic';
async function handle(request:Request,{params}:{params:Promise<{segments:string[]}>}){return cmsRequest(request,(await params).segments);}
export {handle as GET,handle as POST,handle as PUT,handle as PATCH,handle as DELETE};
