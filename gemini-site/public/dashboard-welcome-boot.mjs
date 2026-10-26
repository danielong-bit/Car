// This runs inline in the document head, before the workspace can be painted.
export function initializeDashboardWelcome(win,doc,now=Date.now()){
 try{
  const time=Number(win.sessionStorage.getItem('danny-dashboard-welcome'));
  win.sessionStorage.removeItem('danny-dashboard-welcome');
  if(!time||now-time<0||now-time>=60000)return;
  doc.documentElement.classList.add('owner-welcoming');
  win.dannyDashboardWelcome={startedAt:now,fallback:win.setTimeout(()=>{
   doc.documentElement.classList.remove('owner-welcoming');
   doc.getElementById('dashboardWelcomeInitial')?.remove();
  },10000)};
 }catch{/* A restricted storage environment must never hide the workspace. */}
}

export const welcomeCriticalCss=`
html.owner-welcoming,html.owner-welcoming body{overflow:hidden}
html body.workbench>:is(.wb-sidebar,.wb-main){transition:opacity .45s ease}
html.owner-welcoming body.workbench>:is(.wb-sidebar,.wb-main){opacity:0;visibility:hidden}
.dashboard-welcome{position:fixed;inset:0;z-index:20000;display:grid;place-items:center;padding:24px;background:var(--page,#faf9f6);color:var(--ink,#14233b)}
.dashboard-welcome-content{display:grid;justify-items:center;gap:38px;width:100%;text-align:center}
.dashboard-welcome-brand{display:flex;flex-direction:column;gap:7px;font-size:25px;font-weight:800;letter-spacing:.13em;line-height:1}
.dashboard-welcome-brand small{font-size:7px;font-weight:700;letter-spacing:.24em;color:var(--muted)}
.dashboard-welcome-heading{margin:0!important;font-size:clamp(28px,4.2vw,52px)!important;font-weight:750;line-height:1.2;letter-spacing:-.035em}
.layout-text-flip{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap}
.layout-text-flip-label{display:inline-block;color:var(--ink)}
.layout-text-flip-word{display:inline-block;overflow:hidden;max-width:100%;padding:10px 18px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--price-accent,#245bc7);box-shadow:0 4px 20px #14233b08}
.layout-text-flip-value{display:inline-block;white-space:nowrap}
#dashboardWelcomeInitial{display:none}
html.owner-welcoming #dashboardWelcomeInitial{display:grid}
@media(max-width:480px){.layout-text-flip{flex-direction:column;gap:12px}.dashboard-welcome-content{gap:30px}}
@media(prefers-reduced-motion:reduce){html body.workbench>:is(.wb-sidebar,.wb-main){transition:none}}
`;

export const welcomeInitialMarkup=`<div id="dashboardWelcomeInitial" class="dashboard-welcome" role="status" aria-label="Welcome to Dashboard"><div class="dashboard-welcome-content"><div class="dashboard-welcome-brand" aria-hidden="true"><span class="brand-logo full-brand" aria-hidden="true"><img class="brand-logo-img brand-wordmark logo-dark" src="/assets/brand-wordmark-black.png" alt="" width="34" height="24" decoding="async"><img class="brand-logo-img brand-wordmark logo-light" src="/assets/brand-wordmark-white.png" alt="" width="34" height="24" decoding="async"></span><span>DANNY<small>RECON SELECT</small></span></div><p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--champagne,#c8a97e)">WELCOME BACK · WELCOME OWNER</p><h1 class="dashboard-welcome-heading"><span class="layout-text-flip"><span class="layout-text-flip-label">Welcome to</span><span class="layout-text-flip-word"><span class="layout-text-flip-value">Dashboard</span></span></span></h1></div></div>`;

export const welcomeHeadMarkup=`<style>${welcomeCriticalCss}</style><script>(${initializeDashboardWelcome.toString()})(window,document);</script>`;
