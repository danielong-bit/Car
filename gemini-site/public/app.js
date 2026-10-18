const vehicles = window.JRCG.catalog();

const inventoryGrid = document.getElementById('inventoryGrid');
const brandFilter = document.getElementById('brandFilter');
const bodyFilter = document.getElementById('bodyFilter');
const yearFilter = document.getElementById('yearFilter');
const sortFilter = document.getElementById('sortFilter');
const searchFilter = document.getElementById('searchFilter');
const mileageFilter = document.getElementById('mileageFilter');
const powerFilter = document.getElementById('powerFilter');
const resultCount = document.getElementById('resultCount');
const vehicleDialog = document.getElementById('vehicleDialog');
const demoDialog = document.getElementById('demoDialog');
const appointmentDialog = document.getElementById('appointmentDialog');
const appointmentVehicleName = document.getElementById('appointmentVehicleName');
const appointmentForm = document.getElementById('appointmentForm');
const appointmentSuccessView = document.getElementById('appointmentSuccessView');

// Compare Elements
const compareDialog = document.getElementById('compareDialog');
const compareBody = document.getElementById('compareBody');
const closeCompareDialog = document.getElementById('closeCompareDialog');
const cmpViewAll = document.getElementById('cmpViewAll');
const cmpViewDiff = document.getElementById('cmpViewDiff');

const compareDock = document.getElementById('compareDock');
const compareDockSlots = document.getElementById('compareDockSlots');
const compareDockStatus = document.getElementById('compareDockStatus');
const compareDockClear = document.getElementById('compareDockClear');
const compareDockLaunch = document.getElementById('compareDockLaunch');

const filterCompareBtn = document.getElementById('filterCompareBtn');
const filterCompareBadge = document.getElementById('filterCompareBadge');
const navCompareBtn = document.getElementById('navCompareBtn');
const navCompareBadge = document.getElementById('navCompareBadge');
const compareToast = document.getElementById('compareToast');
const compareToastMsg = document.getElementById('compareToastMsg');

let currentVehicle = vehicles[0];
let selectedAppointmentVehicle = null;
let compareList = [];
let compareViewMode = 'all';
let toastTimer = null;

function parseNumber(str) {
  if (!str) return 0;
  const match = String(str).replace(/,/g, '').match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
}

function carMarkup() {
  return '<div class="photo-unavailable">Photo unavailable</div>';
}

function showCompareToast(msg) {
  if (!compareToast) return;
  compareToastMsg.textContent = msg;
  compareToast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    compareToast.classList.remove('visible');
  }, 2600);
}

function toggleCompare(id) {
  const index = compareList.indexOf(id);
  if (index !== -1) {
    compareList.splice(index, 1);
  } else {
    if (compareList.length >= 2) {
      showCompareToast('Maximum 2 vehicles can be compared. Deselect one first.');
      return;
    }
    compareList.push(id);
    if (compareList.length === 2) {
      showCompareToast('2 vehicles selected! Click Compare to view side-by-side.');
    }
  }
  updateCompareUI();
}

function clearCompare() {
  compareList = [];
  updateCompareUI();
}

function updateCompareUI() {
  // Update inventory cards
  if (inventoryGrid) {
    inventoryGrid.querySelectorAll('.car-card').forEach(card => {
      const id = card.dataset.id;
      const isSelected = compareList.includes(id);
      card.classList.toggle('is-compared', isSelected);
      const btn = card.querySelector('.card-compare-btn');
      if (btn) {
        btn.classList.toggle('active', isSelected);
        btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        btn.innerHTML = `<span class="btn-icon">${isSelected ? '✓' : '＋'}</span><span>${isSelected ? 'In Compare' : 'Compare'}</span>`;
      }
      const thumbBtn = card.querySelector('.thumb-compare-btn');
      if (thumbBtn) {
        thumbBtn.classList.toggle('active', isSelected);
        thumbBtn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        thumbBtn.title = isSelected ? 'Remove from compare queue' : 'Add to compare queue';
        thumbBtn.innerHTML = `<span class="thumb-compare-icon">${isSelected ? '✓' : '⇄'}</span><span>${isSelected ? 'Comparing' : 'Compare'}</span>`;
      }
    });
  }

  // Update filter bar and nav header buttons
  if (filterCompareBadge) {
    filterCompareBadge.textContent = `${compareList.length}/2`;
  }
  if (filterCompareBtn) {
    filterCompareBtn.classList.toggle('ready', compareList.length === 2);
  }
  if (navCompareBadge) {
    navCompareBadge.textContent = `${compareList.length}/2`;
  }
  if (navCompareBtn) {
    navCompareBtn.classList.toggle('ready', compareList.length === 2);
  }

  // Update floating dock
  if (!compareDock) return;
  if (compareList.length === 0) {
    compareDock.classList.remove('visible');
  } else {
    compareDock.classList.add('visible');
    const v1 = vehicles.find(v => v.id === compareList[0]);
    const v2 = vehicles.find(v => v.id === compareList[1]);

    if (compareList.length === 1) {
      if (compareDockStatus) compareDockStatus.textContent = '1 of 2 selected · Choose 1 more car';
      if (compareDockLaunch) {
        compareDockLaunch.disabled = true;
        compareDockLaunch.innerHTML = `<span>Compare (1/2)</span><span class="dock-arrow">→</span>`;
      }
    } else {
      if (compareDockStatus) compareDockStatus.textContent = '2 of 2 selected · Ready to benchmark';
      if (compareDockLaunch) {
        compareDockLaunch.disabled = false;
        compareDockLaunch.innerHTML = `<span>Compare Now</span><span class="dock-arrow">→</span>`;
      }
    }

    function renderSlot(v, slotNum) {
      if (!v) {
        return `<div class="dock-slot empty">
          <span>Select 0${slotNum} vehicle</span>
        </div>`;
      }
      return `<div class="dock-slot filled">
        <div class="dock-slot-thumb" style="--card-a:${v.cardA || '#61727c'};--card-b:${v.cardB || '#202a30'}">
          ${v.image ? `<img src="${v.image}" alt="${v.brand} ${v.model}" />` : carMarkup()}
        </div>
        <div class="dock-slot-info">
          <strong>${v.brand} ${v.model}</strong>
          <span>${v.price || 'Demo price'}</span>
        </div>
        <button type="button" class="dock-slot-remove" data-remove-compare="${v.id}" aria-label="Remove ${v.brand} ${v.model} from comparison">×</button>
      </div>`;
    }

    if (compareDockSlots) {
      compareDockSlots.innerHTML = `
        ${renderSlot(v1, 1)}
        <span class="dock-vs">VS</span>
        ${renderSlot(v2, 2)}
      `;

      compareDockSlots.querySelectorAll('[data-remove-compare]').forEach(b => {
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleCompare(b.dataset.removeCompare);
        });
      });
    }
  }
}

