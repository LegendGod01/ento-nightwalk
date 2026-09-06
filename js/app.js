/* ════════════════════════════════════════════════════════════
   ENTO NIGHTWALK — app.js
   Procedural night-temple scrollytelling engine (original code)
   © ENTOURAGED.SAM (LegendGod01). All rights reserved.
   ════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════
   ENTO NIGHTWALK — © ENTOURAGED.SAM
   Procedural night-temple scrollytelling engine (original code)
   ════════════════════════════════════════════════════════════ */
(() => {
"use strict";
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const W = () => innerWidth, H = () => innerHeight;

/* ── RENDERER / SCENE / CAMERA ─────────────────────────────── */
const DPR = Math.min(devicePixelRatio || 1, 1.75);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('stage'), antialias: DPR < 1.6, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(DPR);
renderer.setSize(W(), H());
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070a);
scene.fog = new THREE.FogExp2(0x070b12, 0.021);

const camera = new THREE.PerspectiveCamera(36, W()/H(), .35, 300);
camera.position.set(0, 3.4, 64);

/* ── LIGHTS ────────────────────────────────────────────────── */
scene.add(new THREE.HemisphereLight(0x35486a, 0x070b12, .72));
const moonlight = new THREE.DirectionalLight(0xc2d4f5, .55);
moonlight.position.set(-28, 44, -30); scene.add(moonlight);
const gateGlow = new THREE.PointLight(0xff5a3c, 1.0, 30, 2);

/* ── PROCEDURAL TEXTURES (canvas-drawn, zero assets) ───────── */
function canvasTex(size, painter, repeat) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  painter(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
  return t;
}
const TEX = {
  stone: canvasTex(256, (x, s) => {           // speckled granite
    x.fillStyle = '#565e66'; x.fillRect(0,0,s,s);
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${20+Math.random()*70|0},${24+Math.random()*70|0},${30+Math.random()*70|0},${.05+Math.random()*.2})`; x.fillRect(Math.random()*s, Math.random()*s, 1+Math.random()*2.4, 1+Math.random()*2.4); }
    for (let i = 0; i < 7; i++) { x.strokeStyle = 'rgba(0,0,0,.16)'; x.beginPath(); x.moveTo(Math.random()*s, Math.random()*s); x.lineTo(Math.random()*s, Math.random()*s); x.stroke(); }
  }, 3),
  shoji: canvasTex(128, (x, s) => {           // warm lit paper grid
    x.fillStyle = '#ffce8a'; x.fillRect(0,0,s,s);
    x.strokeStyle = 'rgba(60,30,8,.85)'; x.lineWidth = 5;
    for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i*s/4,0); x.lineTo(i*s/4,s); x.stroke(); x.beginPath(); x.moveTo(0,i*s/4); x.lineTo(s,i*s/4); x.stroke(); }
  }),
  charred: canvasTex(128, (x, s) => {
    x.fillStyle = '#3a424d'; x.fillRect(0,0,s,s);
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(10,12,16,${.08+Math.random()*.25})`; x.fillRect(Math.random()*s, Math.random()*s, 2, 2); }
  }, 2)
};

/* ── MATERIALS ─────────────────────────────────────────────── */
const MAT = {
  stone:  new THREE.MeshStandardMaterial({ map: TEX.stone, color: 0x6b737b, roughness: .94, metalness: .02 }),
  charred:new THREE.MeshStandardMaterial({ map: TEX.charred, color: 0x333b45, roughness: .9,  metalness: .03 }),
  verm:   new THREE.MeshStandardMaterial({ color: 0x5f120f, roughness: .82, metalness: .03 }),
  vermLit:new THREE.MeshStandardMaterial({ color: 0xc22a1c, roughness: .68, metalness: .05, emissive: 0x3a0703 }),
  shoji:  new THREE.MeshBasicMaterial({ map: TEX.shoji, toneMapped: false }),
  dark:   new THREE.MeshStandardMaterial({ color: 0x171e26, roughness: .95 }),
  gold:   new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: .4, metalness: .7 })
};

/* ── GROUND ────────────────────────────────────────────────── */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), MAT.stone.clone());
ground.material.map.repeat.set(26, 26);
ground.rotation.x = -Math.PI / 2; ground.position.y = 0;
scene.add(ground);

