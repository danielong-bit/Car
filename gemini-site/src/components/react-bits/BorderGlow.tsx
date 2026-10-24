// Adapted from the React Bits BorderGlow supplied for this project.
import {useRef, type CSSProperties, type PointerEvent, type ReactNode} from 'react';
import './BorderGlow.css';

type Props={children:ReactNode;className?:string;backgroundColor?:string;borderRadius?:number;glowRadius?:number;glowIntensity?:number;edgeSensitivity?:number;coneSpread?:number;colors?:string[]};
export default function BorderGlow({children,className='',backgroundColor='#121f32',borderRadius=18,glowRadius=24,glowIntensity=.6,edgeSensitivity=30,coneSpread=25,colors=['#245bc7','#81aaff','#52b6df']}:Props){
  const cardRef=useRef<HTMLDivElement>(null);
  const move=(event:PointerEvent<HTMLDivElement>)=>{
    if(event.pointerType==='touch'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const card=cardRef.current;if(!card)return;
    const {left,top,width,height}=card.getBoundingClientRect();
    if(!width||!height)return;
    const dx=event.clientX-left-width/2,dy=event.clientY-top-height/2;
    const edge=Math.min(1,Math.max(Math.abs(dx)/(width/2),Math.abs(dy)/(height/2)));
    card.style.setProperty('--edge-proximity',edge.toFixed(3));
    card.style.setProperty('--cursor-angle',`${Math.atan2(dy,dx)*180/Math.PI+90}deg`);
  };
  const style={
    '--card-bg':backgroundColor,'--border-radius':`${borderRadius}px`,'--glow-padding':`${glowRadius}px`,
    '--glow-intensity':glowIntensity,'--edge-sensitivity':Math.min(95,Math.max(0,edgeSensitivity))/100,
    '--cone-spread':`${coneSpread}%`,'--glow-one':colors[0], '--glow-two':colors[1]||colors[0], '--glow-three':colors[2]||colors[0],
  } as CSSProperties;
  return <div ref={cardRef} onPointerMove={move} onPointerLeave={()=>cardRef.current?.style.setProperty('--edge-proximity','0')} className={`border-glow-card ${className}`} style={style}>
    <span className="edge-light" aria-hidden="true"/><div className="border-glow-inner">{children}</div>
  </div>;
}