function renderInventory() {
  if (!inventoryGrid) return;
  const minYear = (yearFilter && yearFilter.value !== 'all') ? Number(yearFilter.value) : 0;
  let filtered = vehicles.filter(v =>
    (!brandFilter || brandFilter.value === 'all' || v.brand === brandFilter.value) &&
    (!bodyFilter || bodyFilter.value === 'all' || v.body === bodyFilter.value) &&
    v.year >= minYear &&
    (!searchFilter || !searchFilter.value.trim() || (v.brand + ' ' + v.model).toLowerCase().includes(searchFilter.value.trim().toLowerCase())) &&
    (!mileageFilter || mileageFilter.value === 'all' || parseNumber(v.mileage) <= Number(mileageFilter.value)) &&
    (!powerFilter || powerFilter.value === 'all' || parseNumber(v.power) >= Number(powerFilter.value))
  );

  const sortBy = sortFilter ? sortFilter.value : 'default';
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => parseNumber(a.price) - parseNumber(b.price));
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => parseNumber(b.price) - parseNumber(a.price));
  } else if (sortBy === 'year-desc') {
    filtered.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
  } else if (sortBy === 'year-asc') {
    filtered.sort((a, b) => Number(a.year || 0) - Number(b.year || 0));
  }

  const advancedCount = [yearFilter, mileageFilter, powerFilter].filter(field => field.value !== 'all').length;
  const advancedCountLabel = document.getElementById('advancedFilterCount');
  if (advancedCountLabel) {
    advancedCountLabel.hidden = advancedCount === 0;
    advancedCountLabel.textContent = String(advancedCount);
    advancedCountLabel.setAttribute('aria-label', `${advancedCount} active advanced filters`);
  }
  if (resultCount) resultCount.textContent = `${filtered.length} vehicle${filtered.length === 1 ? '' : 's'}`;
  if (!filtered.length) {
    inventoryGrid.innerHTML = '<div class="inventory-empty"><h3>No cars match these filters</h3><p>Try a different model, or clear the filters to see all vehicles.</p><button type="button" class="primary-button" id="emptyReset">Clear all filters</button></div>';
    document.getElementById('emptyReset').addEventListener('click', resetInventoryFilters);
    return;
  }
  if(document.body.classList.contains('select-home')&&!window.DannyAllStock&&!searchFilter.value.trim()&&brandFilter.value==='all'&&bodyFilter.value==='all'&&minYear===0&&mileageFilter.value==='all'&&powerFilter.value==='all')filtered=filtered.slice(0,4);
  inventoryGrid.innerHTML = filtered.map((v, index) => {
    const isCompared = compareList.includes(v.id);
    if(document.body.classList.contains('select-home'))return `<article class="car-card select-car ${isCompared?'is-compared':''}" data-id="${v.id}" aria-label="${v.brand} ${v.model}"><div class="card-visual"><img class="card-photo" src="${v.image}" alt="${v.brand} ${v.model}" width="960" height="540" loading="${index<4?'eager':'lazy'}"><span class="select-stock-badge">${v.sample?(v.image.includes('-example-v26.png')?'AI EXAMPLE':'ILLUSTRATION'):v.status==='reserved'?'RESERVED':'AVAILABLE'}</span><button type="button" class="thumb-compare-btn" data-compare-id="${v.id}" aria-pressed="${isCompared}" aria-label="Compare ${v.brand} ${v.model}"><span class="thumb-compare-icon">${isCompared?'✓':'⇄'}</span><span>Compare</span></button></div><div class="card-info"><h3>${v.brand} ${v.model}</h3><p class="select-car-kind">${v.body} · ${v.sample?'Sample listing':v.status}</p><div class="select-car-meta"><span><img src="/assets/icons/calendar.svg" alt="" width="17" height="17"><small>Year</small><b>${v.year}</b></span><span title="${v.engine}"><img src="/assets/icons/engine.svg" alt="" width="17" height="17"><small>Engine</small><b>${v.engine}</b></span><span title="${v.mileage}"><img src="/assets/icons/gauge.svg" alt="" width="17" height="17"><small>Mileage</small><b>${v.mileage}</b></span></div><div class="select-car-bottom"><strong class="card-price">${v.price||'Price on request'}</strong><button type="button" class="card-open-link" data-details-id="${v.id}">View details →</button></div><button type="button" class="card-calc-link" data-calc-id="${v.id}" aria-label="Calculate loan for ${v.brand} ${v.model}"><img src="/assets/icons/calculator.svg" alt="" width="17" height="17">Plan instalments ↗</button>${v.presenter?.url?`<a class="select-presenter-link" href="/vehicle/${v.id}/#danny-walkaround">With Danny ↗</a>`:""}</div></article>`;
    return `
    <article class="car-card ${isCompared ? 'is-compared' : ''}" data-id="${v.id}" aria-label="${v.brand} ${v.model} demo vehicle">
      <div class="card-visual" style="--card-a:${v.cardA || '#61727c'};--card-b:${v.cardB || '#202a30'}">
        ${v.image ? `<img class="card-photo" src="${v.image}" alt="${v.brand} ${v.model} demo vehicle image" width="960" height="540" decoding="async" loading="${index < 3 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'auto'}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="card-photo-fallback" style="display:none">${carMarkup()}</div>` : carMarkup()}
        <button type="button" class="thumb-compare-btn ${isCompared ? 'active' : ''}" data-compare-id="${v.id}" aria-pressed="${isCompared}" aria-label="${isCompared ? 'Remove ' + v.brand + ' ' + v.model + ' from compare queue' : 'Add ' + v.brand + ' ' + v.model + ' to compare queue'}" title="${isCompared ? 'Remove from compare queue' : 'Add to compare queue'}">
          <span class="thumb-compare-icon">${isCompared ? '✓' : '⇄'}</span>
          <span>${isCompared ? 'Comparing' : 'Compare'}</span>
        </button>
      </div>
      <div class="card-info">
        <div class="card-top">
          <h3>${v.brand} ${v.model}</h3>
          <div class="card-meta">
            <span class="card-year">${v.year}</span>
            <strong class="card-price">${v.price || 'Price on request'}</strong>
          </div>
        </div>
        <div class="card-specs">
          <div><small>Mileage</small><strong>${v.mileage}</strong></div>
          <div><small>Engine</small><strong>${v.engine}</strong></div>
          <div><small>Power</small><strong>${v.power}</strong></div>
        </div>
        <div class="card-footer-row">
          <div class="card-links">
            <button type="button" class="card-open-link" data-details-id="${v.id}">View details <span aria-hidden="true">→</span></button>
            <button type="button" class="card-calc-link" data-calc-id="${v.id}" title="Calculate loan for ${v.brand} ${v.model}">Calc Loan ↘</button>
            ${v.actualPage ? `<a class="interaction-link" href="${v.actualPage}" data-interaction-link>View interaction ↗</a>` : ''}
          </div>
          <button type="button" class="card-compare-btn ${isCompared ? 'active' : ''}" data-compare-id="${v.id}" aria-pressed="${isCompared}" aria-label="${isCompared ? 'Remove ' + v.brand + ' ' + v.model + ' from compare' : 'Compare ' + v.brand + ' ' + v.model}">
            <span class="btn-icon">${isCompared ? '✓' : '＋'}</span>
            <span>${isCompared ? 'In Compare' : 'Compare'}</span>
          </button>
        </div>
      </div>
    </article>`;
  }).join('');

  inventoryGrid.querySelectorAll('.car-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-compare-btn, .thumb-compare-btn, .card-calc-link, .interaction-link, a')) return;
      openVehicle(card.dataset.id);
    });
  });

  inventoryGrid.querySelectorAll('.card-calc-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.calcId;
      const v = vehicles.find(item => item.id === id);
      if (v) {
        currentCalculatedVehicle = v;
        try { localStorage.setItem('jrcg_active_vehicle_id', v.id); } catch(e) {}
        const aside = document.getElementById('inventoryCalculatorAside');
        if (aside) {
          if (calcVehiclePicker) calcVehiclePicker.value = v.id;
          if (calcPickerStatus) calcPickerStatus.textContent = `${v.brand} ${v.model}`;
          syncLoanCalculatorWithVehicle(v);
          updateRoadTaxCalculation();
          aside.scrollIntoView({ behavior: 'smooth', block: 'start' });
          aside.classList.add('calc-focus-highlight');
          setTimeout(() => aside.classList.remove('calc-focus-highlight'), 1800);
        } else {
          window.location.href = `calculator.html?vehicle=${encodeURIComponent(v.id)}`;
        }
      }
    });
  });

  inventoryGrid.querySelectorAll('.card-compare-btn, .thumb-compare-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCompare(btn.dataset.compareId);
    });
  });
}

function openVehicle(id) {
  location.href = `${window.SITE_BASE || '/'}vehicle/${encodeURIComponent(id)}/` + (window.CMS_DATA?.preview ? `?preview=1` : ``); return;
  window.JRCG.trackView(id);
  currentVehicle = vehicles.find(v => v.id === id) || vehicles[0];
  try { localStorage.setItem('jrcg_active_vehicle_id', currentVehicle.id); } catch(e) {}
  const navCalcLink = document.getElementById('navCalcLink');
  if (navCalcLink) {
    navCalcLink.href = 'calculator.html?vehicle=' + encodeURIComponent(currentVehicle.id);
  }
  document.getElementById('vehicleMeta').textContent = `${currentVehicle.year} · ${currentVehicle.body.toUpperCase()} · DEMO SPEC`;
  document.getElementById('vehicleTitle').textContent = `${currentVehicle.brand} ${currentVehicle.model}`;
  document.getElementById('vehicleSub').textContent = `${currentVehicle.sub}. All specifications and mileage shown are fictional demonstration data.`;
  document.getElementById('quickSpecs').innerHTML = [
    ['Mileage',currentVehicle.mileage],['Engine',currentVehicle.engine],['Power',currentVehicle.power],['Torque',currentVehicle.torque]
  ].map(([k,v]) => `<div><small>${k}</small><strong>${v}</strong></div>`).join('');
  document.getElementById('specGroups').innerHTML = Object.entries(currentVehicle.specs).map(([group,rows]) => `
    <section class="spec-group"><h4>${group}</h4>${rows.map(([k,v])=>`<div class="spec-row"><span>${k}</span><strong>${v}</strong></div>`).join('')}</section>`).join('');
  const photo = document.getElementById('vehiclePhoto');
  photo.src = currentVehicle.image || '';
  photo.alt = currentVehicle.brand + ' ' + currentVehicle.model + ' sample photo';
  photo.style.transform = '';
  const interaction = document.getElementById('vehicleInteraction');
  interaction.hidden = !currentVehicle.actualPage;
  if (currentVehicle.actualPage) interaction.href = currentVehicle.actualPage;

  // Quick financing preview for this vehicle in dialog
  const vPrice = parseVehiclePrice(currentVehicle.price);
  const vPrincipal = vPrice * 0.9;
  const vInterest = vPrincipal * 0.025 * 7;
  const vMonthly = Math.round((vPrincipal + vInterest) / 84);
  const dialogEstMonthly = document.getElementById('dialogEstMonthly');
  if (dialogEstMonthly) dialogEstMonthly.textContent = `RM ${vMonthly.toLocaleString()} / mo`;
  const dialogEstDetails = document.getElementById('dialogEstDetails');
  if (dialogEstDetails) dialogEstDetails.textContent = `10% down (${formatRM(vPrice * 0.1)}) · 7-yr tenure · 2.50% p.a.`;
  const dialogViewingSub = document.getElementById('dialogViewingSub');
  if (dialogViewingSub) dialogViewingSub.textContent = `Reserve physical inspection slot · ${currentVehicle.brand} ${currentVehicle.model}`;
  const dialogWhatsappSummary = document.getElementById('dialogWhatsappSummary');
  if (dialogWhatsappSummary) dialogWhatsappSummary.textContent = `${currentVehicle.year} ${currentVehicle.brand} ${currentVehicle.model} (${currentVehicle.price}) · Est. RM ${vMonthly.toLocaleString()}/mo`;

  vehicleDialog.showModal();
  document.body.style.overflow='hidden';
}

const dialogJumpToCalcBtn = document.getElementById('dialogJumpToCalcBtn');
if (dialogJumpToCalcBtn) {
  dialogJumpToCalcBtn.addEventListener('click', () => {
    const targetVehicle = currentVehicle;
    vehicleDialog.close();
    document.body.style.overflow = '';
    if (targetVehicle) {
      currentCalculatedVehicle = targetVehicle;
      try { localStorage.setItem('jrcg_active_vehicle_id', targetVehicle.id); } catch(e) {}
    }
    const aside = document.getElementById('inventoryCalculatorAside');
    if (aside) {
      if (targetVehicle) {
        if (calcVehiclePicker) calcVehiclePicker.value = targetVehicle.id;
        if (calcPickerStatus) calcPickerStatus.textContent = `${targetVehicle.brand} ${targetVehicle.model}`;
        syncLoanCalculatorWithVehicle(targetVehicle);
        updateRoadTaxCalculation();
      }
      aside.scrollIntoView({ behavior: 'smooth', block: 'start' });
      aside.classList.add('calc-focus-highlight');
      setTimeout(() => aside.classList.remove('calc-focus-highlight'), 1800);
    } else if (targetVehicle) {
      window.location.href = `calculator.html?vehicle=${encodeURIComponent(targetVehicle.id)}`;
    } else {
      window.location.href = 'calculator.html';
    }
  });
}

const dialogBookViewingBtn = document.getElementById('dialogBookViewingBtn');
if (dialogBookViewingBtn && appointmentDialog) {
  dialogBookViewingBtn.addEventListener('click', () => {
    selectedAppointmentVehicle = currentVehicle;
    if (appointmentVehicleName && currentVehicle) {
      appointmentVehicleName.textContent = `${currentVehicle.year} ${currentVehicle.brand} ${currentVehicle.model} · Listed at ${currentVehicle.price}`;
    }
    if (appointmentForm) appointmentForm.style.display = 'flex';
    if (appointmentSuccessView) appointmentSuccessView.style.display = 'none';
    appointmentDialog.showModal();
  });
}

const dialogWhatsappBtn = document.getElementById('dialogWhatsappBtn');
if (dialogWhatsappBtn) {
  dialogWhatsappBtn.addEventListener('click', () => {
    if (!currentVehicle) return;
    const message = window.DannyDesign.vehicleEnquiry(currentVehicle);
    window.open(window.DannyDesign.whatsappURL(message), '_blank', 'noopener,noreferrer');
  });
}



// ==========================================================================
// Recon Loan / Installment Calculator & WhatsApp 1-Click Enquiry
// ==========================================================================

const calcPriceInput = document.getElementById('calcVehiclePrice');
const calcPricePill = document.getElementById('calcPricePill');
const calcDownPaymentPct = document.getElementById('calcDownPaymentPct');
const calcDownPaymentPill = document.getElementById('calcDownPaymentPill');
const calcLoanPeriod = document.getElementById('calcLoanPeriod');
const calcPeriodPill = document.getElementById('calcPeriodPill');
const calcInterestRate = document.getElementById('calcInterestRate');
const calcRatePill = document.getElementById('calcRatePill');
const calcMonthlyAmount = document.getElementById('calcMonthlyAmount');
const calcTotalLoanText = document.getElementById('calcTotalLoanText');
const calcTotalInterestText = document.getElementById('calcTotalInterestText');
const calcTenureTabs = document.getElementById('calcTenureTabs');
const whatsappEnquiryBtn = document.getElementById('whatsappEnquiryBtn');
const whatsappStockSummary = document.getElementById('whatsappStockSummary');
const calcVehiclePicker = document.getElementById('calcVehiclePicker');
const calcPickerStatus = document.getElementById('calcPickerStatus');

let currentCalculatedVehicle = vehicles[0] || null;
const monthlyCounterState = { value: 4450 };
let monthlyGsapTween = null;

function animateMonthlyAmountGSAP(targetValue, animate = true) {
  if (!calcMonthlyAmount) return;
  const roundedTarget = Math.round(targetValue);
  
  if (!animate || typeof gsap === 'undefined') {
    monthlyCounterState.value = roundedTarget;
    calcMonthlyAmount.textContent = roundedTarget.toLocaleString();
    return;
  }

  if (monthlyGsapTween) {
    monthlyGsapTween.kill();
  }

  // Visual feedback pulse on the monthly amount
  calcMonthlyAmount.classList.add('calc-monthly-animating');

  monthlyGsapTween = gsap.to(monthlyCounterState, {
    value: roundedTarget,
    duration: 0.45,
    ease: 'power2.out',
    onUpdate: () => {
      calcMonthlyAmount.textContent = Math.round(monthlyCounterState.value).toLocaleString();
    },
    onComplete: () => {
      calcMonthlyAmount.textContent = roundedTarget.toLocaleString();
      calcMonthlyAmount.classList.remove('calc-monthly-animating');
      monthlyGsapTween = null;
    }
  });
}

// Saved Scenarios DOM Elements
const calcScenariosList = document.getElementById('calcScenariosList');
const calcScenariosCounter = document.getElementById('calcScenariosCounter');
const calcSaveScenarioBtn = document.getElementById('calcSaveScenarioBtn');
const calcSaveBtnLabel = document.getElementById('calcSaveBtnLabel');
const calcClearScenariosBtn = document.getElementById('calcClearScenariosBtn');

const MAX_LOAN_SCENARIOS = 3;
const LOAN_SCENARIO_STORAGE_KEY_PREFIX = 'recon_loan_scenarios_';

function getLoanScenarioStorageKey() {
  const vid = (currentCalculatedVehicle && currentCalculatedVehicle.id) ? currentCalculatedVehicle.id : 'global';
  return `${LOAN_SCENARIO_STORAGE_KEY_PREFIX}${vid}`;
}

function loadSavedLoanScenarios() {
  try {
    const raw = localStorage.getItem(getLoanScenarioStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_LOAN_SCENARIOS);
  } catch (err) {
    console.warn('Unable to load loan scenarios from localStorage:', err);
    return [];
  }
}

function persistLoanScenarios(scenarios) {
  try {
    localStorage.setItem(getLoanScenarioStorageKey(), JSON.stringify(scenarios.slice(0, MAX_LOAN_SCENARIOS)));
  } catch (err) {
    console.warn('Unable to persist loan scenarios to localStorage:', err);
  }
}

function getCurrentLoanState() {
  if (!calcPriceInput || !calcMonthlyAmount) return null;

  const price = parseFloat(calcPriceInput.value) || 0;
  const downPaymentPct = parseFloat(calcDownPaymentPct.value) || 10;
  const tenureYears = parseInt(calcLoanPeriod.value, 10) || 7;
  const ratePct = parseFloat(calcInterestRate.value) || 2.5;

  const downPaymentAmount = price * (downPaymentPct / 100);
  const loanPrincipal = Math.max(0, price - downPaymentAmount);
  const totalInterest = loanPrincipal * (ratePct / 100) * tenureYears;
  const totalPayable = loanPrincipal + totalInterest;
  const totalMonths = tenureYears * 12;
  const monthlyInstallment = totalMonths > 0 ? (totalPayable / totalMonths) : 0;

  return {
    price,
    downPaymentPct,
    downPaymentAmount,
    tenureYears,
    ratePct,
    loanPrincipal,
    totalInterest,
    totalPayable,
    monthlyInstallment: Math.round(monthlyInstallment)
  };
}

let loanAutoSaveTimeout = null;

function saveLoanScenario(explicit = false) {
  const state = getCurrentLoanState();
  if (!state || state.price <= 0) return;

  let scenarios = loadSavedLoanScenarios();

  // Check if identical scenario already exists (same tenure, rate, downPayment, price)
  const existingIndex = scenarios.findIndex(s =>
    s.tenureYears === state.tenureYears &&
    Math.abs(s.ratePct - state.ratePct) < 0.01 &&
    Math.abs(s.downPaymentPct - state.downPaymentPct) < 0.01 &&
    Math.abs(s.price - state.price) < 1
  );

  if (existingIndex === 0 && !explicit) {
    // Already the top scenario; just refresh rendering to keep active marker in sync
    renderLoanScenarios();
    return;
  }

  if (existingIndex >= 0) {
    // Remove old copy so it moves to front (most recently used)
    scenarios.splice(existingIndex, 1);
  }

  const newScenario = {
    id: 'scen_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    ...state,
    timestamp: Date.now()
  };

  scenarios.unshift(newScenario);
  scenarios = scenarios.slice(0, MAX_LOAN_SCENARIOS);
  persistLoanScenarios(scenarios);
  renderLoanScenarios();

  if (explicit && calcSaveScenarioBtn && calcSaveBtnLabel) {
    const originalText = calcSaveBtnLabel.textContent;
    calcSaveScenarioBtn.classList.add('saved-pulse');
    calcSaveBtnLabel.textContent = '✓ Saved!';
    setTimeout(() => {
      calcSaveScenarioBtn.classList.remove('saved-pulse');
      calcSaveBtnLabel.textContent = originalText;
    }, 1400);
  }
}

function scheduleLoanScenarioAutoSave() {
  clearTimeout(loanAutoSaveTimeout);
  loanAutoSaveTimeout = setTimeout(() => {
    saveLoanScenario(false);
  }, 600);
}

function deleteLoanScenario(id) {
  let scenarios = loadSavedLoanScenarios();
  scenarios = scenarios.filter(s => s.id !== id);
  persistLoanScenarios(scenarios);
  renderLoanScenarios();
}

function clearAllLoanScenarios() {
  try {
    localStorage.removeItem(getLoanScenarioStorageKey());
  } catch (e) {}
  renderLoanScenarios();
}

function applyLoanScenario(scenario) {
  if (!scenario) return;

  clearTimeout(loanAutoSaveTimeout);

  if (calcPriceInput) calcPriceInput.value = scenario.price;
  if (calcDownPaymentPct) calcDownPaymentPct.value = scenario.downPaymentPct;
  if (calcInterestRate) calcInterestRate.value = scenario.ratePct;
  if (calcLoanPeriod) calcLoanPeriod.value = scenario.tenureYears;

  if (calcTenureTabs) {
    calcTenureTabs.querySelectorAll('.tenure-tab').forEach(t => {
      if (t.dataset.years === String(scenario.tenureYears)) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
  }

  updateLoanCalculation(true);
  updateRoadTaxCalculation();
  renderLoanScenarios();
}

function renderLoanScenarios() {
  if (!calcScenariosList) return;
  const scenarios = loadSavedLoanScenarios();
  const currentState = getCurrentLoanState();

  if (calcScenariosCounter) {
    calcScenariosCounter.textContent = `${scenarios.length}/${MAX_LOAN_SCENARIOS}`;
  }

  if (calcClearScenariosBtn) {
    calcClearScenariosBtn.hidden = scenarios.length === 0;
  }

  if (scenarios.length === 0) {
    calcScenariosList.innerHTML = `
      <div class="calc-scenarios-empty">
        <p>💡 Tip: Adjust loan tenure tabs (3/5/7/9 Yrs) or interest rate slider. Your last 3 calculated setups will be automatically saved to localStorage for instant comparison.</p>
      </div>
    `;
    return;
  }

  calcScenariosList.innerHTML = scenarios.map(s => {
    const isCurrent = currentState &&
      currentState.tenureYears === s.tenureYears &&
      Math.abs(currentState.ratePct - s.ratePct) < 0.01 &&
      Math.abs(currentState.downPaymentPct - s.downPaymentPct) < 0.01 &&
      Math.abs(currentState.price - s.price) < 1;

    return `
      <div class="calc-scenario-card ${isCurrent ? 'is-active' : ''}" data-scenario-id="${s.id}" role="button" tabindex="0" title="Click to apply ${s.tenureYears} Yrs @ ${s.ratePct.toFixed(2)}%">
        <div class="calc-scenario-card-top">
          <div class="calc-scenario-badges">
            <span class="scen-badge-tenure">${s.tenureYears} Yrs</span>
            <span class="scen-badge-rate">${s.ratePct.toFixed(2)}%</span>
            ${isCurrent ? '<span class="scen-badge-active">ACTIVE</span>' : ''}
          </div>
          <button type="button" class="scen-card-del" data-delete-id="${s.id}" title="Remove scenario" aria-label="Remove scenario">×</button>
        </div>
        <div class="calc-scenario-card-body">
          <div class="scen-monthly-row">
            <span class="scen-currency">RM</span>
            <strong class="scen-amount">${Math.round(s.monthlyInstallment).toLocaleString()}</strong>
            <span class="scen-period">/mo</span>
          </div>
          <div class="scen-meta-row">
            <span>Down: ${s.downPaymentPct}% (${formatRM(s.downPaymentAmount || (s.price * (s.downPaymentPct / 100)))})</span>
            <span>Loan: ${formatRM(s.loanPrincipal)}</span>
          </div>
        </div>
        <div class="calc-scenario-card-footer">
          <span class="scen-switch-prompt">${isCurrent ? 'Current Selection ✓' : 'Click to Switch ↵'}</span>
        </div>
      </div>
    `;
  }).join('');

  calcScenariosList.querySelectorAll('.calc-scenario-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.scen-card-del')) return;
      const id = card.dataset.scenarioId;
      const targetScenario = scenarios.find(item => item.id === id);
      if (targetScenario) {
        applyLoanScenario(targetScenario);
      }
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('.scen-card-del')) return;
        e.preventDefault();
        const id = card.dataset.scenarioId;
        const targetScenario = scenarios.find(item => item.id === id);
        if (targetScenario) {
          applyLoanScenario(targetScenario);
        }
      }
    });
  });

  calcScenariosList.querySelectorAll('.scen-card-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.deleteId;
      deleteLoanScenario(id);
    });
  });
}

function parseVehiclePrice(priceStr) {
  if (!priceStr) return 300000;
  const num = parseInt(String(priceStr).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) || num <= 0 ? 300000 : num;
}

function formatRM(val) {
  return 'RM ' + Math.round(val).toLocaleString();
}

function updateSyncedVehicleCard(vehicle) {
  const previews = document.querySelectorAll('.calc-synced-car-preview, #calcSyncedCarPreview');
  if (!previews.length) return;
  previews.forEach(preview => {
    if (!vehicle || vehicle === 'custom') {
      preview.classList.add('is-custom');
      const customPrice = calcPriceInput ? formatRM(parseFloat(calcPriceInput.value) || 0) : 'Custom RM';
      preview.innerHTML = `
        <div class="calc-synced-custom-note">
          <span class="custom-icon" style="font-size:20px;">✏️</span>
          <div>
            <strong>Custom Price & Recon Vehicle Mode</strong>
            <small>Calculating custom price (${customPrice}). Select any gallery model from the dropdown above to sync with verified inventory.</small>
          </div>
        </div>`;
      return;
    }
    preview.classList.remove('is-custom');
    preview.innerHTML = `
      <div class="calc-synced-thumb-wrap">
        <img src="${vehicle.image || 'assets/audi-s5/main-car-16x9.jpg'}" alt="${vehicle.brand} ${vehicle.model}" class="calc-synced-thumb" onerror="this.src='assets/audi-s5/main-car-16x9.jpg'" />
      </div>
      <div class="calc-synced-info">
        <div class="calc-synced-title-row">
          <div class="calc-synced-name">
            <strong>${vehicle.year} ${vehicle.brand} ${vehicle.model}</strong>
            <span class="calc-synced-badge">${vehicle.price || 'Price on request'}</span>
          </div>
          ${vehicle.actualPage ? `<a href="${vehicle.actualPage}" class="calc-synced-tour-link">Explore Tour ↗</a>` : `<a href="./#inventory" class="calc-synced-tour-link">Showroom ↗</a>`}
        </div>
        <div class="calc-synced-specs">
          <span>${vehicle.engine || 'Engine on request'}</span>
          <span>${vehicle.power || 'Power on request'}</span>
          <span>${vehicle.mileage || 'Mileage on request'}</span>
          <span>${vehicle.color || 'Colour on request'}</span>
        </div>
      </div>`;
  });
}

function syncLoanCalculatorWithVehicle(vehicle) {
  if (!calcPriceInput || !vehicle) return;
  currentCalculatedVehicle = vehicle;
  currentVehicle = vehicle;
  const price = parseVehiclePrice(vehicle.price);
  calcPriceInput.value = price;
  if (calcVehiclePicker && calcVehiclePicker.value !== vehicle.id) {
    calcVehiclePicker.value = vehicle.id;
  }
  if (calcPickerStatus) {
    calcPickerStatus.textContent = `${vehicle.brand} ${vehicle.model}`;
  }
  updateSyncedVehicleCard(vehicle);

  const dedicatedSyncBadge = document.getElementById('dedicatedSyncBadge');
  if (dedicatedSyncBadge) {
    dedicatedSyncBadge.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;margin-right:6px;"></span>Synced: <strong>${vehicle.year} ${vehicle.brand} ${vehicle.model}</strong> (${vehicle.price || formatRM(price)})`;
  }

  try {
    localStorage.setItem('jrcg_active_vehicle_id', vehicle.id);
  } catch (e) {}

  const navCalcLink = document.getElementById('navCalcLink');
  if (navCalcLink) {
    navCalcLink.href = 'calculator.html?vehicle=' + encodeURIComponent(vehicle.id);
  }

  updateLoanCalculation(true);
  
  const existing = loadSavedLoanScenarios();
  if (existing.length === 0) {
    saveLoanScenario(false);
  } else {
    renderLoanScenarios();
  }
}

