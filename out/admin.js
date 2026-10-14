const inventoryVehicles = window.JRCG.catalog();
const parseVehiclePrice = window.JRCG.price;
// ==========================================================================
// Japan Recon Showroom — Admin Studio Controller
// ==========================================================================

const DEFAULT_CONFIG = {
  mainImage: "assets/audi-s5/main-car-16x9.jpg",
  vehicleName: "Audi S5 Avant",
  vehicleSub: "Actual photographed example · interactive detail page",
  price: "RM 438,000",
  hotspots: [
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
      ],
      subHotspots: [
        {
          id: "engine_turbo",
          label: "Twin-Scroll Turbo",
          x: "52%",
          y: "52%",
          title: "Hot-V Twin-Scroll Turbocharger",
          eyebrow: "FORCED INDUCTION",
          description: "Mounted inside the 90-degree V of the engine banks for instant spool and immediate torque delivery.",
          specs: [["Boost", "1.4 bar"], ["Configuration", "Hot-V Twin-Scroll"]]
        },
        {
          id: "engine_cover",
          label: "Carbon Shroud",
          x: "50%",
          y: "36%",
          title: "Carbon Fibre Engine Cover",
          eyebrow: "ENGINE DRESSING",
          description: "Gloss carbon composite engine dress cover with thermal dampening and Audi V6 TFSI red emblems.",
          specs: [["Material", "Gloss Carbon Fibre"], ["Acoustics", "Thermal composite"]]
        }
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
      ],
      subHotspots: [
        {
          id: "interior_wheel",
          label: "Sport Steering",
          x: "38%",
          y: "60%",
          title: "Flat-Bottom Sport Steering Wheel",
          eyebrow: "DRIVER INTERFACE",
          description: "Perforated sport leather wheel with aluminum shift paddles and multifunction drive mode selectors.",
          specs: [["Material", "Perforated Nappa Leather"], ["Paddles", "Die-cast Aluminum"]]
        },
        {
          id: "interior_cockpit",
          label: "Virtual Cockpit",
          x: "49%",
          y: "40%",
          title: "12.3-inch Virtual Cockpit HD",
          eyebrow: "DIGITAL INSTRUMENTATION",
          description: "Configurable instrument screen featuring 3D Google Earth maps and S-specific telemetry views.",
          specs: [["Resolution", "1920x720 HD"], ["Modes", "Classic / Sport / Dynamic"]]
        },
        {
          id: "interior_mmi",
          label: "MMI Display",
          x: "66%",
          y: "44%",
          title: "10.1-inch MMI Touch Display",
          eyebrow: "INFOTAINMENT & CONTROL",
          description: "Acoustic and haptic feedback screen running navigation, vehicle dynamics, and wireless Apple CarPlay.",
          specs: [["Display", "10.1-inch Glass"], ["Connectivity", "Wireless CarPlay & Android Auto"]]
        }
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
      ],
      subHotspots: [
        {
          id: "boot_seats",
          label: "40:20:40 Seats",
          x: "48%",
          y: "48%",
          title: "40:20:40 Split-Folding Rear Seats",
          eyebrow: "CARGO CAPACITY",
          description: "Quick-release levers expand luggage space from 465 litres to 1,495 litres with a flat loading floor.",
          specs: [["Volume", "Up to 1,495L"], ["Mechanism", "Side-wall quick release"]]
        },
        {
          id: "boot_switch",
          label: "Tailgate Switch",
          x: "20%",
          y: "34%",
          title: "Electric Tailgate Close Switch",
          eyebrow: "POWER UTILITY",
          description: "Illuminated tailgate button with programmable opening height memory and lock function.",
          specs: [["Function", "One-touch close & lock"], ["Memory", "Height programmable"]]
        }
      ]
    },
    {
      id: "wheel",
      label: "Wheel",
      type: "image",
      x: "78%",
      y: "74%",
      imageSrc: "assets/audi-s5/wheel_16x9.jpg",
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
      imageSrc: "assets/audi-s5/dashboard_16x9.jpg",
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
      imageSrc: "assets/audi-s5/seats_16x9.jpg",
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
      imageSrc: "assets/audi-s5/audio_16x9.jpg",
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
      imageSrc: "assets/audi-s5/climate_16x9.jpg",
      title: "Rear Cabin Climate Controls",
      eyebrow: "COMFORT & CLIMATE",
      description: "Dedicated digital temperature panel for rear passengers, regulating dual-zone rear airflow and rear heated seat levels.",
      specs: [
        ["Zones", "Tri-zone automatic climate"],
        ["Display", "Dedicated rear digital readout"],
        ["Vents", "Centre console & B-pillar vents"],
        ["Controls", "Physical rocker switchgear"]
      ]
    }
  ]
};

// Studio State
let currentVehicleId = "audi-s5";
let currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
let selectedHotspotId = "engine";
let currentMode = "edit"; // 'edit' or 'test'
let testState = {
  activeItem: null,
  isAnimating: false,
  mode: "normal" // 'normal', 'video', 'reverse', 'image'
};
let isUnsaved = false;

// DOM Elements
const adminStage = document.getElementById("adminStage");
const adminMainImage = document.getElementById("adminMainImage");
const adminHotspotsLayer = document.getElementById("adminHotspotsLayer");
const adminTestVideo = document.getElementById("adminTestVideo");
const adminTestDetailImage = document.getElementById("adminTestDetailImage");
const adminTestBackBtn = document.getElementById("adminTestBackBtn");
const canvasCrosshair = document.getElementById("canvasCrosshair");
const crosshairTip = document.getElementById("crosshairTip");
const canvasCoordsBadge = document.getElementById("canvasCoordsBadge");
const hotspotsStrip = document.getElementById("hotspotsStrip");
const hotspotCountBadge = document.getElementById("hotspotCountBadge");

// Sub-Hotspot Context Bar Elements
const stageContextBar = document.getElementById("stageContextBar");
const contextParentLabel = document.getElementById("contextParentLabel");
const exitSubHotspotViewBtn = document.getElementById("exitSubHotspotViewBtn");
const cleanTestHotspotsBtn = document.getElementById("cleanTestHotspotsBtn");

// Sub-Hotspots Inspector Elements
const subHotspotsManagerList = document.getElementById("subHotspotsManagerList");
const openSubHotspotModeBtn = document.getElementById("openSubHotspotModeBtn");
const addSubHotspotBtn = document.getElementById("addSubHotspotBtn");

// Sub-Hotspot State (null = viewing main car, string ID = editing child hotspots of this parent)
let currentSubHotspotParentId = null;
let selectedSubHotspotId = null;

// Modes
const modeEditBtn = document.getElementById("modeEditBtn");
const modeTestBtn = document.getElementById("modeTestBtn");

// Quick uploads
const quickMainImageUpload = document.getElementById("quickMainImageUpload");

// Inspector Tabs
const tabHotspotBtn = document.getElementById("tabHotspotBtn");
const tabVehicleBtn = document.getElementById("tabVehicleBtn");
const tabLeadsBtn = document.getElementById("tabLeadsBtn");
const tabHomepageBtn = document.getElementById("tabHomepageBtn");
const tabHistoryBtn = document.getElementById("tabHistoryBtn");
const tabToolsBtn = document.getElementById("tabToolsBtn");
const tabJsonBtn = document.getElementById("tabJsonBtn");

const panelHotspot = document.getElementById("panelHotspot");
const panelVehicle = document.getElementById("panelVehicle");
const panelLeads = document.getElementById("panelLeads");
const panelHomepage = document.getElementById("panelHomepage");
const panelHistory = document.getElementById("panelHistory");
const panelTools = document.getElementById("panelTools");
const panelJson = document.getElementById("panelJson");

// Mobile Subnav
const adminMobileNav = document.getElementById("adminMobileNav");
const leadsTabBadge = document.getElementById("leadsTabBadge");
const mobileLeadsBadge = document.getElementById("mobileLeadsBadge");

// History Undo / Redo Elements
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const panelUndoBtn = document.getElementById("panelUndoBtn");
const panelRedoBtn = document.getElementById("panelRedoBtn");
const createSnapshotBtn = document.getElementById("createSnapshotBtn");
const historyTimeline = document.getElementById("historyTimeline");
const historyStepCountText = document.getElementById("historyStepCountText");

// Hotspot Form Elements
const hotspotForm = document.getElementById("hotspotForm");
const inspectorHotspotTitle = document.getElementById("inspectorHotspotTitle");
const inspectorHotspotSubtitle = document.getElementById("inspectorHotspotSubtitle");
const hotspotLabelInput = document.getElementById("hotspotLabelInput");
const hotspotIdInput = document.getElementById("hotspotIdInput");
const typeVideoRadio = document.getElementById("typeVideoRadio");
const typeImageRadio = document.getElementById("typeImageRadio");
const coordXInput = document.getElementById("coordXInput");
const coordXRange = document.getElementById("coordXRange");
const coordYInput = document.getElementById("coordYInput");
const coordYRange = document.getElementById("coordYRange");
const videoFieldsGroup = document.getElementById("videoFieldsGroup");
const imageFieldsGroup = document.getElementById("imageFieldsGroup");
const forwardVideoInput = document.getElementById("forwardVideoInput");
const forwardVideoUpload = document.getElementById("forwardVideoUpload");
const forwardVideoPreview = document.getElementById("forwardVideoPreview");
const reverseVideoInput = document.getElementById("reverseVideoInput");
const reverseVideoUpload = document.getElementById("reverseVideoUpload");
const reverseVideoPreview = document.getElementById("reverseVideoPreview");
const detailImageInput = document.getElementById("detailImageInput");
const detailImageUpload = document.getElementById("detailImageUpload");
const detailImagePreview = document.getElementById("detailImagePreview");
const hotspotEyebrowInput = document.getElementById("hotspotEyebrowInput");
const hotspotTitleInput = document.getElementById("hotspotTitleInput");
const hotspotDescInput = document.getElementById("hotspotDescInput");
const specsEditorList = document.getElementById("specsEditorList");
const addSpecRowBtn = document.getElementById("addSpecRowBtn");
const updateHotspotBtn = document.getElementById("updateHotspotBtn");
const duplicateHotspotBtn = document.getElementById("duplicateHotspotBtn");
const deleteHotspotBtn = document.getElementById("deleteHotspotBtn");

// Vehicle Tab & Cost Margin Calculator Elements
const mainImageUrlInput = document.getElementById("mainImageUrlInput");
const mainImageFileUpload = document.getElementById("mainImageFileUpload");
const mainImagePreview = document.getElementById("mainImagePreview");
const vehicleNameInput = document.getElementById("vehicleNameInput");
const vehiclePriceInput = document.getElementById("vehiclePriceInput");
const vehicleYearInput = document.getElementById("vehicleYearInput");
const vehicleMileageInput = document.getElementById("vehicleMileageInput");
const vehicleEngineInput = document.getElementById("vehicleEngineInput");
const vehicleSubInput = document.getElementById("vehicleSubInput");
const saveVehicleSettingsBtn = document.getElementById("saveVehicleSettingsBtn");

const fobJpyInput = document.getElementById("fobJpyInput");
const exchangeRateInput = document.getElementById("exchangeRateInput");
const oceanFreightInput = document.getElementById("oceanFreightInput");
const customsDutyInput = document.getElementById("customsDutyInput");
const apFeeInput = document.getElementById("apFeeInput");
const portPuspakomInput = document.getElementById("portPuspakomInput");
const reconDetailingInput = document.getElementById("reconDetailingInput");
const targetMarginPctInput = document.getElementById("targetMarginPctInput");
const targetMarginAmountVal = document.getElementById("targetMarginAmountVal");
const fobMyrVal = document.getElementById("fobMyrVal");
const totalLandedCostVal = document.getElementById("totalLandedCostVal");
const recommendedPriceVal = document.getElementById("recommendedPriceVal");
const applyRecommendedPriceBtn = document.getElementById("applyRecommendedPriceBtn");

// Sales Consultant Assignment & Leads Elements
const statLeadsTotal = document.getElementById("statLeadsTotal");
const statLeadsNew = document.getElementById("statLeadsNew");
const statLeadsConfirmed = document.getElementById("statLeadsConfirmed");
const statLeadsContacted = document.getElementById("statLeadsContacted");
const leadsContainer = document.getElementById("leadsContainer");
const addLeadModalBtn = document.getElementById("addLeadModalBtn");
const addLeadDialog = document.getElementById("addLeadDialog");
const closeAddLeadDialogBtn = document.getElementById("closeAddLeadDialogBtn");
const cancelAddLeadBtn = document.getElementById("cancelAddLeadBtn");
const confirmAddLeadBtn = document.getElementById("confirmAddLeadBtn");
const addLeadForm = document.getElementById("addLeadForm");

// Duplicate Template Modal Elements
const duplicateTemplateBtn = document.getElementById("duplicateTemplateBtn");
const duplicateTemplateDialog = document.getElementById("duplicateTemplateDialog");
const closeDuplicateTemplateDialogBtn = document.getElementById("closeDuplicateTemplateDialogBtn");
const cancelDuplicateTemplateBtn = document.getElementById("cancelDuplicateTemplateBtn");
const confirmDuplicateTemplateBtn = document.getElementById("confirmDuplicateTemplateBtn");
const dupSourceVehicle = document.getElementById("dupSourceVehicle");
const dupTargetVehicleSelect = document.getElementById("dupTargetVehicleSelect");

// Tools: Automatic Watermark Generator Elements
const watermarkImageUpload = document.getElementById("watermarkImageUpload");
const watermarkTextInput = document.getElementById("watermarkTextInput");
const watermarkPositionSelect = document.getElementById("watermarkPositionSelect");
const watermarkOpacityRange = document.getElementById("watermarkOpacityRange");
const watermarkScaleRange = document.getElementById("watermarkScaleRange");
const watermarkCanvas = document.getElementById("watermarkCanvas");
const downloadWatermarkedBtn = document.getElementById("downloadWatermarkedBtn");
const applyWatermarkToCurrentCarBtn = document.getElementById("applyWatermarkToCurrentCarBtn");

// Tools: Bulk CSV Import Elements
const downloadSampleCsvBtn = document.getElementById("downloadSampleCsvBtn");
const csvFileInput = document.getElementById("csvFileInput");
const csvFileDropZone = document.getElementById("csvFileDropZone");
const csvPreviewBox = document.getElementById("csvPreviewBox");
const csvParsedCountText = document.getElementById("csvParsedCountText");
const csvPreviewTbody = document.getElementById("csvPreviewTbody");
const executeCsvImportBtn = document.getElementById("executeCsvImportBtn");

// Drag & Drop Dropzones
const mainImageDropZone = document.getElementById("mainImageDropZone");
const forwardVideoDropZone = document.getElementById("forwardVideoDropZone");
const reverseVideoDropZone = document.getElementById("reverseVideoDropZone");
const imageSrcDropZone = document.getElementById("imageSrcDropZone");

