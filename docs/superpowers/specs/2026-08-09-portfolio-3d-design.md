# Portfolio 3D — Design Spec

**Date:** 2026-08-09
**Status:** Approved by user (architecture, page structure, performance/accessibility sections all accepted)

## Overview

A personal portfolio website for Muhammad Ario Bagus Prakusa (Software Engineer — Backend & Microservices) built with **vanilla three.js + Vite**. It replaces the current static single-file portfolio (engineering blueprint aesthetic) with a scroll-driven 3D experience that keeps the same design language: dark navy blueprint palette, Space Grotesk + IBM Plex Mono, orange accent.

New standalone repo (local only, no remote yet): `/home/mariobgsp/Project/github/portfolio-3d`.

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Location | New repo, built differently from current site |
| 3D experience | Scroll-driven 3D hero, hero-anchored background canvas |
| Stack | Vanilla three.js + Vite |
| Aesthetic | Blueprint aesthetic in 3D (same palette/fonts) |
| Hero object | Wireframe icosahedron core with orbiting rings |
| Content | All current sections (About, Experience, Projects, Skills/Credentials, Contact) |
| Repo | Local git init only; user adds remote later |

## Architecture

- Vite + vanilla JS (no framework, no TypeScript).
- Single full-screen WebGL canvas fixed behind all content (`position: fixed`), z-index below content, `aria-hidden`.
- One render loop; content sections scroll normally above the scene.

```
portfolio-3d/
  index.html
  src/
    main.js          — boot, resize, prefers-reduced-motion handling
    scene.js         — three.js scene, camera, renderer, animation loop
    core.js          — icosahedron + orbit rings construction
    scroll.js        — scroll progress → camera/object state
    styles.css
  docs/superpowers/specs/  — this design doc
```

Modules have single responsibilities:
- `core.js` builds and returns the 3D object group; no knowledge of DOM.
- `scroll.js` maps scroll position to camera/object state; no three.js internals beyond exposed setters.
- `scene.js` owns the renderer, camera, and loop; calls scroll.js output each frame.
- `main.js` wires everything and handles resize + reduced-motion.

## 3D scene design

- **Background:** dark navy void; faint blueprint grid plane receding into depth (GridHelper or custom shader-free plane, low opacity).
- **Hero object:** wireframe icosahedron, orange-tinted edges (`#ff7a3d` accent), detail level low (2–3), centered at hero; 1–2 thin orbiting rings; small particle "data points" scattered around (few thousand max).
- **Interaction:**
  - Mouse: subtle parallax tilt/offset of the object group.
  - Scroll: object rotates slowly; camera drifts slightly; behind content sections (non-hero) the object shifts to the side and dims (opacity/movement driven by scroll progress) so text stays readable.
- **Reduced motion:** scene renders once, static; no scroll/mouse-driven movement.

## Page structure & content

All content copied from current site + resume. Sections:

1. **Nav** — fixed top: `mario.dev` logo, links About / Experience / Projects / Skills / Contact, blur-on-scroll, mobile hamburger.
2. **Hero** — name "Muhammad Ario Bagus Prakusa", title "Software Engineer — Backend & Microservices", one-line punch (Java/Spring + Go; 1M records ~6h→~20min), CTAs: Get in Touch (mailto), GitHub, LinkedIn. Text left, 3D core right.
3. **About** — 4+ years, Java/Spring + Go microservices, banking/telecom ID·SG·MY·CHN, OCBC (current), CIMB Niaga, XL Axiata; AI-augmented dev (Windsurf, MCP); UGM B.Eng Engineering Physics, thermal-CNN thesis. Stat strip: 4+, 6h→20m, 4 markets, 1M+.
4. **Experience** — timeline: OCBC (Oct 2024–present), CIMB Niaga (Jan–Oct 2024), XL Axiata (Nov 2021–Dec 2023), Xsis Academy (Oct–Nov 2021), UGM lab assistant (Mar–Jun 2021). Bullets from resume.
5. **Projects** — Netto Spendo (TS, Finance/UX), PhysicsLab (TS, Simulation/37 Labs), Local Postman (JS, Dev Tool/Local-First), Thermal Face Recognition (Jupyter, AI/CNN/Thesis). Cards link to GitHub repos.
6. **Skills & Credentials** — clusters: Languages & Frameworks; Data & Infrastructure; APIs & Architecture; Practices & Tools; Education block; Certifications list (10 certs with years).
7. **Footer/Contact** — email, GitHub, LinkedIn, location (Tangerang Selatan, Indonesia), copyright 2026.

## Styling

- Tokens: paper `#0a1c3c`, paper-2 `#0e2347`, ink `#dfe9ff`, steel `#7e9cc9`, hairline `#2a4a7f`, accent `#ff7a3d`.
- Fonts: Space Grotesk (sans), IBM Plex Mono (mono) via Google Fonts.
- CSS blueprint grid retained but thinner (the 3D scene is the new background texture).
- FIG./spec-sheet section headers retained (FIG. 01 — Profile, etc.).

## Performance

- `renderer.setPixelRatio` capped at 2 (1.5 on large screens).
- Low poly counts; particle count kept modest.
- Pause render loop on `document.hidden`; skip redraws when scroll unchanged.
- No textures/assets — all colors via materials (zero asset loading).

## Accessibility

- Full `prefers-reduced-motion` support: static scene.
- Canvas `aria-hidden="true"`; all info in semantic HTML with proper headings.
- Mobile hamburger nav, focus-visible styles, scroll-padding for anchors.

## Verification

- `npm run build` succeeds.
- `npm run preview` smoke test at desktop and mobile widths: hero parallax, scroll behavior, nav active states, mobile menu, no console errors.
- Reduced-motion flag verified (static scene renders, content readable).
- Initial commit includes this design doc. No GitHub push (user opted for local only).

## Out of scope

- GitHub remote setup, deploy workflow (user adds later).
- TypeScript, React, test frameworks.
- Multi-canvas or full-scroll-choreography 3D (Approaches B/C — explicitly rejected).
