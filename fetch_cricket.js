// scripts/fetch_cricket.js
// Node 18+ (has global fetch). Writes JSON files under ./data

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const API_KEY = process.env.CRIC_API_KEY;
if (!API_KEY) {
  console.error('Missing CRIC_API_KEY env var');
  process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), 'data');
if (!existsSync(OUT_DIR)) {
  await mkdir(OUT_DIR, { recursive: true });
}

async function getJson(url) {
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}

async function writeJson(file, data) {
  const outPath = path.join(OUT_DIR, file);
  await writeFile(outPath, JSON.stringify(data, null, 2));
  console.log(`Wrote ${outPath}`);
}

async function main() {
  // Add/remove endpoints as you need
  const endpoints = [
    { url: `https://api.cricapi.com/v1/series?apikey=${API_KEY}&offset=0`, file: 'series.json' },
    { url: `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}`,  file: 'current_matches.json' },
  ];

  let failed = false;

  for (const { url, file } of endpoints) {
    try {
      const data = await getJson(url);
      await writeJson(file, data);
    } catch (err) {
      console.error(`Failed ${file}: ${err.message}`);
      failed = true; // fail the job so you see it
    }
  }

  if (failed) process.exit(1);
}

await main();
