'use strict';

(() => {
  const form = document.querySelector('#irl-photo-gate');
  const input = document.querySelector('#irl-photo-code');
  const image = document.querySelector('#irl-photo');
  const button = form.querySelector('button');
  const feedback = document.querySelector('#irl-photo-feedback');
  const replies = [
    [10, 'bueno, no sigas intenando, tampoco va a a cambiar este texto'],
    [8, 'amigo posta, no jodas porque NO SABES'],
    [5, 'deja de intentarlo, si no sabes no sabes'],
    [3, 'amigo, si no sabes no vale la pena intentar'],
    [1, 'nada que ver']
  ];
  let encryptedPhoto;
  let busy = false;
  let failedAttempts = 0;

  button.addEventListener('pointerdown', event => {
    if (event.button === 0 && document.activeElement === input) event.preventDefault();
  });

  button.addEventListener('click', event => {
    event.preventDefault();
    form.requestSubmit(button);
  });

  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    form.classList.remove('invalid-code');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const submittedCode = input.value;
    if (busy || !submittedCode) return;
    const focusedBeforeSubmit = document.activeElement;
    busy = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    let objectUrl;
    try {
      if (!encryptedPhoto) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        try {
          const response = await fetch('assets/gino-irl.bin', {signal: controller.signal});
          if (!response.ok) throw new Error();
          const bytes = new Uint8Array(await response.arrayBuffer());
          if (bytes.length < 53 || new TextDecoder().decode(bytes.slice(0,8)) !== 'GINO4201') throw new Error();
          encryptedPhoto = bytes;
        } finally {
          clearTimeout(timeout);
        }
      }
      const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(submittedCode), 'PBKDF2', false, ['deriveKey']);
      const key = await crypto.subtle.deriveKey({name:'PBKDF2', salt:encryptedPhoto.slice(8,24), iterations:250000, hash:'SHA-256'}, material, {name:'AES-GCM', length:256}, false, ['decrypt']);
      const photo = await crypto.subtle.decrypt({name:'AES-GCM', iv:encryptedPhoto.slice(24,36), tagLength:128}, key, encryptedPhoto.slice(36));
      objectUrl = URL.createObjectURL(new Blob([photo], {type:'image/jpeg'}));
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = objectUrl;
      });
      image.hidden = false;
      form.hidden = true;
      document.querySelector('#irl-photo-frame').classList.remove('photo-locked');
      input.value = '';
    } catch (error) {
      image.removeAttribute('src');
      image.hidden = true;
      if (error.name === 'OperationError') {
        failedAttempts = Math.min(failedAttempts + 1, 10);
        feedback.textContent = replies.find(([threshold]) => failedAttempts >= threshold)[1];
        feedback.hidden = false;
        if (input.value === submittedCode) {
          input.setAttribute('aria-invalid', 'true');
          form.classList.add('invalid-code');
        }
      }
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      busy = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
      if (!form.hidden && focusedBeforeSubmit === button && document.activeElement === document.body) button.focus({preventScroll: true});
    }
  });
})();