// JSON Tab Elements
const jsonConfigTextarea = document.getElementById("jsonConfigTextarea");
const copyJsonBtn = document.getElementById("copyJsonBtn");
const applyJsonBtn = document.getElementById("applyJsonBtn");

// Header Action Buttons
const saveConfigBtn = document.getElementById("saveConfigBtn");
const resetConfigBtn = document.getElementById("resetConfigBtn");
const exportConfigBtn = document.getElementById("exportConfigBtn");
const importConfigBtn = document.getElementById("importConfigBtn");
const saveStatusIndicator = document.getElementById("saveStatusIndicator");
const statusText = document.getElementById("statusText");

// Toast and Modal
const toastContainer = document.getElementById("toastContainer");
const importDialog = document.getElementById("importDialog");
const closeImportDialogBtn = document.getElementById("closeImportDialogBtn");
const cancelImportBtn = document.getElementById("cancelImportBtn");
const confirmImportBtn = document.getElementById("confirmImportBtn");
const importJsonTextarea = document.getElementById("importJsonTextarea");
const importJsonFileInput = document.getElementById("importJsonFileInput");

// In-Page Confirmation Dialog (Iframe Safe)
const confirmDialog = document.getElementById("confirmDialog");
const confirmDialogTitle = document.getElementById("confirmDialogTitle");
const confirmDialogMessage = document.getElementById("confirmDialogMessage");
const cancelConfirmDialogBtn = document.getElementById("cancelConfirmDialogBtn");
const okConfirmDialogBtn = document.getElementById("okConfirmDialogBtn");
const closeConfirmDialogBtn = document.getElementById("closeConfirmDialogBtn");

// Test Sub-Hotspots Elements
const adminTestSubHotspotsLayer = document.getElementById("adminTestSubHotspotsLayer");
const testSubhotspotCard = document.getElementById("testSubhotspotCard");
const testCardEyebrow = document.getElementById("testCardEyebrow");
const testCardTitle = document.getElementById("testCardTitle");
const testCardDesc = document.getElementById("testCardDesc");
const testCardSpecs = document.getElementById("testCardSpecs");
const testCardCloseBtn = document.getElementById("testCardCloseBtn");

// History & Leads State Variables
let historyStack = [];
let historyIndex = -1;
let isPerformingHistoryAction = false;
let currentLeads = [];
let currentConsultants = [];
let activeLeadFilter = 'all';
let parsedCsvData = [];
let watermarkImageObj = null;

// ==========================================================================
// Initialization & Data Loading
// ==========================================================================

// DOM element for vehicle selector
const adminVehicleSelect = document.getElementById("adminVehicleSelect");

async function initAdminStudio() {
  // Check URL query param for vehicle
  const urlParams = new URLSearchParams(window.location.search);
  const qVehicle = urlParams.get("vehicle");
  if (qVehicle && adminVehicleSelect) {
    adminVehicleSelect.value = qVehicle;
    currentVehicleId = qVehicle;
  }

  await fetchConfig();
  setupEventListeners();
  renderCanvas();
  renderHotspotsStrip();
  loadHotspotIntoInspector(selectedHotspotId);
  syncVehicleSettingsTab();

  // Initialize new modules
  pushHistory("初始化加载: " + (currentConfig.vehicleName || currentVehicleId));
  fetchLeads();
  calculateDealerCosts();
  initWatermarkGenerator();
  initCsvBulkImporter();
  initDragAndDropUploader();
  // Studio editing is intended for desktop browsers.
}

async function fetchConfig(vId = currentVehicleId) {
  const localKey = vId === 'audi-s5' ? 'japan_recon_viewer_config' : 'japan_recon_viewer_config_' + vId;
  const saved = window.JRCG.read(localKey, null);
  const vehicle = window.JRCG.catalog().find(item => item.id === vId) || inventoryVehicles[0];
  currentConfig = saved && Array.isArray(saved.hotspots) ? saved : JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  if (!saved && vId !== 'audi-s5') currentConfig.hotspots = [];
  if (!saved) Object.assign(currentConfig, { vehicleName: vehicle.brand + ' ' + vehicle.model, price: vehicle.price, year: vehicle.year, mileage: vehicle.mileage, engine: vehicle.engine, vehicleSub: vehicle.sub, mainImage: vehicle.image });
  currentConfig.vehicleId = vId;
  selectedHotspotId = currentConfig.hotspots[0]?.id || null;
  setUnsaved(false);
}

async function switchVehicle(newVehicleId) {
  if (isUnsaved) {
    const confirmed = await new Promise(resolve => {
      showCustomConfirm({
        title: "未保存提示",
        message: "当前车型有未保存的更改，切换车型将放弃未保存的更改，是否继续？",
        confirmText: "继续切换",
        isDanger: true,
        onConfirm: () => resolve(true)
      });
      // Handle cancel button
      const cancelBtn = document.getElementById("cancelConfirmDialogBtn");
      const handleCancel = () => {
        cancelBtn.removeEventListener("click", handleCancel);
        resolve(false);
      };
      if (cancelBtn) cancelBtn.addEventListener("click", handleCancel, { once: true });
    });
    if (!confirmed) {
      if (adminVehicleSelect) adminVehicleSelect.value = currentVehicleId;
      return;
    }
  }

  currentVehicleId = newVehicleId;
  currentSubHotspotParentId = null;
  await fetchConfig(newVehicleId);
  renderCanvas();
  renderHotspotsStrip();
  loadHotspotIntoInspector(selectedHotspotId);
  syncVehicleSettingsTab();
  const headerCalc = document.getElementById("headerCalcLink");
  if (headerCalc) headerCalc.href = `calculator.html?vehicle=${encodeURIComponent(newVehicleId)}`;
  syncHomepagePanelData();
  showToast(`已切换至车型「${currentConfig.vehicleName || newVehicleId}」！`, "success");
}

function setUnsaved(unsaved = true) {
  isUnsaved = unsaved;
  if (unsaved) {
    saveStatusIndicator.classList.add("unsaved");
    statusText.textContent = "有未保存的更改 (Unsaved)";
  } else {
    saveStatusIndicator.classList.remove("unsaved");
    statusText.textContent = "已保存到此浏览器 (Saved)";
  }
}

// ==========================================================================
// Safe In-Page Confirmation (Replaces window.confirm for Iframes)
// ==========================================================================

function showCustomConfirm({ title = "确认操作", message = "确定要执行此操作吗？", confirmText = "确认删除", isDanger = true, onConfirm }) {
  if (!confirmDialog) {
    if (typeof onConfirm === "function") onConfirm();
    return;
  }
  confirmDialogTitle.textContent = title;
  confirmDialogMessage.textContent = message;
  okConfirmDialogBtn.textContent = confirmText;
  okConfirmDialogBtn.className = isDanger ? "admin-btn admin-btn-danger" : "admin-btn admin-btn-primary";

  const closeDialog = () => {
    try {
      if (confirmDialog.close) confirmDialog.close();
    } catch (e) {}
    confirmDialog.removeAttribute("open");
    confirmDialog.style.display = "none";
    cleanup();
  };

  const handleOk = () => {
    closeDialog();
    if (typeof onConfirm === "function") onConfirm();
  };

  const cleanup = () => {
    okConfirmDialogBtn.removeEventListener("click", handleOk);
    cancelConfirmDialogBtn.removeEventListener("click", closeDialog);
    if (closeConfirmDialogBtn) closeConfirmDialogBtn.removeEventListener("click", closeDialog);
  };

  cleanup();
  okConfirmDialogBtn.addEventListener("click", handleOk);
  cancelConfirmDialogBtn.addEventListener("click", closeDialog);
  if (closeConfirmDialogBtn) closeConfirmDialogBtn.addEventListener("click", closeDialog);

  confirmDialog.setAttribute("open", "");
  confirmDialog.style.display = "flex";
  try {
    if (confirmDialog.showModal) confirmDialog.showModal();
  } catch (e) {}
}

// ==========================================================================
// Hotspot Deletion Controller
// ==========================================================================

function deleteHotspot(id) {
  const idx = currentConfig.hotspots.findIndex(h => h.id === id);
  if (idx === -1) return;
  const deleted = currentConfig.hotspots.splice(idx, 1)[0];

  if (currentSubHotspotParentId === id) {
    exitSubHotspotMode();
  }

  if (currentConfig.hotspots.length > 0) {
    const nextIdx = Math.min(idx, currentConfig.hotspots.length - 1);
    selectHotspot(currentConfig.hotspots[nextIdx].id);
  } else {
    selectedHotspotId = null;
    clearHotspotInspector();
  }

  renderCanvas();
  renderHotspotsStrip();
  setUnsaved(true);
  showToast(`热点「${deleted.label || deleted.id}」已成功删除！`, "success");
}

function clearHotspotInspector() {
  inspectorHotspotTitle.textContent = "无选中热点";
  inspectorHotspotSubtitle.textContent = "点击画布或下方「+ 新建热点」添加";
  hotspotLabelInput.value = "";
  hotspotIdInput.value = "";
  coordXInput.value = "50";
  coordXRange.value = "50";
  coordYInput.value = "50";
  coordYRange.value = "50";
  forwardVideoInput.value = "";
  reverseVideoInput.value = "";
  detailImageInput.value = "";
  hotspotEyebrowInput.value = "";
  hotspotTitleInput.value = "";
  hotspotDescInput.value = "";
  specsEditorList.innerHTML = "";
  if (subHotspotsManagerList) subHotspotsManagerList.innerHTML = "";
}

function deleteSubHotspot(parentId, subId) {
  const parent = currentConfig.hotspots.find(h => h.id === parentId);
  if (!parent || !Array.isArray(parent.subHotspots)) return;
  const idx = parent.subHotspots.findIndex(s => s.id === subId);
  if (idx === -1) return;
  const deleted = parent.subHotspots.splice(idx, 1)[0];

  if (selectedSubHotspotId === subId) {
    selectedSubHotspotId = parent.subHotspots.length > 0 ? parent.subHotspots[0].id : null;
  }

  renderCanvas();
  renderSubHotspotsManagerList(parent);
  setUnsaved(true);
  showToast(`子热点「${deleted.label || deleted.id}」已成功删除！`, "success");
}

// ==========================================================================
// Sub-Hotspot Navigation & Resolution
// ==========================================================================

function getHotspotDetailImage(item) {
  if (!item) return currentConfig.mainImage || DEFAULT_CONFIG.mainImage;
  if (item.imageSrc) return item.imageSrc;
  if (item.type === "video") {
    if (item.id === "engine" || item.id.includes("engine")) return "assets/audi-s5/engine_16x9.jpg";
    if (item.id === "interior" || item.id.includes("interior") || item.id.includes("cabin")) return "assets/audi-s5/dashboard_16x9.jpg";
    if (item.id === "boot" || item.id.includes("boot") || item.id.includes("trunk")) return "assets/audi-s5/boot_16x9.jpg";
    if (item.previewImage) return item.previewImage;
    return "assets/audi-s5/main-car-16x9.jpg";
  }
  return currentConfig.mainImage || DEFAULT_CONFIG.mainImage;
}

function enterSubHotspotMode(parentId) {
  const parent = currentConfig.hotspots.find(h => h.id === parentId);
  if (!parent) {
    showToast("请先选择一个热点", "info");
    return;
  }
  currentSubHotspotParentId = parent.id;
  if (!Array.isArray(parent.subHotspots)) {
    parent.subHotspots = [];
  }
  selectedSubHotspotId = parent.subHotspots.length > 0 ? parent.subHotspots[0].id : null;

  stageContextBar.style.display = "flex";
  contextParentLabel.textContent = `正在编辑「${parent.label || parent.id}」内部的子热点 (Sub-Hotspots inside this view)`;

  renderCanvas();
  renderSubHotspotsManagerList(parent);
  showToast(`已进入「${parent.label || parent.id}」子热点编辑模式！点击画面即可添加部件标记。`, "success");
}

function exitSubHotspotMode() {
  const prevParentId = currentSubHotspotParentId;
  currentSubHotspotParentId = null;
  selectedSubHotspotId = null;
  stageContextBar.style.display = "none";

  renderCanvas();
  renderHotspotsStrip();
  if (prevParentId) {
    selectHotspot(prevParentId);
  }
  showToast("已退出子热点，返回整车总览视图。", "info");
}

// ==========================================================================
// Render Canvas & Hotspots (Supports Main Car and Sub-Hotspots View)
// ==========================================================================

function renderCanvas() {
  // If in Sub-Hotspots Mode for a specific parent hotspot:
  if (currentSubHotspotParentId) {
    const parent = currentConfig.hotspots.find(h => h.id === currentSubHotspotParentId);
    if (!parent) {
      exitSubHotspotMode();
      return;
    }

    stageContextBar.style.display = "flex";
    contextParentLabel.textContent = `正在编辑「${parent.label || parent.id}」内部的子热点 (Sub-Hotspots inside this view)`;
    adminMainImage.src = getHotspotDetailImage(parent);
    adminHotspotsLayer.innerHTML = "";

    const subList = parent.subHotspots || [];
    subList.forEach(subItem => {
      const pin = document.createElement("div");
      pin.className = `admin-hotspot-pin sub-pin ${subItem.id === selectedSubHotspotId ? "is-selected" : ""}`;
      pin.style.left = subItem.x;
      pin.style.top = subItem.y;
      pin.dataset.id = subItem.id;
      pin.setAttribute("title", `[子热点] ${subItem.label || subItem.id}`);

      pin.innerHTML = `
        <span class="pin-icon">✦</span>
        <span class="pin-label">${escapeHtml(subItem.label || subItem.id)}</span>
        <span class="pin-badge">Sub</span>
      `;

      pin.addEventListener("click", (e) => {
        e.stopPropagation();
        if (Date.now() - lastDragEndTime < 200) return;
        selectedSubHotspotId = subItem.id;
        renderCanvas();
        renderSubHotspotsManagerList(parent);
        const card = subHotspotsManagerList.querySelector(`[data-sub-id="${subItem.id}"]`);
        if (card) {
          card.classList.add("is-editing");
          card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });

      if (currentMode === "edit") {
        setupSubPinDrag(pin, subItem, parent);
      }

      adminHotspotsLayer.appendChild(pin);
    });

    hotspotCountBadge.textContent = `${subList.length} (子热点)`;
    return;
  }

  // Normal Main Vehicle Mode:
  stageContextBar.style.display = "none";
  adminMainImage.src = currentConfig.mainImage || DEFAULT_CONFIG.mainImage;
  adminHotspotsLayer.innerHTML = "";

  currentConfig.hotspots.forEach(item => {
    const pin = document.createElement("div");
    pin.className = `admin-hotspot-pin ${item.id === selectedHotspotId ? "is-selected" : ""}`;
    pin.style.left = item.x;
    pin.style.top = item.y;
    pin.dataset.id = item.id;
    pin.setAttribute("title", `${item.label} (${item.type === "video" ? "Video" : "Image"})`);

    const isVideo = item.type === "video";
    const subCount = Array.isArray(item.subHotspots) ? item.subHotspots.length : 0;
    pin.innerHTML = `
      <span class="pin-icon">${isVideo ? "▶" : "+"}</span>
      <span class="pin-label">${escapeHtml(item.label || item.id)}</span>
      <span class="pin-badge">${isVideo ? "Vid" : "Img"}${subCount > 0 ? ` · ${subCount}★` : ""}</span>
    `;

    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      if (Date.now() - lastDragEndTime < 200) return;
      if (currentMode === "edit") {
        selectHotspot(item.id);
      } else {
        testHotspotInteraction(item);
      }
    });

    if (currentMode === "edit") {
      setupPinDrag(pin, item);
    }

    adminHotspotsLayer.appendChild(pin);
  });

  hotspotCountBadge.textContent = currentConfig.hotspots.length;
}

