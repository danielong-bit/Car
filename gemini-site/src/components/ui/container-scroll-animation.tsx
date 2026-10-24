import {useRef,type ReactNode} from 'react';
import {motion,useScroll,useTransform,useReducedMotion} from 'motion/react';

export function ContainerScroll({children}:{children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null),reduced=useReducedMotion();
 const {scrollYProgress}=useScroll({target:ref,offset:['start end','start center']});
 const rotateX=useTransform(scrollYProgress,[0,1],[6,0]),scale=useTransform(scrollYProgress,[0,1],[.97,1]);
 return <div ref={ref} style={{perspective:1200}}><motion.div style={reduced?{}:{rotateX,scale,transformOrigin:'center top'}}>{children}</motion.div></div>;
}
