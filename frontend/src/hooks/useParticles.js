import { useRef, useEffect } from 'react';

export default function useParticles(reduceMotion) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c || reduceMotion) return;

    const x = c.getContext('2d');
    let W, H;
    const parts = [];
    const lines = [];

    function size() {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
    }
    size();
    window.addEventListener('resize', size, { passive: true });

    const N = Math.min(64, Math.floor(window.innerWidth / 24));
    for (let i = 0; i < N; i++) {
      parts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.7 + 0.4,
        vy: -(Math.random() * 0.4 + 0.1),
        vx: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.5 + 0.2,
      });
    }
    for (let k = 0; k < 12; k++) {
      lines.push({
        x: Math.random() * W,
        y: Math.random() * H,
        len: Math.random() * 60 + 30,
        dir: Math.random() < 0.5 ? 0 : 1,
        a: Math.random() * 0.1 + 0.03,
      });
    }

    let bolt = null, bt = 0, tick = 0, rafId;

    function spawn() {
      const sx = Math.random() * W;
      const segs = [];
      let y = 0, xx = sx;
      while (y < H * 0.7) {
        y += Math.random() * 40 + 20;
        xx += (Math.random() - 0.5) * 60;
        segs.push({ x: xx, y });
      }
      bolt = { x: sx, segs };
      bt = 1;
    }

    function frame() {
      rafId = requestAnimationFrame(frame);
      if (document.hidden) return;

      x.clearRect(0, 0, W, H);
      x.lineWidth = 1;

      // L-shaped circuit lines
      lines.forEach((l) => {
        x.strokeStyle = `rgba(25,227,255,${l.a})`;
        x.beginPath();
        if (l.dir === 0) {
          x.moveTo(l.x, l.y);
          x.lineTo(l.x + l.len, l.y);
          x.lineTo(l.x + l.len + 10, l.y + 10);
        } else {
          x.moveTo(l.x, l.y);
          x.lineTo(l.x, l.y + l.len);
          x.lineTo(l.x + 10, l.y + l.len + 10);
        }
        x.stroke();
      });

      // Glowing particles
      parts.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        x.beginPath();
        x.arc(p.x, p.y, p.r, 0, 6.28);
        x.fillStyle = `rgba(25,227,255,${p.a})`;
        x.shadowBlur = 6;
        x.shadowColor = 'rgba(25,227,255,.6)';
        x.fill();
      });
      x.shadowBlur = 0;

      // Occasional lightning bolt
      if (bt > 0 && bolt) {
        x.strokeStyle = `rgba(180,240,255,${bt})`;
        x.lineWidth = 2;
        x.shadowBlur = 14;
        x.shadowColor = '#19E3FF';
        x.beginPath();
        x.moveTo(bolt.x, 0);
        bolt.segs.forEach((s) => x.lineTo(s.x, s.y));
        x.stroke();
        x.shadowBlur = 0;
        bt -= 0.06;
      }

      tick++;
      if (tick % 300 === 0 && Math.random() < 0.7) spawn();
    }
    frame();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', size);
    };
  }, [reduceMotion]);

  return ref;
}
