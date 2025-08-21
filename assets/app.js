const CONSENT_STORAGE_KEY = "consent.v1";
const TEXTS_URL = "/config/texts.json";

const ConsentCategories = {
  essential: "essential",
  comfort: "comfort",
  analytics: "analytics"
};

function readReducedMotion() {
  try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

function loadJSON(url) {
  return fetch(url, { credentials: 'same-origin' }).then(r => {
    if (!r.ok) throw new Error("Failed to load " + url);
    return r.json();
  });
}

function getStoredConsent() {
  try { return JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || "null"); } catch { return null; }
}

function saveConsent(consent) {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
}

function nowIso() { return new Date().toISOString(); }

function generateCsrfToken() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

function applyI18n(texts, variant) {
  const t = texts[variant] || texts.plain;
  if (!t) return;
  document.querySelectorAll('[data-i18n]')
    .forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });
}

function trapFocus(container) {
  const focusable = container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  function onKey(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
}

function initConsentUI() {
  const banner = document.getElementById('consent-banner');
  const form = document.getElementById('consent-form');
  const btnOpen = document.getElementById('btn-consent-open');
  const btnEssentials = document.getElementById('btn-consent-essentials');
  const btnAll = document.getElementById('btn-consent-accept-all');

  let current = getStoredConsent();
  const version = '1.0.0';
  const initialConsent = { version, decidedAt: null, categories: { essential: true, comfort: false, analytics: false } };
  if (!current || current.version !== version) current = initialConsent;

  function openBanner() { banner.hidden = false; banner.setAttribute('aria-hidden', 'false'); banner.querySelector('input[name="comfort"]').checked = current.categories.comfort; banner.querySelector('input[name="analytics"]').checked = current.categories.analytics; banner.querySelector('button[type="submit"]').focus(); }
  function closeBanner() { banner.hidden = true; banner.setAttribute('aria-hidden', 'true'); }

  btnOpen.addEventListener('click', openBanner);
  btnEssentials.addEventListener('click', () => { current.categories.comfort = false; current.categories.analytics = false; current.decidedAt = nowIso(); saveConsent(current); closeBanner(); document.dispatchEvent(new CustomEvent('consent:updated', { detail: current })); });
  btnAll.addEventListener('click', () => { current.categories.comfort = true; current.categories.analytics = false; current.decidedAt = nowIso(); saveConsent(current); closeBanner(); document.dispatchEvent(new CustomEvent('consent:updated', { detail: current })); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    current.categories.comfort = data.get('comfort') === 'on';
    current.categories.analytics = data.get('analytics') === 'on';
    current.decidedAt = nowIso();
    saveConsent(current);
    closeBanner();
    document.dispatchEvent(new CustomEvent('consent:updated', { detail: current }));
  });

  // Show banner if no prior decision
  if (!getStoredConsent()?.decidedAt) openBanner();

  return { get: () => current };
}

async function initI18n() {
  try {
    const texts = await loadJSON(TEXTS_URL);
    const state = { variant: 'plain', texts };
    function render() { applyI18n(state.texts, state.variant); }
    render();
    const btn = document.getElementById('btn-plain-toggle');
    btn?.addEventListener('click', () => { state.variant = state.variant === 'plain' ? 'leicht' : 'plain'; render(); });
  } catch {}
}

function initHeroMotion(consent) {
  const reduced = readReducedMotion();
  const note = document.getElementById('motion-note');
  if (reduced) note?.removeAttribute('hidden');
  if (reduced) return;
  const comfort = consent.get().categories.comfort;
  if (!comfort) return;
  const target = document.getElementById('hero-3d');
  if (!target) return;
  const io = new IntersectionObserver(async (entries, obs) => {
    if (entries.some(e => e.isIntersecting)) {
      obs.disconnect();
      try {
        const mod = await import('/assets/3d.js');
        mod.initHologram(target);
      } catch (err) {
        console.warn('3D init failed, falling back.', err);
      }
    }
  }, { rootMargin: '0px 0px -20% 0px' });
  io.observe(target);
}

function validateContactForm(form) {
  const errors = [];
  const name = form.elements.namedItem('name');
  const email = form.elements.namedItem('email');
  const benefit = form.elements.namedItem('benefit');
  const message = form.elements.namedItem('message');
  const phone = form.elements.namedItem('phone');
  const file = form.elements.namedItem('poa_file');

  if (!name.value || name.value.trim().length < 2) errors.push('Name ist zu kurz.');
  if (!email.validity.valid) errors.push('E‑Mail ist ungültig.');
  if (!benefit.value) errors.push('Bitte Leistung auswählen.');
  if (!message.value || message.value.trim().length < 20) errors.push('Bitte Beschreibung mit mindestens 20 Zeichen eingeben.');
  if (phone.value && !new RegExp('^[+0-9 ()-]{6,}$').test(phone.value)) errors.push('Telefonformat prüfen.');
  if (file && file.files && file.files[0]) {
    const f = file.files[0];
    const okType = ['application/pdf', 'image/jpeg', 'image/png'].includes(f.type);
    const okSize = f.size <= 10 * 1024 * 1024;
    if (!okType) errors.push('Nur PDF/JPEG/PNG erlaubt.');
    if (!okSize) errors.push('Datei darf maximal 10 MB groß sein.');
  }
  return errors;
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const errorBox = document.getElementById('form-errors');
  const csrf = document.getElementById('csrf_token');
  csrf.value = generateCsrfToken();

  form.addEventListener('submit', (e) => {
    const errs = validateContactForm(form);
    if (errs.length) {
      e.preventDefault();
      errorBox.classList.remove('sr-only');
      errorBox.innerHTML = `<strong>Bitte korrigieren:</strong> <ul>${errs.map(x => `<li>${x}</li>`).join('')}</ul>`;
      errorBox.focus();
    } else {
      // Server-Hooks (Beispiel):
      // - CSRF-Token prüfen
      // - MIME-Check serverseitig, AV-Scan, PDF-Sanitizer
      // - Rate-Limit /api/submit
      // - Presigned-URL für Uploads (15 Min)
    }
  });

  document.getElementById('btn-delete-now')?.addEventListener('click', () => {
    localStorage.clear();
    sessionStorage.clear();
    form.reset();
    alert('Lokal gespeicherte Daten wurden gelöscht.');
  });
}

function initPrecheck() {
  const form = document.getElementById('precheck-form');
  const out = document.getElementById('precheck-result');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const wohnkosten = data.get('wohnkosten');
    const plz = String(data.get('plz') || '')
    const okPlz = /^\d{5}$/.test(plz);
    if (wohnkosten !== 'ja' || !okPlz) { out.textContent = 'Nicht relevant oder unklar. Bürgergeld prüfen.'; return; }
    out.textContent = 'Wohngeld voraussichtlich möglich (unverbindliche Vorprüfung).';
  });
}

