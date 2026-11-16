(() => {
  'use strict';
  const script = document.currentScript;
  if (!script) return;

  const music = new Audio(script.dataset.music);
  const confirm = new Audio(script.dataset.click);
  music.loop = true;
  music.volume = 0.18;
  music.preload = 'auto';
  confirm.volume = 0.55;
  confirm.preload = 'auto';

  const read = (storage, key) => { try { return storage.getItem(key); } catch (_) { return null; } };
  const write = (storage, key, value) => { try { storage.setItem(key, value); } catch (_) {} };
  let enabled = read(localStorage, 'hallow_music_enabled') !== 'false';
  const position = Number(read(sessionStorage, 'hallow_music_position'));
  if (Number.isFinite(position) && position > 0) {
    music.addEventListener('loadedmetadata', () => {
      if (position < music.duration) music.currentTime = position;
    }, { once: true });
  }

  const weather = document.createElement('div');
  weather.className = 'hk-weather';
  weather.setAttribute('aria-hidden', 'true');
  document.body.prepend(weather);

  let controls = document.querySelectorAll('.hk-audio-toggle');
  if (!controls.length) {
    const toggle = document.createElement('button');
    toggle.className = 'hk-audio-toggle hk-audio-floating';
    toggle.type = 'button';
    document.body.append(toggle);
    controls = [toggle];
  }

  const updateControl = () => {
    for (const button of controls) {
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = !enabled ? '♫  Música: apagada' : music.paused ? '♫  Activar música' : '♫  Música: activada';
      button.title = !enabled ? 'Activar música ambiental' : music.paused ? 'Pulsa para iniciar la música ambiental' : 'Silenciar música ambiental';
    }
  };
  const startMusic = async () => {
    if (!enabled || !music.paused) return;
    try { await music.play(); } catch (_) { /* Se reintenta con la siguiente interacción. */ }
    updateControl();
  };
  const rememberPosition = () => {
    if (Number.isFinite(music.currentTime)) write(sessionStorage, 'hallow_music_position', String(music.currentTime));
  };
  music.addEventListener('timeupdate', rememberPosition);
  music.addEventListener('play', updateControl);
  music.addEventListener('pause', updateControl);
  window.addEventListener('pagehide', rememberPosition);

  for (const button of controls) {
    button.addEventListener('click', () => {
      if (enabled && !music.paused) {
        enabled = false;
        music.pause();
      } else {
        enabled = true;
        startMusic();
      }
      write(localStorage, 'hallow_music_enabled', String(enabled));
      updateControl();
    });
  }
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.hk-audio-toggle')) startMusic();
  }, { passive: true });
  document.addEventListener('keydown', startMusic);
  updateControl();
  startMusic();

  // Wait for the actual confirmation sound before leaving the page. If media
  // playback is blocked or fails, navigation is never blocked by audio.
  function playConfirmation() {
    return new Promise(resolve => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        confirm.removeEventListener('ended', finish);
        confirm.removeEventListener('error', finish);
        resolve();
      };
      const timer = setTimeout(finish, 1800);
      confirm.pause();
      confirm.currentTime = 0;
      confirm.addEventListener('ended', finish, { once: true });
      confirm.addEventListener('error', finish, { once: true });
      confirm.play().catch(finish);
    });
  }

  let navigating = false;
  const replaying = new WeakSet();
  document.addEventListener('click', event => {
    const element = event.target.closest('a, button, input[type="button"], input[type="submit"]');
    if (!element || event.defaultPrevented || event.button !== 0) return;
    const link = element.closest('a[href]');
    if (link) {
      const rawHref = link.getAttribute('href');
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          link.hasAttribute('download') || (link.target && link.target !== '_self') ||
          !rawHref || rawHref.startsWith('#') || link.hasAttribute('data-toggle') ||
          link.hasAttribute('data-bs-toggle') || link.getAttribute('role') === 'button' ||
          link.href.startsWith('javascript:') || link.hash && link.pathname === location.pathname && link.search === location.search) {
        playConfirmation();
        return;
      }
      if (navigating) { event.preventDefault(); return; }
      event.preventDefault();
      navigating = true;
      playConfirmation().then(() => { window.location.href = link.href; });
    } else if (!(element.matches('button[type="submit"], button:not([type]), input[type="submit"]') && element.form)) {
      playConfirmation();
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target;
    if (replaying.has(form)) { replaying.delete(form); return; }
    if (event.defaultPrevented) { playConfirmation(); return; }
    if (navigating) { event.preventDefault(); return; }
    event.preventDefault();
    event.stopImmediatePropagation();
    navigating = true;
    const submitter = event.submitter;
    playConfirmation().then(() => {
      navigating = false;
      replaying.add(form);
      if (submitter && submitter.isConnected) form.requestSubmit(submitter);
      else form.requestSubmit();
    });
  }, true);
})();
