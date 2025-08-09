

const API_KEY = '35090078-7752-4fe9-acf2-1f2ac99d4226';
const API_URL = `https://api.cricapi.com/v1/series?apikey=${API_KEY}&offset=0`;

const container = document.getElementById('series-container');

// --- TOP OF FILE ---
const MONTHS = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };

function parseSeriesDate(dateStr, fallbackYear) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (iso) {
    const [_, y, m, d] = iso;
    return new Date(Date.UTC(+y, +m - 1, +d));
  }
  const md = /^([A-Za-z]{3})\s+(\d{1,2})$/.exec(dateStr);
  if (md && fallbackYear) {
    const month = MONTHS[md[1].toLowerCase()];
    const day = +md[2];
    return new Date(Date.UTC(fallbackYear, month, day));
  }
  return new Date(NaN);
}
// --- then your fetch(...) code below ---

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    const today = new Date();
    const currentYear = today.getFullYear();

    console.log("Today's Date:", today.toDateString());
    console.log("Raw API data:", data);

    const latestSeries = data.data.slice(0, 10);

    latestSeries.forEach(series => {
    // Work in UTC to avoid timezone surprises
    const todayUTC = new Date(Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    ));

    // Parse start date
    const start = parseSeriesDate(series.startDate, null);

    // Decide fallback year for end date
    const fallbackYear = !isNaN(start) ? start.getUTCFullYear() : todayUTC.getUTCFullYear();

    // Parse end date using fallback year
    let end = parseSeriesDate(series.endDate, fallbackYear);

    // Handle year rollover if end is before start
    if (!isNaN(start) && !isNaN(end) && end < start) {
      end = new Date(Date.UTC(end.getUTCFullYear() + 1, end.getUTCMonth(), end.getUTCDate()));
    }

    // Calculate active status
    const isActive = !isNaN(start) && !isNaN(end) && todayUTC >= start && todayUTC <= end;

    // Debug output
    console.log(`Series: ${series.name}`);
    console.log("Start:", start.toUTCString(), "End:", end.toUTCString(), "Active:", isActive);

    });

    // Build the tile (basic styles for now)
    const tile = document.createElement('div');
    tile.style.border = '1px solid #ccc';
    tile.style.padding = '10px';
    tile.style.margin = '10px 0';
    tile.style.borderRadius = '8px';
    tile.style.backgroundColor = isActive ? '#e6ffe6' : '#f0f0f0';

    tile.innerHTML = `
      <h3>${series.name}</h3>
      <p>Start: ${series.startDate} | End: ${series.endDate}</p>
      <p>Matches: ${series.matches}</p>
      ${isActive ? '<p style="color: green; font-weight: bold;">ACTIVE NOW</p>' : ''}
    `;

    container.appendChild(tile);


  })
  .catch(err => {
    console.error('Error fetching series:', err);
    container.innerHTML = '<p>Something went wrong loading the series list.</p>';
  });
