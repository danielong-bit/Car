"use client";
import {useEffect,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';

// Adapted from the LayoutTextFlip component supplied by the user.
export function LayoutTextFlip({text,words,duration=3000}:{text:string;words:string[];duration?:number}){
 const [index,setIndex]=useState(0),reduced=useReducedMotion();
 useEffect(()=>{
  setIndex(0);if(words.length<2)return;
  const timer=setInterval(()=>setIndex(value=>(value+1)%words.length),Math.max(500,duration));
  return()=>clearInterval(timer);
 },[duration,words.length]);
 return <span className="layout-text-flip">
  <motion.span layout className="layout-text-flip-label">{text}</motion.span>
  <motion.span layout className="layout-text-flip-word"><AnimatePresence mode="popLayout" initial={false}>
   <motion.span key={index} className="layout-text-flip-value" initial={reduced?{opacity:0}:{y:-32,filter:'blur(8px)',opacity:0}} animate={{y:0,filter:'blur(0px)',opacity:1}} exit={reduced?{opacity:0}:{y:32,filter:'blur(8px)',opacity:0}} transition={{duration:reduced?.15:.5}}>{words[index%Math.max(words.length,1)]||''}</motion.span>
  </AnimatePresence></motion.span>
 </span>;
}
