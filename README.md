# Portfolio — Flat Blueprint + Glossy Bubbles

Personal portfolio for Muhammad Ario Bagus Prakusa — Software Engineer, Backend & Microservices.

A flat technical-drawing interface on a navy void: hairline blueprint grid, mono labels, orange
accents, corner-bracket plates, and decorative glossy bubbles. The page runs a set of lightweight
HUD animations — a live typing terminal, real-time clock and uptime, LED status pulses, radar-ping
bubbles, a scanning band, and a scroll-progress hairline.

## Features

- **Flat blueprint aesthetic** — navy void (`#0a1c3c`), hairline borders, FIG/spec-sheet section
  labels, corner-bracket "plate" cards, orange accent
- **Glossy bubbles** — CSS orbs with specular highlights and radar-ping rings floating behind content
- **Techy motion** — typewriter terminal, live WIB clock, uptime counter, blinking cursor, LED
  pulses, scanline sweep, scroll-progress bar, staggered reveals, corner-bracket hover states
- **Accessibility** — full `prefers-reduced-motion` support (terminal prints instantly, animations
  disabled, everything readable), skip-link, focus-visible rings
- **Graceful degradation** — no WebGL dependency at all; pure CSS/JS, tiny bundle (~4 KB JS)

## Tech Stack

- [Vite](https://vitejs.dev/) 6 — dev server and build tooling
- [Vitest](https://vitest.dev/) — unit tests
- Vanilla JavaScript ES modules — no framework, no 3D

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
  main.js    Entry point — boot, wiring
  scroll.js  Pure scroll-progress mapping (progress bar + tests)
  ui.js      Navbar behavior (active links, mobile menu) and scroll reveals
  tech.js    HUD animations — typing terminal, clock, uptime, progress bar
  styles.css Flat blueprint theme + glossy bubbles + techy motion
tests/       Vitest unit tests (scroll mapping)
public/      favicon.svg + og.png (social share asset)
```

## Notes

- With `prefers-reduced-motion: reduce` enabled, animations are disabled and all content is
  readable (terminal shows its final line, bubbles render statically).
- All motion is `transform`/`opacity`-based; `background-position` and layout properties are never
  animated.
