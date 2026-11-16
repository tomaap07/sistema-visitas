(() => {
  const sprite = document.querySelector('[data-hornet-base]');
  if (!sprite || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const frames = Array.from({length:6}, (_,i) => {
    const image = new Image(); image.src = sprite.dataset.hornetBase + 'hornet_idle_' + (i+1) + '.png'; return image;
  });
  let frame = 0;
  setInterval(() => { if (!document.hidden && document.documentElement.dataset.effects !== 'reduced') sprite.src = frames[(frame = (frame+1)%frames.length)].src; }, 220);
})();
