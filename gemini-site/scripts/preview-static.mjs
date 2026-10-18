import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const repository=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.join(repository,process.env.PREVIEW_DIR||'dist-preview');
const publicRoot=path.join(repository,'public');
const mount=process.env.PREVIEW_BASE||'/';
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2','.mp4':'video/mp4','.pdf':'application/pdf'};
const port=Number(process.env.PORT||3000);
createServer(async(req,res)=>{
 try{
  let requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(mount!=='/'){if(!requested.startsWith(mount)){res.writeHead(302,{Location:mount});return res.end();}requested='/'+requested.slice(mount.length);}
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
  res.end(await readFile(target));
 }catch{res.writeHead(500);res.end('Could not open this preview file.');}
}).listen(port,'0.0.0.0',()=>{
 console.log('Local showroom: http://0.0.0.0:'+port+'\nWorkbench: http://0.0.0.0:'+port+'/studio/');
 if(process.env.SKIP_BG_BUILD!=='1'){
  const child=spawn(process.execPath,['scripts/build-preview.mjs'],{cwd:repository,stdio:'inherit'});
  child.on('error',()=>{});
 }
});

