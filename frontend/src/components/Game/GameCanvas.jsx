// GameCanvas — React wrapper with game loop, shake, popups
import { useEffect, useRef } from 'react';
import useGameStore from '../../stores/gameStore';

export function useGameLoop(canvasRef, drawFn, updateFn, active = true) {
  const frameRef = useRef(null);
  const lastTime = useRef(0);

  useEffect(() => {
    if (!active) return;
    const loop = (time) => {
      const dt = Math.min((time - lastTime.current) / 1000, 0.05);
      lastTime.current = time;
      const store = useGameStore.getState();
      store.updatePopups(dt);
      store.updateShake(dt);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        if (updateFn) updateFn(dt);
        if (drawFn) drawFn(ctx, w, h, time / 1000);
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [active]);
}

export default function GameCanvas({ draw, update, children, className = '' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  useGameLoop(canvasRef, draw, update);

  useEffect(() => {
    const resize = () => {
      const parent = canvasRef.current?.parentElement;
      if (parent && canvasRef.current) {
        canvasRef.current.width = parent.clientWidth;
        canvasRef.current.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-full min-h-[500px] overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Score popups rendered as CSS elements */}
      {children && <div className="absolute inset-0 pointer-events-none">{children}</div>}
      <ScorePopups />
    </div>
  );
}

// Floating score popups
function ScorePopups() {
  const popups = useGameStore((s) => s.popups);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {popups.map((p) => (
        <div
          key={p.id}
          className="absolute font-game text-lg font-bold transition-all duration-500 animate-slide-up"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            color: p.color,
            opacity: p.life,
            textShadow: `0 0 10px ${p.color}60`,
            transform: `translateY(${(1 - p.life) * -50}px)`,
          }}
        >
          {p.text}
        </div>
      ))}
    </div>
  );
}