let lastDragEndTime = 0;

function setupPinDrag(pin, item) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let didMove = false;

  const onPointerDown = (e) => {
    if (currentMode !== "edit") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    isDragging = true;
    didMove = false;
    startX = e.clientX;
    startY = e.clientY;

    pin.classList.add("is-dragging");
    adminStage.classList.add("is-dragging-any-pin");
    selectHotspot(item.id);

    try {
      pin.setPointerCapture(e.pointerId);
    } catch (err) {}

    const onPointerMove = (moveEvt) => {
      if (!isDragging) return;
      moveEvt.preventDefault();
      moveEvt.stopPropagation();

      const dist = Math.hypot(moveEvt.clientX - startX, moveEvt.clientY - startY);
      if (dist > 3) {
        didMove = true;
      }

      const rect = adminStage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const relX = Math.max(1, Math.min(99, ((moveEvt.clientX - rect.left) / rect.width) * 100));
      const relY = Math.max(1, Math.min(99, ((moveEvt.clientY - rect.top) / rect.height) * 100));

      const newXStr = `${relX.toFixed(1)}%`;
      const newYStr = `${relY.toFixed(1)}%`;

      pin.style.left = newXStr;
      pin.style.top = newYStr;

      item.x = newXStr;
      item.y = newYStr;

      coordXInput.value = relX.toFixed(1);
      coordXRange.value = relX.toFixed(1);
      coordYInput.value = relY.toFixed(1);
      coordYRange.value = relY.toFixed(1);
      canvasCoordsBadge.textContent = `X: ${newXStr} · Y: ${newYStr}`;
      setUnsaved(true);
    };

    const onPointerUp = (upEvt) => {
      if (!isDragging) return;
      isDragging = false;
      pin.classList.remove("is-dragging");
      adminStage.classList.remove("is-dragging-any-pin");

      try {
        pin.releasePointerCapture(e.pointerId);
      } catch (err) {}

      pin.removeEventListener("pointermove", onPointerMove);
      pin.removeEventListener("pointerup", onPointerUp);
      pin.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      if (didMove) {
        lastDragEndTime = Date.now();
        renderHotspotsStrip();
      }
    };

    pin.addEventListener("pointermove", onPointerMove);
    pin.addEventListener("pointerup", onPointerUp);
    pin.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  pin.addEventListener("pointerdown", onPointerDown);
}

function setupSubPinDrag(pin, subItem, parent) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let didMove = false;

  const onPointerDown = (e) => {
    if (currentMode !== "edit") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    isDragging = true;
    didMove = false;
    startX = e.clientX;
    startY = e.clientY;

    pin.classList.add("is-dragging");
    adminStage.classList.add("is-dragging-any-pin");
    selectedSubHotspotId = subItem.id;

    try { pin.setPointerCapture(e.pointerId); } catch (err) {}

    const onPointerMove = (moveEvt) => {
      if (!isDragging) return;
      moveEvt.preventDefault();
      moveEvt.stopPropagation();

      const dist = Math.hypot(moveEvt.clientX - startX, moveEvt.clientY - startY);
      if (dist > 3) didMove = true;

      const rect = adminStage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const relX = Math.max(1, Math.min(99, ((moveEvt.clientX - rect.left) / rect.width) * 100));
      const relY = Math.max(1, Math.min(99, ((moveEvt.clientY - rect.top) / rect.height) * 100));

      const newXStr = `${relX.toFixed(1)}%`;
      const newYStr = `${relY.toFixed(1)}%`;

      pin.style.left = newXStr;
      pin.style.top = newYStr;
      subItem.x = newXStr;
      subItem.y = newYStr;

      canvasCoordsBadge.textContent = `[子热点] X: ${newXStr} · Y: ${newYStr}`;

      const subCard = subHotspotsManagerList.querySelector(`[data-sub-id="${subItem.id}"]`);
      if (subCard) {
        const xInput = subCard.querySelector(".sub-coord-x");
        const yInput = subCard.querySelector(".sub-coord-y");
        if (xInput) xInput.value = relX.toFixed(1);
        if (yInput) yInput.value = relY.toFixed(1);
      }
      setUnsaved(true);
    };

    const onPointerUp = (upEvt) => {
      if (!isDragging) return;
      isDragging = false;
      pin.classList.remove("is-dragging");
      adminStage.classList.remove("is-dragging-any-pin");

      try { pin.releasePointerCapture(e.pointerId); } catch (err) {}

      pin.removeEventListener("pointermove", onPointerMove);
      pin.removeEventListener("pointerup", onPointerUp);
      pin.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      if (didMove) {
        lastDragEndTime = Date.now();
        renderSubHotspotsManagerList(parent);
      }
    };

    pin.addEventListener("pointermove", onPointerMove);
    pin.addEventListener("pointerup", onPointerUp);
    pin.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  pin.addEventListener("pointerdown", onPointerDown);
}

function renderHotspotsStrip() {
  hotspotsStrip.innerHTML = currentConfig.hotspots.map(item => {
    const subCount = Array.isArray(item.subHotspots) ? item.subHotspots.length : 0;
    return `
      <div class="strip-card ${item.id === selectedHotspotId ? "active" : ""}" data-id="${item.id}">
        <div class="strip-card-header">
          <span class="strip-card-title">${escapeHtml(item.label || item.id)}</span>
          <button type="button" class="strip-card-delete" title="删除此热点" data-delete-id="${item.id}">✕</button>
        </div>
        <span class="strip-card-meta">
          <span>${item.type === "video" ? "🎬 视频" : "🖼️ 特写"}</span>
          <span>·</span>
          <span>${item.x}, ${item.y}</span>
          ${subCount > 0 ? `<span style="color: var(--admin-accent); font-weight: 600;">· 🎯 ${subCount}个子热点</span>` : ""}
        </span>
      </div>
    `;
  }).join("");

  hotspotsStrip.querySelectorAll(".strip-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".strip-card-delete")) return;
      selectHotspot(card.dataset.id);
    });
  });

  hotspotsStrip.querySelectorAll(".strip-card-delete").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.deleteId;
      const target = currentConfig.hotspots.find(h => h.id === id);
      showCustomConfirm({
        title: "删除热点",
        message: `确定要删除热点「${target ? (target.label || target.id) : id}」吗？`,
        confirmText: "确认删除",
        isDanger: true,
        onConfirm: () => {
          deleteHotspot(id);
        }
      });
    });
  });
}

function selectHotspot(id) {
  selectedHotspotId = id;
  adminHotspotsLayer.querySelectorAll(".admin-hotspot-pin").forEach(pin => {
    pin.classList.toggle("is-selected", pin.dataset.id === id);
  });
  hotspotsStrip.querySelectorAll(".strip-card").forEach(card => {
    card.classList.toggle("active", card.dataset.id === id);
  });
  loadHotspotIntoInspector(id);
  switchInspectorTab("hotspot");
}

// ==========================================================================
// Inspector Form & Synchronization
// ==========================================================================

function loadHotspotIntoInspector(id) {
  const item = currentConfig.hotspots.find(h => h.id === id);
  if (!item) {
    if (currentConfig.hotspots.length > 0) {
      return selectHotspot(currentConfig.hotspots[0].id);
    }
    return;
  }

  inspectorHotspotTitle.textContent = `编辑热点: ${item.label || item.id}`;
  inspectorHotspotSubtitle.textContent = `类型: ${item.type === "video" ? "16:9 动态视频" : "16:9 静态大图"} · 坐标: ${item.x}, ${item.y}`;

  hotspotLabelInput.value = item.label || "";
  hotspotIdInput.value = item.id || "";

  if (item.type === "video") {
    typeVideoRadio.checked = true;
    videoFieldsGroup.style.display = "";
    imageFieldsGroup.style.display = "none";
  } else {
    typeImageRadio.checked = true;
    videoFieldsGroup.style.display = "none";
    imageFieldsGroup.style.display = "";
  }

  const numX = parseFloat(item.x) || 50;
  const numY = parseFloat(item.y) || 50;
  coordXInput.value = numX;
  coordXRange.value = numX;
  coordYInput.value = numY;
  coordYRange.value = numY;

  forwardVideoInput.value = item.forwardVideo || "";
  forwardVideoPreview.src = item.forwardVideo || "";
  reverseVideoInput.value = item.reverseVideo || "";
  reverseVideoPreview.src = item.reverseVideo || "";

  detailImageInput.value = item.imageSrc || "";
  detailImagePreview.src = item.imageSrc || "";

  hotspotEyebrowInput.value = item.eyebrow || "";
  hotspotTitleInput.value = item.title || "";
  hotspotDescInput.value = item.description || "";

  renderSpecsEditor(item.specs || []);
  renderSubHotspotsManagerList(item);
}

function renderSpecsEditor(specs = []) {
  specsEditorList.innerHTML = "";
  specs.forEach(([key, val], idx) => {
    const row = document.createElement("div");
    row.className = "spec-edit-row";
    row.innerHTML = `
      <input type="text" class="admin-input spec-key" value="${escapeHtml(key)}" placeholder="参数名 (如 Engine)">
      <input type="text" class="admin-input spec-val" value="${escapeHtml(val)}" placeholder="参数值 (如 3.0L V6)">
      <button type="button" class="btn-remove-spec" title="删除此规格">✕</button>
    `;
    row.querySelector(".btn-remove-spec").addEventListener("click", () => {
      row.remove();
      setUnsaved(true);
    });
    row.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", () => setUnsaved(true));
    });
    specsEditorList.appendChild(row);
  });
}

function renderSubHotspotsManagerList(parent) {
  if (!subHotspotsManagerList) return;
  if (!parent || !Array.isArray(parent.subHotspots) || parent.subHotspots.length === 0) {
    subHotspotsManagerList.innerHTML = `
      <div style="font-size: 12px; color: var(--admin-text-muted); padding: 8px 12px; background: var(--admin-surface-raised); border-radius: 6px; border: 1px dashed var(--admin-border);">
        当前部件暂无子热点。点击下方按钮添加，或点击「🎯 切换到该画面可视化标记」在画面中点击添加。
      </div>
    `;
    return;
  }

  subHotspotsManagerList.innerHTML = parent.subHotspots.map(sub => {
    const isSelected = sub.id === selectedSubHotspotId;
    return `
      <div class="sub-hotspot-item ${isSelected ? "is-editing" : ""}" data-sub-id="${sub.id}">
        <div class="sub-item-info">
          <span class="sub-item-title">${escapeHtml(sub.label || sub.id)}</span>
          <span class="sub-item-meta">
            <span>坐标: ${sub.x}, ${sub.y}</span>
            <span>·</span>
            <span>${sub.specs?.length || 0}项参数</span>
            ${sub.eyebrow ? `<span>· ${escapeHtml(sub.eyebrow)}</span>` : ""}
          </span>
        </div>
        <div class="sub-item-actions">
          <button type="button" class="btn-sub-action btn-sub-focus" title="在画布上查看定位">🎯 定位</button>
          <button type="button" class="btn-sub-action btn-sub-toggle-edit" title="编辑子热点信息">✏️ 编辑</button>
          <button type="button" class="btn-sub-action btn-sub-delete" title="删除此子热点">🗑️</button>
        </div>
      </div>
      <div class="sub-hotspot-edit-panel" id="editPanel_${sub.id}" style="${isSelected ? "" : "display:none;"}">
        <div class="sub-edit-row">
          <div class="sub-edit-field" style="flex: 1;">
            <label>子热点名称 (Label)</label>
            <input type="text" class="admin-input sub-input-label" value="${escapeHtml(sub.label || "")}" placeholder="例如: Twin-Scroll Turbo">
          </div>
          <div class="sub-edit-field" style="flex: 1;">
            <label>分类眉题 (Eyebrow)</label>
            <input type="text" class="admin-input sub-input-eyebrow" value="${escapeHtml(sub.eyebrow || "")}" placeholder="例如: FORCED INDUCTION">
          </div>
        </div>
        <div class="sub-edit-field">
          <label>详情标题 (Title)</label>
          <input type="text" class="admin-input sub-input-title" value="${escapeHtml(sub.title || "")}" placeholder="例如: Hot-V Twin-Scroll Turbocharger">
        </div>
        <div class="sub-edit-field">
          <label>图文详细说明 (Description)</label>
          <textarea class="admin-input sub-input-desc" rows="2" placeholder="部件细节与技术亮点说明...">${escapeHtml(sub.description || "")}</textarea>
        </div>
        <div class="sub-coords-row">
          <div class="sub-edit-field">
            <label>X 坐标 (%)</label>
            <input type="number" step="0.1" class="admin-input sub-coord-x" value="${parseFloat(sub.x || 50).toFixed(1)}">
          </div>
          <div class="sub-edit-field">
            <label>Y 坐标 (%)</label>
            <input type="number" step="0.1" class="admin-input sub-coord-y" value="${parseFloat(sub.y || 50).toFixed(1)}">
          </div>
        </div>
        <div class="sub-panel-actions">
          <button type="button" class="admin-btn admin-btn-secondary btn-sub-save" style="font-size: 11px; padding: 4px 10px;">✓ 应用子热点修改</button>
        </div>
      </div>
    `;
  }).join("");

  parent.subHotspots.forEach(sub => {
    const row = subHotspotsManagerList.querySelector(`.sub-hotspot-item[data-sub-id="${sub.id}"]`);
    const editPanel = document.getElementById(`editPanel_${sub.id}`);
    if (!row || !editPanel) return;

    row.querySelector(".btn-sub-focus").addEventListener("click", (e) => {
      e.stopPropagation();
      selectedSubHotspotId = sub.id;
      if (currentSubHotspotParentId !== parent.id) {
        enterSubHotspotMode(parent.id);
      } else {
        renderCanvas();
      }
    });

    row.querySelector(".btn-sub-toggle-edit").addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = editPanel.style.display !== "none";
      editPanel.style.display = isVisible ? "none" : "";
      row.classList.toggle("is-editing", !isVisible);
      if (!isVisible) {
        selectedSubHotspotId = sub.id;
        if (currentSubHotspotParentId !== parent.id) {
          enterSubHotspotMode(parent.id);
        } else {
          renderCanvas();
        }
      }
    });

    row.querySelector(".btn-sub-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      showCustomConfirm({
        title: "删除子热点",
        message: `确定要删除子热点「${sub.label || sub.id}」吗？`,
        confirmText: "确认删除",
        isDanger: true,
        onConfirm: () => {
          deleteSubHotspot(parent.id, sub.id);
        }
      });
    });

    editPanel.querySelector(".btn-sub-save").addEventListener("click", () => {
      sub.label = editPanel.querySelector(".sub-input-label").value.trim() || sub.label;
      sub.eyebrow = editPanel.querySelector(".sub-input-eyebrow").value.trim();
      sub.title = editPanel.querySelector(".sub-input-title").value.trim();
      sub.description = editPanel.querySelector(".sub-input-desc").value.trim();
      sub.x = `${parseFloat(editPanel.querySelector(".sub-coord-x").value || 50).toFixed(1)}%`;
      sub.y = `${parseFloat(editPanel.querySelector(".sub-coord-y").value || 50).toFixed(1)}%`;
      renderCanvas();
      renderSubHotspotsManagerList(parent);
      setUnsaved(true);
      showToast(`已更新子热点「${sub.label}」！`, "success");
    });
  });
}

