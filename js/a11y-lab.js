(function () {
  const form = document.getElementById("a11y-form");
  if (!form) return;

  const status = document.querySelector(".sr-status");
  const RESET_BTN = document.getElementById("a11y-reset");
  const KEY = "a11y-settings-v1";

  function announce(msg) {
    if (!status) return;
    status.textContent = msg;
    setTimeout(() => (status.textContent = ""), 1200);
  }

  function readForm() {
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

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
  }

  function apply(settings, shouldAnnounce = false) {
    // ✅ Save + apply globally
    localStorage.setItem(KEY, JSON.stringify(settings));

    // Prefer global applier if present
    if (typeof window.__applyA11y === "function") {
      window.__applyA11y(settings);
    } else {
      // fallback
      document.body.dataset.cvd = settings.cvd || "none";
      document.body.dataset.blur = settings.blur ? "on" : "off";
      document.body.dataset.largerText = settings.largerText ? "on" : "off";
      document.body.dataset.highContrast = settings.highContrast ? "on" : "off";
      document.body.dataset.reducedMotion = settings.reducedMotion ? "on" : "off";
      document.body.dataset.dyslexiaFont = settings.dyslexiaFont ? "on" : "off";
    }

    if (shouldAnnounce) announce("Accessibility settings updated.");
  }

  // init from saved
  const saved = load();
  if (saved) {
    form.querySelectorAll('input[name="cvd"]').forEach((r) => {
      r.checked = r.value === (saved.cvd || "none");
    });

    const setChecked = (name, val) => {
      const el = form.querySelector(`input[name="${name}"]`);
      if (el) el.checked = !!val;
    };

    setChecked("blur", saved.blur);
    setChecked("largerText", saved.largerText);
    setChecked("highContrast", saved.highContrast);
    setChecked("reducedMotion", saved.reducedMotion);
    setChecked("dyslexiaFont", saved.dyslexiaFont);

    apply(saved);
  } else {
    // Ensure defaults applied
    apply({ cvd: "none", blur: false, largerText: false, highContrast: false, reducedMotion: false, dyslexiaFont: false });
  }

  form.addEventListener("change", () => apply(readForm(), true));

  if (RESET_BTN) {
    RESET_BTN.addEventListener("click", () => {
      form.reset();
      const none = form.querySelector('input[name="cvd"][value="none"]');
      if (none) none.checked = true;
      const defaults = { cvd: "none", blur: false, largerText: false, highContrast: false, reducedMotion: false, dyslexiaFont: false };
      apply(defaults, true);
    });
  }
})();
