import {optimizedPhotos} from './optimized-photos.mjs';

// Uploaded originals remain available for downloads. Known public photos have
// smaller, immutable display copies; later uploads are compressed on upload.
export function displayPhoto(path,size='card',base='/'){
 const value=String(path||'');
 let key=value;
 if(/^https?:/.test(value)){
  try{const url=new URL(value);if(url.hostname!=='danny.stocklist.workers.dev')return value;key=url.pathname;}catch{return value;}
 }
 const variant=optimizedPhotos[key]?.[size];
 const source=variant||value;
 if(base!=='/'&&source.startsWith(base))return source;
 return source.startsWith('/assets/')?base+source.slice(1):source;
}
