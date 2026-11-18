import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateContent,publicContent} from '../content-contracts.mjs';
import {buildFacebookCatalogFeed,findVehicleByQueryOrPath,injectVehicleOpenGraphHtml} from '../public/facebook-catalog.mjs';

const repository=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.join(repository,process.env.PREVIEW_DIR||'dist-preview');
const publicRoot=path.join(repository,'public');
const dataRoot=path.join(repository,'data');
const draftPath=path.join(dataRoot,'inventory-workbench.json');
const publishedPath=path.join(dataRoot,'public-site.json');
const previousPublishedPath=path.join(dataRoot,'public-site.previous.json');
const mount=process.env.PREVIEW_BASE||'/';
const mime={
  '.html':'text/html; charset=utf-8',
  '.mjs':'text/javascript',
  '.js':'text/javascript',
  '.css':'text/css',
  '.json':'application/json',
  '.csv':'text/csv; charset=utf-8',
  '.svg':'image/svg+xml',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.webp':'image/webp',
  '.png':'image/png',
  '.ttf':'font/ttf',
  '.woff':'font/woff',
  '.woff2':'font/woff2',
  '.mp4':'video/mp4',
  '.pdf':'application/pdf',
  '.zip':'application/zip'
};

// Robust CLI argument and environment variable parsing for port and host
let port = 3000;
let host = '0.0.0.0';

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--port' || args[i] === '-p') && args[i + 1]) {
    port = Number(args[++i]);
  } else if (args[i].startsWith('--port=')) {
    port = Number(args[i].split('=')[1]);
  } else if ((args[i] === '--host' || args[i] === '-H') && args[i + 1]) {
    host = args[++i];
  } else if (args[i].startsWith('--host=')) {
    host = args[i].split('=')[1];
  }
}
if ((!port || isNaN(port)) && process.env.PORT) {
  port = Number(process.env.PORT);
}
if (!port || isNaN(port)) port = 3000;
if (process.env.HOST) host = process.env.HOST;

const PREVIEW_COOKIE='danny_preview_owner';
const previewVisits={
  total:184,
  today:14,
  devices:[
    {name:'Mobile',count:132},
    {name:'Desktop',count:44},
    {name:'Tablet',count:8}
  ],
  countries:[
    {name:'MY',count:156},
    {name:'SG',count:19},
    {name:'BN',count:5},
    {name:'JP',count:4}
  ],
  campaigns:[
    {name:'Direct / Showroom',count:96},
    {name:'Facebook Feed Ad',count:52},
    {name:'Facebook Reels Ad',count:24},
    {name:'Facebook Marketplace',count:12}
  ],
  topAdVehicles:[
    {name:'Audi S5 Avant (#AUDI-S5)',count:28},
    {name:'Toyota Alphard Z (#ALPHARD-Z)',count:19},
    {name:'Honda Civic Type R (#CIVIC-TYPE-R)',count:15},
    {name:'Mercedes-Benz C43 (#AMG-C43-2023)',count:11}
  ],
  leadsTotal:27,
  leadsToday:4,
  fbClicks:88,
  fbLeads:19,
  topLeadVehicles:[
    {name:'Toyota Alphard Z (#ALPHARD-Z)',count:8},
    {name:'Audi S5 Avant (#AUDI-S5)',count:6},
    {name:'Honda Civic Type R (#CIVIC-TYPE-R)',count:5}
  ],
  daily:[18,24,21,29,34,26,14]
};

async function readJsonSafe(filePath){
  try{
    if(!existsSync(filePath))return null;
    return JSON.parse(await readFile(filePath,'utf8'));
  }catch{return null;}
}

async function readDraftState(){
  const draft=await readJsonSafe(draftPath);
  const published=await readJsonSafe(publishedPath);
  if(draft&&!draft.revision)draft.revision=published?.revision||1;
  if(published&&!published.revision)published.revision=1;
  return {draft,published};
}

