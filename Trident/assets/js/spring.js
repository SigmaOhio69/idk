/* ============================================================================
   Trident — spring physics
   A tiny semi-implicit Euler integrator. Used for the fluid hover pill and
   panel choreography, so motion matches Framer's stiffness/damping feel
   without shipping an animation library.
   ========================================================================== */
(function () {
  const T = (window.Trident = window.Trident || {});

  const STEP = 1 / 120; // fixed physics step
  const REST_DISPLACEMENT = 0.02;
  const REST_VELOCITY = 0.06;

  function prefersReduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Spring-driven scalar. Retargetable while running (no restart jitter).
   */
  class Spring {
    constructor(value, opts) {
      const o = opts || {};
      this.value = value || 0;
      this.target = value || 0;
      this.velocity = 0;
      this.stiffness = o.stiffness == null ? 500 : o.stiffness;
      this.damping = o.damping == null ? 30 : o.damping;
      this.mass = o.mass == null ? 1 : o.mass;
      this.onUpdate = o.onUpdate || null;
      this.onRest = o.onRest || null;
      this._raf = 0;
      this._acc = 0;
      this._last = 0;
      this._tick = this._tick.bind(this);
    }

    set(target) {
      this.target = target;
      if (!this._raf) this._start();
      return this;
    }

    jump(value) {
      this.value = value;
      this.target = value;
      this.velocity = 0;
      this._stop();
      this._emit();
      return this;
    }

    stop() {
      this._stop();
      return this;
    }

    _start() {
      this._last = performance.now();
      this._acc = 0;
      this._raf = requestAnimationFrame(this._tick);
    }

    _stop() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
    }

    _tick(now) {
      let dt = (now - this._last) / 1000;
      this._last = now;
      if (dt > 0.064) dt = 0.064; // clamp after tab blur
      this._acc += dt;

      while (this._acc >= STEP) {
        const f = -this.stiffness * (this.value - this.target);
        const d = -this.damping * this.velocity;
        const a = (f + d) / this.mass;
        this.velocity += a * STEP;
        this.value += this.velocity * STEP;
        this._acc -= STEP;
      }

      this._emit();

      const settled =
        Math.abs(this.value - this.target) < REST_DISPLACEMENT && Math.abs(this.velocity) < REST_VELOCITY;
      if (settled) {
        this.value = this.target;
        this.velocity = 0;
        this._stop();
        this._emit();
        if (this.onRest) this.onRest(this.value);
        return;
      }
      this._raf = requestAnimationFrame(this._tick);
    }

    _emit() {
      if (this.onUpdate) this.onUpdate(this.value);
    }
  }

  /**
   * One-shot transition driven by the same integrator.
   * Falls back to an instant jump when the user prefers reduced motion.
   */
  function animate(opts) {
    const o = opts || {};
    if (o.onUpdate && prefersReduced()) {
      o.onUpdate(o.to);
      if (o.onComplete) o.onComplete(o.to);
      return { stop() {}, set() {} };
    }
    const s = new Spring(o.from || 0, {
      stiffness: o.stiffness,
      damping: o.damping,
      mass: o.mass,
      onUpdate: o.onUpdate,
      onRest: o.onComplete ? () => o.onComplete(s.value) : null,
    });
    s.set(o.to || 0);
    return s;
  }

  T.spring = { Spring, animate, prefersReduced, STEP };
})();
