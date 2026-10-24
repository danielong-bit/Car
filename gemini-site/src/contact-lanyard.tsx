import {useEffect,useState} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import Lanyard from './components/react-bits/Lanyard';
import './contact-lanyard.css';

type Options={portrait:string;language:string;base:string};
const roots=new WeakMap<HTMLElement,Root>();
function ContactLanyard({portrait,language,base}:Options){
 const [ready,setReady]=useState(false),[flip,setFlip]=useState(0);
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [compact,setCompact]=useState(()=>matchMedia('(max-width: 700px)').matches);
 const tr=(en:string,zh:string,ms:string)=>language==='zh'?zh:language==='ms'?ms:en;
 useEffect(()=>{const motion=matchMedia('(prefers-reduced-motion: reduce)'),size=matchMedia('(max-width: 700px)');const sync=()=>{setReduced(motion.matches);setCompact(size.matches);};motion.addEventListener('change',sync);size.addEventListener('change',sync);return()=>{motion.removeEventListener('change',sync);size.removeEventListener('change',sync);};},[]);
 useEffect(()=>{setReady(false);setFlip(0);},[portrait,reduced]);
 return <div className="contact-lanyard">
  <div className="contact-lanyard-stage" tabIndex={ready&&!reduced?0:undefined} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setFlip(value=>value+1);}}} role={ready&&!reduced?'img':undefined} aria-label={ready&&!reduced?tr('Danny’s interactive hanging photo card.','Danny 的互动吊牌照片。','Foto Danny pada kad gantung interaktif.'):undefined}>
   <img id="profilePhoto" src={portrait} alt={tr('Danny at the showroom','展厅里的 Danny','Danny di showroom')} loading="lazy" decoding="async" hidden={ready&&!reduced}/>
   {!reduced&&<Lanyard key={portrait} frontImage={portrait} backImage={`${base}assets/danny-lanyard-back.jpeg`} orientation="portrait" imageFit="cover" cardColor="#faf9f6" finish="matte" cornerRadius={.4} size={.65} anchor="center" strapLength={.16} strapColor="#ffffff" strapImage={`${base}assets/danny-lanyard-band.png`} strapWidth={.7} metal="silver" gravity={1.2} damping={.65} elasticity={.3} breeze={.1} intro={false} flipRequest={flip} onReady={setReady} maxDpr={compact?1:1.5} style={{opacity:ready?1:0}}/>}

  </div>

 </div>;
}
export function renderContactLanyard(container:HTMLElement,options:Options){
 container.dataset.lanyardMounted="true";
 let root=roots.get(container);if(!root){root=createRoot(container);roots.set(container,root);}
 root.render(<ContactLanyard {...options}/>);
}
