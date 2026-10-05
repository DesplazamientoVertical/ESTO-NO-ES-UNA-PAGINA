'use strict';

(() => {
  const key = 'no-pagina:theme';
  const themes = new Set(['oscuro', 'cielo', 'reggae']);
  const colors = {oscuro: '#060609', cielo: '#1679dd', reggae: '#104416'};
  const root = document.documentElement;

  function savedTheme() {
    try {
      const value = localStorage.getItem(key);
      if (themes.has(value)) return value;
    } catch {}
    return 'oscuro';
  }

  function apply(theme) {
    if (!themes.has(theme)) theme = 'oscuro';
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = colors[theme];
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
    });
  }

  apply(savedTheme());

  function connectButtons() {
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.addEventListener('click', () => {
        const theme = button.dataset.themeChoice;
        if (!themes.has(theme)) return;
        apply(theme);
        try { localStorage.setItem(key, theme); } catch {}
      });
    });
    apply(root.dataset.theme);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connectButtons, {once: true});
  } else {
    connectButtons();
  }

  window.addEventListener('pageshow', () => apply(savedTheme()));
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(savedTheme());
  });
})();
