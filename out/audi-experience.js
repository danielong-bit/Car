// ==========================================================================
// Japan Recon Car Gallery — Audi S5 Avant 16:9 Interactive Viewer
// ==========================================================================

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
const ROOT = "assets/audi-s5/";

// Viewer Hotspots Configuration (Videos & Images)
let viewerConfig = [
  // --- VIDEO HOTSPOTS ---
  {
    id: "engine",
    label: "Engine",
    type: "video",
    x: "72%",
    y: "46%",
    forwardVideo: "assets/videos/engine_forward.mp4",
    reverseVideo: "assets/videos/engine_reverse_web.mp4",
    title: "V6 TFSI Engine Bay",
    eyebrow: "POWERTRAIN",
    description: "Move beneath the bonnet to reveal the 3.0-litre turbocharged V6 powerplant, carbon-accented engine cover, and precision cooling architecture.",
    specs: [
      ["Engine", "3.0L TFSI V6 Turbo"],
      ["Power", "349 hp (demo)"],
      ["Torque", "500 Nm (demo)"],
      ["Transmission", "8-speed Tiptronic (demo)"]
    ]
  },
  {
    id: "interior",
    label: "Interior",
    type: "video",
    x: "54%",
    y: "38%",
    forwardVideo: "assets/videos/interior_forward.mp4",
    reverseVideo: "assets/videos/interior_reverse.mp4",
    title: "Inside the S5 Avant",
    eyebrow: "CABIN & COCKPIT",
    description: "Step into the driver-focused cabin featuring digital instrumentation, S sport steering wheel, ambient lighting, and refined tactile controls.",
    specs: [
      ["Steering layout", "Right-hand drive"],
      ["Driver display", "Audi Virtual Cockpit"],
      ["Trim", "Matte Brushed Aluminum"],
      ["Pedals", "Stainless steel S sport pedals"]
    ]
  },
  {
    id: "boot",
    label: "Boot / Trunk",
    type: "video",
    x: "24%",
    y: "44%",
    forwardVideo: "assets/videos/boot_forward.mp4",
    reverseVideo: "assets/videos/boot_reverse_web.mp4",
    title: "Cargo Area & Powered Tailgate",
    eyebrow: "STORAGE & UTILITY",
    description: "Open the powered rear tailgate revealing the estate cargo hold with illuminated side liners, luggage tie-downs, and 40:20:40 split-folding rear seats.",
    specs: [
      ["Tailgate", "Power opening / closing"],
      ["Cargo capacity", "465L - 1,495L"],
      ["Seat folding", "40:20:40 split"],
      ["Load threshold", "Stainless steel guard"]
    ]
  },

  // --- STATIC IMAGE HOTSPOTS ---
  {
    id: "wheel",
    label: "Wheel",
    type: "image",
    x: "78%",
    y: "74%",
    imageSrc: ROOT + "wheel_16x9.jpg",
    title: "Wheel, Brake & Tyre Setup",
    eyebrow: "CHASSIS & BRAKES",
    description: "Multi-spoke S-design alloy wheels equipped with high-performance ventilated brake discs and red S-branded front multi-piston calipers.",
    specs: [
      ["Wheel size", "20-inch S-design"],
      ["Brake caliper", "Red S-branded caliper"],
      ["Brake disc", "Ventilated performance disc"],
      ["Tyre profile", "255/35 R20"]
    ]
  },
  {
    id: "dashboard",
    label: "Dashboard",
    type: "image",
    x: "62%",
    y: "36%",
    imageSrc: ROOT + "dashboard_16x9.jpg",
    title: "Driver Dashboard & Virtual Cockpit",
    eyebrow: "DIGITAL COCKPIT",
    description: "Driver-oriented curved MMI touch display paired with full digital instrument cluster and configurable navigation views.",
    specs: [
      ["Cluster", "12.3-inch Virtual Cockpit"],
      ["Central MMI", "10.1-inch High-res Touch"],
      ["Connectivity", "Apple CarPlay & Android Auto"],
      ["Interface", "Audi MMI Touch Response"]
    ]
  },
  {
    id: "seats",
    label: "Seats",
    type: "image",
    x: "48%",
    y: "42%",
    imageSrc: ROOT + "seats_16x9.jpg",
    title: "S Sport Contoured Seats",
    eyebrow: "INTERIOR SEATING",
    description: "Contoured sport seats upholstered in fine Nappa leather with diamond quilting, embossed S logos and integrated pneumatic side bolstering.",
    specs: [
      ["Upholstery", "Fine Nappa Leather"],
      ["Stitching", "Diamond pattern with S logo"],
      ["Adjustment", "14-way electric with memory"],
      ["Heating", "Multi-stage front seat heating"]
    ]
  },
  {
    id: "audio",
    label: "Bang & Olufsen",
    type: "image",
    x: "65%",
    y: "46%",
    imageSrc: ROOT + "audio_16x9.jpg",
    title: "Bang & Olufsen 3D Sound",
    eyebrow: "PREMIUM AUDIO",
    description: "Bang & Olufsen 3D Sound System with precision-etched acoustic grilles, 19 speakers, 16-channel amplifier and 755 watts output.",
    specs: [
      ["Brand", "Bang & Olufsen"],
      ["Speakers", "19 high-performance speakers"],
      ["Amplifier", "16-channel 755W DSP"],
      ["Sound dimension", "3D Sound spatial algorithm"]
    ]
  },
  {
    id: "climate",
    label: "Rear climate controls",
    type: "image",
    x: "38%",
    y: "46%",
    imageSrc: ROOT + "climate_16x9.jpg",
    title: "Deluxe 3-Zone Climate Control",
    eyebrow: "REAR CABIN COMFORT",
    description: "Independent rear-seat climate adjustment console with dedicated digital temperature display, air direction dials and dual USB-C charging ports.",
    specs: [
      ["Zones", "3-zone automatic climate"],
      ["Controls", "Digital rear display & touch dials"],
      ["Air filtration", "Fine particulate pollen filter"],
      ["Ports", "Dual fast-charge USB-C"]
    ]
  }
];

