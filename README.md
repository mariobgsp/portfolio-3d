# Portfolio 3D

Personal portfolio for Muhammad Ario Bagus Prakusa — Software Engineer, Backend & Microservices — with a scroll-driven 3D hero built on [three.js](https://threejs.org/).

A fixed full-screen three.js canvas sits behind all content, rendering a large volumetric billowing cloud made of translucent puff spheres with gentle wind-drift and breathing motion. Scroll and mouse input drive camera and cloud state, and the whole scene degrades gracefully when WebGL is unavailable.

## Features

- **3D hero scene** — a single volumetric cloud of 45 translucent puff spheres with per-puff breathing and slow sideways drift, built from a `THREE.Group` in `cloud.js`
- **Scroll-driven state** — pure scroll/mouse → scene-state mapping in `scroll.js` (hero dims, scales, and shifts as you scroll past the fold)
- **Reduced-motion support** — renders one static frame and disables scroll/mouse motion when `prefers-reduced-motion: reduce` matches
- **Graceful degradation** — if WebGL can't initialize, the canvas is removed and the rest of the page keeps working
- **Blueprint aesthetic, softened** — technical-drawing styling with lighter hairlines: navy void background, hairline borders, mono labels, orange accents, section figures ("FIG. 01 — Profile")

## Tech Stack

- [Vite](https://vitejs.dev/) 6 — dev server and build tooling
- [three.js](https://threejs.org/) ^0.170 — WebGL rendering
- [Vitest](https://vitest.dev/) — unit tests
- Vanilla JavaScript ES modules — no framework

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (default `http://localhost:5173`).

## Scripts

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `npm run dev`    | Start the Vite dev server                    |
| `npm run build`  | Production build to `dist/`                  |
| `npm run preview`| Serve the production build locally           |
| `npm test`       | Run the Vitest test suite                    |

## Project Structure

```
src/
  main.js    Entry point — boot, wiring, graceful fallback
  scene.js   Renderer, camera, fog, animation loop, grid
  cloud.js   Volumetric cloud (45 translucent puffs) + drift/breathing
  scroll.js  Pure scroll/mouse → scene-state mapping
  ui.js      Navbar behavior and scroll reveals
  styles.css Softened blueprint theme
tests/       Vitest unit tests (scroll mapping, cloud construction)
```

## Notes

- The 3D scene requires a WebGL2-capable browser (three.js r163+ dropped WebGL1).
- With `prefers-reduced-motion: reduce` enabled (OS or browser setting), the scene renders statically by design.
