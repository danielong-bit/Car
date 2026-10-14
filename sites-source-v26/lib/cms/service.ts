import { env } from 'cloudflare:workers';
import { getStudioUser } from '@/lib/studio-auth';
import seed from './seed.json';
import { publicDocument, validateDocument } from './contracts.mjs';

const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const db=()=>{if(!env.DB)throw new Error('Database unavailable');return env.DB;};
const timestamp=()=>new Date().toISOString();
export async function documentFor(id='published') {
  const r=await db().prepare('SELECT body, revision, updated_at FROM cms_documents WHERE id = ?').bind(id).first<{body:string,revision:number,updated_at:string}>();
  const document=r?JSON.parse(r.body):structuredClone(seed);
  // Owner-approved example covers only replace sample placeholders, never uploaded stock photos.
  for(const v of document.vehicles||[]){
    if(!v.sample||!['alphard-z','rx500h','gtr-premium','civic-type-r','crown-crossover','lm500h'].includes(v.id))continue;
    const cover=v.gallery?.find((m:any)=>m.visible!==false&&!m.video);
    if(!cover||/\.svg(?:\?|$)/.test(cover.url)||cover.url.includes('images.unsplash.com/')){
      const url='/assets/'+v.id+'-example-v26.png';
      v.image=url;
      const example={id:'example-'+v.id,url,category:'exterior',visible:true,ratio:'16/9',x:50,y:50,mobileX:50,mobileY:50,zoom:1};
      if(cover)v.gallery=v.gallery.map((m:any)=>m===cover?{...m,...example}:m);else v.gallery=[example,...(v.gallery||[])];
    }
  }
  if(document.homepage){if(document.homepage.title==='Find your next recon car.')document.homepage.title='JAPAN RECON';if(JSON.stringify(document.homepage.order)===JSON.stringify(['experience','inventory','contact','customer-stories']))document.homepage.order=['experience','inventory','customer-stories','contact'];}
  // One-time default for the specific Audi video supplied by the owner; an explicit empty field stays empty.
  for(const vehicle of document.vehicles||[])if(vehicle.id==='audi-s5'&&!Object.hasOwn(vehicle,'presenter'))vehicle.presenter={title:'Audi S5 Avant — with Danny',url:'https://www.tiktok.com/@dannyongg/video/7692969185961446676',facebook:'https://www.facebook.com/reel/1834658307548568'};
  return {document,revision:r?.revision||0,updatedAt:r?.updated_at||null};
}
async function bootstrap() {
  const body=JSON.stringify(seed),at=timestamp();
  await db().batch(['draft','published'].map(id=>db().prepare('INSERT OR IGNORE INTO cms_documents (id,body,revision,updated_at) VALUES (?,?,0,?)').bind(id,body,at)));
}
function references(d:unknown,url:string){return JSON.stringify(d).includes(JSON.stringify(url));}
function checkOrigin(r:Request){const origin=r.headers.get('Origin');return origin===new URL(r.url).origin;}
async function body(r:Request){if(Number(r.headers.get('content-length'))>2_000_000)throw new Error('Request too large');const text=await r.text();if(text.length>2_000_000)throw new Error('Request too large');return JSON.parse(text);}
async function checkStoredMedia(d:unknown){const urls=JSON.stringify(d).match(/\/api\/cms\/media\/[a-z0-9.-]+/g)||[];for(const u of new Set(urls)){const m=await db().prepare('SELECT id FROM cms_media WHERE object_key = ? AND archived = 0').bind(u.split('/').pop()).first();if(!m)throw new Error('A media file is missing or archived. Replace it before publishing.');}}
export async function cmsRequest(request:Request,parts:string[]) {
  try {
    const action=parts[0],id=parts[1],method=request.method;
    if(action==='published'&&method==='GET'){const r=await documentFor();return json({...r,document:publicDocument(r.document)});}
    if(action==='media'&&id&&method==='GET'){
      if(!/^[a-z0-9-]+\.(jpg|png|webp|mp4)$/.test(id))return json({error:'Not found'},404);
      const pub=await documentFor();const publicFile=references(publicDocument(pub.document),`/api/cms/media/${id}`);
      if(!publicFile&&!await getStudioUser())return json({error:'Not found'},404);
      const file=await env.BUCKET?.get(id);if(!file)return json({error:'Not found'},404);
      const headers=new Headers({'Cache-Control':publicFile?'public, max-age=300':'private, no-store','X-Content-Type-Options':'nosniff'});file.writeHttpMetadata(headers);headers.set('Content-Disposition','inline');return new Response(file.body,{headers});
    }
    if(method!=='GET'&&!checkOrigin(request))return json({error:'Same-origin request required'},403);
    if(action==='view'&&method==='POST'){
      const b=await body(request),pub=publicDocument((await documentFor()).document);
      if(!pub.vehicles.some((v:any)=>v.id===b.vehicleId))return json({error:'Unknown vehicle'},400);
      const day=timestamp().slice(0,10),key=`${day}:${b.vehicleId}`;
      await db().prepare('INSERT INTO cms_views(id,vehicle_id,day,count) VALUES(?,?,?,1) ON CONFLICT(id) DO UPDATE SET count = MIN(count + 1,1000000)').bind(key,b.vehicleId,day).run();return json({recorded:true});
    }
    if(action==='enquiry'&&method==='POST'){
      const b=await body(request);
      if(b.date<timestamp().slice(0,10)||Number.isNaN(Date.parse(b.date)))return json({error:'Choose a valid future viewing date.'},400);
      if(b.website||typeof b.name!=='string'||b.name.length<2||b.name.length>100||typeof b.contact!=='string'||!/^\+?[\d ()-]{8,30}$/.test(b.contact)||typeof b.vehicleId!=='string'||typeof b.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||String(b.note||'').length>2000)return json({error:'Check your name, phone and preferred date.'},400);
      const pub=publicDocument((await documentFor()).document);if(!pub.vehicles.some((v:any)=>v.id===b.vehicleId&&v.status!=='sold'))return json({error:'This car is not available for viewing.'},400);
      const ip=request.headers.get('cf-connecting-ip')||'unknown';const bytes=new TextEncoder().encode(`${timestamp().slice(0,10)}:${ip}`);const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
      const recent=await db().prepare('SELECT COUNT(*) AS n FROM cms_enquiries WHERE created_at > ? AND json_extract(body,\'$.rateKey\') = ?').bind(new Date(Date.now()-3600000).toISOString(),hash).first<{n:number}>();if((recent?.n||0)>=5)return json({error:'Too many requests. Please contact Danny directly.'},429);
      const eid=crypto.randomUUID();await db().prepare('INSERT INTO cms_enquiries(id,body,status,created_at) VALUES(?,?,?,?)').bind(eid,JSON.stringify({name:b.name,contact:b.contact,vehicleId:b.vehicleId,date:b.date,note:b.note||'',source:'website viewing request',rateKey:hash}), 'requested', timestamp()).run();return json({id:eid,status:'requested',message:'Request recorded. Danny will contact you to confirm availability and a time.'},201);
    }
    const user=await getStudioUser();if(!user)return json({error:'Sign in with the approved staff account.'},401);
    await bootstrap();
    if(action==='draft'&&method==='GET')return json(await documentFor('draft'));
    if(action==='draft'&&method==='PUT'){
      const b=await body(request),errors=validateDocument(b.document);if(errors.length)return json({error:errors.join(' ')},400);
      const at=timestamp();const updated=await db().prepare('UPDATE cms_documents SET body=?, revision=revision+1, updated_at=? WHERE id=\'draft\' AND revision=? RETURNING revision').bind(JSON.stringify(b.document),at,Number(b.revision)).first<{revision:number}>();
      if(!updated)return json({error:'Another session changed the draft. Reload before saving.'},409);
      await db().prepare('INSERT INTO cms_versions(id,body,action,actor,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),JSON.stringify(b.document),'Draft saved',user.email,at).run();return json({revision:updated.revision,status:'Draft Saved'});
    }
    if(action==='publish'&&method==='POST'){
      const b=await body(request),draft=await documentFor('draft');if(draft.revision!==b.revision)return json({error:'Draft changed. Save and review the latest version.'},409);
      const errors=validateDocument(draft.document,true);if(errors.length)return json({error:errors.join(' ')},400);await checkStoredMedia(draft.document);
      const at=timestamp(),versionId=crypto.randomUUID();
      const results=await db().batch([
        db().prepare('UPDATE cms_documents SET body=(SELECT body FROM cms_documents WHERE id=\'draft\'), revision=revision+1, updated_at=? WHERE id=\'published\' AND EXISTS(SELECT 1 FROM cms_documents WHERE id=\'draft\' AND revision=?)').bind(at,b.revision),
        db().prepare('INSERT INTO cms_versions(id,body,action,actor,created_at) SELECT ?,body,?,?,? FROM cms_documents WHERE id=\'draft\' AND revision=?').bind(versionId,'Published',user.email,at,b.revision)
      ]);if(!results[0].meta.changes)return json({error:'Draft changed during publication. Review again.'},409);
      return json({status:'Published Successfully',versionId,updatedAt:at});
    }
    if(action==='history'&&method==='GET')return json({versions:(await db().prepare('SELECT id,action,actor,created_at FROM cms_versions ORDER BY created_at DESC LIMIT 80').all()).results});
    if(action==='restore'&&method==='POST'){
      const b=await body(request);const v=await db().prepare('SELECT body FROM cms_versions WHERE id=?').bind(b.id).first<{body:string}>();if(!v)return json({error:'Version not found'},404);
      const errors=validateDocument(JSON.parse(v.body));if(errors.length)return json({error:errors.join(' ')},400);
      const r=await db().prepare('UPDATE cms_documents SET body=?,revision=revision+1,updated_at=? WHERE id=\'draft\' AND revision=? RETURNING revision').bind(v.body,timestamp(),b.revision).first();if(!r)return json({error:'Draft changed. Reload before restoring.'},409);return json({status:'Restored to draft. Preview and publish when ready.'});
    }
    if(action==='media'&&!id&&method==='GET')return json({media:(await db().prepare('SELECT * FROM cms_media WHERE archived=0 ORDER BY created_at DESC LIMIT 2000').all()).results});
    if(action==='media'&&!id&&method==='POST'){
      if(!env.BUCKET)return json({error:'Permanent media storage is unavailable.'},503);
      if(Number(request.headers.get('content-length'))>105_000_000)return json({error:'File too large.'},413);
      const form=await request.formData(),file=form.get('file');if(!(file instanceof File))return json({error:'Choose a file'},400);
      const ext:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4'},extension=ext[file.type];
      if(!extension||file.size<100||file.size>(extension==='mp4'?100:10)*1024*1024)return json({error:'Use JPG, PNG, WebP up to 10 MB or MP4 up to 100 MB.'},400);
      const data=new Uint8Array(await file.arrayBuffer());const s=(a:number,b:number)=>String.fromCharCode(...data.slice(a,b));
      const valid=extension==='jpg'?data[0]===255&&data[1]===216&&data[2]===255:extension==='png'?s(1,4)==='PNG'&&data[0]===137:extension==='webp'?s(0,4)==='RIFF'&&s(8,12)==='WEBP':s(4,8)==='ftyp';
      if(!valid)return json({error:'File content does not match its format.'},400);
      const key=`${crypto.randomUUID()}.${extension}`,mid=crypto.randomUUID();await env.BUCKET.put(key,data,{httpMetadata:{contentType:file.type}});
      try{await db().prepare('INSERT INTO cms_media(id,object_key,name,type,bytes,created_at) VALUES(?,?,?,?,?,?)').bind(mid,key,file.name.slice(0,180),file.type,file.size,timestamp()).run();}catch(e){await env.BUCKET.delete(key);throw e;}
      return json({id:mid,url:`/api/cms/media/${key}`,name:file.name,type:file.type,status:'Uploaded permanently. Private until published.'},201);
    }
    if(action==='media'&&id&&method==='DELETE'){
      const media=await db().prepare('SELECT object_key FROM cms_media WHERE id=?').bind(id).first<{object_key:string}>();if(!media)return json({error:'Not found'},404);
      if(references(publicDocument((await documentFor()).document),`/api/cms/media/${media.object_key}`))return json({error:'This file is published. Remove its references and publish first.'},409);
      await db().prepare('UPDATE cms_media SET archived=1 WHERE id=?').bind(id).run();return json({status:'Archived. Original retained for recovery.'});
    }
    if(action==='enquiries'&&method==='GET')return json({enquiries:(await db().prepare('SELECT id,body,status,created_at FROM cms_enquiries ORDER BY created_at DESC LIMIT 500').all()).results.map((r:any)=>({...r,body:{...JSON.parse(r.body),rateKey:undefined}}))});
    if(action==='enquiries'&&id&&method==='PATCH'){
      const b=await body(request);if(!['requested','contacted','confirmed','completed','cancelled'].includes(b.status))return json({error:'Invalid enquiry status'},400);
      await db().prepare('UPDATE cms_enquiries SET status=? WHERE id=?').bind(b.status,id).run();return json({status:'Saved'});
    }
    if(action==='overview'&&method==='GET')return json({views:(await db().prepare('SELECT vehicle_id,SUM(count) AS count FROM cms_views WHERE day>=? GROUP BY vehicle_id ORDER BY count DESC LIMIT 10').bind(new Date(Date.now()-30*86400000).toISOString().slice(0,10)).all()).results,activeAppointments:(await db().prepare('SELECT COUNT(*) AS count FROM cms_enquiries WHERE status IN (\'requested\',\'contacted\',\'confirmed\')').first<{count:number}>())?.count||0,published:(await documentFor()).revision});
    return json({error:'Not found'},404);
  }catch(error){console.error('CMS request failed',error instanceof Error?error.message:'Unknown error');return json({error:error instanceof Error?error.message:'Operation failed. Nothing was published.'},500);}
}
