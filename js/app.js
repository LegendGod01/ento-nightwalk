/* ════════════════════════════════════════════════════════════
   ENTO NIGHTWALK — app.js  ·  v3.0 KAGE-GRADE REBUILD
   Procedural night-temple scrollytelling engine — original code.
   © ENTOURAGED.SAM (LegendGod01). All rights reserved.
   ════════════════════════════════════════════════════════════ */
(() => {
"use strict";
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const W = () => innerWidth, H = () => innerHeight;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ── CORE ──────────────────────────────────────────────────── */
const DPR = Math.min(devicePixelRatio || 1, 1.75);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('stage'), antialias: DPR < 1.6, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(DPR);
renderer.setSize(W(), H());
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070b12, 0.017);

const camera = new THREE.PerspectiveCamera(36, W() / H(), .35, 320);

/* ── LIGHTS ────────────────────────────────────────────────── */
scene.add(new THREE.HemisphereLight(0x35486a, 0x070b12, .72));
const moonlight = new THREE.DirectionalLight(0xc2d4f5, .55);
moonlight.position.set(-28, 44, -30); scene.add(moonlight);
const gateGlow = new THREE.PointLight(0xff5a3c, 1.0, 30, 2);

/* ── PROCEDURAL TEXTURE LIBRARY (canvas-drawn, zero assets) ── */
function canvasTex(size, painter, repeat) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  painter(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
  return t;
}
function speckle(x, s, base, amt, n) {
  x.fillStyle = base; x.fillRect(0, 0, s, s);
  for (let i = 0; i < n; i++) {
    x.fillStyle = `rgba(${8 + Math.random() * amt | 0},${10 + Math.random() * amt | 0},${14 + Math.random() * amt | 0},${.06 + Math.random() * .22})`;
    x.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 2.4, 1 + Math.random() * 2.4);
  }
}
const TEX = {
  stone: canvasTex(256, (x, s) => {
    speckle(x, s, '#565e66', 70, 2600);
    for (let i = 0; i < 7; i++) { x.strokeStyle = 'rgba(0,0,0,.16)'; x.beginPath(); x.moveTo(Math.random() * s, Math.random() * s); x.lineTo(Math.random() * s, Math.random() * s); x.stroke(); }
  }, 3),
  wood: canvasTex(256, (x, s) => {
    x.fillStyle = '#2e2620'; x.fillRect(0, 0, s, s);
    for (let plank = 0; plank < 8; plank++) {
      x.fillStyle = `rgb(${40 + Math.random() * 14 | 0},${33 + Math.random() * 12 | 0},${26 + Math.random() * 8 | 0})`;
      x.fillRect(0, plank * s / 8, s, s / 8 - 2);
      x.strokeStyle = 'rgba(0,0,0,.35)';
      for (let i = 0; i < 6; i++) { x.beginPath(); const yy = plank * s / 8 + Math.random() * s / 8; x.moveTo(0, yy); x.bezierCurveTo(s * .3, yy + 3, s * .6, yy - 3, s, yy); x.stroke(); }
    }
  }, 2),
  lacquer: canvasTex(128, (x, s) => {
    speckle(x, s, '#8c1f16', 30, 700);
    x.fillStyle = 'rgba(255,120,90,.06)';
    for (let i = 0; i < 20; i++) x.fillRect(Math.random() * s, Math.random() * s, 8, 1);
  }),
  shoji: canvasTex(128, (x, s) => {
    x.fillStyle = '#ffce8a'; x.fillRect(0, 0, s, s);
    x.strokeStyle = 'rgba(60,30,8,.85)'; x.lineWidth = 5;
    for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * s / 4, 0); x.lineTo(i * s / 4, s); x.stroke(); x.beginPath(); x.moveTo(0, i * s / 4); x.lineTo(s, i * s / 4); x.stroke(); }
  }),
  roof: canvasTex(256, (x, s) => {
    speckle(x, s, '#232a33', 40, 900);
    x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 2;
    for (let r = 0; r < 10; r++) { x.beginPath(); x.moveTo(0, r * s / 10); x.lineTo(s, r * s / 10); x.stroke(); }
    for (let c = 0; c < 16; c++) { x.beginPath(); x.moveTo(c * s / 16, 0); x.lineTo(c * s / 16, s); x.stroke(); }
  }, 2),
  sky: canvasTex(512, (x, s) => {
    const g = x.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#02040a'); g.addColorStop(.55, '#0a1524'); g.addColorStop(1, '#101c2e');
    x.fillStyle = g; x.fillRect(0, 0, s, s);
    for (let i = 0; i < 420; i++) { x.fillStyle = `rgba(190,210,240,${.12 + Math.random() * .5})`; x.fillRect(Math.random() * s, Math.random() * s * .8, 1.2, 1.2); }
  }),
  glow: canvasTex(128, (x, s) => {
    const g = x.createRadialGradient(s / 2, s / 2, 4, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(224,35,28,.55)'); g.addColorStop(1, 'rgba(224,35,28,0)');
    x.fillStyle = g; x.fillRect(0, 0, s, s);
  }),
  wisp: canvasTex(128, (x, s) => {
    const g = x.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(180,200,225,.5)'); g.addColorStop(1, 'rgba(180,200,225,0)');
    x.fillStyle = g; x.fillRect(0, 0, s, s);
  }),
  still: (kind) => canvasTex(320, (x, s) => {
    const g = x.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#0b1424'); g.addColorStop(.7, '#182234'); g.addColorStop(1, '#04060c');
    x.fillStyle = g; x.fillRect(0, 0, s, s);
    x.fillStyle = '#e0231c'; x.beginPath(); x.arc(s * (kind === 0 ? .3 : .72), s * .26, s * .11, 0, 7); x.fill();
    x.fillStyle = 'rgba(224,35,28,.14)'; x.beginPath(); x.arc(s * (kind === 0 ? .3 : .72), s * .26, s * .2, 0, 7); x.fill();
    x.strokeStyle = 'rgba(5,7,10,.95)';
    if (kind === 0) {
      x.lineWidth = 10; x.beginPath(); x.moveTo(s * .3, s); x.lineTo(s * .3, s * .34); x.moveTo(s * .7, s); x.lineTo(s * .7, s * .34); x.stroke();
      x.lineWidth = 7; x.beginPath(); x.moveTo(s * .16, s * .3); x.lineTo(s * .84, s * .28); x.stroke();
    } else if (kind === 1) {
      x.lineWidth = 3;
      for (let i = 0; i < 4; i++) { const px = s * (.2 + i * .18); x.strokeRect(px - 5, s * .62 + i * s * .09, 10, 14); }
      x.fillStyle = '#ffb066'; for (let i = 0; i < 4; i++) x.fillRect(s * (.2 + i * .18) - 2, s * .63 + i * s * .09, 4, 4);
    } else {
      x.lineWidth = 4;
      for (let i = 0; i < 5; i++) { const w = s * (.5 - i * .07); x.strokeRect(s / 2 - w / 2, s * (.72 - i * .11), w, s * .07); }
    }
    for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(200,215,235,${.1 + Math.random() * .4})`; x.fillRect(Math.random() * s, Math.random() * s * .5, 1, 1); }
  })
};

/* ── MATERIALS ─────────────────────────────────────────────── */
const MAT = {
  stone:  new THREE.MeshStandardMaterial({ map: TEX.stone, color: 0x6b737b, roughness: .94, metalness: .02 }),
  wood:   new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0x6a5a48, roughness: .88, metalness: .02 }),
  lacquer:new THREE.MeshStandardMaterial({ map: TEX.lacquer, color: 0xffffff, roughness: .55, metalness: .08, emissive: 0x2a0603 }),
  shoji:  new THREE.MeshBasicMaterial({ map: TEX.shoji, toneMapped: false }),
  roof:   new THREE.MeshStandardMaterial({ map: TEX.roof, color: 0x8a97a5, roughness: .9 }),
  dark:   new THREE.MeshStandardMaterial({ color: 0x171e26, roughness: .95 }),
  gold:   new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: .4, metalness: .7 })
};

/* ── WORLD: ground / mountains / sky dome ──────────────────── */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), MAT.stone.clone());
ground.material.map.repeat.set(26, 26);
ground.rotation.x = -Math.PI / 2; scene.add(ground);

(function ring() {
  const g = new THREE.ConeGeometry(1, 1, 7), grp = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2, r = 95 + Math.random() * 70;
    const m = new THREE.Mesh(g, MAT.dark);
    m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r - 30);
    m.scale.set(24 + Math.random() * 30, 26 + Math.random() * 46, 24 + Math.random() * 30);
    grp.add(m);
  } scene.add(grp);
})();

const sky = new THREE.Mesh(new THREE.SphereGeometry(190, 24, 16),
  new THREE.MeshBasicMaterial({ map: TEX.sky, side: THREE.BackSide, fog: false, toneMapped: false }));
scene.add(sky);

/* ── MOON ──────────────────────────────────────────────────── */
const moon = new THREE.Mesh(new THREE.CircleGeometry(17, 48), new THREE.MeshBasicMaterial({ color: 0xe0231c, toneMapped: false, fog: false }));
moon.position.set(-34, 40, -150); scene.add(moon);
const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
moonGlow.scale.set(95, 95, 1); moonGlow.position.copy(moon.position); scene.add(moonGlow);

/* ── TORII ─────────────────────────────────────────────────── */
const torii = new THREE.Group();
(function buildTorii() {
  const legG = new THREE.CylinderGeometry(.5, .62, 9, 12);
  [-3.4, 3.4].forEach(px => { const leg = new THREE.Mesh(legG, MAT.lacquer); leg.position.set(px, 4.5, 0); torii.add(leg); });
  const top = new THREE.Mesh(new THREE.BoxGeometry(10.4, .7, 1.5), MAT.lacquer); top.position.y = 9.4; top.rotation.z = -.015; torii.add(top);
  const top2 = new THREE.Mesh(new THREE.BoxGeometry(11.2, .32, 1.8), MAT.lacquer); top2.position.y = 10.05; torii.add(top2);
  const mid = new THREE.Mesh(new THREE.BoxGeometry(9.2, .5, .9), MAT.lacquer); mid.position.y = 7.3; torii.add(mid);
})();
torii.position.set(0, 0, 30); scene.add(torii);
gateGlow.position.set(0, 6, 32); scene.add(gateGlow);

/* ── SANMON (wood shell, shoji, layered roof + ridge) ──────── */
function buildTemple() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(18, 1.4, 12), MAT.stone); base.position.y = .7; g.add(base);
  const body = new THREE.Mesh(new THREE.BoxGeometry(15, 6.4, 9.5), MAT.wood); body.position.y = 4.6; g.add(body);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j += 2) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), MAT.shoji);
    win.position.set(i * 4.4, 4.8, j * 4.78); if (j < 0) win.rotation.y = Math.PI; g.add(win);
  }
  for (let i = -2; i <= 2; i++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.42, .46, 6.6, 10), MAT.lacquer);
    post.position.set(i * 3.2, 4.5, 4.5); g.add(post);
  }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(13.4, 3.2, 4), MAT.roof);
  roof.rotation.y = Math.PI / 4; roof.position.y = 9.2; roof.scale.z = .78; g.add(roof);
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(17.6, .5, .8), MAT.wood);
  ridge.position.y = 10.55; ridge.scale.z = .78; g.add(ridge);
  return g;
}
const sanmon = buildTemple(); sanmon.position.set(0, 0, 12); scene.add(sanmon);
const hallLight = new THREE.PointLight(0xffb066, 2.6, 42, 2); hallLight.position.set(0, 5, 14); scene.add(hallLight);

/* ── PAGODA ────────────────────────────────────────────────── */
function buildPagoda() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(11, 1.2, 11), MAT.stone); base.position.y = .6; g.add(base);
  let y = 1.2;
  for (let tier = 0; tier < 5; tier++) {
    const w = 7.6 - tier * 1.06;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, 3.1, w), MAT.wood); body.position.y = y + 1.55; g.add(body);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(w * .34, 1.5), MAT.shoji); win.position.set(0, y + 1.7, w / 2 + .02); g.add(win);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 1.16, 1.7, 4), MAT.roof);
    roof.rotation.y = Math.PI / 4; roof.position.y = y + 3.95; g.add(roof);
    y += 4.7;
  }
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(.14, .3, 5.4, 8), MAT.gold); spire.position.y = y + 2.4; g.add(spire);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.5, 12, 12), MAT.gold); orb.position.y = y + 4.4; g.add(orb);
  return g;
}
const pagoda = buildPagoda(); pagoda.position.set(-14, 0, -26); scene.add(pagoda);
const pagodaLight = new THREE.PointLight(0xffc074, 1.6, 34, 2); pagodaLight.position.set(-13, 8, -21); scene.add(pagodaLight);

/* ── LANTERNS ──────────────────────────────────────────────── */
function makeLantern(h) {
  const g = new THREE.Group();
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(.5, .66, .7, 8), MAT.stone); ped.position.y = .35; g.add(ped);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.2, .26, h, 8), MAT.stone); post.position.y = .7 + h / 2; g.add(post);
  const house = new THREE.Mesh(new THREE.BoxGeometry(1, .9, 1), MAT.stone); house.position.y = .7 + h + .45; g.add(house);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(.56, .5), new THREE.MeshBasicMaterial({ color: 0xffc987, toneMapped: false }));
  win.position.set(0, .7 + h + .45, .51); g.add(win);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(.92, .5, 4), MAT.roof); cap.rotation.y = Math.PI / 4; cap.position.y = .7 + h + 1.12; g.add(cap);
  const light = new THREE.PointLight(0xffb066, .95, 13, 2); light.position.set(0, .7 + h + .5, 0); g.add(light);
  g.userData.flicker = light;
  return g;
}
const lanterns = [];
[[6, 9], [-6, 4], [7, -2], [-7, -8], [8, -16], [-8, -24], [9, -34], [-9, -44], [10, -54]].forEach(([px, pz], i) => {
  const L = makeLantern(1.1 + (i % 2) * .3); L.position.set(px, 0, pz); scene.add(L); lanterns.push(L);
});

/* ── TREES ─────────────────────────────────────────────────── */
function sakura(x, z, s = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.16 * s, .3 * s, 3.4 * s, 7), MAT.wood); trunk.position.y = 1.7 * s; trunk.rotation.z = (Math.random() - .5) * .2; g.add(trunk);
  const bm = new THREE.MeshStandardMaterial({ color: 0x8d5a74, roughness: .95, emissive: 0x1c0d18 });
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry((.9 + Math.random() * .9) * s, 8, 8), bm);
    b.position.set((Math.random() - .5) * 2.6 * s, (3 + Math.random() * 1.6) * s, (Math.random() - .5) * 2.6 * s); g.add(b);
  }
  g.position.set(x, 0, z); g.rotation.y = Math.random() * 6.28; scene.add(g);
}
function pine(x, z, s = 1) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.CylinderGeometry(.2 * s, .34 * s, 2.2 * s, 7), MAT.wood); t.position.y = 1.1 * s; g.add(t);
  const cm = new THREE.MeshStandardMaterial({ color: 0x1d2a22, roughness: .96 });
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry((2.2 - i * .6) * s, 2.6 * s, 8), cm);
    c.position.y = (2.4 + i * 1.7) * s; g.add(c);
  }
  g.position.set(x, 0, z); g.rotation.y = Math.random() * 6.28; scene.add(g);
}
[[-13, 22], [-18, 14], [14, 18], [17, 6], [-16, -4], [19, -12], [-20, -20], [22, -30], [-24, -40], [25, -52]].forEach(([x, z], i) => i % 2 ? pine(x, z, .9 + Math.random() * .7) : sakura(x, z, .9 + Math.random() * .8));

/* ── STONE PATH ────────────────────────────────────────────── */
(function path() {
  const geo = new THREE.BoxGeometry(1.5, .22, 1.1);
  const inst = new THREE.InstancedMesh(geo, MAT.stone.clone(), 44);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < 44; i++) {
    e.set(0, Math.sin(i * .7) * .3, 0); q.setFromEuler(e);
    m4.compose(new THREE.Vector3(Math.sin(i * .34) * 2.1, .06, 34 - i * 2.05), q, new THREE.Vector3(1, 1, 1).multiplyScalar(.9 + Math.random() * .5));
    inst.setMatrixAt(i, m4);
  }
  scene.add(inst);
})();

/* ── FIREFLIES ─────────────────────────────────────────────── */
const flies = (() => {
  const n = 130, pos = new Float32Array(n * 3), seed = [];
  for (let i = 0; i < n; i++) seed.push({ x: (Math.random() - .5) * 44, y: .6 + Math.random() * 7, z: 30 - Math.random() * 90, p: Math.random() * 6.28 });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffe08a, size: .17, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(pts); return { pts, seed, n };
})();

/* ── RAIN — LineSegments streaks + GPU shader ──────────────── */
const rain = (() => {
  const n = RM ? 0 : 500;
  const pos = new Float32Array(n * 2 * 3), seed = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const sx = (Math.random() - .5) * 80, sy = Math.random() * 42, sz = (Math.random() - .5) * 80, ln = .5 + Math.random() * .8;
    for (let v = 0; v < 2; v++) {
      pos[(i * 2 + v) * 3] = sx; pos[(i * 2 + v) * 3 + 1] = sy - v * ln; pos[(i * 2 + v) * 3 + 2] = sz;
      seed[i * 2 + v] = v;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uCZ: { value: 40 } },
    vertexShader: `
      attribute float aSeed; uniform float uT; uniform float uCZ;
      varying float vA;
      void main(){
        vec3 p = position;
        float drop = mod(uT * 22.0 + p.y * 7.3 + p.x * 3.1, 44.0);
        p.y = 42.0 - drop;
        p.x += sin(uT*.4 + p.z)*1.2;
        if (p.z - uCZ > 40.0) p.z -= 80.0;
        if (uCZ - p.z > 40.0) p.z += 80.0;
        p.x = mod(p.x + 40.0, 80.0) - 40.0;
        vA = aSeed > 0.5 ? 0.05 : 0.3;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `
      varying float vA;
      void main(){ gl_FragColor = vec4(0.55, 0.68, 0.85, vA); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const mesh = new THREE.LineSegments(g, mat);
  scene.add(mesh);
  return { mesh, mat, n };
})();

/* ── LEAVES — instanced + GLSL sway shader ─────────────────── */
const leaves = (() => {
  const n = RM ? 0 : 32;
  const tex = canvasTex(64, (x, s) => {
    x.clearRect(0, 0, s, s); x.fillStyle = '#b8452e'; x.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      x.lineTo(s/2 + Math.cos(a)*s*.42, s/2 + Math.sin(a)*s*.42);
      const a2 = a + Math.PI/5; x.lineTo(s/2 + Math.cos(a2)*s*.16, s/2 + Math.sin(a2)*s*.16);
    }
    x.closePath(); x.fill();
  });
  const geo = new THREE.PlaneGeometry(.34, .34);
  const seeds = new Float32Array(n);
  for (let i = 0; i < n; i++) seeds[i] = Math.random() * 6.28;
  geo.setAttribute('aPhase', new THREE.BufferAttribute(seeds, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uTex: { value: tex } },
    vertexShader: `
      attribute float aPhase; uniform float uT; varying vec2 vUv; varying float vP;
      void main(){
        vUv = uv; vP = aPhase;
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        wp.x += sin(uT*1.3 + aPhase)*0.7;
        wp.y += sin(uT*.9 + aPhase*2.0)*0.25;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      uniform sampler2D uTex; uniform float uT; varying vec2 vUv; varying float vP;
      void main(){
        vec4 t = texture2D(uTex, vUv);
        gl_FragColor = vec4(t.rgb * vec3(1.25, 0.82, 0.6), t.a * (0.55 + 0.45*sin(uT*2.0+vP)));
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide
  });
  const inst = new THREE.InstancedMesh(geo, mat, n);
  const data = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v3 = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < n; i++) data.push({ x: (Math.random()-.5)*40, y: 2 + Math.random()*16, z: 44 - Math.random()*95, spin: .4 + Math.random()*1.4, fall: .5 + Math.random()*.9 });
  scene.add(inst);
  return { inst, mat, data, n, m4, q, e, v3, sc };
})();

/* ── EMBERS ────────────────────────────────────────────────── */
const embers = (() => {
  const n = RM ? 0 : 70, pos = new Float32Array(n * 3), life = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos[i*3] = (Math.random()-.5)*20; pos[i*3+1] = Math.random()*10; pos[i*3+2] = 30 - Math.random()*80; life[i] = Math.random(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xff8a3c, size: .11, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(pts); return { pts, pos, life, n };
})();

/* ── WISPS (mist spirits) ──────────────────────────────────── */
const wisps = (() => {
  const arr = [], n = RM ? 0 : 9;
  for (let i = 0; i < n; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.wisp, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false }));
    const s = 6 + Math.random() * 10; sp.scale.set(s, s * .55, 1);
    sp.position.set((Math.random() - .5) * 46, .8 + Math.random() * 4.5, 30 - Math.random() * 90);
    sp.userData = { x0: sp.position.x, p: Math.random() * 6.28, sp: .1 + Math.random() * .18 };
    scene.add(sp); arr.push(sp);
  }
  return arr;
})();

