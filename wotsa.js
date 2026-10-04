'use strict';

(() => {
  const button = document.getElementById('wotsa-button');
  const audio = document.getElementById('wotsa-audio');
  const overlay = document.getElementById('wotsa-overlay');
  const image = overlay.querySelector('img');
  const page = document.querySelector('.page-shell');
  let active = false;
  let generation = 0;

  function reset() {
    generation++;
    active = false;
    audio.pause();
    try { audio.currentTime = 0; } catch {}
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    image.removeAttribute('src');
    document.body.classList.remove('wotsa-active');
    page.inert = false;
    button.disabled = false;
  }

  button.addEventListener('click', () => {
    if (active) return;
    const impalaButton = document.getElementById('impala-button');
    if (impalaButton.getAttribute('aria-pressed') === 'true' || impalaButton.hasAttribute('aria-busy')) impalaButton.click();
    const attempt = ++generation;
    active = true;
    button.disabled = true;
    button.blur();
    page.inert = true;
    document.body.classList.add('wotsa-active');
    image.src = image.dataset.src;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    audio.play().then(() => {
      if (attempt !== generation) audio.pause();
    }).catch(() => {
      if (attempt === generation) reset();
    });
  });

  audio.addEventListener('error', () => { if (active) reset(); });
  window.addEventListener('pagehide', reset);
})();
