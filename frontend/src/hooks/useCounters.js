import { useRef, useEffect } from 'react';

export default function useCounters() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('[data-target]');
            counters.forEach((counter) => {
              const target = parseInt(counter.dataset.target, 10);
              const duration = 2000;
              const start = performance.now();

              const update = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                counter.textContent = Math.floor(progress * target).toLocaleString();
                if (progress < 1) requestAnimationFrame(update);
                else counter.textContent = target.toLocaleString();
              };
              requestAnimationFrame(update);
            });
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
