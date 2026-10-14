(() => {
  const store = window.JRCG;
  const labels = { new: '待联系', contacted: '跟进中', confirmed: '已确认', completed: '已完成', cancelled: '已取消', won: '已成交' };
  const money = value => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(value).replace('MYR', 'RM');
  let days = 30;
  let chartData = null;
  function text(id, value) { const node = document.getElementById(id); if (node) node.textContent = value; }
  function setView(view) {
    document.body.dataset.studioView = view;
    document.querySelectorAll('[data-studio-view-button]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.studioViewButton === view)));
  }
  async function openEditor(id, tab = 'vehicle') {
    await window.JRCGAdmin?.ready;
    const opened = await window.JRCGAdmin?.open(id, tab);
    if (opened === false) return;
    setView('editor');
    document.getElementById('adminVehicleSelect')?.focus();
  }
  function makeTable(targetId, rows, valueFormat) {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.replaceChildren();
    for (const row of rows) {
      const tr = document.createElement('tr');
      const name = document.createElement('th'); name.scope = 'row';
      if (row.id) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = row.label;
        button.addEventListener('click', () => openEditor(row.id)); name.append(button);
      } else name.textContent = row.label;
      const value = document.createElement('td'); value.textContent = valueFormat(row.value);
      tr.append(name, value); target.append(tr);
    }
  }
  function bars(id, rows, format, title, emptyText) {
    const node = document.getElementById(id);
    node.replaceChildren();
    if (!rows.some(row => row.value > 0)) {
      const empty = document.createElement('div'); empty.className = 'chart-empty';
      const heading = document.createElement('strong'); heading.textContent = '暂无记录';
      const message = document.createElement('p'); message.textContent = emptyText;
      empty.append(heading, message); node.append(empty); return;
    }
    if (!window.d3) {
      const message = document.createElement('p'); message.textContent = '图表暂时无法加载，请查看下方数据表。'; node.append(message);
      node.parentElement.querySelector('details')?.setAttribute('open', ''); return;
    }
    const width = Math.max(300, node.clientWidth);
    const left = Math.min(185, width * .32), right = Math.min(105, width * .20), rowHeight = 38;
    const height = rows.length * rowHeight + 12;
    const max = d3.max(rows, row => row.value) || 1;
    const scale = d3.scaleLinear().domain([0, max]).range([0, Math.max(40, width - left - right)]);
    const svg = d3.select(node).append('svg').attr('viewBox', `0 0 ${width} ${height}`).attr('role', rows.some(row => row.id) ? 'group' : 'img').attr('aria-label', title);
    svg.append('title').text(title);
    svg.append('desc').text(rows.map(row => `${row.label}: ${format(row.value)}`).join('; '));
    const group = svg.selectAll('g').data(rows).join('g').attr('class', 'chart-row').attr('transform', (_, index) => `translate(0,${index * rowHeight + 6})`);
    group.append('title').text(row => `${row.label}: ${format(row.value)}`);
    group.filter(row => Boolean(row.id)).attr('role', 'button').attr('tabindex', 0).attr('aria-label', row => `${row.label}: ${format(row.value)}. Open vehicle editor`)
      .on('click', (_, row) => openEditor(row.id)).on('keydown', (event, row) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openEditor(row.id); } });
    group.append('rect').attr('class', 'chart-bg').attr('x', left).attr('y', 4).attr('width', width - left - right).attr('height', 20).attr('rx', 4).attr('fill', 'var(--admin-surface-raised)');
    group.append('rect').attr('class', 'chart-bar').attr('x', left).attr('y', 4).attr('width', row => scale(row.value)).attr('height', 20).attr('rx', 4).attr('fill', 'var(--admin-accent)');
    group.append('text').attr('x', left - 12).attr('y', 18).attr('text-anchor', 'end').attr('fill', 'var(--admin-text-muted)').attr('font-size', 12)
      .text(row => row.label.length > 24 ? `${row.label.slice(0, 23)}…` : row.label);
    group.append('text').attr('x', width - right + 10).attr('y', 18).attr('fill', 'var(--admin-text-main)').attr('font-size', 12).text(row => format(row.value));
  }
  function renderCharts() {
    if (!chartData) return;
    bars('inventoryValueChart', chartData.inventory, value => `RM ${(value / 1000).toLocaleString('en-MY')}k`, 'Inventory value by model in Malaysian Ringgit', '尚未添加库存车辆。');
    bars('modelViewsChart', chartData.models, value => `${value} 次`, `Top viewed models over the last ${days} days`, '在首页打开车型详情或进入 Audi tour 后，这里会显示浏览排行。');
    bars('appointmentStatusChart', chartData.pipeline, value => String(value), 'Appointment requests by status', '从首页提交预约请求后，这里会显示跟进状态。');
  }
  function renderAppointments(rows) {
    const target = document.getElementById('dashboardAppointments'); target.replaceChildren();
    const sorted = [...rows].sort((a, b) => Number(store.isActive(b)) - Number(store.isActive(a)) || String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).slice(0, 8);
    if (!sorted.length) {
      const tr = document.createElement('tr'), td = document.createElement('td'); td.colSpan = 4; td.className = 'dashboard-empty-cell';
      td.textContent = '尚无预约请求。首页预约表单的提交会出现在这里。'; tr.append(td); target.append(tr); return;
    }
    for (const row of sorted) {
      const tr = document.createElement('tr');
      const customer = document.createElement('td'); customer.textContent = row.customerName || '未填写';
      const model = document.createElement('td'); const vehicle = store.catalog().find(item => item.id === row.vehicleId);
      if (vehicle) { const button = document.createElement('button'); button.type = 'button'; button.textContent = `${vehicle.brand} ${vehicle.model}`; button.addEventListener('click', () => openEditor(vehicle.id)); model.append(button); }
      else model.textContent = row.vehicleName || '未指定车型';
      const date = document.createElement('td'); date.textContent = row.preferredDate || [row.date, row.time].filter(Boolean).join(' · ') || '待安排';
      const status = document.createElement('td'); const select = document.createElement('select'); select.className = 'dashboard-status'; select.setAttribute('aria-label', `${row.customerName || '客户'}的预约状态`);
      for (const [value, label] of Object.entries(labels)) { const option = document.createElement('option'); option.value = value; option.textContent = label; option.selected = row.status === value; select.append(option); }
      select.addEventListener('change', () => { try { store.updateAppointment(row.id, { status: select.value }); } catch { select.value = row.status; text('dashboardUpdatedAt', '保存失败：请检查浏览器储存空间。'); } });
      status.append(select); tr.append(customer, model, date, status); target.append(tr);
    }
  }
  function render() {
    const vehicles = store.catalog(); const appointments = store.appointments(); const events = store.views(days);
    const inventory = vehicles.map(vehicle => ({ id: vehicle.id, label: `${vehicle.brand} ${vehicle.model}`, value: store.price(vehicle.price) })).sort((a, b) => b.value - a.value);
    const counts = d3AvailableRollup(events);
    const models = vehicles.map(vehicle => ({ id: vehicle.id, label: `${vehicle.brand} ${vehicle.model}`, value: counts.get(vehicle.id) || 0 })).filter(row => row.value > 0).sort((a, b) => b.value - a.value).slice(0, 7);
    const pipeline = Object.entries(labels).map(([status, label]) => ({ label, value: appointments.filter(row => row.status === status).length }));
    const total = inventory.reduce((sum, row) => sum + row.value, 0);
    text('metricInventoryValue', money(total)); text('metricInventoryDetail', `${vehicles.length} 辆演示库存 · 按展示售价合计`);
    text('metricAppointments', appointments.filter(store.isActive).length); text('metricAppointmentDetail', '待联系、跟进中与已确认 · 排除过期预约');
    text('metricViews', events.length); text('metricViewsDetail', `近 ${days} 天 · 每次页面载入，同一车型只计一次`);
    text('metricTopModel', models[0]?.label || '—'); text('metricTopDetail', models[0] ? `${models[0].value} 次详情 / tour 浏览` : '有浏览记录后显示');
    text('modelViewsCaption', `近 ${days} 天的主动详情浏览；自动轮播不计入。`);
    text('dashboardUpdatedAt', `更新于 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`);
    chartData = { inventory, models, pipeline };
    renderCharts(); makeTable('inventoryValueTable', inventory, money); makeTable('modelViewsTable', models, value => `${value} 次`); makeTable('appointmentStatusTable', pipeline, String);
    renderAppointments(appointments);
  }
  function d3AvailableRollup(events) { const counts = new Map(); events.forEach(event => counts.set(event.vehicleId, (counts.get(event.vehicleId) || 0) + 1)); return counts; }
  function init() {
    document.querySelectorAll('[data-studio-view-button]').forEach(button => button.addEventListener('click', () => button.dataset.studioViewButton === 'editor' ? openEditor(null, 'hotspot') : setView('overview')));
    document.querySelectorAll('[data-open-editor-tab]').forEach(button => button.addEventListener('click', () => openEditor(null, button.dataset.openEditorTab)));
    document.getElementById('dashboardViewRange').addEventListener('change', event => { days = Number(event.target.value); render(); });
    document.getElementById('dashboardRefresh').addEventListener('click', render);
    window.addEventListener('jrcg:data-change', render);
    let frame = 0;
    const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(renderCharts); });
    document.querySelectorAll('.chart-surface').forEach(node => observer.observe(node));
    render();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
