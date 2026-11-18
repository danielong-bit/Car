// Anonymous visit & conversion attribution only. No IP address, user agent or exact location is stored.
function campaignChannelName(source = '', campaign = '') {
  const s = String(source || '').toLowerCase();
  const c = String(campaign || '').toLowerCase();
  if (c === 'fb_feed_ad') return 'Facebook Feed Ad';
  if (c === 'fb_reels_ad') return 'Facebook Reels Ad';
  if (c === 'fb_marketplace') return 'Facebook Marketplace';
  if (c === 'fb_whatsapp_ctwa') return 'Click-to-WhatsApp Ad';
  if (c === 'fb_carousel_catalog' || c === 'fb_automotive_catalog') return 'Meta Catalog Ad';
  if (c === 'fb_page_post') return 'Facebook Page Post';
  if (s === 'facebook' || s === 'fb' || c.includes('fb')) return 'Facebook Ad / Referral';
  if (c) return c.slice(0, 32);
  return 'Direct / Showroom';
}

export function visitorAnalytics(storage, request, now = Date.now()) {
  const sql = storage.sql;
  const respond = (value, status = 200) =>
    new Response(JSON.stringify(value), {
      status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  if (!sql) return respond({ error: 'Visitor statistics are unavailable.' }, 503);

  sql.exec(
    'CREATE TABLE IF NOT EXISTS visitor_sessions (id TEXT PRIMARY KEY, created INTEGER NOT NULL, country TEXT NOT NULL, device TEXT NOT NULL)'
  );
  sql.exec('CREATE INDEX IF NOT EXISTS visitor_sessions_created ON visitor_sessions(created)');
  sql.exec(
    'CREATE TABLE IF NOT EXISTS visitor_attribution (id TEXT PRIMARY KEY, created INTEGER NOT NULL, kind TEXT NOT NULL, channel TEXT NOT NULL, vehicle TEXT NOT NULL)'
  );
  sql.exec('CREATE INDEX IF NOT EXISTS visitor_attribution_created ON visitor_attribution(created)');

  const today = Date.parse(new Date(now + 28800000).toISOString().slice(0, 10) + 'T00:00:00+08:00');
  const since = today - 29 * 86400000;
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();

  if (request.method === 'POST' && path === '/api/analytics/event') {
    return request.json().then(data => {
      const eventType = String(data?.event || '').toLowerCase();
      if (!['whatsapp_lead', 'view_vehicle', 'fb_share'].includes(eventType)) {
        return respond({ error: 'Unsupported event.' }, 400);
      }
      const channel = campaignChannelName(data?.s, data?.c);
      const vehicle = String(data?.v || '').replace(/[^\w\s#()-]/g, '').trim().slice(0, 64);
      const evtId = `${eventType}:${String(data?.id || now)}:${vehicle || 'general'}`.slice(0, 110);
      sql.exec('DELETE FROM visitor_attribution WHERE created < ?', since);
      sql.exec(
        'INSERT OR IGNORE INTO visitor_attribution (id, created, kind, channel, vehicle) VALUES (?, ?, ?, ?, ?)',
        evtId,
        now,
        eventType,
        channel,
        vehicle
      );
      return respond({ ok: true });
    });
  }

  if (request.method === 'POST') {
    return request.json().then(data => {
      if (!/^[a-f0-9-]{36}$/i.test(data?.id || '')) return respond({ error: 'Invalid visit.' }, 400);
      const country = /^[A-Z]{2}$/.test(data.country || '') ? data.country : 'Unknown';
      const device = ['Mobile', 'Tablet', 'Desktop'].includes(data.device) ? data.device : 'Unknown';
      sql.exec('DELETE FROM visitor_sessions WHERE created < ?', since);
      sql.exec(
        'INSERT OR IGNORE INTO visitor_sessions (id, created, country, device) VALUES (?, ?, ?, ?)',
        data.id,
        now,
        country,
        device
      );
      if (data.s || data.c || data.v) {
        const channel = campaignChannelName(data.s, data.c);
        const vehicle = String(data.v || '').replace(/[^\w\s#()-]/g, '').trim().slice(0, 64);
        sql.exec('DELETE FROM visitor_attribution WHERE created < ?', since);
        sql.exec(
          'INSERT OR IGNORE INTO visitor_attribution (id, created, kind, channel, vehicle) VALUES (?, ?, ?, ?, ?)',
          `visit:${data.id}:${channel}:${vehicle}`,
          now,
          'visit',
          channel,
          vehicle
        );
      }
      return respond({ ok: true });
    });
  }

  const rows = (query, ...params) => Array.from(sql.exec(query, ...params));
  const campaigns = rows(
    "SELECT channel AS name, COUNT(*) AS count FROM visitor_attribution WHERE created >= ? AND kind = 'visit' GROUP BY channel ORDER BY count DESC LIMIT 6",
    since
  );
  const topAdVehicles = rows(
    "SELECT vehicle AS name, COUNT(*) AS count FROM visitor_attribution WHERE created >= ? AND kind = 'visit' AND vehicle != '' GROUP BY vehicle ORDER BY count DESC LIMIT 6",
    since
  );
  const leadsTotal = rows(
    "SELECT COUNT(*) AS count FROM visitor_attribution WHERE created >= ? AND kind = 'whatsapp_lead'",
    since
  )[0]?.count || 0;
  const leadsToday = rows(
    "SELECT COUNT(*) AS count FROM visitor_attribution WHERE created >= ? AND kind = 'whatsapp_lead'",
    today
  )[0]?.count || 0;
  const fbClicks = rows(
    "SELECT COUNT(*) AS count FROM visitor_attribution WHERE created >= ? AND kind = 'visit' AND channel != 'Direct / Showroom'",
    since
  )[0]?.count || 0;
  const fbLeads = rows(
    "SELECT COUNT(*) AS count FROM visitor_attribution WHERE created >= ? AND kind = 'whatsapp_lead' AND channel != 'Direct / Showroom'",
    since
  )[0]?.count || 0;
  const topLeadVehicles = rows(
    "SELECT vehicle AS name, COUNT(*) AS count FROM visitor_attribution WHERE created >= ? AND kind = 'whatsapp_lead' AND vehicle != '' GROUP BY vehicle ORDER BY count DESC LIMIT 6",
    since
  );

  return respond({
    total: rows('SELECT COUNT(*) AS count FROM visitor_sessions WHERE created >= ?', since)[0].count,
    today: rows('SELECT COUNT(*) AS count FROM visitor_sessions WHERE created >= ?', today)[0].count,
    countries: rows(
      'SELECT country AS name, COUNT(*) AS count FROM visitor_sessions WHERE created >= ? GROUP BY country ORDER BY count DESC LIMIT 6',
      since
    ),
    devices: rows(
      'SELECT device AS name, COUNT(*) AS count FROM visitor_sessions WHERE created >= ? GROUP BY device ORDER BY count DESC',
      since
    ),
    campaigns,
    topAdVehicles,
    leadsTotal,
    leadsToday,
    fbClicks,
    fbLeads,
    topLeadVehicles,
    updatedAt: new Date(now).toISOString(),
  });
}
