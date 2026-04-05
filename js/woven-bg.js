/**
 * woven-bg.js
 * Woven torus-knot particle system adapted for the portfolio main page.
 * - Fixed canvas behind the entire page
 * - Warm amber / rust / gold particle palette (matches --accent: #B85C30)
 * - Mouse interaction: particles scatter and spring back
 * - Reduced to 18 000 particles + flat-array math to avoid GC pressure
 * - Respects prefers-reduced-motion
 */

import * as THREE from 'three';

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Canvas ─────────────────────────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.id = 'woven-canvas';
  document.body.prepend(canvas);

  /* ── Scene / Camera / Renderer ──────────────────────────────────────── */
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5.5;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  /* ── Torus-knot source geometry ─────────────────────────────────────── */
  const sourceGeo  = new THREE.TorusKnotGeometry(1.8, 0.52, 220, 34);
  const srcPos     = sourceGeo.attributes.position;

  /* ── Particle buffers ───────────────────────────────────────────────── */
  const COUNT = 18_000;

  const positions  = new Float32Array(COUNT * 3);
  const origins    = new Float32Array(COUNT * 3);   // rest positions
  const velocities = new Float32Array(COUNT * 3);
  const colors     = new Float32Array(COUNT * 3);

  // Warm palette: amber / rust / gold / cream  (hue 0.02 – 0.13)
  const PALETTE = [
    { h: 0.06, s: 0.92, l: 0.68 },   // bright amber
    { h: 0.04, s: 0.80, l: 0.55 },   // deep rust
    { h: 0.10, s: 0.85, l: 0.72 },   // warm gold
    { h: 0.08, s: 0.70, l: 0.82 },   // pale cream-gold
    { h: 0.03, s: 0.75, l: 0.50 },   // dark ember
    { h: 0.12, s: 0.65, l: 0.78 },   // light saffron
  ];

  const tmpColor = new THREE.Color();

  for (let i = 0; i < COUNT; i++) {
    const vi  = (i % srcPos.count);
    const x   = srcPos.getX(vi);
    const y   = srcPos.getY(vi);
    const z   = srcPos.getZ(vi);

    origins[i*3]   = positions[i*3]   = x;
    origins[i*3+1] = positions[i*3+1] = y;
    origins[i*3+2] = positions[i*3+2] = z;

    const p = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    // Slight hue jitter per particle so the shape has depth
    tmpColor.setHSL(p.h + (Math.random() - 0.5) * 0.04, p.s, p.l);
    colors[i*3]   = tmpColor.r;
    colors[i*3+1] = tmpColor.g;
    colors[i*3+2] = tmpColor.b;
  }

  /* ── BufferGeometry ─────────────────────────────────────────────────── */
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions,  3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,     3));

  const mat = new THREE.PointsMaterial({
    size:         0.022,
    vertexColors: true,
    blending:     THREE.AdditiveBlending,
    transparent:  true,
    opacity:      0.82,
    depthWrite:   false,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  /* ── Mouse ──────────────────────────────────────────────────────────── */
  const mouse    = { x: 0, y: 0 };
  const mouseW   = new THREE.Vector3();   // reused each frame

  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth)  *  2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * -2 + 1;
  }, { passive: true });

  /* ── Scroll — rotate the knot slowly as user scrolls ───────────────── */
  let scrollRatio = 0;
  window.addEventListener('scroll', () => {
    scrollRatio = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  }, { passive: true });

  /* ── Animation loop ─────────────────────────────────────────────────── */
  const PUSH_RADIUS  = 1.4;
  const PUSH_FORCE   = 0.012;
  const RETURN_FORCE = 0.0012;
  const DAMPING      = 0.94;

  let animId;

  function animate() {
    animId = requestAnimationFrame(animate);
    const t = performance.now() * 0.001;

    /* Mouse in world space */
    mouseW.set(mouse.x * 4, mouse.y * 4, 0);

    /* Per-particle physics — flat array, no Vector3 allocation in loop */
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3, iy = ix + 1, iz = ix + 2;

      const px = positions[ix], py = positions[iy], pz = positions[iz];
      let   vx = velocities[ix], vy = velocities[iy], vz = velocities[iz];

      /* Push away from mouse */
      const dx = px - mouseW.x;
      const dy = py - mouseW.y;
      const dz = pz - mouseW.z;
      const dist2 = dx*dx + dy*dy + dz*dz;

      if (dist2 < PUSH_RADIUS * PUSH_RADIUS) {
        const dist = Math.sqrt(dist2) || 0.0001;
        const f    = (PUSH_RADIUS - dist) * PUSH_FORCE / dist;
        vx += dx * f;
        vy += dy * f;
        vz += dz * f;
      }

      /* Spring back to origin */
      vx += (origins[ix] - px) * RETURN_FORCE;
      vy += (origins[iy] - py) * RETURN_FORCE;
      vz += (origins[iz] - pz) * RETURN_FORCE;

      /* Damping */
      vx *= DAMPING; vy *= DAMPING; vz *= DAMPING;

      positions[ix]   = px + vx;
      positions[iy]   = py + vy;
      positions[iz]   = pz + vz;
      velocities[ix]  = vx;
      velocities[iy]  = vy;
      velocities[iz]  = vz;
    }

    geo.attributes.position.needsUpdate = true;

    /* Slow rotation — scroll nudges extra tilt */
    points.rotation.y = t * 0.04 + scrollRatio * Math.PI * 0.5;
    points.rotation.x = Math.sin(t * 0.018) * 0.18 + scrollRatio * 0.3;

    renderer.render(scene, camera);
  }

  animate();

  /* ── Resize ─────────────────────────────────────────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 120);
  });

  /* ── Pause when tab hidden ──────────────────────────────────────────── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else animate();
  });
})();