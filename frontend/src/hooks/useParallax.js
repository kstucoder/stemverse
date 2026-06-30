import { useRef, useEffect } from 'react';

export default function useParallax(reduceMotion, isMobile) {
  const ref = useRef(null);

  useEffect(() => {
    const scene = ref.current;
    if (!scene || reduceMotion || isMobile) return;

    const layers = scene.querySelectorAll('.layer');
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let rafId;

    const onMove = (e) => {
      const r = scene.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    };
    const onLeave = () => { tx = 0; ty = 0; };

    scene.addEventListener('mousemove', onMove);
    scene.addEventListener('mouseleave', onLeave);

    function loop() {
      rafId = requestAnimationFrame(loop);
      if (document.hidden) return;
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      layers.forEach((l) => {
        const d = +(l.dataset.depth || 10);
        l.style.transform = `translate(${-cx * d}px, ${-cy * d}px)`;
      });
    }
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      scene.removeEventListener('mousemove', onMove);
      scene.removeEventListener('mouseleave', onLeave);
    };
  }, [reduceMotion, isMobile]);

  return ref;
}
