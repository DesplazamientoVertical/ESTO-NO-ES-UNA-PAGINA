'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function updateMotion() {
    document.body.classList.toggle('paused', reduced.matches);
    document.querySelectorAll('img[data-motion]').forEach(img => {
      img.src = reduced.matches ? img.dataset.still : img.dataset.motion;
    });
  }
  updateMotion();
  reduced.addEventListener('change', updateMotion);
})();