function getSpecsFromEditor() {
  const result = [];
  specsEditorList.querySelectorAll(".spec-edit-row").forEach(row => {
    const k = row.querySelector(".spec-key").value.trim();
    const v = row.querySelector(".spec-val").value.trim();
    if (k || v) result.push([k, v]);
  });
  return result;
}

function applyHotspotFormChanges() {
  const item = currentConfig.hotspots.find(h => h.id === selectedHotspotId);
  if (!item) return;

  const newId = hotspotIdInput.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!newId) {
    showToast("请输入有效热点 ID", "error");
    return;
  }

  // Check unique ID if changed
  if (newId !== item.id && currentConfig.hotspots.some(h => h.id === newId)) {
    showToast("热点 ID 已存在，请使用唯一标识", "error");
    return;
  }

  item.id = newId;
  item.label = hotspotLabelInput.value.trim();
  item.type = typeVideoRadio.checked ? "video" : "image";
  item.x = `${parseFloat(coordXInput.value || 50).toFixed(1)}%`;
  item.y = `${parseFloat(coordYInput.value || 50).toFixed(1)}%`;

  if (item.type === "video") {
    item.forwardVideo = forwardVideoInput.value.trim();
    item.reverseVideo = reverseVideoInput.value.trim();
    delete item.imageSrc;
  } else {
    item.imageSrc = detailImageInput.value.trim();
    delete item.forwardVideo;
    delete item.reverseVideo;
  }

  item.eyebrow = hotspotEyebrowInput.value.trim();
  item.title = hotspotTitleInput.value.trim();
  item.description = hotspotDescInput.value.trim();
  item.specs = getSpecsFromEditor();

  selectedHotspotId = item.id;
  renderCanvas();
  renderHotspotsStrip();
  setUnsaved(true);
  showToast(`热点「${item.label}」已更新！`, "success");
}

// ==========================================================================
// Mode Switching & Live Interaction Testing
// ==========================================================================

function setMode(mode) {
  currentMode = mode;
  modeEditBtn.classList.toggle("active", mode === "edit");
  modeTestBtn.classList.toggle("active", mode === "test");

  adminStage.classList.toggle("test-mode", mode === "test");

  if (mode === "edit") {
    resetTestViewer();
  } else {
    showToast("已切换到「交互测试模式」，点击热点可模拟买家体验！", "success");
  }
}

async function testHotspotInteraction(item) {
  if (testState.isAnimating) return;
  testState.isAnimating = true;
  testState.activeItem = item;

  adminHotspotsLayer.classList.add("hidden-during-test");
  adminTestBackBtn.classList.add("is-visible");
  if (testSubhotspotCard) testSubhotspotCard.style.display = "none";

  if (item.type === "video") {
    testState.mode = "video";
    adminTestDetailImage.classList.remove("is-active");
    adminTestVideo.src = item.forwardVideo;
    adminTestVideo.currentTime = 0;
    try {
      await adminTestVideo.play();
      adminTestVideo.classList.add("is-active");
    } catch (e) {
      console.warn("Video play failed:", e);
      adminTestVideo.classList.add("is-active");
      renderTestSubHotspots(item);
    }
  } else {
    testState.mode = "image";
    adminTestVideo.classList.remove("is-active");
    adminTestDetailImage.src = item.imageSrc;
    adminTestDetailImage.classList.add("is-active");
    renderTestSubHotspots(item);
  }

  testState.isAnimating = false;
}

function renderTestSubHotspots(item) {
  if (!adminTestSubHotspotsLayer) return;
  adminTestSubHotspotsLayer.innerHTML = "";
  if (!item || !Array.isArray(item.subHotspots) || item.subHotspots.length === 0) {
    adminTestSubHotspotsLayer.style.display = "none";
    return;
  }
  adminTestSubHotspotsLayer.style.display = "block";
  item.subHotspots.forEach(sub => {
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "admin-hotspot-pin sub-pin";
    pin.style.left = sub.x;
    pin.style.top = sub.y;
    pin.style.pointerEvents = "auto";
    pin.innerHTML = `
      <span class="pin-icon">✦</span>
      <span class="pin-label">${escapeHtml(sub.label || sub.id)}</span>
    `;
    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      openTestSubCard(sub);
    });
    adminTestSubHotspotsLayer.appendChild(pin);
  });
}

function openTestSubCard(sub) {
  if (!testSubhotspotCard) return;
  testCardEyebrow.textContent = sub.eyebrow || "SUB-HOTSPOT DETAIL";
  testCardTitle.textContent = sub.title || sub.label || sub.id;
  testCardDesc.textContent = sub.description || "无详细描述";
  if (testCardSpecs) {
    testCardSpecs.innerHTML = (sub.specs || []).map(([k, v]) => `
      <div class="test-subspec-row">
        <span class="test-subspec-k">${escapeHtml(k)}</span>
        <span class="test-subspec-v">${escapeHtml(v)}</span>
      </div>
    `).join("");
  }
  testSubhotspotCard.style.display = "block";
}

async function handleTestBack() {
  if (testState.isAnimating) return;
  testState.isAnimating = true;

  if (testSubhotspotCard) testSubhotspotCard.style.display = "none";
  if (adminTestSubHotspotsLayer) {
    adminTestSubHotspotsLayer.innerHTML = "";
    adminTestSubHotspotsLayer.style.display = "none";
  }

  const item = testState.activeItem;
  if (testState.mode === "video" && item && item.reverseVideo) {
    testState.mode = "reverse";
    adminTestVideo.src = item.reverseVideo;
    adminTestVideo.currentTime = 0;
    try {
      await adminTestVideo.play();
    } catch (e) {
      resetTestViewer();
    }
  } else {
    resetTestViewer();
  }
}

function resetTestViewer() {
  adminTestVideo.pause();
  adminTestVideo.removeAttribute("src");
  adminTestVideo.classList.remove("is-active");

  adminTestDetailImage.removeAttribute("src");
  adminTestDetailImage.classList.remove("is-active");

  adminHotspotsLayer.classList.remove("hidden-during-test");
  adminTestBackBtn.classList.remove("is-visible");

  if (adminTestSubHotspotsLayer) {
    adminTestSubHotspotsLayer.innerHTML = "";
    adminTestSubHotspotsLayer.style.display = "none";
  }
  if (testSubhotspotCard) {
    testSubhotspotCard.style.display = "none";
  }

  testState.activeItem = null;
  testState.mode = "normal";
  testState.isAnimating = false;
}

if (adminTestVideo) {
  adminTestVideo.addEventListener("ended", () => {
    if (testState.mode === "video") {
      if (testState.activeItem) {
        renderTestSubHotspots(testState.activeItem);
      }
    } else if (testState.mode === "reverse") {
      resetTestViewer();
    }
  });
}

// ==========================================================================
// File Upload Controller (Base64 -> /api/upload)
// ==========================================================================

async function handleFileUpload(fileInput, onTargetUrlReceived) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  showToast(`正在上传文件: ${file.name}...`, "success");

  // Read as base64
  const reader = new FileReader();
  reader.onload = async () => {
    const base64Data = reader.result;
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileData: base64Data
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.url) {
          onTargetUrlReceived(data.url);
          showToast(`文件「${file.name}」上传成功！`, "success");
          setUnsaved(true);
          return;
        }
      }
    } catch (err) {
      console.warn("Server upload failed, falling back to local ObjectURL/DataURL:", err);
    }

    // Fallback: local object URL
    const localUrl = URL.createObjectURL(file);
    onTargetUrlReceived(localUrl);
    showToast(`本地文件已就绪: ${file.name}`, "success");
    setUnsaved(true);
  };

  reader.onerror = () => {
    showToast("读取文件失败", "error");
  };

  reader.readAsDataURL(file);
}

// ==========================================================================
// Save, Reset, Export & Import
// ==========================================================================

async function saveAllConfig() {
  currentConfig.vehicleId = currentVehicleId;
  try {
    window.JRCG.saveConfig(currentConfig);
    setUnsaved(false);
    showToast('配置已保存；同一浏览器的首页、计算器和总览已更新。', 'success');
  } catch {
    setUnsaved(true);
    showToast('未能保存。浏览器储存空间不足或被禁用，请先导出配置备份。', 'error');
  }
}

async function resetToDefaults() {
  const vehName = currentConfig.vehicleName || currentVehicleId;
  showCustomConfirm({
    title: `恢复「${vehName}」出厂配置`,
    message: `确定要恢复默认预设的 ${vehName} 车辆配置吗？未保存的自定义数据将被覆盖。`,
    confirmText: "确认恢复",
    isDanger: true,
    onConfirm: async () => {
      try {
        await fetch(`/api/reset-config?vehicleId=${encodeURIComponent(currentVehicleId)}`, { method: "POST" });
      } catch (e) {}

      const localKey = currentVehicleId === "audi-s5" ? "japan_recon_viewer_config" : `japan_recon_viewer_config_${currentVehicleId}`;
      localStorage.removeItem(localKey);
      await fetchConfig(currentVehicleId);
      renderCanvas();
      renderHotspotsStrip();
      if (currentConfig.hotspots.length > 0) {
        selectHotspot(currentConfig.hotspots[0].id);
      }
      syncVehicleSettingsTab();
      setUnsaved(false);
      showToast(`已恢复「${vehName}」出厂默认展示配置！`, "success");
    }
  });
}

