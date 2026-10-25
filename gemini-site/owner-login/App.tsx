import {applyTheme,saveWorkbenchTheme} from '../public/site-theme.mjs';
import {useState,useEffect,type FormEvent,type ReactNode,type ChangeEvent} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft,ArrowRight,Eye,EyeOff,LockKeyhole,LoaderCircle,ShieldCheck,Sparkles,CheckCircle2} from 'lucide-react';
import Galaxy from '../src/components/react-bits/Galaxy';

export default function App(){
 const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [welcoming,setWelcoming]=useState(false);
 const [values,setValues]=useState({username:'',password:''});
 const [touched,setTouched]=useState({username:false,password:false});
 const [submitted,setSubmitted]=useState(false);
 const [language,setLanguage]=useState(()=>{try{return localStorage.getItem('danny-language')||'en'}catch{return 'en'}});
 const tr=(en:string,zh:string,ms:string)=>language==='zh'?zh:language==='ms'?ms:en;
 const [theme,setTheme]=useState(()=>applyTheme());
 const reduced=useMediaQuery('(prefers-reduced-motion: reduce)'),compact=useMediaQuery('(max-width: 700px)'),dark=theme==='dark';
 useEffect(()=>{
  const sync=()=>setTheme(document.documentElement.dataset.theme||'light');
  document.addEventListener('danny-theme-change',sync);
  return()=>document.removeEventListener('danny-theme-change',sync);
 },[]);
 useEffect(()=>{
  if(!welcoming)return;
  const timer=setTimeout(()=>{
   window.location.assign('/studio/');
  },1850);
  return()=>clearTimeout(timer);
 },[welcoming]);
 const usernameEmpty=!values.username.trim();
 const passwordEmpty=!values.password;
 const usernameError=(touched.username||submitted)&&usernameEmpty?tr('Please enter your owner name.','请输入店主账号。','Sila masukkan nama pemilik.'):'';
 const passwordError=(touched.password||submitted)&&passwordEmpty?tr('Please enter your password.','请输入密码。','Sila masukkan kata laluan.'):'';
 function handleChange(field:'username'|'password',event:ChangeEvent<HTMLInputElement>){
  const next=event.target.value;
  setValues(prev=>({...prev,[field]:next}));
  if(error)setError('');
 }
 function handleBlur(field:'username'|'password'){
  setTouched(prev=>({...prev,[field]:true}));
 }
 function triggerWelcomeCeremony(){
  try{
   sessionStorage.setItem('danny-dashboard-welcome',String(Date.now()));
  }catch{}
  setBusy(false);
  setWelcoming(true);
 }
 async function login(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy||welcoming)return;
  setSubmitted(true);
  setTouched({username:true,password:true});
  if(usernameEmpty||passwordEmpty){
   const firstEmpty=event.currentTarget.querySelector<HTMLInputElement>(usernameEmpty?'#username':'#password');
   firstEmpty?.focus();
   return;
  }
  setBusy(true);setError('');
  try{
   const response=await fetch('/api/owner/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:values.username.trim(),password:values.password})});
   const result=await response.json().catch(()=>({}));
   if(response.ok&&result.ok){
    triggerWelcomeCeremony();
    return;
   }
  }catch{}
  setError(tr('Incorrect owner name or password.','店主账号或密码错误。','Nama pemilik atau kata laluan tidak betul.'));
  setBusy(false);
 }
 return <main className="owner-login-page">
  <div className="owner-login-background" aria-hidden="true"><Galaxy key={reduced?'still':'moving'}
   starColors={dark?['#c8a97e','#8fd6ff','#d8edff']:['#8a683b','#245bc7','#4779c9']}
   density={.85} glowIntensity={.28} flareIntensity={.42} starSize={.88} twinkleIntensity={.22}
   starSpeed={.2} speed={.55} rotationSpeed={.025} layers={compact?2:3}
   mouseInteraction={!compact&&!reduced} mouseRepulsion clickWarp={false} intro={false}
   lightMode={!dark} backgroundColor={dark?'#0b1423':'#faf9f6'} transparent opacity={dark ? 0.84 : 0.58}
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
    <div className={`login-card${welcoming?' is-welcoming':''}`}>
     <span className="login-glow" aria-hidden="true"/>
     <div className="login-card-content">
      <div className="login-brand-row">
       <a href="/" className="owner-wordmark" aria-label="Danny Recon Select home">
        <span className="brand-logo" aria-hidden="true">
         <img className="brand-logo-img logo-dark" src="/assets/logo-danny-dark.png" alt="" width="34" height="24" decoding="async"/>
         <img className="brand-logo-img logo-light" src="/assets/logo-danny-light.png" alt="" width="34" height="24" decoding="async"/>
        </span>
        <span className="brand-wordmark-text"><span>DANNY</span><small>RECON SELECT</small></span>
       </a>
       <span className="login-vip-pill"><Sparkles size={13} aria-hidden="true"/>{tr('OWNER SUITE','店主专属空间','SUITE PEMILIK')}</span>
      </div>
      {welcoming?(
       <div className="owner-welcome-ceremony" role="status" aria-live="polite">
        <div className="welcome-ceremony-seal" aria-hidden="true">
         <CheckCircle2 size={28}/>
        </div>
        <p className="welcome-ceremony-kicker">{tr('WELCOME BACK · WELCOME OWNER','欢迎回来 · 尊贵店主','SELAMAT KEMBALI · PEMILIK SHOWROOM')}</p>
        <h1 id="ownerLoginTitle">{tr('Welcome back, Danny Ong.','欢迎回来，Danny Ong。','Selamat kembali, Danny Ong.')}</h1>
        <p className="welcome-ceremony-copy">{tr('Preparing your private showroom command center, live inventory analytics, and spotlight tuner…','正在为你开启私人展厅控制台、实时库存分析与 3D 展车聚光灯…','Menyediakan pusat kawalan showroom peribadi dan analitik inventori anda…')}</p>
        <div className="welcome-ceremony-checks">
         <span>✓ {tr('Owner access verified','店主身份已验证','Akses pemilik disahkan')}</span>
         <span>✓ {tr('Opening your workspace','正在打开工作台','Membuka ruang kerja')}</span>
        </div>
        <div className="welcome-ceremony-progress" aria-hidden="true"><span/></div>
        <div className="welcome-ceremony-actions">
         <a href="/studio/" className="login-submit welcome-enter-now">{tr('Enter Dashboard Now','立即进入控制台','Masuk Dashboard Sekarang')}<ArrowRight size={18} aria-hidden="true"/></a>
        </div>
       </div>
      ):(
       <>
        <div className="login-heading">
         <div className="login-heading-top">
          <span className="login-lock" aria-hidden="true"><LockKeyhole size={20}/></span>
          <span className="login-greeting-tag">{tr('WELCOME BACK · WELCOME OWNER','欢迎回来 · 店主控制台','SELAMAT KEMBALI · PEMILIK')}</span>
         </div>
         <h1 id="ownerLoginTitle">{tr('Owner Log In','店主登录','Log Masuk Pemilik')}</h1>
         <p>{tr('Welcome back, Danny. Sign in to experience your upgraded showroom command center to manage your cars.','欢迎回来，Danny。登录即可进入全新升级的展厅管理工作台。','Selamat kembali, Danny. Log masuk ke pusat kawalan showroom anda.')}</p>
        </div>
        <form onSubmit={login} className="owner-login-form" aria-busy={busy} noValidate>
         <InputGroup label={tr('Owner name','店主账号','Nama pemilik')} placeholder={tr('Enter your owner name','输入店主账号','Masukkan nama pemilik')} name="username" type="text" autoComplete="username" value={values.username} errorMessage={usernameError} onChange={e=>handleChange('username',e)} onBlur={()=>handleBlur('username')}/>
         <InputGroup label={tr('Password','密码','Kata laluan')} placeholder={tr('Enter your password','输入密码','Masukkan kata laluan')} name="password" type={visible?'text':'password'} autoComplete="current-password" value={values.password} errorMessage={passwordError} onChange={e=>handleChange('password',e)} onBlur={()=>handleBlur('password')} suffix={<button type="button" className="login-password-toggle" onClick={()=>setVisible(!visible)} aria-label={visible?tr('Hide password','隐藏密码','Sembunyikan kata laluan'):tr('Show password','显示密码','Tunjuk kata laluan')} aria-pressed={visible}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button>}/>
         {error&&<p role="alert" className="login-error">{error}</p>}
         <button disabled={busy} type="submit" className="login-submit">{busy?<><LoaderCircle size={18} className="login-spinner" aria-hidden="true"/>{tr('Verifying Owner…','正在验证店主身份…','Mengesahkan Pemilik…')}</>:<>{tr('Unlock Owner Studio','解锁进入店主工作台','Buka Studio Pemilik')}<ArrowRight size={18} aria-hidden="true"/></>}</button>
        </form>
        <p className="login-private"><ShieldCheck size={15} aria-hidden="true"/>{tr('Private access for the showroom owner · Encrypted session','仅限店主专属访问 · 安全加密会话','Akses peribadi untuk pemilik showroom')}</p>
       </>
      )}
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
function InputGroup({label,placeholder,type,name,autoComplete,value,errorMessage,onChange,onBlur,suffix}:{label:string;placeholder:string;type:string;name:string;autoComplete:string;value:string;errorMessage?:string;onChange:(event:ChangeEvent<HTMLInputElement>)=>void;onBlur:()=>void;suffix?:ReactNode}){
 const [focused,setFocused]=useState(false);
 const invalid=Boolean(errorMessage);
 const errorId=`${name}-error`;
 return <div className={`login-input-group${focused?' is-focused':''}${invalid?' is-invalid':''}`} data-focused={focused?'true':undefined} data-invalid={invalid?'true':undefined}><label htmlFor={name}>{label}</label><div className="login-input-wrap"><input id={name} name={name} type={type} value={value} placeholder={placeholder} autoComplete={autoComplete} required maxLength={128} spellCheck={false} autoCapitalize="none" aria-invalid={invalid} aria-describedby={invalid?errorId:undefined} onChange={onChange} onFocus={()=>setFocused(true)} onBlur={()=>{setFocused(false);onBlur();}}/>{suffix}</div>{invalid&&<p id={errorId} className="login-field-error" role="status">{errorMessage}</p>}</div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