// Default Overview State Copy
const overviewCopy = {
  eyebrow: "VEHICLE OVERVIEW",
  title: "Choose what you want to inspect.",
  description: "Click any hotspot on the car to inspect the engine bay, cabin interior, powered tailgate boot, wheel hardware, audio system, or rear climate controls.",
  specs: [
    ["Model", "Audi S5 Avant"],
    ["Body style", "Performance Estate"],
    ["Exterior colour", "Daytona Grey Metallic"],
    ["Viewer ratio", "16:9 Responsive"]
  ]
};

// Application State
const state = {
  mode: "normal", // "normal" | "video" | "reverse" | "image"
  activeItem: null,
  isAnimating: false,
  lastTrigger: null
};

// DOM References
const mediaPlane = document.getElementById("mediaPlane");
const overviewImage = document.getElementById("overviewImage");
const viewerVideo = document.getElementById("viewerVideo");
const detailImage = document.getElementById("detailImage");
const viewerBackBtn = document.getElementById("viewerBackBtn");
const viewerHotspots = document.getElementById("hotspots");
const viewerSubHotspots = document.getElementById("subHotspots");
const sceneLabel = document.getElementById("sceneLabel");
const detailStatus = document.getElementById("detailStatus");
const detailEyebrow = document.getElementById("detailEyebrow");
const detailTitle = document.getElementById("detailTitle");
const detailDescription = document.getElementById("detailDescription");
const tourSubnav = document.getElementById("tourSubnav");
const tourSpecs = document.getElementById("tourSpecs");
const detailBack = document.getElementById("detailBack");
const shell = document.getElementById("experienceShell");

// Helper: Normalize Percentage Coordinate
function toPercent(val) {
  if (typeof val === "number") return `${val}%`;
  if (typeof val === "string") return val.trim().endsWith("%") ? val.trim() : `${val}%`;
  return "50%";
}

// Preload Video and Image Assets
function preloadAssets() {
  // Media is loaded only when a customer selects a feature.
}

