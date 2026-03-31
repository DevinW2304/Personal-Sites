(function () {
  const KEY = "a11y-settings-v1";

  function defaults() {
    return {
      cvd: "none",
      blur: false,
      largerText: false,
      highContrast: false,
      reducedMotion: false,
      dyslexiaFont: false,
    };
  }

  function safeParse(value) {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function loadSettings() {
    try {
      return safeParse(localStorage.getItem(KEY) || "null") || defaults();
    } catch {
      return defaults();
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      // ignore storage failures
    }
  }

  function applySettings(settings) {
    const html = document.documentElement;
    const body = document.body;
    if (!html || !body) return;

    const s = { ...defaults(), ...(settings || {}) };

    const applyToElement = (el) => {
      el.dataset.cvd = s.cvd || "none";
      el.dataset.blur = s.blur ? "on" : "off";
      el.dataset.largerText = s.largerText ? "on" : "off";
      el.dataset.highContrast = s.highContrast ? "on" : "off";
      el.dataset.reducedMotion = s.reducedMotion ? "on" : "off";
      el.dataset.dyslexiaFont = s.dyslexiaFont ? "on" : "off";

      el.classList.toggle("a11y-larger-text", !!s.largerText);
      el.classList.toggle("a11y-high-contrast", !!s.highContrast);
      el.classList.toggle("a11y-reduced-motion", !!s.reducedMotion);
      el.classList.toggle("a11y-dyslexia-font", !!s.dyslexiaFont);
    };

    applyToElement(html);
    applyToElement(body);

    if (s.reducedMotion) {
      html.style.scrollBehavior = "auto";
    } else {
      html.style.scrollBehavior = "";
    }
  }

  function updateSettings(settings) {
    const merged = { ...defaults(), ...(settings || {}) };
    saveSettings(merged);
    applySettings(merged);
  }

  function syncForm(form, settings) {
    const s = { ...defaults(), ...(settings || {}) };

    form.querySelectorAll('input[name="cvd"]').forEach((radio) => {
      radio.checked = radio.value === s.cvd;
    });

    const setChecked = (name, value) => {
      const input = form.querySelector(`input[name="${name}"]`);
      if (input) input.checked = !!value;
    };

    setChecked("blur", s.blur);
    setChecked("largerText", s.largerText);
    setChecked("highContrast", s.highContrast);
    setChecked("reducedMotion", s.reducedMotion);
    setChecked("dyslexiaFont", s.dyslexiaFont);
  }

  function readForm(form) {
    const fd = new FormData(form);

    return {
      cvd: fd.get("cvd") || "none",
      blur: !!fd.get("blur"),
      largerText: !!fd.get("largerText"),
      highContrast: !!fd.get("highContrast"),
      reducedMotion: !!fd.get("reducedMotion"),
      dyslexiaFont: !!fd.get("dyslexiaFont"),
    };
  }

  function announce(statusEl, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    window.setTimeout(() => {
      statusEl.textContent = "";
    }, 1200);
  }

  function initLabForm() {
    const form = document.getElementById("a11y-form");
    if (!form) return;

    const status = document.querySelector(".sr-status");
    const resetBtn = document.getElementById("a11y-reset");

    const current = loadSettings();
    syncForm(form, current);
    applySettings(current);

    form.addEventListener("change", () => {
      const next = readForm(form);
      updateSettings(next);
      announce(status, "Accessibility settings updated.");
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        const resetValues = defaults();
        form.reset();
        syncForm(form, resetValues);
        updateSettings(resetValues);
        announce(status, "Accessibility settings reset.");
      });
    }
  }

  window.__getA11y = loadSettings;
  window.__setA11y = updateSettings;
  window.__resetA11y = function () {
    updateSettings(defaults());
  };

  document.addEventListener("DOMContentLoaded", () => {
    const current = loadSettings();
    applySettings(current);
    initLabForm();
  });
})();