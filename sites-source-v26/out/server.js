import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Enable large JSON payloads for base64 file uploads (up to 100MB)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'assets', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Config file path
const configFilePath = path.join(__dirname, 'assets', 'audi-s5', 'config.json');

// Default configuration fallback
const defaultConfig = {
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

// Multi-vehicle configurations map
const vehicleConfigsDir = path.join(__dirname, 'assets', 'configs');
if (!fs.existsSync(vehicleConfigsDir)) {
  fs.mkdirSync(vehicleConfigsDir, { recursive: true });
}

// Built-in vehicle catalog list
const availableVehicles = [
  { id: 'audi-s5', name: 'Audi S5 Avant', brand: 'Audi', price: 'RM 438,000', image: 'assets/audi-s5/main-car-16x9.jpg', page: 'audi.html' },
  { id: 'alphard-z', name: 'Toyota Alphard Z', brand: 'Toyota', price: 'RM 329,000', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80', page: '' },
  { id: 'rx500h', name: 'Lexus RX 500h F Sport', brand: 'Lexus', price: 'RM 468,000', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', page: '' },
  { id: 'gtr-premium', name: 'Nissan GT-R Premium', brand: 'Nissan', price: 'RM 598,000', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', page: '' },
  { id: 'civic-type-r', name: 'Honda Civic Type R', brand: 'Honda', price: 'RM 328,000', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', page: '' },
  { id: 'crown-crossover', name: 'Toyota Crown Crossover RS', brand: 'Toyota', price: 'RM 278,000', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80', page: '' },
  { id: 'lm500h', name: 'Lexus LM 500h Executive', brand: 'Lexus', price: 'RM 518,000', image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80', page: '' }
];

function getVehicleConfigPath(vehicleId = 'audi-s5') {
  if (vehicleId === 'audi-s5') return configFilePath;
  const safeId = vehicleId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(vehicleConfigsDir, `${safeId}.json`);
}

function getDefaultConfigForVehicle(vehicleId) {
  const meta = availableVehicles.find(v => v.id === vehicleId);
  if (!meta) return defaultConfig;
  if (vehicleId === 'audi-s5') return defaultConfig;

  // Template config for other inventory vehicles
  return {
    vehicleId: meta.id,
    mainImage: meta.image,
    vehicleName: meta.name,
    vehicleSub: `${meta.brand} Japan recon luxury edition · Interactive detail model`,
    price: meta.price,
    hotspots: [
      {
        id: "engine",
        label: "Powertrain",
        type: "image",
        x: "68%",
        y: "48%",
        imageSrc: meta.image,
        title: `${meta.name} Powertrain`,
        eyebrow: "ENGINE & HYBRID",
        description: `Inspecting ${meta.name} powerplant and efficiency system.`,
        specs: [["Model", meta.name], ["Power", "Japan Spec"], ["Condition", "Recon Verified"]]
      },
      {
        id: "interior",
        label: "Cabin",
        type: "image",
        x: "50%",
        y: "42%",
        imageSrc: meta.image,
        title: `${meta.name} Executive Cockpit`,
        eyebrow: "LUXURY CABIN",
        description: `Premium materials and seating ergonomics.`,
        specs: [["Steering", "Right-hand drive"], ["Cabin", "Japan Spec Grade"]]
      },
      {
        id: "wheel",
        label: "Wheels & Brakes",
        type: "image",
        x: "78%",
        y: "74%",
        imageSrc: meta.image,
        title: "Alloy Wheel & Caliper Setup",
        eyebrow: "CHASSIS & BRAKES",
        description: "Alloy wheels and suspension package.",
        specs: [["Wheels", "Factory Option Alloy"], ["Brakes", "Performance Calipers"]]
      }
    ]
  };
}

// API: List all vehicles for admin selection
app.get('/api/vehicles', (req, res) => {
  return res.json(availableVehicles);
});

// API: Get current config (supports ?vehicleId= query param or default audi-s5)
app.get('/api/config', (req, res) => {
  try {
    const vId = req.query.vehicleId || 'audi-s5';
    const filePath = getVehicleConfigPath(vId);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return res.json(JSON.parse(data));
    }
    return res.json(getDefaultConfigForVehicle(vId));
  } catch (err) {
    console.error('Error reading config:', err);
    return res.json(defaultConfig);
  }
});

// API: Get config for specific vehicle
app.get('/api/config/:vehicleId', (req, res) => {
  try {
    const vId = req.params.vehicleId || 'audi-s5';
    const filePath = getVehicleConfigPath(vId);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return res.json(JSON.parse(data));
    }
    return res.json(getDefaultConfigForVehicle(vId));
  } catch (err) {
    console.error('Error reading vehicle config:', err);
    return res.status(500).json({ error: 'Failed to read vehicle config' });
  }
});

// API: Save config (supports body.vehicleId or ?vehicleId= query param)
app.post('/api/config', (req, res) => {
  try {
    const newConfig = req.body;
    if (!newConfig || !Array.isArray(newConfig.hotspots)) {
      return res.status(400).json({ error: 'Invalid config structure' });
    }
    const vId = newConfig.vehicleId || req.query.vehicleId || 'audi-s5';
    const targetFile = getVehicleConfigPath(vId);
    const dir = path.dirname(targetFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(targetFile, JSON.stringify(newConfig, null, 2), 'utf8');
    return res.json({ success: true, vehicleId: vId, message: `Configuration saved successfully for ${vId}` });
  } catch (err) {
    console.error('Error saving config:', err);
    return res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// API: Reset config to default
app.post('/api/reset-config', (req, res) => {
  try {
    const vId = req.query.vehicleId || req.body?.vehicleId || 'audi-s5';
    const targetFile = getVehicleConfigPath(vId);
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }
    return res.json({ success: true, vehicleId: vId, config: getDefaultConfigForVehicle(vId), message: `Reset ${vId} to factory defaults` });
  } catch (err) {
    console.error('Error resetting config:', err);
    return res.status(500).json({ error: 'Failed to reset config' });
  }
});

// Leads & Consultant Assignment Storage
const leadsFilePath = path.join(vehicleConfigsDir, 'leads.json');
const defaultConsultants = [
  { id: 'kenji', name: 'Kenji Tanaka', role: 'Senior Recon Specialist', phone: '+6012-3889102', whatsapp: '60123889102', avatar: '👨‍💼', branch: 'Glenmarie 3S' },
  { id: 'sarah', name: 'Sarah Lim', role: 'European Performance Consultant', phone: '+6016-5227183', whatsapp: '60165227183', avatar: '👩‍💼', branch: 'Petaling Jaya' },
  { id: 'david', name: 'David Wong', role: 'JDM & Luxury MPV Lead', phone: '+6017-8912234', whatsapp: '60178912234', avatar: '👨‍💼', branch: 'Glenmarie 3S' },
  { id: 'farhan', name: 'Farhan Razak', role: 'AP & Hire Purchase Specialist', phone: '+6019-3345519', whatsapp: '60193345519', avatar: '👨‍💼', branch: 'Damansara' }
];

function getStoredLeads() {
  if (fs.existsSync(leadsFilePath)) {
    try {
      const data = fs.readFileSync(leadsFilePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading leads.json:', e);
    }
  }
  const initialLeads = [
    {
      id: 'lead-101',
      customerName: "Dato' Adrian Tan",
      phone: "+6012-3988219",
      vehicleId: "audi-s5",
      vehicleName: "Audi S5 Avant (2021)",
      price: "RM 438,000",
      branch: "Glenmarie 3S Flagship",
      preferredDate: "Tomorrow 2:30 PM",
      inquiryType: "Showroom Viewing & Sound Test",
      status: "confirmed",
      assignedConsultantId: "kenji",
      assignedConsultantName: "Kenji Tanaka",
      notes: "Customer interested in B&O 3D audio demonstration and V6 TFSI exhaust note. High intent cash / fast loan buyer.",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'lead-102',
      customerName: "Kevin Chong",
      phone: "+6017-8821940",
      vehicleId: "alphard-z",
      vehicleName: "Toyota Alphard Z (2023)",
      price: "RM 329,000",
      branch: "Petaling Jaya Showroom",
      preferredDate: "This Saturday 11:00 AM",
      inquiryType: "Family Test Drive & Trade-in",
      status: "new",
      assignedConsultantId: "sarah",
      assignedConsultantName: "Sarah Lim",
      notes: "Trade-in inquiry for 2018 Vellfire 2.5. Requests loan repayment calculation with 15% down payment.",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'lead-103',
      customerName: "Farid Kamaruddin",
      phone: "+6019-2219483",
      vehicleId: "gtr-premium",
      vehicleName: "Nissan GT-R Premium (2022)",
      price: "RM 598,000",
      branch: "Glenmarie 3S Flagship",
      preferredDate: "Friday 4:00 PM",
      inquiryType: "Recon Inspection & AP Verification",
      status: "contacted",
      assignedConsultantId: "david",
      assignedConsultantName: "David Wong",
      notes: "Customer asked for auction inspection sheet grade 4.5+ verification and Brembo caliper condition check.",
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ];
  fs.writeFileSync(leadsFilePath, JSON.stringify(initialLeads, null, 2), 'utf8');
  return initialLeads;
}

function saveStoredLeads(leads) {
  fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), 'utf8');
}

// API: Get leads and sales consultants
app.get('/api/leads', (req, res) => {
  try {
    const leads = getStoredLeads();
    return res.json({ success: true, leads, consultants: defaultConsultants });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// API: Add new lead / booking
app.post('/api/leads', (req, res) => {
  try {
    const { customerName, phone, vehicleId, vehicleName, price, branch, preferredDate, inquiryType, notes } = req.body;
    if (!customerName || !phone) {
      return res.status(400).json({ error: 'Customer name and phone are required' });
    }
    const leads = getStoredLeads();
    // Round-robin or default assign to Kenji
    const defaultConsultant = defaultConsultants[leads.length % defaultConsultants.length];
    const newLead = {
      id: 'lead-' + Date.now().toString().slice(-6),
      customerName,
      phone,
      vehicleId: vehicleId || 'audi-s5',
      vehicleName: vehicleName || 'Audi S5 Avant',
      price: price || 'RM 438,000',
      branch: branch || 'Glenmarie 3S Flagship',
      preferredDate: preferredDate || 'Pending confirmation',
      inquiryType: inquiryType || 'Showroom Viewing',
      status: 'new',
      assignedConsultantId: defaultConsultant.id,
      assignedConsultantName: defaultConsultant.name,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    leads.unshift(newLead);
    saveStoredLeads(leads);
    return res.json({ success: true, lead: newLead, message: 'Lead recorded successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create lead' });
  }
});

// API: Update lead assignment, status, or notes
app.put('/api/leads/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { assignedConsultantId, status, notes } = req.body;
    const leads = getStoredLeads();
    const leadIndex = leads.findIndex(l => l.id === id);
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    if (assignedConsultantId) {
      const consultant = defaultConsultants.find(c => c.id === assignedConsultantId);
      if (consultant) {
        leads[leadIndex].assignedConsultantId = consultant.id;
        leads[leadIndex].assignedConsultantName = consultant.name;
      }
    }
    if (status) leads[leadIndex].status = status;
    if (typeof notes === 'string') leads[leadIndex].notes = notes;
    leads[leadIndex].updatedAt = new Date().toISOString();
    saveStoredLeads(leads);
    return res.json({ success: true, lead: leads[leadIndex], message: 'Lead updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update lead' });
  }
});

// API: Duplicate Hotspot Template across vehicles
app.post('/api/duplicate-template', (req, res) => {
  try {
    const { sourceVehicleId, targetVehicleId, mergeMode = 'replace' } = req.body;
    if (!sourceVehicleId || !targetVehicleId) {
      return res.status(400).json({ error: 'sourceVehicleId and targetVehicleId required' });
    }
    const sourcePath = getVehicleConfigPath(sourceVehicleId);
    let sourceConfig;
    if (fs.existsSync(sourcePath)) {
      sourceConfig = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    } else {
      sourceConfig = getDefaultConfigForVehicle(sourceVehicleId);
    }

    const targetPath = getVehicleConfigPath(targetVehicleId);
    let targetConfig;
    if (fs.existsSync(targetPath)) {
      targetConfig = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    } else {
      targetConfig = getDefaultConfigForVehicle(targetVehicleId);
    }

    if (mergeMode === 'append') {
      const existingIds = new Set(targetConfig.hotspots.map(h => h.id));
      const newHotspots = sourceConfig.hotspots.filter(h => !existingIds.has(h.id));
      targetConfig.hotspots = [...targetConfig.hotspots, ...newHotspots];
    } else {
      // Replace hotspots, keeping target vehicle mainImage, title, and metadata
      targetConfig.hotspots = JSON.parse(JSON.stringify(sourceConfig.hotspots));
    }

    fs.writeFileSync(targetPath, JSON.stringify(targetConfig, null, 2), 'utf8');
    return res.json({
      success: true,
      message: `Duplicated ${sourceConfig.hotspots.length} hotspots from ${sourceVehicleId} to ${targetVehicleId}`,
      config: targetConfig
    });
  } catch (err) {
    console.error('Error duplicating template:', err);
    return res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

// API: Bulk import vehicles via parsed CSV
app.post('/api/vehicles/import', (req, res) => {
  try {
    const { vehicles: importedList } = req.body;
    if (!Array.isArray(importedList) || importedList.length === 0) {
      return res.status(400).json({ error: 'No vehicles provided for import' });
    }
    importedList.forEach(item => {
      const safeId = (item.id || item.model?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'recon-car-' + Date.now()).trim();
      const existingIdx = availableVehicles.findIndex(v => v.id === safeId);
      const vehicleObj = {
        id: safeId,
        name: item.name || `${item.brand || ''} ${item.model || ''}`.trim() || 'Japan Recon Special',
        brand: item.brand || 'Import',
        price: item.price ? (String(item.price).startsWith('RM') ? item.price : `RM ${parseInt(item.price, 10).toLocaleString()}`) : 'RM 298,000',
        image: item.image || item.mainImage || 'assets/audi-s5/main-car-16x9.jpg',
        page: item.page || '',
        year: item.year || '2022',
        mileage: item.mileage || '18,500 km',
        engine: item.engine || '2.0L Turbo',
        grade: item.grade || '4.5'
      };
      if (existingIdx >= 0) {
        availableVehicles[existingIdx] = { ...availableVehicles[existingIdx], ...vehicleObj };
      } else {
        availableVehicles.push(vehicleObj);
      }
      // Ensure target config exists
      const configPath = getVehicleConfigPath(safeId);
      if (!fs.existsSync(configPath)) {
        const defaultCfg = getDefaultConfigForVehicle(safeId);
        fs.writeFileSync(configPath, JSON.stringify(defaultCfg, null, 2), 'utf8');
      }
    });

    return res.json({
      success: true,
      importedCount: importedList.length,
      totalVehicles: availableVehicles.length,
      vehicles: availableVehicles
    });
  } catch (err) {
    console.error('Error bulk importing vehicles:', err);
    return res.status(500).json({ error: 'Failed to import vehicles' });
  }
});

// API: Update single vehicle stock details (price, specs)
app.post('/api/vehicles/update', (req, res) => {
  try {
    const { id, price, name, brand, mileage, engine, costData } = req.body;
    if (!id) return res.status(400).json({ error: 'Vehicle ID required' });
    const idx = availableVehicles.findIndex(v => v.id === id);
    if (idx >= 0) {
      if (price) availableVehicles[idx].price = price;
      if (name) availableVehicles[idx].name = name;
      if (brand) availableVehicles[idx].brand = brand;
      if (mileage) availableVehicles[idx].mileage = mileage;
      if (engine) availableVehicles[idx].engine = engine;
      if (costData) availableVehicles[idx].costData = costData;
    }
    return res.json({ success: true, vehicle: availableVehicles[idx] || null });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// API: Direct file upload (base64 payload)
app.post('/api/upload', (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Missing fileName or fileData' });
    }

    const matches = fileData.match(/^data:([A-Za-z0-9+/.-]+);base64,(.+)$/);
    let buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${Date.now()}_${sanitizedName}`;
    const targetPath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(targetPath, buffer);
    const publicUrl = `assets/uploads/${uniqueName}`;

    return res.json({
      success: true,
      url: publicUrl,
      fileName: uniqueName,
      size: buffer.length
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    return res.status(500).json({ error: 'File upload failed' });
  }
});

// Serve static files from root directory
app.use(express.static(__dirname));

// Route handling for root and html files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/audi', (req, res) => {
  res.sendFile(path.join(__dirname, 'audi.html'));
});

app.get('/calculator', (req, res) => {
  res.sendFile(path.join(__dirname, 'calculator.html'));
});

app.get('/calculator.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'calculator.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback for SPA/direct navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
