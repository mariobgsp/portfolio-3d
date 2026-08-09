# Cloud Scene Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 3D planet-like core (icosahedron + rings + particles) with a single large volumetric billowing cloud of translucent puff spheres, and soften the blueprint styling.

**Architecture:** New `src/cloud.js` exports `createCloud()` (returns a `THREE.Group` named `cloud` containing a drift sub-group with 45 puff meshes) and `updateCloud(group, delta)` (drift + breathing). The outer group's position/scale/opacity stay driven by the existing scroll/mouse state machine in `scene.js`; the inner drift group owns the idle wind-drift so the two never fight. `scroll.js` state keys are renamed `core*` → `cloud*`. Styling softens hairlines via a new `--hairline-soft` token plus a readability scrim element.

**Tech Stack:** Vite 6, three.js ^0.170, Vitest, vanilla JS ES modules.

## Global Constraints

- Keep the blueprint palette tokens unchanged: paper `#0a1c3c`, paper-2 `#0e2347`, ink `#dfe9ff`, steel `#7e9cc9`, hairline `#2a4a7f`, accent `#ff7a3d`.
- No textures, no assets, no shaders — all colors via materials.
- No `Math.random()` in layout code — puff layout must be deterministic for tests.
- Reduced-motion path (single static render) and scroll/mouse mapping *values* unchanged.
- Cloud opacity must remain < 1 (translucent) at all times: base opacities 0.24–0.42, scroll dim floor 0.1, multiplied not overridden.

---
### Task 1: Cloud module (`src/cloud.js`) with TDD

**Files:**
- Create: `src/cloud.js`
- Test: `tests/cloud.test.js`
- Delete: `src/core.js`, `tests/core.test.js`

**Interfaces:**
- Consumes: nothing (three.js only).
- Produces: `createCloud()` → `THREE.Group` named `'cloud'`; inner `THREE.Group` named `'drift'` holding 45 `THREE.Mesh` puffs, each with `userData = { baseOpacity, baseScale, phase, speed, amp }`; every puff has `material.transparent === true` and `material.depthWrite === false`. `updateCloud(group, delta)` → `void`; sets `group.userData.time` (accumulated seconds), `drift.position.x = sin(time * 0.08) * 0.35`, and per-puff `scale.setScalar(baseScale * (1 + sin(time * speed + phase) * amp))`.

- [ ] **Step 1: Write the failing test**

Create `tests/cloud.test.js`:

```js
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createCloud, updateCloud } from '../src/cloud.js';

describe('createCloud', () => {
  it('returns a Group named cloud', () => {
    const cloud = createCloud();
    expect(cloud).toBeInstanceOf(THREE.Group);
    expect(cloud.name).toBe('cloud');
  });

  it('contains a drift group with 45 puff meshes', () => {
    const cloud = createCloud();
    const drift = cloud.getObjectByName('drift');
    expect(drift).toBeInstanceOf(THREE.Group);
    expect(drift.children.length).toBe(45);
    drift.children.forEach((puff) => {
      expect(puff).toBeInstanceOf(THREE.Mesh);
      expect(puff.material.transparent).toBe(true);
      expect(puff.material.depthWrite).toBe(false);
      expect(puff.userData.baseScale).toBeGreaterThan(0);
      expect(puff.userData.baseOpacity).toBeGreaterThan(0);
      expect(puff.userData.baseOpacity).toBeLessThan(1);
    });
  });

  it('has no icosahedron, rings or particles', () => {
    const cloud = createCloud();
    expect(cloud.getObjectByName('icosahedron')).toBeNull();
    expect(cloud.getObjectByName('ring-1')).toBeNull();
    expect(cloud.getObjectByName('ring-2')).toBeNull();
    expect(cloud.getObjectByName('particles')).toBeNull();
  });
});

describe('updateCloud', () => {
  it('breathes: changes the first puff scale over time', () => {
    const cloud = createCloud();
    const puff = cloud.getObjectByName('drift').children[0];
    const before = puff.scale.x;
    updateCloud(cloud, 0.5);
    expect(puff.scale.x).not.toBeCloseTo(before, 5);
  });

  it('drifts: moves the drift group on x', () => {
    const cloud = createCloud();
    const drift = cloud.getObjectByName('drift');
    updateCloud(cloud, 0.5);
    expect(Math.abs(drift.position.x)).toBeGreaterThan(0);
  });

  it('accumulates time across calls', () => {
    const cloud = createCloud();
    const drift = cloud.getObjectByName('drift');
    updateCloud(cloud, 1);
    const first = drift.position.x;
    updateCloud(cloud, 1);
    expect(drift.position.x).not.toBeCloseTo(first, 5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/cloud.test.js`