// Render Spec Rows in Side Panel
function renderSpecs(rows = []) {
  if (!tourSpecs) return;
  tourSpecs.innerHTML = rows.map(([key, value]) => `
    <div class="tour-spec-row">
      <span>${key}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

// Apply Text Copy to Panel
function applyCopy(item) {
  if (detailEyebrow) detailEyebrow.textContent = item.eyebrow || "SPECIFICATION";
  if (detailTitle) detailTitle.textContent = item.title || item.label || "";
  const descriptions = {
    engine: 'View the engine bay opening.',
    interior: 'View the cabin and driver controls.',
    boot: 'See the tailgate opening and cargo space.',
    wheel: 'Take a closer look at the wheel and red brake caliper.',
    dashboard: 'View the dashboard and digital instrument display.',
    seats: 'See the seat shape, upholstery and stitching.',
    audio: 'View the Bang & Olufsen speaker detail.',
    climate: 'View the rear-seat climate controls.'
  };
  if (detailDescription) detailDescription.textContent = descriptions[item.id] || item.description || '';
  renderSpecs(item.specs || []);
}

// Reset Copy to Default Overview
function resetOverviewCopy() {
  applyCopy(overviewCopy);
  renderSubnav();
}

// Render Filter / Subnav Shortcuts
function renderSubnav(activeId = null) {
  if (!tourSubnav) return;
  tourSubnav.innerHTML = viewerConfig.map(item => `
    <button type="button" 
      data-id="${item.id}" 
      class="${activeId === item.id ? 'active' : ''}"
      title="${item.label} (${item.type})">
      ${item.label}${item.type === 'video' ? ' ▶' : ''}
    </button>
  `).join("");

  tourSubnav.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const target = findConfigItem(id);
      if (target) selectHotspot(target, btn);
    });
  });
}

function findConfigItem(id) {
  if (!id) return null;
  const cleanId = String(id).toLowerCase().trim();
  return viewerConfig.find(c => 
    c.id.toLowerCase() === cleanId ||
    (cleanId === "trunk" && c.id === "boot") ||
    (cleanId === "boot" && c.id === "boot") ||
    (cleanId === "bang-olufsen" && c.id === "audio") ||
    (cleanId === "rear-climate" && c.id === "climate")
  );
}

// Render All Hotspots on 16:9 Viewer
function renderHotspots() {
  if (!viewerHotspots) return;
  viewerHotspots.innerHTML = viewerConfig.map(item => {
    const left = toPercent(item.x);
    const top = toPercent(item.y);
    const isVideo = item.type === "video";
    return `
      <button class="vehicle-hotspot" 
        type="button" 
        data-id="${item.id}" 
        data-type="${item.type}"
        style="left: ${left}; top: ${top};" 
        aria-label="Inspect ${item.label} (${isVideo ? 'video animation' : 'detail image'})">
        <span class="hotspot-dot">
          ${isVideo ? '<span class="hotspot-video-badge">▶</span>' : '<span class="hotspot-plus">+</span>'}
        </span>
        <span class="hotspot-label">
          ${item.label}
          <span class="hotspot-label-type">${isVideo ? 'Video' : 'Detail'}</span>
        </span>
      </button>
    `;
  }).join("");

  viewerHotspots.querySelectorAll(".vehicle-hotspot").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const item = findConfigItem(id);
      if (item) selectHotspot(item, btn);
    });
  });
}

// Core Selector Dispatcher
function selectHotspot(item, trigger = null) {
  if (state.isAnimating) return;
  state.lastTrigger = trigger;
  if (item.type === "video") {
    playForwardVideo(item);
  } else {
    showStaticImage(item);
  }
}

// --------------------------------------------------------------------------
// 2. VIDEO HOTSPOT WORKFLOW
// --------------------------------------------------------------------------
async function playForwardVideo(item) {
  if (state.isAnimating) return;
  state.isAnimating = true;
  state.activeItem = item;
  state.mode = "video";

  // 1. Hide all hotspots immediately
  viewerHotspots.classList.add("hotspots-hidden");
  viewerBackBtn.classList.add("is-visible");
  if (detailBack) detailBack.classList.add("is-visible");

  // 2. Update descriptive metadata and titles
  applyCopy(item);
  renderSubnav(item.id);
  if (sceneLabel) sceneLabel.textContent = item.label.toUpperCase() + " · PLAYING";
  if (detailStatus) detailStatus.innerHTML = `<span>ACTIVE ANIMATION</span><strong>Inspecting ${item.label}</strong>`;

  // 3. Prepare video in the exact same 16:9 container
  viewerVideo.pause();
  viewerVideo.removeAttribute("src");
  viewerVideo.load();
  viewerVideo.src = item.forwardVideo;
  viewerVideo.currentTime = 0;

  // 4. Reveal video over main image
  mediaPlane.classList.add("is-video-active");
  mediaPlane.classList.remove("is-image-active");

  try {
    await viewerVideo.play();
  } catch (err) {
    if (state.activeItem === item && state.mode === "video") recoverViewerVideo();
  }
}

// --------------------------------------------------------------------------
// 6. STATIC IMAGE HOTSPOT WORKFLOW
// --------------------------------------------------------------------------
function showStaticImage(item) {
  if (state.isAnimating) return;
  state.isAnimating = true;
  state.activeItem = item;
  state.mode = "image";

  // Hide hotspots immediately
  viewerHotspots.classList.add("hotspots-hidden");
  viewerBackBtn.classList.remove("is-visible");
  if (detailBack) detailBack.classList.remove("is-visible");

  // Update descriptive metadata
  applyCopy(item);
  renderSubnav(item.id);
  if (sceneLabel) sceneLabel.textContent = item.label.toUpperCase();
  if (detailStatus) detailStatus.innerHTML = `<span>VIEWING DETAIL</span><strong>${item.title || item.label}</strong>`;

  // Display detail image in exact 16:9 bounds
  detailImage.src = item.imageSrc;
  detailImage.alt = item.title || item.label;
  detailImage.removeAttribute("aria-hidden");

  mediaPlane.classList.add("is-image-active");
  mediaPlane.classList.remove("is-video-active");

  // Reveal Back button over viewer
  setTimeout(() => {
    if (state.activeItem !== item) return;
    viewerBackBtn.classList.add("is-visible");
    if (!window.matchMedia('(max-width: 820px)').matches) viewerBackBtn.focus({ preventScroll: true });
    if (detailBack) detailBack.classList.add("is-visible");
    state.isAnimating = false;
    renderExperienceSubHotspots(item);
  }, 220);
}

// --------------------------------------------------------------------------
// Sub-Hotspots Renderer for Detailed Views
// --------------------------------------------------------------------------
function renderExperienceSubHotspots(item) {
  if (!viewerSubHotspots) return;
  viewerSubHotspots.innerHTML = "";
  if (!item || !Array.isArray(item.subHotspots) || item.subHotspots.length === 0) {
    viewerSubHotspots.style.display = "none";
    viewerSubHotspots.classList.add("sub-hidden");
    return;
  }
  viewerSubHotspots.style.display = "block";
  viewerSubHotspots.classList.remove("sub-hidden");

  item.subHotspots.forEach(sub => {
    const left = toPercent(sub.x);
    const top = toPercent(sub.y);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sub-hotspot-pin";
    btn.style.left = left;
    btn.style.top = top;
    btn.setAttribute("aria-label", `Inspect ${sub.label}`);

    btn.innerHTML = `
      <span class="sub-pin-dot">✦</span>
      <span class="sub-pin-label">${escapeHtml(sub.label || sub.id)}</span>
    `;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectExperienceSubHotspot(sub, btn);
    });

    viewerSubHotspots.appendChild(btn);
  });
}

function selectExperienceSubHotspot(sub, btn) {
  if (viewerSubHotspots) {
    viewerSubHotspots.querySelectorAll(".sub-hotspot-pin").forEach(b => b.classList.remove("is-active"));
  }
  if (btn) btn.classList.add("is-active");

  applyCopy({
    eyebrow: sub.eyebrow || (state.activeItem ? state.activeItem.label : "FEATURE DETAIL"),
    title: sub.title || sub.label || sub.id,
    description: sub.description || "Detailed specification inspection.",
    specs: sub.specs || []
  });

  if (sceneLabel) sceneLabel.textContent = (sub.label || sub.id).toUpperCase() + " · SUB-DETAIL";
  if (detailStatus) detailStatus.innerHTML = `<span>INSPECTING</span><strong>${sub.title || sub.label}</strong>`;
}

function clearExperienceSubHotspots() {
  if (viewerSubHotspots) {
    viewerSubHotspots.innerHTML = "";
    viewerSubHotspots.style.display = "none";
    viewerSubHotspots.classList.add("sub-hidden");
  }
}

// --------------------------------------------------------------------------
// 3 & 4. VIDEO END & BACK REVERSE WORKFLOW
// --------------------------------------------------------------------------
viewerVideo.addEventListener("ended", () => {
  if (state.mode === "video" && state.activeItem) {
    state.isAnimating = false;
    viewerBackBtn.classList.add("is-visible");
    if (!window.matchMedia('(max-width: 820px)').matches) viewerBackBtn.focus({ preventScroll: true });
    if (detailBack) detailBack.classList.add("is-visible");
    if (sceneLabel) sceneLabel.textContent = state.activeItem.label.toUpperCase() + " · COMPLETED";
    if (detailStatus) detailStatus.innerHTML = `<span>COMPLETED</span><strong>Use Back to car to return</strong>`;
    renderExperienceSubHotspots(state.activeItem);
  } else if (state.mode === "reverse") {
    finishReturnToOverview();
  }
});

viewerVideo.addEventListener("error", (e) => {
  if (state.mode === "reverse") finishReturnToOverview();
  else if (state.mode === "video") recoverViewerVideo();
});

// Back Handler: Plays Reverse Animation or Smoothly Fades Back
function recoverViewerVideo() {
  const item = state.activeItem;
  if (!item) return;
  viewerVideo.pause();
  state.isAnimating = false;
  const photos = {engine: 'engine', interior: 'dashboard', boot: 'boot'};
  showStaticImage({...item, type: 'image', imageSrc: ROOT + (photos[item.id] || 'main-car-16x9') + (photos[item.id] ? '_16x9.jpg' : '.jpg')});
  document.dispatchEvent(new CustomEvent('viewermediaerror', {detail: 'Video unavailable. Showing a photo instead.'}));
}

async function handleBack() {
  if (state.isAnimating || state.mode === "reverse") { finishReturnToOverview(); return; }
  state.isAnimating = true;

  clearExperienceSubHotspots();
  viewerBackBtn.classList.add("is-visible");
  if (detailBack) detailBack.classList.add("is-visible");

  const item = state.activeItem;

  if (state.mode === "video" && item) {
    if (item.reverseVideo) {
      state.mode = "reverse";
      if (sceneLabel) sceneLabel.textContent = "CLOSING · REVERSE";
      if (detailStatus) detailStatus.innerHTML = `<span>RETURNING</span><strong>Restoring overview</strong>`;

      viewerVideo.pause();
      viewerVideo.src = item.reverseVideo;
      viewerVideo.currentTime = 0;

      try {
        await viewerVideo.play();
      } catch (err) {
        console.warn("Reverse playback notice:", err);
        finishReturnToOverview();
      }
    } else {
      finishReturnToOverview();
    }
  } else if (state.mode === "image") {
    finishReturnToOverview();
  } else {
    state.isAnimating = false;
  }
}

// Restore Original Main 16:9 Image & Hotspots
function finishReturnToOverview() {
  viewerBackBtn.classList.remove("is-visible");
  if (detailBack) detailBack.classList.remove("is-visible");
  if (typeof resetExperienceZoom === "function") resetExperienceZoom(true);
  clearExperienceSubHotspots();
  mediaPlane.classList.remove("is-video-active", "is-image-active");
  viewerVideo.pause();
  viewerVideo.removeAttribute("src");
  viewerVideo.load();

  if (detailImage) {
    detailImage.removeAttribute("src");
    detailImage.setAttribute("aria-hidden", "true");
  }

  // Restore copy to overview
  resetOverviewCopy();

  // Restore all hotspots
  viewerHotspots.classList.remove("hotspots-hidden");

  state.activeItem = null;
  state.mode = "normal";
  state.isAnimating = false;

  if (sceneLabel) sceneLabel.textContent = "OVERVIEW";
  if (detailStatus) detailStatus.innerHTML = `<span>SELECT A PART</span><strong>Click a hotspot to start inspection</strong>`;

  if (state.lastTrigger && typeof state.lastTrigger.focus === "function") {
    state.lastTrigger.focus({ preventScroll: true });
  }
}

// --------------------------------------------------------------------------
// Event Listeners & Keyboard Navigation
// --------------------------------------------------------------------------
if (viewerBackBtn) viewerBackBtn.addEventListener("click", handleBack);
if (detailBack) detailBack.addEventListener("click", handleBack);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !document.querySelector("dialog[open]") && (state.mode === "video" || state.mode === "image" || viewerBackBtn.classList.contains("is-visible"))) {
    e.preventDefault();
    handleBack();
  }
});

// --------------------------------------------------------------------------
// Photo Gallery Tabs, Lightbox & Demo Enquiry Modal
// --------------------------------------------------------------------------
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

function openLightbox(src, alt) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || "Audi S5 Avant detail";
  lightbox.showModal();
}

document.querySelectorAll("[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach(x => x.classList.toggle("active", x === btn));
    document.querySelectorAll(".tile").forEach(tile => {
      tile.style.display = (btn.dataset.filter === "all" || tile.dataset.kind === btn.dataset.filter) ? "block" : "none";
    });
  });
});

document.querySelectorAll(".tile").forEach(tile => {
  tile.addEventListener("click", () => {
    if (tile.classList.contains("missing")) return;
    const image = tile.querySelector("img");
    if (image) openLightbox(image.src, image.alt);
  });
});

const closeLightboxBtn = document.getElementById("closeLightbox");
if (closeLightboxBtn) closeLightboxBtn.addEventListener("click", () => lightbox.close());
if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });
}

const enquiry = document.getElementById("enquiry");
const demoEnquiryBtn = document.getElementById("demoEnquiry");
const closeEnquiryBtn = document.getElementById("closeEnquiry");

if (demoEnquiryBtn && enquiry) {
  demoEnquiryBtn.addEventListener("click", () => enquiry.showModal());
}
if (closeEnquiryBtn && enquiry) {
  closeEnquiryBtn.addEventListener("click", () => enquiry.close());
}
if (enquiry) {
  enquiry.addEventListener("click", (e) => {
    if (e.target === enquiry) enquiry.close();
  });
}

// ==========================================================================
// Pinch-to-Zoom & Pan Gesture Controller for Dedicated Audi Experience
// ==========================================================================
const mediaZoomCanvas = document.getElementById("mediaZoomCanvas");
const mediaZoomPill = document.getElementById("mediaZoomPill");
const mediaZoomValue = document.getElementById("mediaZoomValue");

const expZoomState = {
  scale: 1,
  panX: 0,
  panY: 0,
  isPinching: false,
  isPanning: false,
  startDistance: 0,
  startScale: 1,
  startPan: { x: 0, y: 0 },
  startTouch: { x: 0, y: 0 },
  lastTapTime: 0
};

function getExpDistance(t1, t2) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

function updateExpZoomTransform(animate = false) {
  if (!mediaZoomCanvas) return;
  if (animate) {
    mediaZoomCanvas.classList.add("is-animating-zoom");
    setTimeout(() => mediaZoomCanvas.classList.remove("is-animating-zoom"), 300);
  } else {
    mediaZoomCanvas.classList.remove("is-animating-zoom");
  }

  mediaZoomCanvas.style.transform = `translate3d(${expZoomState.panX}px, ${expZoomState.panY}px, 0) scale(${expZoomState.scale})`;

  if (mediaPlane) {
    mediaPlane.classList.toggle("is-zoomed", expZoomState.scale > 1.05);
  }

  if (mediaZoomPill) {
    if (expZoomState.scale > 1.05) {
      mediaZoomPill.classList.add("is-visible");
      if (mediaZoomValue) mediaZoomValue.textContent = `${expZoomState.scale.toFixed(1)}x`;
    } else {
      mediaZoomPill.classList.remove("is-visible");
    }
  }
}

function clampExpPan() {
  if (!mediaPlane) return;
  const rect = mediaPlane.getBoundingClientRect();
  const maxPanX = Math.max(0, ((expZoomState.scale - 1) * rect.width) / 2);
  const maxPanY = Math.max(0, ((expZoomState.scale - 1) * rect.height) / 2);
  expZoomState.panX = Math.max(-maxPanX, Math.min(maxPanX, expZoomState.panX));
  expZoomState.panY = Math.max(-maxPanY, Math.min(maxPanY, expZoomState.panY));
}

function resetExperienceZoom(animate = true) {
  expZoomState.scale = 1;
  expZoomState.panX = 0;
  expZoomState.panY = 0;
  expZoomState.isPinching = false;
  expZoomState.isPanning = false;
  updateExpZoomTransform(animate);
}

function initExperienceZoom() {
  if (!mediaPlane || !mediaZoomCanvas) return;

  mediaPlane.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      expZoomState.isPinching = true;
      expZoomState.isPanning = false;
      expZoomState.startDistance = getExpDistance(e.touches[0], e.touches[1]);
      expZoomState.startScale = expZoomState.scale;
      e.preventDefault();
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - expZoomState.lastTapTime < 320) {
        e.preventDefault();
        if (expZoomState.scale > 1.1) {
          resetExperienceZoom(true);
        } else {
          const rect = mediaPlane.getBoundingClientRect();
          const touchX = e.touches[0].clientX - rect.left - rect.width / 2;
          const touchY = e.touches[0].clientY - rect.top - rect.height / 2;
          expZoomState.scale = 2.2;
          expZoomState.panX = -touchX * 0.8;
          expZoomState.panY = -touchY * 0.8;
          clampExpPan();
          updateExpZoomTransform(true);
        }
        expZoomState.lastTapTime = 0;
        return;
      }
      expZoomState.lastTapTime = now;

      if (expZoomState.scale > 1.05) {
        expZoomState.isPanning = true;
        expZoomState.startTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        expZoomState.startPan = { x: expZoomState.panX, y: expZoomState.panY };
      }
    }
  }, { passive: false });

  mediaPlane.addEventListener("touchmove", (e) => {
    if (expZoomState.isPinching && e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = getExpDistance(e.touches[0], e.touches[1]);
      if (expZoomState.startDistance > 0) {
        const factor = currentDistance / expZoomState.startDistance;
        expZoomState.scale = Math.min(3.8, Math.max(1, expZoomState.startScale * factor));
        clampExpPan();
        updateExpZoomTransform(false);
      }
    } else if (expZoomState.isPanning && e.touches.length === 1 && expZoomState.scale > 1.05) {
      e.preventDefault();
      const dx = e.touches[0].clientX - expZoomState.startTouch.x;
      const dy = e.touches[0].clientY - expZoomState.startTouch.y;
      expZoomState.panX = expZoomState.startPan.x + dx;
      expZoomState.panY = expZoomState.startPan.y + dy;
      clampExpPan();
      updateExpZoomTransform(false);
    }
  }, { passive: false });

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      expZoomState.isPinching = false;
    }
    if (e.touches.length === 0) {
      expZoomState.isPanning = false;
      if (expZoomState.scale < 1.05) {
        resetExperienceZoom(true);
      } else {
        clampExpPan();
        updateExpZoomTransform(true);
      }
    }
  };

  mediaPlane.addEventListener("touchend", handleTouchEnd);
  mediaPlane.addEventListener("touchcancel", handleTouchEnd);

  // Desktop Mouse Drag to pan when zoomed
  let isMouseDragging = false;
  let mouseStart = { x: 0, y: 0 };
  let mouseStartPan = { x: 0, y: 0 };

  mediaPlane.addEventListener("mousedown", (e) => {
    if (expZoomState.scale > 1.05 && e.button === 0 && !e.target.closest("button")) {
      isMouseDragging = true;
      mouseStart = { x: e.clientX, y: e.clientY };
      mouseStartPan = { x: expZoomState.panX, y: expZoomState.panY };
      mediaPlane.style.cursor = "grabbing";
      e.preventDefault();
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (isMouseDragging && expZoomState.scale > 1.05) {
      const dx = e.clientX - mouseStart.x;
      const dy = e.clientY - mouseStart.y;
      expZoomState.panX = mouseStartPan.x + dx;
      expZoomState.panY = mouseStartPan.y + dy;
      clampExpPan();
      updateExpZoomTransform(false);
    }
  });

  window.addEventListener("mouseup", () => {
    if (isMouseDragging) {
      isMouseDragging = false;
      if (mediaPlane) mediaPlane.style.cursor = "";
    }
  });

  mediaPlane.addEventListener("wheel", (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.01;
      expZoomState.scale = Math.min(3.8, Math.max(1, expZoomState.scale + zoomDelta));
      if (expZoomState.scale <= 1.05) {
        resetExperienceZoom(true);
      } else {
        clampExpPan();
        updateExpZoomTransform(false);
      }
    }
  }, { passive: false });

  if (mediaZoomPill) {
    mediaZoomPill.addEventListener("click", (e) => {
      e.stopPropagation();
      resetExperienceZoom(true);
    });
  }
}

// ==========================================================================
// V6 TFSI Engine Exhaust Sound Synthesizer (Web Audio API)
// ==========================================================================

let audioCtx = null;
let activeEngineSound = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function stopV6EngineSound() {
  if (activeEngineSound) {
    try {
      activeEngineSound.stop();
    } catch (e) {}
    activeEngineSound = null;
  }

  const waveBars = document.getElementById("soundWaveBars");
  const statusDot = document.getElementById("soundStatusDot");
  const statusText = document.getElementById("soundStatusText");
  const buttons = document.querySelectorAll(".exhaust-sound-player .sound-btn");

  if (waveBars) waveBars.classList.remove("is-playing");
  if (statusDot) statusDot.classList.remove("active");
  buttons.forEach(b => b.classList.remove("is-active"));
  if (statusText) statusText.textContent = "Playback stopped · System ready";
}

function playV6EngineSound(mode = "rev") {
  stopV6EngineSound();
  const ctx = getAudioContext();
  if (!ctx) return;

  const waveBars = document.getElementById("soundWaveBars");
  const statusDot = document.getElementById("soundStatusDot");
  const statusText = document.getElementById("soundStatusText");
  const activeBtn = document.querySelector(`.exhaust-sound-player [data-mode="${mode}"]`);

  if (waveBars) waveBars.classList.add("is-playing");
  if (statusDot) statusDot.classList.add("active");
  if (activeBtn) activeBtn.classList.add("is-active");

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  // V6 Engine fundamental frequency: at 800 RPM idle, V6 firing frequency = 800/60 * 3 = 40Hz
  // Harmonic overtone profile for Audi 3.0 TFSI Hot-V Twin-Scroll exhaust rumble
  const osc1 = ctx.createOscillator(); // Sub-bass rumble
  const osc2 = ctx.createOscillator(); // Mid exhaust resonance
  const osc3 = ctx.createOscillator(); // High rasp / turbo whistle

  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  const gain3 = ctx.createGain();

  // Noise generator for exhaust air hiss & crackle
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(320, now);
  noiseFilter.Q.setValueAtTime(3.0, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.04, now);

  whiteNoise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);

  osc1.type = "sawtooth";
  osc2.type = "triangle";
  osc3.type = "sine";

  // Lowpass filter for deep exhaust tone
  const exhaustFilter = ctx.createBiquadFilter();
  exhaustFilter.type = "lowpass";
  exhaustFilter.frequency.setValueAtTime(220, now);
  exhaustFilter.Q.setValueAtTime(2.5, now);

  osc1.connect(gain1);
  osc2.connect(gain2);
  gain1.connect(exhaustFilter);
  gain2.connect(exhaustFilter);
  exhaustFilter.connect(masterGain);

  osc3.connect(gain3);
  gain3.connect(masterGain);

  let duration = 5.0;

  if (mode === "cold_start") {
    if (statusText) statusText.textContent = "V6 TFSI Cold Start: Starter crank → 1,400 RPM roar";
    duration = 5.5;

    // Starter motor crank (0 to 0.7s)
    osc1.frequency.setValueAtTime(28, now);
    osc2.frequency.setValueAtTime(56, now);
    osc3.frequency.setValueAtTime(110, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain2.gain.setValueAtTime(0.05, now);
    gain3.gain.setValueAtTime(0.02, now);
    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.linearRampToValueAtTime(0.12, now + 0.6);

    // Ignition Roar at 0.75s (flare up to 75Hz / 1,500 RPM)
    osc1.frequency.exponentialRampToValueAtTime(82, now + 1.1);
    osc2.frequency.exponentialRampToValueAtTime(164, now + 1.1);
    osc3.frequency.exponentialRampToValueAtTime(328, now + 1.1);
    exhaustFilter.frequency.exponentialRampToValueAtTime(450, now + 1.1);
    masterGain.gain.exponentialRampToValueAtTime(0.35, now + 1.1);

    // Settle down to high-idle (55Hz / 1,100 RPM)
    osc1.frequency.exponentialRampToValueAtTime(52, now + 3.0);
    osc2.frequency.exponentialRampToValueAtTime(104, now + 3.0);
    osc3.frequency.exponentialRampToValueAtTime(208, now + 3.0);
    exhaustFilter.frequency.exponentialRampToValueAtTime(260, now + 3.0);
    masterGain.gain.linearRampToValueAtTime(0.22, now + 3.2);

    // Fade out at end
    masterGain.gain.setValueAtTime(0.22, now + 4.8);
    masterGain.gain.linearRampToValueAtTime(0.001, now + duration);

  } else if (mode === "idle") {
    if (statusText) statusText.textContent = "V6 TFSI Warm Idle: Steady 750 RPM quad-pipe purr";
    duration = 6.0;

    // Smooth deep idle rumble around 38Hz (760 RPM firing freq)
    osc1.frequency.setValueAtTime(38, now);
    osc2.frequency.setValueAtTime(76, now);
    osc3.frequency.setValueAtTime(152, now);

    gain1.gain.setValueAtTime(0.24, now);
    gain2.gain.setValueAtTime(0.18, now);
    gain3.gain.setValueAtTime(0.04, now);
    exhaustFilter.frequency.setValueAtTime(180, now);

    // Subtle gentle RPM fluctuation (+/- 1Hz)
    osc1.frequency.linearRampToValueAtTime(40, now + 1.5);
    osc1.frequency.linearRampToValueAtTime(37, now + 3.2);
    osc1.frequency.linearRampToValueAtTime(39, now + 4.8);

    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.linearRampToValueAtTime(0.28, now + 0.4);
    masterGain.gain.setValueAtTime(0.28, now + 5.3);
    masterGain.gain.linearRampToValueAtTime(0.001, now + duration);

  } else {
    // Dynamic Rev mode with exhaust overrun pops
    if (statusText) statusText.textContent = "V6 TFSI Dynamic Rev: Throttle burst → Overrun burble";
    duration = 5.2;

    // Start at warm idle (38Hz)
    osc1.frequency.setValueAtTime(38, now);
    osc2.frequency.setValueAtTime(76, now);
    osc3.frequency.setValueAtTime(152, now);
    masterGain.gain.setValueAtTime(0.15, now);

    // Rapid throttle blip up to 180Hz (3,600 RPM)
    osc1.frequency.exponentialRampToValueAtTime(190, now + 1.1);
    osc2.frequency.exponentialRampToValueAtTime(380, now + 1.1);
    osc3.frequency.exponentialRampToValueAtTime(760, now + 1.1);
    exhaustFilter.frequency.exponentialRampToValueAtTime(680, now + 1.1);
    masterGain.gain.linearRampToValueAtTime(0.42, now + 1.1);

    // Secondary rev up to 220Hz (4,400 RPM)
    osc1.frequency.exponentialRampToValueAtTime(235, now + 2.2);
    osc2.frequency.exponentialRampToValueAtTime(470, now + 2.2);
    osc3.frequency.exponentialRampToValueAtTime(940, now + 2.2);
    exhaustFilter.frequency.exponentialRampToValueAtTime(850, now + 2.2);
    masterGain.gain.linearRampToValueAtTime(0.48, now + 2.2);

    // Overrun overrun burble & drop back to idle
    osc1.frequency.exponentialRampToValueAtTime(42, now + 3.8);
    osc2.frequency.exponentialRampToValueAtTime(84, now + 3.8);
    osc3.frequency.exponentialRampToValueAtTime(168, now + 3.8);
    exhaustFilter.frequency.exponentialRampToValueAtTime(210, now + 3.8);
    masterGain.gain.linearRampToValueAtTime(0.22, now + 3.8);

    masterGain.gain.setValueAtTime(0.22, now + 4.6);
    masterGain.gain.linearRampToValueAtTime(0.001, now + duration);
  }

  whiteNoise.start(now);
  osc1.start(now);
  osc2.start(now);
  osc3.start(now);

  const stopTimer = setTimeout(() => {
    stopV6EngineSound();
  }, duration * 1000);

  activeEngineSound = {
    stop: () => {
      clearTimeout(stopTimer);
      try {
        whiteNoise.stop();
        osc1.stop();
        osc2.stop();
        osc3.stop();
      } catch (e) {}
    }
  };
}

function initV6SoundPlayer() {
  const coldStartBtn = document.getElementById("soundColdStartBtn");
  const idleBtn = document.getElementById("soundIdleBtn");
  const revBtn = document.getElementById("soundRevBtn");
  const stopBtn = document.getElementById("soundStopBtn");

  if (coldStartBtn) {
    coldStartBtn.addEventListener("click", () => playV6EngineSound("cold_start"));
  }
  if (idleBtn) {
    idleBtn.addEventListener("click", () => playV6EngineSound("idle"));
  }
  if (revBtn) {
    revBtn.addEventListener("click", () => playV6EngineSound("rev"));
  }
  if (stopBtn) {
    stopBtn.addEventListener("click", stopV6EngineSound);
  }
}

// Dynamic Admin Configuration Loader
async function loadDynamicConfig() {
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.hotspots)) {
        applyLoadedConfig(data);
        return;
      }
    }
  } catch (e) {
    console.debug("Config fetch from server skipped, trying localStorage:", e);
  }

  const local = localStorage.getItem("japan_recon_viewer_config");
  if (local) {
    try {
      const data = JSON.parse(local);
      if (data && Array.isArray(data.hotspots)) {
        applyLoadedConfig(data);
      }
    } catch (e) {}
  }
}

function applyLoadedConfig(data) {
  if (data.mainImage && overviewImage) {
    overviewImage.src = data.mainImage;
  }
  if (Array.isArray(data.hotspots) && data.hotspots.length > 0) {
    viewerConfig = data.hotspots;
    renderSubnav();
    renderHotspots();
    preloadAssets();
    document.dispatchEvent(new Event("viewerconfigchange"));
  }
}

// Initialize Viewer on Load
document.addEventListener("DOMContentLoaded", () => {
  renderHotspots();
  resetOverviewCopy();
  preloadAssets();
  initExperienceZoom();
  initV6SoundPlayer();
  loadDynamicConfig();
});

// Initial invocation if DOM already ready
if (document.readyState === "interactive" || document.readyState === "complete") {
  renderHotspots();
  resetOverviewCopy();
  preloadAssets();
  initExperienceZoom();
  initV6SoundPlayer();
  loadDynamicConfig();
}

