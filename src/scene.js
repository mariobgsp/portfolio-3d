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
