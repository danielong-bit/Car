import {validateContent,publicContent,referencedMedia} from './content-contracts.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const CHUNK=60000;
export class ShowroomContent{
 constructor(ctx,env){this.storage=ctx.storage;this.env=env;}
 async read(key){const meta=await this.storage.get(key);if(!meta)return null;let text='';for(let i=0;i<meta.chunks;i++)text+=await this.storage.get(key+':'+i);return JSON.parse(text);}
 async write(key,value){const text=JSON.stringify(value),old=await this.storage.get(key),count=Math.ceil(text.length/CHUNK);for(let i=0;i<count;i++)await this.storage.put(key+':'+i,text.slice(i*CHUNK,(i+1)*CHUNK));await this.storage.put(key,{chunks:count});for(let i=count;i<(old?.chunks||0);i++)await this.storage.delete(key+':'+i);}
 async fetch(request){
  const url=new URL(request.url),path=url.pathname;
  if(path==='/api/content/published'){const p=await this.read('published');return json(p?{...p,document:publicContent(p.document,url.origin)}:{document:null,revision:0});}
  if(path.startsWith('/assets/uploads/')){
   const key='media:'+path,meta=await this.storage.get(key);const allowed=await this.storage.get('public-media')||[];
   if(!meta||(!request.headers.has('X-Owner-Media')&&!allowed.includes(path)))return new Response('Not found',{status:404});
   const pieces=[];for(let i=0;i<meta.chunks;i++)pieces.push(await this.storage.get(key+':'+i));return new Response(new Blob(pieces,{type:meta.type}),{headers:{'Content-Type':meta.type,'X-Content-Type-Options':'nosniff','Content-Disposition':meta.type==='application/pdf'?'inline':'inline','Cache-Control':request.headers.has('X-Owner-Media')?'private, no-store':'public, max-age=86400'}});
  }
  if(path==='/api/owner/media'&&request.method==='POST'){
   const type=request.headers.get('Content-Type')?.split(';')[0],allowed=['image/jpeg','image/png','image/webp','application/pdf'];if(!allowed.includes(type))return json({error:'Upload JPG, PNG, WebP or PDF.'},400);
   const bytes=new Uint8Array(await request.arrayBuffer());if(!bytes.length||bytes.length>10*1024*1024)return json({error:'Maximum file size is 10 MB.'},400);
   const valid=type==='application/pdf'?new TextDecoder().decode(bytes.slice(0,5))==='%PDF-':type==='image/jpeg'?bytes[0]===255&&bytes[1]===216:type==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78:new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
   if(!valid)return json({error:'The file content does not match its format.'},400);
   const ext={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','application/pdf':'.pdf'}[type],asset='/assets/uploads/'+crypto.randomUUID()+ext,key='media:'+asset,count=Math.ceil(bytes.length/CHUNK);
   for(let i=0;i<count;i++)await this.storage.put(key+':'+i,bytes.slice(i*CHUNK,(i+1)*CHUNK));await this.storage.put(key,{type,chunks:count,size:bytes.length,createdAt:new Date().toISOString()});return json({url:asset,size:bytes.length});
  }
  if(path==='/api/owner/content'&&request.method==='GET'){return json({draft:await this.read('draft'),published:await this.read('published')});}
  if(['/api/owner/content','/api/owner/publish','/api/owner/rollback'].includes(path)&&request.method==='POST'){
   let body;try{const text=await request.text();if(text.length>1600000)throw Error('Content is too large.');body=JSON.parse(text);}catch{return json({error:'Invalid content request.'},400);}
   return this.storage.transaction(async txn=>{
    const store=Object.create(this);store.storage=txn;
    const old=await store.read('draft'),published=await store.read('published');
    if(body.baseRevision!==(old?.revision||0))return json({error:'A newer draft exists. Reload before saving to avoid overwriting it.'},409);
    const input=path.endsWith('/rollback')?(await store.read('previous'))?.document:body.document;
    try{validateContent(input,path!=='/api/owner/content');}catch(e){return json({error:e.message},400);}
    const snapshot={document:input,revision:(old?.revision||0)+1,updatedAt:new Date().toISOString()};
    if(path!=='/api/owner/content'){
     const files=referencedMedia(publicContent(input));for(const file of files){if(!await store.storage.get('media:'+file)){const existing=await this.env.ASSETS.fetch(new URL(file,request.url));if(!existing.ok)return json({error:'An uploaded file is missing. Re-upload it before publishing.'},400);}}
     if(published)await store.write('previous',published);await store.write('published',snapshot);await store.storage.put('public-media',files);
    }
    await store.write('draft',snapshot);return json({ok:true,revision:snapshot.revision,updatedAt:snapshot.updatedAt,published:path!=='/api/owner/content'});
   });
  }
  return json({error:'Not found.'},404);
 }
}
