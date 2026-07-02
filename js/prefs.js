// Single source of truth for the default theme
const DEFAULT_THEME = 'dark';

// Apply theme + saved a11y prefs early (before first paint)
(function earlyApply() {
  try {
    const t = localStorage.getItem('theme') || DEFAULT_THEME;
    document.documentElement.dataset.theme = t;

    const raw = localStorage.getItem('a11y-settings-v1');
    if (raw) {
      const s = JSON.parse(raw);
      const b = document.body;
      b.dataset.cvd = s.cvd || 'none';
      b.dataset.blur = s.blur ? 'on' : 'off';
      b.dataset.largerText = s.largerText ? 'on' : 'off';
      b.dataset.highContrast = s.highContrast ? 'on' : 'off';
      b.dataset.reducedMotion = s.reducedMotion ? 'on' : 'off';
      b.dataset.dyslexiaFont = s.dyslexiaFont ? 'on' : 'off';
    }
  } catch {}
})();

// After partials render, wire up navbar + theme toggle
window.initShared = function initShared() {
  const toggle = document.getElementById('theme-toggle');
  const icon = toggle ? toggle.querySelector('i') : null;

  if (toggle && icon) {
    const current = localStorage.getItem('theme') || DEFAULT_THEME;
    document.documentElement.dataset.theme = current;
    icon.className = current === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

    toggle.onclick = () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      localStorage.setItem('theme', next);
    };
  }

  // Highlight current nav item
  const links = document.querySelectorAll('.navbar a[href]');
  const here = location.pathname;
  links.forEach(a => {
    const path = new URL(a.href).pathname;
    a.classList.toggle('active', here === path);
  });
};