function exportConfigJSON() {
  const jsonStr = JSON.stringify(currentConfig, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `recon-viewer-config-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("配置 JSON 文件已下载！", "success");
}

function syncVehicleSettingsTab() {
  if (mainImageUrlInput) mainImageUrlInput.value = currentConfig.mainImage || "";
  if (mainImagePreview) mainImagePreview.src = currentConfig.mainImage || "";
  if (vehicleNameInput) vehicleNameInput.value = currentConfig.vehicleName || "Audi S5 Avant";
  if (vehiclePriceInput) vehiclePriceInput.value = currentConfig.price || "RM 438,000";
  if (vehicleSubInput) vehicleSubInput.value = currentConfig.vehicleSub || "";
  if (vehicleYearInput) vehicleYearInput.value = currentConfig.year || "2021";
  if (vehicleMileageInput) vehicleMileageInput.value = currentConfig.mileage || "18,500 km";
  if (vehicleEngineInput) vehicleEngineInput.value = currentConfig.engine || "3.0L V6 Turbo";

  calculateDealerCosts();
}

function applyVehicleSettings() {
  currentConfig.mainImage = (mainImageUrlInput?.value || "").trim() || DEFAULT_CONFIG.mainImage;
  currentConfig.vehicleName = (vehicleNameInput?.value || "").trim() || "Audi S5 Avant";
  currentConfig.price = (vehiclePriceInput?.value || "").trim() || "RM 438,000";
  currentConfig.vehicleSub = (vehicleSubInput?.value || "").trim();
  currentConfig.year = (vehicleYearInput?.value || "").trim() || "2021";
  currentConfig.mileage = (vehicleMileageInput?.value || "").trim() || "18,500 km";
  currentConfig.engine = (vehicleEngineInput?.value || "").trim() || "3.0L V6 Turbo";

  // Sync to local inventoryVehicles list
  const invV = inventoryVehicles.find(v => v.id === currentVehicleId);
  if (invV) {
    invV.price = currentConfig.price;
    invV.model = currentConfig.vehicleName.replace(/^(Audi|Toyota|Lexus|Nissan|Honda)\s+/i, '');
    invV.year = currentConfig.year;
    invV.mileage = currentConfig.mileage;
    invV.engine = currentConfig.engine;
  }

  try {
    window.JRCG.saveOverrides(currentVehicleId, { price: currentConfig.price, name: currentConfig.vehicleName, year: currentConfig.year, mileage: currentConfig.mileage, engine: currentConfig.engine, image: currentConfig.mainImage, sub: currentConfig.vehicleSub });
  } catch {
    showToast('车辆资料未保存，请检查浏览器储存空间。', 'error');
    return;
  }


  renderCanvas();
  syncHomepagePanelData();
  setUnsaved(true);
  pushHistory(`更新车辆信息与价格: ${currentConfig.vehicleName} (${currentConfig.price})`);
  showToast("✓ 整车规格与价格已成功更新并关联同步至前台！", "success");
}

function switchInspectorTab(tabName) {
  if (tabHotspotBtn) tabHotspotBtn.classList.toggle("active", tabName === "hotspot");
  if (tabVehicleBtn) tabVehicleBtn.classList.toggle("active", tabName === "vehicle");
  if (tabLeadsBtn) tabLeadsBtn.classList.toggle("active", tabName === "leads");
  if (tabHomepageBtn) tabHomepageBtn.classList.toggle("active", tabName === "homepage");
  if (tabHistoryBtn) tabHistoryBtn.classList.toggle("active", tabName === "history");
  if (tabToolsBtn) tabToolsBtn.classList.toggle("active", tabName === "tools");
  if (tabJsonBtn) tabJsonBtn.classList.toggle("active", tabName === "json");

  if (panelHotspot) panelHotspot.style.display = tabName === "hotspot" ? "" : "none";
  if (panelVehicle) panelVehicle.style.display = tabName === "vehicle" ? "" : "none";
  if (panelLeads) panelLeads.style.display = tabName === "leads" ? "" : "none";
  if (panelHomepage) panelHomepage.style.display = tabName === "homepage" ? "" : "none";
  if (panelHistory) panelHistory.style.display = tabName === "history" ? "" : "none";
  if (panelTools) panelTools.style.display = tabName === "tools" ? "" : "none";
  if (panelJson) panelJson.style.display = tabName === "json" ? "" : "none";

  if (tabName === "json" && jsonConfigTextarea) {
    jsonConfigTextarea.value = JSON.stringify(currentConfig, null, 2);
  }
  if (tabName === "leads") {
    fetchLeads();
  }
  if (tabName === "homepage") {
    syncHomepagePanelData();
  }
  if (tabName === "history") {
    renderHistoryTimeline();
  }
  if (tabName === "vehicle") {
    calculateDealerCosts();
  }
  if (tabName === "tools") {
    initWatermarkGenerator();
  }
}

function syncHomepagePanelData() {
  const featuredSelect = document.getElementById("featuredHeroSelect");
  const heroTagInput = document.getElementById("heroSlideTagInput");
  const heroActionSelect = document.getElementById("heroSlideActionSelect");
  const previewTag = document.getElementById("previewHeroTag");
  const previewBrand = document.getElementById("previewHeroBrand");
  const previewTitle = document.getElementById("previewHeroTitle");
  const previewPrice = document.getElementById("previewHeroPrice");
  const calcPrice = document.getElementById("calcSyncPrice");
  const calcMonthly = document.getElementById("calcSyncMonthly");
  const calcOutlay = document.getElementById("calcSyncOutlay");
  const openCalcBtn = document.getElementById("openDedicatedCalcBtn");
  const headerCalc = document.getElementById("headerCalcLink");

  // Load hero slider configuration
  let heroConfig = null;
  try {
    heroConfig = JSON.parse(localStorage.getItem("jrcg_hero_slider") || "null");
  } catch(e) {}

  const activeHeroId = heroConfig?.featuredId || currentVehicleId || "audi-s5";
  if (featuredSelect && !featuredSelect.dataset.userChanged) {
    featuredSelect.value = activeHeroId;
  }
  if (heroTagInput && heroConfig?.tag && !heroTagInput.dataset.userChanged) {
    heroTagInput.value = heroConfig.tag;
  }
  if (heroActionSelect && heroConfig?.action && !heroActionSelect.dataset.userChanged) {
    heroActionSelect.value = heroConfig.action;
  }

  // Update preview box
  const heroV = inventoryVehicles.find(v => v.id === (featuredSelect ? featuredSelect.value : activeHeroId)) || inventoryVehicles[0];
  if (heroV) {
    if (previewBrand) previewBrand.textContent = heroV.brand;
    if (previewTitle) previewTitle.textContent = `${heroV.model} (${heroV.year})`;
    if (previewPrice) previewPrice.textContent = heroV.price || "RM 438,000";
    if (previewTag && heroTagInput) previewTag.textContent = heroTagInput.value || "TOP RECON SELECTION";
  }

  // Update live theme picker state
  let currentTheme = "apex";
  try {
    currentTheme = localStorage.getItem("jrcg_theme") || "platinum";
  } catch(e) {}
  document.querySelectorAll(".theme-choice-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === currentTheme);
  });

  // Update dedicated calculator simulation for current vehicle
  const targetCar = inventoryVehicles.find(v => v.id === currentVehicleId) || inventoryVehicles[0];
  const priceNum = parseVehiclePrice(currentConfig.price || targetCar.price || "438000");
  const principal = priceNum * 0.9;
  const interest = principal * 0.025 * 7;
  const monthly = Math.round((principal + interest) / 84);
  const roadTax = calculateJpjTaxForVehicle(targetCar);
  const insurance = Math.round(priceNum * 0.024 * 0.45 + 250);
  const totalOutlay = Math.round(priceNum * 0.1 + roadTax + insurance + 2000);

  if (calcPrice) calcPrice.textContent = `RM ${priceNum.toLocaleString()}`;
  if (calcMonthly) calcMonthly.textContent = `RM ${monthly.toLocaleString()} / mo`;
  if (calcOutlay) calcOutlay.textContent = `RM ${totalOutlay.toLocaleString()}`;

  const calcUrl = `calculator.html?vehicle=${encodeURIComponent(currentVehicleId)}`;
  if (openCalcBtn) openCalcBtn.href = calcUrl;
  if (headerCalc) headerCalc.href = calcUrl;
}

function calculateJpjTaxForVehicle(vehicle) {
  if (!vehicle) return 2120;
  const eng = vehicle.engine || "";
  const match = eng.match(/(\d+\.\d+)L/i);
  const liters = match ? parseFloat(match[1]) : 3.0;
  if (liters <= 1.6) return 90;
  if (liters <= 2.0) return 280 + Math.round((liters * 1000 - 1800) * 0.5);
  if (liters <= 2.5) return 380 + Math.round((liters * 1000 - 2000) * 1.0);
  if (liters <= 3.0) return 880 + Math.round((liters * 1000 - 2500) * 2.5);
  return 2130 + Math.round((liters * 1000 - 3000) * 4.5);
}

function initHomepageSyncEvents() {
  const featuredSelect = document.getElementById("featuredHeroSelect");
  const heroTagInput = document.getElementById("heroSlideTagInput");
  const heroActionSelect = document.getElementById("heroSlideActionSelect");
  const syncBtn = document.getElementById("syncToHomepageBtn");
  const previewTag = document.getElementById("previewHeroTag");
  const previewBrand = document.getElementById("previewHeroBrand");
  const previewTitle = document.getElementById("previewHeroTitle");
  const previewPrice = document.getElementById("previewHeroPrice");

  if (featuredSelect) {
    featuredSelect.addEventListener("change", () => {
      featuredSelect.dataset.userChanged = "true";
      const selId = featuredSelect.value;
      const v = inventoryVehicles.find(item => item.id === selId);
      if (v) {
        if (previewBrand) previewBrand.textContent = v.brand;
        if (previewTitle) previewTitle.textContent = `${v.model} (${v.year})`;
        if (previewPrice) previewPrice.textContent = v.price || "RM 438,000";
      }
    });
  }

  if (heroTagInput) {
    heroTagInput.addEventListener("input", () => {
      heroTagInput.dataset.userChanged = "true";
      if (previewTag) previewTag.textContent = heroTagInput.value || "TOP RECON SELECTION";
    });
  }

  if (syncBtn) {
    syncBtn.addEventListener("click", () => {
      const heroId = featuredSelect ? featuredSelect.value : "audi-s5";
      const tag = heroTagInput ? heroTagInput.value.trim() : "TOP RECON SELECTION · 3D INTERACTIVE TOUR";
      const action = heroActionSelect ? heroActionSelect.value : "inspect";

      const payload = { featuredId: heroId, tag, action, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem("jrcg_hero_slider", JSON.stringify(payload));
        window.JRCG.notify("hero");
      } catch(e) {
        showToast("无法保存首页设置，请检查浏览器储存空间。", "error");
        return;
      }

      showToast("⚡ 展厅首页轮播主推与特点标签已同步更新！", "success");
      pushHistory(`同步首页轮播首推配置: ${heroId}`);
    });
  }

  // Theme Choice Buttons
  document.querySelectorAll(".theme-choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTheme = btn.dataset.theme;
      try {
        localStorage.setItem("jrcg_theme", targetTheme);
        window.JRCG.notify("theme");
      } catch(e) {
        showToast("无法保存主题，请检查浏览器储存空间。", "error");
        return;
      }
      document.querySelectorAll(".theme-choice-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showToast(`🎨 全局展厅主题已切换为 ${btn.querySelector("strong")?.textContent || targetTheme}！`, "success");
      pushHistory(`切换全局展厅主题: ${targetTheme}`);
    });
  });
}

// ==========================================================================
// 1. Activity Log & Version History (Undo / Redo)
// ==========================================================================

function pushHistory(description = "编辑操作") {
  if (isPerformingHistoryAction) return;
  if (historyIndex < historyStack.length - 1) {
    historyStack = historyStack.slice(0, historyIndex + 1);
  }
  const snapshot = {
    config: JSON.parse(JSON.stringify(currentConfig)),
    vehicleId: currentVehicleId,
    description,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  };
  historyStack.push(snapshot);
  if (historyStack.length > 50) historyStack.shift();
  historyIndex = historyStack.length - 1;
  updateHistoryControls();
}

function undo() {
  if (historyIndex <= 0) {
    showToast("已处于最旧的历史版本", "info");
    return;
  }
  historyIndex--;
  restoreHistorySnapshot(historyStack[historyIndex]);
  showToast(`已撤销操作: ${historyStack[historyIndex].description}`, "info");
}

function redo() {
  if (historyIndex >= historyStack.length - 1) {
    showToast("已处于最新的历史版本", "info");
    return;
  }
  historyIndex++;
  restoreHistorySnapshot(historyStack[historyIndex]);
  showToast(`已重做操作: ${historyStack[historyIndex].description}`, "info");
}

function restoreHistorySnapshot(snapshot) {
  if (!snapshot) return;
  isPerformingHistoryAction = true;
  currentConfig = JSON.parse(JSON.stringify(snapshot.config));
  if (snapshot.vehicleId && snapshot.vehicleId !== currentVehicleId && adminVehicleSelect) {
    currentVehicleId = snapshot.vehicleId;
    adminVehicleSelect.value = snapshot.vehicleId;
  }
  renderCanvas();
  renderHotspotsStrip();
  if (currentConfig.hotspots.length > 0) {
    selectHotspot(currentConfig.hotspots[0].id);
  }
  syncVehicleSettingsTab();
  setUnsaved(true);
  updateHistoryControls();
  isPerformingHistoryAction = false;
}

function updateHistoryControls() {
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyStack.length - 1;
  if (undoBtn) undoBtn.disabled = !canUndo;
  if (redoBtn) redoBtn.disabled = !canRedo;
  if (panelUndoBtn) panelUndoBtn.disabled = !canUndo;
  if (panelRedoBtn) panelRedoBtn.disabled = !canRedo;
  if (historyStepCountText) {
    historyStepCountText.textContent = `当前第 ${historyIndex + 1} 个状态 / 共 ${historyStack.length} 步历史`;
  }
  renderHistoryTimeline();
}

function renderHistoryTimeline() {
  if (!historyTimeline) return;
  historyTimeline.innerHTML = "";
  if (historyStack.length === 0) {
    historyTimeline.innerHTML = '<div class="history-item"><span class="history-item-desc">暂无操作记录</span></div>';
    return;
  }
  historyStack.forEach((item, idx) => {
    const el = document.createElement("div");
    el.className = `history-item ${idx === historyIndex ? "is-current" : ""}`;
    el.innerHTML = `
      <div class="history-item-left">
        <span class="history-item-desc">${escapeHtml(item.description)}</span>
        <span class="history-item-time">${item.timestamp} · #${idx + 1}</span>
      </div>
      <button type="button" class="history-revert-btn">${idx === historyIndex ? "● 当前状态" : "回退至此"}</button>
    `;
    const btn = el.querySelector(".history-revert-btn");
    if (btn && idx !== historyIndex) {
      btn.addEventListener("click", () => {
        historyIndex = idx;
        restoreHistorySnapshot(historyStack[idx]);
        showToast(`已恢复至状态 #${idx + 1}: ${item.description}`, "success");
      });
    }
    historyTimeline.appendChild(el);
  });
}

// ==========================================================================
// 2. Stock Cost & Dealer Profit Margin Calculator
// ==========================================================================

function calculateDealerCosts() {
  const fobJpy = parseFloat(fobJpyInput?.value) || 6800000;
  const rate = parseFloat(exchangeRateInput?.value) || 3.12;
  const fobMyr = (fobJpy / 100) * rate;
  const freight = parseFloat(oceanFreightInput?.value) || 4500;
  const duty = parseFloat(customsDutyInput?.value) || 128000;
  const ap = parseFloat(apFeeInput?.value) || 28000;
  const port = parseFloat(portPuspakomInput?.value) || 2500;
  const recon = parseFloat(reconDetailingInput?.value) || 3500;
  const marginPct = parseFloat(targetMarginPctInput?.value) || 12.5;

  const totalLanded = fobMyr + freight + duty + ap + port + recon;
  const marginAmt = totalLanded * (marginPct / 100);
  const targetPrice = totalLanded + marginAmt;
  const roundedTargetPrice = Math.round(targetPrice / 1000) * 1000;

  if (fobMyrVal) fobMyrVal.textContent = "RM " + Math.round(fobMyr).toLocaleString();
  if (totalLandedCostVal) totalLandedCostVal.textContent = "RM " + Math.round(totalLanded).toLocaleString();
  if (targetMarginAmountVal) targetMarginAmountVal.textContent = "RM " + Math.round(marginAmt).toLocaleString();
  if (recommendedPriceVal) recommendedPriceVal.textContent = "RM " + roundedTargetPrice.toLocaleString();
}

function applyRecommendedPrice() {
  if (!recommendedPriceVal || !vehiclePriceInput) return;
  const recPrice = recommendedPriceVal.textContent.trim();
  vehiclePriceInput.value = recPrice;
  currentConfig.price = recPrice;
  setUnsaved(true);
  pushHistory(`应用成本核算推荐售价: ${recPrice}`);
  showToast(`已将推荐价格「${recPrice}」设置为展示价格！`, "success");
}

// ==========================================================================
// 3. Sales Consultant Assignment & Customer Leads Management
// ==========================================================================

async function fetchLeads() {
  currentLeads = window.JRCG.appointments();
  currentConsultants = [
    {id: 'kenji', name: 'Kenji Tanaka', role: 'Recon Specialist'}, {id: 'sarah', name: 'Sarah Lim', role: 'Performance Specialist'},
    {id: 'david', name: 'David Wong', role: 'JDM Specialist'}, {id: 'farhan', name: 'Farhan Razak', role: 'Financing Specialist'}
  ];
  renderLeadsList(); updateLeadStats();
}

function updateLeadStats() {
  const total = currentLeads.length;
  const n = currentLeads.filter(l => l.status === "new").length;
  const c = currentLeads.filter(l => l.status === "confirmed").length;
  const cont = currentLeads.filter(l => l.status === "contacted").length;

  if (statLeadsTotal) statLeadsTotal.textContent = total;
  if (statLeadsNew) statLeadsNew.textContent = n;
  if (statLeadsConfirmed) statLeadsConfirmed.textContent = c;
  if (statLeadsContacted) statLeadsContacted.textContent = cont;
  if (leadsTabBadge) leadsTabBadge.textContent = n > 0 ? n : total;
  if (mobileLeadsBadge) mobileLeadsBadge.textContent = n > 0 ? n : total;
}

