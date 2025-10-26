// fetch_cricket.js — CommonJS, Node 20 (global fetch)
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.CRICAPI_KEY;

const API_URL = API_KEY
  ? `https://api.cricapi.com/v1/matches?apikey=${API_KEY}&offset=0`
  : null;

const OUT_DIR = 'data';
const RAW_FILE = path.join(OUT_DIR, 'matches_raw.json');
const OUT_FILE = path.join(OUT_DIR, 'upcoming_matches.json');

function parseDate(value) {
  if (!value) return null;
  const attempt = new Date(value);
  if (!Number.isNaN(attempt?.getTime())) return attempt;
  const gmt = new Date(`${value}Z`);
  if (!Number.isNaN(gmt?.getTime())) return gmt;
  return null;
}

function normaliseMatch(match) {
  const matchTypeRaw = String(
    match?.matchType || match?.type || match?.format || ''
  ).toLowerCase();

  const teams = Array.isArray(match?.teams)
    ? match.teams.filter(Boolean)
    : [match?.team1, match?.team2].filter(Boolean);

  const venue = [match?.venue?.name || match?.venue, match?.venue?.city, match?.venue?.country]
    .filter(Boolean)
    .join(', ');

  const dt = parseDate(match?.dateTimeGMT || match?.dateTime || match?.date);

  return {
    id: match?.id || match?.matchId || match?.unique_id || null,
    name:
      match?.name ||
      [match?.series?.name || match?.seriesName || match?.series, match?.matchNumber || match?.matchDesc]
        .filter(Boolean)
        .join(' - '),
    series: match?.series?.name || match?.seriesName || match?.series || null,
    matchType: matchTypeRaw,
    status: match?.status || match?.gameState || null,
    teams,
    venue: venue || null,
    dateTimeGMT: match?.dateTimeGMT || match?.dateTime || match?.date || null,
    utcTimestamp: dt ? dt.toISOString() : null,
  };
}

function selectUpcoming(list) {
  const now = new Date();

  const grouped = { test: [], odi: [] };

  list.forEach((item) => {
    const normalised = normaliseMatch(item);
    if (!normalised.utcTimestamp) return;
    const start = new Date(normalised.utcTimestamp);
    if (Number.isNaN(start.getTime()) || start <= now) return;

    const key = normalised.matchType;
    if (!key) return;

    if (key.includes('test')) grouped.test.push({ raw: item, normalised, start });
    if (key.includes('odi')) grouped.odi.push({ raw: item, normalised, start });
  });

  const pick = (entries) => {
    if (!entries.length) return null;
    entries.sort((a, b) => a.start - b.start);
    return entries[0].normalised;
  };

  return {
    test: pick(grouped.test),
    odi: pick(grouped.odi),
  };
}

async function fetchFromApi() {
  if (!API_URL) {
    throw new Error('Missing CRICAPI_KEY env var; cannot contact CricAPI');
  }

  console.log('[fetch] GET', API_URL);
  const r = await fetch(API_URL, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  console.log('[fetch] HTTP', r.status);

  const text = await r.text();

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

  let matches = null;
  if (Array.isArray(payload?.data)) matches = payload.data;
  else if (Array.isArray(payload?.matches)) matches = payload.matches;
  else if (Array.isArray(payload?.response)) matches = payload.response;
  else if (Array.isArray(payload?.records)) matches = payload.records;

  if (!Array.isArray(matches)) {
    console.error('[fetch] Unexpected payload shape. Top-level keys:', Object.keys(payload || {}));
    throw new Error('No matches array found in payload; see data/matches_raw.json');
  }

  return {
    fetchedAt: new Date().toISOString(),
    source: API_URL,
    matches: selectUpcoming(matches),
  };
}

function writeOutput(payload) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));
  console.log(`[fetch] wrote ${OUT_FILE}`);
}

async function main() {
  try {
    const payload = await fetchFromApi();
    writeOutput(payload);
  } catch (error) {
    const reason = error?.message || error;
    const code = error?.code || error?.cause?.code;
    console.error('Fetch failed:', reason, code ? `(${code})` : '');
    throw error;
  }
}

main().catch(() => {
  process.exit(1);
});
