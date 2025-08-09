const API_KEY = '35090078-7752-4fe9-acf2-1f2ac99d4226';
const API_URL = `https://api.cricapi.com/v1/series?apikey=${API_KEY}&offset=0`;

const container = document.getElementById('series-container');

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    const today = new Date();
    const currentYear = today.getFullYear();

    console.log("Today's Date:", today.toDateString());
    console.log("Raw API data:", data);

    const latestSeries = data.data.slice(0, 10);

    latestSeries.forEach(series => {
      // Debug: See exactly what dates are returned
      console.log(`\n=== ${series.name} ===`);
      console.log("Raw startDate:", series.startDate);
      console.log("Raw endDate:", series.endDate);

      // Create Date objects
      let start;
      let end;

      // Detect if API already has a year in date string
      if (/\d{4}/.test(series.startDate)) {
        start = new Date(series.startDate);
        end = new Date(series.endDate);
      } else {
        start = new Date(`${series.startDate} ${currentYear}`);
        end = new Date(`${series.endDate} ${currentYear}`);
      }

      console.log("Parsed start Date object:", start);
      console.log("Parsed end Date object:", end);

      const isActive = !isNaN(start) && !isNaN(end) && today >= start && today <= end;

      console.log("Is Active?", isActive);

      // Build the tile
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
    });
  })
  .catch(err => {
    console.error('Error fetching series:', err);
    container.innerHTML = '<p>Something went wrong loading the series list.</p>';
  });