/* mountain silhouette rings (low dark cones) */
(function ring() {
  const g = new THREE.ConeGeometry(1, 1, 7), grp = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2, r = 95 + Math.random() * 70;
    const m = new THREE.Mesh(g, MAT.dark);
    m.position.set(Math.cos(a)*r, 0, Math.sin(a)*r - 30);
    const h = 26 + Math.random() * 46; m.scale.set(24+Math.random()*30, h, 24+Math.random()*30);
    grp.add(m);
  } scene.add(grp);
})();

/* ── RED MOON + glow ───────────────────────────────────────── */
const moon = new THREE.Mesh(new THREE.CircleGeometry(17, 48), new THREE.MeshBasicMaterial({ color: 0xe0231c, toneMapped: false, fog: false }));
moon.position.set(-34, 40, -150); scene.add(moon);
const glowTex = canvasTex(128, (x, s) => { const g = x.createRadialGradient(s/2,s/2,4,s/2,s/2,s/2); g.addColorStop(0,'rgba(224,35,28,.55)'); g.addColorStop(1,'rgba(224,35,28,0)'); x.fillStyle=g; x.fillRect(0,0,s,s); });
const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
moonGlow.scale.set(95, 95, 1); moonGlow.position.copy(moon.position); scene.add(moonGlow);

/* ── STARS ─────────────────────────────────────────────────── */
(function stars() {
  const n = 700, pos = new Float32Array(n*3);
  for (let i = 0; i < n; i++) { pos[i*3] = (Math.random()-.5)*360; pos[i*3+1] = 30+Math.random()*130; pos[i*3+2] = -60-Math.random()*160; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fb4d8, size: .34, transparent: true, opacity: .8, fog: false, sizeAttenuation: true })));
})();

/* ── TORII (vermilion gate) ────────────────────────────────── */
const torii = new THREE.Group();
(function buildTorii() {
  const P = MAT.vermLit, legG = new THREE.CylinderGeometry(.5, .62, 9, 12);
  [-3.4, 3.4].forEach(px => { const leg = new THREE.Mesh(legG, P); leg.position.set(px, 4.5, 0); torii.add(leg); });
  const top = new THREE.Mesh(new THREE.BoxGeometry(10.4, .7, 1.5), P); top.position.y = 9.4; top.rotation.z = -.015; torii.add(top);
  const top2 = new THREE.Mesh(new THREE.BoxGeometry(11.2, .32, 1.8), P); top2.position.y = 10.05; torii.add(top2);
  const mid = new THREE.Mesh(new THREE.BoxGeometry(9.2, .5, .9), P); mid.position.y = 7.3; torii.add(mid);
})();
torii.position.set(0, 0, 30); scene.add(torii);
gateGlow.position.set(0, 6, 32); scene.add(gateGlow);

/* ── SANMON (temple hall / gate structure) ──────────────────── */
function buildHall() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(18, 1.4, 12), MAT.stone); base.position.y = .7; g.add(base);
  const body = new THREE.Mesh(new THREE.BoxGeometry(15, 6.4, 9.5), MAT.charred); body.position.y = 4.6; g.add(body);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j += 2) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), MAT.shoji);
    win.position.set(i*4.4, 4.8, j*4.78); if (j < 0) win.rotation.y = Math.PI; g.add(win);
  }
  for (let i = -2; i <= 2; i++) { const post = new THREE.Mesh(new THREE.CylinderGeometry(.42,.46,6.6,10), MAT.verm); post.position.set(i*3.2, 4.5, 4.5); g.add(post); }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(13.4, 3.2, 4), MAT.dark);
  roof.rotation.y = Math.PI/4; roof.position.y = 9.2; roof.scale.z = .78; g.add(roof);
  return g;
}
const sanmon = buildHall(); sanmon.position.set(0, 0, 12); scene.add(sanmon);
const hallLight = new THREE.PointLight(0xffb066, 2.6, 42, 2); hallLight.position.set(0, 5, 14); scene.add(hallLight);

