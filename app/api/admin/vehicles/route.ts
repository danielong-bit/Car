export const dynamic='force-dynamic';
const disabled=()=>Response.json({error:'Use the authenticated CMS API.'},{status:410});
export {disabled as GET,disabled as POST,disabled as PUT,disabled as PATCH,disabled as DELETE};
