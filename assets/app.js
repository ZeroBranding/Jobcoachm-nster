// assets/app.js

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  setupConsent();
  initPrecheckForm();
  lazyLoadHero3D();
  setupNavigation();
  initDeletionTimer();
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

// ---------------- Consent Banner (granular) ----------------
function setupConsent() {
  const root = document.getElementById('consent-root');
  if (!root) return;
  const stored = JSON.parse(localStorage.getItem('consent_v2') || 'null');
  if (stored) return;
  root.innerHTML = `
    <div class="consent-banner" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <p id="consent-title">Wir verwenden Cookies & Dienste. Bitte wählen:</p>
      <button id="consent-settings">Einstellungen</button>
      <button id="consent-accept">Alle akzeptieren</button>
    </div>`;
  const acceptBtn = root.querySelector('#consent-accept');
  const settingsBtn = root.querySelector('#consent-settings');
  acceptBtn.addEventListener('click', () => {
    saveConsent({ essential: true, comfort: true, analytics: true });
  });
  settingsBtn.addEventListener('click', openConsentSettings);

  function saveConsent(obj) {
    localStorage.setItem('consent_v2', JSON.stringify({ ...obj, ts: Date.now() }));
    root.remove();
  }

  function openConsentSettings() {
    const modal = document.createElement('div');
    modal.className = 'consent-banner';
    modal.innerHTML = `
      <fieldset>
        <legend>Kategorien</legend>
        <label><input type=\"checkbox\" name=\"comfort\" checked /> Komfort</label>
        <label><input type=\"checkbox\" name=\"analytics\" /> Analytics</label>
      </fieldset>
      <button id=\"consent-save\">Speichern</button>
      <button id=\"consent-cancel\">Abbrechen</button>`;
    document.body.append(modal);
    trapFocus(modal);
    modal.querySelector('#consent-save').addEventListener('click', () => {
      const comfort = modal.querySelector('[name="comfort"]').checked;
      const analytics = modal.querySelector('[name="analytics"]').checked;
      saveConsent({ essential: true, comfort, analytics });
      modal.remove();
    });
    modal.querySelector('#consent-cancel').addEventListener('click', () => modal.remove());
  }
}

// ---------------- Focus Trap ----------------
function trapFocus(el) {
  const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  el.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  first.focus();
}

// ---------------- Precheck Form ----------------
function initPrecheckForm() {
  const form = document.getElementById('precheck-form');
  if (!form) return;
  form.innerHTML = `\n    <label>\n      Haushaltsgröße*\n      <input type=\"number\" name=\"haushaltsgroesse\" min=\"1\" required />\n    </label>\n    <label>\n      Netto-Monatseinkommen (€)*\n      <input type=\"number\" name=\"netto_monat\" min=\"0\" required />\n    </label>\n    <label>\n      PLZ*\n      <input type=\"text\" name=\"plz\" pattern=\"\\\\d{5}\" required />\n    </label>\n    <label>\n      Vollmacht (optional)\n      <input type=\"file\" name=\"poa_file\" accept=\".pdf,image/jpeg,image/png\" />\n    </label>\n    <button type=\"submit\">Prüfen</button>`;
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const fd = new FormData(form);
    const errors = [];
    if (!fd.get('haushaltsgroesse')) errors.push('Haushaltsgröße fehlt');
    if (!fd.get('netto_monat')) errors.push('Netto-Einkommen fehlt');
    if (!fd.get('plz')) errors.push('PLZ fehlt');
    const file = form.querySelector('[name="poa_file"]').files[0];
    if (file) {
      const err = validateFile(file);
      if (err) errors.push(err);
    }
    const errorBox = document.getElementById('form-errors');
    if (errors.length) {
      errorBox.textContent = errors.join(', ');
      errorBox.style.display = 'block';
      errorBox.focus();
      return;
    }
    errorBox.textContent = '';
    localStorage.setItem('completionDate', Date.now());
    alert('Prüfung durchgeführt (Demo)');
  });
}

// ---------------- Data Deletion Timer (90d) ----------------
function initDeletionTimer() {
  const KEY = 'completionDate';
  const ts = localStorage.getItem(KEY);
  if (!ts) return;
  const retentionMs = 90 * 24 * 60 * 60 * 1000;
  const deletionDate = new Date(Number(ts) + retentionMs);
  const bannerId = 'deletion-banner';
  if (document.getElementById(bannerId)) return;
  const now = Date.now();
  if (deletionDate.getTime() - now < retentionMs) {
    const div = document.createElement('div');
    div.id = bannerId;
    div.className = 'consent-banner';
    div.innerHTML = `Ihre Daten werden am ${deletionDate.toLocaleDateString()} automatisch gelöscht. <button id="delete-now">Jetzt löschen</button>`;
    document.body.append(div);
    div.querySelector('#delete-now').addEventListener('click', () => {
      localStorage.clear();
      div.remove();
      alert('Daten gelöscht');
    });
  }
}

// ---------------- Upload MIME/Size Validation ----------------
function validateFile(file) {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowed.includes(file.type)) {
    return 'Nur PDF, JPEG oder PNG erlaubt';
  }
  if (file.size > 10 * 1024 * 1024) {
    return 'Datei größer als 10 MB';
  }
  return null;
}