function updateLoanCalculation(skipAutoSave = false, animateMonthly = false) {
  if (!calcPriceInput || !calcMonthlyAmount) return;

  const price = parseFloat(calcPriceInput.value) || 0;
  const downPaymentPct = parseFloat(calcDownPaymentPct.value) || 10;
  const tenureYears = parseInt(calcLoanPeriod.value, 10) || 7;
  const ratePct = parseFloat(calcInterestRate.value) || 2.5;

  const downPaymentAmount = price * (downPaymentPct / 100);
  const loanPrincipal = Math.max(0, price - downPaymentAmount);
  const totalInterest = loanPrincipal * (ratePct / 100) * tenureYears;
  const totalPayable = loanPrincipal + totalInterest;
  const totalMonths = tenureYears * 12;
  const monthlyInstallment = totalMonths > 0 ? (totalPayable / totalMonths) : 0;

  calcPricePill.textContent = formatRM(price);
  calcDownPaymentPill.textContent = `${downPaymentPct}% (${formatRM(downPaymentAmount)})`;
  calcPeriodPill.textContent = `${tenureYears} Years (${totalMonths} Mo)`;
  calcRatePill.textContent = `${ratePct.toFixed(2)}%`;

  if (calcDownPaymentPct) {
    const min = parseFloat(calcDownPaymentPct.min) || 0;
    const max = parseFloat(calcDownPaymentPct.max) || 50;
    const pct = Math.max(0, Math.min(100, ((downPaymentPct - min) / (max - min)) * 100));
    calcDownPaymentPct.style.setProperty('--fill-pct', `${pct}%`);
  }
  if (calcInterestRate) {
    const min = parseFloat(calcInterestRate.min) || 2.0;
    const max = parseFloat(calcInterestRate.max) || 4.5;
    const pct = Math.max(0, Math.min(100, ((ratePct - min) / (max - min)) * 100));
    calcInterestRate.style.setProperty('--fill-pct', `${pct}%`);
  }
  const dpPresets = document.getElementById('downPaymentPresets');
  if (dpPresets) {
    dpPresets.querySelectorAll('.calc-preset-chip').forEach(btn => {
      btn.classList.toggle('active', Math.abs(parseFloat(btn.dataset.val) - downPaymentPct) < 0.1);
    });
  }
  const ratePresets = document.getElementById('interestRatePresets');
  if (ratePresets) {
    ratePresets.querySelectorAll('.calc-preset-chip').forEach(btn => {
      btn.classList.toggle('active', Math.abs(parseFloat(btn.dataset.val) - ratePct) < 0.05);
    });
  }

  // Smooth counter-count animation using GSAP
  animateMonthlyAmountGSAP(monthlyInstallment, animateMonthly);
  calcTotalLoanText.textContent = formatRM(loanPrincipal);
  calcTotalInterestText.textContent = formatRM(totalInterest);

  const targetVehicle = currentCalculatedVehicle || currentVehicle || vehicles[0];
  if (whatsappStockSummary && targetVehicle) {
    whatsappStockSummary.textContent = `${targetVehicle.brand} ${targetVehicle.model} (${formatRM(price)}) · Est. RM ${Math.round(monthlyInstallment).toLocaleString()}/mo`;
  }

  // Update amortization badge and panel if expanded
  if (amortizationBadgeCount) {
    amortizationBadgeCount.textContent = `${totalMonths} Months (${tenureYears} Yrs)`;
  }
  if (amortizationOpen) {
    renderAmortizationSchedule();
  }

  if (!skipAutoSave) {
    renderLoanScenarios();
    scheduleLoanScenarioAutoSave();
  } else {
    renderLoanScenarios();
  }
}

