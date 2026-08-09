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
    cameraY: beyond > 0 ? -beyond * 0.6 : 0,
  };
}

export function getMouseState(x, y, width, height) {
  return {
    nx: (x / width) * 2 - 1,
    ny: (y / height) * 2 - 1,
  };
}
