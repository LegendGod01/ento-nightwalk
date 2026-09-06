# 🌙 ENTO NIGHTWALK

## v3.0 — Kage-grade rebuild

Full cinematic engine, original implementation:

- **CatmullRom camera rig** — 6 authored keyframes (position + target + per-shot FOV), smoothed damp, mouse parallax drift, opening dolly-in
- **GLSL systems** — rain (500 LineSegments streaks, GPU wrap around camera), leaf-fall sway shader, card sheen sweep shader
- **16-texture procedural library** — stone, cedar planks, lacquer, shoji, roof tiles, sky dome, moon glow, wisp, cinematic stills (zero image assets)
- **Builders** — torii gate, sanmon hall (shoji + posts + layered roof), 5-tier pagoda with gold spire, stone lanterns, sakura/pine trees, instanced stone path
- **Atmosphere** — wisps (mist spirits), ground mist sheets, fireflies, embers, film grain, vignette
- **6 chapters** with data-cam wiring, chapter rail, word-by-word headline reveals, custom cursor, scroll progress

© ENTOURAGED.SAM (LegendGod01). Proprietary — see LICENSE.


> A Kyoto mountain temple, rendered **live in WebGL** — a five-chapter night walk up the mountain.
> Procedural sanmon gate, five-storey pagoda, flickering stone lanterns and a red moon. All in vanilla Three.js.

**© 2026 [ENTOURAGED.SAM](https://github.com/LegendGod01) — All rights reserved.**

![tech](https://img.shields.io/badge/tech-Three.js%20·%20WebGL-05070a?style=flat-square&labelColor=e0231c)
![size](https://img.shields.io/badge/weight-~25KB-05070a?style=flat-square&labelColor=1d2a22)
![deps](https://img.shields.io/badge/dependencies-zero%20build%20tools-05070a?style=flat-square&labelColor=1d2a22)

---

## ✨ The Experience

| Chapter | Scene |
|---------|-------|
| **I. ARRIVAL** | Hero — red moon rising over the mountain range, 700 stars |
| **II. THE GATE** | Vermilion torii + sanmon hall with warm shoji windows |
| **III. PATHWAYS** | Stone-lantern path — 9 flickering point-lights, instanced stone walkway |
| **IV. LESSONS** | Sakura & pines, 130 drifting fireflies, night fog |
| **V. ETERNITY** | The five-storey pagoda — camera tilts up to the gold spire |

## 🔧 Under the Hood

- **100% procedural geometry** — every mesh is code, zero 3D model files
- **Procedural textures** — granite, shoji paper & charred wood painted at runtime via `<canvas>`
- **Scroll-driven camera walk** — smooth-damped path with chapter look-at targets
- **Flicker system** — each lantern light breathes independently
- **Fireflies** — additive-blended points on sine-field drift
- **Performance** — DPR capped at 1.75, conditional antialias, ACES filmic tone mapping, FogExp2
- **Accessibility** — full `prefers-reduced-motion` support, semantic HTML, focusable chapter rail

## 📁 Structure

```
ento-nightwalk/
├── index.html      # markup + meta + OG tags
├── css/main.css    # full design system (tokens, layout, motion)
├── js/app.js       # procedural WebGL engine
└── README.md
```

## 🚀 Run

No build. No install. Just serve:

```bash
npx serve .          # or
python3 -m http.server
```

Deploy anywhere static — Vercel / Netlify / GitHub Pages.

## 📄 License

Copyright © 2026 **ENTOURAGED.SAM (LegendGod01)**. All rights reserved.
This design, code and concept are the intellectual property of ENTOURAGED.SAM.
Unauthorized copying, redistribution or commercial reuse is prohibited.
Contact for licensing: github.com/LegendGod01
