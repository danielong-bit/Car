/* Shared browser data for the static showroom and desktop studio. */
(() => {
  const BASE = window.JRCG_BASE_VEHICLES || [];
  const KEYS = { overrides: 'jrcg_vehicle_overrides', appointments: 'jrcg_appointments_v1', views: 'jrcg_model_views_v1', hero: 'jrcg_hero_slider' };
  const statuses = ['new', 'contacted', 'confirmed', 'completed', 'cancelled', 'won'];
  const viewed = new Set();
  const clone = value => JSON.parse(JSON.stringify(value));
  function read(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value ?? fallback; } catch { return fallback; }
  }
  function notify(scope) { window.dispatchEvent(new CustomEvent('jrcg:data-change', { detail: { scope } })); }
  function write(key, value, scope) { localStorage.setItem(key, JSON.stringify(value)); notify(scope); }
  function price(value) { const n = Number(String(value ?? '').replace(/[^\d.]/g, '')); return Number.isFinite(n) && n >= 0 ? n : 0; }
  function catalog() {
    const saved = read(KEYS.overrides, {});
    return clone(BASE).map(vehicle => {
      const override = saved && typeof saved === 'object' ? saved[vehicle.id] : null;
      if (override && typeof override === 'object') {
        ['price', 'year', 'mileage', 'engine', 'image', 'sub'].forEach(key => {
          if (typeof override[key] === 'string' || typeof override[key] === 'number') vehicle[key] = override[key];
        });
        if (typeof override.name === 'string' && override.name.trim()) {
          const [brand, ...model] = override.name.trim().split(/\s+/);
          vehicle.brand = brand; vehicle.model = model.join(' ') || brand;
        }
      }
      const key = vehicle.id === 'audi-s5' ? 'japan_recon_viewer_config' : `japan_recon_viewer_config_${vehicle.id}`;
      const config = read(key, null);
      if (config?.mainImage && typeof config.mainImage === 'string') vehicle.image = config.mainImage;
      if (override?.image || config?.mainImage) delete vehicle.preview;
      vehicle.year = parseInt(vehicle.year, 10) || 0;
      return vehicle;
    });
  }
  function saveOverrides(id, patch) {
    if (!BASE.some(vehicle => vehicle.id === id)) throw new Error('Unknown vehicle');
    const saved = read(KEYS.overrides, {});
    const next = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    next[id] = { ...next[id], ...patch, updatedAt: new Date().toISOString() };
    write(KEYS.overrides, next, 'catalog');
  }
  function saveConfig(config) {
    const id = config.vehicleId;
    const key = id === 'audi-s5' ? 'japan_recon_viewer_config' : `japan_recon_viewer_config_${id}`;
    const previousConfig = localStorage.getItem(key);
    const previousOverrides = localStorage.getItem(KEYS.overrides);
    try {
      localStorage.setItem(key, JSON.stringify(config));
      saveOverrides(id, { name: config.vehicleName, price: config.price, year: config.year, mileage: config.mileage, engine: config.engine, image: config.mainImage, sub: config.vehicleSub });
    } catch (error) {
      try {
        if (previousConfig === null) localStorage.removeItem(key); else localStorage.setItem(key, previousConfig);
        if (previousOverrides === null) localStorage.removeItem(KEYS.overrides); else localStorage.setItem(KEYS.overrides, previousOverrides);
      } catch {}
      throw error;
    }
  }
  function appointments() {
    const data = read(KEYS.appointments, []);
    return Array.isArray(data) ? data.filter(item => item && typeof item.id === 'string') : [];
  }
  function addAppointment(payload) {
    const row = { ...payload, id: crypto.randomUUID(), status: 'new', createdAt: new Date().toISOString() };
    write(KEYS.appointments, [row, ...appointments()].slice(0, 500), 'appointments');
    return row;
  }
  function updateAppointment(id, updates) {
    const rows = appointments();
    const row = rows.find(item => item.id === id);
    if (!row) throw new Error('Appointment not found');
    if (updates.status && !statuses.includes(updates.status)) throw new Error('Invalid status');
    Object.assign(row, updates, { updatedAt: new Date().toISOString() });
    write(KEYS.appointments, rows, 'appointments');
    return row;
  }
  function views(days = 30) {
    const data = read(KEYS.views, []);
    const since = Date.now() - days * 86400000;
    return Array.isArray(data) ? data.filter(item => item && BASE.some(v => v.id === item.vehicleId) && Number.isFinite(item.at) && item.at >= since && item.at <= Date.now()) : [];
  }
  function trackView(id) {
    if (viewed.has(id) || !BASE.some(v => v.id === id)) return;
    try { write(KEYS.views, [...views(90), { vehicleId: id, at: Date.now() }].slice(-3000), 'views'); viewed.add(id); } catch {}
  }
  function isActive(row) {
    const date = row.date || String(row.preferredDate || '').slice(0, 10);
    const localToday = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    return ['new', 'contacted', 'confirmed'].includes(row.status) && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date >= localToday);
  }
  function getTheme() { try { return localStorage.getItem('jrcg_theme') || 'platinum'; } catch { return 'apex'; } }
  window.JRCG = { catalog, price, read, notify, saveOverrides, saveConfig, appointments, addAppointment, updateAppointment, views, trackView, isActive, getTheme, keys: KEYS };
  window.addEventListener('storage', event => {
    if (!event.key || Object.values(KEYS).includes(event.key) || event.key.startsWith('japan_recon_viewer_config') || event.key === 'jrcg_theme') {
      const scope = event.key === KEYS.appointments ? 'appointments' : event.key === KEYS.views ? 'views' : event.key === KEYS.hero ? 'hero' : event.key === 'jrcg_theme' ? 'theme' : 'catalog';
      notify(scope);
    }
  });
})();
