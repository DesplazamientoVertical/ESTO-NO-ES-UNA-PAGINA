'use strict';

(() => {
  const form = document.querySelector('#irl-photo-gate');
  const input = document.querySelector('#irl-photo-code');
  const image = document.querySelector('#irl-photo');
  const button = form.querySelector('button');
  let encryptedPhoto;
  let busy = false;

  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    form.classList.remove('invalid-code');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !input.value) return;
    busy = true;
    button.disabled = true;
    input.disabled = true;
    form.setAttribute('aria-busy', 'true');
    let objectUrl;
    try {
      if (!encryptedPhoto) {
        const response = await fetch('assets/gino-irl.bin');
        if (!response.ok) throw new Error();
        encryptedPhoto = new Uint8Array(await response.arrayBuffer());
      }
      const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(input.value), 'PBKDF2', false, ['deriveKey']);
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
    } catch {
      image.removeAttribute('src');
      image.hidden = true;
      input.setAttribute('aria-invalid', 'true');
      form.classList.add('invalid-code');
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      busy = false;
      button.disabled = false;
      input.disabled = false;
      form.removeAttribute('aria-busy');
      if (!form.hidden) input.focus();
    }
  });
})();
