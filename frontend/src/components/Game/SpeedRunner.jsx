// 🏃 VOLTRA Speed Runner — Premium Edition
import { useEffect, useRef, useState } from 'react';
import useGameStore from '../../stores/gameStore';
import { C } from './gameHelpers';

export default function SpeedRunner() {
  const { serialData, score, incrementScore } = useGameStore();
  const [playerY, setPlayerY] = useState(0);
  const [playerX, setPlayerX] = useState(50);
  const [isJumping, setIsJumping] = useState(false);
  const [distance, setDistance] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const frameRef = useRef(null);
  const jumpRef = useRef(null);
  const obstacleCounter = useRef(0);
  const winRef = useRef(false);

  useEffect(() => {
    if (distance >= 1000 && !winRef.current && !gameOver) {
      winRef.current = true;
      const store = useGameStore.getState();
      if (store.onWin) store.onWin(score);
    }
  }, [distance, score, gameOver]);

  const speed = Math.max(1, Math.round((serialData.potentiometer / 1023) * 10));
  const progress = Math.min(distance / 1000, 1);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameOver) return;
      setDistance((d) => { const nd = d + speed * 0.5; incrementScore(Math.round(speed * 0.1)); return nd; });
      obstacleCounter.current += speed;
      if (obstacleCounter.current > 30) {
        obstacleCounter.current = 0;
        setObstacles((prev) => [...prev, { id: Date.now(), x: 100, height: 10 + Math.random() * 20, width: 8 }]);
      }
      setObstacles((prev) => prev.map((o) => ({ ...o, x: o.x - speed * 0.5 })).filter((o) => o.x > -15));
      // Collision
      if (obstacles.some((o) => Math.abs(o.x - playerX) < 8 && playerY < o.height)) {
        setGameOver(true);
      }
    }, 33);
    return () => clearInterval(gameLoop);
  }, [gameOver, speed, obstacles, playerX, playerY]);

  // Jump
  useEffect(() => {
    if (serialData.button === 1 && !isJumping && !gameOver) {
      setIsJumping(true);
      setPlayerY(40);
      jumpRef.current = setTimeout(() => { setPlayerY(0); setIsJumping(false); }, 400);
    }
    return () => clearTimeout(jumpRef.current);
  }, [serialData.button]);

  const reset = () => {
    setGameOver(false);
    setDistance(0);
    setObstacles([]);
    setPlayerY(0);
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
          <div className="absolute bottom-0 transition-all duration-75 ease-linear" style={{
            left: `${playerX}%`,
            bottom: `${playerY + 20}%`,
            transform: 'translateX(-50%)',
          }}>
            <div className="w-8 h-10 relative" style={{
              background: isJumping ? C.CYAN : C.CYAN,
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
