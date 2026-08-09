# Portfolio 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a three.js-powered portfolio website for Muhammad Ario Bagus Prakusa with a scroll-driven 3D hero (wireframe icosahedron core), keeping the existing blueprint aesthetic, in a new repo at `/home/mariobgsp/Project/github/portfolio-3d`.

**Architecture:** A Vite + vanilla JS static site. One fixed full-screen three.js canvas sits behind all content (`z-index` below). Modules are split by responsibility: `core.js` builds the 3D object group, `scroll.js` maps scroll/mouse input to scene state (pure functions), `scene.js` owns renderer/camera/loop, `main.js` wires everything, `ui.js` handles nav + scroll reveals. Content is copied from the existing `mariobgsp.github.io/index.html` and resume.

**Tech Stack:** Vite 6, three.js (^0.170), vitest 3 for unit tests (node environment — three geometry classes work headless). No TypeScript, no React, no textures/assets.

## Global Constraints

- Vanilla JS only — no framework, no TypeScript.
- `vite.config.js` uses `base: './'` so the build works on GitHub Pages subpaths.
- Palette tokens: paper `#0a1c3c`, paper-2 `#0e2347`, ink `#dfe9ff`, steel `#7e9cc9`, hairline `#2a4a7f`, accent `#ff7a3d`.
- Fonts: Space Grotesk (sans) + IBM Plex Mono (mono) from Google Fonts.
- Canvas is `aria-hidden="true"`; all information lives in semantic HTML.
- Full `prefers-reduced-motion: reduce` support: scene renders once, static; no scroll/mouse-driven motion.
- `renderer.setPixelRatio` capped at 2; render loop pauses while `document.hidden`.
- No textures anywhere — colors only via materials.
- New repo, local git only. **Never push to any remote.**
- Test command: `npm test` (vitest run). Build: `npm run build`. Preview: `npm run preview`.

---

### Task 1: Scaffold Vite project with shell page

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `.gitignore`
- Create: `index.html` (shell — full content comes in Task 6)
- Create: `src/styles.css` (empty placeholder for now)
- Create: `src/main.js` (placeholder that imports and does nothing yet)

**Interfaces:**
- Produces: runnable dev/build toolchain (`npm run dev`, `npm run build`, `npm test`). Later tasks add real code to `src/`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "portfolio-3d",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "three": "^0.170.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
dist/
.worktrees/
.superpowers/
```

- [ ] **Step 4: Create `index.html` shell**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Muhammad Ario Bagus Prakusa — Software Engineer, Backend & Microservices</title>
  <meta name="description" content="Software Engineer with 4+ years designing and scaling Java/Spring and Go microservices for banking and telecommunications across ID, SG, MY, and CHN markets.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./src/styles.css">
</head>
<body>
  <canvas id="bg-canvas" aria-hidden="true"></canvas>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create placeholder `src/main.js`**

```js
console.log('portfolio-3d booting');
```

- [ ] **Step 6: Create empty `src/styles.css`** — one comment line: `/* styles land in Task 6 */`

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: node_modules created, three/vite/vitest resolved, no errors.

- [ ] **Step 8: Verify toolchain**

Run: `npm test`
Expected: "No test files found" exit code 1 — acceptable at this stage (no tests yet).
Run: `npm run build`
Expected: dist/ produced without errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold vite + three.js project"
```

---

### Task 2: `core.js` — build the 3D hero object

**Files:**
- Create: `src/core.js`
- Test: `tests/core.test.js`

**Interfaces:**
- Consumes: nothing (three.js only).
- Produces:
  - `createCore()` → `THREE.Group` named `'core'`, containing children named `'icosahedron'` (wireframe Mesh), `'ring-1'` and `'ring-2'` (thin torus Meshes), `'particles'` (THREE.Points, exactly 900 points).
  - `updateCore(group, delta)` → void; rotates icosahedron (x+=0.25·delta, y+=0.4·delta), ring-1 z+=0.2·delta, ring-2 z-=0.3·delta.

- [ ] **Step 1: Write the failing test** — `tests/core.test.js`

```js
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createCore, updateCore } from '../src/core.js';

describe('createCore', () => {
  it('returns a Group named core', () => {
    const core = createCore();
    expect(core).toBeInstanceOf(THREE.Group);
    expect(core.name).toBe('core');
  });

  it('contains icosahedron, two rings and 900 particles', () => {
    const core = createCore();
    expect(core.getObjectByName('icosahedron')).toBeInstanceOf(THREE.Mesh);
    expect(core.getObjectByName('icosahedron').material.wireframe).toBe(true);
    expect(core.getObjectByName('ring-1')).toBeInstanceOf(THREE.Mesh);
    expect(core.getObjectByName('ring-2')).toBeInstanceOf(THREE.Mesh);
    const particles = core.getObjectByName('particles');
    expect(particles).toBeInstanceOf(THREE.Points);
    expect(particles.geometry.getAttribute('position').count).toBe(900);
  });

  it('rotates the icosahedron when updated', () => {
    const core = createCore();
    const ico = core.getObjectByName('icosahedron');
    const before = ico.rotation.y;
    updateCore(core, 1);
    expect(ico.rotation.y).toBeGreaterThan(before);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/core.js'`.

- [ ] **Step 3: Write `src/core.js`**

