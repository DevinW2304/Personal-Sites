// Parallax + motion toggle + splash + keyboard shortcut to enter main.html

(function () {
  const layers = Array.from(document.querySelectorAll('.parallax-layer'));
  const splash = document.querySelector('.splash');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionEnabled = !prefersReduced.matches;

  const state = {
    mouseX: 0,
    mouseY: 0,
    scrollY: 0
  };

  function updateTransforms() {
    if (!layers.length) return;

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
      const offsetX = (state.mouseX - centerX) / centerX || 0;
      const offsetY = (state.mouseY - centerY) / centerY || 0;

      const translateX = -offsetX * depth * 20;
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

  // Set up parallax listeners
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

  // Manual motion toggle
  const toggleButton = document.getElementById('toggle-motion');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      motionEnabled = !motionEnabled;
      toggleButton.textContent = motionEnabled ? 'Toggle motion' : 'Enable motion';
      updateTransforms();
    });
  }

  // Splash behavior: quick fade-out + click-to-dismiss
  function hideSplash() {
    if (!splash) return;
    if (splash.classList.contains('splash-hidden')) return;
    splash.classList.add('splash-hidden');
  }

  if (splash) {
    // Always allow user to click to skip immediately
    splash.addEventListener('click', hideSplash);

    // Respect reduced motion: no splash delay
    if (prefersReduced.matches) {
      hideSplash();
    } else {
      // Use DOMContentLoaded so it doesn't hang on slow 'load'
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(hideSplash, 900);
      });
    }
  }

  // Keyboard shortcut: Enter or Space navigates to main.html
  window.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const isTyping =
      active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');

    if (isTyping) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = 'main.html';
    }
  });

  // Initial render
  updateTransforms();
})();
