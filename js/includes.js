// Inject header/footer partials into placeholders
(async function loadPartials() {
  const zones = document.querySelectorAll('[data-include]');
  await Promise.all(Array.from(zones).map(async (el) => {
    const url = el.getAttribute('data-include');
    if (!url) return;
    const html = await fetch(url).then(r => r.text());
    el.outerHTML = html;
  }));
  // Re-bind shared interactions after header/footer render
  if (window.initShared) window.initShared();
})();
