const details={
  engine:{
    title:"ENGINE",
    subtitle:"Performance hardware beneath the bonnet.",
    description:"A closer look at the vehicle's actual engine compartment and visible mechanical components. Engine output and other specifications remain unverified until stock documentation is supplied.",
    src:"assets/audi-s5/engine.webp",
    alt:"Audi S5 Avant engine bay",
    x:"35%",y:"45%"
  },
  cockpit:{
    title:"COCKPIT",
    subtitle:"Driver-focused digital cabin.",
    description:"Explore the actual right-hand-drive cockpit, steering controls, digital displays and centre console fitted to this vehicle.",
    src:"assets/audi-s5/cockpit.webp",
    alt:"Audi S5 Avant right-hand-drive cockpit",
    x:"57%",y:"34%"
  },
  wheel:{
    title:"WHEELS & BRAKES",
    subtitle:"S-design wheel and performance braking detail.",
    description:"Inspect the actual wheel design, tyre area and red S-branded front brake caliper visible on this vehicle. Wheel size and brake specifications remain to verify.",
    src:"assets/audi-s5/wheel-brake.webp",
    alt:"Audi S5 Avant wheel and red S-branded brake caliper",
    x:"31%",y:"69%"
  },
  audio:{
    title:"BANG & OLUFSEN",
    subtitle:"Premium cabin audio detail.",
    description:"A close look at the Bang & Olufsen speaker treatment visible in the photographed vehicle. Speaker count, wattage and package level are not stated without verification.",
    src:"assets/audi-s5/bang-olufsen.webp",
    alt:"Audi S5 Avant Bang and Olufsen speaker detail",
    x:"67%",y:"50%"
  }
};

const state={scene:"overview",activeDetail:null,transitioning:false,lastHotspot:null};
const shell=document.getElementById("experienceShell");
const frame=document.getElementById("experienceFrame");
const overviewImage=document.getElementById("overviewImage");
const detailImage=document.getElementById("detailImage");
const detailBack=document.getElementById("detailBack");
const sceneLabel=document.getElementById("sceneLabel");
const detailTitle=document.getElementById("detailTitle");
const detailEyebrow=document.getElementById("detailEyebrow");
const detailDescription=document.getElementById("detailDescription");
const detailCopy=document.getElementById("detailCopy");
const hotspotButtons=[...document.querySelectorAll(".vehicle-hotspot")];
const prefersReduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const transitionMs=prefersReduced?140:640;

function preloadDetail(key){
  const detail=details[key];
  if(!detail||detail.preloaded)return;
  const img=new Image();
  img.src=detail.src;
  detail.preloader=img;
  detail.preloaded=true;
}

async function ensureLoaded(detail){
  const img=detail.preloader||new Image();
  if(!detail.preloader)img.src=detail.src;
  if(img.complete&&img.naturalWidth)return;
  try{await img.decode();}catch{
    await new Promise(resolve=>{
      img.onload=resolve;
      img.onerror=resolve;
    });
  }
}

function setHotspotsDisabled(disabled){
  hotspotButtons.forEach(button=>button.disabled=disabled);
}

async function enterDetail(key,trigger){
  if(state.transitioning||state.scene!=="overview"||!details[key])return;
  const detail=details[key];
  state.transitioning=true;
  state.scene="entering";
  state.activeDetail=key;
  state.lastHotspot=trigger;
  setHotspotsDisabled(true);
  shell.dataset.scene="entering";
  frame.style.setProperty("--focus-x",detail.x);
  frame.style.setProperty("--focus-y",detail.y);
  sceneLabel.textContent="LOADING DETAIL";
  preloadDetail(key);
  await ensureLoaded(detail);

  detailImage.src=detail.src;
  detailImage.alt=detail.alt;
  detailImage.removeAttribute("aria-hidden");
  detailEyebrow.textContent=detail.title;
  detailTitle.textContent=detail.subtitle;
  detailDescription.textContent=detail.description;
  sceneLabel.textContent=detail.title;

  requestAnimationFrame(()=>{
    shell.dataset.scene="detail";
    state.scene="detail";
    window.setTimeout(()=>{
      state.transitioning=false;
      detailBack.focus({preventScroll:true});
    },transitionMs);
  });
}

function returnOverview(){
  if(state.transitioning||state.scene!=="detail")return;
  state.transitioning=true;
  state.scene="returning";
  shell.dataset.scene="returning";
  sceneLabel.textContent="OVERVIEW";

  window.setTimeout(()=>{
    detailImage.src="";
    detailImage.alt="";
    detailImage.setAttribute("aria-hidden","true");
    detailEyebrow.textContent="REAL VEHICLE DETAIL";
    detailTitle.textContent="Choose a vehicle detail.";
    detailDescription.textContent="Engine, cockpit, wheel and audio views open inside the same vehicle scene, using photographs of this actual car.";
    shell.dataset.scene="overview";
    state.scene="overview";
    state.activeDetail=null;
    state.transitioning=false;
    setHotspotsDisabled(false);
    if(state.lastHotspot)state.lastHotspot.focus({preventScroll:true});
  },transitionMs);
}

hotspotButtons.forEach(button=>{
  const key=button.dataset.detail;
  button.addEventListener("mouseenter",()=>preloadDetail(key));
  button.addEventListener("focus",()=>preloadDetail(key));
  button.addEventListener("click",()=>enterDetail(key,button));
});

detailBack.addEventListener("click",returnOverview);
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&state.scene==="detail"){
    event.preventDefault();
    returnOverview();
  }
});

const lightbox=document.getElementById("lightbox");
const lightboxImg=document.getElementById("lightboxImg");
function openLightbox(src,alt){
  lightboxImg.src=src;
  lightboxImg.alt=alt||"Audi S5 Avant detail";
  lightbox.showModal();
}

document.querySelectorAll("[data-filter]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x===btn));
    document.querySelectorAll(".tile").forEach(tile=>{
      tile.style.display=(btn.dataset.filter==="all"||tile.dataset.kind===btn.dataset.filter)?"block":"none";
    });
  });
});

document.querySelectorAll(".tile").forEach(tile=>{
  tile.addEventListener("click",()=>{
    if(tile.classList.contains("missing"))return;
    const image=tile.querySelector("img");
    if(image)openLightbox(image.src,image.alt);
  });
});

document.getElementById("closeLightbox").addEventListener("click",()=>lightbox.close());
lightbox.addEventListener("click",event=>{if(event.target===lightbox)lightbox.close()});

const enquiry=document.getElementById("enquiry");
document.getElementById("demoEnquiry").addEventListener("click",()=>enquiry.showModal());
document.getElementById("closeEnquiry").addEventListener("click",()=>enquiry.close());
enquiry.addEventListener("click",event=>{if(event.target===enquiry)enquiry.close()});
