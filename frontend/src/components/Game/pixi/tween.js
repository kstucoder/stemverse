// Mini tween engine — Pixi ticker bilan ishlaydigan yengil easing tizimi.
// GSAP o'rniga: bizga faqat "add + tick" kerak, 40 qator kifoya.

export const Eases = {
  linear: (t) => t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
};

export function createTweens() {
  const list = [];
  return {
    // add({ delay, duration, ease, update(k), done() })
    add({ delay = 0, duration = 0.5, ease = Eases.outCubic, update, done }) {
      list.push({ t: -delay, duration, ease, update, done });
    },
    tick(dt) {
      for (let i = list.length - 1; i >= 0; i--) {
        const tw = list[i];
        tw.t += dt;
        if (tw.t < 0) continue;
        const k = Math.min(tw.t / tw.duration, 1);
        tw.update(tw.ease(k));
        if (k >= 1) {
          list.splice(i, 1);
          if (tw.done) tw.done();
        }
      }
    },
    clear() { list.length = 0; },
  };
}