function initModalConsent() {
  const modal = document.getElementById('modal-consent');
  const body = document.getElementById('modal-body');
  const accept = document.getElementById('modal-accept');
  const decline = document.getElementById('modal-decline');
  let cleanupFocus = null;
  let currentKey = null;
  function open(key, html) {
    currentKey = key;
    body.innerHTML = html;
    modal.hidden = false; cleanupFocus = trapFocus(modal); accept.focus();
  }
  function close() { modal.hidden = true; cleanupFocus && cleanupFocus(); }
  decline.addEventListener('click', close);
  accept.addEventListener('click', () => {
    const c = getStoredConsent() || { version: '1.0.0', decidedAt: nowIso(), categories: { essential: true, comfort: false, analytics: false } };
    const logKey = `consent.feature.${currentKey}`;
    const log = { key: currentKey, acceptedAt: nowIso() };
    localStorage.setItem(logKey, JSON.stringify(log));
    close();
    document.dispatchEvent(new CustomEvent('feature-consent', { detail: log }));
  });
  return { open };
}

function initFeatureConsents(modalConsent) {
  const micBtn = document.getElementById('btn-consent-mic');
  const uploadBtn = document.getElementById('btn-consent-upload');
  const waBtn = document.getElementById('btn-consent-wa');
  const micStatus = document.getElementById('status-consent-mic');
  const upStatus = document.getElementById('status-consent-upload');
  const waStatus = document.getElementById('status-consent-wa');

  function setStatus(el, ok) { el.textContent = ok ? 'aktiv' : 'inaktiv'; }
  setStatus(micStatus, !!localStorage.getItem('consent.feature.microphone'));
  setStatus(upStatus, !!localStorage.getItem('consent.feature.upload'));
  setStatus(waStatus, !!localStorage.getItem('consent.feature.whatsapp'));

  micBtn.addEventListener('click', () => {
    const html = `<p>Ich willige ein, dass meine Sprachaufnahme zur Texterkennung verarbeitet wird. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO. Widerruf jederzeit möglich.</p>`;
    modalConsent.open('microphone', html);
  });
  uploadBtn.addEventListener('click', () => {
    const html = `<p>Ich willige ein, dass hochgeladene Dokumente zur Antragsvorbereitung gespeichert und verarbeitet werden.</p>`;
    modalConsent.open('upload', html);
  });
  waBtn.addEventListener('click', () => {
    const html = `<p>Ich willige ein, über WhatsApp kontaktiert zu werden. Datenübermittlung an Drittländer möglich. Bitte nur nicht sensible Daten teilen.</p>`;
    modalConsent.open('whatsapp', html);
  });

  document.addEventListener('feature-consent', (e) => {
    const key = e.detail.key;
    if (key === 'microphone') setStatus(micStatus, true);
    if (key === 'upload') setStatus(upStatus, true);
    if (key === 'whatsapp') setStatus(waStatus, true);
  });
}

function main() {
  const consent = initConsentUI();
  initI18n();
  initPrecheck();
  initContactForm();
  initHeroMotion(consent);
  const modalConsent = initModalConsent();
  initFeatureConsents(modalConsent);
}

document.addEventListener('DOMContentLoaded', main);