// Tenure Tab Buttons
if (calcTenureTabs) {
  calcTenureTabs.querySelectorAll('.tenure-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      calcTenureTabs.querySelectorAll('.tenure-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const years = tab.dataset.years;
      calcLoanPeriod.value = years;
      updateLoanCalculation();
      updateRoadTaxCalculation();
    });
  });
}

// Calculator Input Listeners
[calcPriceInput, calcDownPaymentPct, calcInterestRate].forEach(input => {
  if (input) {
    input.addEventListener('input', () => {
      const isPriceOrDownPayment = (input === calcPriceInput || input === calcDownPaymentPct);
      if (input === calcPriceInput && currentCalculatedVehicle) {
        const val = parseFloat(calcPriceInput.value) || 0;
        if (parseVehiclePrice(currentCalculatedVehicle.price) !== val) {
          if (calcVehiclePicker) calcVehiclePicker.value = 'custom';
          if (calcPickerStatus) calcPickerStatus.textContent = 'Custom Price';
          updateSyncedVehicleCard(null);
        }
      }
      updateLoanCalculation(false, isPriceOrDownPayment);
      updateRoadTaxCalculation();
    });
    input.addEventListener('change', () => {
      const isPriceOrDownPayment = (input === calcPriceInput || input === calcDownPaymentPct);
      updateLoanCalculation(false, isPriceOrDownPayment);
      updateRoadTaxCalculation();
    });
  }
});

// Quick Presets Listeners for Range Sliders
const downPaymentPresets = document.getElementById('downPaymentPresets');
if (downPaymentPresets) {
  downPaymentPresets.querySelectorAll('.calc-preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      if (calcDownPaymentPct) {
        calcDownPaymentPct.value = btn.dataset.val;
        updateLoanCalculation(false, true);
        updateRoadTaxCalculation();
      }
    });
  });
}

const interestRatePresets = document.getElementById('interestRatePresets');
if (interestRatePresets) {
  interestRatePresets.querySelectorAll('.calc-preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      if (calcInterestRate) {
        calcInterestRate.value = btn.dataset.val;
        updateLoanCalculation();
        updateRoadTaxCalculation();
      }
    });
  });
}

// Saved Scenarios Action Listeners
if (calcSaveScenarioBtn) {
  calcSaveScenarioBtn.addEventListener('click', () => {
    saveLoanScenario(true);
  });
}

if (calcClearScenariosBtn) {
  calcClearScenariosBtn.addEventListener('click', () => {
    clearAllLoanScenarios();
  });
}

// Vehicle Picker in Standalone Calculator
function initCalculatorVehiclePicker() {
  if (!calcVehiclePicker) return;
  calcVehiclePicker.innerHTML = [
    ...vehicles.map(v => `<option value="${v.id}">${v.year} ${v.brand} ${v.model} (${v.price || 'RM 300,000'})</option>`),
    `<option value="custom">✏ Custom Price / Other Recon Model</option>`
  ].join('');

  calcVehiclePicker.addEventListener('change', () => {
    const selectedId = calcVehiclePicker.value;
    if (selectedId === 'custom') {
      if (calcPickerStatus) calcPickerStatus.textContent = 'Custom Input';
      updateSyncedVehicleCard(null);
      return;
    }
    const found = vehicles.find(v => v.id === selectedId);
    if (found) {
      currentCalculatedVehicle = found;
      currentVehicle = found;
      if (calcPickerStatus) calcPickerStatus.textContent = `${found.brand} ${found.model}`;
      syncLoanCalculatorWithVehicle(found);
      updateRoadTaxCalculation();
    }
  });

  // Determine initial target vehicle based on priority:
  // 1. URL search parameter (?vehicle=...)
  // 2. Persisted active vehicle in localStorage
  // 3. Fallback to vehicles[0]
  let targetVehicle = vehicles[0] || null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleParam = urlParams.get('vehicle');
    if (vehicleParam) {
      const match = vehicles.find(v => v.id === vehicleParam);
      if (match) targetVehicle = match;
    } else {
      const storedId = localStorage.getItem('jrcg_active_vehicle_id');
      if (storedId) {
        const match = vehicles.find(v => v.id === storedId);
        if (match) targetVehicle = match;
      }
    }
  } catch (e) {
    // Graceful fallback
  }

  if (targetVehicle) {
    calcVehiclePicker.value = targetVehicle.id;
    syncLoanCalculatorWithVehicle(targetVehicle);
    updateRoadTaxCalculation();
  }
}

// ==========================================================================
// Detailed Loan Amortization Schedule (Month-by-Month Breakdown)
// ==========================================================================

const amortizationToggleBtn = document.getElementById('amortizationToggleBtn');
const amortizationSchedulePanel = document.getElementById('amortizationSchedulePanel');
const amortizationBadgeCount = document.getElementById('amortizationBadgeCount');
const amortizationToggleHint = document.getElementById('amortizationToggleHint');
const calcAmortizationSection = document.getElementById('calcAmortizationSection');

let amortizationOpen = false;
let amortizationMethod = 'rule78'; // 'rule78' (Malaysian hire-purchase Rule of 78) | 'equal' (straight-line)
let amortizationSelectedYear = 'all'; // 'all' | 1 | 2 ...

function toggleAmortizationPanel(forceState) {
  amortizationOpen = (typeof forceState === 'boolean') ? forceState : !amortizationOpen;
  
  if (amortizationToggleBtn) {
    amortizationToggleBtn.setAttribute('aria-expanded', amortizationOpen ? 'true' : 'false');
  }
  if (calcAmortizationSection) {
    calcAmortizationSection.classList.toggle('is-expanded', amortizationOpen);
  }
  if (amortizationToggleHint) {
    amortizationToggleHint.textContent = amortizationOpen ? 'Hide Breakdown' : 'View Month-by-Month Breakdown';
  }
  if (amortizationSchedulePanel) {
    amortizationSchedulePanel.hidden = !amortizationOpen;
    if (amortizationOpen) {
      renderAmortizationSchedule();
    }
  }
}

if (amortizationToggleBtn) {
  amortizationToggleBtn.addEventListener('click', () => {
    toggleAmortizationPanel();
  });
}

function calculateAmortizationData(principal, totalInterest, totalMonths, method = 'rule78') {
  if (totalMonths <= 0 || principal <= 0) return { schedule: [], yearlyTotals: [] };

  const totalPayable = principal + totalInterest;
  const regularMonthlyPayment = Math.round(totalPayable / totalMonths);
  const schedule = [];
  const sumOfDigits = (totalMonths * (totalMonths + 1)) / 2;

  let remainingPrincipal = principal;
  let cumulativeInterestPaid = 0;
  let cumulativePrincipalPaid = 0;

  for (let m = 1; m <= totalMonths; m++) {
    let monthInterest = 0;
    let monthPrincipal = 0;
    let monthlyPayment = regularMonthlyPayment;

    if (method === 'rule78') {
      // Rule of 78: weight = (N - m + 1) / S
      const weight = (totalMonths - m + 1) / sumOfDigits;
      monthInterest = Math.round(totalInterest * weight);
      monthPrincipal = monthlyPayment - monthInterest;
    } else {
      // Straight Equal Split
      monthInterest = Math.round(totalInterest / totalMonths);
      monthPrincipal = monthlyPayment - monthInterest;
    }

    // Adjustment on the final month so cumulative sums balance perfectly
    if (m === totalMonths) {
      monthInterest = Math.max(0, Math.round(totalInterest - cumulativeInterestPaid));
      monthPrincipal = remainingPrincipal;
      monthlyPayment = monthPrincipal + monthInterest;
    } else {
      if (monthPrincipal > remainingPrincipal) {
        monthPrincipal = remainingPrincipal;
      }
    }

    cumulativeInterestPaid += monthInterest;
    cumulativePrincipalPaid += monthPrincipal;
    remainingPrincipal = Math.max(0, principal - cumulativePrincipalPaid);

    schedule.push({
      month: m,
      year: Math.ceil(m / 12),
      monthlyPayment,
      principalPaid: monthPrincipal,
      interestPaid: monthInterest,
      remainingBalance: remainingPrincipal,
      cumulativeInterest: cumulativeInterestPaid,
      principalRatio: monthlyPayment > 0 ? (monthPrincipal / monthlyPayment) : 0
    });
  }

  // Calculate yearly subtotals
  const totalYears = Math.ceil(totalMonths / 12);
  const yearlyTotals = [];

  for (let y = 1; y <= totalYears; y++) {
    const yearMonths = schedule.filter(s => s.year === y);
    const yrPrincipal = yearMonths.reduce((sum, item) => sum + item.principalPaid, 0);
    const yrInterest = yearMonths.reduce((sum, item) => sum + item.interestPaid, 0);
    const yrPayment = yearMonths.reduce((sum, item) => sum + item.monthlyPayment, 0);
    const endBalance = yearMonths.length > 0 ? yearMonths[yearMonths.length - 1].remainingBalance : 0;

    yearlyTotals.push({
      year: y,
      monthsCount: yearMonths.length,
      totalPayment: yrPayment,
      totalPrincipal: yrPrincipal,
      totalInterest: yrInterest,
      endBalance
    });
  }

  return { schedule, yearlyTotals };
}

