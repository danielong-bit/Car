import {createServer} from 'node:http';
import {spawnSync} from 'node:child_process';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildFacebookCatalogFeed,injectVehicleOpenGraphHtml} from '../public/facebook-catalog.mjs';
const repository=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.join(repository,process.env.PREVIEW_DIR||'dist-preview');
const publicRoot=path.join(repository,'public');
const mount=process.env.PREVIEW_BASE||'/';
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2','.mp4':'video/mp4','.pdf':'application/pdf'};
const portArgument=process.argv.indexOf('--port');
const port=Number(process.env.PORT||(portArgument>=0?process.argv[portArgument+1]:3000));
if(process.env.SKIP_BG_BUILD!=='1'){
 const result=spawnSync(process.execPath,['scripts/build-preview.mjs'],{cwd:repository,stdio:'inherit'});
 if(result.error)throw result.error;if(result.status)process.exit(result.status);
}
createServer(async(req,res)=>{
 try{
  const origin='http://127.0.0.1:'+port;
  const parsedUrl=new URL(req.url,origin);
  let requested=decodeURIComponent(parsedUrl.pathname);
  const publication=async()=>JSON.parse(await readFile(path.join(root,'published-baseline.json'),'utf8')).document;
  if(mount!=='/'){if(!requested.startsWith(mount)){res.writeHead(302,{Location:mount});return res.end();}requested='/'+requested.slice(mount.length);}
  if(/^\/api\/facebook\/catalog\.(csv|json)$/.test(requested)){
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
   const feed=buildFacebookCatalogFeed(await publication(),origin);
   const csv=requested.endsWith('.csv');
   res.writeHead(200,{'Content-Type':csv?'text/csv; charset=utf-8':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'});
   return res.end(req.method==='HEAD'?undefined:csv?feed.csv:JSON.stringify({items:feed.items,stats:feed.stats}));
  }
  let target=path.resolve(root,'.'+requested);
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(404);return res.end();}
  let status=200;
  try{
   if((await stat(target)).isDirectory())target=path.join(target,'index.html');
   await stat(target);
  }catch{
   const fallback=path.resolve(publicRoot,'.'+requested);
   if(fallback.startsWith(publicRoot+path.sep)){
    try{await stat(fallback);target=fallback;}catch{
     if(/^\/(vehicle|stock)\/[A-Za-z0-9_-]+\/?$/.test(requested))target=path.join(root,'audi/index.html');
     else{target=path.join(root,'404.html');status=404;}
    }
   }else if(/^\/(vehicle|stock)\/[A-Za-z0-9_-]+\/?$/.test(requested)){target=path.join(root,'audi/index.html');}
   else{target=path.join(root,'404.html');status=404;}
  }
  res.writeHead(status,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')return res.end();
  const body=await readFile(target);
  if(status===200&&path.extname(target)==='.html'&&(parsedUrl.searchParams.has('vehicle')||/^\/(vehicle|stock)\//.test(requested))){
   return res.end(injectVehicleOpenGraphHtml(body.toString('utf8'),await publication(),parsedUrl.href));
  }
  res.end(body);
 }catch{res.writeHead(500);res.end('Could not open this preview file.');}
}).listen(port,'127.0.0.1',()=>{
 console.log('Local showroom: http://127.0.0.1:'+port+'\nWorkbench: http://127.0.0.1:'+port+'/studio/');

});
