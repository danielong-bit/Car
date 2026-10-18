const publicStatuses = new Set(['available', 'reserved', 'sold']);
const key = value => String(value || '').trim().toLocaleLowerCase('en');

export function normalizeBrandFilters(homepage = {}) {
  const seen = new Set();
  const brandFilters = (Array.isArray(homepage.brandFilters) ? homepage.brandFilters : [])
    .filter(value => typeof value === 'string')
    .map(value => value.trim())
    .filter(value => value && !seen.has(key(value)) && seen.add(key(value)));
  return {brandFilterMode: homepage.brandFilterMode === 'manual' ? 'manual' : 'auto', brandFilters};
}

export function inventoryBrands(vehicles = []) {
  const brands = new Map();
  for (const vehicle of vehicles) {
    const make = String(vehicle.make || '').trim();
    if (make && !brands.has(key(make))) brands.set(key(make), make);
  }
  return [...brands.values()].sort((a, b) => a.localeCompare(b, 'en'));
}

export function visibleBrandFilters(document = {}) {
  const settings = normalizeBrandFilters(document.homepage);
  const vehicles = (document.vehicles || []).filter(vehicle => publicStatuses.has(vehicle.status)
    && (document.homepage?.showSoldVehicles !== false || vehicle.status !== 'sold'));
  const candidates = inventoryBrands(vehicles);
  if (settings.brandFilterMode === 'manual') {
    const chosen = new Set(settings.brandFilters.map(key));
    return candidates.filter(make => chosen.has(key(make)));
  }
  return inventoryBrands(vehicles.filter(vehicle => vehicle.status === 'available' || vehicle.status === 'reserved'));
}

export function matchesInventorySelection(vehicle, filters = {}) {
  const searchable = [vehicle.stockId, vehicle.make, vehicle.model, vehicle.variant,
    vehicle.exteriorColor, vehicle.body, ...(vehicle.specialBadges || [])].join(' ').toLocaleLowerCase('en');
  return (!filters.status || vehicle.status === filters.status)
    && (!filters.make || key(vehicle.make) === key(filters.make))
    && (!filters.featured || vehicle.isFeatured)
    && searchable.includes(String(filters.search || '').toLocaleLowerCase('en'));
}