Expected: FAIL — `Cannot find module '../src/cloud.js'` (or `createCloud is not a function`).

- [ ] **Step 3: Write `src/cloud.js`**

```js
import * as THREE from 'three';

const INK = 0xdfe9ff;
const STEEL = 0x7e9cc9;

// Flat-bottomed billowing silhouette: three wide rows, top lobes, then soft filler puffs.
const PUFF_SPECS = [
  // bottom row — flat base
  { x: -2.2, y: -0.55, z: -0.1, r: 0.5 },
  { x: -1.45, y: -0.55, z: 0.12, r: 0.5 },
  { x: -0.75, y: -0.55, z: -0.08, r: 0.52 },
  { x: 0.0, y: -0.55, z: 0.05, r: 0.54 },
  { x: 0.75, y: -0.55, z: -0.12, r: 0.52 },
  { x: 1.45, y: -0.55, z: 0.1, r: 0.5 },
  { x: 2.2, y: -0.55, z: -0.05, r: 0.5 },
  // mid row
  { x: -1.9, y: -0.1, z: 0.06, r: 0.6 },
  { x: -1.15, y: -0.1, z: -0.14, r: 0.62 },
  { x: -0.4, y: -0.1, z: 0.16, r: 0.6 },
  { x: 0.4, y: -0.1, z: -0.12, r: 0.6 },
  { x: 1.15, y: -0.1, z: 0.14, r: 0.62 },
  { x: 1.9, y: -0.1, z: -0.06, r: 0.6 },
  // upper row
  { x: -1.3, y: 0.38, z: -0.08, r: 0.52 },
  { x: -0.5, y: 0.38, z: 0.14, r: 0.54 },
  { x: 0.3, y: 0.38, z: -0.16, r: 0.52 },
  { x: 1.1, y: 0.38, z: 0.1, r: 0.52 },
  // top lobes and caps
  { x: -1.15, y: 0.75, z: -0.05, r: 0.5 },
  { x: 0.05, y: 0.85, z: 0.05, r: 0.55 },
  { x: 1.25, y: 0.72, z: -0.02, r: 0.44 },
  { x: -0.45, y: 1.1, z: -0.12, r: 0.3 },
  { x: 0.7, y: 1.15, z: 0.08, r: 0.28 },
  // filler puffs for volume
  { x: -1.6, y: 0.15, z: 0.18, r: 0.36 },
  { x: -0.3, y: -0.35, z: -0.2, r: 0.42 },
  { x: 0.9, y: -0.45, z: 0.16, r: 0.4 },
  { x: 1.9, y: -0.2, z: -0.14, r: 0.44 },
  { x: 0.35, y: 0.55, z: 0.24, r: 0.34 },
  { x: -2.0, y: -0.6, z: -0.1, r: 0.34 },
  { x: 2.2, y: -0.55, z: 0.1, r: 0.36 },
  { x: -0.8, y: 0.05, z: -0.22, r: 0.4 },
  { x: 1.5, y: 0.25, z: 0.2, r: 0.38 },
  { x: 0.0, y: 0.0, z: 0.1, r: 0.5 },
  { x: -1.05, y: -0.65, z: 0.18, r: 0.32 },
  { x: 1.75, y: -0.6, z: -0.18, r: 0.32 },
  { x: -0.55, y: 0.95, z: -0.12, r: 0.26 },
  { x: 1.0, y: 0.95, z: 0.1, r: 0.26 },
  { x: -1.75, y: -0.15, z: 0.12, r: 0.38 },
  { x: 0.55, y: -0.6, z: -0.08, r: 0.4 },
  { x: -0.05, y: 1.35, z: 0.02, r: 0.18 },
  { x: 2.45, y: -0.35, z: 0.0, r: 0.26 },
  { x: -2.45, y: -0.35, z: 0.05, r: 0.26 },
  { x: 0.6, y: 0.62, z: -0.2, r: 0.32 },
  { x: -1.45, y: 0.5, z: -0.16, r: 0.32 },
  { x: 1.9, y: 0.45, z: 0.12, r: 0.3 },
  { x: -0.05, y: -0.7, z: 0.05, r: 0.38 },
];

export function createCloud() {
  const group = new THREE.Group();
  group.name = 'cloud';

  const drift = new THREE.Group();
  drift.name = 'drift';
  group.add(drift);

  const geometry = new THREE.SphereGeometry(1, 24, 16);

  PUFF_SPECS.forEach((spec, i) => {
    const puff = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? STEEL : INK,
        transparent: true,
        depthWrite: false,
        opacity: 0.24 + 0.18 * (i % 3) * 0.5,
      })
    );
    puff.name = `puff-${i}`;
    puff.position.set(spec.x, spec.y, spec.z);
    puff.scale.setScalar(spec.r);
    puff.userData = {
      baseOpacity: puff.material.opacity,
      baseScale: spec.r,
      phase: i * 1.31,
      speed: 0.5 + (i % 5) * 0.22,
      amp: 0.02 + (i % 4) * 0.005,
    };
    drift.add(puff);
  });

  return group;
}

export function updateCloud(group, delta) {
  const time = (group.userData.time ?? 0) + delta;
  group.userData.time = time;

  const drift = group.getObjectByName('drift');
  drift.position.x = Math.sin(time * 0.08) * 0.35;

  drift.children.forEach((puff) => {
    const { phase, speed, amp, baseScale } = puff.userData;
    puff.scale.setScalar(baseScale * (1 + Math.sin(time * speed + phase) * amp));
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/cloud.test.js`
Expected: PASS — 7 tests, 0 failures.

