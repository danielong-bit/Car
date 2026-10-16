import snapshot from '@/data/public-site.json';
export const dynamic='force-dynamic';
async function handle(request:Request,{params}:{params:Promise<{segments:string[]}>}){
 const [action]=(await params).segments;
 if(request.method==='GET'&&['public','published'].includes(action))return Response.json(snapshot);
 return Response.json({error:'This exhibition uses manual browser editing and GitHub file exports. Server writes are disabled.'},{status:410});
}
export {handle as GET,handle as POST,handle as PUT,handle as PATCH,handle as DELETE};