function renderLeadsList() {
  if (!leadsContainer) return;
  leadsContainer.innerHTML = "";
  const filtered = activeLeadFilter === "all" ? currentLeads : currentLeads.filter(l => l.status === activeLeadFilter);

  if (filtered.length === 0) {
    leadsContainer.innerHTML = '<div class="leads-loading">暂无符合条件的客户线索</div>';
    return;
  }

  filtered.forEach(lead => {
    const card = document.createElement("div");
    card.className = "lead-card";
    const statusMap = {
      new: { label: "🆕 待联系", class: "new" },
      confirmed: { label: "📅 预约看车", class: "confirmed" },
      contacted: { label: "📞 跟进中", class: "contacted" },
      won: { label: "✅ 已预定成交", class: "confirmed" }
    };
    const st = statusMap[lead.status] || { label: lead.status, class: "new" };

    const consultantOpts = currentConsultants.map(c => 
      `<option value="${c.id}" ${c.id === lead.assignedConsultantId ? "selected" : ""}>${c.name} (${c.role.split(" ")[0]})</option>`
    ).join("");

    const consultantObj = currentConsultants.find(c => c.id === lead.assignedConsultantId) || currentConsultants[0];
    const waText = encodeURIComponent(
      `Hello ${lead.customerName}! This is ${consultantObj ? consultantObj.name : "Sales Consultant"} from Japan Recon Car Gallery. Regarding your viewing interest in the ${lead.vehicleName || "showroom vehicle"} (${lead.preferredDate || "preferred date"}), I would be glad to arrange key access & test drive. Please let me know if you have any questions!`
    );
    const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");
    const waUrl = cleanPhone ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${waText}` : `https://api.whatsapp.com/send?text=${waText}`;

    card.innerHTML = `
      <div class="lead-card-header">
        <div class="lead-customer-info">
          <h4>${escapeHtml(lead.customerName)}</h4>
          <a href="tel:${escapeHtml(lead.phone)}" class="lead-customer-phone">📞 ${escapeHtml(lead.phone)}</a>
        </div>
        <span class="lead-status-badge ${st.class}">${st.label}</span>
      </div>
      <div class="lead-meta-row">
        <span>🚗 <strong>${escapeHtml(lead.vehicleName || "Audi S5")}</strong> (${escapeHtml(lead.price || "")})</span>
        <span>🏢 ${escapeHtml(lead.branch || "Glenmarie 3S")}</span>
        <span>🗓️ ${escapeHtml(lead.preferredDate || "尽快安排")}</span>
        <span>🎯 ${escapeHtml(lead.inquiryType || "看车")}</span>
      </div>
      ${lead.notes ? `<div class="lead-notes-box">📝 ${escapeHtml(lead.notes)}</div>` : ""}
      <div class="lead-assign-row">
        <span class="lead-assign-label">指派顾问:</span>
        <select class="lead-consultant-select lead-assign-select" data-lead-id="${lead.id}">
          ${consultantOpts}
        </select>
        <select class="lead-consultant-select lead-status-select" data-lead-id="${lead.id}" style="max-width:110px;">
          <option value="new" ${lead.status === "new" ? "selected" : ""}>待联系</option>
          <option value="contacted" ${lead.status === "contacted" ? "selected" : ""}>跟进中</option>
          <option value="confirmed" ${lead.status === "confirmed" ? "selected" : ""}>已预约</option>
          <option value="won" ${lead.status === "won" ? "selected" : ""}>已成交</option>
          <option value="completed" ${lead.status === "completed" ? "selected" : ""}>已完成</option>
          <option value="cancelled" ${lead.status === "cancelled" ? "selected" : ""}>已取消</option>
        </select>
      </div>
      <div class="lead-actions-bar">
        <a href="${waUrl}" target="_blank" class="lead-action-btn whatsapp">
          <span>💬 WhatsApp 一键回复客户</span>
        </a>
        <a href="tel:${escapeHtml(lead.phone)}" class="lead-action-btn call">
          <span>📞 致电</span>
        </a>
      </div>
    `;

    const selConsultant = card.querySelector(".lead-assign-select");
    if (selConsultant) {
      selConsultant.addEventListener("change", async (e) => {
        await updateLeadAssignment(lead.id, { assignedConsultantId: e.target.value });
      });
    }

    const selStatus = card.querySelector(".lead-status-select");
    if (selStatus) {
      selStatus.addEventListener("change", async (e) => {
        await updateLeadAssignment(lead.id, { status: e.target.value });
      });
    }

    leadsContainer.appendChild(card);
  });
}

async function updateLeadAssignment(leadId, updates) {
  try {
    const lead = window.JRCG.updateAppointment(leadId, updates);
    await fetchLeads();
    showToast('预约跟进状态已保存到此浏览器。', 'success');
    pushHistory('更新预约跟进: ' + lead.customerName);
  } catch { showToast('更新失败，请检查浏览器储存空间。', 'error'); }
}

async function handleConfirmAddLead() {
  const name = document.getElementById("leadFormName")?.value.trim();
  const phone = document.getElementById("leadFormPhone")?.value.trim();
  const vehicle = document.getElementById("leadFormVehicle")?.value.trim() || "Audi S5 Avant";
  const branch = document.getElementById("leadFormBranch")?.value || "Glenmarie 3S Flagship";
  const type = document.getElementById("leadFormType")?.value || "展厅看车预约";
  const consultantId = document.getElementById("leadFormConsultant")?.value || "kenji";
  const notes = document.getElementById("leadFormNotes")?.value.trim() || "";

  if (!name || !phone) {
    showToast("请填写客户姓名与电话", "error");
    return;
  }

  try {
    const selectedVehicle = window.JRCG.catalog().find(item => item.brand + ' ' + item.model === vehicle);
    window.JRCG.addAppointment({ customerName: name, phone, vehicleId: selectedVehicle?.id || currentVehicleId, vehicleName: vehicle, branch, inquiryType: type, notes, assignedConsultantId: consultantId });
    addLeadDialog?.close(); await fetchLeads();
    pushHistory('新增预约线索: ' + name);
    showToast('预约线索已保存到此浏览器。', 'success');
  } catch { showToast('未保存，请检查浏览器储存空间。', 'error'); }
}



// ==========================================================================
// 4. Hotspot Template Duplication
// ==========================================================================

function openDuplicateTemplateDialog() {
  if (dupSourceVehicle) {
    dupSourceVehicle.value = `${currentConfig.vehicleName || currentVehicleId} (当前车辆)`;
  }
  if (duplicateTemplateDialog) duplicateTemplateDialog.showModal();
}

async function handleConfirmDuplicateTemplate() {
  const targetId = dupTargetVehicleSelect?.value;
  const modeRadio = document.querySelector('input[name="dupModeRadio"]:checked');
  const mode = modeRadio ? modeRadio.value : "replace";

  if (!targetId) {
    showToast("请选择目标车辆", "error");
    return;
  }

  try {
    const res = await fetch("/api/duplicate-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceVehicleId: currentVehicleId,
        targetVehicleId: targetId,
        mergeMode: mode
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (duplicateTemplateDialog) duplicateTemplateDialog.close();
      showToast(`已成功将热点模板复制至 ${targetId}！`, "success");
      pushHistory(`复制热点模板: ${currentVehicleId} -> ${targetId}`);

      showCustomConfirm({
        title: "模板复制成功",
        message: `已将全套热点坐标结构复制到「${targetId}」，是否立即切换至该车辆微调？`,
        confirmText: "立即切换至目标车",
        isDanger: false,
        onConfirm: () => {
          if (adminVehicleSelect) {
            adminVehicleSelect.value = targetId;
            switchVehicle(targetId);
          }
        }
      });
    } else {
      showToast(data.error || "复制失败", "error");
    }
  } catch (e) {
    showToast("网络请求失败，未能复制模板", "error");
  }
}

// ==========================================================================
// 5. Automatic Watermark Generator
// ==========================================================================

function initWatermarkGenerator() {
  if (!watermarkCanvas) return;
  const ctx = watermarkCanvas.getContext("2d");

  function drawWatermark() {
    ctx.clearRect(0, 0, watermarkCanvas.width, watermarkCanvas.height);
    if (!watermarkImageObj) {
      ctx.fillStyle = "#161c24";
      ctx.fillRect(0, 0, watermarkCanvas.width, watermarkCanvas.height);
      ctx.fillStyle = "#64748b";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("请上传或拖拽车辆实拍照片查看水印效果", watermarkCanvas.width / 2, watermarkCanvas.height / 2);
      return;
    }

    ctx.drawImage(watermarkImageObj, 0, 0, watermarkCanvas.width, watermarkCanvas.height);

    const text = (watermarkTextInput?.value || "JAPAN RECON CAR GALLERY · VERIFIED STOCK").trim();
    const pos = watermarkPositionSelect?.value || "bottom-right";
    const opacity = (parseInt(watermarkOpacityRange?.value, 10) || 70) / 100;
    const scale = parseInt(watermarkScaleRange?.value, 10) || 28;

    ctx.save();
    ctx.globalAlpha = opacity;

    const fontSize = Math.max(10, Math.round((watermarkCanvas.width * scale) / 1000));
    ctx.font = `bold ${fontSize}px sans-serif`;
    const textMetrics = ctx.measureText(text);
    const badgeW = textMetrics.width + 36;
    const badgeH = fontSize + 16;

    let x = watermarkCanvas.width - badgeW - 16;
    let y = watermarkCanvas.height - badgeH - 16;

    if (pos === "bottom-left") {
      x = 16;
      y = watermarkCanvas.height - badgeH - 16;
    } else if (pos === "top-right") {
      x = watermarkCanvas.width - badgeW - 16;
      y = 16;
    } else if (pos === "center") {
      x = (watermarkCanvas.width - badgeW) / 2;
      y = (watermarkCanvas.height - badgeH) / 2;
    }

    // Badge Background Pill with Gold Accent Border
    ctx.fillStyle = "rgba(11, 14, 20, 0.82)";
    ctx.beginPath();
    ctx.roundRect(x, y, badgeW, badgeH, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(229, 193, 88, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Icon & Text
    ctx.fillStyle = "#e5c158";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("★", x + 10, y + badgeH / 2);

    ctx.fillStyle = "#f8fafc";
    ctx.fillText(text, x + 26, y + badgeH / 2);

    ctx.restore();
  }

  if (!watermarkImageObj) {
    const initImg = new Image();
    initImg.crossOrigin = "anonymous";
    initImg.onload = () => {
      watermarkImageObj = initImg;
      drawWatermark();
    };
    initImg.src = currentConfig.mainImage || "assets/audi-s5/main-car-16x9.jpg";
  } else {
    drawWatermark();
  }

  if (watermarkImageUpload) {
    watermarkImageUpload.addEventListener("change", () => {
      const file = watermarkImageUpload.files && watermarkImageUpload.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            watermarkImageObj = img;
            drawWatermark();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  [watermarkTextInput, watermarkPositionSelect, watermarkOpacityRange, watermarkScaleRange].forEach(el => {
    if (el) el.addEventListener("input", drawWatermark);
  });

  if (downloadWatermarkedBtn) {
    downloadWatermarkedBtn.addEventListener("click", () => {
      const dataUrl = watermarkCanvas.toDataURL("image/jpeg", 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `watermarked-car-${Date.now()}.jpg`;
      a.click();
      showToast("加水印图片已保存并开始下载！", "success");
    });
  }

  if (applyWatermarkToCurrentCarBtn) {
    applyWatermarkToCurrentCarBtn.addEventListener("click", () => {
      const dataUrl = watermarkCanvas.toDataURL("image/jpeg", 0.92);
      currentConfig.mainImage = dataUrl;
      if (mainImageUrlInput) mainImageUrlInput.value = dataUrl;
      if (mainImagePreview) mainImagePreview.src = dataUrl;
      renderCanvas();
      setUnsaved(true);
      pushHistory("应用防伪水印至主车图");
      showToast("已成功将加水印照片设为当前车辆主图！", "success");
    });
  }
}

// ==========================================================================
// 6. Bulk Vehicle Import via CSV / Excel
// ==========================================================================

function initCsvBulkImporter() {
  if (downloadSampleCsvBtn) {
    downloadSampleCsvBtn.addEventListener("click", () => {
      const sampleCsv = [
        "id,brand,model,year,price,mileage,engine,grade",
        "porsche-macan-s,Porsche,Macan S 2.9 V6,2022,RM 468000,12800 km,2.9L Twin-Turbo,4.5",
        "bmw-m340i,BMW,M340i xDrive Touring,2021,RM 398000,24500 km,3.0L B58 Turbo,5.0",
        "lexus-rx300,Lexus,RX 300 F Sport,2020,RM 298000,31200 km,2.0L Turbo,4.5",
        "amg-c43-estate,Mercedes-AMG,C 43 4MATIC Estate,2021,RM 378000,19500 km,3.0L V6 BiTurbo,4.5"
      ].join("\n");
      const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sample-recon-inventory.csv";
      a.click();
      URL.revokeObjectURL(url);
      showToast("CSV 标准导入模板已下载！", "success");
    });
  }

  if (csvFileInput) {
    csvFileInput.addEventListener("change", () => {
      const file = csvFileInput.files && csvFileInput.files[0];
      if (file) parseCsvFile(file);
    });
  }

  if (executeCsvImportBtn) {
    executeCsvImportBtn.addEventListener("click", async () => {
      if (!parsedCsvData || parsedCsvData.length === 0) return;
      try {
        const res = await fetch("/api/vehicles/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicles: parsedCsvData })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(`已成功批量导入 ${data.importedCount} 辆车！`, "success");
          pushHistory(`批量导入 ${data.importedCount} 辆库存车辆`);
          if (adminVehicleSelect && data.vehicles) {
            adminVehicleSelect.innerHTML = data.vehicles.map(v => 
              `<option value="${v.id}">${v.name} (${v.price})</option>`
            ).join("");
            if (parsedCsvData[0] && parsedCsvData[0].id) {
              adminVehicleSelect.value = parsedCsvData[0].id;
              switchVehicle(parsedCsvData[0].id);
            }
          }
          if (csvPreviewBox) csvPreviewBox.style.display = "none";
        }
      } catch (e) {
        showToast("批量导入失败", "error");
      }
    });
  }
}

function parseCsvFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      showToast("CSV 内容行数不足", "error");
      return;
    }
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    parsedCsvData = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map(p => p.trim());
      if (parts.length < 3) continue;
      const row = {};
      headers.forEach((h, colIdx) => {
        row[h] = parts[colIdx] || "";
      });
      parsedCsvData.push(row);
    }

    if (parsedCsvData.length > 0 && csvPreviewBox && csvPreviewTbody) {
      csvParsedCountText.textContent = `解析完成: 找到 ${parsedCsvData.length} 辆车`;
      csvPreviewTbody.innerHTML = parsedCsvData.map(r => `
        <tr>
          <td><code>${escapeHtml(r.id || "-")}</code></td>
          <td>${escapeHtml(r.brand || "-")}</td>
          <td><strong>${escapeHtml(r.model || r.name || "-")}</strong></td>
          <td>${escapeHtml(r.year || "2022")}</td>
          <td>${escapeHtml(r.price || "-")}</td>
          <td>${escapeHtml(r.mileage || "-")}</td>
          <td>${escapeHtml(r.engine || "-")}</td>
        </tr>
      `).join("");
      csvPreviewBox.style.display = "flex";
      showToast(`成功解析 CSV，包含 ${parsedCsvData.length} 辆库存车辆！`, "success");
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// 7. Drag-and-Drop Image & Video Upload
// ==========================================================================

function initDragAndDropUploader() {
  const dropZones = [
    { el: adminStage, onDrop: (file) => uploadAndSetMainImage(file) },
    { el: mainImageDropZone, onDrop: (file) => uploadAndSetMainImage(file) },
    { el: forwardVideoDropZone, onDrop: (file) => uploadAndSetHotspotVideo(file, "forward") },
    { el: reverseVideoDropZone, onDrop: (file) => uploadAndSetHotspotVideo(file, "reverse") },
    { el: imageSrcDropZone, onDrop: (file) => uploadAndSetHotspotImage(file) },
    { el: csvFileDropZone, onDrop: (file) => parseCsvFile(file) }
  ];

  dropZones.forEach(({ el, onDrop }) => {
    if (!el) return;
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.add("is-dragover");
    });
    el.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove("is-dragover");
    });
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove("is-dragover");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        onDrop(e.dataTransfer.files[0]);
      }
    });
  });
}