- [ ] **Step 5: Remove the old core module**

Run: `git rm src/core.js tests/core.test.js`
Expected: both files staged for deletion.

- [ ] **Step 6: Run full suite and commit**

Run: `npm test`
Expected: PASS — cloud tests only now (scroll tests still pass unchanged; they touch `scroll.js`, not `core.js`).

```bash
git add src/cloud.js tests/cloud.test.js
git commit -m "feat: volumetric billowing cloud scene module"
```

---
### Task 2: Rewire scene, scroll, and main to the cloud

**Files:**
- Modify: `src/scene.js` (full rewrite of body below)
- Modify: `src/scroll.js:9-18` (key renames)
- Modify: `src/main.js:2,22,56-58` (import + `createCloud`)
- Test: `tests/scroll.test.js` (key renames)

**Interfaces:**
- Consumes: `createCloud()` / `updateCloud(group, delta)` from Task 1; `getSceneState(progress)` from `scroll.js` returning `{ cloudOpacity, cloudScale, cloudOffsetX, cameraZ, cameraY }`.
- Produces: `scene.start(cloudGroup, animate)` — the `cloud` group's `position.x/y` and `scale` are driven by state; puff opacity = `state.cloudOpacity * puff.userData.baseOpacity`. State keys: `cloudOpacity`, `cloudScale`, `cloudOffsetX`, `cloudBaseX`, `cameraZ`, `cameraY`, `mouseX`, `mouseY`.

- [ ] **Step 1: Update the failing scroll test**

In `tests/scroll.test.js`, replace every `coreOpacity` with `cloudOpacity`, `coreScale` with `cloudScale`, `coreOffsetX` with `cloudOffsetX` (6 usages: lines 7, 8, 9, 16, 22, 23, 25, 31 — 8 total). Also change the test name `'dims, scales down and shifts the core at the end of the page'` to `'dims, scales down and shifts the cloud at the end of the page'`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/scroll.test.js`
Expected: FAIL — `s.coreOpacity is undefined` (scroll.js still returns old keys).

- [ ] **Step 3: Rename keys in `src/scroll.js`**

Replace the return block of `getSceneState`:

```js
  return {
    cloudOpacity: Math.max(0.1, dim),
    cloudScale: 1 - beyond * 0.45,
    cloudOffsetX: beyond * 2.2,
    cameraZ: 5 + beyond * 0.8,
    cameraY: beyond > 0 ? -beyond * 0.6 : 0,
  };
```

- [ ] **Step 4: Rewrite `src/scene.js`**

Replace the entire file content with:

```js
import * as THREE from 'three';
import { updateCloud } from './cloud.js';

