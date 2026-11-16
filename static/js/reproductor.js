(() => {
  'use strict';
  const source = document.currentScript;
  if (!source) return;
  const get = (store, key, fallback = null) => { try { return store.getItem(key) ?? fallback; } catch (_) { return fallback; } };
  const set = (store, key, value) => { try { store.setItem(key, String(value)); } catch (_) {} };
  // Add an authorised local file to data-pharloom on each template to enable track two.
  const tracks = [
    {id:'hallownest', title:'Enter Hallownest', src:source.dataset.music},
    {id:'pharloom', title:'Enter Pharloom', src:source.dataset.pharloom || null},
  ];
  const available = tracks.filter(track => track.src);
  let index = Math.max(0, available.findIndex(track => track.id === get(sessionStorage, 'ha_track')));
  let wantsPlay = get(localStorage, 'ha_play', get(localStorage, 'hallow_music_enabled', 'true')) !== 'false';
  let muted = get(localStorage, 'ha_muted', 'false') === 'true';
  let volume = Math.min(1, Math.max(0, Number(get(localStorage, 'ha_volume', '.18')) || 0));
  let rainSound = get(localStorage, 'ha_rain_sound', 'false') === 'true';
  let clickSound = get(localStorage, 'ha_click_sound', 'true') !== 'false';
  let activated = false;

  const audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = volume;
  audio.muted = muted;
  const panel = document.createElement('aside');
  panel.className = 'ha-player';
  panel.setAttribute('aria-label', 'Música y ambiente');
  panel.innerHTML = `
    <div class="ha-player__panel" id="ha-player-panel" hidden>
      <p class="ha-player__eyebrow">MÚSICA DEL VIAJE</p>
      <p class="ha-player__title" data-title></p>
      <div class="ha-player__meta" data-status aria-live="polite"></div>
      <div class="ha-player__buttons">
        <button type="button" data-prev aria-label="Pista anterior" title="Pista anterior">⏮</button>
        <button type="button" data-play aria-label="Reproducir música">▶</button>
        <button type="button" data-next aria-label="Pista siguiente" title="Pista siguiente">⏭</button>
        <button type="button" data-mute aria-label="Silenciar música">♫</button>
      </div>
      <label class="ha-player__volume"><span>Volumen</span><input type="range" data-volume min="0" max="1" step=".05" aria-label="Volumen de música"></label>
      <details><summary>Ambiente y rendimiento</summary>
        <div class="ha-player__settings">
          <label for="ha-effects">Efectos gráficos</label><select id="ha-effects"><option value="full">Completos</option><option value="reduced">Reducidos</option></select>
          <label for="ha-rain">Lluvia visual</label><select id="ha-rain"><option value="full">Normal</option><option value="reduced">Suave</option><option value="off">Desactivada</option></select>
          <label for="ha-rain-audio">Sonido de lluvia</label><input id="ha-rain-audio" type="checkbox">
          <label for="ha-click-audio">Sonido de interfaz</label><input id="ha-click-audio" type="checkbox">
        </div>
      </details>
      <p class="ha-player__pending" data-pending>Enter Pharloom · archivo autorizado pendiente</p>
    </div>
    <button class="ha-player__toggle" type="button" aria-expanded="false" aria-controls="ha-player-panel"><span aria-hidden="true">♫</span><span data-mini>Música del viaje</span><span aria-hidden="true">⌃</span></button>`;
  document.body.append(panel);
  const $ = selector => panel.querySelector(selector);
  const controls = {
    title:$('[data-title]'), status:$('[data-status]'), mini:$('[data-mini]'),
    play:$('[data-play]'), prev:$('[data-prev]'), next:$('[data-next]'), mute:$('[data-mute]'),
    volume:$('[data-volume]'), toggle:$('.ha-player__toggle'), drawer:$('.ha-player__panel'),
    pending:$('[data-pending]'), effects:$('#ha-effects'), rain:$('#ha-rain'),
    rainAudio:$('#ha-rain-audio'), clickAudio:$('#ha-click-audio'),
  };
  controls.volume.value = volume;
  controls.effects.value = get(localStorage, 'ha_effects', 'full');
  controls.rain.value = get(localStorage, 'ha_rain', 'full');
  controls.rainAudio.checked = rainSound;
  controls.clickAudio.checked = clickSound;
  controls.prev.disabled = controls.next.disabled = available.length < 2;
  controls.pending.hidden = !!tracks[1].src;

  const saveTime = () => {
    if (Number.isFinite(audio.currentTime)) set(sessionStorage, 'ha_time', audio.currentTime);
    set(sessionStorage, 'ha_track', available[index].id);
  };
  const loadTrack = (restore = false) => {
    audio.src = available[index].src;
    const saved = restore ? Number(get(sessionStorage, 'ha_time', '0')) : 0;
    audio.addEventListener('loadedmetadata', () => {
      if (saved > 0 && saved < audio.duration) audio.currentTime = saved;
    }, {once:true});
    set(sessionStorage, 'ha_track', available[index].id);
    render();
  };
  const render = () => {
    const active = !audio.paused;
    controls.title.textContent = available[index].title;
    controls.status.textContent = active ? 'Reproduciendo' : wantsPlay ? 'Pulsa reproducir o interactúa para comenzar' : 'En pausa';
    controls.mini.textContent = active ? available[index].title + ' · reproduciendo' : 'Música y ambiente';
    controls.play.textContent = active ? '❚❚' : '▶';
    controls.play.setAttribute('aria-label', active ? 'Pausar música' : 'Reproducir música');
    controls.mute.textContent = muted ? '♩' : '♫';
    controls.mute.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar música');
    controls.mute.setAttribute('aria-pressed', String(muted));
  };
  const start = async () => {
    if (!wantsPlay || !audio.paused) return;
    try { await audio.play(); } catch (_) { /* El navegador puede exigir interacción. */ }
    render();
  };
  const move = amount => {
    if (available.length < 2) return;
    index = (index + amount + available.length) % available.length;
    set(sessionStorage, 'ha_time', 0);
    loadTrack();
    if (wantsPlay) start();
  };
  loadTrack(true);
  audio.addEventListener('play', () => { set(sessionStorage, 'ha_started', 'true'); render(); });
  audio.addEventListener('pause', render);
  audio.addEventListener('timeupdate', saveTime);
  audio.addEventListener('ended', () => {
    if (!wantsPlay) return;
    if (available.length > 1) move(1);
    else { audio.currentTime = 0; start(); }
  });
  audio.addEventListener('error', () => { controls.status.textContent = 'No se pudo reproducir la pista'; });
  addEventListener('pagehide', saveTime);

  controls.toggle.addEventListener('click', () => {
    const open = controls.drawer.hidden;
    controls.drawer.hidden = !open;
    controls.toggle.setAttribute('aria-expanded', String(open));
    if (!activated) { activated = true; if (wantsPlay) start(); if (rainSound) initRain(); }
  });
  controls.play.addEventListener('click', () => {
    if (!audio.paused) { wantsPlay = false; audio.pause(); }
    else { wantsPlay = true; activated = true; start(); }
    set(localStorage, 'ha_play', wantsPlay);
    render();
  });
  controls.prev.addEventListener('click', () => move(-1));
  controls.next.addEventListener('click', () => move(1));
  controls.mute.addEventListener('click', () => { muted = !muted; audio.muted = muted; set(localStorage, 'ha_muted', muted); render(); });
  controls.volume.addEventListener('input', () => { volume = Number(controls.volume.value); audio.volume = volume; set(localStorage, 'ha_volume', volume); });
  for (const [control, key] of [[controls.effects,'effects'],[controls.rain,'rain']]) {
    control.addEventListener('change', () => dispatchEvent(new CustomEvent('ha:setting', {detail:{key,value:control.value}})));
  }

  // Synthesised interface and rain sounds: no game audio assets required.
  let context, rainGain;
  const audioContext = () => {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      try { context = new AudioContext(); } catch (_) { return null; }
    }
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  };
  const applyRain = () => {
    if (!context || !rainGain) return;
    rainGain.gain.setTargetAtTime(rainSound && !document.hidden ? .014 : 0, context.currentTime, .12);
  };
  const initRain = () => {
    const ctx = audioContext();
    if (!ctx || rainGain) { applyRain(); return; }
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i=0; i<samples.length; i++) samples[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    rainGain = ctx.createGain();
    filter.type = 'lowpass'; filter.frequency.value = 900;
    rainGain.gain.value = 0;
    noise.buffer = buffer; noise.loop = true; noise.connect(filter).connect(rainGain).connect(ctx.destination); noise.start();
    applyRain();
  };
  controls.rainAudio.addEventListener('change', () => { rainSound = controls.rainAudio.checked; set(localStorage,'ha_rain_sound',rainSound); if (rainSound) initRain(); else applyRain(); });
  controls.clickAudio.addEventListener('change', () => { clickSound = controls.clickAudio.checked; set(localStorage,'ha_click_sound',clickSound); });
  document.addEventListener('visibilitychange', applyRain);
  const ping = () => {
    if (!clickSound) return;
    const ctx = audioContext();
    if (!ctx) return;
    const tone = ctx.createOscillator(), gain = ctx.createGain();
    tone.type = 'sine'; tone.frequency.setValueAtTime(660, ctx.currentTime);
    tone.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + .09);
    gain.gain.setValueAtTime(.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .12);
    tone.connect(gain).connect(ctx.destination); tone.start(); tone.stop(ctx.currentTime + .12);
  };
  const activate = event => {
    if (panel.contains(event.target)) return;
    if (!activated) { activated = true; if (wantsPlay) start(); if (rainSound) initRain(); }
  };
  document.addEventListener('pointerdown', activate, {passive:true});
  document.addEventListener('keydown', activate);
  document.addEventListener('click', event => {
    const target = event.target.closest('a, button, input[type="button"], input[type="submit"]');
    if (!target || event.defaultPrevented || event.button !== 0) return;
    ping();
    const link = target.closest('a[href]');
    if (!link || panel.contains(link) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.hasAttribute('download') || link.target && link.target !== '_self' ||
        !link.getAttribute('href') || link.getAttribute('href').startsWith('#') ||
        link.hasAttribute('data-toggle') || link.hasAttribute('data-bs-toggle') ||
        link.getAttribute('role') === 'button' || !/^https?:$/.test(link.protocol) ||
        link.origin !== location.origin) return;
    event.preventDefault();
    const destination = link.href;
    setTimeout(() => { location.href = destination; }, 100);
  });
  render();
  // A full page navigation may reset autoplay permission. Resume when the
  // browser allows it; otherwise the next interaction retries safely.
  if (wantsPlay && get(sessionStorage, 'ha_started') === 'true') start();
})();