/* ── PAGODA (5 tiers) ──────────────────────────────────────── */
function buildPagoda() {
  const g = new THREE.Group();
  let y = 0;
  const base = new THREE.Mesh(new THREE.BoxGeometry(11, 1.2, 11), MAT.stone); base.position.y = .6; g.add(base); y = 1.2;
  for (let tier = 0; tier < 5; tier++) {
    const w = 7.6 - tier * 1.06;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, 3.1, w), MAT.charred); body.position.y = y + 1.55; g.add(body);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(w*.34, 1.5), MAT.shoji); win.position.set(0, y + 1.7, w/2 + .02); g.add(win);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w*1.16, 1.7, 4), MAT.dark);
    roof.rotation.y = Math.PI/4; roof.position.y = y + 3.95; g.add(roof);
    y += 4.7;
  }
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(.14, .3, 5.4, 8), MAT.gold); spire.position.y = y + 2.4; g.add(spire);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.5, 12, 12), MAT.gold); orb.position.y = y + 4.4; g.add(orb);
  return g;
}
const pagoda = buildPagoda(); pagoda.position.set(-14, 0, -26); scene.add(pagoda);
const pagodaLight = new THREE.PointLight(0xffc074, 1.6, 34, 2); pagodaLight.position.set(-13, 8, -21); scene.add(pagodaLight);

/* ── LANTERNS (stone path lights) ──────────────────────────── */
function makeLantern(h) {
  const g = new THREE.Group();
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(.5, .66, .7, 8), MAT.stone); ped.position.y = .35; g.add(ped);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.2, .26, h, 8), MAT.stone); post.position.y = .7 + h/2; g.add(post);
  const house = new THREE.Mesh(new THREE.BoxGeometry(1, .9, 1), MAT.stone); house.position.y = .7 + h + .45; g.add(house);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(.56, .5), new THREE.MeshBasicMaterial({ color: 0xffc987, toneMapped: false }));
  win.position.set(0, .7 + h + .45, .51); g.add(win);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(.92, .5, 4), MAT.dark); cap.rotation.y = Math.PI/4; cap.position.y = .7 + h + 1.12; g.add(cap);
  const light = new THREE.PointLight(0xffb066, .95, 13, 2); light.position.set(0, .7 + h + .5, 0); g.add(light);
  g.userData.flicker = light;
  return g;
}
const lanterns = [];
[[6,9],[ -6,4],[7,-2],[-7,-8],[8,-16],[-8,-24],[9,-34],[-9,-44],[10,-54]].forEach(([px, pz], i) => {
  const L = makeLantern(1.1 + (i % 2) * .3); L.position.set(px, 0, pz); scene.add(L); lanterns.push(L);
});

/* ── TREES (sakura + pine, procedural) ─────────────────────── */
function sakura(x, z, s = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.16*s, .3*s, 3.4*s, 7), MAT.charred); trunk.position.y = 1.7*s; trunk.rotation.z = (Math.random()-.5)*.2; g.add(trunk);
  const bm = new THREE.MeshStandardMaterial({ color: 0x8d5a74, roughness: .95, emissive: 0x1c0d18 });
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry((.9+Math.random()*.9)*s, 8, 8), bm);
    b.position.set((Math.random()-.5)*2.6*s, (3+Math.random()*1.6)*s, (Math.random()-.5)*2.6*s); g.add(b);
  }
  g.position.set(x, 0, z); g.rotation.y = Math.random()*6.28; scene.add(g);
}
function pine(x, z, s = 1) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.CylinderGeometry(.2*s,.34*s,2.2*s,7), MAT.charred); t.position.y = 1.1*s; g.add(t);
  const cm = new THREE.MeshStandardMaterial({ color: 0x1d2a22, roughness: .96 });
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry((2.2-i*.6)*s, 2.6*s, 8), cm);
    c.position.y = (2.4+i*1.7)*s; g.add(c);
  }
  g.position.set(x, 0, z); g.rotation.y = Math.random()*6.28; scene.add(g);
}
[[-13,22],[-18,14],[14,18],[17,6],[-16,-4],[19,-12],[-20,-20],[22,-30],[-24,-40],[25,-52]].forEach(([x,z],i)=> i%2 ? pine(x,z,.9+Math.random()*.7) : sakura(x,z,.9+Math.random()*.8));

