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
