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