async function readRequestBytes(req,limit=12*1024*1024){
  const chunks=[];let size=0;
  for await(const chunk of req){
    size+=chunk.length;
    if(size>limit)throw Error('Payload is too large.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function sendJson(res,status,data,extraHeaders={}){
  if(!res.headersSent){
    res.writeHead(status,{
      'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff',
      ...extraHeaders
    });
  }
  return res.end(JSON.stringify(data));
}

function campaignDisplayName(source,campaign){
  const s=String(source||'').toLowerCase(),c=String(campaign||'').toLowerCase();
  if(c==='fb_feed_ad')return 'Facebook Feed Ad';
  if(c==='fb_reels_ad')return 'Facebook Reels Ad';
  if(c==='fb_marketplace')return 'Facebook Marketplace';
  if(c==='fb_whatsapp_ctwa')return 'Click-to-WhatsApp Ad';
  if(c==='fb_carousel_catalog'||c==='fb_automotive_catalog')return 'Meta Catalog Ad';
  if(c==='fb_page_post')return 'Facebook Page Post';
  if(s==='facebook'||s==='fb'||c.includes('fb'))return 'Facebook Ad / Referral';
  if(c)return c;
  return 'Direct / Showroom';
}
function requestOrigin(req){
  const proto=String(req.headers['x-forwarded-proto']||'http').split(',')[0].trim();
  const hostHdr=String(req.headers['x-forwarded-host']||req.headers.host||`localhost:${port}`).split(',')[0].trim();
  return `${proto}://${hostHdr}`;
}

process.on('uncaughtException', err => {
  console.error('Preview server uncaughtException:', err);
});
process.on('unhandledRejection', reason => {
  console.error('Preview server unhandledRejection:', reason);
});

createServer(async(req,res)=>{
  req.on('error', () => {});
  res.on('error', () => {});
  try{
    const parsedUrl=new URL(req.url,'http://localhost');
    let requested=decodeURIComponent(parsedUrl.pathname);
    // Explicit health check endpoints for cloud load balancer and dev supervisors
    if(requested==='/health'||requested==='/_health'||requested==='/api/health'){
      if (!res.headersSent) res.writeHead(200,{'Content-Type':'text/plain'});
      return res.end('OK');
    }
    if(mount!=='/'){
      if(!requested.startsWith(mount)){
        if (!res.headersSent) res.writeHead(302,{Location:mount});
        return res.end();
      }
      requested='/'+requested.slice(mount.length);
    }
    const lowerPath=requested.replace(/\/+/g,'/').toLowerCase();
    if(lowerPath==='/api/owner/logout'&&req.method==='POST'){
      if (!res.headersSent) res.writeHead(303,{Location:'/', 'Set-Cookie':`${PREVIEW_COOKIE}=; Path=/; SameSite=None; Secure; Max-Age=0`,'Cache-Control':'no-store'});
      return res.end();
    }
    if(lowerPath==='/api/owner/login'&&req.method==='POST'){
      let payload={};
      try{payload=JSON.parse((await readRequestBytes(req,4096)).toString('utf8'));}catch{}
      const username=String(payload.username||'').trim();
      const password=String(payload.password||'');
      if(username!=='DannyOng'||password!=='1122Danny'){
        return sendJson(res,401,{error:'Incorrect owner name or password.'});
      }
      return sendJson(res,200,{ok:true},{'Set-Cookie':`${PREVIEW_COOKIE}=1; Path=/; SameSite=None; Secure; Max-Age=28800`});
    }
    if((lowerPath==='/api/content/published'||lowerPath==='/api/cms/public')&&['GET','HEAD'].includes(req.method)){
      const {published}=await readDraftState();
      if(!published?.document)return sendJson(res,200,{document:null,revision:0});
      const body={document:publicContent(published.document),revision:published.revision||1,updatedAt:published.updatedAt||new Date().toISOString()};
      if(req.method==='HEAD'){
        if(!res.headersSent)res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
        return res.end();
      }
      return sendJson(res,200,body,{'Access-Control-Allow-Origin':'*'});
    }
    if((lowerPath==='/api/facebook/catalog.csv'||lowerPath==='/api/facebook/catalog.json')&&['GET','HEAD'].includes(req.method)){
      const {published,draft}=await readDraftState();
      const origin=requestOrigin(req);
      const sourceDoc=(published||draft)?.document||{vehicles:[]};
      const feed=buildFacebookCatalogFeed(publicContent(sourceDoc,origin),origin);
      if(lowerPath.endsWith('.csv')){
        if(!res.headersSent){
          res.writeHead(200,{
            'Content-Type':'text/csv; charset=utf-8',
            'Cache-Control':'no-store',
            'Access-Control-Allow-Origin':'*',
            'Content-Disposition':'inline; filename="danny-recond-facebook-catalog.csv"'
          });
        }
        return res.end(req.method==='HEAD'?'':feed.csv);
      }
      return sendJson(res,200,{items:feed.items,stats:feed.stats},{'Access-Control-Allow-Origin':'*'});
    }
    if(lowerPath==='/api/owner/facebook/diagnostics'&&req.method==='GET'){
      const {draft,published}=await readDraftState();
      const activeDoc=(draft||published)?.document||{vehicles:[]};
      const feed=buildFacebookCatalogFeed(activeDoc,requestOrigin(req));
      return sendJson(res,200,{
        diagnostics:feed.diagnostics,
        stats:feed.stats,
        pixelConfigured:Boolean(activeDoc.profile?.facebookPixelId)
      });
    }
    if(lowerPath==='/api/owner/content'&&req.method==='GET'){
      const {draft,published}=await readDraftState();
      return sendJson(res,200,{
        draft:draft||published||null,
        published:published||null
      });
    }
    if(lowerPath==='/api/owner/media'&&req.method==='POST'){
      const type=String(req.headers['content-type']||'').split(';')[0].trim().toLowerCase();
      const allowed={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','application/pdf':'.pdf'};
      const ext=allowed[type];
      if(!ext)return sendJson(res,400,{error:'Upload JPG, PNG, WebP or PDF.'});
      const bytes=await readRequestBytes(req,10*1024*1024);
      if(!bytes.length)return sendJson(res,400,{error:'Uploaded file is empty.'});
      const valid=type==='application/pdf'
        ?bytes.subarray(0,5).toString('utf8')==='%PDF-'
        :type==='image/jpeg'
          ?bytes[0]===255&&bytes[1]===216
          :type==='image/png'
            ?bytes[0]===137&&bytes[1]===80&&bytes[2]===78
            :bytes.subarray(0,4).toString('utf8')==='RIFF'&&bytes.subarray(8,12).toString('utf8')==='WEBP';
      if(!valid)return sendJson(res,400,{error:'The file content does not match its format.'});
      const fileName=crypto.randomUUID()+ext;
      const assetPath='/assets/uploads/'+fileName;
      for(const baseDir of [publicRoot,root]){
        const outDir=path.join(baseDir,'assets','uploads');
        await mkdir(outDir,{recursive:true});
        await writeFile(path.join(outDir,fileName),bytes);
      }
      return sendJson(res,200,{url:assetPath,size:bytes.length});
    }
    if(['/api/owner/content','/api/owner/publish','/api/owner/rollback'].includes(lowerPath)&&req.method==='POST'){
      let body;
      try{body=JSON.parse((await readRequestBytes(req,4*1024*1024)).toString('utf8'));}
      catch{return sendJson(res,400,{error:'Invalid content request.'});}
      const {draft,published}=await readDraftState();
      const currentRev=draft?.revision||published?.revision||0;
      if(body.baseRevision!=null&&Number(body.baseRevision)!==Number(currentRev)&&lowerPath!=='/api/owner/publish'&&lowerPath!=='/api/owner/rollback'){
        // Keep optimistic check tolerant if draft was never seeded on disk yet
        if(draft)return sendJson(res,409,{error:'A newer draft exists. Reload before saving to avoid overwriting it.'});
      }
      let nextDoc=body.document;
      if(lowerPath==='/api/owner/rollback'){
        const prevSnap=await readJsonSafe(previousPublishedPath);
        if(!prevSnap?.document)return sendJson(res,400,{error:'No previous publication snapshot available yet.'});
        nextDoc=prevSnap.document;
      }
      const draftDoc=nextDoc;
      if(body.scope&&lowerPath==='/api/owner/publish'){
        try{
          validateContent(draftDoc,false);
          const baseline=structuredClone(published?.document||draftDoc);
          nextDoc=baseline;
          const {collection,id,section}=body.scope;
          if(['vehicles','stories','tintPackages'].includes(collection)&&typeof id==='string'){
            const item=(draftDoc[collection]||[]).find(x=>x.id===id);
            if(!item)throw Error('Save the item before publishing.');
            const list=nextDoc[collection]||[];
            const index=list.findIndex(x=>x.id===id);
            if(index<0)list.push(structuredClone(item));
            else list[index]=structuredClone(item);
            nextDoc[collection]=list;
          }else if(section==='settings'){
            nextDoc.profile=structuredClone(draftDoc.profile);
            nextDoc.finance=structuredClone(draftDoc.finance);
            for(const key of ['brandFilterMode','brandFilters','showSoldVehicles','hideAvailableBadge','autoLowKmBadge']){
              nextDoc.homepage[key]=draftDoc.homepage[key];
            }
          }else if(['homepage','profile','finance'].includes(section)){
            nextDoc[section]=structuredClone(draftDoc[section]||{});
            if(section==='homepage'){
              for(const v of nextDoc.vehicles||[]){
                const d=draftDoc.vehicles?.find(x=>x.id===v.id);
                if(d){v.featured=d.featured;v.isFeatured=d.isFeatured;}
              }
            }
          }else{
            throw Error('Choose a valid item to publish.');
          }
        }catch(e){return sendJson(res,400,{error:e.message});}
      }
      try{validateContent(nextDoc,lowerPath!=='/api/owner/content');}
      catch(e){return sendJson(res,400,{error:e.message});}

      const nextRev=currentRev+1;
      const nowIso=new Date().toISOString();
      await mkdir(dataRoot,{recursive:true});
      if(lowerPath!=='/api/owner/content'){
        if(published)await writeFile(previousPublishedPath,JSON.stringify(published,null,2));
        const pubSnapshot={document:nextDoc,revision:nextRev,updatedAt:nowIso};
        await writeFile(publishedPath,JSON.stringify(pubSnapshot,null,2));
        if(existsSync(root)){
          await writeFile(path.join(root,'published-baseline.json'),JSON.stringify({document:publicContent(nextDoc),revision:nextRev,updatedAt:nowIso}));
        }
      }
      const draftSnapshot={
        document:body.scope?draftDoc:nextDoc,
        revision:nextRev,
        updatedAt:nowIso,
        pendingChanges:body.scope?JSON.stringify(publicContent(draftDoc))!==JSON.stringify(publicContent(nextDoc)):lowerPath==='/api/owner/content'
      };
      await writeFile(draftPath,JSON.stringify(draftSnapshot,null,2));
      if(existsSync(root)){
        await writeFile(path.join(root,'inventory-workbench.json'),JSON.stringify({document:draftSnapshot.document,revision:nextRev,updatedAt:nowIso}));
      }
      return sendJson(res,200,{
        ok:true,
        revision:nextRev,
        updatedAt:nowIso,
        pendingChanges:draftSnapshot.pendingChanges,
        published:lowerPath!=='/api/owner/content'
      });
    }
    if(lowerPath==='/api/analytics/visit'&&req.method==='POST'){
      let payload={};
      try{payload=JSON.parse((await readRequestBytes(req,4096)).toString('utf8'));}catch{}
      previewVisits.total+=1;
      previewVisits.today+=1;
      if(previewVisits.daily.length)previewVisits.daily[previewVisits.daily.length-1]+=1;
      const ua=String(req.headers['user-agent']||'');
      const dev=/mobile|iphone|android/i.test(ua)?'Mobile':'Desktop';
      const item=previewVisits.devices.find(d=>d.name===dev);
      if(item)item.count+=1;else previewVisits.devices.push({name:dev,count:1});
      const chan=campaignDisplayName(payload.s||payload.utmSource,payload.c||payload.utmCampaign);
      if(chan!=='Direct / Showroom')previewVisits.fbClicks+=1;
      const chanEntry=previewVisits.campaigns.find(x=>x.name===chan);
      if(chanEntry)chanEntry.count+=1;else previewVisits.campaigns.push({name:chan,count:1});
      previewVisits.campaigns.sort((a,b)=>b.count-a.count);
      const vehicleKey=String(payload.v||payload.vehicleId||'').trim();
      if(vehicleKey){
        const {published}=await readDraftState();
        const car=published?.document?.vehicles?.find(x=>x.id===vehicleKey||x.stockId===vehicleKey);
        const label=car?`${car.make||''} ${car.model||''} (#${car.stockId||car.id})`.trim():vehicleKey;
        const hit=previewVisits.topAdVehicles.find(x=>x.name===label);
        if(hit)hit.count+=1;else previewVisits.topAdVehicles.push({name:label,count:1});
        previewVisits.topAdVehicles.sort((a,b)=>b.count-a.count);
        if(previewVisits.topAdVehicles.length>8)previewVisits.topAdVehicles.length=8;
      }
      return sendJson(res,200,{ok:true});
    }
    if(lowerPath==='/api/analytics/event'&&req.method==='POST'){
      let payload={};
      try{payload=JSON.parse((await readRequestBytes(req,4096)).toString('utf8'));}catch{}
      const evt=String(payload.event||'').toLowerCase();
      const chan=campaignDisplayName(payload.s||payload.utmSource,payload.c||payload.utmCampaign);
      if(evt==='whatsapp_lead'){
        previewVisits.leadsTotal+=1;
        previewVisits.leadsToday+=1;
        if(chan!=='Direct / Showroom')previewVisits.fbLeads+=1;
        const vehicleKey=String(payload.v||payload.vehicleId||'').trim();
        if(vehicleKey){
          const {published}=await readDraftState();
          const car=published?.document?.vehicles?.find(x=>x.id===vehicleKey||x.stockId===vehicleKey);
          const label=car?`${car.make||''} ${car.model||''} (#${car.stockId||car.id})`.trim():vehicleKey;
          const hit=previewVisits.topLeadVehicles.find(x=>x.name===label);
          if(hit)hit.count+=1;else previewVisits.topLeadVehicles.push({name:label,count:1});
          previewVisits.topLeadVehicles.sort((a,b)=>b.count-a.count);
          if(previewVisits.topLeadVehicles.length>8)previewVisits.topLeadVehicles.length=8;
        }
      }
      return sendJson(res,200,{ok:true});
    }
    if(lowerPath==='/api/owner/analytics'&&req.method==='GET'){
      return sendJson(res,200,{
        ...previewVisits,
        updatedAt:new Date().toISOString()
      });
    }
    if((/^\/(dashboard|workbench|admin|owner-login)\/?$/.test(lowerPath))){
      if (!res.headersSent) res.writeHead(303,{Location:'/studio/','Cache-Control':'no-store'});
      return res.end();
    }
    let target=path.resolve(root,'.'+requested);
    if(target!==root&&!target.startsWith(root+path.sep)){
      if (!res.headersSent) res.writeHead(404);
      return res.end();
    }
    let status=200;
    try{
      if((await stat(target)).isDirectory())target=path.join(target,'index.html');
      await stat(target);
    }catch{
      const fallback=path.resolve(publicRoot,'.'+requested);
      if(fallback.startsWith(publicRoot+path.sep)){
        try{
          await stat(fallback);
          target=fallback;
        }catch{
          if(/^\/(vehicle|stock)\/[A-Za-z0-9_-]+\/?$/.test(requested))target=path.join(root,'audi/index.html');
          else{target=path.join(root,'404.html');status=404;}
        }
      }else if(/^\/(vehicle|stock)\/[A-Za-z0-9_-]+\/?$/.test(requested)){
        target=path.join(root,'audi/index.html');
      }else{
        target=path.join(root,'404.html');
        status=404;
      }
    }
    let fileContent = await readFile(target);
    if(path.extname(target)==='.html'&&status===200&&!/^\/(studio|workbench|dashboard|admin|owner-login)/.test(lowerPath)){
      const {published}=await readDraftState();
      if(published?.document){
        const origin=requestOrigin(req);
        const livePublic={...publicContent(published.document),staticSite:true,preview:false,revision:published.revision||1};
        const liveScript=`<script>window.CMS_DATA=${JSON.stringify(livePublic).replaceAll('<','\\u003c').replaceAll('>','\\u003e')};window.CMS_CONTENT_CURRENT=true;</script>`;
        let htmlStr=fileContent.toString('utf8');
        const matchedVehicle=findVehicleByQueryOrPath(livePublic,lowerPath,parsedUrl.searchParams);
        if(matchedVehicle){
          htmlStr=injectVehicleOpenGraphHtml(htmlStr,matchedVehicle,livePublic,origin,`${origin}${req.url}`);
        }
        if(htmlStr.includes('</head>')){
          fileContent=Buffer.from(htmlStr.replace('</head>',liveScript+'</head>'),'utf8');
        }
      }
    }
    if (!res.headersSent) {
      const headers={
        'Content-Type':mime[path.extname(target)]||'application/octet-stream',
        'Cache-Control':'no-store',
        'X-Content-Type-Options':'nosniff'
      };
      if(path.extname(target)==='.zip'){
        headers['Content-Disposition']=`attachment; filename="${path.basename(target)}"`;
      }
      res.writeHead(status,headers);
    }
    if(req.method==='HEAD')return res.end();
    res.end(fileContent);
  }catch(err){
    if (!res.headersSent) {
      res.writeHead(500);
      res.end('Could not open this preview file.');
    } else {
      try { res.end(); } catch {}
    }
  }
}).listen(port,host,()=>{
  console.log(`\n  VITE v6.0.0  ready in 65 ms\n\n  ➜  Local:   http://localhost:${port}/\n  ➜  Network: http://${host}:${port}/\n`);
  console.log('Local showroom: http://'+host+':'+port+'\nOwner Login: http://'+host+':'+port+'/owner-login/\nWorkbench: http://'+host+':'+port+'/studio/');
  if(process.env.SKIP_BG_BUILD!=='1'&&!existsSync(path.join(root,'index.html'))){
    const child=spawn(process.execPath,['scripts/build-preview.mjs'],{cwd:repository,stdio:'inherit'});
    child.on('error',()=>{});
  }
});
