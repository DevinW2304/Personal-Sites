(function () {
  const form = document.getElementById('a11y-form');
  if (!form) return;

  const status = document.querySelector('.sr-status');
  const RESET_BTN = document.getElementById('a11y-reset');
  const KEY = 'a11y-settings-v1';
  const body = document.body;

  function apply(settings, announce = false) {
    body.dataset.cvd = settings.cvd || 'none';
    body.dataset.blur = settings.blur ? 'on' : 'off';
    body.dataset.largerText = settings.largerText ? 'on' : 'off';
    body.dataset.highContrast = settings.highContrast ? 'on' : 'off';
    body.dataset.reducedMotion = settings.reducedMotion ? 'on' : 'off';
    body.dataset.dyslexiaFont = settings.dyslexiaFont ? 'on' : 'off';
    localStorage.setItem(KEY, JSON.stringify(settings));
    if (announce && status) {
      status.textContent = 'Accessibility settings updated.';
      setTimeout(() => (status.textContent = ''), 1200);
    }
  }

  function readForm() {
    const fd = new FormData(form);
    return {
      cvd: (fd.get('cvd') || 'none'),
      blur: !!fd.get('blur'),
      largerText: !!fd.get('largerText'),
      highContrast: !!fd.get('highContrast'),
      reducedMotion: !!fd.get('reducedMotion'),
      dyslexiaFont: !!fd.get('dyslexiaFont'),
    };
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
  }

  // init from saved
  const saved = load();
  if (saved) {
    form.querySelectorAll('input[name="cvd"]').forEach(r => r.checked = (r.value === saved.cvd));
    form.querySelector('input[name="blur"]').checked = !!saved.blur;
    form.querySelector('input[name="largerText"]').checked = !!saved.largerText;
    form.querySelector('input[name="highContrast"]').checked = !!saved.highContrast;
    form.querySelector('input[name="reducedMotion"]').checked = !!saved.reducedMotion;
    form.querySelector('input[name="dyslexiaFont"]').checked = !!saved.dyslexiaFont;
    apply(saved);
  }

  form.addEventListener('change', () => apply(readForm(), true));
  RESET_BTN.addEventListener('click', () => {
    form.reset();
    form.querySelector('input[name="cvd"][value="none"]').checked = true;
    apply({ cvd:'none', blur:false, largerText:false, highContrast:false, reducedMotion:false, dyslexiaFont:false }, true);
  });
})();
