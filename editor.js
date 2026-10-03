'use strict';

(() => {
  const $ = selector => document.querySelector(selector);
  const shell = $('.page-shell');
  const panel = $('#text-editor');
  const toggle = $('#edit-texts');
  const status = $('#editor-status');
  const modal = $('#weird-dialog');
  const fileName = document.body.dataset.exportFile === 'templo.html' ? 'templo.html' : 'index.html';
  const dynamicPattern = /^dynamic-[a-z0-9-]+$/;
  let published = {};
  try {
    const value = JSON.parse($('#site-texts').textContent);
    if (value && typeof value === 'object' && !Array.isArray(value)) published = Object.fromEntries(Object.entries(value).filter(([key,text]) => dynamicPattern.test(key) && typeof text === 'string'));
  } catch { /* Una configuración inválida no bloquea la página. */ }
  // Solo texto editorial. Los controles, contadores y respuestas de los juegos
  // siguen a cargo del sitio; las licencias permanecen en su ventana de créditos.
  const excluded = 'script,style,input,textarea,select,summary,site-copy,[data-editor-ui],[data-editor-lock],[aria-hidden="true"],.reaction > span,#visit-counter';
  const walker = document.createTreeWalker(shell, NodeFilter.SHOW_TEXT, {
    acceptNode(node) { return node.textContent.trim() && !node.parentElement.closest(excluded) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  let nextId = Math.max(0, ...[...shell.querySelectorAll('site-copy[data-edit]')].map(el => Number(el.dataset.edit.replace('copy-', '')) || 0));
  for (const node of textNodes) {
    const copy = document.createElement('site-copy');
    copy.dataset.edit = 'copy-' + String(++nextId).padStart(3, '0');
    node.replaceWith(copy);
    copy.append(node);
  }
  const plainText = element => [...element.childNodes].map(node => node.nodeName === 'BR' ? '\n' : node.textContent).join('');
  const fields = new Map([...shell.querySelectorAll('site-copy[data-edit]')].map(el => [el.dataset.edit, { element:el, original:plainText(el) }]));
  // Esta copia se toma ANTES de ejecutar los juegos y los contadores.
  // La descarga usa esta base limpia: nunca el DOM con efectos o progreso personal.
  const source = document.documentElement.cloneNode(true);
  // Los scripts inyectados por hosting no forman parte del HTML descargable.
  source.querySelectorAll('script').forEach(el => {
    const filename=(el.getAttribute('src')||'').split('?')[0];
    if(el.id!=='site-texts' && !['editor.js','script.js','templo.js'].includes(filename)) el.remove();
  });
  source.querySelectorAll('iframe[height="1"][width="1"]').forEach(el=>el.remove());
  const signature = JSON.stringify([[...fields].map(([id, field]) => [id, field.original]),published]);
  let hash = 2166136261;
  for (let index = 0; index < signature.length; index++) hash = Math.imul(hash ^ signature.charCodeAt(index), 16777619);
  const draftKey = 'no-pagina:editor:v1:' + location.pathname + ':' + (hash >>> 0).toString(16);
  const updates = new Map();
  let editing = false;
  let initialized = false;
  let activeId = null;
  let saveTimer;
  let persistent = true;
  let downloadCurrent = false;
  const openedDetails = new Map();

  function fieldMode(element, original) {
    if (editing) {
      element.setAttribute('contenteditable', 'plaintext-only');
      if (element.contentEditable !== 'plaintext-only') element.contentEditable = 'true';
      element.setAttribute('role', 'textbox');
      element.setAttribute('aria-label', 'Editar: ' + original.trim().slice(0, 70));
      element.setAttribute('aria-multiline', 'true');
      element.setAttribute('tabindex', '0');
      element.setAttribute('spellcheck', 'true');
    } else {
      if (updates.has(element.dataset.edit)) setText(element, updates.get(element.dataset.edit));
      for (const name of ['contenteditable','role','aria-label','aria-multiline','tabindex','spellcheck']) element.removeAttribute(name);
    }
  }
  function mountPanel() {
    const inside = modal?.open && initialized;
    if (inside) modal.insertBefore(panel, $('#dialog-ok'));
    else document.body.insertBefore(panel, $('#particles'));
    panel.classList.toggle('inside-dialog', inside);
    sizePanel();
  }
  function prepareDynamic(root, scope) {
    if (root.matches('[data-editor-lock]')) return;
    const scan = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) { return node.textContent.trim() && !node.parentElement.closest(excluded) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
    });
    const nodes = [];
    while (scan.nextNode()) nodes.push(scan.currentNode);
    nodes.forEach((node,index) => {
      const id = 'dynamic-' + scope + '-' + index;
      const element = document.createElement('site-copy');
      element.dataset.edit = id;
      const original = Object.hasOwn(published,id) ? published[id] : node.textContent;
      setText(element, initialized && updates.has(id) ? updates.get(id) : original);
      node.replaceWith(element);
      fields.set(id,{element,original});
      fieldMode(element,original);
    });
  }
  document.addEventListener('site-dialog-open', event => {
    const key = event.detail.key;
    if (event.detail.editable !== false && /^[a-z0-9-]+$/.test(key)) {
      prepareDynamic($('#dialog-heading'),key + '-title');
      prepareDynamic($('#dialog-content'),key + '-body');
      prepareDynamic($('#dialog-ok'),'shared-ok');
    }
    activeId = null;
    paintUndo();
    $('#edit-dialog').hidden = event.detail.editable === false;
    mountPanel();
  });
  modal?.addEventListener('close', mountPanel);
  $('#edit-dialog')?.addEventListener('click', () => { setEditing(true); mountPanel(); });
  $('#editor-window')?.addEventListener('change', event => {
    if (!event.target.value) return;
    if (!editing) setEditing(true);
    document.dispatchEvent(new CustomEvent('site-editor-window',{detail:{key:event.target.value}}));
    event.target.value = '';
  });

  function say(message, error = false) {
    status.textContent = message;
    status.classList.toggle('error', error);
  }
  function sizePanel() {
    document.body.style.setProperty('--editor-height', (panel.classList.contains('inside-dialog') ? 0 : panel.getBoundingClientRect().height) + 'px');
  }
  if (window.ResizeObserver) new ResizeObserver(sizePanel).observe(panel);
  window.addEventListener('resize', sizePanel);

  function setText(element, text) {
    const fragment = document.createDocumentFragment();
    text.split('\n').forEach((line, index) => {
      if (index) fragment.append(document.createElement('br'));
      fragment.append(document.createTextNode(line));
    });
    element.replaceChildren(fragment);
  }
  function fieldText(element) { return element.innerText.replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' '); }
  function paintUndo() { $('#editor-undo').disabled = !activeId || !updates.has(activeId); }
  function saveDraft(announce = true) {
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(draftKey, JSON.stringify({ version:1, updates:Object.fromEntries(updates), savedAt:new Date().toISOString() }));
      persistent = true;
      if (announce) say(updates.size ? `Borrador guardado en este navegador. Para publicarlo, descargá ${fileName} y reemplazalo en GitHub.` : 'Sin cambios pendientes. Los textos originales siguen intactos.');
      return true;
    } catch {
      persistent = false;
      say(`Este navegador no pudo guardar el borrador. Descargá ${fileName} antes de cerrar para conservar tus textos.`, true);
      return false;
    }
  }
  function loadDraft() {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft?.version !== 1 || !draft.updates || typeof draft.updates !== 'object' || Array.isArray(draft.updates)) return;
      for (const [id, text] of Object.entries(draft.updates)) {
        if ((fields.has(id) || dynamicPattern.test(id)) && typeof text === 'string' && text !== fields.get(id)?.original) {
          updates.set(id, text);
          if (fields.has(id)) setText(fields.get(id).element, text);
        }
      }
    } catch {
      persistent = false;
      say('No se pudo recuperar el borrador. Podés editar y descargar el archivo para guardar tus cambios.', true);
    }
  }
  function setEditing(value) {
    if (!initialized) { initialized = true; loadDraft(); }
    editing = value;
    panel.hidden = false;
    document.body.classList.add('editor-open');
    document.body.classList.toggle('editing', editing);
    toggle.setAttribute('aria-pressed', String(editing));
    toggle.textContent = editing ? '✓ ver sin marcas' : '✎ editar textos';
    $('#editor-done').textContent = editing ? 'Ver sin marcas' : 'Seguir editando';
    $('#editor-instructions').textContent = editing
      ? (modal ? 'Tocá un texto marcado y escribí. Usá «Ventanas» para editar el mensaje de Lucas. Para probarlo, elegí «Ver sin marcas».' : 'Tocá un texto marcado y escribí. Para probar los enlaces, elegí «Ver sin marcas».')
      : `Esta es la vista previa de tu borrador. Para que se vea en tu web, descargá ${fileName} y subilo a GitHub.`;
    for (const {element, original} of fields.values()) if (element.isConnected) fieldMode(element,original);
    for (const details of document.querySelectorAll('.blog-post details')) {
      if (editing) { if (!openedDetails.has(details)) openedDetails.set(details,details.open); details.open = true; }
      else if (openedDetails.has(details)) details.open = openedDetails.get(details);
    }
    if (!editing) openedDetails.clear();
    if (persistent) say(updates.size ? 'Tus cambios están en el borrador. Solo se ven en tu navegador hasta que subas el archivo.' : 'El diseño y las fotos se conservan. Cambiá los textos que quieras y descargá el resultado.');
    if (!editing) saveDraft();
    paintUndo();
    mountPanel();
  }
  toggle.addEventListener('click', () => setEditing(!editing));
  $('#editor-done').addEventListener('click', () => setEditing(!editing));
  $('#editor-save').addEventListener('click', () => saveDraft());

  function collect(element) {
    const id = element.dataset.edit;
    const field = fields.get(id);
    if (!field) return;
    const value = fieldText(element);
    if (value === field.original) updates.delete(id); else updates.set(id, value);
    downloadCurrent = false;
    activeId = id;
    paintUndo();
    say('Guardando tu borrador…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveDraft(), 350);
  }
  document.addEventListener('focusin', event => {
    const element = event.target.closest('site-copy[data-edit]');
    if (editing && element) { activeId = element.dataset.edit; paintUndo(); }
  });
  document.addEventListener('input', event => {
    const element = event.target.closest('site-copy[data-edit]');
    if (editing && element) collect(element);
  });
  // Pegar siempre inserta caracteres, jamás HTML ni código ejecutable.
  document.addEventListener('paste', event => {
    const element = event.target.closest('site-copy[data-edit]');
    if (!editing || !element) return;
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') || '';
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!element.contains(range.commonAncestorContainer)) return;
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node); range.setStartAfter(node); range.collapse(true);
    selection.removeAllRanges(); selection.addRange(range);
    collect(element);
  });
  document.addEventListener('drop', event => { if (editing && event.target.closest('site-copy[data-edit]')) event.preventDefault(); });
  document.addEventListener('click', event => {
    if (editing && event.target.closest('site-copy[data-edit]')?.closest('a,button')) { event.preventDefault(); event.stopPropagation(); }
  },true);
  $('#editor-undo').addEventListener('click', () => {
    if (!activeId || !fields.has(activeId)) return;
    const field = fields.get(activeId);
    setText(field.element, field.original);
    updates.delete(activeId);
    downloadCurrent = false;
    paintUndo(); saveDraft();
    if (editing) field.element.focus();
  });

  function exportPage() {
    const clean = source.cloneNode(true);
    for (const element of clean.querySelectorAll('site-copy[data-edit]')) {
      if (updates.has(element.dataset.edit)) setText(element, updates.get(element.dataset.edit));
    }
    const dynamic = {...published};
    for (const [id,value] of updates) if (dynamicPattern.test(id)) dynamic[id] = value;
    clean.querySelector('#site-texts').textContent = JSON.stringify(dynamic).replace(/</g,'\\u003c');
    const headline = [...clean.querySelectorAll('.masthead h1 > span')].map(el => el.textContent.trim()).join(' ');
    if (headline) clean.querySelector('title').textContent = headline + ' ★ pasá, ya fue';
    return '<!doctype html>\n' + clean.outerHTML + '\n';
  }
  $('#editor-download').addEventListener('click', () => {
    try {
      saveDraft(false);
      const blob = new Blob([exportPage()], {type:'text/html;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = fileName;
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      downloadCurrent = true;
      say(`Descarga solicitada. Reemplazá ${fileName} en la carpeta de tu página y subilo a GitHub. Conservá los demás archivos.`);
    } catch {
      say('No se pudo preparar la descarga. Tu texto sigue acá: intentá nuevamente antes de cerrar.', true);
    }
  });
  document.addEventListener('keydown', event => {
    if (initialized && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault(); saveDraft();
    }
  });
  window.addEventListener('beforeunload', event => {
    if (saveTimer) saveDraft(false);
    if (updates.size && !persistent && !downloadCurrent) { event.preventDefault(); event.returnValue = ''; }
  });
})();
