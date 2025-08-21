// assets/app.js

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  setupConsent();
  initPrecheckForm();
  lazyLoadHero3D();
});

function lazyLoadHero3D() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = document.getElementById('hero');
  if (!hero) return;
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      import('./3d.js').then(mod => mod.initHero3D());
      io.disconnect();
    }
  }, { rootMargin: '200px' });
  io.observe(hero);
}

// ---------------- Consent Banner ----------------
function setupConsent() {
  const root = document.getElementById('consent-root');
  if (!root) return;
  const stored = localStorage.getItem('consent_v1');
  if (stored) return;
  root.innerHTML = `\n    <div class=\"consent-banner\" role=\"dialog\" aria-modal=\"true\">\n      <p>Wir verwenden Cookies, um die Website zu verbessern.</p>\n      <button id=\"consent-accept\">Akzeptieren</button>\n      <button id=\"consent-decline\">Ablehnen</button>\n    </div>`;
  const acceptBtn = root.querySelector('#consent-accept');
  const declineBtn = root.querySelector('#consent-decline');
  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('consent_v1', JSON.stringify({ essential: true, comfort: true, analytics: false, ts: Date.now() }));
    root.remove();
  });
  declineBtn.addEventListener('click', () => {
    localStorage.setItem('consent_v1', JSON.stringify({ essential: true, comfort: false, analytics: false, ts: Date.now() }));
    root.remove();
  });
}

// ---------------- Precheck Form ----------------
function initPrecheckForm() {
  const form = document.getElementById('precheck-form');
  if (!form) return;
  form.innerHTML = `\n    <label>\n      Haushaltsgröße*\n      <input type=\"number\" name=\"haushaltsgroesse\" min=\"1\" required />\n    </label>\n    <label>\n      Netto-Monatseinkommen (€)*\n      <input type=\"number\" name=\"netto_monat\" min=\"0\" required />\n    </label>\n    <label>\n      PLZ*\n      <input type=\"text\" name=\"plz\" pattern=\"\\\\d{5}\" required />\n    </label>\n    <button type=\"submit\">Prüfen</button>`;
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const fd = new FormData(form);
    const errors = [];
    if (!fd.get('haushaltsgroesse')) errors.push('Haushaltsgröße fehlt');
    if (!fd.get('netto_monat')) errors.push('Netto-Einkommen fehlt');
    if (!fd.get('plz')) errors.push('PLZ fehlt');
    const errorBox = document.getElementById('form-errors');
    if (errors.length) {
      errorBox.textContent = errors.join(', ');
      errorBox.style.display = 'block';
      errorBox.focus();
      return;
    }
    errorBox.textContent = '';
    alert('Prüfung durchgeführt (Demo)');
  });
}