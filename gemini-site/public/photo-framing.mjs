const clamp=value=>Math.max(0,Math.min(100,Number(value)||0));

// Local contrast-based crop suggestion. This never sends a photograph to an AI service.
export function suggestFrame({data,width,height},aspect=1.6){
 if(!width||!height||!data?.length)return {cropX:50,cropY:50};
 const horizontal=width/height>aspect,length=horizontal?width:height;
 const visible=Math.min(length,Math.round(horizontal?height*aspect:width/aspect));
 if(visible>=length)return {cropX:50,cropY:50};
 const energy=new Float64Array(length),grey=(x,y)=>{
  const i=(y*width+x)*4;return .2126*data[i]+.7152*data[i+1]+.0722*data[i+2];
 };
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
  const edge=Math.abs(grey(x+1,y)-grey(x-1,y))+Math.abs(grey(x,y+1)-grey(x,y-1));
  const dx=(x/width-.5)/.28,dy=(y/height-.54)/.28;
  const centre=.1+.9*Math.exp(-.5*(dx*dx+dy*dy));
  energy[horizontal?x:y]+=edge*centre;
 }
 if(energy.reduce((a,b)=>a+b,0)<1)return {cropX:50,cropY:50};
 let best=-Infinity,bestStart=(length-visible)/2;
 for(let start=0;start<=length-visible;start++){
  let score=0;for(let i=start;i<start+visible;i++)score+=energy[i];
  score*=1-.25*Math.abs((start+visible/2)/length-.5)*2;
  if(score>best){best=score;bestStart=start;}
 }
 const value=Math.round(clamp(100*bestStart/(length-visible)));
 return horizontal?{cropX:value,cropY:50}:{cropX:50,cropY:value};
}

export async function suggestPhotoFrame(source){
 let image,close=()=>{};
 if(source instanceof Blob){image=await createImageBitmap(source,{imageOrientation:'from-image'});close=()=>image.close();}
 else{image=new Image();image.crossOrigin='anonymous';image.src=source;await image.decode();}
 try{
  const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
  const scale=Math.min(1,96/Math.max(width,height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0,canvas.width,canvas.height);
  return suggestFrame(context.getImageData(0,0,canvas.width,canvas.height));
 }finally{close();}
}

export function frameControlsMarkup(index,photo){
 return `<div class="photo-frame-tools"><button type="button" data-auto-frame="${index}">Auto frame</button><details class="photo-position"><summary>Adjust position</summary>${[['cropX','Left / right'],['cropY','Up / down']].map(([axis,label])=>`<label class="photo-position-field"><span>${label}</span><input type="range" min="0" max="100" step="1" value="${clamp(photo[axis]??50)}" data-crop="${index}" data-axis="${axis}" aria-label="Photo ${index+1} ${label}"><input type="number" min="0" max="100" step="1" value="${clamp(photo[axis]??50)}" data-crop-number="${index}" data-axis="${axis}" aria-label="Photo ${index+1} ${label} value"></label>`).join('')}<button type="button" data-reset-frame="${index}">Reset to centre</button></details></div>`;
}

export function bindPhotoFraming(tiles,photos,{analyze=suggestPhotoFrame,onChange=()=>{},source=photo=>photo.url,onError=()=>{}}={}){
 const currentPhotos=typeof photos==='function'?photos:()=>photos;
 tiles.forEach((tile,index)=>{
  const image=tile.querySelector('img');
  const update=(axis,value)=>{
   const photo=currentPhotos()[index];
   photo[axis]=clamp(value);image.style.objectPosition=`${photo.cropX??50}% ${photo.cropY??50}%`;
   tile.querySelectorAll(`[data-axis="${axis}"]`).forEach(input=>input.value=photo[axis]);onChange(photo);
  };
  tile.querySelectorAll('[data-crop],[data-crop-number]').forEach(input=>{
   input.draggable=false;input.addEventListener('pointerdown',e=>e.stopPropagation());
   input.oninput=()=>update(input.dataset.axis,input.value);
  });
  tile.querySelector('[data-reset-frame]').onclick=()=>{update('cropX',50);update('cropY',50);};
  tile.querySelector('[data-auto-frame]').onclick=async event=>{
   const button=event.currentTarget;button.disabled=true;button.textContent='Framing…';
   try{const frame=await analyze(await source(currentPhotos()[index]));if(!tile.isConnected)return;update('cropX',frame.cropX);update('cropY',frame.cropY);}
   catch(error){onError(error);}
   finally{button.disabled=false;button.textContent='Auto frame';}
  };
 });
}
