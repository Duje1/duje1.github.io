/* ================================================
   Autoškole — app.js
   Data loads from data.json
   Swap the DATA_URL below to any JSON endpoint
================================================ */

const DATA_URL = 'data.json';

let allListings = [];
let categories   = [];
let cities       = [];

// ── INIT ──────────────────────────────────────
async function init() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allListings = data.listings || [];

    if (data.categories && data.categories.length) {
      categories = data.categories;
    } else {
      const catSet = new Set();
      allListings.forEach(item => toArray(item.category).forEach(c => c && catSet.add(c)));
      categories = [...catSet].sort();
    }

    if (data.cities && data.cities.length) {
      cities = data.cities;
    } else {
      const citySet = new Set();
      allListings.forEach(item => toArray(item.city).forEach(c => c && citySet.add(c)));
      cities = [...citySet].sort();
    }

    populateFilters();
    renderCards(allListings);
    bindEvents();
  } catch (err) {
    console.error('Failed to load data:', err);
    document.getElementById('cardsGrid').innerHTML =
      `<p style="color:#c0392b;padding:24px;">Trenutno imamo problema. Pokušajte ponovno za nekoliko minuta.</p>`;
  }
}

// ── HELPERS ───────────────────────────────────
// Always returns an array regardless of whether the field
// is a string, array, or comma-separated string
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean);
  return String(val).split(',').map(v => v.trim()).filter(Boolean);
}

// Renders all values from a list as inline pill spans
function pillsHTML(val, cssClass) {
  return toArray(val)
    .map(v => `<span class="${cssClass}">${v}</span>`)
    .join('');
}

// ── FILTERS ───────────────────────────────────
function populateFilters() {
  const catEl   = document.getElementById('categoryFilter');
  const cityEl  = document.getElementById('cityFilter');

  const cleanCats   = categories.filter(c => c && !c.toLowerCase().startsWith('all ') && !c.toLowerCase().startsWith('sve'));
  const cleanCities = cities.filter(c => c && !c.toLowerCase().startsWith('all ') && !c.toLowerCase().startsWith('svi'));

  cleanCats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    catEl.appendChild(opt);
  });

  cleanCities.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    cityEl.appendChild(opt);
  });
}

function bindEvents() {
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('categoryFilter').addEventListener('change', applyFilters);
  document.getElementById('cityFilter').addEventListener('change', applyFilters);
}

function applyFilters() {
  const query   = document.getElementById('searchInput').value.toLowerCase().trim();
  const catVal  = document.getElementById('categoryFilter').value;
  const cityVal = document.getElementById('cityFilter').value;

  const filtered = allListings.filter(item => {
    const matchSearch = !query ||
      String(item.title || '').toLowerCase().includes(query) ||
      String(item.shortDescription || '').toLowerCase().includes(query) ||
      toArray(item.tags).some(t => t.toLowerCase().includes(query)) ||
      toArray(item.category).some(c => c.toLowerCase().includes(query)) ||
      toArray(item.city).some(c => c.toLowerCase().includes(query));

    const matchCat  = !catVal  || toArray(item.category).some(c => c === catVal);
    const matchCity = !cityVal || toArray(item.city).some(c => c === cityVal);

    return matchSearch && matchCat && matchCity;
  });

  renderCards(filtered);
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('cityFilter').value = '';
  renderCards(allListings);
}