function renderAmortizationSchedule() {
  if (!amortizationSchedulePanel) return;

  const state = getCurrentLoanState();
  if (!state || state.loanPrincipal <= 0) {
    amortizationSchedulePanel.innerHTML = '<p class="amort-empty-msg" style="margin:0;font-size:11px;color:#7b8a95;">Please enter a valid loan amount above.</p>';
    return;
  }

  const totalMonths = state.tenureYears * 12;
  if (amortizationBadgeCount) {
    amortizationBadgeCount.textContent = `${totalMonths} Months (${state.tenureYears} Yrs)`;
  }

  const { schedule, yearlyTotals } = calculateAmortizationData(
    state.loanPrincipal,
    state.totalInterest,
    totalMonths,
    amortizationMethod
  );

  const interestRatioPct = state.totalPayable > 0
    ? ((state.totalInterest / state.totalPayable) * 100).toFixed(1)
    : '0';
  const principalRatioPct = (100 - parseFloat(interestRatioPct)).toFixed(1);

  // Filter schedule by selected year tab
  const displaySchedule = (amortizationSelectedYear === 'all')
    ? schedule
    : schedule.filter(item => item.year === parseInt(amortizationSelectedYear, 10));

  const yearsCount = state.tenureYears;

  amortizationSchedulePanel.innerHTML = `
    <!-- Summary Distribution Card -->
    <div class="amort-distribution-card">
      <div class="amort-stats-row">
        <div class="amort-stat-item is-principal">
          <span class="amort-stat-lbl">Loan Principal</span>
          <strong class="amort-stat-val">${formatRM(state.loanPrincipal)}</strong>
        </div>
        <div class="amort-stat-item is-interest">
          <span class="amort-stat-lbl">Total Interest (${state.ratePct.toFixed(2)}%)</span>
          <strong class="amort-stat-val">${formatRM(state.totalInterest)}</strong>
        </div>
        <div class="amort-stat-item">
          <span class="amort-stat-lbl">Total Payable</span>
          <strong class="amort-stat-val">${formatRM(state.totalPayable)}</strong>
        </div>
      </div>

      <div class="amort-ratio-bar-wrapper">
        <div class="amort-ratio-bar" title="Principal: ${principalRatioPct}% | Interest: ${interestRatioPct}%">
          <div class="amort-ratio-segment segment-principal" style="width: ${principalRatioPct}%;"></div>
          <div class="amort-ratio-segment segment-interest" style="width: ${interestRatioPct}%;"></div>
        </div>
        <div class="amort-ratio-legend">
          <div class="amort-legend-item">
            <span class="amort-legend-dot is-principal"></span>
            <span>Principal (${principalRatioPct}%)</span>
          </div>
          <div class="amort-legend-item">
            <span class="amort-legend-dot is-interest"></span>
            <span>Interest (${interestRatioPct}%)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Methodology Switcher -->
    <div class="amort-method-block">
      <div class="amort-method-tabs" role="tablist" aria-label="Financing Calculation Model">
        <button type="button" class="amort-method-tab ${amortizationMethod === 'rule78' ? 'active' : ''}" data-method="rule78" role="tab" aria-selected="${amortizationMethod === 'rule78'}">
          Rule of 78 (Malaysian Bank Standard)
        </button>
        <button type="button" class="amort-method-tab ${amortizationMethod === 'equal' ? 'active' : ''}" data-method="equal" role="tab" aria-selected="${amortizationMethod === 'equal'}">
          Flat Equal Split
        </button>
      </div>
      <p class="amort-method-note">
        ${amortizationMethod === 'rule78'
          ? 'ℹ <strong>Rule of 78:</strong> Hire-purchase interest is front-loaded in earlier months. Early settlement rebates follow Bank Negara Malaysia hire-purchase formulas.'
          : 'ℹ <strong>Flat Equal Split:</strong> Fixed equal principal and interest portions across all ' + totalMonths + ' monthly payments.'
        }
      </p>
    </div>

    <!-- Year Filter & CSV Export Toolbar -->
    <div class="amort-toolbar">
      <div class="amort-year-tabs" role="tablist" aria-label="Filter schedule by year">
        <button type="button" class="amort-year-tab ${amortizationSelectedYear === 'all' ? 'active' : ''}" data-year="all">All (${totalMonths} Mo)</button>
        ${Array.from({ length: yearsCount }, (_, i) => i + 1).map(y => `
          <button type="button" class="amort-year-tab ${String(amortizationSelectedYear) === String(y) ? 'active' : ''}" data-year="${y}">Year ${y}</button>
        `).join('')}
      </div>

      <button type="button" class="amort-export-btn" id="amortExportCsvBtn" title="Download amortization table as CSV spreadsheet">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Export CSV</span>
      </button>
    </div>

    <!-- Scrollable Month-by-Month Amortization Table -->
    <div class="amort-table-wrapper" tabindex="0" aria-label="Month by month payment amortization table">
      <table class="amort-table">
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Installment</th>
            <th scope="col">Principal</th>
            <th scope="col">Interest</th>
            <th scope="col" style="text-align:center; min-width: 65px;">Split</th>
            <th scope="col">Remaining</th>
          </tr>
        </thead>
        <tbody>
          ${displaySchedule.map((row) => {
            const pPct = Math.round(row.principalRatio * 100);
            const iPct = 100 - pPct;
            const isYearEnd = row.month % 12 === 0 || row.month === totalMonths;
            const yearIndex = row.year;
            const yearSummary = yearlyTotals.find(yt => yt.year === yearIndex);

            let rowHtml = `
              <tr>
                <td style="font-weight: 600; color: var(--ds-muted);">Mo ${row.month}</td>
                <td>RM ${row.monthlyPayment.toLocaleString()}</td>
                <td style="color: var(--accent); font-weight: 600;">RM ${row.principalPaid.toLocaleString()}</td>
                <td style="color: var(--ds-muted);">RM ${row.interestPaid.toLocaleString()}</td>
                <td style="padding: 6px 4px; vertical-align: middle;">
                  <div style="display:flex; height:5px; border-radius:3px; overflow:hidden; background:rgba(255,255,255,0.06); width:100%;">
                    <div style="background:var(--accent); width:${pPct}%;" title="Principal: ${pPct}%"></div>
                    <div style="background:var(--ds-muted); width:${iPct}%;" title="Interest: ${iPct}%"></div>
                  </div>
                </td>
                <td style="font-weight: 600; color: var(--ds-text);">RM ${row.remainingBalance.toLocaleString()}</td>
              </tr>
            `;

            if (isYearEnd && amortizationSelectedYear === 'all' && yearSummary) {
              rowHtml += `
                <tr class="amort-subtotal-row" style="background: var(--ds-accent-soft); border-top: 1px solid var(--ds-border); border-bottom: 1px solid var(--ds-border); font-weight: 700;">
                  <td style="color: var(--accent); font-size: 9px; text-transform: uppercase;">Year ${yearIndex} Total</td>
                  <td style="color: var(--ds-text);">RM ${yearSummary.totalPayment.toLocaleString()}</td>
                  <td style="color: var(--accent);">RM ${yearSummary.totalPrincipal.toLocaleString()}</td>
                  <td style="color: var(--ds-muted);">RM ${yearSummary.totalInterest.toLocaleString()}</td>
                  <td style="text-align: center; color: #8c9ea8; font-size: 8px;">12 Mo</td>
                  <td style="color: var(--ds-text);">RM ${yearSummary.endBalance.toLocaleString()}</td>
                </tr>
              `;
            }

            return rowHtml;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Attach event listeners inside the panel
  amortizationSchedulePanel.querySelectorAll('.amort-method-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      amortizationMethod = tab.dataset.method;
      renderAmortizationSchedule();
    });
  });

  amortizationSchedulePanel.querySelectorAll('.amort-year-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      amortizationSelectedYear = tab.dataset.year;
      renderAmortizationSchedule();
    });
  });

  const exportBtn = amortizationSchedulePanel.querySelector('#amortExportCsvBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      downloadAmortizationCsv(schedule, state);
    });
  }
}

function downloadAmortizationCsv(schedule, state) {
  if (!schedule || schedule.length === 0) return;

  const carLabel = (currentCalculatedVehicle && currentCalculatedVehicle.brand)
    ? `${currentCalculatedVehicle.brand} ${currentCalculatedVehicle.model}`
    : 'Recon Vehicle';

  const headers = ['Month', 'Monthly Payment (RM)', 'Principal Paid (RM)', 'Interest Paid (RM)', 'Cumulative Interest (RM)', 'Remaining Principal Balance (RM)'];
  const rows = schedule.map(row => [
    `Month ${row.month}`,
    row.monthlyPayment,
    row.principalPaid,
    row.interestPaid,
    row.cumulativeInterest,
    row.remainingBalance
  ]);

  const csvContent = [
    `# Japan Recon Car Gallery - Loan Amortization Schedule`,
    `# Vehicle: ${carLabel}`,
    `# Price: RM ${state.price.toLocaleString()} | Down Payment: ${state.downPaymentPct}% (RM ${Math.round(state.downPaymentAmount).toLocaleString()})`,
    `# Loan Principal: RM ${Math.round(state.loanPrincipal).toLocaleString()} | Tenure: ${state.tenureYears} Years (${state.tenureYears * 12} Months) | Interest Rate: ${state.ratePct.toFixed(2)}% p.a.`,
    `# Calculation Method: ${amortizationMethod === 'rule78' ? 'Rule of 78 (Malaysian Bank Standard)' : 'Flat Straight-Line Split'}`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `amortization-schedule-${state.tenureYears}yr-${state.ratePct.toFixed(2)}pct.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================================================
// Malaysian JPJ Road Tax & Total Cost on the Road (OTR) Estimator
// ==========================================================================

const taxRegionSelect = document.getElementById('taxRegionSelect');
const taxNcdSelect = document.getElementById('taxNcdSelect');
const taxRegTypeSelect = document.getElementById('taxRegTypeSelect');
const roadTaxVal = document.getElementById('roadTaxVal');
const roadTaxCcInfo = document.getElementById('roadTaxCcInfo');
const insuranceVal = document.getElementById('insuranceVal');
const ncdInfo = document.getElementById('ncdInfo');
const totalOtrVal = document.getElementById('totalOtrVal');

function getEngineDisplacementCc(engineStr) {
  if (!engineStr) return 2000;
  const str = String(engineStr).toLowerCase();
  if (str.includes('3.8l')) return 3799;
  if (str.includes('3.0l')) return 2995;
  if (str.includes('2.5l')) return 2487;
  if (str.includes('2.4l')) return 2393;
  if (str.includes('2.0l')) return 1996;
  const match = str.match(/(\d+\.?\d*)\s*l/i);
  if (match) return Math.round(parseFloat(match[1]) * 1000);
  return 2000;
}

// Official Malaysian JPJ private car road tax calculation
function calculateJpjRoadTax(cc, region = 'wm', isCompany = false) {
  if (region === 'duty_free') {
    // Duty-free zones (Langkawi / Labuan) have 50% discount on road tax
    return Math.round(calculateJpjRoadTax(cc, 'wm', isCompany) * 0.5);
  }

  let baseRate = 0;
  let progressive = 0;

  if (region === 'em') {
    // East Malaysia (Sabah & Sarawak) lower progressive road tax
    if (cc <= 1000) return 20;
    if (cc <= 1200) return 28;
    if (cc <= 1400) return 35;
    if (cc <= 1600) return 42;
    if (cc <= 1800) { baseRate = 80; progressive = (cc - 1600) * 0.16; }
    else if (cc <= 2000) { baseRate = 112; progressive = (cc - 1800) * 0.25; }
    else if (cc <= 2500) { baseRate = 162; progressive = (cc - 2000) * 0.50; }
    else if (cc <= 3000) { baseRate = 412; progressive = (cc - 2500) * 1.00; }
    else { baseRate = 912; progressive = (cc - 3000) * 1.35; }
  } else {
    // Peninsular Malaysia (Semenanjung)
    if (cc <= 1000) return 20;
    if (cc <= 1200) return 55;
    if (cc <= 1400) return 70;
    if (cc <= 1600) return 90;
    if (cc <= 1800) { baseRate = 200; progressive = (cc - 1600) * 0.40; }
    else if (cc <= 2000) { baseRate = 280; progressive = (cc - 1800) * 0.50; }
    else if (cc <= 2500) { baseRate = 380; progressive = (cc - 2000) * 1.00; }
    else if (cc <= 3000) { baseRate = 880; progressive = (cc - 2500) * 2.50; }
    else { baseRate = 2130; progressive = (cc - 3000) * 4.50; }
  }

  let totalTax = baseRate + progressive;
  if (isCompany) totalTax *= 1.5; // Company registration surcharge
  return Math.round(totalTax);
}

function updateRoadTaxCalculation() {
  const targetVehicle = currentCalculatedVehicle || currentVehicle || vehicles[0];
  if (!roadTaxVal || !targetVehicle) return;

  const cc = getEngineDisplacementCc(targetVehicle.engine);
  const region = taxRegionSelect ? taxRegionSelect.value : 'wm';
  const isCompany = taxRegTypeSelect ? taxRegTypeSelect.value === 'company' : false;
  const ncdPct = taxNcdSelect ? parseFloat(taxNcdSelect.value) : 0;

  const vehiclePrice = parseFloat(calcPriceInput ? calcPriceInput.value : 0) || parseVehiclePrice(targetVehicle.price);
  const annualRoadTax = calculateJpjRoadTax(cc, region, isCompany);

  // Comprehensive Motor Insurance estimation (approx 2.4% tariff base - NCD discount + RM 250 basic loading/stamp duty)
  const baseInsurance = vehiclePrice * 0.024;
  const discountedInsurance = Math.max(1200, Math.round(baseInsurance * (1 - (ncdPct / 100)) + 250));

  // Initial Cash Outlay (Down Payment + Road Tax + 1st Year Insurance + Inspection/AP Endorsement fees ~RM 2,000)
  const downPaymentPct = parseFloat(calcDownPaymentPct ? calcDownPaymentPct.value : 10) || 10;
  const downPaymentAmount = vehiclePrice * (downPaymentPct / 100);
  const totalOutlay = downPaymentAmount + annualRoadTax + discountedInsurance + 2000;

  roadTaxVal.textContent = formatRM(annualRoadTax);
  const regionName = region === 'em' ? 'East Malaysia' : region === 'duty_free' ? 'Duty Free Zone' : 'Peninsular';
  roadTaxCcInfo.textContent = `${(cc / 1000).toFixed(1)}L (${cc} cc) · ${regionName} · ${isCompany ? 'Company' : 'Private'}`;

  insuranceVal.textContent = formatRM(discountedInsurance);
  ncdInfo.textContent = `NCD ${ncdPct}% Comprehensive · Sum Insured ${formatRM(vehiclePrice)}`;

  totalOtrVal.textContent = formatRM(totalOutlay);
}

[taxRegionSelect, taxNcdSelect, taxRegTypeSelect].forEach(sel => {
  if (sel) sel.addEventListener('change', updateRoadTaxCalculation);
});

// ==========================================================================
// Showroom Viewing & Test Drive Appointment Booking Modal
// ==========================================================================

const bookViewingBtn = document.getElementById('bookViewingBtn');
const closeAppointmentDialog = document.getElementById('closeAppointmentDialog');
const closeSuccessAppointmentBtn = document.getElementById('closeSuccessAppointmentBtn');
const sendAppConfirmationWhatsAppBtn = document.getElementById('sendAppConfirmationWhatsAppBtn');
const appDateInput = document.getElementById('appDateInput');
let lastAppointmentData = null;

// Set default viewing date to tomorrow
if (appDateInput) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  appDateInput.min = window.DannyDesign.localDate(tomorrow);
  appDateInput.value = window.DannyDesign.localDate(tomorrow);
}

if (bookViewingBtn && appointmentDialog) {
  bookViewingBtn.addEventListener('click', () => {
    const target = currentCalculatedVehicle || currentVehicle || vehicles[0];
    selectedAppointmentVehicle = target;
    if (appointmentVehicleName && target) {
      appointmentVehicleName.textContent = `${target.year} ${target.brand} ${target.model} · Listed at ${target.price}`;
    }
    if (appointmentForm) appointmentForm.style.display = 'flex';
    if (appointmentSuccessView) appointmentSuccessView.style.display = 'none';
    appointmentDialog.showModal();
  });
}

if (closeAppointmentDialog && appointmentDialog) {
  closeAppointmentDialog.addEventListener('click', () => appointmentDialog.close());
  appointmentDialog.addEventListener('click', (e) => { if (e.target === appointmentDialog) appointmentDialog.close(); });
}

if (closeSuccessAppointmentBtn && appointmentDialog) {
  closeSuccessAppointmentBtn.addEventListener('click', () => appointmentDialog.close());
}

if (appointmentForm) {
  appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!appointmentForm.reportValidity()) return;
    const branch = document.getElementById('appBranchSelect').value;
    const date = document.getElementById('appDateInput').value;
    const time = document.getElementById('appTimeSlotSelect').value;
    const name = document.getElementById('appCustomerName').value.trim();
    const phone = document.getElementById('appCustomerPhone').value.trim();
    const purpose = document.getElementById('appServiceType').selectedOptions[0].text;
    const notes = document.getElementById('appNotes').value.trim();

    if (!name || !phone || !date || date < appDateInput.min) {
      showCompareToast('Please fill in required fields (Name, Phone, Date).');
      return;
    }

    const target = selectedAppointmentVehicle || currentCalculatedVehicle || currentVehicle || vehicles[0];
    lastAppointmentData = {
      vehicle: `${target.brand} ${target.model} (${target.year})`,
      price: target.price,
      branch: document.getElementById('appBranchSelect').selectedOptions[0].text,
      date,
      time,
      name,
      phone,
      purpose,
      notes
    };

    try {
      window.JRCG.addAppointment({
        customerName: name, phone, vehicleId: target.id,
        vehicleName: lastAppointmentData.vehicle, price: target.price,
        branch: lastAppointmentData.branch, date, time, preferredDate: date + ' @ ' + time,
        inquiryType: purpose, notes
      });
    } catch {
      showCompareToast('Unable to save the request in this browser. Please check browser storage.');
      return;
    }


    appointmentForm.style.display = 'none';
    if (appointmentSuccessView) {
      appointmentSuccessView.style.display = 'flex';
      const summary = document.getElementById('successSummaryText');
      if (summary) {
        summary.textContent = `Your request for ${lastAppointmentData.vehicle} on ${date} at ${time}, ${lastAppointmentData.branch}, is ready. Send it to Danny on WhatsApp; he will confirm availability.`;
      }
    }
  });
}

if (sendAppConfirmationWhatsAppBtn) {
  sendAppConfirmationWhatsAppBtn.addEventListener('click', () => {
    if (!lastAppointmentData) return;
    const msg = [
      `📅 *Showroom Viewing Request*`,
      ``,
      `Hello Danny! I would like to request a showroom viewing:`,
      `👤 *Customer Name:* ${lastAppointmentData.name}`,
      `📞 *Mobile / WhatsApp:* ${lastAppointmentData.phone}`,
      `🚗 *Vehicle:* ${lastAppointmentData.vehicle} (${lastAppointmentData.price})`,
      `🏢 *Branch:* ${lastAppointmentData.branch}`,
      `🗓️ *Date & Time:* ${lastAppointmentData.date} @ ${lastAppointmentData.time}`,
      `🎯 *Purpose:* ${lastAppointmentData.purpose}`,
      lastAppointmentData.notes ? `📝 *Notes:* ${lastAppointmentData.notes}` : '',
      ``,
      `Please confirm the car and viewing availability. Thank you!`
    ].filter(Boolean).join('\n');

    const whatsappUrl = window.DannyDesign.whatsappURL(msg);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (appointmentDialog) appointmentDialog.close();
  });
}

// WhatsApp 1-Click Enquiry with Pre-filled Stock Data
if (whatsappEnquiryBtn) {
  whatsappEnquiryBtn.addEventListener('click', () => {
    const targetCar = currentCalculatedVehicle || currentVehicle || vehicles[0];
    if (!targetCar) return;

    const price = calcPriceInput ? formatRM(parseFloat(calcPriceInput.value) || 0) : targetCar.price;
    const monthly = calcMonthlyAmount ? calcMonthlyAmount.textContent : 'N/A';
    const tenure = calcLoanPeriod ? `${calcLoanPeriod.value} Years` : '7 Years';
    const downPayment = calcDownPaymentPct ? `${calcDownPaymentPct.value}%` : '10%';
    const rate = calcInterestRate ? `${parseFloat(calcInterestRate.value).toFixed(2)}%` : '2.50%';

    // Pre-filled WhatsApp enquiry message template for recon car dealers
    const messageLines = [
      `👋 Hello Danny!`,
      ``,
      `I would like to enquire about this reconditioned stock vehicle:`,
      `🚗 *${targetCar.brand} ${targetCar.model}* (${targetCar.year})`,
      `💰 *Listed Price:* ${price}`,
      `⚙️ *Powertrain:* ${targetCar.engine} | ${targetCar.power}`,
      `🎨 *Color:* ${targetCar.color}`,
      `🛣️ *Mileage:* ${targetCar.mileage}`,
      ``,
      `📊 *My Loan Estimate:*`,
      `• Down Payment: ${downPayment}`,
      `• Loan Period: ${tenure}`,
      `• Est. Installment: RM ${monthly}/month (at ${rate} p.a.)`,
      ``,
      `Could you please share:`,
      `1. Japanese auction sheet / inspection verification`,
      `2. Availability for showroom physical view / test drive`,
      `3. Financing bank panel & import AP permit documents?`,
      ``,
      `Thank you!`
    ];

    const whatsappUrl = window.DannyDesign.whatsappURL(messageLines.join('\n'));
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
}

function closeVehicle(){
  if (vehicleDialog.open) vehicleDialog.close();
  document.body.style.overflow='';
}

const closeDialogBtn = document.getElementById('closeDialog');
if (closeDialogBtn) closeDialogBtn.addEventListener('click', closeVehicle);
if (vehicleDialog) {
  vehicleDialog.addEventListener('click', e => { if (e.target === vehicleDialog) closeVehicle(); });
  vehicleDialog.addEventListener('cancel', e => { e.preventDefault(); closeVehicle(); });
}

[brandFilter, bodyFilter, yearFilter, sortFilter, mileageFilter, powerFilter].forEach(el => el && el.addEventListener('change', renderInventory));
if (searchFilter) searchFilter.addEventListener('input', renderInventory);
function resetInventoryFilters() {
  if (searchFilter) searchFilter.value = '';
  if (mileageFilter) mileageFilter.value = 'all';
  if (powerFilter) powerFilter.value = 'all';
  if (brandFilter) brandFilter.value = 'all';
  if (bodyFilter) bodyFilter.value = 'all';
  if (yearFilter) yearFilter.value = 'all';
  if (sortFilter) sortFilter.value = 'default';
  renderInventory();
}
const resetFiltersBtn = document.getElementById('resetFilters');
if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetInventoryFilters);

if (demoDialog) {
  document.querySelectorAll('[data-demo-action]').forEach(btn=>btn.addEventListener('click',()=>demoDialog.showModal()));
  document.querySelectorAll('[data-close-demo]').forEach(btn=>btn.addEventListener('click',()=>demoDialog.close()));
  demoDialog.addEventListener('click',e=>{ if(e.target===demoDialog) demoDialog.close(); });
}

// ==========================================================================
// Compare Modal Implementation
// ==========================================================================

function getSpecRow(v, groupName, keyName, fallback = '-') {
  if (!v || !v.specs) return fallback;
  const grp = v.specs[groupName];
  if (!grp) return fallback;
  const row = grp.find(r => r[0].toLowerCase() === keyName.toLowerCase());
  return row ? row[1] : fallback;
}

function renderCompareModalContent() {
  if (compareList.length < 2) {
    if (compareList.length === 1) {
      const other = vehicles.find(v => v.id !== compareList[0]) || vehicles[1];
      compareList.push(other.id);
    } else {
      compareList = [vehicles[0].id, vehicles[1].id];
    }
    updateCompareUI();
  }

  const v1 = vehicles.find(v => v.id === compareList[0]) || vehicles[0];
  const v2 = vehicles.find(v => v.id === compareList[1]) || vehicles[1];

  function vehicleSelectOptions(currentId) {
    return vehicles.map(v => `
      <option value="${v.id}" ${v.id === currentId ? 'selected' : ''}>
        ${v.brand} ${v.model} (${v.year})
      </option>
    `).join('');
  }

  function vehicleCardMarkup(v, slotIndex) {
    return `
      <div class="compare-vehicle-card">
        <div class="compare-select-wrap">
          <span class="compare-select-label">Vehicle 0${slotIndex + 1}</span>
          <select class="compare-vehicle-select" data-slot="${slotIndex}" aria-label="Change vehicle 0${slotIndex + 1}">
            ${vehicleSelectOptions(v.id)}
          </select>
        </div>

        <div class="compare-vehicle-media" style="--card-a:${v.cardA || '#61727c'};--card-b:${v.cardB || '#202a30'}">
          ${v.image ? `<img src="${v.image}" alt="${v.brand} ${v.model}">` : carMarkup()}
        </div>

        <div class="compare-card-details">
          <span class="card-kicker">${v.brand} · ${v.body} · ${v.year}</span>
          <h3>${v.brand} ${v.model}</h3>
          <div class="compare-card-price">${v.price || 'Price on request'}</div>
          <p class="compare-card-sub">${v.sub}</p>
        </div>

        <div class="compare-card-actions">
          ${v.actualPage ? `<a class="compare-card-btn-view" href="${v.actualPage}" data-interaction-link>View interaction ↗</a>` : `<button type="button" class="compare-card-btn-view" data-view-id="${v.id}">View Details →</button>`}
          <button type="button" class="compare-card-btn-enquire" data-demo-action>
            Enquire
          </button>
        </div>
      </div>
    `;
  }

  const { groups, totalDiffCount } = getCompareSpecsData(v1, v2);

  const diffCountPill = document.getElementById('diffCountPill');
  if (diffCountPill) {
    diffCountPill.textContent = totalDiffCount > 0 ? String(totalDiffCount) : '';
  }

  if (cmpViewAll && cmpViewDiff) {
    cmpViewAll.classList.toggle('active', compareViewMode === 'all');
    cmpViewAll.setAttribute('aria-selected', compareViewMode === 'all' ? 'true' : 'false');
    cmpViewDiff.classList.toggle('active', compareViewMode === 'diff');
    cmpViewDiff.setAttribute('aria-selected', compareViewMode === 'diff' ? 'true' : 'false');
  }

  const groupsMarkup = buildCompareTableMarkup(groups, compareViewMode);

  compareBody.innerHTML = `
    <div class="compare-vehicles-grid">
      ${vehicleCardMarkup(v1, 0)}
      <div class="compare-vs-divider">
        <span class="compare-vs-badge">VS</span>
      </div>
      ${vehicleCardMarkup(v2, 1)}
    </div>

    <div class="compare-table-container">
      ${groupsMarkup}
    </div>
  `;

  compareBody.querySelectorAll('.compare-vehicle-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const slot = Number(sel.dataset.slot);
      const newId = sel.value;
      compareList[slot] = newId;
      updateCompareUI();
      renderCompareModalContent();
    });
  });

  compareBody.querySelectorAll('[data-view-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.viewId;
      closeCompareModal();
      openVehicle(id);
    });
  });

  compareBody.querySelectorAll('[data-demo-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      demoDialog.showModal();
    });
  });

  const resetBtn = document.getElementById('resetCompareFilterBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      toggleCompareViewMode('all');
    });
  }
}

function getCompareSpecsData(v1, v2) {
  const groups = [
    {
      title: 'Pricing & Overview',
      rows: [
        { label: 'Demo Price', v1: v1.price || '-', v2: v2.price || '-', compareType: 'price' },
        { label: 'Model Year', v1: String(v1.year || 'To verify'), v2: String(v2.year || 'To verify'), compareType: 'year' },
        { label: 'Body Style', v1: v1.body, v2: v2.body },
        { label: 'Verified Mileage', v1: v1.mileage, v2: v2.mileage, compareType: 'mileage' },
        { label: 'Exterior Colour', v1: v1.color, v2: v2.color }
      ]
    },
    {
      title: 'Powertrain & Performance',
      rows: [
        { label: 'Engine Configuration', v1: v1.engine, v2: v2.engine },
        { label: 'Maximum Power', v1: v1.power, v2: v2.power, compareType: 'power' },
        { label: 'Peak Torque', v1: v1.torque, v2: v2.torque, compareType: 'torque' },
        { label: 'Drivetrain', v1: getSpecRow(v1, 'Powertrain', 'Drive', 'Quattro / AWD (demo)'), v2: getSpecRow(v2, 'Powertrain', 'Drive', 'AWD (demo)') }
      ]
    },
    {
      title: 'Chassis, Wheels & Brakes',
      rows: [
        { label: 'Wheels', v1: getSpecRow(v1, 'Exterior & chassis', 'Wheels', 'Factory alloy'), v2: getSpecRow(v2, 'Exterior & chassis', 'Wheels', 'Factory alloy') },
        { label: 'Tyre Fitment', v1: getSpecRow(v1, 'Exterior & chassis', 'Tyres', 'Performance set'), v2: getSpecRow(v2, 'Exterior & chassis', 'Tyres', 'Performance set') },
        { label: 'Braking Hardware', v1: getSpecRow(v1, 'Exterior & chassis', 'Brakes', 'Performance calipers'), v2: getSpecRow(v2, 'Exterior & chassis', 'Brakes', 'Performance calipers') },
        { label: 'Aero Package', v1: getSpecRow(v1, 'Exterior & chassis', 'Aero kit', 'Factory aero package'), v2: getSpecRow(v2, 'Exterior & chassis', 'Aero kit', 'Factory aero package') }
      ]
    },
    {
      title: 'Interior, Audio & Tech',
      rows: [
        { label: 'Cabin Upholstery', v1: getSpecRow(v1, 'Interior & equipment', 'Interior', 'Leather trim'), v2: getSpecRow(v2, 'Interior & equipment', 'Interior', 'Leather trim') },
        { label: 'Seating Layout', v1: getSpecRow(v1, 'Interior & equipment', 'Seats', 'Sport seats'), v2: getSpecRow(v2, 'Interior & equipment', 'Seats', 'Executive seating') },
        { label: 'Premium Sound', v1: getSpecRow(v1, 'Interior & equipment', 'Speakers', 'Premium audio'), v2: getSpecRow(v2, 'Interior & equipment', 'Speakers', 'Premium audio') },
        { label: 'Head-Up Display', v1: getSpecRow(v1, 'Interior & equipment', 'HUD', 'Equipped (demo)'), v2: getSpecRow(v2, 'Interior & equipment', 'HUD', 'Equipped (demo)') }
      ]
    }
  ];

  let totalDiffCount = 0;
  groups.forEach(g => {
    g.rows.forEach(r => {
      const cleanVal1 = String(r.v1 || '-').trim();
      const cleanVal2 = String(r.v2 || '-').trim();
      const isDiff = cleanVal1.toLowerCase() !== cleanVal2.toLowerCase();
      r.isDiff = isDiff;
      if (isDiff) totalDiffCount++;
    });
  });

  return { groups, totalDiffCount };
}

function buildCompareTableMarkup(groups, mode) {
  let groupsMarkup = '';
  groups.forEach(g => {
    let rowsMarkup = '';
    let visibleRowsCount = 0;

    g.rows.forEach(r => {
      const cleanVal1 = String(r.v1 || '-').trim();
      const cleanVal2 = String(r.v2 || '-').trim();
      const isDiff = r.isDiff;

      if (mode === 'diff' && !isDiff) {
        return;
      }
      visibleRowsCount++;

      let tag1 = '';
      let tag2 = '';

      if (isDiff) {
        if (r.compareType === 'power') {
          const num1 = parseNumber(cleanVal1);
          const num2 = parseNumber(cleanVal2);
          if (num1 > 0 && num2 > 0) {
            if (num1 > num2) tag1 = `<span class="advantage-tag">+${num1 - num2} hp</span>`;
            else if (num2 > num1) tag2 = `<span class="advantage-tag">+${num2 - num1} hp</span>`;
          }
        } else if (r.compareType === 'year') {
          const num1 = parseNumber(cleanVal1);
          const num2 = parseNumber(cleanVal2);
          if (num1 > num2) tag1 = `<span class="advantage-tag">Newer</span>`;
          else if (num2 > num1) tag2 = `<span class="advantage-tag">Newer</span>`;
        } else if (r.compareType === 'mileage') {
          const num1 = parseNumber(cleanVal1);
          const num2 = parseNumber(cleanVal2);
          if (num1 > 0 && num2 > 0) {
            if (num1 < num2) tag1 = `<span class="advantage-tag">Lower km</span>`;
            else if (num2 < num1) tag2 = `<span class="advantage-tag">Lower km</span>`;
          }
        }
      }

      rowsMarkup += `
        <div class="compare-row ${isDiff ? 'is-different' : 'is-same'}">
          <div class="compare-label-cell">
            ${isDiff ? '<span class="diff-indicator" title="Specification differs"></span>' : ''}
            <span>${r.label}</span>
          </div>
          <div class="compare-val-cell">
            <strong>${cleanVal1}</strong>
            ${tag1}
          </div>
          <div class="compare-val-cell">
            <strong>${cleanVal2}</strong>
            ${tag2}
          </div>
        </div>
      `;
    });

    if (visibleRowsCount > 0) {
      groupsMarkup += `
        <section class="compare-group">
          <div class="compare-group-header">
            <h4>${g.title}</h4>
            <span>${visibleRowsCount} ${mode === 'diff' ? (visibleRowsCount === 1 ? 'difference' : 'differences') : (visibleRowsCount === 1 ? 'spec' : 'specs')}</span>
          </div>
          <div class="compare-group-body">
            ${rowsMarkup}
          </div>
        </section>
      `;
    }
  });

  if (!groupsMarkup) {
    groupsMarkup = `
      <div style="text-align:center;padding:48px 20px;color:var(--muted)">
        <p>No specification differences found between these vehicles.</p>
        <button type="button" class="primary-button" id="resetCompareFilterBtn" style="margin-top:14px">
          Show All Specifications
        </button>
      </div>
    `;
  }

  return groupsMarkup;
}

function toggleCompareViewMode(targetMode) {
  if (compareViewMode === targetMode) return;
  compareViewMode = targetMode;

  if (cmpViewAll && cmpViewDiff) {
    cmpViewAll.classList.toggle('active', targetMode === 'all');
    cmpViewAll.setAttribute('aria-selected', targetMode === 'all' ? 'true' : 'false');
    cmpViewDiff.classList.toggle('active', targetMode === 'diff');
    cmpViewDiff.setAttribute('aria-selected', targetMode === 'diff' ? 'true' : 'false');
  }

  const tableContainer = compareBody ? compareBody.querySelector('.compare-table-container') : null;
  if (!tableContainer) {
    renderCompareModalContent();
    return;
  }

  const v1 = vehicles.find(v => v.id === compareList[0]) || vehicles[0];
  const v2 = vehicles.find(v => v.id === compareList[1]) || vehicles[1] || vehicles[0];
  const { groups, totalDiffCount } = getCompareSpecsData(v1, v2);

  const diffCountPill = document.getElementById('diffCountPill');
  if (diffCountPill) {
    diffCountPill.textContent = totalDiffCount > 0 ? String(totalDiffCount) : '';
  }

  // Smooth exit transition
  tableContainer.classList.add('table-fade-out');

  setTimeout(() => {
    tableContainer.innerHTML = buildCompareTableMarkup(groups, targetMode);
    tableContainer.classList.remove('table-fade-out');
    tableContainer.classList.add(targetMode === 'diff' ? 'animating-diff' : 'animating-all');

    const resetBtn = document.getElementById('resetCompareFilterBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        toggleCompareViewMode('all');
      });
    }

    setTimeout(() => {
      tableContainer.classList.remove('animating-diff', 'animating-all');
    }, 480);
  }, 110);
}

function openCompareModal() {
  renderCompareModalContent();
  compareDialog.showModal();
  document.body.style.overflow = 'hidden';
}

function closeCompareModal() {
  if (compareDialog.open) {
    compareDialog.close();
  }
  document.body.style.overflow = '';
}

if (closeCompareDialog) {
  closeCompareDialog.addEventListener('click', closeCompareModal);
}
if (compareDialog) {
  compareDialog.addEventListener('click', e => {
    if (e.target === compareDialog) closeCompareModal();
  });
  compareDialog.addEventListener('cancel', e => {
    e.preventDefault();
    closeCompareModal();
  });
}

if (cmpViewAll) {
  cmpViewAll.addEventListener('click', () => {
    toggleCompareViewMode('all');
  });
}
if (cmpViewDiff) {
  cmpViewDiff.addEventListener('click', () => {
    toggleCompareViewMode('diff');
  });
}

if (compareDockClear) {
  compareDockClear.addEventListener('click', clearCompare);
}
if (compareDockLaunch) {
  compareDockLaunch.addEventListener('click', openCompareModal);
}

if (filterCompareBtn) {
  filterCompareBtn.addEventListener('click', () => {
    openCompareModal();
  });
}

if (navCompareBtn) {
  navCompareBtn.addEventListener('click', () => {
    openCompareModal();
  });
}


// Homepage photography can reflect the demo editor without initializing a viewer.
async function loadCatalogPhoto() {}
renderInventory();
loadCatalogPhoto();
initCalculatorVehiclePicker();
if (!calcVehiclePicker && vehicles.length > 0) {
  syncLoanCalculatorWithVehicle(vehicles[0]);
  updateRoadTaxCalculation();
}

// ==========================================================================
// UI/UX PRO MAX: Interactive Japan Recon Featured Showcase Slider
// ==========================================================================
function syncShowcaseContent() {
  const slider = document.getElementById('featuredShowcaseSlider');
  const track = document.getElementById('sliderTrack');
  if (!slider || !track) return;
  const template = track.querySelector('.showcase-slide') || document.getElementById('cmsShowcaseTemplate')?.content.firstElementChild;
  if (!template) return;
  track.replaceChildren();
  document.getElementById('sliderDots')?.replaceChildren();
  if (!vehicles.length) { slider.hidden = true; return; }
  vehicles.forEach(vehicle => {
    let slide = [...track.querySelectorAll('.showcase-slide')].find(item => item.dataset.vehicleId === vehicle.id);
    if (!slide) {
      slide = template.cloneNode(true);
      slide.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      slide.dataset.vehicleId = vehicle.id;
      track.append(slide);
      const dot = document.createElement('button'); dot.type = 'button'; dot.className = 'slider-dot'; dot.setAttribute('role', 'tab');
      document.getElementById('sliderDots')?.append(dot);
    }
    slide.querySelector('.slide-brand').textContent = vehicle.brand;
    slide.querySelector('.slide-model').textContent = vehicle.model + ' (' + vehicle.year + ')';
    slide.querySelector('.slide-price-tag').textContent = vehicle.price;
    const image = slide.querySelector('.slide-img'); image.src = vehicle.preview || vehicle.image; image.alt = vehicle.brand + ' ' + vehicle.model + ' demo photo';
    const chips = slide.querySelectorAll('.slide-chip-spec');
    if (chips[0]) chips[0].textContent = vehicle.power + ' · ' + vehicle.engine;
    if (chips[1]) chips[1].textContent = vehicle.body;
    slide.querySelectorAll('[data-inspect-vehicle]').forEach(button => button.dataset.inspectVehicle = vehicle.id);
    slide.querySelectorAll('[data-calc-vehicle]').forEach(button => button.dataset.calcVehicle = vehicle.id);
    const primary = slide.querySelector('.slide-primary-btn');
    primary.removeAttribute('data-inspect-vehicle'); primary.removeAttribute('data-calc-vehicle');
    const hero = window.JRCG.read('jrcg_hero_slider', {});
    const action = hero.featuredId === vehicle.id ? hero.action : (vehicle.actualPage ? 'audi' : 'inspect');
    primary.textContent = action === 'calc' ? 'Simulate loan →' : action === 'audi' && vehicle.actualPage ? 'View tour →' : 'View details →';
    if (primary.tagName === 'A') primary.href = action === 'calc' ? 'calculator.html?vehicle=' + encodeURIComponent(vehicle.id) : vehicle.actualPage || '#inventory';
    primary.onclick = event => {
      event.preventDefault(); event.stopPropagation();
      if (action === 'calc') location.href = 'calculator.html?vehicle=' + encodeURIComponent(vehicle.id);
      else if (action === 'audi' && vehicle.actualPage) location.href = vehicle.actualPage;
      else openVehicle(vehicle.id);
    };
    const chip = slide.querySelector('.slide-chip-accent');
    chip.textContent = hero.featuredId === vehicle.id && hero.tag ? hero.tag : vehicle.sample ? 'ILLUSTRATION' : vehicle.status.toUpperCase();
  });
}

function initShowcaseSlider() {
  syncShowcaseContent();
  const slider = document.getElementById('featuredShowcaseSlider');
  if (!slider) return;

  const track = document.getElementById('sliderTrack');
  const slides = Array.from(slider.querySelectorAll('.showcase-slide'));
  const dots = Array.from(slider.querySelectorAll('.slider-dot'));
  const prevBtn = document.getElementById('sliderPrevBtn');
  const nextBtn = document.getElementById('sliderNextBtn');
  const pauseBtn = document.getElementById('sliderPauseBtn');
  const pauseIcon = document.getElementById('sliderPauseIcon');
  const pauseText = document.getElementById('sliderPauseText');
  const currentNumEl = document.getElementById('sliderCurrentNum');
  const progressBar = document.getElementById('sliderProgressBar');
  const viewport = document.getElementById('sliderViewport');

  if (!track || slides.length === 0) return;

  // Apply homepage hero slider configuration set in Admin Studio
  try {
    const heroConfig = window.JRCG.read('jrcg_hero_slider', {});
    if (heroConfig && heroConfig.featuredId) {
      const matchIdx = slides.findIndex(s => s.dataset.vehicleId === heroConfig.featuredId);
      if (matchIdx > 0) {
        track.insertBefore(slides[matchIdx], slides[0]);
        const [moved] = slides.splice(matchIdx, 1);
        slides.unshift(moved);
      }
      if (heroConfig.tag) {
        const firstChip = slides[0].querySelector('.slide-chip-accent');
        if (firstChip) firstChip.textContent = heroConfig.tag;
      }
    }
  } catch (e) {}

  let currentSlide = 0;
  let isPaused = true;
  let progressInterval = null;
  let progressPct = 0;
  const AUTOPLAY_DURATION = 5500;
  const PROGRESS_STEP = 50;

  function updateSlide(index, userInitiated = false) {
    currentSlide = ((index % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    slides.forEach((slide, idx) => {
      const isActive = idx === currentSlide;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    dots.forEach((dot, idx) => {
      const isActive = idx === currentSlide;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (currentNumEl) {
      currentNumEl.textContent = String(currentSlide + 1).padStart(2, '0');
    }
    document.getElementById('sliderCounter')?.setAttribute('aria-label', `Slide ${currentSlide + 1} of ${slides.length}`);

    resetProgress();
  }

  function resetProgress() {
    progressPct = 0;
    if (progressBar) progressBar.style.width = '0%';
  }

  function startAutoplay() {
    stopAutoplay();
    if (isPaused) return;

    progressInterval = setInterval(() => {
      if (isPaused) return;
      progressPct += (PROGRESS_STEP / AUTOPLAY_DURATION) * 100;
      if (progressBar) progressBar.style.width = `${Math.min(progressPct, 100)}%`;

      if (progressPct >= 100) {
        updateSlide(currentSlide + 1);
      }
    }, PROGRESS_STEP);
  }

  function stopAutoplay() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  function togglePause() {
    isPaused = !isPaused;
    if (pauseIcon) pauseIcon.textContent = isPaused ? '▶' : '⏸';
    if (pauseText) pauseText.textContent = isPaused ? 'Play' : 'Pause';
    if (pauseBtn) {
      pauseBtn.setAttribute('aria-label', isPaused ? 'Resume slide rotation' : 'Pause slide rotation');
    }
    if (isPaused) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  }

  // Navigation Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateSlide(currentSlide - 1, true);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateSlide(currentSlide + 1, true);
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePause();
    });
  }

  // Dots Selector
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      updateSlide(idx, true);
    });
  });

  // Pause on hover
  slider.addEventListener('mouseenter', () => {
    if (!isPaused) stopAutoplay();
  });
  slider.addEventListener('mouseleave', () => {
    if (!isPaused) startAutoplay();
  });

  if (viewport) {
    viewport.addEventListener('focus', () => {
      if (!isPaused) stopAutoplay();
    });
    viewport.addEventListener('blur', () => {
      if (!isPaused) startAutoplay();
    });

    // Keyboard navigation
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateSlide(currentSlide - 1, true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateSlide(currentSlide + 1, true);
      }
    });

    // Touch swipe gestures
    let touchStartX = 0;
    let isSwiping = false;

    viewport.addEventListener('touchstart', (e) => {
      if (!e.touches[0]) return;
      touchStartX = e.touches[0].clientX;
      isSwiping = true;
      if (!isPaused) stopAutoplay();
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      if (!isSwiping || !e.changedTouches[0]) return;
      isSwiping = false;
      const diffX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diffX) > 40) {
        if (diffX > 0) {
          updateSlide(currentSlide - 1, true);
        } else {
          updateSlide(currentSlide + 1, true);
        }
      }
      if (!isPaused) startAutoplay();
    });
  }

  // Interactive buttons inside slides
  slider.querySelectorAll('[data-inspect-vehicle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const vid = btn.dataset.inspectVehicle;
      if (vid && typeof openVehicle === 'function') {
        openVehicle(vid);
      }
    });
  });

  slider.querySelectorAll('[data-calc-vehicle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const vid = btn.dataset.calcVehicle;
      const v = vehicles.find(item => item.id === vid);
      if (v) {
        try { localStorage.setItem('jrcg_active_vehicle_id', v.id); } catch(e) {}
        const aside = document.getElementById('inventoryCalculatorAside');
        if (aside) {
          syncLoanCalculatorWithVehicle(v);
          updateRoadTaxCalculation();
          aside.scrollIntoView({ behavior: 'smooth', block: 'start' });
          aside.classList.add('calc-focus-highlight');
          setTimeout(() => aside.classList.remove('calc-focus-highlight'), 1800);
        } else {
          window.location.href = `calculator.html?vehicle=${encodeURIComponent(v.id)}`;
        }
      }
    });
  });

  function updateSlideLabels() {
    slides.forEach((slide, index) => {
      const vehicle = vehicles.find(item => item.id === slide.dataset.vehicleId);
      const name = vehicle ? vehicle.brand + ' ' + vehicle.model : 'Vehicle';
      slide.setAttribute('aria-label', 'Slide ' + (index + 1) + ' of ' + slides.length + ': ' + name);
      if (dots[index]) dots[index].setAttribute('aria-label', 'Go to slide ' + (index + 1) + ': ' + name);
    });
    const total = document.getElementById('sliderTotalNum');
    if (total) total.textContent = String(slides.length).padStart(2, '0');
  }
  updateSlideLabels();
  updateSlide(0);
  window.addEventListener('jrcg:catalog-applied', () => { syncShowcaseContent(); updateSlideLabels(); });
  window.addEventListener('jrcg:data-change', event => {
    if (event.detail.scope !== 'hero') return;
    syncShowcaseContent();
    const hero = window.JRCG.read('jrcg_hero_slider', {});
    const match = slides.findIndex(slide => slide.dataset.vehicleId === hero.featuredId);
    if (match > 0) { const moved = slides.splice(match, 1)[0]; slides.unshift(moved); track.prepend(moved); }
    updateSlideLabels(); updateSlide(0);
  });

  // Slides advance only when a visitor chooses an arrow or navigation dot.
}

initShowcaseSlider();

// ==========================================================================
// Visual Design Theme Switcher Controller
// ==========================================================================

// Theme controls are owned by design-system.js on every page.


// Keep already-open gallery and calculator tabs in step with studio edits.
window.addEventListener('jrcg:data-change', event => {
  if (event.detail.scope !== 'catalog') return;
  const activeId = currentCalculatedVehicle?.id || currentVehicle?.id;
  vehicles.splice(0, vehicles.length, ...window.JRCG.catalog());
  currentVehicle = vehicles.find(vehicle => vehicle.id === currentVehicle?.id) || vehicles[0];
  renderInventory();
  const active = vehicles.find(vehicle => vehicle.id === activeId);
  if (active && !document.activeElement?.closest('.loan-calculator')) { syncLoanCalculatorWithVehicle(active); updateRoadTaxCalculation(); }
  window.dispatchEvent(new Event('jrcg:catalog-applied'));
});
