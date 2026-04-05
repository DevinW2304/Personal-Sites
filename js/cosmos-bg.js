/**
 * cosmos-bg.js
 * Three.js scrolling space background — stars, nebula, mountains.
 * Warm amber/rust palette to complement the portfolio theme.
 * Respects prefers-reduced-motion. No external dependencies beyond three.js.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

(function () {
  /* ── Reduced-motion bail-out ────────────────────────────────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Canvas ─────────────────────────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.id = 'cosmos-canvas';
  document.body.prepend(canvas);

  /* ── Scene ──────────────────────────────────────────────────────────── */
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.00025);

  /* ── Camera ─────────────────────────────────────────────────────────── */
  const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 2000
  );
  camera.position.set(0, 20, 100);

  /* Smooth camera state */
  const camSmooth = { x: 0, y: 20, z: 100 };
  let   camTarget = { x: 0, y: 20, z: 100 };

  /* ── Renderer ───────────────────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  /* ── Post-processing (bloom) ────────────────────────────────────────── */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.75, 0.35, 0.88
  );
  composer.addPass(bloom);

  /* ══════════════════════════════════════════════════════════════════════
     STAR FIELD  — three depth layers, warm star tints
  ══════════════════════════════════════════════════════════════════════ */
  const starLayers = [];

  for (let layer = 0; layer < 3; layer++) {
    const COUNT = 4500;
    const pos  = new Float32Array(COUNT * 3);
    const col  = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);

    for (let j = 0; j < COUNT; j++) {
      const r     = 200 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(Math.random() * 2 - 1);

      pos[j*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[j*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[j*3+2] = r * Math.cos(phi);

      const c = new THREE.Color();
      const t = Math.random();
      if      (t < 0.65) c.setHSL(0,    0,   0.82 + Math.random() * 0.18);  // white
      else if (t < 0.85) c.setHSL(0.07, 0.6, 0.82);                          // amber
      else               c.setHSL(0.05, 0.4, 0.72);                          // rust
      col[j*3] = c.r; col[j*3+1] = c.g; col[j*3+2] = c.b;

      size[j] = Math.random() * 2 + 0.4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,  3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col,  3));
    geo.setAttribute('size',     new THREE.BufferAttribute(size, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time:  { value: 0 },
        depth: { value: layer }
      },
      vertexShader: /* glsl */`
        attribute float size;
        attribute vec3  color;
        varying   vec3  vColor;
        uniform   float time;
        uniform   float depth;

        void main() {
          vColor = color;
          vec3 p = position;
          float angle = time * 0.04 * (1.0 - depth * 0.3);
          mat2  rot   = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          p.xy = rot * p.xy;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = size * (300.0 / -mv.z);
          gl_Position  = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = 1.0 - smoothstep(0.0, 0.5, d);
          gl_FragColor = vec4(vColor, a);
        }`,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false
    });

    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    starLayers.push(pts);
  }

  /* ══════════════════════════════════════════════════════════════════════
     NEBULA  — warm amber/rust to echo the portfolio palette
  ══════════════════════════════════════════════════════════════════════ */
  const nebulaMat = new THREE.ShaderMaterial({
    uniforms: {
      time:    { value: 0 },
      color1:  { value: new THREE.Color(0xb8653a) },   // amber
      color2:  { value: new THREE.Color(0x4a1008) },   // deep rust
      opacity: { value: 0.22 }
    },
    vertexShader: /* glsl */`
      varying vec2  vUv;
      varying float vElev;
      uniform float time;
      void main() {
        vUv = uv;
        vec3 p = position;
        float e = sin(p.x * 0.01 + time) * cos(p.y * 0.01 + time) * 20.0;
        p.z += e;
        vElev = e;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3  color1;
      uniform vec3  color2;
      uniform float opacity;
      uniform float time;
      varying vec2  vUv;
      varying float vElev;
      void main() {
        float mf  = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
        vec3  col = mix(color1, color2, mf * 0.5 + 0.5);
        float a   = opacity * (1.0 - length(vUv - 0.5) * 2.0);
        a *= 1.0 + vElev * 0.01;
        gl_FragColor = vec4(col, max(a, 0.0));
      }`,
    transparent: true,
    blending:    THREE.AdditiveBlending,
    side:        THREE.DoubleSide,
    depthWrite:  false
  });

  const nebula = new THREE.Mesh(
    new THREE.PlaneGeometry(8000, 4000, 80, 80),
    nebulaMat
  );
  nebula.position.z = -900;
  scene.add(nebula);

  /* ══════════════════════════════════════════════════════════════════════
     MOUNTAINS  — four dark silhouette layers
  ══════════════════════════════════════════════════════════════════════ */
  const mountainLayers = [];
  const MOUNTAIN_DEFS = [
    { z: -50,  h: 55,  color: 0x120d09, opacity: 1.0 },
    { z: -100, h: 75,  color: 0x1a1108, opacity: 0.85 },
    { z: -155, h: 95,  color: 0x1e1510, opacity: 0.65 },
    { z: -210, h: 115, color: 0x231a13, opacity: 0.45 },
  ];

  MOUNTAIN_DEFS.forEach(({ z, h, color, opacity }) => {
    const pts = [];
    const SEG = 60;

    for (let i = 0; i <= SEG; i++) {
      const x = (i / SEG - 0.5) * 1200;
      const y = Math.sin(i * 0.12) * h
              + Math.sin(i * 0.06) * h * 0.5
              + (Math.random() * h * 0.18) - 110;
      pts.push(new THREE.Vector2(x, y));
    }
    pts.push(new THREE.Vector2(6000, -400));
    pts.push(new THREE.Vector2(-6000, -400));

    const mesh = new THREE.Mesh(
      new THREE.ShapeGeometry(new THREE.Shape(pts)),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide })
    );
    mesh.position.set(0, z * 0.5, z);
    mesh.userData.baseZ = z;
    scene.add(mesh);
    mountainLayers.push(mesh);
  });

  /* ══════════════════════════════════════════════════════════════════════
     ATMOSPHERE  — subtle rim glow
  ══════════════════════════════════════════════════════════════════════ */
  const atmMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vNormal;
      uniform float time;
      void main() {
        float i   = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec3  col = vec3(0.72, 0.38, 0.15) * i;   // warm amber rim
        float p   = sin(time * 1.5) * 0.08 + 0.92;
        col *= p;
        gl_FragColor = vec4(col, i * 0.2);
      }`,
    side:        THREE.BackSide,
    blending:    THREE.AdditiveBlending,
    transparent: true
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(580, 32, 32), atmMat));

  /* ══════════════════════════════════════════════════════════════════════
     SCROLL  — gentle camera drift on mobile (desktop intro doesn't scroll)
  ══════════════════════════════════════════════════════════════════════ */
  const CAM_POSITIONS = [
    { x: 0, y: 20,  z: 100 },
    { x: 0, y: 35,  z: -50 },
    { x: 0, y: 50,  z: -650 },
  ];

  function onScroll() {
    const scrollY  = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const progress  = Math.min(scrollY / maxScroll, 1);
    const total     = progress * (CAM_POSITIONS.length - 1);
    const idx       = Math.min(Math.floor(total), CAM_POSITIONS.length - 2);
    const frac      = total - idx;
    const A = CAM_POSITIONS[idx];
    const B = CAM_POSITIONS[idx + 1];

    camTarget.x = A.x + (B.x - A.x) * frac;
    camTarget.y = A.y + (B.y - A.y) * frac;
    camTarget.z = A.z + (B.z - A.z) * frac;

    // mountains parallax
    mountainLayers.forEach((m, i) => {
      const speed = 1 + i * 0.9;
      m.position.z = m.userData.baseZ + scrollY * speed * 0.4;
    });
    nebula.position.z = mountainLayers[3].position.z - 100;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ══════════════════════════════════════════════════════════════════════
     ANIMATION LOOP
  ══════════════════════════════════════════════════════════════════════ */
  let animId;

  function animate() {
    animId = requestAnimationFrame(animate);
    const t = performance.now() * 0.001;

    /* update shader uniforms */
    starLayers.forEach(s => { s.material.uniforms.time.value = t; });
    nebulaMat.uniforms.time.value = t * 0.45;
    atmMat.uniforms.time.value    = t;

    /* smooth camera */
    const ease = 0.04;
    camSmooth.x += (camTarget.x - camSmooth.x) * ease;
    camSmooth.y += (camTarget.y - camSmooth.y) * ease;
    camSmooth.z += (camTarget.z - camSmooth.z) * ease;

    camera.position.x = camSmooth.x + Math.sin(t * 0.09) * 1.8;
    camera.position.y = camSmooth.y + Math.cos(t * 0.12) * 0.9;
    camera.position.z = camSmooth.z;
    camera.lookAt(0, 8, -500);

    /* subtle mountain float */
    mountainLayers.forEach((m, i) => {
      m.position.x = Math.sin(t * 0.09) * 2 * (1 + i * 0.4);
    });

    composer.render();
  }

  animate();

  /* ══════════════════════════════════════════════════════════════════════
     RESIZE
  ══════════════════════════════════════════════════════════════════════ */
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 120);
  });

  /* ══════════════════════════════════════════════════════════════════════
     INTERSECTION OBSERVER  — pause when tab hidden / page not visible
  ══════════════════════════════════════════════════════════════════════ */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animate();
    }
  });
})();