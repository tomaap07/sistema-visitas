(() => {
  'use strict';
  const base = document.currentScript?.dataset.assets;
  if (!base) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.className = 'ha-creatures';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  const active = new Set();
  let timer;
  const enabled = () => !document.hidden && !reduced.matches && document.documentElement.dataset.effects !== 'reduced';
  const clear = () => {
    clearTimeout(timer);
    for (const entry of active) { entry.animation.cancel(); entry.node.remove(); }
    active.clear();
  };
  const spawn = () => {
    if (!enabled() || active.size >= 2) return;
    const flying = Math.random() < .6;
    const right = Math.random() < .5;
    const node = document.createElement('div');
    node.className = 'ha-creature ' + (flying ? 'ha-creature--flying' : 'ha-creature--walking');
    node.style.setProperty('--direction', right ? '1' : '-1');
    if (flying) node.style.top = (18 + Math.random() * 45) + 'vh';
    const sprite = new Image();
    sprite.src = base + (flying ? 'vengefly.png' : 'crawlid.png');
    sprite.alt = '';
    node.append(sprite);
    layer.append(node);
    const start = right ? -140 : innerWidth + 140;
    const end = right ? innerWidth + 140 : -140;
    const animation = node.animate([
      {transform: `translate3d(${start}px,0,0)`},
      {transform: `translate3d(${end}px,0,0)`},
    ], {duration: (flying ? 16000 : 28000) + Math.random() * 6000, easing:'linear', fill:'forwards'});
    const entry = {node, animation};
    active.add(entry);
    animation.finished.then(() => { node.remove(); active.delete(entry); }).catch(() => {});
  };
  const schedule = (first = false) => {
    clearTimeout(timer);
    if (!enabled()) return;
    timer = setTimeout(() => { spawn(); schedule(); }, first ? 1800 : 11000 + Math.random() * 14000);
  };
  const update = () => { clear(); schedule(true); };
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener('change', update);
  addEventListener('ha:setting', update);
  addEventListener('storage', update);
  addEventListener('pagehide', clear);
  addEventListener('pageshow', update);
  schedule(true);
})();
