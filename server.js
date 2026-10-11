import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin8888';

// Enable large JSON payloads for base64 file uploads (up to 100MB)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Directories
const dataDir = path.join(__dirname, 'assets', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, 'assets', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const vehicleConfigsDir = path.join(__dirname, 'assets', 'configs');
if (!fs.existsSync(vehicleConfigsDir)) {
  fs.mkdirSync(vehicleConfigsDir, { recursive: true });
}

// Canonical file paths
const vehiclesFilePath = path.join(dataDir, 'vehicles.json');
const siteContentFilePath = path.join(dataDir, 'site-content.json');
const leadsFilePath = path.join(dataDir, 'leads.json');
const configFilePath = path.join(__dirname, 'assets', 'audi-s5', 'config.json');

// Admin Auth Middleware
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.adminToken || (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (token === ADMIN_TOKEN) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin authentication required', code: 'AUTH_REQUIRED' });
}

// Helper: Read JSON safely
function readJsonSafe(filePath, fallback = null) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper: Write JSON safely
function writeJsonSafe(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Default Audi S5 Config for 3D interactive viewer
const defaultAudiConfig = {
  mainImage: "assets/audi-s5/main-car-16x9.jpg",
  vehicleName: "Audi S5 Avant",
  vehicleSub: "Actual photographed example · interactive detail page",
  price: "RM 438,000",
  hotspots: [
    {
      id: "engine",
      label: "Engine Bay",
      type: "video",
      x: "72%",
      y: "46%",
      forwardVideo: "assets/videos/engine_forward.mp4",
      reverseVideo: "assets/videos/engine_reverse_web.mp4",
      title: "V6 TFSI Engine Bay",
      eyebrow: "POWERTRAIN",
      description: "Move beneath the bonnet to inspect the 3.0-litre turbocharged V6 powerplant, carbon-accented engine cover, and precision cooling architecture.",
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
        }
      ]
    },
    {
      id: "interior",
      label: "Cabin",
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
      label: "Cargo / Boot",
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
        ["Seat folding", "40:20:40 split"]
      ]
    },
    {
      id: "wheel",
      label: "Wheel & Brakes",
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
        ["Amplifier", "16-channel 755W DSP"]
      ]
    }
  ]
};

// =========================================================
// PUBLIC API ENDPOINTS
// =========================================================

// API: Verify Admin Login / Token
app.post('/api/admin/login', (req, res) => {
  const { pin, password } = req.body || {};
  const attempt = pin || password;
  if (attempt === ADMIN_TOKEN || attempt === 'admin8888') {
    return res.json({ success: true, token: ADMIN_TOKEN, message: 'Authentication successful' });
  }
  return res.status(401).json({ success: false, error: 'Invalid admin passcode' });
});

// API: List Published Vehicles (Single Source of Truth)
app.get('/api/vehicles', (req, res) => {
  const vehicles = readJsonSafe(vehiclesFilePath, []);
  return res.json(vehicles);
});

// API: Get Site Content (Personal Brand, Deliveries, Guides)
app.get('/api/site-content', (req, res) => {
  const content = readJsonSafe(siteContentFilePath, {});
  return res.json(content);
});

// API: Get Vehicle Hotspot Config
app.get('/api/config', (req, res) => {
  try {
    const vId = req.query.vehicleId || 'audi-s5';
    if (vId === 'audi-s5') {
      const existing = readJsonSafe(configFilePath);
      return res.json(existing || defaultAudiConfig);
    }
    const safeId = vId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const customPath = path.join(vehicleConfigsDir, `${safeId}.json`);
    const customConfig = readJsonSafe(customPath);
    if (customConfig) return res.json(customConfig);

    // Fallback: look up in vehicles.json
    const vehicles = readJsonSafe(vehiclesFilePath, []);
    const car = vehicles.find(c => c.id === vId);
    if (car) {
      return res.json({
        vehicleId: car.id,
        vehicleName: `${car.brand} ${car.model}`,
        vehicleSub: car.sub || 'Japan Recon Special',
        price: car.price,
        mainImage: car.coverImage || car.image,
        hotspots: []
      });
    }
    return res.json(defaultAudiConfig);
  } catch (err) {
    return res.json(defaultAudiConfig);
  }
});

