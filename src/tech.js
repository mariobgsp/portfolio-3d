const TERM_LINES = [
  '$ whoami',
  'muhammad ario bagus prakusa',
  '$ cat stack.txt',
  'java · spring · go · kubernetes',
  '$ ./optimize --batch 1m',
  'ok — 20m (was 6h)',
  '$ ssh regional-platforms',
  'connected — id · sg · my · chn',
];

export function initTech({ getScrollProgress }) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- live clock (WIB) ----
  const clockEl = document.getElementById('navClock');
  const pad = (n) => String(n).padStart(2, '0');
  const tickClock = () => {
    const d = new Date();
    clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  tickClock();
  if (!reduceMotion) setInterval(tickClock, 1000);

  // ---- uptime since load ----
  const uptimeEl = document.getElementById('uptime');
  const started = Date.now();
  const tickUptime = () => {
    const t = Math.floor((Date.now() - started) / 1000);
    uptimeEl.textContent = `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`;
  };
  tickUptime();
  if (!reduceMotion) setInterval(tickUptime, 1000);

  // ---- scroll progress bar ----
  const bar = document.getElementById('progressBar');
  let ticking = false;
  const updateProgress = () => {
    bar.style.transform = `scaleX(${getScrollProgress()})`;
    ticking = false;
  };
  const onScroll = () => {
    if (reduceMotion || ticking) return;
    ticking = true;
    requestAnimationFrame(updateProgress);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  updateProgress();

  // ---- typing terminal ----
  const target = document.getElementById('typeTarget');
  const cursor = document.getElementById('termCursor');
  if (!target) return;

  if (reduceMotion || !('requestAnimationFrame' in window)) {
    target.textContent = TERM_LINES[TERM_LINES.length - 1];
    if (cursor) cursor.style.display = 'none';
    return;
  }

  let lineIdx = 0;
  let charIdx = 0;
  let deleting = false;
  const TYPE_SPEED = 42;
  const HOLD = 1500;

  function step() {
    const line = TERM_LINES[lineIdx];

    if (!deleting) {
      target.textContent = line.slice(0, charIdx + 1);
      charIdx += 1;
      if (charIdx === line.length) {
        deleting = true;
        setTimeout(step, HOLD);
        return;
      }
      setTimeout(step, TYPE_SPEED);
      return;
    }

    target.textContent = line.slice(0, charIdx - 1);
    charIdx -= 1;
    if (charIdx === 0) {
      deleting = false;
      lineIdx = (lineIdx + 1) % TERM_LINES.length;
      setTimeout(step, 350);
      return;
    }
    setTimeout(step, TYPE_SPEED / 3);
  }
  setTimeout(step, 400);
}