export function createScene({ canvas }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1c3c);
  scene.fog = new THREE.Fog(0x0a1c3c, 6, 14);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  const grid = new THREE.GridHelper(22, 22, 0x2a4a7f, 0x1b3a66);
  grid.position.y = -2.4;
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  scene.add(grid);

  let cloud = null;
  const clock = new THREE.Clock();
  let rafId = null;

  const state = {
    cloudOpacity: 1,
    cloudScale: 1,
    cloudOffsetX: 0,
    cloudBaseX: 0,
    cameraZ: 5,
    cameraY: 0,
    mouseX: 0,
    mouseY: 0,
  };

  function render() {
    const delta = Math.min(clock.getDelta(), 0.05);
    if (cloud) updateCloud(cloud, delta);

    if (cloud) {
      const targetX = state.cloudBaseX + state.cloudOffsetX + state.mouseX * 0.25;
      const targetY = -state.mouseY * 0.2;
      cloud.position.x += (targetX - cloud.position.x) * 0.06;
      cloud.position.y += (targetY - cloud.position.y) * 0.06;
      cloud.scale.setScalar(state.cloudScale);
      cloud.traverse((child) => {
        if (child.material) child.material.opacity = state.cloudOpacity * child.userData.baseOpacity;
      });
    }

    camera.position.z += (state.cameraZ - camera.position.z) * 0.06;
    camera.position.y += (state.cameraY - camera.position.y) * 0.06;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function frame() {
    rafId = requestAnimationFrame(frame);
    if (document.hidden) return;
    render();
  }

  return {
    start(cloudGroup, animate = true) {
      cloud = cloudGroup;
      if (cloud && !cloud.parent) scene.add(cloud);
      clock.start();
      render();
      if (animate) frame();
    },
    updateState(patch) {
      Object.assign(state, patch);
    },
    resize(w, h) {
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    render,
    dispose() {
      cancelAnimationFrame(rafId);
      renderer.dispose();
    },
  };
}
```

- [ ] **Step 5: Update `src/main.js`**

Three edits:
1. Line 2: `import { createCore } from './core.js';` → `import { createCloud } from './cloud.js';`
2. Line 22: `scene.updateState({ coreBaseX: aspect >= 1 ? 2.0 : 0 });` → `scene.updateState({ cloudBaseX: aspect >= 1 ? 2.0 : 0 });`
3. Lines 56–58:
```js
  const core = createCore();
```
→
```js
  const cloud = createCloud();
```
and line 58 `scene.start(core, !reduceMotion);` → `scene.start(cloud, !reduceMotion);`

- [ ] **Step 6: Run tests and build**

Run: `npm test && npm run build`
Expected: all tests PASS; Vite build completes with `dist/` emitted, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/scene.js src/scroll.js src/main.js tests/scroll.test.js
git commit -m "feat: wire cloud scene into scroll/mouse state, fog and grid"
```

---
### Task 3: Softened blueprint styling + readability scrim

**Files:**
- Modify: `index.html:14` (add scrim div after canvas)
- Modify: `src/styles.css` (token + targeted border/opacity softening)

**Interfaces:**
- Consumes: nothing.
- Produces: `.scrim` fixed overlay between canvas (z-index 0) and content (z-index 1); `--hairline-soft` token; softer hairlines on sheets, cards, rails, rules, footer; quieter FIG labels; more generous section padding.

- [ ] **Step 1: Add the scrim element to `index.html`**

Replace lines 13–14:

```html
<body>
  <canvas id="bg-canvas" aria-hidden="true"></canvas>
  <div class="scrim" aria-hidden="true"></div>
```

- [ ] **Step 2: Add tokens and scrim styles to `src/styles.css`**

In the `:root` block, add after `--hairline: #2a4a7f;` (line 6):

```css
  --hairline-soft: rgba(42, 74, 127, 0.5);
```

Add after the `#bg-canvas` rule (line 41):

```css
.scrim {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(115% 85% at 50% 42%, transparent 45%, rgba(10, 28, 60, 0.5) 100%),
    linear-gradient(180deg, rgba(10, 28, 60, 0.22), transparent 28%, transparent 72%, rgba(10, 28, 60, 0.4));
}
```

- [ ] **Step 3: Soften borders and section rhythm**

Apply these edits to `src/styles.css`:

1. Line 54: `section { padding: 96px 0; }` → `section { padding: 112px 0; }`
2. Line 57: `.sheet {` → keep, but line 58 `border-top: 1px solid var(--hairline);` → `border-top: 1px solid var(--hairline-soft);` and line 59 `background: rgba(10, 28, 60, 0.55);` → `background: rgba(10, 28, 60, 0.5);`
3. `.sheet-rule::before` (line 94): `background: var(--hairline);` → `background: var(--hairline-soft);`
4. `.sheet-rule::after` (line 100): `border: 1px solid var(--hairline);` → `border: 1px solid var(--hairline-soft);`
5. `nav.scrolled` (line 118): `border-bottom-color: var(--hairline);` → `border-bottom-color: var(--hairline-soft);`
6. `.stamp` (line 209): `border: 1px solid var(--hairline);` → `border: 1px solid var(--hairline-soft);`
7. `.spec-stats` (line 283): `border: 1px solid var(--hairline);` → `border: 1px solid var(--hairline-soft);`
8. `.spec-row` (line 290): `border-bottom: 1px solid var(--hairline);` → `border-bottom: 1px solid var(--hairline-soft);`
9. `.rev-rail` (line 315): `background: var(--hairline);` → `background: var(--hairline-soft);`
10. `.project-card` (line 343): `border: 1px solid var(--hairline);` → `border: 1px solid var(--hairline-soft);`
11. `.prj-tag` (line 395): `border: 1px solid var(--hairline);` → `border: 1px solid var(--hairline-soft);`
12. `.edu-block` (line 431): `border: 1px solid var(--hairline);` → `border: 1px solid var(--hairline-soft);`
13. `.cert-item` (line 446): `border-bottom: 1px solid rgba(42, 74, 127, 0.5);` → `border-bottom: 1px solid rgba(42, 74, 127, 0.3);`
14. `footer` (line 465): `border-top: 1px solid var(--hairline);` → `border-top: 1px solid var(--hairline-soft);`
15. `.tb-grid` (lines 497–498): both `border-top` and `border-bottom` `1px solid var(--hairline)` → `1px solid var(--hairline-soft)`
16. `.fig-label` (lines 63–71): change to
```css
.fig-label {
  font-family: var(--mono);
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(126, 156, 201, 0.78);
  margin-bottom: 14px;
}
```
17. `.fig-tag` (lines 214–222): change `color: var(--steel);` → `color: rgba(126, 156, 201, 0.78);`

- [ ] **Step 4: Verify styling build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add index.html src/styles.css
git commit -m "style: soften blueprint hairlines, add readability scrim"
```

---
### Task 4: Docs and final verification

**Files:**
- Modify: `README.md` (features, structure, description)

- [ ] **Step 1: Update README**

1. Line 5, replace the description paragraph with:
```
A fixed full-screen three.js canvas sits behind all content, rendering a large volumetric billowing cloud made of translucent puff spheres with gentle wind-drift and breathing motion. Scroll and mouse input drive camera and cloud state, and the whole scene degrades gracefully when WebGL is unavailable.
```
2. Line 9, replace the feature bullet with:
```
- **3D hero scene** — a single volumetric cloud of 45 translucent puff spheres with per-puff breathing and slow sideways drift, built from a `THREE.Group` in `cloud.js`
```
3. Line 13 (blueprint bullet), change "Blueprint aesthetic — technical-drawing styling" to "Blueprint aesthetic, softened — technical-drawing styling with lighter hairlines".
4. Lines 42–51, replace the structure block:
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

- [ ] **Step 2: Full verification**

Run: `npm test && npm run build`
Expected: all tests PASS, build succeeds with no warnings.

Run: `npm run preview` (keep running in a separate terminal)
Expected smoke checks in the browser:
- Cloud renders behind the hero, reads as a wide flat-bottomed cloud with lobes on top, soft translucent puffs merging together
- Cloud slowly drifts sideways and puffs subtly breathe
- Scrolling dims, shrinks, and shifts the cloud aside; text stays readable (scrim + sheet blur)
- Mouse parallax tilts the cloud
- `prefers-reduced-motion: reduce` shows a single static frame (set via devtools rendering tab)
- Nav, mobile menu, reveals work; no console errors

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: describe cloud scene in README"
```

## Self-Review Notes

- **Spec coverage:** cloud construction + fog/grid (Task 1–2), motion drift/breathing (Task 1), scroll/mouse mappings preserved (Task 2), styling softening + scrim (Task 3), docs + verification (Task 4). All spec sections covered.
- **Type consistency:** `createCloud`/`updateCloud` signatures consistent across Tasks 1–2; state keys `cloudOpacity/cloudScale/cloudOffsetX/cloudBaseX` consistent in scroll.js, scene.js, main.js, scroll.test.js; `userData.baseOpacity` used in both cloud.js (set) and scene.js (read).
- **Opacity invariant:** base opacities 0.24–0.42 (Task 1), scroll dim floor 0.1 × base → max product 0.42 < 1. Never overridden.
