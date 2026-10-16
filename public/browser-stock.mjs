const DB='danny-exhibition-v1',STORE='files';
let connection;
function open(){return connection??=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>{connection=undefined;reject(Error('Browser storage is unavailable. Export your changes before closing.'));};});}
async function operation(mode,key,value){const db=await open();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,mode),store=t.objectStore(STORE),r=mode==='readonly'?store.get(key):value===undefined?store.delete(key):store.put(value,key);t.oncomplete=()=>resolve(r.result);t.onerror=()=>reject(Error('Browser storage is full or unavailable. Export your changes.'));});}
export const readLocal=key=>operation('readonly',key);
export const writeLocal=(key,value)=>operation('readwrite',key,value);
export const deleteLocal=key=>operation('readwrite',key);
const urls=new Map();
export async function photoUrl(path,base=window.SITE_BASE||'/'){
 if(!path)return '';
 const canonical=base!=='/'&&path.startsWith(base)?'/'+path.slice(base.length):path;
 if(canonical.startsWith('/assets/uploads/')){if(urls.has(canonical))return urls.get(canonical);const blob=await readLocal(canonical);if(blob){const url=URL.createObjectURL(blob);urls.set(canonical,url);return url;}}
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
