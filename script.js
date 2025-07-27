const API_KEY = '35090078-7752-4fe9-acf2-1f2ac99d4226'; // keep this safe in prod!
const API_URL = `https://api.cricapi.com/v1/series?apikey=${API_KEY}&offset=0`;

const container = document.getElementById('series-container');

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    if (!data || !data.data || data.data.length === 0) {
      container.innerHTML = '<p>No series found.</p>';
      return;
    }

    // Display only first 5 series for now
    const latestSeries = data.data.slice(0, 5);

    latestSeries.forEach(series => {
      const tile = document.createElement('div');
      tile.style.border = '1px solid #ccc';
      tile.style.padding = '10px';
      tile.style.margin = '10px 0';
      tile.style.borderRadius = '8px';
      tile.style.backgroundColor = '#f7f7f7';

      tile.innerHTML = `
        <h3>${series.name}</h3>
        <p>Start: ${series.startDate} | End: ${series.endDate}</p>
        <p>Formats: 
          ${series.test > 0 ? 'Test ' : ''} 
          ${series.odi > 0 ? 'ODI ' : ''} 
          ${series.t20 > 0 ? 'T20' : ''}
        </p>
        <p>Total Matches: ${series.matches}</p>
      `;

      container.appendChild(tile);
    });
  })
  .catch(err => {
    console.error('Error fetching series:', err);
    container.innerHTML = '<p>Something went wrong loading the series list.</p>';
  });
