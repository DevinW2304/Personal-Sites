// Basic parallax on mousemove + scroll, with reduced-motion support

(function () {
  const layers = Array.from(document.querySelectorAll('.parallax-layer'));
  if (!layers.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionEnabled = !prefersReduced.matches;

  const state = {
    mouseX: 0,
    mouseY: 0,
    scrollY: 0
  };

  function updateTransforms() {
    if (!motionEnabled) {
      layers.forEach(layer => {
        layer.style.transform = 'translate3d(0,0,0)';
      });
      return;
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    layers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth || '0');
      const offsetX = (state.mouseX - centerX) / centerX;
      const offsetY = (state.mouseY - centerY) / centerY;

      const translateX = -offsetX * depth * 20; // tweak intensity
      const translateY = (state.scrollY * depth * 0.3) + (-offsetY * depth * 20);

      layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });
  }

  function onMouseMove(e) {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    requestAnimationFrame(updateTransforms);
  }

  function onScroll() {
    state.scrollY = window.scrollY || window.pageYOffset || 0;
    requestAnimationFrame(updateTransforms);
  }

  if (!prefersReduced.matches) {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
  } else {
    updateTransforms();
  }

  // Watch for system preference changes
  prefersReduced.addEventListener('change', (event) => {
    motionEnabled = !event.matches;
    updateTransforms();
  });

  // Manual toggle button
  const toggleButton = document.getElementById('toggle-motion');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      motionEnabled = !motionEnabled;
      toggleButton.textContent = motionEnabled ? 'Toggle motion' : 'Enable motion';
      updateTransforms();
    });
  }

  // Initial render
  updateTransforms();
})();
