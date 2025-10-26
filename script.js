const DATA_URL = './data/upcoming_matches.json';

const container = document.getElementById('matches-container');
const diag = document.getElementById('diag');

function safeText(value) {
  if (!value) return '—';
  return String(value);
}

function formatLocalDate(date) {
  if (!date) return null;
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return null;
  const opts = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  };
  return new Intl.DateTimeFormat(undefined, opts).format(dt);
}

function createMatchCard(label, match) {
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('tabindex', '0');
  card.innerHTML = `
    <h2>${label}</h2>
    <div class="match-title">${safeText(match?.name) || 'Fixture to be confirmed'}</div>
    <div class="match-teams">${safeText(match?.teams?.join(' vs '))}</div>
    <div class="meta">Series: ${safeText(match?.series)}</div>
    <div class="meta">Venue: ${safeText(match?.venue)}</div>
    <div class="meta">Start: ${safeText(formatLocalDate(match?.utcTimestamp || match?.dateTimeGMT))}</div>
    <div class="badge">Next ${label}</div>
  `;
  return card;
}

function createEmptyCard(label) {
  const wrap = document.createElement('div');
  wrap.className = 'empty-state';
  wrap.innerHTML = `
    <strong>${label}</strong>
    <p>No upcoming fixtures were returned for this format.</p>
  `;
  return wrap;
}

async function loadData() {
  const response = await fetch(DATA_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function render(data) {
  if (!container) return;
  container.innerHTML = '';

  const matches = data?.matches || {};
  const cards = [
    { label: 'Test Match', match: matches.test },
    { label: 'ODI Match', match: matches.odi },
  ];

  cards.forEach(({ label, match }) => {
    if (match) {
      container.appendChild(createMatchCard(label, match));
    } else {
      container.appendChild(createEmptyCard(label));
    }
  });

  if (diag) {
    const fetchedAt = data?.fetchedAt ? new Date(data.fetchedAt) : null;
    const fetchedLabel = fetchedAt && !Number.isNaN(fetchedAt.getTime())
      ? fetchedAt.toLocaleString()
      : 'unknown time';
    diag.textContent = `Fixtures refreshed ${fetchedLabel}`;
  }
}

(async function init() {
  try {
    if (diag) diag.textContent = 'Contacting API cache…';
    const payload = await loadData();
    render(payload);
  } catch (error) {
    console.error('Failed to load fixtures', error);
    if (diag) diag.textContent = 'Unable to load fixtures';
    if (container) {
      container.innerHTML = '<div class="empty-state">Could not load cricket fixtures. Please try again later.</div>';
    }
  }
})();
