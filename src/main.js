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