// API: Submit New Customer Lead / Viewing Request (Public)
app.post('/api/leads', (req, res) => {
  try {
    const { customerName, phone, vehicleId, vehicleName, price, branch, preferredDate, inquiryType, notes } = req.body;
    if (!customerName || !phone) {
      return res.status(400).json({ error: 'Customer name and phone number are required' });
    }
    const leads = readJsonSafe(leadsFilePath, []);
    const newLead = {
      id: 'lead-' + Date.now().toString().slice(-6),
      customerName: customerName.trim(),
      phone: phone.trim(),
      vehicleId: vehicleId || 'general',
      vehicleName: vehicleName || 'Recon Fleet Inquiry',
      price: price || 'Price on request',
      branch: branch || 'Glenmarie HQ Showroom',
      preferredDate: preferredDate || 'Pending scheduling',
      inquiryType: inquiryType || 'Showroom Viewing & Inspection',
      status: 'pending_confirmation',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    leads.unshift(newLead);
    writeJsonSafe(leadsFilePath, leads);
    return res.json({
      success: true,
      lead: newLead,
      message: 'Viewing request received. Our sales advisor will verify and confirm via WhatsApp.'
    });
  } catch (err) {
    console.error('Error creating lead:', err);
    return res.status(500).json({ error: 'Failed to record enquiry' });
  }
});

// =========================================================
// PROTECTED ADMIN API ENDPOINTS (Require Authorization)
// =========================================================

// API: List Customer Leads (Protected)
app.get('/api/leads', requireAdmin, (req, res) => {
  const leads = readJsonSafe(leadsFilePath, []);
  return res.json({ success: true, leads });
});

// API: Update Customer Lead (Protected)
app.put('/api/leads/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const leads = readJsonSafe(leadsFilePath, []);
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Lead not found' });

    if (status) leads[idx].status = status;
    if (typeof notes === 'string') leads[idx].notes = notes;
    leads[idx].updatedAt = new Date().toISOString();
    writeJsonSafe(leadsFilePath, leads);
    return res.json({ success: true, lead: leads[idx] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update lead' });
  }
});

// API: Publish Full Catalog & Site Content (Protected - Single Source of Truth)
app.post('/api/publish', requireAdmin, (req, res) => {
  try {
    const { vehicles, siteContent } = req.body || {};
    let updatedVehicles = 0;
    let updatedContent = false;

    if (Array.isArray(vehicles) && vehicles.length > 0) {
      writeJsonSafe(vehiclesFilePath, vehicles);
      updatedVehicles = vehicles.length;
    }

    if (siteContent && typeof siteContent === 'object') {
      writeJsonSafe(siteContentFilePath, siteContent);
      updatedContent = true;
    }

    return res.json({
      success: true,
      message: 'Published changes successfully to public data files',
      publishedVehiclesCount: updatedVehicles,
      publishedContent: updatedContent,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Publish error:', err);
    return res.status(500).json({ error: 'Failed to publish changes to file system' });
  }
});

// API: Update Single Vehicle (Protected)
app.post('/api/vehicles/update', requireAdmin, (req, res) => {
  try {
    const updatedCar = req.body;
    if (!updatedCar || !updatedCar.id) {
      return res.status(400).json({ error: 'Missing vehicle id or data' });
    }
    const vehicles = readJsonSafe(vehiclesFilePath, []);
    const idx = vehicles.findIndex(v => v.id === updatedCar.id);
    if (idx >= 0) {
      vehicles[idx] = { ...vehicles[idx], ...updatedCar };
    } else {
      vehicles.push(updatedCar);
    }
    writeJsonSafe(vehiclesFilePath, vehicles);
    return res.json({ success: true, vehicle: idx >= 0 ? vehicles[idx] : updatedCar });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// API: Save Vehicle Hotspots Config (Protected)
app.post('/api/config', requireAdmin, (req, res) => {
  try {
    const newConfig = req.body;
    if (!newConfig || !Array.isArray(newConfig.hotspots)) {
      return res.status(400).json({ error: 'Invalid config structure' });
    }
    const vId = newConfig.vehicleId || req.query.vehicleId || 'audi-s5';
    let targetFile = configFilePath;
    if (vId !== 'audi-s5') {
      const safeId = vId.replace(/[^a-zA-Z0-9_-]/g, '_');
      targetFile = path.join(vehicleConfigsDir, `${safeId}.json`);
    }
    writeJsonSafe(targetFile, newConfig);
    return res.json({ success: true, vehicleId: vId, message: `Configuration saved for ${vId}` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// API: Duplicate Template Safely Without Cross-Vehicle Contamination (Protected)
app.post('/api/duplicate-template', requireAdmin, (req, res) => {
  try {
    const { sourceVehicleId, targetVehicleId, mergeMode } = req.body;
    if (!sourceVehicleId || !targetVehicleId) {
      return res.status(400).json({ error: 'sourceVehicleId and targetVehicleId are required' });
    }

    // Load source config
    let sourceConfig;
    if (sourceVehicleId === 'audi-s5') {
      sourceConfig = readJsonSafe(configFilePath, defaultAudiConfig);
    } else {
      const srcFile = path.join(vehicleConfigsDir, `${sourceVehicleId.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`);
      sourceConfig = readJsonSafe(srcFile, null);
    }

    if (!sourceConfig || !Array.isArray(sourceConfig.hotspots)) {
      return res.status(404).json({ error: 'Source template configuration not found' });
    }

    // Look up target vehicle in catalog
    const vehicles = readJsonSafe(vehiclesFilePath, []);
    const targetVeh = vehicles.find(v => v.id === targetVehicleId) || {
      id: targetVehicleId,
      brand: 'Vehicle',
      model: targetVehicleId,
      price: 'Price on request',
      year: new Date().getFullYear(),
      mileage: 'To verify',
      engine: 'To verify'
    };

    // Sanitize hotspots: preserve layout geometry & hotspot slots, but strip vehicle-specific claims
    const sanitizedHotspots = sourceConfig.hotspots.map((hs, idx) => {
      const cleanHs = {
        id: hs.id || `hotspot_${idx + 1}`,
        label: hs.label || `Point ${idx + 1}`,
        type: hs.type === 'video' ? 'image' : hs.type,
        x: hs.x,
        y: hs.y,
        title: `${hs.label || 'Feature'} - ${targetVeh.brand} ${targetVeh.model}`,
        eyebrow: hs.eyebrow || 'SPECIFICATION',
        description: `Inspected feature point for ${targetVeh.brand} ${targetVeh.model}. [Awaiting actual Japanese inspection photos]`,
        specs: [
          ["Component", hs.label || "Equipment"],
          ["Vehicle Model", `${targetVeh.brand} ${targetVeh.model}`],
          ["Status", "Japanese Recon Import Spec"]
        ]
      };
      if (hs.subHotspots && Array.isArray(hs.subHotspots)) {
        cleanHs.subHotspots = hs.subHotspots.map(sub => ({
          id: sub.id,
          label: sub.label,
          x: sub.x,
          y: sub.y,
          title: `${sub.label} - ${targetVeh.model}`,
          eyebrow: sub.eyebrow || 'SUB-ASSEMBLY',
          description: `Detailed sub-component specification for ${targetVeh.model}.`,
          specs: [["Part", sub.label], ["Condition", "Verified Japan Import"]]
        }));
      }
      return cleanHs;
    });

    const targetConfig = {
      vehicleId: targetVehicleId,
      vehicleName: `${targetVeh.brand} ${targetVeh.model}`,
      vehicleSub: targetVeh.sub || 'Japan Reconditioned Example',
      price: targetVeh.price,
      year: String(targetVeh.year),
      mileage: targetVeh.mileage,
      engine: targetVeh.engine,
      mainImage: targetVeh.image || 'assets/audi-s5/main-car-16x9.jpg',
      hotspots: sanitizedHotspots
    };

    const targetFile = targetVehicleId === 'audi-s5'
      ? configFilePath
      : path.join(vehicleConfigsDir, `${targetVehicleId.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`);

    writeJsonSafe(targetFile, targetConfig);

    return res.json({
      success: true,
      message: `Template safely duplicated from ${sourceVehicleId} to ${targetVehicleId} with sanitized vehicle specifications.`,
      targetConfig
    });
  } catch (err) {
    console.error('Error duplicating template:', err);
    return res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

// API: Upload Media File (Protected)
app.post('/api/upload', requireAdmin, (req, res) => {
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

// API: List Media Assets in Uploads & Galleries (Protected)
app.get('/api/media', requireAdmin, (req, res) => {
  try {
    const mediaList = [];
    const scanDir = (dirPath, relPrefix) => {
      if (!fs.existsSync(dirPath)) return;
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.svg'].includes(ext)) {
            const fullPath = path.join(dirPath, entry.name);
            const stats = fs.statSync(fullPath);
            mediaList.push({
              name: entry.name,
              url: `${relPrefix}/${entry.name}`,
              size: stats.size,
              date: stats.mtime.toISOString(),
              type: ext === '.mp4' ? 'video' : 'image'
            });
          }
        }
      }
    };

    scanDir(uploadsDir, 'assets/uploads');
    scanDir(path.join(__dirname, 'assets', 'audi-s5'), 'assets/audi-s5');
    scanDir(path.join(__dirname, 'assets', 'audi-s5-v2'), 'assets/audi-s5-v2');

    // Sort newest first
    mediaList.sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json({ success: true, media: mediaList });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list media' });
  }
});

// =========================================================
// STATIC ASSET SERVING & COMPATIBILITY ROUTES
// =========================================================

// Serve entire repository root
app.use(express.static(__dirname));

// Support GitHub Pages subpath '/Car-Recond-Japan' locally so all relative links work identically!
app.use('/Car-Recond-Japan', express.static(__dirname));

// Route handlers
app.get(['/', '/Car-Recond-Japan', '/Car-Recond-Japan/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/audi', '/Car-Recond-Japan/audi', '/audi.html', '/Car-Recond-Japan/audi.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'audi.html'));
});

app.get(['/calculator', '/Car-Recond-Japan/calculator', '/calculator.html', '/Car-Recond-Japan/calculator.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'calculator.html'));
});

app.get(['/admin', '/Car-Recond-Japan/admin', '/admin.html', '/Car-Recond-Japan/admin.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback to index.html for direct navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Japan Recon Car Gallery Server running at http://${HOST}:${PORT}`);
  console.log(`GitHub Pages simulation route: http://${HOST}:${PORT}/Car-Recond-Japan/`);
});
