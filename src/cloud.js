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
