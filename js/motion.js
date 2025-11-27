// js/motion.js

// 3D hover for featured card
(function () {
  const card = document.getElementById('feature3DCard');
  if (!card) return;

  const inner = card.querySelector('.card-3d-inner');
  if (!inner) return;

  function handleMove(e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const rotateY = ((x - midX) / midX) * 10;  // -10deg to 10deg
    const rotateX = -((y - midY) / midY) * 10;

    inner.style.transform =
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  }

  function resetTilt() {
    inner.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
  }

  card.addEventListener('mousemove', handleMove);
  card.addEventListener('mouseleave', resetTilt);
})();

// Scroll-based fade-in
(function () {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: if no observer support, just show everything
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.18
  });

  elements.forEach(el => observer.observe(el));
})();
