import {useEffect,useLayoutEffect,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import LayoutTextFlipDemo from './components/layout-text-flip-demo';

declare global {interface Window {dannyDashboardWelcome?:{startedAt:number;fallback:number}}}

export function DashboardWelcome(){
 const reduced=useReducedMotion();
 const [visible,setVisible]=useState(()=>document.documentElement.classList.contains('owner-welcoming'));
 const reveal=()=>{document.documentElement.classList.remove('owner-welcoming');document.documentElement.style.removeProperty('--welcome-enter-delay');};
 const dismiss=()=>{reveal();setVisible(false);};
 useLayoutEffect(()=>{
  const initial=document.getElementById('dashboardWelcomeInitial');
  const elapsed=Number(initial?.querySelector('.dashboard-welcome-content')?.getAnimations()[0]?.currentTime)||Date.now()-(window.dannyDashboardWelcome?.startedAt||Date.now());
  document.documentElement.style.setProperty('--welcome-enter-delay',`${-Math.max(0,elapsed)}ms`);
  initial?.remove();
  if(window.dannyDashboardWelcome)clearTimeout(window.dannyDashboardWelcome.fallback);
 },[]);
 useEffect(()=>{
  if(!visible){reveal();return;}
  const elapsed=Date.now()-(window.dannyDashboardWelcome?.startedAt||Date.now());
  const timer=setTimeout(()=>{reveal();setVisible(false);},Math.max(0,3150-elapsed));
  return()=>clearTimeout(timer);
 },[visible]);
 return <AnimatePresence>{visible&&<motion.div className="dashboard-welcome" role="status" aria-label="Welcome to Dashboard" onClick={dismiss} initial={false} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?.15:.65}}>
  <div className="dashboard-welcome-content">
   <div className="dashboard-welcome-brand" aria-hidden="true"><span className="brand-logo full-brand" aria-hidden="true"><img className="brand-logo-img brand-wordmark logo-dark" src="/assets/brand-wordmark-black.png" alt="" width="34" height="24" decoding="async" /><img className="brand-logo-img brand-wordmark logo-light" src="/assets/brand-wordmark-white.png" alt="" width="34" height="24" decoding="async" /></span><span>DANNY<small>RECON SELECT</small></span></div>
   <p style={{margin:'0 0 8px',fontSize:'11px',fontWeight:800,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--champagne,#c8a97e)'}}>WELCOME BACK · WELCOME OWNER</p>
   <LayoutTextFlipDemo/>
  </div>
 </motion.div>}</AnimatePresence>;
}