```js
import * as THREE from 'three';

const ACCENT = 0xff7a3d;
const STEEL = 0x7e9cc9;

export function createCore() {
  const group = new THREE.Group();
  group.name = 'core';

  const icosahedron = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 2),
    new THREE.MeshBasicMaterial({ color: ACCENT, wireframe: true })
  );
  icosahedron.name = 'icosahedron';
  group.add(icosahedron);

  const ring1 = createRing(1.55, Math.PI / 3, Math.PI / 5);
  ring1.name = 'ring-1';
  group.add(ring1);

  const ring2 = createRing(1.85, -Math.PI / 4, -Math.PI / 6);
  ring2.name = 'ring-2';
  group.add(ring2);

  const particles = new THREE.Points(
    createParticleGeometry(900),
    new THREE.PointsMaterial({ color: STEEL, size: 0.03, sizeAttenuation: true })
  );
  particles.name = 'particles';
  group.add(particles);

  return group;
}

function createRing(radius, rx, ry) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.008, 8, 120),
    new THREE.MeshBasicMaterial({ color: STEEL })
  );
  ring.rotation.set(rx, ry, 0);
  return ring;
}

function createParticleGeometry(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 1.3 + Math.random() * 1.9;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geo;
}

export function updateCore(group, delta) {
  const icosahedron = group.getObjectByName('icosahedron');
  const ring1 = group.getObjectByName('ring-1');
  const ring2 = group.getObjectByName('ring-2');
  icosahedron.rotation.x += delta * 0.25;
  icosahedron.rotation.y += delta * 0.4;
  ring1.rotation.z += delta * 0.2;
  ring2.rotation.z -= delta * 0.3;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/core.js tests/core.test.js
git commit -m "feat: wireframe icosahedron core with orbiting rings"
```

---

### Task 3: `scroll.js` — pure scroll/mouse → scene state mapping

**Files:**
- Create: `src/scroll.js`
- Test: `tests/scroll.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `getScrollProgress()` → number 0..1 (clamped) = `window.scrollY / (scrollHeight - innerHeight)`; returns 0 if max <= 0.
  - `getSceneState(progress)` → `{ coreOpacity, coreScale, coreOffsetX, cameraZ, cameraY }` — hero occupies first 30% of scroll; beyond that the core dims to 0.15, scales down to 0.55, shifts right by up to 2.2, camera pulls back 0.8 and drops 0.6.
  - `getMouseState(x, y, width, height)` → `{ nx, ny }` normalized to -1..1.

Exact mapping (must match tests):

```
heroEnd = 0.3
beyond = clamp((progress - heroEnd) / (1 - heroEnd), 0, 1)
dim = 1 - beyond * 0.85
coreOpacity = max(0.1, dim)
coreScale = 1 - beyond * 0.45
coreOffsetX = beyond * 2.2
cameraZ = 5 + beyond * 0.8
cameraY = -beyond * 0.6
```

- [ ] **Step 1: Write the failing test** — `tests/scroll.test.js`

```js
import { describe, it, expect } from 'vitest';
import { getSceneState, getMouseState } from '../src/scroll.js';

describe('getSceneState', () => {
  it('returns full-strength state at the top of the page', () => {
    const s = getSceneState(0);
    expect(s.coreOpacity).toBe(1);
    expect(s.coreScale).toBe(1);
    expect(s.coreOffsetX).toBe(0);
    expect(s.cameraZ).toBe(5);
    expect(s.cameraY).toBe(0);
  });

  it('stays full-strength through the hero zone', () => {
    const s = getSceneState(0.3);
    expect(s.coreOpacity).toBe(1);
    expect(s.coreOffsetX).toBe(0);
  });

  it('dims, scales down and shifts the core at the end of the page', () => {
    const s = getSceneState(1);
    expect(s.coreOpacity).toBeCloseTo(0.15, 2);
    expect(s.coreScale).toBeCloseTo(0.55, 2);
    expect(s.coreOffsetX).toBeCloseTo(2.2, 2);
    expect(s.cameraZ).toBeCloseTo(5.8, 2);
    expect(s.cameraY).toBeCloseTo(-0.6, 2);
  });

  it('is monotonic in offsetX as progress grows', () => {
    const offsets = [0, 0.5, 1].map((p) => getSceneState(p).coreOffsetX);
    expect(offsets[0]).toBeLessThanOrEqual(offsets[1]);
    expect(offsets[1]).toBeLessThanOrEqual(offsets[2]);
  });
});

