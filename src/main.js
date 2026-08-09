import { createScene } from './scene.js';
import { createCore } from './core.js';
import { getScrollProgress, getSceneState, getMouseState } from './scroll.js';
import { initNav, initReveals } from './ui.js';

document.documentElement.classList.add('js');

const canvas = document.getElementById('bg-canvas');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let scene = null;

function applyScrollState() {
  if (!scene) return;
  scene.updateState(getSceneState(getScrollProgress()));
}

function applyLayoutState() {
  if (!scene) return;
  const aspect = window.innerWidth / window.innerHeight;
  scene.updateState({ coreBaseX: aspect >= 1 ? 2.0 : 0 });
  applyScrollState();
}

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (reduceMotion || !scene || scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    applyScrollState();
    scrollTicking = false;
  });
}, { passive: true });

let mouseTicking = false;
window.addEventListener('mousemove', (e) => {
  if (reduceMotion || !scene || mouseTicking) return;
  mouseTicking = true;
  requestAnimationFrame(() => {
    const { nx, ny } = getMouseState(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
    scene.updateState({ mouseX: nx, mouseY: ny });
    mouseTicking = false;
  });
}, { passive: true });

window.addEventListener('resize', () => {
  if (!scene) return;
  scene.resize(window.innerWidth, window.innerHeight);
  applyLayoutState();
  if (reduceMotion) scene.render();
});

try {
  scene = createScene({ canvas });
  const core = createCore();
  applyLayoutState();
  scene.start(core, !reduceMotion);
} catch (err) {
  console.warn('3D scene unavailable, continuing without it:', err);
  canvas.remove();
}

initNav();
initReveals();
