'use strict';

(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const memory = {
    get(key,fallback) { try { const value=localStorage.getItem('no-pagina:'+key); return value===null?fallback:JSON.parse(value); } catch { return fallback; } },
    set(key,value) { try { localStorage.setItem('no-pagina:'+key,JSON.stringify(value)); } catch { /* También funciona sin almacenamiento. */ } }
  };
  const dialog=$('#weird-dialog');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduceMotion.matches;
  let savedTexts = {};
  try { savedTexts = JSON.parse($('#site-texts').textContent); } catch {}
  if (!savedTexts || typeof savedTexts !== 'object' || Array.isArray(savedTexts)) savedTexts = {};
  function applySavedText(node, key) {
    if (typeof savedTexts[key] === 'string') node.textContent = savedTexts[key];
  }
  let lastBlood=0;
  function openDialog(title, html, editable = true) {
    if (title === 'créditos & fósiles de internet') {
      editable = false;
      html += '<p>Las versiones animadas de Tux, Garry’s Mod y Steam conservan sus imágenes de origen y suman movimiento creado para esta página.</p><p>Portada de <a href="https://www.pinkfloyd.com/albums/the-dark-side-of-the-moon/" target="_blank" rel="noopener noreferrer">The Dark Side of the Moon</a>: Hipgnosis y George Hardie, vía el sitio oficial de Pink Floyd. Copyright de sus respectivos titulares.</p>';
      html += `<p>Stickers: <a href="https://commons.wikimedia.org/wiki/File:Tux.png" target="_blank" rel="noopener noreferrer">Tux © Larry Ewing</a>, creado con The GIMP y usado con atribución; logos de <a href="https://commons.wikimedia.org/wiki/File:Garry%27s_Mod_logo.svg" target="_blank" rel="noopener noreferrer">Garry's Mod</a> (Garry Newman) y <a href="https://commons.wikimedia.org/wiki/File:Steam_icon_logo.svg" target="_blank" rel="noopener noreferrer">Steam</a> (marca de Valve), vía Wikimedia Commons. Sus marcas pertenecen a sus titulares.</p>`;
    }
    $('#dialog-heading').textContent = title;
    // Solo se usan textos fijos de este archivo. No se inserta contenido de visitantes.
    $('#dialog-content').innerHTML = html;
    dialog.querySelectorAll('img[data-motion]').forEach(img => { img.src = paused ? img.dataset.still : img.dataset.motion; });
    if (!dialog.open) dialog.showModal();
    let hash = 2166136261;
    for (const char of title) hash = Math.imul(hash ^ char.charCodeAt(0),16777619);
    if (editable) {
      const key = 'dynamic-window-' + (hash >>> 0).toString(16);
      applySavedText($('#dialog-heading'), key + '-title-0');
      const walker = document.createTreeWalker($('#dialog-content'), NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) if (walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
      nodes.forEach((node, index) => applySavedText(node, key + '-body-' + index));
    }
    applySavedText($('#dialog-ok'), 'dynamic-shared-ok-0');
  }
  $('#close-dialog').addEventListener('click', () => dialog.close());
  $('#dialog-ok').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });

  function setReducedMotion(value) {
    paused = value;
    document.body.classList.toggle('paused', value);
    $$('img[data-motion]').forEach(img => { img.src = value ? img.dataset.still : img.dataset.motion; });
    if (value) $('#particles').replaceChildren();
  }
  setReducedMotion(reduceMotion.matches);
  reduceMotion.addEventListener('change', event => setReducedMotion(event.matches));

  const visits = memory.get('visits', 0);
  const nextVisit = Number.isSafeInteger(visits) && visits >= 0 ? Math.min(visits + 1, 999999) : 1;
  $('#visit-counter').textContent = String(nextVisit).padStart(6, '0');
  memory.set('visits', nextVisit);
  const openLucas = () => openDialog('para Lucas', '<div class="lucas-surprise"><img src="assets/secreto-en-la-montana.gif" data-motion="assets/secreto-en-la-montana.gif" data-still="assets/secreto-en-la-montana.png" width="498" height="407" alt="Ennis y Jack abrazándose en Secreto en la montaña"><h2>T quiero luquitas</h2></div>');
  $('#lucas-button').addEventListener('click',openLucas);


  document.addEventListener('pointermove',event => {
    if (paused || reduceMotion.matches || event.pointerType!=='mouse' || dialog.open || performance.now()-lastBlood<24) return;
    lastBlood=performance.now();
    const trail=$('#particles');
    for (let i=0;i<3;i++) {
      if(trail.childElementCount>=160) trail.firstElementChild.remove();
      const drop=document.createElement('i');
      drop.className='cursor-blood';
      drop.style.left=(event.clientX+Math.random()*16-8)+'px';
      drop.style.top=(event.clientY+Math.random()*10-5)+'px';
      drop.style.setProperty('--drop-size',(4+Math.random()*7)+'px');
      drop.style.setProperty('--drop-drift',(Math.random()*38-19)+'px');
      drop.style.setProperty('--drop-fall',(55+Math.random()*100)+'px');
      drop.style.backgroundColor=['#ff0000','#cc0000','#990000'][i];
      trail.append(drop);
      setTimeout(()=>drop.remove(),1400);
    }
  });
  $('#credits').addEventListener('click', () => openDialog('créditos & fósiles de internet', '<h2>nada sale de la nada.</h2><p>Este rincón le debe un saludo a <a href="https://www.cameronsworld.net/" target="_blank" rel="noopener noreferrer">Cameron’s World / GeoCities</a>, <a href="https://www.spacejam.com/1996/" target="_blank" rel="noopener noreferrer">Space Jam (1996)</a> y <a href="https://superbad.com/" target="_blank" rel="noopener noreferrer">Superbad</a>.</p><p>GIFs de Wikimedia Commons, con licencia <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>:</p><ul><li><a href="https://commons.wikimedia.org/wiki/File:Rotating_earth_(large).gif" target="_blank" rel="noopener noreferrer">Tierra giratoria</a>: Marvel / imágenes NASA.</li><li><a href="https://commons.wikimedia.org/wiki/File:AnimatedStar.gif" target="_blank" rel="noopener noreferrer">Estrella animada</a>: Samwidlund.</li><li><a href="https://commons.wikimedia.org/wiki/File:Applau.gif" target="_blank" rel="noopener noreferrer">Carita aplaudiendo</a>: Tpa2067 / Perhelion.</li></ul><p>GIFs originales intactos. Las versiones quietas son fotogramas extraídos, bajo la misma licencia. Tipografías clásicas del sistema: Times New Roman, Tahoma, Arial y Courier New. Los GIFs góticos rescatados de páginas GeoCities están atribuidos en los créditos completos.</p><p>Fondo de mármol negro: <a href="https://www.oocities.org/graphics_by_jo/" target="_blank" rel="noopener noreferrer">Graphics by Jo</a>. Piedra, cromado y rojo rugoso: <a href="https://horrorgifs.neocities.org/bg" target="_blank" rel="noopener noreferrer">The Horror GIF Necronomicon</a>. Texturas originales guardadas localmente.</p><p>Las visitas se guardan únicamente en este navegador. No hay un contador global ni envíos a un servidor.</p><p>Los nuevos GIFs, la imagen de Baphomet y los demás recursos están detallados en <a href="CREDITOS.md" target="_blank" rel="noopener noreferrer">los créditos completos</a>.</p>'));
})();
