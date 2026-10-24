// Adapted from the React Bits Stepper supplied for this project.
import {Children, isValidElement, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode} from 'react';
import {HugeiconsIcon} from '@hugeicons/react';
import ArrowLeft01Icon from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import Tick02Icon from '@hugeicons/core-free-icons/Tick02Icon';
import './Stepper.css';

type StepProps = {title?: ReactNode; children?: ReactNode};
export function Step({children}: StepProps) { return <div className="stepper__step">{children}</div>; }
type StepperProps = {
  children: ReactNode; step?: number; initialStep?: number; onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void; disableStepIndicators?: boolean; showFooter?: boolean;
  backButtonText?: string; nextButtonText?: string; completeButtonText?: string;
  frame?: boolean; className?: string; accentColor?: string; width?: number | string;
};

export default function Stepper({children, step, initialStep=1, onStepChange, onFinalStepCompleted,
  disableStepIndicators=false, showFooter=true, backButtonText='Back', nextButtonText='Continue',
  completeButtonText='Complete', frame=true, className='', accentColor, width=440}: StepperProps) {
  const steps = Children.toArray(children).filter(isValidElement) as ReactElement<StepProps>[];
  const [internal, setInternal] = useState(initialStep);
  const current = Math.min(steps.length+1, Math.max(1, step ?? internal));
  const complete = current > steps.length;
  const track = useRef<HTMLDivElement>(null);
  const glider = useRef<HTMLSpanElement>(null);
  const markers = useRef<(HTMLButtonElement | null)[]>([]);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const row=track.current, tile=glider.current;
    if (!row || !tile) return;
    const place = (animate: boolean) => {
      const marker=markers.current[Math.min(current, steps.length)-1];
      if (!marker) return;
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      tile.style.transition=animate && !reduced ? 'transform 420ms cubic-bezier(.22,1,.36,1), width 420ms cubic-bezier(.22,1,.36,1)' : 'none';
      tile.style.transform=`translate(${marker.offsetLeft}px, ${marker.offsetTop}px)`;
      tile.style.width=`${marker.offsetWidth}px`;
      tile.style.height=`${marker.offsetHeight}px`;
      tile.style.opacity=complete?'0':'1';
    };
    place(placed.current); placed.current=true;
    const observer=new ResizeObserver(()=>place(false)); observer.observe(row);
    return ()=>observer.disconnect();
  }, [current, steps.length, complete]);

  const go=(next: number)=>{
    if (step===undefined) setInternal(next);
    if (next>steps.length) onFinalStepCompleted?.(); else onStepChange?.(next);
  };
  return <div className={`stepper${frame?' stepper--framed':''} ${className}`} style={{'--stepper-width':typeof width==='number'?`${width}px`:width, ...(accentColor?{'--stepper-accent':accentColor}:{})} as CSSProperties}>
    <div ref={track} className="stepper__track">
      <span ref={glider} className="stepper__glider" aria-hidden="true" />
      {steps.map((entry,index)=>{
        const number=index+1, status=number<current?'complete':number===current?'active':'upcoming';
        return <button key={number} type="button" ref={element=>{markers.current[index]=element;}} className="stepper__segment" data-status={status}
          aria-current={number===current?'step':undefined} aria-label={`${number}: ${entry.props.title ?? ''}`}
          disabled={disableStepIndicators || number===current || number>current} onClick={()=>go(number)}>
          <span className="stepper__badge" aria-hidden="true">{status==='complete'?<HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.4}/>:number}</span>
          <span className="stepper__title">{entry.props.title}</span>
        </button>;
      })}
    </div>
    <div className="stepper__body">{!complete && steps[current-1]}{showFooter && !complete && <div className="stepper__footer">
      <button type="button" className="stepper__button" disabled={current===1} onClick={()=>go(current-1)}><HugeiconsIcon icon={ArrowLeft01Icon} size={16}/>{backButtonText}</button>
      <button type="button" className="stepper__button stepper__button--next" onClick={()=>go(current+1)}>{current===steps.length?completeButtonText:nextButtonText}<HugeiconsIcon icon={ArrowRight01Icon} size={16}/></button>
    </div>}</div>
  </div>;
}
