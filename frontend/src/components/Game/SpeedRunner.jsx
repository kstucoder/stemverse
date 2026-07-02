// 🏃 VOLTRA Speed Runner — Premium Edition
import { useEffect, useRef, useState } from 'react';
import useGameStore from '../../stores/gameStore';
import { C } from './gameHelpers';

const PLAYER_X = 50;       // fixed horizontal position (%), world scrolls instead
const GRAVITY = 260;       // % per second^2 — real parabolic fall, not a teleport
const JUMP_VELOCITY = 130; // initial upward speed (% per second)

export default function SpeedRunner() {
  const { serialData, score, incrementScore } = useGameStore();
  const [playerY, setPlayerY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [distance, setDistance] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const playerYRef = useRef(0);
  const jumpingRef = useRef(false);
  const vyRef = useRef(0);
  const prevBtnRef = useRef(0);
  const obstacleCounter = useRef(0);
  const winRef = useRef(false);

  useEffect(() => {
    if (distance >= 1000 && !winRef.current && !gameOver) {
      winRef.current = true;
      const store = useGameStore.getState();
      if (store.onWin) store.onWin(score);
    }
  }, [distance, score, gameOver]);

  // Speed is driven by the real potentiometer (0-1023) -> always a safe,
  // finite integer even before hardware is connected.
  const pot = serialData.pot || 0;
  const speed = Math.max(1, Math.round((pot / 1023) * 10));
  const progress = Math.min(distance / 1000, 1);

  // Jump trigger — edge-triggered on the real button so a held press doesn't
  // re-fire every frame, and blocked while already airborne.
  useEffect(() => {
    const btn = serialData.btn || 0;
    if (btn === 1 && prevBtnRef.current === 0 && !jumpingRef.current && !gameOver) {
      jumpingRef.current = true;
      setIsJumping(true);
      vyRef.current = JUMP_VELOCITY;
    }
    prevBtnRef.current = btn;
  }, [serialData.btn, gameOver]);

  // Real jump physics: velocity decays under gravity, giving an actual
  // parabolic arc instead of an instant up/down teleport.
  useEffect(() => {
    if (gameOver) return;
    let raf;
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (jumpingRef.current) {
        vyRef.current -= GRAVITY * dt;
        let ny = playerYRef.current + vyRef.current * dt;
        if (ny <= 0) {
          ny = 0;
          jumpingRef.current = false;
          vyRef.current = 0;
          setIsJumping(false);
        }
        playerYRef.current = ny;
        setPlayerY(ny);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [gameOver]);

  // World scroll + obstacle spawn/collision — a single stable interval (not
  // torn down and rebuilt every tick), checking collisions against the
  // freshly-moved obstacle positions and the current jump height via refs.
  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameOver) return;
      setDistance((d) => d + speed * 0.5);
      incrementScore(Math.round(speed * 0.1));
      obstacleCounter.current += speed;

      setObstacles((prev) => {
        let next = prev.map((o) => ({ ...o, x: o.x - speed * 0.5 })).filter((o) => o.x > -15);
        if (obstacleCounter.current > 30) {
          obstacleCounter.current = 0;
          next = [...next, { id: Date.now(), x: 100, height: 10 + Math.random() * 20, width: 8 }];
        }
        const hit = next.some((o) => Math.abs(o.x - PLAYER_X) < 8 && playerYRef.current < o.height);
        if (hit) setGameOver(true);
        return next;
      });
    }, 33);
    return () => clearInterval(gameLoop);
  }, [gameOver, speed, incrementScore]);

  const reset = () => {
    setGameOver(false);
    setDistance(0);
    setObstacles([]);
    setPlayerY(0);
    playerYRef.current = 0;
    jumpingRef.current = false;
    vyRef.current = 0;
    setIsJumping(false);
    winRef.current = false;
  };

  return (
    <div className="relative h-full min-h-[500px] overflow-hidden select-none" style={{ background: 'linear-gradient(180deg, #020617 0%, #0B1120 100%)', borderRadius: 14 }}>

      {/* Animated ground grid */}
      <div className="absolute inset-x-0 bottom-0 h-1/3" style={{
        background: `repeating-linear-gradient(90deg, transparent 0px, transparent 39px, rgba(0,238,255,0.03) 39px, rgba(0,238,255,0.03) 40px)`,
      }} />

      {gameOver ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20" style={{ background: 'rgba(4,6,14,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="text-5xl font-bold mb-3" style={{ fontFamily: 'Chakra Petch, monospace', color: C.CYAN, textShadow: `0 0 30px ${C.CYAN}80` }}>HALOKAT!</div>
          <div className="text-lg mb-8" style={{ color: C.WHITE, fontFamily: 'Chakra Petch, monospace' }}>Siz {Math.round(distance)}m yugurdingiz</div>
          <button onClick={reset} className="px-8 py-3 font-bold text-sm uppercase tracking-wider rounded-xl transition-all" style={{
            fontFamily: 'Chakra Petch, monospace', color: C.DARK, background: `linear-gradient(135deg, ${C.CYAN}, ${C.CYAN}dd)`,
            boxShadow: `0 0 20px rgba(0,238,255,0.4)`,
          }}>Qayta urinish</button>
        </div>
      ) : (
        <>
          {/* Player */}
          <div className="absolute bottom-0" style={{
            left: `${PLAYER_X}%`,
            bottom: `${playerY + 20}%`,
            transform: 'translateX(-50%)',
          }}>
            <div className="w-8 h-10 relative" style={{
              background: C.CYAN,
              borderRadius: '4px 4px 8px 8px',
              boxShadow: `0 0 15px ${C.CYAN}99`,
            }}>
              {/* Head dot */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{ background: C.GOLD, boxShadow: `0 0 6px ${C.GOLD}` }} />
            </div>
          </div>

          {/* Obstacles */}
          {obstacles.map((o) => (
            <div key={o.id} className="absolute bottom-0 transition-all duration-75 ease-linear" style={{
              left: `${o.x}%`,
              bottom: '20%',
              width: `${o.width}%`,
              height: `${o.height + 5}%`,
              background: `linear-gradient(180deg, ${C.PINK}dd, ${C.PINK}44)`,
              borderRadius: '4px 4px 0 0',
              border: `1px solid ${C.PINK}60`,
              boxShadow: `0 0 8px ${C.PINK}40`,
            }} />
          ))}

          {/* HUD */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            {[
              { icon: '📏', value: `${Math.round(distance)}m`, label: 'Masofa' },
              { icon: '⚡', value: `x${speed}`, label: 'Tezlik' },
              { icon: '⭐', value: score, label: 'Ball' },
            ].map((h,i) => (
              <div key={i} className="px-4 py-2.5" style={{
                background: C.GLASS, border: `1px solid rgba(0,238,255,0.1)`,
                borderRadius: 12, backdropFilter: 'blur(8px)',
              }}>
                <div className="text-sm font-bold" style={{ color: C.WHITE, fontFamily: 'Chakra Petch, monospace' }}>{h.icon} {h.value}</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: C.MUTED, fontFamily: 'Chakra Petch, monospace' }}>{h.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4">
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, ${C.GREEN}, ${C.CYAN})`,
                boxShadow: `0 0 12px ${C.CYAN}60`
              }} />
            </div>
          </div>

          {/* Controls hint */}
          <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-6">
            <span className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-full" style={{
              fontFamily: 'Chakra Petch, monospace', color: C.MUTED,
              background: C.GLASS, border: `1px solid rgba(0,238,255,0.08)`,
            }}>POT → Tezlik</span>
            <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full transition-all ${isJumping ? 'scale-110' : ''}`} style={{
              fontFamily: 'Chakra Petch, monospace', color: isJumping ? C.CYAN : C.MUTED,
              background: C.GLASS, border: `1px solid ${isJumping ? C.CYAN : 'rgba(0,238,255,0.08)'}`,
            }}>BTN → Sakrash</span>
          </div>
        </>
      )}
    </div>
  );
}
