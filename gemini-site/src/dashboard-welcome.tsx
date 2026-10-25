import {useEffect,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import LayoutTextFlipDemo from './components/layout-text-flip-demo';

export function DashboardWelcome(){
 const reduced=useReducedMotion();
 const [visible,setVisible]=useState(()=>{
  try{
   const time=Number(sessionStorage.getItem('danny-dashboard-welcome'));sessionStorage.removeItem('danny-dashboard-welcome');
   return time>0&&Date.now()-time>=0&&Date.now()-time<60000;
  }catch{return false;}
 });
 const reveal=()=>document.documentElement.classList.remove('owner-welcoming');
 const dismiss=()=>{reveal();setVisible(false);};
 useEffect(()=>{
  if(!visible){reveal();return;}
  document.documentElement.classList.add('owner-welcoming');
  const timer=setTimeout(()=>{reveal();setVisible(false);},2500);
  return()=>clearTimeout(timer);
 },[visible]);
 return <AnimatePresence>{visible&&<motion.div className="dashboard-welcome" role="status" aria-label="Welcome to Dashboard" onClick={dismiss} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?.15:.45}}>
  <motion.div className="dashboard-welcome-content" initial={reduced?{opacity:0}:{opacity:0,y:12,scale:.97}} animate={{opacity:1,y:0,scale:1}} transition={{duration:reduced?.15:.5,ease:'easeOut'}}>
   <div className="dashboard-welcome-brand" aria-hidden="true"><span className="brand-logo" aria-hidden="true"><img className="brand-logo-img logo-dark" src="/assets/logo-danny-dark.png" alt="" width="34" height="24" decoding="async" /><img className="brand-logo-img logo-light" src="/assets/logo-danny-light.png" alt="" width="34" height="24" decoding="async" /></span><span>DANNY<small>RECON SELECT</small></span></div>
   <p style={{margin:'0 0 8px',fontSize:'11px',fontWeight:800,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--champagne,#c8a97e)'}}>WELCOME BACK · WELCOME OWNER</p>
   <LayoutTextFlipDemo/>
  </motion.div>
 </motion.div>}</AnimatePresence>;
}
