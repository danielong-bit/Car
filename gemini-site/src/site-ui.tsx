import {createRoot, type Root} from 'react-dom/client';
import {useEffect, useState} from 'react';
import Stepper, {Step} from './components/react-bits/Stepper';
import './components/react-bits/BorderGlow.css';
import './site-shell-polish.css';
import GhostFibers from './components/react-bits/GhostFibers';

const roots=new WeakMap<HTMLElement,Root>();
function rootFor(container:HTMLElement){let root=roots.get(container);if(!root){root=createRoot(container);roots.set(container,root);}return root;}
export function renderFinderStepper(container:HTMLElement,step:number,language='en'){
  const labels=language==='zh'?['预算','车型','变速箱','优先条件']:language==='ms'?['Bajet','Jenis','Transmisi','Keutamaan']:['Budget','Body type','Transmission','Priority'];
  rootFor(container).render(<Stepper step={step} disableStepIndicators showFooter={false} frame={false} width="100%" className="finder-stepper">{labels.map(title=><Step key={title} title={title}/>)}</Stepper>);
  return ()=>{const root=roots.get(container);if(root){root.unmount();roots.delete(container);}};
}
function useMedia(query:string){
  const [matches,setMatches]=useState(()=>window.matchMedia(query).matches);
  useEffect(()=>{const media=window.matchMedia(query),sync=()=>setMatches(media.matches);media.addEventListener('change',sync);sync();return()=>media.removeEventListener('change',sync);},[query]);
  return matches;
}
function FooterFibers({container,dark}:{container:HTMLElement;dark:boolean}){
  const [near,setNear]=useState(false);
  const reduced=useMedia('(prefers-reduced-motion: reduce)'),compact=useMedia('(max-width: 700px)');
  useEffect(()=>{const observer=new IntersectionObserver(entries=>setNear(entries.some(entry=>entry.isIntersecting)),{rootMargin:'160px'});observer.observe(container);return()=>observer.disconnect();},[container]);
  return <div className="home-footer-background" aria-hidden="true">{near&&!reduced&&<GhostFibers
    glowColor="#8fd6ff" lineColor={dark?'#c5e8ff':'#0337a6'} secondaryColor="#8b97fa"
    layers={2} volume={1.4} threads={compact?36:48} density={.8} particles={compact?.3:1}
    speed={.25} flow={.2} rotation={12} mouseStrength={2} mouseInteraction={!compact}
    brightness={dark?.85:.8} glow={dark?.5:0} lightMode={!dark} dpr={compact?1:1.25}
    grain={.015} vignette={.55} intro={false} pulseOnClick={false}/>}</div>;
}
function MinimalFooter({container,dashboardHref}:{container:HTMLElement;dashboardHref:string}){
  const [dark,setDark]=useState(()=>document.documentElement.dataset.theme==='dark');
  useEffect(()=>{const sync=()=>setDark(document.documentElement.dataset.theme==='dark');document.addEventListener('danny-theme-change',sync);return()=>document.removeEventListener('danny-theme-change',sync);},[]);
  const fibers=document.body.classList.contains('exhibition-home');
  const socials=[['TikTok','tiktok','tiktok'],['小红书 / RED','rednote','xiaohongshu'],['Facebook','facebook','facebook']].filter(([,key])=>/^https?:\/\//i.test(container.dataset[key]||''));
  return <>{fibers&&<FooterFibers container={container} dark={dark}/>}
    <div className="footer-layout">
      <div className="footer-center"><a className="footer-title" href={container.dataset.homeHref||'/'}><span>DANNY</span><small>RECON SELECT</small></a>
        <a className="footer-owner-link" href={dashboardHref}>{container.dataset.dashboardLabel||'Owner Dashboard'} <span aria-hidden="true">↗</span></a>
      </div>
      <div className="footer-baseline"><small>© {new Date().getFullYear()} Danny Recon Select</small>
        <nav className="footer-socials" aria-label={container.dataset.language==='zh'?'社交平台':'Social media'}>{socials.map(([label,key,file])=><a key={key} href={container.dataset[key]} target="_blank" rel="noopener noreferrer" aria-label={label}><img src={`${container.dataset.iconBase}${file}.svg`} alt="" width="21" height="21" loading="lazy"/></a>)}</nav>
      </div>
    </div></>;

}
export function renderMinimalFooter(container:HTMLElement,dashboardHref:string){rootFor(container).render(<MinimalFooter container={container} dashboardHref={dashboardHref}/>);}