function uploadAndSetMainImage(file) {
  if (!file.type.startsWith("image/")) {
    showToast("请拖拽有效的图片文件 (JPG / PNG / WebP)", "error");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    currentConfig.mainImage = dataUrl;
    if (mainImageUrlInput) mainImageUrlInput.value = dataUrl;
    if (mainImagePreview) mainImagePreview.src = dataUrl;
    renderCanvas();
    setUnsaved(true);
    pushHistory("拖拽上传更新主车图");
    showToast("主车图已通过拖拽更新！", "success");
  };
  reader.readAsDataURL(file);
}

function uploadAndSetHotspotImage(file) {
  if (!file.type.startsWith("image/")) {
    showToast("请拖拽图片文件", "error");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    if (detailImageInput) detailImageInput.value = dataUrl;
    if (detailImagePreview) detailImagePreview.src = dataUrl;
    const item = currentConfig.hotspots.find(h => h.id === selectedHotspotId);
    if (item) {
      item.imageSrc = dataUrl;
      renderCanvas();
      setUnsaved(true);
      pushHistory(`更新热点图片: ${item.label}`);
      showToast(`已更新「${item.label}」特写图片！`, "success");
    }
  };
  reader.readAsDataURL(file);
}

function uploadAndSetHotspotVideo(file, type = "forward") {
  if (!file.type.startsWith("video/")) {
    showToast("请拖拽 MP4 / WebM 视频文件", "error");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const item = currentConfig.hotspots.find(h => h.id === selectedHotspotId);
    if (type === "forward") {
      if (forwardVideoInput) forwardVideoInput.value = dataUrl;
      if (forwardVideoPreview) forwardVideoPreview.src = dataUrl;
      if (item) item.forwardVideo = dataUrl;
    } else {
      if (reverseVideoInput) reverseVideoInput.value = dataUrl;
      if (reverseVideoPreview) reverseVideoPreview.src = dataUrl;
      if (item) item.reverseVideo = dataUrl;
    }
    setUnsaved(true);
    pushHistory(`更新热点视频 (${type}): ${item ? item.label : ""}`);
    showToast(`已成功上传热点 ${type === "forward" ? "正向" : "逆向"} 视频！`, "success");
  };
  reader.readAsDataURL(file);
}

// ==========================================================================
// 8. Mobile Navigation Setup
// ==========================================================================

function setupMobileNavigation() {
  if (!adminMobileNav) return;
  adminMobileNav.querySelectorAll(".mobile-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      adminMobileNav.querySelectorAll(".mobile-nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.dataset.view;

      const canvasSection = document.querySelector(".admin-canvas-section");
      const inspectorPanel = document.querySelector(".admin-inspector-panel");

      if (view === "canvas") {
        if (canvasSection) canvasSection.style.display = "";
        if (inspectorPanel) inspectorPanel.style.display = "none";
      } else {
        if (canvasSection) canvasSection.style.display = "none";
        if (inspectorPanel) inspectorPanel.style.display = "";
        switchInspectorTab(view);
      }
    });
  });

  // Adjust display when resizing back to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      const canvasSection = document.querySelector(".admin-canvas-section");
      const inspectorPanel = document.querySelector(".admin-inspector-panel");
      if (canvasSection) canvasSection.style.display = "";
      if (inspectorPanel) inspectorPanel.style.display = "";
    }
  });
}

