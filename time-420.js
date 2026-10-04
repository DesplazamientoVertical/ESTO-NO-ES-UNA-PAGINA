'use strict';

(() => {
  const overlay = document.getElementById('time-420-overlay');
  if (!overlay) return;
  const image = overlay.querySelector('img');
  let timer;
  let suspended = false;

  function hide() {
    if (overlay.open) overlay.close();
    image.removeAttribute('src');
    document.body.classList.remove('time-420-active');
  }

  function sync() {
    window.clearTimeout(timer);
    if (suspended) return;
    const now = new Date();
    const hour = now.getHours();
    const active = now.getMinutes() === 20 && (hour === 4 || hour === 16);
    if (active) {
      if (!image.hasAttribute('src')) image.src = image.dataset.src;
      document.body.classList.add('time-420-active');
      if (!overlay.open) overlay.showModal();
    } else {
      hide();
    }
    timer = window.setTimeout(sync, Math.max(50, 1000 - now.getMilliseconds()));
  }

  overlay.addEventListener('cancel', event => event.preventDefault());
  window.addEventListener('focus', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', () => {
    suspended = false;
    sync();
  });
  window.addEventListener('pagehide', () => {
    suspended = true;
    window.clearTimeout(timer);
    hide();
  });
  sync();
})();
