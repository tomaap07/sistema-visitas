/*
 * Optional sprite controller. Nothing is spawned unless an authorised asset
 * and its real frame metadata are explicitly supplied by the integrator.
 * Sprite sheet rows must contain the named states and exact frame counts.
 */
class PersonajeAmbiental {
  constructor(element, config) {
    if (!config.src || !config.states || !config.states.idle) throw new Error('Faltan recursos o fotogramas autorizados.');
    this.el = element;
    this.config = config;
    this.state = 'idle';
    this.frame = 0;
    this.elapsed = 0;
    this.last = 0;
    this.running = false;
    this.el.style.backgroundImage = 'url(' + JSON.stringify(config.src) + ')';
    this.el.style.pointerEvents = 'none';
    this.tick = this.tick.bind(this);
  }
  setState(name) {
    if (!this.config.states[name] || this.state === name) return;
    this.state = name; this.frame = 0; this.elapsed = 0;
  }
  tick(time) {
    if (!this.running) return;
    if (!document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const state = this.config.states[this.state];
      this.elapsed += this.last ? Math.min(time - this.last, 100) : 0;
      if (this.elapsed >= state.duration) {
        this.frame = (this.frame + 1) % state.frames;
        this.elapsed = 0;
      }
      this.el.style.backgroundPosition = `-${this.frame * this.config.width}px -${state.row * this.config.height}px`;
    }
    this.last = time;
    requestAnimationFrame(this.tick);
  }
  start() { if (!this.running) { this.running = true; requestAnimationFrame(this.tick); } }
  stop() { this.running = false; this.last = 0; }
}
window.PersonajeAmbiental = PersonajeAmbiental;
