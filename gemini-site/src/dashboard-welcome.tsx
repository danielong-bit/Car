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
 useEffect(()=>{
  if(!visible){reveal();return;}
  document.documentElement.classList.add('owner-welcoming');
  const timer=setTimeout(()=>{reveal();setVisible(false);},2400);
  return()=>clearTimeout(timer);
 },[visible]);
 return <AnimatePresence>{visible&&<motion.div className="dashboard-welcome" role="status" aria-label="Welcome to Dashboard" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?.15:.45}}>
  <motion.div className="dashboard-welcome-content" initial={reduced?{opacity:0}:{opacity:0,y:12,scale:.97}} animate={{opacity:1,y:0,scale:1}} transition={{duration:reduced?.15:.5,ease:'easeOut'}}>
   <div className="dashboard-welcome-brand" aria-hidden="true">DANNY<small>RECON SELECT</small></div>
   <LayoutTextFlipDemo/>
  </motion.div>
 </motion.div>}</AnimatePresence>;
}
