// js/a11y-global.js
(function () {
  const KEY = "a11y-settings-v1";

  function safeParse(v) {
    try { return JSON.parse(v); } catch { return null; }
  }

  function defaultSettings() {
    return {
      cvd: "none",
      blur: false,
      largerText: false,
      highContrast: false,
      reducedMotion: false,
      dyslexiaFont: false,
    };
  }

  function apply(settings) {
    const body = document.body;
    if (!body) return;

    const s = { ...defaultSettings(), ...(settings || {}) };

    // ✅ Use data attributes site-wide
    body.dataset.cvd = s.cvd || "none";
    body.dataset.blur = s.blur ? "on" : "off";
    body.dataset.largerText = s.largerText ? "on" : "off";
    body.dataset.highContrast = s.highContrast ? "on" : "off";
    body.dataset.reducedMotion = s.reducedMotion ? "on" : "off";
    body.dataset.dyslexiaFont = s.dyslexiaFont ? "on" : "off";
  }

  // Expose for other scripts (form page)
  window.__applyA11y = apply;
  window.__getA11y = function () {
    const saved = safeParse(localStorage.getItem(KEY) || "null");
    return saved || defaultSettings();
  };
  window.__setA11y = function (settings) {
    localStorage.setItem(KEY, JSON.stringify(settings));
    apply(settings);
  };
  window.__resetA11y = function () {
    const s = defaultSettings();
    localStorage.setItem(KEY, JSON.stringify(s));
    apply(s);
  };

  // ✅ Apply immediately on every page load
  document.addEventListener("DOMContentLoaded", () => {
    const saved = safeParse(localStorage.getItem(KEY) || "null");
    apply(saved || defaultSettings());
  });
})();
