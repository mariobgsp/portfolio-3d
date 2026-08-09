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
