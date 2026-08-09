# Portfolio 3D — Cloud Scene Redesign

**Date:** 2026-08-09
**Status:** Approved by user (all sections accepted)

## Overview

Replace the current 3D hero object (wireframe icosahedron core with orbiting rings and 900 particles — a "planet" feel) with a single large volumetric billowing cloud, keeping the site's blueprint aesthetic but softening it toward "simple and elegant". The 3D scene stays fully in place — this is a swap of the hero object plus a styling pass, not a rewrite.

Branch: `feature/cloud-3d-scene`.

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Cloud style | Volumetric billowing cloud (layered translucent puff spheres) |
| Existing elements | Cloud only — icosahedron, rings, and particles removed entirely |
| Aesthetic scope | Blueprint softened: keep navy palette/fonts, soften hairlines and texture |
| Cloud motion | Slow sideways drift + subtle per-puff breathing; mouse parallax and scroll mapping unchanged |
| Approach | A: layered translucent puff spheres (`MeshBasicMaterial`, `depthWrite: false`) — no shaders, no assets |

## Architecture

- New module `src/cloud.js` replacing `src/core.js`:
  - `createCloud()` returns a `THREE.Group` named `cloud`.
  - `updateCloud(group, delta)` drives breathing + drift.
- `src/scene.js`: import `updateCloud` from `cloud.js`; add `THREE.Fog(0x0a1c3c, 4.8, 7.5)`; lower grid opacity 0.35 → 0.18.
- `src/scroll.js`: rename state keys `coreOpacity` → `cloudOpacity`, `coreScale` → `cloudScale`, `coreOffsetX` → `cloudOffsetX` for clarity. Values unchanged.
- `src/scene.js`: rename `core` local/state references to `cloud`; behavior (dim/scale/shift on scroll, mouse parallax, camera drift, reduced-motion static frame) unchanged.
- `src/main.js`: call `createCloud` instead of `createCore`.

## 3D scene design

- **Cloud construction:**
  - ~45 puff spheres (`SphereGeometry(1, 24, 16)` scaled per puff), radii 0.18–0.62.
  - Arranged in a billowing silhouette: flat-ish bottom, 3–4 upper lobes, group flattened in Y (wide, not tall).
  - Materials: `MeshBasicMaterial` (fog-affected, cheap), transparent, `depthWrite: false`, opacity 0.24–0.42.
  - Two tones: ink-white `0xdfe9ff` and steel `0x7e9cc9`, distributed among puffs.
- **Motion (`updateCloud`):**
  - Breathing: each puff stores its own phase, speed, and amplitude; scale oscillates ±2–3.5%.
  - Drift: group `position.x = sin(time * 0.08) * 0.35`.
- **Environment:**
  - `THREE.Fog(0x0a1c3c, 4.8, 7.5)` softens distant puffs into the background.
  - Blueprint grid retained but fainter (opacity 0.18).
- **Interaction (unchanged semantics):** mouse parallax tilt/offset; scroll dims (`cloudOpacity` floor 0.1), shrinks, and shifts the cloud aside (`cloudOffsetX`); reduced-motion renders one static frame.

## Styling — "blueprint, softened" (`styles.css`)

- Palette and fonts unchanged: paper `#0a1c3c`, paper-2 `#0e2347`, ink `#dfe9ff`, steel `#7e9cc9`, hairline `#2a4a7f`, accent `#ff7a3d`; Space Grotesk + IBM Plex Mono.
- Hairline borders/dividers and CSS blueprint grid texture opacity cut roughly in half.
- FIG. section headers kept but quieter (smaller tracking, lower-opacity captions).
- Soft radial scrim overlay between canvas and content, strongest in hero, keeping text readable over the lighter cloud.
- Slightly more generous hero/section spacing; card borders relaxed to lighter strokes.
- Nav, scroll reveals, mobile menu, reduced-motion: untouched.

## Files changed

- `src/cloud.js` (new) — cloud construction + update.
- `src/core.js` (deleted).
- `src/scene.js` — fog, grid opacity, import + `cloud` naming.
- `src/scroll.js` — key renames.
- `src/main.js` — import swap.
- `src/styles.css` — softening pass.
- `tests/core.test.js` → `tests/cloud.test.js` — group named `cloud`; ~45 puff meshes; no icosahedron/rings/particles; breathing changes puff scale; drift changes group position.
- `README.md` — describe cloud scene.

## Verification

- `npm test` passes.
- `npm run build` succeeds.
- `npm run preview` smoke test: cloud renders behind hero, breathes and drifts; scroll dims/shifts it; mouse parallax works; reduced-motion shows a static frame; no console errors; text readable over cloud at all scroll positions.

## Out of scope

- Shader-based volumetric cloud (Approach B) — fallback only if Approach A's look disappoints after implementation.
- Any content/section changes.
- Changes to nav, reveals, reduced-motion, or scroll mapping values.
