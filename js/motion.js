// js/motion.js

(function () {
  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smooth initial load: remove preload after first paint
  window.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => document.body.classList.remove("preload"));
  });

  // ---------- 3D hover for featured card ----------
  (function () {
    const card = document.getElementById("feature3DCard");
    if (!card) return;

    const inner = card.querySelector(".card-3d-inner");
    if (!inner) return;

    const canHover =
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (reduceMotion || !canHover) return;

    function handleMove(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;

      const rotateY = ((x - midX) / midX) * 8;
      const rotateX = -((y - midY) / midY) * 8;

      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    }

    function resetTilt() {
      inner.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
    }

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", resetTilt);
  })();

  // ---------- Reveal ----------
  (function () {
    document.querySelectorAll(".fade-in").forEach((el) => {
      if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "up");
    });

    const elements = document.querySelectorAll("[data-reveal]");
    if (!elements.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    document.body.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const delay = Number(el.getAttribute("data-delay") || 0);
          if (delay) el.style.transitionDelay = `${delay}ms`;

          el.classList.add("is-visible");
          obs.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
  })();
})();

// ---------- Navbar: mobile toggle (NO persistent highlight) ----------
function bindNavbar() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;
  if (navbar.dataset.bound === "true") return;
  navbar.dataset.bound = "true";

  const toggle = navbar.querySelector(".nav-toggle");
  const linksWrap = navbar.querySelector(".nav-links");
  if (!toggle || !linksWrap) return;

  function closeMenu() {
    if (!navbar.classList.contains("is-open")) return;
    navbar.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }

  // Safety: if any other script adds "active", remove it (hover-only design)
  function clearActiveStates() {
    navbar.querySelectorAll(".nav-links a.active").forEach((a) => a.classList.remove("active"));
  }
  clearActiveStates();

  toggle.addEventListener("click", () => {
    clearActiveStates();
    const open = navbar.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.innerHTML = open
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });

  // Close menu when clicking a link
  navbar.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    clearActiveStates();
    closeMenu();
  });

  // Close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    clearActiveStates();
    closeMenu();
  });

  // Close menu on hash change (clicking # links can change URL without full reload)
  window.addEventListener("hashchange", () => {
    clearActiveStates();
    closeMenu();
  });

  // If focus gets stuck on a link (keyboard nav), don't leave it looking "selected"
  navbar.addEventListener("focusin", () => clearActiveStates());
}

bindNavbar();

const previousInitShared = window.initShared;
window.initShared = function initSharedWithNavbar() {
  if (typeof previousInitShared === "function") previousInitShared();
  bindNavbar();
};
