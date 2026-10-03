'use strict';

(() => {
  const button = document.getElementById('impala-button');
  const audio = document.getElementById('impala-audio');
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const TRANSFORMATION_MS = 60000;
  let active = false;
  let pending = false;
  let generation = 0;
  let frame = 0;
  let elapsed = 0;
  let lastTime = 0;

  function draw(time) {
    if (!active) return;
    // Keep the transition gradual even after a background tab resumes.
    elapsed += Math.min(Math.max(0, time - lastTime), 250);
    lastTime = time;
    const progress = Math.min(elapsed / TRANSFORMATION_MS, 1);
    const intensity = progress * progress * (3 - 2 * progress);
    const phase = elapsed / 1000;
    const hue = reduced.matches ? 150 * intensity : phase * (8 + 18 * intensity);
    body.style.setProperty('--trip', intensity.toFixed(4));
    body.style.setProperty('--trip-hue', hue.toFixed(2) + 'deg');
    body.style.setProperty('--trip-shift', (Math.sin(phase * .8) * intensity * 13).toFixed(2) + 'px');
    body.style.setProperty('--trip-turn', (Math.sin(phase * .55) * intensity * 2.4).toFixed(3) + 'deg');
    frame = requestAnimationFrame(draw);
  }

  function stop() {
    generation++;
    active = false;
    pending = false;
    cancelAnimationFrame(frame);
    audio.pause();
    try { audio.currentTime = 0; } catch { /* Metadata may not have loaded yet. */ }
    body.classList.remove('impalero');
    for (const property of ['--trip', '--trip-hue', '--trip-shift', '--trip-turn']) body.style.removeProperty(property);
    button.textContent = 'Modo Impalero';
    button.setAttribute('aria-pressed', 'false');
    button.removeAttribute('aria-busy');
  }

  async function start() {
    pending = true;
    const attempt = ++generation;
    button.setAttribute('aria-busy', 'true');
    try {
      // Called directly from the click: playback never starts on page load.
      await audio.play();
      if (attempt !== generation) {
        if (!active && !pending) audio.pause();
        return;
      }
      pending = false;
      active = true;
      elapsed = 0;
      lastTime = performance.now();
      body.style.setProperty('--trip', '0');
      body.style.setProperty('--trip-hue', '0deg');
      body.style.setProperty('--trip-shift', '0px');
      body.style.setProperty('--trip-turn', '0deg');
      body.classList.add('impalero');
      button.textContent = 'nana me re bajo del barco';
      button.setAttribute('aria-pressed', 'true');
      button.removeAttribute('aria-busy');
      frame = requestAnimationFrame(draw);
    } catch {
      if (attempt === generation) stop();
    }
  }

  button.addEventListener('click', () => {
    if (active || pending) stop();
    else start();
  });
  audio.addEventListener('error', () => {
    if (active || pending) stop();
  });
  window.addEventListener('pagehide', () => stop());
})();
