import { useRef, useEffect } from 'react';

export default function useParallax(reduceMotion, isMobile) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion || isMobile) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const scrolled = window.innerHeight - rect.top;
      const offset = scrolled * -0.04;
      el.style.transform = `translateY(${Math.max(-60, Math.min(60, offset))}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduceMotion, isMobile]);

  return ref;
}
