(() => {
  'use strict';
  const root = document.documentElement;
  const read = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = document.createElement('div');
  scene.className = 'ha-atmosphere';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = '<div class="ha-game-bg"></div><div class="ha-cave ha-cave--far"></div><div class="ha-cave ha-cave--mid"></div><div class="ha-cave ha-cave--near"></div><div class="ha-fog"></div><div class="ha-dust"></div><div class="ha-rain ha-rain--far"></div><div class="ha-rain ha-rain--near"></div><div class="ha-drip"></div><div class="ha-splash"></div>';
  document.body.prepend(scene);
  if (document.querySelector('#branding')) document.body.classList.add('ha-admin');

  const apply = () => {
    root.dataset.effects = read('ha_effects', 'full');
    root.dataset.rain = read('ha_rain', 'full');
  };
  apply();
  window.addEventListener('ha:setting', event => {
    const {key, value} = event.detail || {};
    if (key === 'effects' && ['full', 'reduced'].includes(value)) save('ha_effects', value);
    if (key === 'rain' && ['full', 'reduced', 'off'].includes(value)) save('ha_rain', value);
    apply();
  });
  document.addEventListener('visibilitychange', () => {
    scene.classList.toggle('ha-paused', document.hidden);
  });
  let scheduled = false;
  const scroll = () => {
    if (scheduled || document.hidden || reducedMotion.matches || root.dataset.effects === 'reduced') return;
    scheduled = true;
    requestAnimationFrame(() => {
      scene.style.setProperty('--scroll-far', Math.min(scrollY * .025, 65) + 'px');
      scene.style.setProperty('--scroll-mid', Math.min(scrollY * .055, 125) + 'px');
      scene.style.setProperty('--scroll-near', Math.min(scrollY * .09, 190) + 'px');
      scheduled = false;
    });
  };
  addEventListener('scroll', scroll, {passive:true});
  let pointerFrame = false, pointerX = 0, pointerY = 0;
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches || root.dataset.effects === 'reduced') return;
    pointerX = (event.clientX / innerWidth - .5) * 18;
    pointerY = (event.clientY / innerHeight - .5) * 12;
    if (pointerFrame) return;
    pointerFrame = true;
    requestAnimationFrame(() => {
      scene.style.setProperty('--pointer-x', pointerX + 'px');
      scene.style.setProperty('--pointer-y', pointerY + 'px');
      pointerFrame = false;
    });
  }, {passive:true});
  addEventListener('storage', apply);
})();
