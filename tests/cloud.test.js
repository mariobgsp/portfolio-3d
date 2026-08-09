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
    expect(cloud.getObjectByName('icosahedron')).toBeUndefined();
    expect(cloud.getObjectByName('ring-1')).toBeUndefined();
    expect(cloud.getObjectByName('ring-2')).toBeUndefined();
    expect(cloud.getObjectByName('particles')).toBeUndefined();
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
