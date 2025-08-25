// fetch_cricket.js
// Fetches series list from CricAPI (or switch to your provider) and writes data/series.json

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.CRICAPI_KEY;
if (!API_KEY) {
  console.error("Missing CRICAPI_KEY env var.");
  process.exit(1);
}

const API_URL = `https://api.cricapi.com/v1/series?apikey=${API_KEY}&offset=0`; 
// If your key is for CricketData.org instead, switch to their endpoint here.

const OUT_DIR = path.join(__dirname, "data");
const OUT_FILE = path.join(OUT_DIR, "series.json");

async function main() {
  console.log("[fetch] GET", API_URL);

  const r = await fetch(API_URL, { headers: { "Accept": "application/json" } });
  const text = await r.text();

  let payload;
  try {
    payload = JSON.parse(text);
  } catch (e) {
    console.error("Response was not JSON:", text.slice(0, 400));
    throw e;
  }

  if (payload?.status === "error") {
    // Surface provider’s message in the workflow logs
    throw new Error(`API error: ${payload?.message || "unknown"}`);
  }

  // Normalise shape to { data: [...] }
  let list = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.response)
    ? payload.response
    : Array.isArray(payload?.data?.series)
    ? payload.data.series
    : null;

  if (!Array.isArray(list)) {
    console.warn("Unexpected payload shape; writing raw file for debugging.");
    list = [];
  }

  // Keep it small (your UI slices anyway)
  const pruned = list.slice(0, 100);

  const out = { data: pruned, fetchedAt: new Date().toISOString() };

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
  console.log(`[fetch] wrote ${OUT_FILE} with ${pruned.length} items`);
}

main().catch((e) => {
  console.error("Fetch failed:", e?.message || e);
  process.exit(1);
});
