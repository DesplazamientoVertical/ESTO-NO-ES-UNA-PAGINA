'use strict';

(() => {
  const form = document.getElementById('private-message-form');
  if (!form) return;
  const input = form.elements.message;
  const button = form.querySelector('button');
  const icon = button.querySelector('path');
  const sendIcon = icon.getAttribute('d');
  let sending = false;

  input.addEventListener('input', () => {
    form.removeAttribute('data-result');
    input.removeAttribute('aria-invalid');
    icon.setAttribute('d', sendIcon);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    if (!input.value.trim()) {
      input.setAttribute('aria-invalid', 'true');
      form.dataset.result = 'error';
      input.focus();
      return;
    }
    if (form.elements._honey.value) return;
    const endpoint = form.getAttribute('action');
    if (!endpoint) return;
    sending = true;
    const message = input.value;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    button.disabled = true;
    input.readOnly = true;
    form.setAttribute('aria-busy', 'true');
    form.removeAttribute('data-result');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify({message, _subject: document.title, _url: location.href, _captcha: 'false'}),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || ![true, 'true'].includes(result.success)) throw new Error();
      input.value = '';
      form.dataset.result = 'sent';
      icon.setAttribute('d', 'm4 12 5 5L20 6');
    } catch {
      form.dataset.result = 'error';
      icon.setAttribute('d', 'm6 6 12 12M18 6 6 18');
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      input.readOnly = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