/* ── STONE PATH (InstancedMesh) ────────────────────────────── */
(function path() {
  const geo = new THREE.BoxGeometry(1.5, .22, 1.1);
  const inst = new THREE.InstancedMesh(geo, MAT.stone.clone(), 44);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < 44; i++) {
    const z = 34 - i * 2.05, wob = Math.sin(i*.34)*2.1;
    e.set(0, Math.sin(i*.7)*.3, 0); q.setFromEuler(e);
    m4.compose(new THREE.Vector3(wob, .06, z), q, new THREE.Vector3(1,1,1).multiplyScalar(.9+Math.random()*.5));
    inst.setMatrixAt(i, m4);
  }
  scene.add(inst);
})();

/* ── FIREFLIES ─────────────────────────────────────────────── */
const flies = (function () {
  const n = 130, pos = new Float32Array(n*3), seed = [];
  for (let i = 0; i < n; i++) { seed.push({ x:(Math.random()-.5)*44, y:.6+Math.random()*7, z:30-Math.random()*90, p:Math.random()*6.28 }); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffe08a, size: .17, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(pts); return { pts, seed, n };
})();

/* ── SCROLL STATE ──────────────────────────────────────────── */
const chapters = [...document.querySelectorAll('.chapter')].map(s => s.id);
let scrollP = 0, scrollTarget = 0;
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - H();
  scrollTarget = max > 0 ? scrollY / max : 0;
}, { passive: true });

/* camera walk: z 64 → -58, y 3.4 → 9.5, gentle sway */
function driveCamera(p, t) {
  const z = 64 - p * 122;
  const y = 3.4 + p * 6.1 + Math.sin(t*.5)*.06;
  const x = Math.sin(t*.22)*.5 + Math.sin(p*9)*.4;
  camera.position.set(x, y, z);
  /* look targets per phase */
  let lx = 0, ly = 4.2, lz = z - 40;
  if (p < .22)      { lx = 0;  ly = 5;   lz = 10; }   // sanmon
  else if (p < .5)  { lx = Math.sin(p*24)*3; ly = 3.5; lz = z - 30; } // path
  else if (p < .78) { lx = -14; ly = 10; lz = -26; } // pagoda approach
  else              { lx = -14; ly = 14; lz = -26; } // pagoda top
  const look = new THREE.Vector3(lx, ly, lz);
  camera.lookAt(look.x, ly + (p-.5)*2.2, look.z);
  camera.rotation.z = Math.sin(t*.3)*.004;
}

/* ── REVEAL + CHIPS ────────────────────────────────────────── */
const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting)), { threshold: .3 });
document.querySelectorAll('.copy').forEach(el => io.observe(el));
const chipBtns = [...document.querySelectorAll('.chip')];
const chipIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) chipBtns.forEach(c => c.classList.toggle('on', c.dataset.go === e.target.id));
}), { threshold: .55 });
chapters.forEach(id => chipIO.observe(document.getElementById(id)));
chipBtns.forEach(c => c.addEventListener('click', () => {
  document.getElementById(c.dataset.go).scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
}));

/* ── LOOP ──────────────────────────────────────────────────── */
const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  const t = clock.getElapsedTime();
  scrollP += (scrollTarget - scrollP) * (RM ? 1 : .075);
  driveCamera(scrollP, t);
  lanterns.forEach((L, i) => { L.userData.flicker.intensity = .8 + Math.sin(t*7 + i*1.7)*.16 + Math.random()*.06; });
  const fp = flies.seed;
  for (let i = 0; i < flies.n; i++) {
    const s = fp[i];
    flies.pts.geometry.attributes.position.array[i*3]   = s.x + Math.sin(t*.7 + s.p)*1.4;
    flies.pts.geometry.attributes.position.array[i*3+1] = s.y + Math.sin(t*.9 + s.p*2)*.5;
    flies.pts.geometry.attributes.position.array[i*3+2] = s.z + Math.cos(t*.5 + s.p)*1.2;
  }
  flies.pts.geometry.attributes.position.needsUpdate = true;
  moonGlow.material.opacity = .8 + Math.sin(t*.6)*.12;
  renderer.render(scene, camera);
}
tick();

/* ── RESIZE ────────────────────────────────────────────────── */
addEventListener('resize', () => {
  camera.aspect = W()/H(); camera.updateProjectionMatrix();
  renderer.setSize(W(), H());
});

/* ── LOADER OFF ────────────────────────────────────────────── */
addEventListener('load', () => setTimeout(() => document.getElementById('loader').classList.add('off'), 350));
setTimeout(() => document.getElementById('loader').classList.add('off'), 2600);
})();