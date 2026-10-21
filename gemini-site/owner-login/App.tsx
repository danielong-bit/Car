import {useState, type FormEvent, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {motion, useReducedMotion} from 'motion/react';
import {ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, LoaderCircle, ShieldCheck} from 'lucide-react';

export default function App(){
 const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const reduced=useReducedMotion();
 async function login(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setBusy(true);setError('');
  const form=new FormData(event.currentTarget);
  try{
   const response=await fetch('/api/owner/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:form.get('username'),password:form.get('password')})});
   const result=await response.json();
   if(!response.ok){setError(result.error||'Unable to log in. Please try again.');return;}
   window.location.assign('/studio/');
  }catch{setError('Unable to connect. Please try again.');}finally{setBusy(false);}
 }
 const reveal={hidden:{opacity:0,y:reduced?0:10},show:{opacity:1,y:0,transition:{duration:.5}}};
 return <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
  <section aria-label="Danny owner workspace" className="relative hidden h-full w-[52%] flex-col items-center justify-end overflow-hidden rounded-3xl px-12 pb-24 shadow-2xl lg:flex">
   <video autoPlay={!reduced} muted loop playsInline className="absolute inset-0 h-full w-full object-cover" aria-hidden="true"><source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4"/></video>
   <motion.div initial="hidden" animate="show" variants={{hidden:{opacity:0},show:{opacity:1,transition:{staggerChildren:reduced?0:.15,delayChildren:reduced?0:.2}}}} className="relative z-10 w-full max-w-xs space-y-8">
    <motion.a variants={reveal} href="/" className="owner-wordmark inline-flex flex-col text-white" aria-label="Danny Recon Select home"><span>DANNY</span><small>RECON SELECT</small></motion.a>
    <motion.div variants={reveal}><h2 className="text-4xl font-medium tracking-tight">Your showroom.<br/>Your space.</h2><p className="mt-4 text-sm leading-relaxed text-white/80">Manage your stock, deliveries and website in one place.</p></motion.div>
    <motion.div variants={reveal} className="space-y-3"><StepItem number={1} text="Owner log in" active/><StepItem number={2} text="Open your workbench"/><StepItem number={3} text="Keep your showroom current"/></motion.div>
   </motion.div>
  </section>
  <section className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-12 sm:px-12 lg:overflow-hidden lg:px-14 lg:py-6 xl:px-20">
   <motion.div initial={{opacity:reduced?1:0}} animate={{opacity:1}} transition={{duration:.8,ease:'easeOut'}} className="w-full max-w-xl space-y-8 lg:space-y-7">
    <a href="/" className="inline-flex items-center gap-2 text-xs text-white/50 transition-colors hover:text-white"><ArrowLeft size={14}/>Back to showroom</a>
    <a href="/" className="owner-wordmark flex flex-col items-start lg:hidden"><span>DANNY</span><small>RECON SELECT</small></a>
    <div><div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10"><LockKeyhole size={19} aria-hidden="true"/></div><h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Owner Log In</h1><p className="mt-3 text-sm leading-relaxed text-white/45">Welcome back, Danny. Log in to your stock workbench.</p></div>
    <form onSubmit={login} className="space-y-5">
     <InputGroup label="Owner name" placeholder="Enter your owner name" name="username" type="text" autoComplete="username"/>
     <InputGroup label="Password" placeholder="Enter your password" name="password" type={visible?'text':'password'} autoComplete="current-password" suffix={<button type="button" onClick={()=>setVisible(!visible)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/45 hover:text-white" aria-label={visible?'Hide password':'Show password'} aria-pressed={visible}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button>}/>
     {error&&<p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
     <button disabled={busy} className="mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-white font-semibold text-black transition hover:bg-white/90 active:scale-[.98] disabled:cursor-wait disabled:opacity-60">{busy?<><LoaderCircle size={18} className="animate-spin"/>Logging in…</>:<>Log In<ArrowRight size={18}/></>}</button>
    </form>
    <p className="flex items-center gap-2 text-xs leading-relaxed text-white/40"><ShieldCheck size={16} className="shrink-0"/>Private access for the showroom owner.</p>
    <p className="border-t border-white/10 pt-6 text-[10px] tracking-wide text-white/30">© {new Date().getFullYear()} Danny Recon Select. All rights reserved.</p>
   </motion.div>
  </section>
 </main>;
}
function StepItem({number,text,active=false}:{number:number;text:string;active?:boolean}){return <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs ${active?'border border-white bg-white text-black':'border border-transparent bg-brand-gray text-white'}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${active?'bg-black text-white':'bg-white/10 text-white/40'}`}>{number}</span><span>{text}</span></div>;}
function SocialButton({icon,label}:{icon:ReactNode;label:string}){return <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black py-3 hover:bg-white/5">{icon}{label}</button>;}
function InputGroup({label,placeholder,type,name,autoComplete,suffix}:{label:string;placeholder:string;type:string;name:string;autoComplete:string;suffix?:ReactNode}){return <div className="space-y-2"><label htmlFor={name} className="text-sm font-medium text-white">{label}</label><div className="relative"><input id={name} name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} required maxLength={128} spellCheck={false} autoCapitalize="none" className="h-12 w-full rounded-xl border-0 bg-brand-gray px-4 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"/>{suffix}</div></div>;}
createRoot(document.getElementById('root')!).render(<App/>);