// ── RENDER CARDS ──────────────────────────────
function renderCards(listings) {
  const grid  = document.getElementById('cardsGrid');
  const meta  = document.getElementById('resultsMeta');
  const noRes = document.getElementById('noResults');

  grid.innerHTML = '';
  meta.textContent = `${listings.length} autoškola pronađen${listings.length !== 1 ? 'o' : 'a'}`;

  if (listings.length === 0) {
    noRes.classList.remove('hidden');
    grid.style.display = 'none';
    return;
  }

  noRes.classList.add('hidden');
  grid.style.display = '';

  listings.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${i * 55}ms`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Pogledaj detalje za ${item.title}`);

    // All cities joined with separator
    const citiesDisplay = toArray(item.city).join(' · ');

    card.innerHTML = `
      <div class="card-image-wrap">
        <img class="card-image" src="${item.image}" alt="${item.title}" loading="lazy" onerror="'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=600&q=80''">
        
      </div>
      <div class="card-body">
        <div class="card-categories">
          ${pillsHTML(item.category, 'card-category')}
        </div>
        <h2 class="card-title" title="${item.title}">${item.title}</h2>
        <div class="card-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${citiesDisplay}
        </div>
        <p class="card-desc">${item.shortDescription}</p>
        <div class="card-footer">
          <span class="card-phone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            ${item.phone}
          </span>
          <span class="card-cta">
            Više info
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </div>
      </div>
    `;

    card.addEventListener('click',   () => openDetail(item.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openDetail(item.id); });
    grid.appendChild(card);
  });
}

// ── DETAIL PAGE ───────────────────────────────
function openDetail(id) {
  const item = allListings.find(l => l.id === id);
  if (!item) return;

  const stars = '★'.repeat(Math.round(item.rating)) + '☆'.repeat(5 - Math.round(item.rating));

  const galleryHTML = item.gallery && item.gallery.length
    ? `<h3 class="detail-section-title">Galerija</h3>
       <div class="detail-gallery">
         ${item.gallery.map(g => `<img src="${g}" alt="Slika" loading="lazy">`).join('')}
       </div>`
    : '';

  const tagsHTML = item.tags && toArray(item.tags).length
    ? `<div class="detail-tags">${toArray(item.tags).map(t => `<span class="tag">${t}</span>`).join('')}</div>`
    : '';

  document.getElementById('detailContent').innerHTML = `
    <img class="detail-hero" src="${item.image}" alt="${item.title}" onerror="this.style.display='none'">
    <div class="detail-categories">
      ${pillsHTML(item.category, 'detail-category')}
    </div>
    <h1 class="detail-title">${item.title}</h1>
    <div class="detail-rating">
      <span class="stars">${stars}</span>
      <span class="rating-val">${item.rating.toFixed(1)}</span>
    </div>

    <div class="detail-meta-grid">
      <div class="meta-item">
        <span class="meta-label">📍 Lokacija</span>
        <span class="meta-value">${item.location}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">📞 Telefon</span>
        <span class="meta-value"><a href="tel:${item.phone}">${item.phone}</a></span>
      </div>
      ${item.email ? `<div class="meta-item"><span class="meta-label">✉️ Email</span><span class="meta-value"><a href="mailto:${item.email}">${item.email}</a></span></div>` : ''}
      ${item.hours ? `<div class="meta-item"><span class="meta-label">🕐 Radno vrijeme</span><span class="meta-value">${item.hours}</span></div>` : ''}
      ${item.website ? `<div class="meta-item"><span class="meta-label">🌐 Web</span><span class="meta-value"><a href="https://${item.website}" target="_blank" rel="noopener">${item.website}</a></span></div>` : ''}
    </div>

    <h3 class="detail-section-title">O nama</h3>
    <p class="detail-description">${item.fullDescription}</p>

    ${tagsHTML}
    ${galleryHTML}

    <div class="detail-actions">
      <a href="tel:${item.phone}" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Nazovi
      </a>
      ${item.email ? `<a href="mailto:${item.email}" class="btn-secondary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>Email</a>` : ''}
      ${item.website ? `<a href="https://${item.website}" target="_blank" rel="noopener" class="btn-secondary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>Web</a>` : ''}
    </div>
  `;

  document.getElementById('listingPage').classList.remove('active');
  document.getElementById('detailPage').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function goBack() {
  document.getElementById('detailPage').classList.remove('active');
  document.getElementById('listingPage').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ── START ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
