import { useRef, useEffect } from 'react';

export default function useCounters() {
  const ref = useRef(null);

  useEffect(() => {
    function runCounters() {
      document.querySelectorAll('.num span[data-to]').forEach((el) => {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        const to = parseFloat(el.dataset.to);
        const dec = +(el.dataset.dec || 0);
        const dur = 1400;
        const start = performance.now();

        function step(t) {
          const p = Math.min((t - start) / dur, 1);
          const v = (1 - Math.pow(1 - p, 3)) * to;
          el.textContent = dec ? v.toFixed(dec) : Math.floor(v);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = dec ? to.toFixed(dec) : to;
        }
        requestAnimationFrame(step);
      });
    }

    const sb = document.querySelector('.stats-band');
    if (!sb) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCounters();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(sb);
    return () => io.disconnect();
  }, []);

  return ref;
}
