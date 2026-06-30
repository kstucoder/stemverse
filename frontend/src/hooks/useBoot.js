import { useState, useEffect, useRef } from 'react';

export default function useBoot(reduceMotion) {
  // 'active' → 'exiting' (CSS fade-out 0.9s) → 'hidden' (unmount)
  const [phase, setPhase] = useState('active');
  const doneRef = useRef(false);

  const endBoot = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    document.body.classList.remove('booting');
    setPhase('exiting');
    setTimeout(() => setPhase('hidden'), 900);
  };

  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem('voltra_booted');
      sessionStorage.setItem('voltra_booted', '1');
    } catch (e) {}

    const delay = (reduceMotion || seen) ? 200 : 5000;
    const t = setTimeout(endBoot, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    booting: phase !== 'hidden',   // true while active OR exiting (keep BootScreen mounted)
    bootDone: phase === 'exiting', // true during CSS fade-out
    skipBoot: endBoot,
  };
}
