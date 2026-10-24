import {applyTheme,saveWorkbenchTheme} from '../public/site-theme.mjs';
import {useState,useEffect,type FormEvent,type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft,ArrowRight,Eye,EyeOff,LockKeyhole,LoaderCircle,ShieldCheck} from 'lucide-react';
import Galaxy from '../src/components/react-bits/Galaxy';

export default function App(){
 const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [language,setLanguage]=useState(()=>{try{return localStorage.getItem('danny-language')||'en'}catch{return 'en'}});
 const tr=(en:string,zh:string,ms:string)=>language==='zh'?zh:language==='ms'?ms:en;
 const [theme,setTheme]=useState(()=>applyTheme());
 const reduced=useMediaQuery('(prefers-reduced-motion: reduce)'),compact=useMediaQuery('(max-width: 700px)'),dark=theme==='dark';
 useEffect(()=>{const sync=()=>setTheme(document.documentElement.dataset.theme||'light');document.addEventListener('danny-theme-change',sync);return()=>document.removeEventListener('danny-theme-change',sync);},[]);
 async function login(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setBusy(true);setError('');
  const form=new FormData(event.currentTarget);
  try{
   const response=await fetch('/api/owner/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:form.get('username'),password:form.get('password')})});
   const result=await response.json();
   if(!response.ok){setError(result.error||tr('Unable to log in. Please try again.','无法登录，请重试。','Tidak dapat log masuk. Cuba lagi.'));return;}
   try{sessionStorage.setItem('danny-dashboard-welcome',String(Date.now()));}catch{}
   window.location.assign('/studio/');
  }catch{setError(tr('Unable to connect. Please try again.','无法连接，请重试。','Tidak dapat menyambung. Cuba lagi.'));}finally{setBusy(false);}
 }
 return <main className="owner-login-page">
  <div className="owner-login-background" aria-hidden="true"><Galaxy key={reduced?'still':'moving'}
   starColors={dark?['#8fd6ff','#b6c7ff','#d8edff']:['#245bc7','#4779c9','#6c70b8']}
   density={.85} glowIntensity={.25} flareIntensity={.4} starSize={.85} twinkleIntensity={.2}
   starSpeed={.2} speed={.55} rotationSpeed={.025} layers={compact?2:3}
   mouseInteraction={!compact&&!reduced} mouseRepulsion clickWarp={false} intro={false}
   lightMode={!dark} backgroundColor={dark?'#0b1423':'#faf9f6'} transparent opacity={dark ? 0.8 : 0.55}
   disableAnimation={reduced} dpr={compact?1:1.25} style={{}}/>
  </div>
  <div className="owner-login-shell">
   <div className="owner-login-toolbar">
    <a href="/" className="login-back"><ArrowLeft size={15} aria-hidden="true"/>{tr('Showroom','返回展厅','Showroom')}</a>
    <div className="login-preferences">
     <button type="button" className="theme-control theme-control--simple" role="switch" aria-label={theme==='dark'?'Switch to light theme':'Switch to dark theme'} aria-checked={theme==='dark'} onClick={()=>setTheme(saveWorkbenchTheme(theme==='dark'?'light':'dark'))}>
      <svg className="theme-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg><svg className="theme-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.6 8.6 0 1 0 20.2 15.1Z"/></svg><span className="theme-label">{theme==='dark'?'Night':'Day'}</span><span className="theme-track" aria-hidden="true"></span>
     </button>
     <label className="owner-login-language"><span className="sr-only">{tr('Language','语言','Bahasa')}</span><select aria-label={tr('Language','语言','Bahasa')} value={language} onChange={event=>{setLanguage(event.target.value);try{localStorage.setItem('danny-language',event.target.value);localStorage.setItem('danny-site-language',event.target.value)}catch{}}}><option value="en">EN</option><option value="zh">中文</option><option value="ms">BM</option></select></label>
    </div>
   </div>
   <section className="login-wrapper" aria-labelledby="ownerLoginTitle">
    <div className="login-card">
     <span className="login-glow" aria-hidden="true"/>
     <div className="login-card-content">
      <a href="/" className="owner-wordmark" aria-label="Danny Recon Select home"><span>DANNY</span><small>RECON SELECT</small></a>
      <div className="login-heading"><span className="login-lock" aria-hidden="true"><LockKeyhole size={20}/></span><h1 id="ownerLoginTitle">{tr('Owner Log In','店主登录','Log Masuk Pemilik')}</h1><p>{tr('Welcome back, Danny. Your showroom is ready.','欢迎回来，Danny。开始管理你的展厅。','Selamat kembali, Danny. Showroom anda sedia.')}</p></div>
      <form onSubmit={login} className="owner-login-form" aria-busy={busy}>
       <InputGroup label={tr('Owner name','店主账号','Nama pemilik')} placeholder={tr('Enter your owner name','输入店主账号','Masukkan nama pemilik')} name="username" type="text" autoComplete="username"/>
       <InputGroup label={tr('Password','密码','Kata laluan')} placeholder={tr('Enter your password','输入密码','Masukkan kata laluan')} name="password" type={visible?'text':'password'} autoComplete="current-password" suffix={<button type="button" className="login-password-toggle" onClick={()=>setVisible(!visible)} aria-label={visible?tr('Hide password','隐藏密码','Sembunyikan kata laluan'):tr('Show password','显示密码','Tunjuk kata laluan')} aria-pressed={visible}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button>}/>
       {error&&<p role="alert" className="login-error">{error}</p>}
       <button disabled={busy} type="submit" className="login-submit">{busy?<><LoaderCircle size={18} className="login-spinner" aria-hidden="true"/>{tr('Logging in…','正在登录…','Sedang log masuk…')}</>:<>{tr('Log In','登录','Log Masuk')}<ArrowRight size={18} aria-hidden="true"/></>}</button>
      </form>
      <p className="login-private"><ShieldCheck size={15} aria-hidden="true"/>{tr('Private access for the showroom owner.','仅限店主使用。','Akses peribadi untuk pemilik showroom.')}</p>
     </div>
    </div>
   </section>
  </div>
 </main>;
}
function useMediaQuery(query:string){
 const [matches,setMatches]=useState(()=>window.matchMedia(query).matches);
 useEffect(()=>{const media=window.matchMedia(query),sync=()=>setMatches(media.matches);media.addEventListener('change',sync);sync();return()=>media.removeEventListener('change',sync);},[query]);
 return matches;
}
function InputGroup({label,placeholder,type,name,autoComplete,suffix}:{label:string;placeholder:string;type:string;name:string;autoComplete:string;suffix?:ReactNode}){
 return <div className="login-input-group"><label htmlFor={name}>{label}</label><div className="login-input-wrap"><input id={name} name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} required maxLength={128} spellCheck={false} autoCapitalize="none"/>{suffix}</div></div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
