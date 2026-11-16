(() => {
  'use strict';
  const base = document.currentScript?.dataset.assets;
  if (!base) return;
  const mount = (host, name, className = '') => {
    if (!host) return;
    const img = document.createElement('img');
    img.src = base + name;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.className = 'ha-reactive ' + className;
    img.decoding = 'async';
    host.append(img);
  };
  const form = document.querySelector('.form-intro .ornament');
  const detail = document.querySelector('.detail-heading .ornament');
  for (const host of [form, detail]) if (host) { host.textContent = ''; host.classList.add('ha-companion'); }
  mount(form, 'quirrel.webp');
  mount(detail, 'cornifer.webp');
  const api = document.querySelector('.api-page');
  if (api) {
    const host = document.createElement('div');
    host.className = 'ha-api-companion';
    api.prepend(host);
    mount(host, 'cornifer.webp');
  }
  mount(document.querySelector('.ha-admin-section .ha-heading'), 'cloth.webp', 'ha-cloth');
  document.querySelectorAll('.ha-hornet,.ha-knight-hero,.ha-admin-knight').forEach(img => img.classList.add('ha-reactive'));
  const images = [...document.querySelectorAll('.ha-reactive')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = false, px = 0, py = 0;
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reduced.matches || document.documentElement.dataset.effects === 'reduced') return;
    px = event.clientX; py = event.clientY;
    if (frame) return;
    frame = true;
    requestAnimationFrame(() => {
      for (const img of images) {
        const box = img.getBoundingClientRect();
        const dx = px - box.x - box.width/2, dy = py - box.y - box.height/2;
        const near = Math.hypot(dx, dy) < 380;
        img.style.setProperty('--look-x', near ? Math.max(-9, Math.min(9, dx/24)) + 'px' : '0px');
        img.style.setProperty('--look-y', near ? Math.max(-4, Math.min(4, dy/40)) + 'px' : '0px');
        img.style.setProperty('--look-turn', near ? Math.max(-3, Math.min(3, dx/80)) + 'deg' : '0deg');
      }
      frame = false;
    });
  }, {passive:true});
})();
