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
