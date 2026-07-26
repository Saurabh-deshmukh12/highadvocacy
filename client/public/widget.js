(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────
  const container = document.getElementById('highadvocacy-widget');
  if (!container) return;

  const apiBase = container.dataset.api || 'http://localhost:3099';
  const accent = container.dataset.accent || '#4f46e5'; // indigo-600
  const maxItems = parseInt(container.dataset.limit || '6', 10);
  const layout = container.dataset.layout || 'grid'; // grid | carousel

  // ── Styles ─────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    .ha-widget * { box-sizing: border-box; margin: 0; padding: 0; }
    .ha-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .ha-widget__title { font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 1.25rem; text-align: center; }
    .ha-widget__grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
    .ha-widget__carousel { display: flex; gap: 1rem; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding-bottom: 0.5rem; }
    .ha-widget__carousel .ha-card { flex: 0 0 320px; scroll-snap-align: start; }
    .ha-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; transition: box-shadow 0.2s; }
    .ha-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .ha-card__header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
    .ha-card__avatar { width: 2.5rem; height: 2.5rem; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .ha-card__avatar--fallback { width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; color: #fff; flex-shrink: 0; }
    .ha-card__name { font-weight: 600; color: #111827; font-size: 0.9375rem; }
    .ha-card__company { font-size: 0.8125rem; color: #6b7280; }
    .ha-card__stars { display: flex; gap: 2px; }
    .ha-card__star { width: 0.875rem; height: 0.875rem; }
    .ha-card__star--filled { color: #f59e0b; }
    .ha-card__star--empty { color: #d1d5db; }
    .ha-card__text { font-size: 0.875rem; color: #374151; line-height: 1.5; margin-top: 0.5rem; }
    .ha-card__date { font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem; }
    .ha-widget__empty { text-align: center; padding: 3rem 1rem; color: #9ca3af; }
    .ha-widget__error { text-align: center; padding: 2rem 1rem; color: #ef4444; font-size: 0.875rem; }
    .ha-widget__spinner { display: flex; justify-content: center; padding: 3rem; }
    .ha-widget__spinner::after { content: ''; width: 2rem; height: 2rem; border: 3px solid #e5e7eb; border-top-color: ${accent}; border-radius: 50%; animation: ha-spin 0.6s linear infinite; }
    @keyframes ha-spin { to { transform: rotate(360deg); } }
    .ha-widget__powered { text-align: center; margin-top: 1rem; font-size: 0.75rem; }
    .ha-widget__powered a { color: ${accent}; text-decoration: none; }
  `;
  document.head.appendChild(style);

  // ── Render helpers ─────────────────────────────────────────────
  function starSVG(filled) {
    return `<svg class="ha-card__star ha-card__star--${filled ? 'filled' : 'empty'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
  }

  function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) => starSVG(i < rating)).join('');
  }

  function renderCard(t) {
    const initials = t.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const avatar = t.photo_url
      ? `<img src="${t.apiBase || apiBase}${t.photo_url}" alt="${t.name}" class="ha-card__avatar" loading="lazy" />`
      : `<div class="ha-card__avatar--fallback" style="background:${accent}">${initials}</div>`;

    return `
      <div class="ha-card">
        <div class="ha-card__header">
          ${avatar}
          <div>
            <div class="ha-card__name">${escapeHtml(t.name)}</div>
            ${t.company ? `<div class="ha-card__company">${escapeHtml(t.company)}</div>` : ''}
            <div class="ha-card__stars">${renderStars(t.rating)}</div>
          </div>
        </div>
        <div class="ha-card__text">${escapeHtml(t.text)}</div>
        <div class="ha-card__date">${new Date(t.created_at).toLocaleDateString()}</div>
      </div>`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Fetch & render ─────────────────────────────────────────────
  async function load() {
    container.innerHTML = '<div class="ha-widget"><div class="ha-widget__spinner"></div></div>';
    container.classList.add('ha-widget');

    try {
      const res = await fetch(`${apiBase}/api/testimonials/approved?limit=${maxItems}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      const testimonials = data.testimonials || [];

      if (testimonials.length === 0) {
        container.innerHTML = `
          <div class="ha-widget">
            <div class="ha-widget__empty">
              <p>No testimonials yet.</p>
              <p style="font-size:0.8125rem;margin-top:0.25rem;">Be the first to share your experience!</p>
            </div>
            <div class="ha-widget__powered">Powered by <a href="#" target="_blank">HighAdvocacy</a></div>
          </div>`;
        return;
      }

      // Augment testimonials with API base for photo URLs
      const augmented = testimonials.map(t => ({ ...t, apiBase }));

      const cards = augmented.map(renderCard).join('');
      const layoutClass = layout === 'carousel' ? 'ha-widget__carousel' : 'ha-widget__grid';

      container.innerHTML = `
        <div class="ha-widget">
          <div class="ha-widget__title">What People Are Saying</div>
          <div class="${layoutClass}">${cards}</div>
          <div class="ha-widget__powered">Powered by <a href="#" target="_blank">HighAdvocacy</a></div>
        </div>`;
    } catch (err) {
      container.innerHTML = '<div class="ha-widget"><div class="ha-widget__error">Unable to load testimonials. Please try again later.</div></div>';
      console.error('HighAdvocacy widget error:', err);
    }
  }

  load();
})();
