// fetch_cricket.js — CommonJS, Node 20 (global fetch)
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.CRICAPI_KEY;
if (!API_KEY) {
  console.error('Missing CRICAPI_KEY env var.');
  process.exit(1);
}

const API_URL = `https://api.cricapi.com/v1/series?apikey=${API_KEY}&offset=0`;

const OUT_DIR = 'data';
const OUT_FILE = path.join(OUT_DIR, 'series.json');
const RAW_FILE = path.join(OUT_DIR, 'series_raw.json');

async function main() {
  console.log('[fetch] GET', API_URL);

  const r = await fetch(API_URL, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  console.log('[fetch] HTTP', r.status);

  const text = await r.text();

  // Always write raw for debugging
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(RAW_FILE, text);
  console.log(`[fetch] wrote raw payload to ${RAW_FILE} (${text.length} bytes)`);

  let payload;
  try {
    payload = JSON.parse(text);
  } catch (e) {
    console.error('[fetch] Response not JSON. First 400 chars:\n', text.slice(0, 400));
    throw e;
  }

  if (payload?.status === 'error') {
    throw new Error(`API error: ${payload?.message || 'unknown'}`);
  }

  // Try several possible shapes
  let list = null;
  if (Array.isArray(payload?.data)) list = payload.data;
  else if (Array.isArray(payload?.response)) list = payload.response;
  else if (Array.isArray(payload?.data?.series)) list = payload.data.series;
  else if (payload?.records && Array.isArray(payload.records)) list = payload.records;

  if (!Array.isArray(list)) {
    // Include top-level keys to help debugging
    console.error('[fetch] Unexpected payload shape. Top-level keys:', Object.keys(payload || {}));
    console.error('[fetch] Example payload snippet:', JSON.stringify(payload, null, 2).slice(0, 400));
    throw new Error('No series array found in payload; see data/series_raw.json');
  }

  // Trim but keep enough for the page
  const out = { data: list.slice(0, 100), fetchedAt: new Date().toISOString() };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
  console.log(`[fetch] wrote ${OUT_FILE} with ${out.data.length} items`);
}

main().catch((e) => {
  console.error('Fetch failed:', e?.message || e);
  process.exit(1);
});