/* ── GROUND MIST (drifting sheets) ─────────────────────────── */
const mists = (() => {
  const arr = [];
  for (let i = 0; i < (RM ? 0 : 3); i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(90, 10),
      new THREE.MeshBasicMaterial({ map: TEX.wisp, transparent: true, opacity: .05, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(0, .35 + i * .5, 20 - i * 34);
    m.userData = { p: i * 2.1 }; scene.add(m); arr.push(m);
  }
  return arr;
})();

/* ── EDITORIAL CARDS (procedural stills + sheen) ───────────── */
const cards = (() => {
  const set = [];
  [[0, 4.6, 22, -.5], [1, 3.4, -6, .45], [2, 5.2, -30, .5]].forEach(([kind, x, y, z], i) => {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: TEX.still(kind) }, uT: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform sampler2D uTex; uniform float uT; varying vec2 vUv;
        void main(){
          vec4 t = texture2D(uTex, vUv);
          float band = smoothstep(.0, .25, abs(fract(vUv.x - vUv.y*0.2 - uT*0.06) - 0.5));
          vec3 c = t.rgb * (0.9 + 0.35 * (1.0 - band));
          c += vec3(1.0,0.75,0.5) * pow(1.0 - band, 6.0) * 0.18;
          float edge = smoothstep(.0,.02,vUv.x)*smoothstep(1.,.98,vUv.x)*smoothstep(.0,.02,vUv.y)*smoothstep(1.,.98,vUv.y);
          gl_FragColor = vec4(c, 0.92 * edge + 0.08);
        }`,
      transparent: true
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), mat);
    m.position.set(x, y + 1.2, z); m.rotation.y = -z * .012;
    scene.add(m); set.push(m);
  });
  return set;
})();

/* ── CAMERA RIG — CatmullRom keyframes (soul of the walk) ──── */
const CAM = [
  { p: [  0.0, 4.6, 40.0], t: [  0.0, 6.2,  8.0], fov: 36 },
  { p: [ -4.6, 2.6, 24.0], t: [  1.0, 5.4,  9.0], fov: 46 },
  { p: [  1.8, 3.4,  8.0], t: [ -1.0, 4.2,-14.0], fov: 40 },
  { p: [  6.2, 2.4, -6.0], t: [ -3.0, 5.6,-22.0], fov: 46 },
  { p: [  0.0, 7.4,-18.0], t: [-14.0,11.0,-26.0], fov: 42 },
  { p: [  0.0,10.5,-24.0], t: [ -2.0, 3.0,-30.0], fov: 46 }
];
const RIG = { prog: 0, smooth: 0, mx: 0, my: 0, tmx: 0, tmy: 0, intro: 0 };
const curveP = new THREE.CatmullRomCurve3(CAM.map(c => new THREE.Vector3(...c.p)), false, 'catmullrom', .6);
const curveT = new THREE.CatmullRomCurve3(CAM.map(c => new THREE.Vector3(...c.t)), false, 'catmullrom', .6);

function applyCamera() {
  const N = CAM.length - 1;
  const u = clamp(RIG.smooth / N, 0, 1);
  const _p = curveP.getPoint(u), _t = curveT.getPoint(u);
  const i = clamp(Math.floor(RIG.smooth), 0, N - 1), f = clamp(RIG.smooth - i, 0, 1);
  let fov = lerp(CAM[i].fov, CAM[i + 1].fov, f);
  const io = 1 - RIG.intro;
  _p.z += io * 5.6; _p.y += io * .65; fov += io * 8;
  _p.x += RIG.mx * 1.15; _p.y += RIG.my * .55;
  camera.position.copy(_p);
  camera.lookAt(_t);
  camera.rotation.z += Math.sin(performance.now() * .0003) * .004 + RIG.mx * .012;
  if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }
}

/* ── SCROLL WIRING (data-cam) ──────────────────────────────── */
const sections = [...document.querySelectorAll('[data-cam]')].sort((a, b) => +a.dataset.cam - +b.dataset.cam);
let camTarget = 0;
function recalcScroll() {
  const mid = scrollY + H() * .5;
  let idx = 0;
  sections.forEach((s, i) => { if (s.offsetTop <= mid) idx = i; });
  camTarget = idx;
}
addEventListener('scroll', recalcScroll, { passive: true });
addEventListener('resize', recalcScroll);
addEventListener('mousemove', e => { RIG.tmx = (e.clientX / W() - .5) * 2; RIG.tmy = (e.clientY / H() - .5) * 2; }, { passive: true });

/* ── CHAPTER RAIL + REVEALS ────────────────────────────────── */
const chipBtns = [...document.querySelectorAll('.chip')];
const chipIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) chipBtns.forEach(c => c.classList.toggle('on', c.dataset.go === e.target.id));
}), { threshold: .55 });
sections.forEach(s => chipIO.observe(s));
chipBtns.forEach(c => c.addEventListener('click', () => document.getElementById(c.dataset.go)?.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' })));

const copyIO = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting)), { threshold: .3 });
document.querySelectorAll('.copy').forEach(el => copyIO.observe(el));

/* ── TICK ──────────────────────────────────────────────────── */
const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  const t = clock.getElapsedTime();
  RIG.smooth += (camTarget - RIG.smooth) * (RM ? 1 : .06);
  RIG.mx += (RIG.tmx - RIG.mx) * .04; RIG.my += (RIG.tmy - RIG.my) * .04;
  RIG.intro = Math.min(1, RIG.intro + .0045);
  applyCamera();

  lanterns.forEach((L, i) => { L.userData.flicker.intensity = .8 + Math.sin(t * 7 + i * 1.7) * .16 + Math.random() * .06; });

  const fp = flies.seed;
  for (let i = 0; i < flies.n; i++) {
    const s = fp[i];
    flies.pts.geometry.attributes.position.array[i * 3]     = s.x + Math.sin(t * .7 + s.p) * 1.4;
    flies.pts.geometry.attributes.position.array[i * 3 + 1] = s.y + Math.sin(t * .9 + s.p * 2) * .5;
    flies.pts.geometry.attributes.position.array[i * 3 + 2] = s.z + Math.cos(t * .5 + s.p) * 1.2;
  }
  flies.pts.geometry.attributes.position.needsUpdate = true;

  if (rain.n) { rain.mat.uniforms.uT.value = t; rain.mat.uniforms.uCZ.value = camera.position.z; }

  if (leaves.n) {
    leaves.mat.uniforms.uT.value = t;
    for (let i = 0; i < leaves.n; i++) {
      const d = leaves.data[i];
      d.y -= d.fall * .015;
      if (d.y < .1 || Math.abs(d.z - camera.position.z) > 70) { d.y = 8 + Math.random() * 12; d.x = camera.position.x + (Math.random() - .5) * 36; d.z = camera.position.z - 20 - Math.random() * 50; }
      leaves.e.set(t * d.spin, t * .4, 0); leaves.q.setFromEuler(leaves.e);
      leaves.v3.set(d.x, d.y, d.z);
      leaves.m4.compose(leaves.v3, leaves.q, leaves.sc);
      leaves.inst.setMatrixAt(i, leaves.m4);
    }
    leaves.inst.instanceMatrix.needsUpdate = true;
  }

  if (embers.n) {
    const p = embers.pos;
    for (let i = 0; i < embers.n; i++) {
      embers.life[i] += .009; p[i * 3 + 1] += .02; p[i * 3] += Math.sin(t * 2 + i) * .005;
      if (embers.life[i] > 1 || p[i * 3 + 1] > 11) { embers.life[i] = 0; p[i * 3 + 1] = .4 + Math.random() * 2; p[i * 3] = (Math.random() - .5) * 18; p[i * 3 + 2] = camera.position.z - Math.random() * 70; }
    }
    embers.pts.geometry.attributes.position.needsUpdate = true;
  }

  wisps.forEach(sp => { sp.position.x = sp.userData.x0 + Math.sin(t * sp.userData.sp + sp.userData.p) * 5; sp.material.opacity = .1 + Math.sin(t * .3 + sp.userData.p) * .05; });
  mists.forEach(m => { m.position.x = Math.sin(t * .05 + m.userData.p) * 9; });
  cards.forEach((c, i) => { c.material.uniforms.uT.value = t; c.rotation.z = Math.sin(t * .4 + i) * .01; });

  moonGlow.material.opacity = .8 + Math.sin(t * .6) * .12;
  renderer.render(scene, camera);
}

/* ── RESIZE / BOOT ─────────────────────────────────────────── */
addEventListener('resize', () => { camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()); });
recalcScroll();
tick();

/* ── DOM FX ────────────────────────────────────────────────── */
(function domFX() {
  const prog = document.getElementById('progress');
  const cursor = document.getElementById('cursor');
  const fine = matchMedia('(pointer:fine)').matches;

  document.querySelectorAll('h2, .mega').forEach(h => {
    const parts = [];
    h.childNodes.forEach(node => {
      if (node.nodeType === 3 && node.textContent.trim())
        node.textContent.split(/\s+/).filter(Boolean).forEach(w => parts.push(`<span class="w2">${w}</span>`));
      else if (node.nodeType === 1) parts.push(node.outerHTML);
    });
    h.innerHTML = parts.join(' ');
  });

  if (fine && cursor) {
    addEventListener('pointermove', e => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; }, { passive: true });
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('pointerenter', () => cursor.classList.add('hover'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('hover'));
    });
  }
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (prog && max > 0) prog.style.width = (scrollY / max * 100) + '%';
  }, { passive: true });
  if (RM) { const g = document.getElementById('grain'); if (g) g.style.display = 'none'; }
})();

addEventListener('load', () => setTimeout(() => document.getElementById('loader').classList.add('off'), 350));
setTimeout(() => document.getElementById('loader').classList.add('off'), 2600);
})();
