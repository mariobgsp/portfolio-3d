# Portfolio 3D

Personal portfolio for Muhammad Ario Bagus Prakusa — Software Engineer, Backend & Microservices — with a scroll-driven 3D hero built on [three.js](https://threejs.org/).

A fixed full-screen three.js canvas sits behind all content, rendering a wireframe icosahedron core with orbiting rings and particles. Scroll and mouse input drive camera and core state, and the whole scene degrades gracefully when WebGL is unavailable.

## Features

- **3D hero scene** — wireframe icosahedron core with two orbiting rings and 900 particles, built from a `THREE.Group` in `core.js`
- **Scroll-driven state** — pure scroll/mouse → scene-state mapping in `scroll.js` (hero dims, scales, and shifts as you scroll past the fold)
- **Reduced-motion support** — renders one static frame and disables scroll/mouse motion when `prefers-reduced-motion: reduce` matches
- **Graceful degradation** — if WebGL can't initialize, the canvas is removed and the rest of the page keeps working
- **Blueprint aesthetic** — technical-drawing styling: navy void background, hairline borders, mono labels, orange accents, section figures ("FIG. 01 — Profile")

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
  scene.js   Renderer, camera, animation loop, grid
  core.js    3D object group (icosahedron, rings, particles) + rotation
  scroll.js  Pure scroll/mouse → scene-state mapping
  ui.js      Navbar behavior and scroll reveals
  styles.css Blueprint theme
tests/       Vitest unit tests (scroll mapping, core construction)
```

## Notes

- The 3D scene requires a WebGL2-capable browser (three.js r163+ dropped WebGL1).
- With `prefers-reduced-motion: reduce` enabled (OS or browser setting), the scene renders statically by design.