// Quick Preset Adder
function addPresetHotspot(presetKey) {
  const presets = {
    engine: {
      id: "engine_" + Date.now().toString().slice(-4),
      label: "Engine Bay",
      type: "video",
      x: "72%",
      y: "46%",
      forwardVideo: "assets/videos/engine_forward.mp4",
      reverseVideo: "assets/videos/engine_reverse_web.mp4",
      title: "Turbocharged Engine Bay",
      eyebrow: "POWERTRAIN",
      description: "Explore the high-performance powertrain architecture.",
      specs: [["Engine", "Turbo V6"], ["Output", "High Output"]]
    },
    interior: {
      id: "interior_" + Date.now().toString().slice(-4),
      label: "Interior Cabin",
      type: "video",
      x: "54%",
      y: "38%",
      forwardVideo: "assets/videos/interior_forward.mp4",
      reverseVideo: "assets/videos/interior_reverse.mp4",
      title: "Cockpit & Cabin",
      eyebrow: "INTERIOR",
      description: "Refined materials, sport seating and driver displays.",
      specs: [["Seats", "Sport Leather"], ["Steering", "Right-Hand Drive"]]
    },
    boot: {
      id: "boot_" + Date.now().toString().slice(-4),
      label: "Rear Cargo",
      type: "video",
      x: "24%",
      y: "44%",
      forwardVideo: "assets/videos/boot_forward.mp4",
      reverseVideo: "assets/videos/boot_reverse_web.mp4",
      title: "Estate Cargo & Tailgate",
      eyebrow: "STORAGE",
      description: "Powered opening rear luggage area with foldable seats.",
      specs: [["Cargo", "Estate Storage"], ["Tailgate", "Powered"]]
    },
    wheel: {
      id: "wheel_" + Date.now().toString().slice(-4),
      label: "Wheels & Brakes",
      type: "image",
      x: "78%",
      y: "74%",
      imageSrc: "assets/audi-s5/wheel_16x9.jpg",
      title: "Alloy Wheel & Brake Hardware",
      eyebrow: "CHASSIS",
      description: "Performance alloy wheels with multi-piston calipers.",
      specs: [["Wheels", "Performance Alloy"], ["Brakes", "Ventilated Discs"]]
    },
    dashboard: {
      id: "dashboard_" + Date.now().toString().slice(-4),
      label: "Virtual Cockpit",
      type: "image",
      x: "62%",
      y: "36%",
      imageSrc: "assets/audi-s5/dashboard_16x9.jpg",
      title: "Digital Instrument Cluster",
      eyebrow: "TECHNOLOGY",
      description: "Full digital driver instrumentation display.",
      specs: [["Cluster", "High-Resolution Digital"]]
    },
    audio: {
      id: "audio_" + Date.now().toString().slice(-4),
      label: "Sound System",
      type: "image",
      x: "65%",
      y: "46%",
      imageSrc: "assets/audi-s5/audio_16x9.jpg",
      title: "Premium 3D Surround Audio",
      eyebrow: "AUDIO",
      description: "High-fidelity premium multi-speaker sound system.",
      specs: [["Speakers", "Multi-Channel DSP"]]
    }
  };

  const preset = presets[presetKey];
  if (!preset) return;

  currentConfig.hotspots.push(preset);
  selectHotspot(preset.id);
  renderCanvas();
  renderHotspotsStrip();
  setUnsaved(true);
  showToast(`已添加「${preset.label}」热点预设！`, "success");
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================

function setupEventListeners() {
  // Mode switcher
  modeEditBtn.addEventListener("click", () => setMode("edit"));
  modeTestBtn.addEventListener("click", () => setMode("test"));

  // Stage hover & click to add hotspot in Edit Mode
  adminStage.addEventListener("mousemove", (e) => {
    if (currentMode !== "edit") return;
    const rect = adminStage.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const pctX = ((x / rect.width) * 100).toFixed(1);
    const pctY = ((y / rect.height) * 100).toFixed(1);

    canvasCrosshair.querySelector(".crosshair-x").style.left = `${x}px`;
    canvasCrosshair.querySelector(".crosshair-y").style.top = `${y}px`;
    crosshairTip.style.left = `${x}px`;
    crosshairTip.style.top = `${y}px`;
    crosshairTip.textContent = `点击添加 (${pctX}%, ${pctY}%)`;

    canvasCoordsBadge.textContent = `X: ${pctX}% · Y: ${pctY}%`;
  });

  adminStage.addEventListener("click", (e) => {
    if (currentMode !== "edit") return;
    if (Date.now() - lastDragEndTime < 250) return;
    if (e.target.closest(".admin-hotspot-pin")) return;

    const rect = adminStage.getBoundingClientRect();
    const pctX = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100)).toFixed(1);
    const pctY = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100)).toFixed(1);

    // If in Sub-Hotspots Mode, add sub-hotspot inside the active parent:
    if (currentSubHotspotParentId) {
      const parent = currentConfig.hotspots.find(h => h.id === currentSubHotspotParentId);
      if (!parent) return;
      if (!Array.isArray(parent.subHotspots)) parent.subHotspots = [];

      const newSubId = `${parent.id}_sub_${Date.now().toString().slice(-4)}`;
      const newSub = {
        id: newSubId,
        label: "New Feature",
        x: `${pctX}%`,
        y: `${pctY}%`,
        title: "Part Detail Feature",
        eyebrow: "DETAIL",
        description: "Add technical or aesthetic details for this component...",
        specs: [["Part", "Verified"]]
      };

      parent.subHotspots.push(newSub);
      selectedSubHotspotId = newSubId;
      renderCanvas();
      renderSubHotspotsManagerList(parent);
      setUnsaved(true);
      showToast(`已在 (${pctX}%, ${pctY}%) 添加子热点「${newSub.label}」！`, "success");
      return;
    }

    // Main vehicle hotspot creation
    const newId = "point_" + Date.now().toString().slice(-4);
    const newHotspot = {
      id: newId,
      label: "New Hotspot",
      type: "image",
      x: `${pctX}%`,
      y: `${pctY}%`,
      imageSrc: "assets/audi-s5/wheel_16x9.jpg",
      title: "New Feature Detail",
      eyebrow: "HIGHLIGHT",
      description: "Description of the vehicle feature...",
      specs: [["Feature", "Details"]],
      subHotspots: []
    };

    currentConfig.hotspots.push(newHotspot);
    selectHotspot(newId);
    renderCanvas();
    renderHotspotsStrip();
    setUnsaved(true);
    showToast(`已在 (${pctX}%, ${pctY}%) 新建热点！`, "success");
  });

  // Test back button
  adminTestBackBtn.addEventListener("click", handleTestBack);

  // Close test subcard
  if (testCardCloseBtn) {
    testCardCloseBtn.addEventListener("click", () => {
      if (testSubhotspotCard) testSubhotspotCard.style.display = "none";
    });
  }

  // Strip Clean Test Hotspots Button
  if (cleanTestHotspotsBtn) {
    cleanTestHotspotsBtn.addEventListener("click", () => {
      const testItems = currentConfig.hotspots.filter(h =>
        h.id.startsWith("point_") ||
        h.label === "New Hotspot" ||
        h.label === "Custom Hotspot"
      );
      if (testItems.length === 0) {
        showToast("当前没有未命名的临时测试热点", "info");
        return;
      }
      showCustomConfirm({
        title: "清理测试热点",
        message: `共发现 ${testItems.length} 个临时测试热点，确定全部清理吗？`,
        confirmText: "清理全部测试点",
        isDanger: true,
        onConfirm: () => {
          currentConfig.hotspots = currentConfig.hotspots.filter(h =>
            !h.id.startsWith("point_") &&
            h.label !== "New Hotspot" &&
            h.label !== "Custom Hotspot"
          );
          if (currentConfig.hotspots.length > 0) {
            selectHotspot(currentConfig.hotspots[0].id);
          } else {
            selectedHotspotId = null;
            clearHotspotInspector();
          }
          renderCanvas();
          renderHotspotsStrip();
          setUnsaved(true);
          showToast(`已成功清理 ${testItems.length} 个测试热点！`, "success");
        }
      });
    });
  }

  // Sub-Hotspots Mode buttons
  if (exitSubHotspotViewBtn) {
    exitSubHotspotViewBtn.addEventListener("click", exitSubHotspotMode);
  }

  if (openSubHotspotModeBtn) {
    openSubHotspotModeBtn.addEventListener("click", () => {
      if (!selectedHotspotId) {
        showToast("请先选择一个热点", "info");
        return;
      }
      enterSubHotspotMode(selectedHotspotId);
    });
  }

  if (addSubHotspotBtn) {
    addSubHotspotBtn.addEventListener("click", () => {
      const parent = currentConfig.hotspots.find(h => h.id === selectedHotspotId);
      if (!parent) {
        showToast("请先选择一个热点", "info");
        return;
      }
      if (!Array.isArray(parent.subHotspots)) parent.subHotspots = [];
      const newSubId = `${parent.id}_sub_${Date.now().toString().slice(-4)}`;
      const newSub = {
        id: newSubId,
        label: "New Feature",
        x: "50%",
        y: "50%",
        title: "Feature Detail",
        eyebrow: "DETAIL",
        description: "Add details for this sub-component...",
        specs: [["Part", "Verified"]]
      };
      parent.subHotspots.push(newSub);
      selectedSubHotspotId = newSubId;
      if (currentSubHotspotParentId !== parent.id) {
        enterSubHotspotMode(parent.id);
      } else {
        renderCanvas();
        renderSubHotspotsManagerList(parent);
      }
      setUnsaved(true);
      showToast(`已为「${parent.label || parent.id}」添加子热点，请调整位置与描述！`, "success");
    });
  }

  // Strip Add Button
  document.getElementById("stripAddBtn").addEventListener("click", () => {
    const newId = "point_" + Date.now().toString().slice(-4);
    const newHotspot = {
      id: newId,
      label: "Custom Hotspot",
      type: "video",
      x: "50%",
      y: "50%",
      forwardVideo: "assets/videos/engine_forward.mp4",
      reverseVideo: "assets/videos/engine_reverse_web.mp4",
      title: "New Interaction",
      eyebrow: "INSPECTION",
      description: "Inspect the vehicle detail with forward and reverse playback.",
      specs: [["Part", "Verified"]],
      subHotspots: []
    };
    currentConfig.hotspots.push(newHotspot);
    selectHotspot(newId);
    renderCanvas();
    renderHotspotsStrip();
    setUnsaved(true);
    showToast("已创建新热点，请配置坐标与媒体！", "success");
  });

  // Inspector Tabs
  if (tabHotspotBtn) tabHotspotBtn.addEventListener("click", () => switchInspectorTab("hotspot"));
  if (tabVehicleBtn) tabVehicleBtn.addEventListener("click", () => switchInspectorTab("vehicle"));
  if (tabLeadsBtn) tabLeadsBtn.addEventListener("click", () => switchInspectorTab("leads"));
  if (tabHomepageBtn) tabHomepageBtn.addEventListener("click", () => switchInspectorTab("homepage"));
  if (tabHistoryBtn) tabHistoryBtn.addEventListener("click", () => switchInspectorTab("history"));
  if (tabToolsBtn) tabToolsBtn.addEventListener("click", () => switchInspectorTab("tools"));
  if (tabJsonBtn) tabJsonBtn.addEventListener("click", () => switchInspectorTab("json"));

  initHomepageSyncEvents();

  // History Undo & Redo Actions
  if (undoBtn) undoBtn.addEventListener("click", undo);
  if (redoBtn) redoBtn.addEventListener("click", redo);
  if (panelUndoBtn) panelUndoBtn.addEventListener("click", undo);
  if (panelRedoBtn) panelRedoBtn.addEventListener("click", redo);
  if (createSnapshotBtn) {
    createSnapshotBtn.addEventListener("click", () => {
      pushHistory("手动创建恢复快照");
      showToast("已成功创建当前状态快照备份！", "success");
    });
  }

  // Cost Margin Calculator Inputs & Button
  [fobJpyInput, exchangeRateInput, oceanFreightInput, customsDutyInput, apFeeInput, portPuspakomInput, reconDetailingInput, targetMarginPctInput].forEach(el => {
    if (el) el.addEventListener("input", calculateDealerCosts);
  });
  if (applyRecommendedPriceBtn) {
    applyRecommendedPriceBtn.addEventListener("click", applyRecommendedPrice);
  }

  // Template Duplication Modal
  if (duplicateTemplateBtn) duplicateTemplateBtn.addEventListener("click", openDuplicateTemplateDialog);
  if (closeDuplicateTemplateDialogBtn) closeDuplicateTemplateDialogBtn.addEventListener("click", () => duplicateTemplateDialog.close());
  if (cancelDuplicateTemplateBtn) cancelDuplicateTemplateBtn.addEventListener("click", () => duplicateTemplateDialog.close());
  if (confirmDuplicateTemplateBtn) confirmDuplicateTemplateBtn.addEventListener("click", handleConfirmDuplicateTemplate);

  // Leads Modal & Filter Actions
  if (addLeadModalBtn && addLeadDialog) {
    addLeadModalBtn.addEventListener("click", () => addLeadDialog.showModal());
  }
  if (closeAddLeadDialogBtn && addLeadDialog) {
    closeAddLeadDialogBtn.addEventListener("click", () => addLeadDialog.close());
  }
  if (cancelAddLeadBtn && addLeadDialog) {
    cancelAddLeadBtn.addEventListener("click", () => addLeadDialog.close());
  }
  if (confirmAddLeadBtn) {
    confirmAddLeadBtn.addEventListener("click", handleConfirmAddLead);
  }

  document.querySelectorAll(".lead-stat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".lead-stat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeLeadFilter = pill.dataset.filter || "all";
      renderLeadsList();
    });
  });

  // Global Keyboard Shortcuts (Undo: Ctrl+Z / Cmd+Z, Redo: Ctrl+Y / Cmd+Shift+Z)
  window.addEventListener("keydown", (e) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (!isCtrlOrCmd) return;
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) return;

    if (e.key === "z" || e.key === "Z") {
      if (e.shiftKey) {
        e.preventDefault();
        redo();
      } else {
        e.preventDefault();
        undo();
      }
    } else if (e.key === "y" || e.key === "Y") {
      e.preventDefault();
      redo();
    }
  });

  // Hotspot Form Coordinate Sliders & Inputs
  coordXRange.addEventListener("input", () => {
    coordXInput.value = coordXRange.value;
    updatePinCoordinateDirectly();
  });
  coordXInput.addEventListener("input", () => {
    coordXRange.value = coordXInput.value;
    updatePinCoordinateDirectly();
  });
  coordYRange.addEventListener("input", () => {
    coordYInput.value = coordYRange.value;
    updatePinCoordinateDirectly();
  });
  coordYInput.addEventListener("input", () => {
    coordYRange.value = coordYInput.value;
    updatePinCoordinateDirectly();
  });

  function updatePinCoordinateDirectly() {
    const item = currentConfig.hotspots.find(h => h.id === selectedHotspotId);
    if (!item) return;
    item.x = `${parseFloat(coordXInput.value).toFixed(1)}%`;
    item.y = `${parseFloat(coordYInput.value).toFixed(1)}%`;
    const pin = adminHotspotsLayer.querySelector(`[data-id="${item.id}"]`);
    if (pin) {
      pin.style.left = item.x;
      pin.style.top = item.y;
    }
    setUnsaved(true);
  }

  // Type Radios toggle
  typeVideoRadio.addEventListener("change", () => {
    videoFieldsGroup.style.display = "";
    imageFieldsGroup.style.display = "none";
    setUnsaved(true);
  });
  typeImageRadio.addEventListener("change", () => {
    videoFieldsGroup.style.display = "none";
    imageFieldsGroup.style.display = "";
    setUnsaved(true);
  });

  // Hotspot Form Buttons
  updateHotspotBtn.addEventListener("click", applyHotspotFormChanges);

  duplicateHotspotBtn.addEventListener("click", () => {
    const item = currentConfig.hotspots.find(h => h.id === selectedHotspotId);
    if (!item) return;
    const copy = JSON.parse(JSON.stringify(item));
    copy.id = copy.id + "_copy";
    copy.label = copy.label + " (Copy)";
    copy.x = `${(parseFloat(copy.x) + 3).toFixed(1)}%`;
    copy.y = `${(parseFloat(copy.y) + 3).toFixed(1)}%`;
    currentConfig.hotspots.push(copy);
    selectHotspot(copy.id);
    renderCanvas();
    renderHotspotsStrip();
    setUnsaved(true);
    showToast(`已复制热点为「${copy.label}」！`, "success");
  });

  // Hotspot Delete Button (Safe for Iframes)
  deleteHotspotBtn.addEventListener("click", () => {
    if (currentSubHotspotParentId) {
      const parent = currentConfig.hotspots.find(h => h.id === currentSubHotspotParentId);
      if (!parent) return;
      const sub = (parent.subHotspots || []).find(s => s.id === selectedSubHotspotId);
      if (!sub) {
        showToast("请先选择要删除的子热点", "info");
        return;
      }
      showCustomConfirm({
        title: "删除子热点",
        message: `确定要删除子热点「${sub.label || sub.id}」吗？`,
        confirmText: "删除子热点",
        isDanger: true,
        onConfirm: () => {
          deleteSubHotspot(parent.id, sub.id);
        }
      });
      return;
    }

    if (!selectedHotspotId) {
      showToast("请先选择要删除的热点", "info");
      return;
    }
    const item = currentConfig.hotspots.find(h => h.id === selectedHotspotId);
    const label = item ? (item.label || item.id) : selectedHotspotId;

    showCustomConfirm({
      title: "删除热点",
      message: `确定删除热点「${label}」吗？此操作将移除该热点及其子热点。`,
      confirmText: "确认删除",
      isDanger: true,
      onConfirm: () => {
        deleteHotspot(selectedHotspotId);
      }
    });
  });

  addSpecRowBtn.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "spec-edit-row";
    row.innerHTML = `
      <input type="text" class="admin-input spec-key" placeholder="参数名 (如 Engine)">
      <input type="text" class="admin-input spec-val" placeholder="参数值 (如 3.0L V6)">
      <button type="button" class="btn-remove-spec" title="删除此规格">✕</button>
    `;
    row.querySelector(".btn-remove-spec").addEventListener("click", () => {
      row.remove();
      setUnsaved(true);
    });
    specsEditorList.appendChild(row);
    setUnsaved(true);
  });

  // Media preview sync
  forwardVideoInput.addEventListener("input", () => {
    forwardVideoPreview.src = forwardVideoInput.value.trim();
    setUnsaved(true);
  });
  reverseVideoInput.addEventListener("input", () => {
    reverseVideoPreview.src = reverseVideoInput.value.trim();
    setUnsaved(true);
  });
  detailImageInput.addEventListener("input", () => {
    detailImagePreview.src = detailImageInput.value.trim();
    setUnsaved(true);
  });

  // File Upload Handlers
  quickMainImageUpload.addEventListener("change", () => {
    handleFileUpload(quickMainImageUpload, (url) => {
      currentConfig.mainImage = url;
      mainImageUrlInput.value = url;
      mainImagePreview.src = url;
      renderCanvas();
    });
  });

  mainImageFileUpload.addEventListener("change", () => {
    handleFileUpload(mainImageFileUpload, (url) => {
      currentConfig.mainImage = url;
      mainImageUrlInput.value = url;
      mainImagePreview.src = url;
      renderCanvas();
    });
  });

  forwardVideoUpload.addEventListener("change", () => {
    handleFileUpload(forwardVideoUpload, (url) => {
      forwardVideoInput.value = url;
      forwardVideoPreview.src = url;
    });
  });

  reverseVideoUpload.addEventListener("change", () => {
    handleFileUpload(reverseVideoUpload, (url) => {
      reverseVideoInput.value = url;
      reverseVideoPreview.src = url;
    });
  });

  detailImageUpload.addEventListener("change", () => {
    handleFileUpload(detailImageUpload, (url) => {
      detailImageInput.value = url;
      detailImagePreview.src = url;
    });
  });

  // Vehicle settings tab button
  saveVehicleSettingsBtn.addEventListener("click", applyVehicleSettings);

  // Preset buttons
  document.querySelectorAll("[data-preset]").forEach(btn => {
    btn.addEventListener("click", () => addPresetHotspot(btn.dataset.preset));
  });

  // Arrow keys to nudge selected hotspot position on canvas
  window.addEventListener("keydown", (e) => {
    if (currentMode !== "edit" || !selectedHotspotId) return;
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable)) {
      return;
    }

    const step = e.shiftKey ? 2.0 : 0.5;
    const item = currentConfig.hotspots.find(h => h.id === selectedHotspotId);
    if (!item) return;

    let curX = parseFloat(item.x) || 50;
    let curY = parseFloat(item.y) || 50;
    let handled = false;

    if (e.key === "ArrowLeft") {
      curX = Math.max(1, curX - step);
      handled = true;
    } else if (e.key === "ArrowRight") {
      curX = Math.min(99, curX + step);
      handled = true;
    } else if (e.key === "ArrowUp") {
      curY = Math.max(1, curY - step);
      handled = true;
    } else if (e.key === "ArrowDown") {
      curY = Math.min(99, curY + step);
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      item.x = `${curX.toFixed(1)}%`;
      item.y = `${curY.toFixed(1)}%`;
      const pin = adminHotspotsLayer.querySelector(`[data-id="${item.id}"]`);
      if (pin) {
        pin.style.left = item.x;
        pin.style.top = item.y;
      }
      coordXInput.value = curX.toFixed(1);
      coordXRange.value = curX.toFixed(1);
      coordYInput.value = curY.toFixed(1);
      coordYRange.value = curY.toFixed(1);
      canvasCoordsBadge.textContent = `X: ${item.x} · Y: ${item.y}`;
      setUnsaved(true);
    }
  });

  // JSON Tab Actions
  copyJsonBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(jsonConfigTextarea.value);
    showToast("JSON 配置已复制到剪贴板！", "success");
  });

  applyJsonBtn.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(jsonConfigTextarea.value);
      if (parsed && Array.isArray(parsed.hotspots)) {
        currentConfig = parsed;
        renderCanvas();
        renderHotspotsStrip();
        if (currentConfig.hotspots.length > 0) {
          selectHotspot(currentConfig.hotspots[0].id);
        }
        syncVehicleSettingsTab();
        setUnsaved(true);
        showToast("已成功应用 JSON 配置！", "success");
      } else {
        showToast("JSON 缺少 hotspots 数组", "error");
      }
    } catch (e) {
      showToast("JSON 语法解析错误，请检查格式", "error");
    }
  });

  // Vehicle Switcher
  if (adminVehicleSelect) {
    adminVehicleSelect.addEventListener("change", (e) => {
      switchVehicle(e.target.value);
    });
  }

  // Global Header Actions
  saveConfigBtn.addEventListener("click", saveAllConfig);
  resetConfigBtn.addEventListener("click", resetToDefaults);
  exportConfigBtn.addEventListener("click", exportConfigJSON);

  // Import Dialog
  importConfigBtn.addEventListener("click", () => {
    importJsonTextarea.value = "";
    importDialog.showModal();
  });
  closeImportDialogBtn.addEventListener("click", () => importDialog.close());
  cancelImportBtn.addEventListener("click", () => importDialog.close());

  importJsonFileInput.addEventListener("change", () => {
    const file = importJsonFileInput.files && importJsonFileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        importJsonTextarea.value = reader.result;
      };
      reader.readAsText(file);
    }
  });

  confirmImportBtn.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(importJsonTextarea.value.trim());
      if (parsed && Array.isArray(parsed.hotspots)) {
        currentConfig = parsed;
        renderCanvas();
        renderHotspotsStrip();
        if (currentConfig.hotspots.length > 0) {
          selectHotspot(currentConfig.hotspots[0].id);
        }
        syncVehicleSettingsTab();
        setUnsaved(true);
        importDialog.close();
        showToast("配置已成功导入！请点击「保存发布」生效。", "success");
      } else {
        showToast("导入的 JSON 格式不完整", "error");
      }
    } catch (e) {
      showToast("导入失败: 无法解析 JSON 内容", "error");
    }
  });
}

// ==========================================================================
// Utilities
// ==========================================================================

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "✓" : "⚠"}</span>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Run on load
window.JRCGAdmin = {
  ready: null,
  async open(id, tab) {
    if (id && id !== currentVehicleId) await switchVehicle(id);
    if (id && id !== currentVehicleId) return false;
    switchInspectorTab(tab || 'vehicle'); return true;
  }
};
document.addEventListener('DOMContentLoaded', () => { window.JRCGAdmin.ready = initAdminStudio(); });
window.addEventListener('jrcg:data-change', event => {
  if (event.detail.scope === 'appointments') fetchLeads();
  if (event.detail.scope === 'catalog') { inventoryVehicles.splice(0, inventoryVehicles.length, ...window.JRCG.catalog()); syncHomepagePanelData(); }
});
