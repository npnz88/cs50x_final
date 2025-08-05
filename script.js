const API_KEY = '35090078-7752-4fe9-acf2-1f2ac99d4226';
const API_URL = `https://api.cricapi.com/v1/series?apikey=${API_KEY}&offset=0`;

const container = document.getElementById('series-container');

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const latestSeries = data.data.slice(0, 10); // Show latest 10 series

    latestSeries.forEach(series => {
      const tile = document.createElement('div');

      // Combine year with start/end dates
      const startDateStr = `${series.startDate} ${currentYear}`;
      const endDateStr = `${series.endDate} ${currentYear}`;

      const start = new Date(startDateStr);
      const end = new Date(endDateStr);

      // Fallback if date parsing fails
      const isActive = !isNaN(start) && !isNaN(end) && today >= start && today <= end;

      // Apply styles
      tile.style.border = '1px solid #ccc';
      tile.style.padding = '10px';
      tile.style.margin = '10px 0';
      tile.style.borderRadius = '8px';
      tile.style.backgroundColor = isActive ? '#e6ffe6' : '#f0f0f0'; // Green vs grey

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
