const previewEditor=typeof window!=='undefined'&&window.DANNY_PREVIEW_EDITOR===true;
const DB=previewEditor?'danny-preview-editor-v1':'danny-exhibition-v1',STORE='files',LS_PREFIX=previewEditor?'danny-preview-wb-v1:':'danny-wb-v1:';
const memoryStore=new Map();
let connection,idbFailed=false;
function open(){
 if(idbFailed||typeof indexedDB==='undefined')return Promise.reject(Error('IDB unavailable'));
 return connection??=new Promise((resolve,reject)=>{
  try{
   const r=indexedDB.open(DB,1);
   r.onupgradeneeded=()=>r.result.createObjectStore(STORE);
   r.onsuccess=()=>resolve(r.result);
   r.onerror=()=>{connection=undefined;idbFailed=true;reject(Error('IDB unavailable'));};
  }catch(e){connection=undefined;idbFailed=true;reject(e);}
 });
}
function fallbackRead(key){
 if(memoryStore.has(key))return memoryStore.get(key);
 try{
  const raw=localStorage.getItem(LS_PREFIX+key);
  if(raw!=null){const parsed=JSON.parse(raw);memoryStore.set(key,parsed);return parsed;}
 }catch{}
 return undefined;
}
function fallbackWrite(key,value){
 if(value===undefined){
  memoryStore.delete(key);
  try{localStorage.removeItem(LS_PREFIX+key);}catch{}
  return undefined;
 }
 memoryStore.set(key,value);
 if(!(value instanceof Blob)){
  try{localStorage.setItem(LS_PREFIX+key,JSON.stringify(value));}catch{}
 }
 return value;
}
async function operation(mode,key,value){
 try{
  const db=await open();
  return await new Promise((resolve,reject)=>{
   const t=db.transaction(STORE,mode),store=t.objectStore(STORE),r=mode==='readonly'?store.get(key):value===undefined?store.delete(key):store.put(value,key);
   t.oncomplete=()=>{
    if(mode!=='readonly')fallbackWrite(key,value);
    resolve(r.result!==undefined?r.result:mode==='readonly'?fallbackRead(key):undefined);
   };
   t.onerror=()=>{idbFailed=true;resolve(mode==='readonly'?fallbackRead(key):fallbackWrite(key,value));};
  });
 }catch{
  return mode==='readonly'?fallbackRead(key):fallbackWrite(key,value);
 }
}
export const readLocal=key=>operation('readonly',key);
export const writeLocal=(key,value)=>operation('readwrite',key,value);
export const deleteLocal=key=>operation('readwrite',key);
const urls=new Map();
export async function photoUrl(path,base=window.SITE_BASE||'/'){
 if(!path)return '';
 const canonical=base!=='/'&&path.startsWith(base)?'/'+path.slice(base.length):path;
 if(canonical.startsWith('/assets/uploads/')){if(urls.has(canonical))return urls.get(canonical);const blob=await readLocal(canonical);if(blob instanceof Blob){const url=URL.createObjectURL(blob);urls.set(canonical,url);return url;}}
 if(base!=='/'&&path.startsWith(base))return path;
 return path.startsWith('/assets/')?base+path.slice(1):path;
}
export function releasePhotos(){for(const url of urls.values())URL.revokeObjectURL(url);urls.clear();}
export async function compressPhoto(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error(file.name+': choose JPG, PNG or WebP.');
 if(file.size>25*1024*1024)throw Error(file.name+': maximum source file size is 25 MB.');
 const image=await createImageBitmap(file,{imageOrientation:'from-image'}),scale=Math.min(1,1920/Math.max(image.width,image.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);image.close();
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.82));if(!blob)throw Error('Could not resize this image.');return blob;
}
// Reports are evidence, so preserve every source byte rather than resizing the scan.
export async function prepareReportFile(file){
 if(file.size>10*1024*1024)throw Error('Auction report: choose a file under 10 MB.');
 const pdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name||'');
 if(pdf){if(await file.slice(0,5).text()!=='%PDF-')throw Error('This file is not a valid PDF.');return {blob:new Blob([file],{type:'application/pdf'}),extension:'.pdf'};}
 const types={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'};
 if(!types[file.type])throw Error('Auction report: choose JPG, PNG, WebP or PDF.');
 const extension=file.type==='image/jpeg'&&/\.jpeg$/i.test(file.name||'')?'.jpeg':types[file.type];
 return {blob:new Blob([file],{type:file.type}),extension};
}

export async function uploadCloudMedia(blob){const response=await fetch('/api/owner/media',{method:'POST',credentials:'same-origin',headers:{'Content-Type':blob.type},body:blob});const result=await response.json();if(!response.ok)throw Error(result.error||'Upload failed');await writeLocal(result.url,blob);return result.url;}