describe('getMouseState', () => {
  it('normalizes coordinates to -1..1', () => {
    expect(getMouseState(0, 0, 1000, 800)).toEqual({ nx: -1, ny: -1 });
    expect(getMouseState(1000, 800, 1000, 800)).toEqual({ nx: 1, ny: 1 });
    expect(getMouseState(500, 400, 1000, 800)).toEqual({ nx: 0, ny: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/scroll.js'`.

- [ ] **Step 3: Write `src/scroll.js`**

```js
export function getScrollProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

export function getSceneState(progress) {
  const heroEnd = 0.3;
  const beyond = Math.min(1, Math.max(0, (progress - heroEnd) / (1 - heroEnd)));
  const dim = 1 - beyond * 0.85;
  return {
    coreOpacity: Math.max(0.1, dim),
    coreScale: 1 - beyond * 0.45,
    coreOffsetX: beyond * 2.2,
    cameraZ: 5 + beyond * 0.8,
    cameraY: -beyond * 0.6,
  };
}

export function getMouseState(x, y, width, height) {
  return {
    nx: (x / width) * 2 - 1,
    ny: (y / height) * 2 - 1,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: 5 passing (4 state + 1 mouse).

- [ ] **Step 5: Commit**

```bash
git add src/scroll.js tests/scroll.test.js
git commit -m "feat: scroll and mouse state mapping"
```

---

### Task 4: `scene.js` — renderer, camera, animation loop

**Files:**
- Create: `src/scene.js`

**Interfaces:**
- Consumes: `createCore`, `updateCore` from `core.js`; `src/scroll.js` state shape `{ coreOpacity, coreScale, coreOffsetX, cameraZ, cameraY, mouseX, mouseY, coreBaseX }`.
- Produces:
  - `createScene({ canvas })` → object with:
    - `start(coreGroup, animate = true)` — adds core to scene, renders immediately; if `animate`, starts rAF loop.
    - `updateState(patch)` — merges patch into internal state (coreOpacity, coreScale, coreOffsetX, cameraZ, cameraY, mouseX, mouseY, coreBaseX).
    - `resize(w, h)` — renderer size + camera aspect.
    - `dispose()` — cancels rAF, disposes renderer.

Behavior:
- Scene background `0x0a1c3c` (navy void).
- GridHelper(22, 22, 0x2a4a7f, 0x1b3a66) at y=-2.4, opacity 0.35, transparent.
- Camera PerspectiveCamera(50, aspect, 0.1, 100), starts at (0, 0, 5), `lookAt(0,0,0)` each frame.
- Each frame: `updateCore(core, delta)` with delta clamped to 0.05; core position lerps toward `(coreBaseX + coreOffsetX + mouseX·0.25, -mouseY·0.2, 0)` with factor 0.06; scale set to `coreScale`; every child material opacity set to `coreOpacity`; camera z/y lerp toward state (factor 0.06).
- Render loop skips rendering (but keeps rAF alive) while `document.hidden`.
- Pixel ratio capped at 2.

- [ ] **Step 1: Write `src/scene.js`**

```js
import * as THREE from 'three';
import { updateCore } from './core.js';

export function createScene({ canvas }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1c3c);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  const grid = new THREE.GridHelper(22, 22, 0x2a4a7f, 0x1b3a66);
  grid.position.y = -2.4;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);

  let core = null;
  const clock = new THREE.Clock();
  let rafId = null;

  const state = {
    coreOpacity: 1,
    coreScale: 1,
    coreOffsetX: 0,
    coreBaseX: 0,
    cameraZ: 5,
    cameraY: 0,
    mouseX: 0,
    mouseY: 0,
  };

  function render() {
    const delta = Math.min(clock.getDelta(), 0.05);
    if (core) updateCore(core, delta);

    if (core) {
      const targetX = state.coreBaseX + state.coreOffsetX + state.mouseX * 0.25;
      const targetY = -state.mouseY * 0.2;
      core.position.x += (targetX - core.position.x) * 0.06;
      core.position.y += (targetY - core.position.y) * 0.06;
      core.scale.setScalar(state.coreScale);
      core.children.forEach((child) => {
        if (child.material) child.material.opacity = state.coreOpacity;
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
    start(coreGroup, animate = true) {
      core = coreGroup;
      if (core && !core.parent) scene.add(core);
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
    dispose() {
      cancelAnimationFrame(rafId);
      renderer.dispose();
    },
  };
}
```

- [ ] **Step 2: Browser smoke test**

Run: `npm run dev`, open http://localhost:5173.
Expected: navy page, nothing visible yet (main.js is placeholder). No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/scene.js
git commit -m "feat: three.js scene with camera, grid and render loop"
```

---

### Task 5: `main.js` — boot, wiring, reduced-motion

**Files:**
- Create/Modify: `src/main.js` (replace placeholder)

**Interfaces:**
- Consumes: `createScene` (scene.js), `createCore` (core.js), `getScrollProgress`/`getSceneState`/`getMouseState` (scroll.js).
- Produces: nothing — side effects only. Boots the scene, wires scroll/resize/mouse events.

Behavior:
- Create canvas-bound scene, build core.
- `reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches`.
- On scroll (rAF-throttled): if not reduceMotion, `updateState(getSceneState(getScrollProgress()))`.
- On mousemove (rAF-throttled): if not reduceMotion, `updateState(getMouseState(...))`.
- On resize: `scene.resize(w, h)`; set `coreBaseX` = 2.0 when `aspect >= 1`, else 0; re-apply scroll state.
- `scene.start(core, !reduceMotion)` — animated normally, or one static render under reduced motion.
- Initial `coreBaseX` applied before start.

- [ ] **Step 1: Replace `src/main.js`**

```js
import { createScene } from './scene.js';
import { createCore } from './core.js';
import { getScrollProgress, getSceneState, getMouseState } from './scroll.js';
import { initNav, initReveals } from './ui.js';

const canvas = document.getElementById('bg-canvas');
const scene = createScene({ canvas });
const core = createCore();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function applyScrollState() {
  scene.updateState(getSceneState(getScrollProgress()));
}

function applyLayoutState() {
  const aspect = window.innerWidth / window.innerHeight;
  scene.updateState({ coreBaseX: aspect >= 1 ? 2.0 : 0 });
  applyScrollState();
}

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (reduceMotion || scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    applyScrollState();
    scrollTicking = false;
  });
}, { passive: true });

let mouseTicking = false;
window.addEventListener('mousemove', (e) => {
  if (reduceMotion || mouseTicking) return;
  mouseTicking = true;
  requestAnimationFrame(() => {
    const { nx, ny } = getMouseState(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
    scene.updateState({ mouseX: nx, mouseY: ny });
    mouseTicking = false;
  });
}, { passive: true });

window.addEventListener('resize', () => {
  scene.resize(window.innerWidth, window.innerHeight);
  applyLayoutState();
});

applyLayoutState();
scene.start(core, !reduceMotion);
initNav();
initReveals();
```

Note: `src/ui.js` does not exist yet — create it in Task 7. To smoke-test this task before then, temporarily comment the `initNav`/`initReveals` lines, verify, then restore and let Task 7 finish them. If skipped, run dev with those two lines commented.

- [ ] **Step 2: Browser smoke test**

Run: `npm run dev`. Expected: navy scene with blueprint grid floor and the orange wireframe icosahedron + two rings + particles floating at center (portrait) or right side (landscape). Scrolling dims/shifts the core; mouse moves it slightly. Resize keeps it visible.

- [ ] **Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: wire scene boot, scroll/mouse wiring, reduced-motion path"
```

---

### Task 6: Full page content and styles

**Files:**
- Modify: `index.html` (replace shell body with full content)
- Modify: `src/styles.css` (complete stylesheet)

**Interfaces:**
- Consumes: canvas `#bg-canvas` from shell; class hooks used by `ui.js` in Task 7: `#navbar`, `#navToggle`, `#navLinks`, `.nav-links a`, `.reveal`, `#about`, `#experience`, `#projects`, `#skills`, `#contact`.
- Produces: full static content — hero, about, experience, projects, skills/certifications, footer. Content copied from the existing site + resume.

- [ ] **Step 1: Replace the `<body>` content of `index.html`** (keep the existing `<head>` from Task 1 exactly; the two `<link>` tags before `<script>` — remove only the placeholder console script)

```html
  <canvas id="bg-canvas" aria-hidden="true"></canvas>

  <nav id="navbar">
    <div class="nav-inner">
      <a href="#hero" class="nav-logo">mario.dev</a>
      <ul class="nav-links" id="navLinks">
        <li><a href="#about">About</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <button class="nav-hamburger" id="navToggle" aria-label="Toggle navigation menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <main>
    <section id="hero">
      <div class="container hero-inner">
        <div class="hero-frame">
          <span class="stamp">Rev 2026 · Active</span>
          <span class="fig-tag">FIG. 01 — Profile</span>
          <h1 class="hero-name">Muhammad Ario<br>Bagus Prakusa</h1>
          <p class="hero-title">Software Engineer — Backend &amp; Microservices</p>
          <p class="hero-sub">
            Java/Spring and Go microservices for banking and telecom across ID, SG, MY,
            CHN — cutting 1M-record processing from ~6h to ~20min.
          </p>
          <div class="hero-actions">
            <a href="mailto:mariobgsp@gmail.com" class="btn btn-primary">Get in Touch</a>
            <a href="https://github.com/mariobgsp" target="_blank" rel="noopener" class="btn">GitHub</a>
            <a href="https://www.linkedin.com/in/mariobgsp/" target="_blank" rel="noopener" class="btn">LinkedIn</a>
          </div>
        </div>
      </div>
    </section>

    <section id="about" class="sheet">
      <div class="container">
        <div class="fig-label"><span class="fig-num">FIG. 02</span> — Background</div>
        <h2 class="sheet-title">About</h2>
        <div class="sheet-rule"></div>
        <div class="about-grid reveal">
          <div class="about-text">
            <p>
              Software Engineer with <strong>4+ years</strong> designing, building, and scaling
              <strong>Java/Spring and Go microservices</strong> for banking and telecommunications
              across regional ID, SG, MY, and CHN markets. Currently at <strong>OCBC</strong>;
              previously CIMB Niaga (CCPL Octo Smart team) and XL Axiata (E-Payment).
            </p>
            <p>
              Strong background in <strong>AI-augmented development</strong> (Windsurf, MCP),
              SOA migration, API design, and cross-border Scrum delivery. Proven performance work —
              cut batch processing for <strong>1M records from ~6 hours to ~20 minutes</strong>.
            </p>
            <p>
              Bachelor of Engineering in <strong>Engineering Physics</strong>, Universitas Gadjah Mada —
              thesis on emotion identification via thermal camera using CNNs.
            </p>
          </div>
          <div class="spec-stats">
            <div class="spec-row">
              <span class="spec-value">4+</span>
              <span class="spec-label">Years of Experience</span>
              <span class="spec-note">2021—</span>
            </div>
            <div class="spec-row">
              <span class="spec-value"><span class="orange">6h→20m</span></span>
              <span class="spec-label">Batch Processing, 1M Records</span>
              <span class="spec-note">94% faster</span>
            </div>
            <div class="spec-row">
              <span class="spec-value">4</span>
              <span class="spec-label">Regional Markets</span>
              <span class="spec-note">ID · SG · MY · CHN</span>
            </div>
            <div class="spec-row">
              <span class="spec-value">1M+</span>
              <span class="spec-label">Records Optimized</span>
              <span class="spec-note">financial data</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="experience" class="sheet">
      <div class="container">
        <div class="fig-label"><span class="fig-num">FIG. 03</span> — Career Log</div>
        <h2 class="sheet-title">Experience</h2>
        <div class="sheet-rule"></div>
        <div class="reveal">
          <div class="exp-item">
            <span class="rev-rail"></span>
            <div class="exp-date">Oct 2024 — Present</div>
            <div>
              <h3 class="exp-role">Software Engineer</h3>
              <div class="exp-company">OCBC Indonesia</div>
              <div class="exp-loc">BSD City, Greater Jakarta · On-site</div>
              <ul class="exp-list">
                <li>Collaborate across ID, SG, MY, and CHN markets to develop and scale regional business processes.</li>
                <li><strong>AI-Augmented Development:</strong> use Windsurf and MCP (Model Context Protocol) to accelerate coding, debugging, and system exploration.</li>
                <li><strong>Workflow Optimization:</strong> AI-driven workflows automate repetitive tasks, keeping code clean and architecture consistent.</li>
                <li><strong>API &amp; System Design:</strong> work with Technical Architects and Business Owners to design scalable APIs with rapid prototyping.</li>
                <li><strong>SOA Migration &amp; Innovation:</strong> Innovation Team building internal tools to speed up SOA migration and decouple legacy dependencies.</li>
                <li><strong>Full-Cycle Delivery:</strong> end-to-end lifecycle from coding and deployment to testing support for a multi-country user base.</li>
                <li><strong>Cross-Border Scrum:</strong> daily coordination with distributed teams across Southeast Asia and China.</li>
              </ul>
            </div>
          </div>
          <div class="exp-item">
            <span class="rev-rail"></span>
            <div class="exp-date">Jan 2024 — Oct 2024</div>
            <div>
              <h3 class="exp-role">Software Engineer</h3>
              <div class="exp-company">PT. Bank CIMB Niaga</div>
              <div class="exp-loc">Tangerang Selatan · Hybrid</div>
              <ul class="exp-list">
                <li>Developed and improved microservices with clean-code practices using Java 17, Spring, MySQL, and Git.</li>
                <li>Backend Engineer on the <strong>CCPL Octo Smart</strong> team; collaborated with Frontend Engineers and QA testers across the full SDLC.</li>
                <li>Cut processing time for <strong>1 million records from ~6 hours to ~20 minutes</strong>.</li>
              </ul>
            </div>
          </div>
          <div class="exp-item">
            <span class="rev-rail"></span>
            <div class="exp-date">Nov 2021 — Dec 2023</div>
            <div>
              <h3 class="exp-role">Software Engineer</h3>
              <div class="exp-company">PT. XL Axiata Tbk.</div>
              <div class="exp-loc">Yogyakarta · Remote</div>
              <ul class="exp-list">
                <li>Built and improved microservices with Java 17, Spring, Go, Echo, Solace, Oracle, PostgreSQL, Elasticsearch, Kubernetes, and GCP.</li>
                <li>Backend Developer on the <strong>E-Payment and Oracle Exit</strong> teams; Jira-based Agile with Product Owners, Scrum Masters, and Tech Leads.</li>
                <li>Published APIs to the <strong>API Gateway</strong> for internal and external users and supported system integrations.</li>
                <li>Developed a microservice that <strong>reduced pending-payment issues</strong> caused by delayed messages from publishers.</li>
              </ul>
            </div>
          </div>
          <div class="exp-item">
            <span class="rev-rail"></span>
            <div class="exp-date">Oct 2021 — Nov 2021</div>
            <div>
              <h3 class="exp-role">Java Programmer Trainee</h3>
              <div class="exp-company">Xsis Academy</div>
              <div class="exp-loc">Yogyakarta · On-site</div>
              <ul class="exp-list">
                <li>Intensive Java backend training covering Java, Docker, and RabbitMQ-based development.</li>
              </ul>
            </div>
          </div>
          <div class="exp-item">
            <span class="rev-rail"></span>
            <div class="exp-date">Mar 2021 — Jun 2021</div>
            <div>
              <h3 class="exp-role">Student Laboratory Assistant</h3>
              <div class="exp-company">Universitas Gadjah Mada (UGM)</div>
              <div class="exp-loc">Yogyakarta</div>
              <ul class="exp-list">
                <li>Data Communication Workshop/Practice at the Sensor and Telecontrol System Laboratory, Department of Nuclear Engineering and Engineering Physics.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="projects" class="sheet">
      <div class="container">
        <div class="fig-label"><span class="fig-num">FIG. 04</span> — Selected Work</div>
        <h2 class="sheet-title">Projects</h2>
        <div class="sheet-rule"></div>
        <div class="projects-grid reveal">
          <a href="https://github.com/mariobgsp/netto-spendo" target="_blank" rel="noopener" class="project-card">
            <span class="prj-index">PRJ-01</span>
            <h3 class="prj-name">Netto Spendo</h3>
            <p class="prj-desc">Minimalist expense tracking built for performance and UX — income/expense tracking, net balance, and financial health visualization in a dark interface.</p>
            <div class="prj-meta">
              <span class="prj-lang"><span class="lang-dot lang-ts"></span>TypeScript</span>
              <span class="prj-tag">Finance</span>
              <span class="prj-tag">UX</span>
            </div>
          </a>
          <a href="https://github.com/mariobgsp/physics-phenomena" target="_blank" rel="noopener" class="project-card">
            <span class="prj-index">PRJ-02</span>
            <h3 class="prj-name">PhysicsLab</h3>
            <p class="prj-desc">High-fidelity interactive suite of 37 physics simulations visualizing fundamental phenomena with premium aesthetics and pedagogical clarity.</p>
            <div class="prj-meta">
              <span class="prj-lang"><span class="lang-dot lang-ts"></span>TypeScript</span>
              <span class="prj-tag">Simulation</span>
              <span class="prj-tag">37 Labs</span>
            </div>
          </a>
          <a href="https://github.com/mariobgsp/local-postman" target="_blank" rel="noopener" class="project-card">
            <span class="prj-index">PRJ-03</span>
            <h3 class="prj-name">Local Postman</h3>
            <p class="prj-desc">Postman-like HTTP client that runs entirely on your machine — no account, no cloud, no telemetry. JSON-file storage, pre-request scripts, pm.test assertions, atomic persistence, full node:test suite. MIT licensed.</p>
            <div class="prj-meta">
              <span class="prj-lang"><span class="lang-dot lang-js"></span>JavaScript</span>
              <span class="prj-tag">Dev Tool</span>
              <span class="prj-tag">Local-First</span>
            </div>
          </a>
          <a href="https://github.com/mariobgsp/thermal-face-recognition" target="_blank" rel="noopener" class="project-card">
            <span class="prj-index">PRJ-04</span>
            <h3 class="prj-name">Thermal Face Recognition</h3>
            <p class="prj-desc">Thermal emotion recognition using CNNs — final-year thesis system for psychotherapy measurement instrumentation.</p>
            <div class="prj-meta">
              <span class="prj-lang"><span class="lang-dot lang-py"></span>Jupyter</span>
              <span class="prj-tag">AI / CNN</span>
              <span class="prj-tag">Thesis</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section id="skills" class="sheet">
      <div class="container">
        <div class="fig-label"><span class="fig-num">FIG. 05</span> — Spec Sheet</div>
        <h2 class="sheet-title">Skills &amp; Credentials</h2>
        <div class="sheet-rule"></div>
        <div class="skills-layout reveal">
          <div>
            <div class="spec-cluster">
              <h3 class="cluster-title">Languages &amp; Frameworks</h3>
              <ul class="cluster-list">
                <li class="cluster-item"><span class="check" aria-hidden="true">▣</span><span><b>Java, Spring Framework</b> — primary stack</span></li>
                <li class="cluster-item"><span class="check" aria-hidden="true">▣</span><span><b>Go, Echo</b> — microservices</span></li>
                <li class="cluster-item"><span class="check" aria-hidden="true">▣</span><span>Jakarta Persistence, React.js</span></li>
              </ul>
            </div>
            <div class="spec-cluster">
              <h3 class="cluster-title">Data &amp; Infrastructure</h3>
              <ul class="cluster-list">
                <li class="cluster-item"><span class="check" aria-hidden="true">▣</span><span>MySQL · PostgreSQL · Oracle · Elasticsearch</span></li>
                <li class="cluster-item"><span class="check" aria-hidden="true">▣</span><span>Kubernetes · Docker · RabbitMQ · Solace</span></li>
                <li class="cluster-item"><span class="check" aria-hidden="true">▣</span><span>Google Cloud Platform (GCP)</span></li>
              </ul>
            </div>
            <div class="spec-cluster">
              <h3 class="cluster-title">APIs &amp; Architecture</h3>
              <ul class="cluster-list">
                <li class="cluster-item"><span class="check" aria-hidden="true">▣</span><span>REST APIs · Microservices · SOA · API Gateway</span></li>
                <li class="cluster-item"><span class="check" aria-hidden="true">▣</span><span>OOP · Clean Code · SOLID Principles</span></li>
              </ul>
            </div>
            <div class="spec-cluster">
              <h3 class="cluster-title">Practices &amp; Tools</h3>
              <ul class="cluster-list">
                <li class="cluster-item"><span class="check" aria-hidden="true">▣</span><span><b>AI-Augmented Dev</b> — Windsurf, MCP</span></li>
                <li class="cluster-item"><span class="check" aria-hidden="true">▣</span><span>Agile/Scrum · Jira · Git · Full-Cycle Delivery</span></li>
                <li class="cluster-item"><span class="check" aria-hidden="true">▣</span><span>Languages: <b>Bahasa Indonesia</b> (native) · <b>English</b> (professional)</span></li>
              </ul>
            </div>
            <div class="edu-block">
              <div class="edu-degree">B.Eng, Engineering Physics</div>
              <div class="edu-school">Universitas Gadjah Mada</div>
              <div class="edu-date">Aug 2017 — Jul 2021</div>
              <p class="edu-thesis">Thesis: Design of Emotion Identification System based on Thermal Camera Image with CNN Classification for Psychotherapy Measurement Instrumentation.</p>
            </div>
          </div>
          <div>
            <div class="spec-cluster">
              <h3 class="cluster-title">Certifications</h3>
              <ul class="cert-list">
                <li class="cert-item"><span class="cert-year">2026</span><span class="cert-name">Software Architecture &amp; Technology of Large-Scale Systems <span class="cert-issuer">— Udemy</span></span></li>
                <li class="cert-item"><span class="cert-year">2025</span><span class="cert-name">React: Creating and Hosting a Full-Stack Site <span class="cert-issuer">— LinkedIn</span></span></li>
                <li class="cert-item"><span class="cert-year">2025</span><span class="cert-name">Learning Full-Stack JavaScript Development: MongoDB, Node, and React <span class="cert-issuer">— LinkedIn</span></span></li>
                <li class="cert-item"><span class="cert-year">2025</span><span class="cert-name">Project Management Foundations <span class="cert-issuer">— LinkedIn</span></span></li>
                <li class="cert-item"><span class="cert-year">2025</span><span class="cert-name">SOLID Principles: Introducing Software Architecture &amp; Design <span class="cert-issuer">— Udemy</span></span></li>
                <li class="cert-item"><span class="cert-year">2025</span><span class="cert-name">React Essential Training <span class="cert-issuer">— LinkedIn</span></span></li>
                <li class="cert-item"><span class="cert-year">2023</span><span class="cert-name">Working with Microservices in Go (Golang) <span class="cert-issuer">— Udemy</span></span></li>
                <li class="cert-item"><span class="cert-year">2023</span><span class="cert-name">Go: The Complete Developer's Guide <span class="cert-issuer">— Udemy</span></span></li>
                <li class="cert-item"><span class="cert-year">2021</span><span class="cert-name">PHP &amp; MySQL — Certification Course for Beginners <span class="cert-issuer">— Udemy</span></span></li>
                <li class="cert-item"><span class="cert-year">2020</span><span class="cert-name">HTML, JavaScript, &amp; Bootstrap — Certification Course <span class="cert-issuer">— Udemy</span></span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer id="contact">
    <div class="container">
      <div class="title-block reveal">
        <div class="tb-title">
          <span class="tb-name">Muhammad Ario Bagus Prakusa</span>
          <span class="tb-rev">REV 2026 — Sheet 1 of 1</span>
        </div>
        <div class="tb-grid">
          <div class="tb-cell">
            <div class="tb-label">Email</div>
            <div class="tb-value"><a href="mailto:mariobgsp@gmail.com">mariobgsp@gmail.com</a></div>
          </div>
          <div class="tb-cell">
            <div class="tb-label">GitHub</div>
            <div class="tb-value"><a href="https://github.com/mariobgsp" target="_blank" rel="noopener">@mariobgsp</a></div>
          </div>
          <div class="tb-cell">
            <div class="tb-label">LinkedIn</div>
            <div class="tb-value"><a href="https://www.linkedin.com/in/mariobgsp/" target="_blank" rel="noopener">in/mariobgsp</a></div>
          </div>
          <div class="tb-cell">
            <div class="tb-label">Location</div>
            <div class="tb-value">Tangerang Selatan, Indonesia</div>
          </div>
        </div>
        <div class="tb-foot">
          <span>&copy; 2026 Muhammad Ario Bagus Prakusa</span>
          <span class="tb-sheet-num">SCALE 1:1 — ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </div>
  </footer>

  <script type="module" src="./src/main.js"></script>
```

(End of body replacement — keep the closing `</body></html>` from the shell.)

- [ ] **Step 2: Replace `src/styles.css`** with the complete stylesheet

```css
/* ===== TOKENS ===== */
:root {
  --paper: #0a1c3c;
  --paper-2: #0e2347;
  --ink: #dfe9ff;
  --steel: #7e9cc9;
  --hairline: #2a4a7f;
  --accent: #ff7a3d;
  --mono: 'IBM Plex Mono', ui-monospace, monospace;
  --sans: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  --ease: 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ===== RESET & BASE ===== */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-padding-top: 72px; }

@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}

body {
  font-family: var(--sans);
  color: var(--ink);
  line-height: 1.65;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; }

#bg-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  display: block;
}

/* ===== LAYOUT ===== */
.container {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 28px;
}

main { position: relative; z-index: 1; }

section { padding: 96px 0; }

.sheet {
  border-top: 1px solid var(--hairline);
  background: rgba(10, 28, 60, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.fig-label {
  font-family: var(--mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--steel);
  margin-bottom: 14px;
}

.fig-label .fig-num { color: var(--accent); }

.sheet-title {
  font-size: clamp(1.9rem, 3.4vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.08;
  margin-bottom: 18px;
}

.sheet-rule {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

.sheet-rule::before {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--hairline);
}

.sheet-rule::after {
  content: '';
  width: 9px;
  height: 9px;
  border: 1px solid var(--hairline);
  transform: rotate(45deg);
}

/* ===== NAVIGATION ===== */
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  border-bottom: 1px solid transparent;
  transition: border-color var(--ease), background-color var(--ease);
}

nav.scrolled {
  background: rgba(10, 28, 60, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom-color: var(--hairline);
}

.nav-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 28px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-family: var(--mono);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 28px;
}

.nav-links a {
  font-family: var(--mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--steel);
  transition: color var(--ease);
}

.nav-links a:hover,
.nav-links a.active { color: var(--accent); }

.nav-hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 6px;
}

.nav-hamburger span {
  width: 22px;
  height: 2px;
  background: var(--ink);
  transition: transform var(--ease), opacity var(--ease);
}

@media (max-width: 760px) {
  .nav-hamburger { display: flex; }
  .nav-links {
    position: fixed;
    top: 64px;
    left: 0; right: 0;
    flex-direction: column;
    gap: 0;
    background: rgba(10, 28, 60, 0.96);
    border-bottom: 1px solid var(--hairline);
    padding: 12px 28px 20px;
    display: none;
  }
  .nav-links.open { display: flex; }
  .nav-links a { display: block; padding: 10px 0; }
}

/* ===== HERO ===== */
#hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-inner { width: 100%; }

.hero-frame { max-width: 560px; }

.stamp {
  display: inline-block;
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
  border: 1px solid var(--hairline);
  padding: 4px 10px;
  margin-bottom: 26px;
}

.fig-tag {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--steel);
  display: block;
  margin-bottom: 14px;
}

.hero-name {
  font-size: clamp(2.6rem, 6vw, 4.2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.04;
  margin-bottom: 18px;
}

.hero-title {
  font-size: clamp(1rem, 1.6vw, 1.2rem);
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 14px;
}

.hero-sub {
  color: var(--steel);
  max-width: 480px;
  margin-bottom: 32px;
}

.hero-actions { display: flex; flex-wrap: wrap; gap: 14px; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--mono);
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-decoration: none;
  border: 1px solid var(--hairline);
  color: var(--ink);
  padding: 10px 20px;
  transition: border-color var(--ease), color var(--ease), background-color var(--ease);
}

.btn:hover { border-color: var(--accent); color: var(--accent); }

.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--paper);
  font-weight: 600;
}

.btn-primary:hover { background: transparent; color: var(--accent); }

/* ===== ABOUT ===== */
.about-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 56px;
  align-items: start;
}

.about-text p { margin-bottom: 16px; color: var(--ink); }
.about-text strong { color: var(--accent); }

.spec-stats { border: 1px solid var(--hairline); }

.spec-row {
  display: grid;
  grid-template-columns: 96px 1fr;
  grid-template-areas:
    'value label'
    'value note';
  padding: 18px 20px;
  border-bottom: 1px solid var(--hairline);
}

.spec-row:last-child { border-bottom: 0; }

.spec-value { grid-area: value; font-size: 1.6rem; font-weight: 700; color: var(--accent); }
.spec-label { grid-area: label; font-weight: 600; }
.spec-note { grid-area: note; font-family: var(--mono); font-size: 0.72rem; color: var(--steel); letter-spacing: 0.05em; text-transform: uppercase; }
.orange { color: var(--accent); }

/* ===== EXPERIENCE ===== */
.exp-item {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 28px;
  padding: 22px 0 22px 20px;
  position: relative;
}

.rev-rail {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 2px;
  background: var(--hairline);
}

.exp-date {
  font-family: var(--mono);
  font-size: 0.8rem;
  color: var(--steel);
  letter-spacing: 0.04em;
}

.exp-role { font-size: 1.15rem; margin-bottom: 2px; }
.exp-company { color: var(--accent); font-weight: 600; margin-bottom: 2px; }
.exp-loc { font-family: var(--mono); font-size: 0.75rem; color: var(--steel); margin-bottom: 12px; }

.exp-list { margin-left: 18px; }

.exp-list li { margin-bottom: 6px; }
.exp-list strong { color: var(--accent); }

/* ===== PROJECTS ===== */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}

.project-card {
  display: block;
  border: 1px solid var(--hairline);
  padding: 26px 26px 22px;
  text-decoration: none;
  position: relative;
  transition: border-color var(--ease), transform var(--ease);
}

.project-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
}

.prj-index {
  position: absolute;
  top: 14px; right: 16px;
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  color: var(--steel);
}

.prj-name { font-size: 1.2rem; margin-bottom: 10px; color: var(--ink); }

.prj-desc { color: var(--steel); font-size: 0.92rem; margin-bottom: 18px; }

.prj-meta { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }

.prj-lang {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--steel);
}

.lang-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.lang-ts { background: #3178c6; }
.lang-js { background: #f7df1e; }
.lang-py { background: #ffd343; }

.prj-tag {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--steel);
  border: 1px solid var(--hairline);
  padding: 2px 8px;
}

/* ===== SKILLS ===== */
.skills-layout {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 48px;
  align-items: start;
}

.spec-cluster { margin-bottom: 32px; }

.cluster-title {
  font-family: var(--mono);
  font-size: 0.74rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 12px;
}

.cluster-list { list-style: none; }

.cluster-item {
  display: flex;
  gap: 10px;
  align-items: baseline;
  margin-bottom: 8px;
  font-size: 0.94rem;
}

.check { color: var(--accent); font-size: 0.8rem; }

.edu-block {
  border: 1px solid var(--hairline);
  padding: 20px;
}

.edu-degree { font-weight: 700; }
.edu-school { color: var(--accent); font-weight: 600; }
.edu-date { font-family: var(--mono); font-size: 0.75rem; color: var(--steel); margin-bottom: 10px; }
.edu-thesis { color: var(--steel); font-size: 0.9rem; }

.cert-list { list-style: none; }

.cert-item {
  display: flex;
  gap: 14px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(42, 74, 127, 0.5);
}

.cert-item:last-child { border-bottom: 0; }

.cert-year {
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--accent);
  flex-shrink: 0;
}

.cert-name { font-size: 0.92rem; }
.cert-issuer { color: var(--steel); font-size: 0.85rem; }

/* ===== FOOTER ===== */
footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--hairline);
  background: rgba(10, 28, 60, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 72px 0 40px;
}

.title-block { margin-top: 40px; }

.tb-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.tb-name { font-size: 1.5rem; font-weight: 700; }

.tb-rev {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--steel);
}

.tb-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  border-top: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
  padding: 26px 0;
}

.tb-label {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--steel);
  margin-bottom: 8px;
}

.tb-value a { text-decoration: none; transition: color var(--ease); }
.tb-value a:hover { color: var(--accent); }

.tb-foot {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: var(--steel);
}

/* ===== REVEALS ===== */
.reveal {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.visible { opacity: 1; transform: none; }

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .about-grid, .skills-layout { grid-template-columns: 1fr; gap: 32px; }
  .projects-grid { grid-template-columns: 1fr; }
  .exp-item { grid-template-columns: 1fr; gap: 6px; }
  .tb-grid { grid-template-columns: repeat(2, 1fr); }
}

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
  .project-card:hover { transform: none; }
}
```

- [ ] **Step 3: Browser verification**

Run: `npm run dev`.
Expected: all sections visible over the dimmed 3D scene; text readable; hero text left, core right on desktop; nav present; page scrolls normally. No console errors.

- [ ] **Step 4: Commit**

```bash
git add index.html src/styles.css
git commit -m "feat: full page content and blueprint styles"
```

---

### Task 7: `ui.js` — navbar behavior and scroll reveals

**Files:**
- Create: `src/ui.js` (the `initNav`/`initReveals` imports in `main.js` were added in Task 5 — uncomment them now if you temporarily commented them out)

**Interfaces:**
- Consumes: DOM hooks from Task 6: `#navbar`, `#navLinks`, `#navToggle`, `.nav-links a`, `.reveal`, sections `#about #experience #projects #skills #contact`.
- Produces: `initNav()` (side effects) — navbar `scrolled` class, active nav link, mobile hamburger toggle; `initReveals()` (side effects) — IntersectionObserver adds `visible` to `.reveal` elements.

- [ ] **Step 1: Write `src/ui.js`**

```js
export function initNav() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const sections = ['about', 'experience', 'projects', 'skills', 'contact'];
  const linkEls = {};
  document.querySelectorAll('.nav-links a').forEach((a) => {
    linkEls[a.getAttribute('href').slice(1)] = a;
  });

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
      const y = window.scrollY + 120;
      let current = 'about';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) current = id;
      }
      document.querySelectorAll('.nav-links a').forEach((a) => a.classList.remove('active'));
      if (linkEls[current]) linkEls[current].classList.add('active');
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

export function initReveals() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}
```

- [ ] **Step 2: Ensure `main.js` calls them** — uncomment/keep:

```js
initNav();
initReveals();
```

- [ ] **Step 3: Browser verification**

Run: `npm run dev`. Expected: navbar gets blur background after 40px scroll; active link follows section; hamburger opens/closes menu on ≤760px width; `.reveal` blocks fade up as you scroll.

- [ ] **Step 4: Commit**

```bash
git add src/ui.js src/main.js
git commit -m "feat: navbar scroll state, active links, mobile menu, reveals"
```

---

### Task 8: Performance hardening and final verification

**Files:**
- Modify: `src/scene.js` (verify only — pixel ratio cap and visibility pause were added in Task 4)
- No other source changes expected; this task is the verification gate.

**Interfaces:**
- Consumes: everything from Tasks 1–7.

- [ ] **Step 1: Run unit tests**

Run: `npm test`
Expected: 8 passing (3 core + 5 scroll).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: `dist/` built without errors; `dist/index.html` references `./assets/...` (relative base).

- [ ] **Step 3: Preview smoke test (desktop)**

Run: `npm run preview` and open http://localhost:4173.
Checklist (desktop, landscape ≥ 1024px):
- Hero: core visible on the right, text left, no console errors.
- Scroll through About/Experience/Projects/Skills: core dims/shifts right, content readable over blurred backdrop.
- Nav: scrolled blur appears; active link tracks section.
- Mouse move: subtle parallax of the core.
- Footer: contact grid renders.

- [ ] **Step 4: Preview smoke test (mobile)**

Resize window to ≤760px (or DevTools device mode).
Checklist:
- Core centered/behind text, no horizontal overflow.
- Hamburger menu opens/closes.
- All sections readable; no overlap.

- [ ] **Step 5: Reduced-motion check**

In DevTools Rendering → Emulate `prefers-reduced-motion: reduce`, reload.
Expected: scene renders once (static core), no scroll-driven movement, reveals visible without animation, `smooth` scroll disabled.

- [ ] **Step 6: Performance sanity**

In DevTools Performance/Console: switch tab away and back — no rendering while hidden (visible via rAF profiler or `document.hidden` logging).
Expected: no jank during scroll; ~60fps on desktop.

- [ ] **Step 7: Final commit**

```bash
git add -A
git status
git commit -m "chore: final verification pass"
```

(If the working tree is clean, note it and skip the empty commit.)

---

## Self-Review Notes

- **Spec coverage:** hero-anchored canvas (Tasks 4–5), icosahedron core (Task 2), scroll/mouse state (Tasks 3–5), all seven content sections (Task 6), blueprint palette/fonts (Task 6), reduced motion (Tasks 5, 8), pixel ratio cap + visibility pause (Task 4, verified Task 8), local-only git (Task 1 constraints + no push anywhere), design doc already committed in `docs/superpowers/specs/`.
- **No placeholders:** every code step contains complete code; only Task 6 Step 1 references the existing site text, which is reproduced verbatim in the plan.
- **Type consistency:** `createCore`/`updateCore` (Task 2) match `scene.js` imports (Task 4); `getSceneState`/`getMouseState`/`getScrollProgress` signatures (Task 3) match usage in `main.js` (Task 5); state keys (`coreOpacity, coreScale, coreOffsetX, coreBaseX, cameraZ, cameraY, mouseX, mouseY`) identical across Tasks 3–5; DOM hooks in Task 7 match Task 6 markup; `initNav`/`initReveals` match Task 5 imports.
