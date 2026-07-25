// 🏃 VOLTRA "Tom Ustidan Poyga" (PixiJS Premium Edition)
// Digital Twin: POT → yugurish tezligi, BTN → sakrash. To'siqlardan sakrab o't,
// energiya orblarini yig', 1000m yugur — g'alaba. To'qnashuv → o'yin tugadi.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleRunner, runnerTick } from './pixi/runnerScene';
import useGameStore from '../../stores/gameStore';
import { playJump, playCrash, playScore } from './gameAudio';

const MAX_SPEED = 330;

export default function SpeedRunner() {
  const serialBtn = useGameStore((s) => s.serialData.btn);
  const serialPot = useGameStore((s) => s.serialData.pot);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [distance, setDistance] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const jumpPulse = useRef(0);
  const resetPulse = useRef(0);
  const prevBtn = useRef(0);
  const winRef = useRef(false);

  const pot = serialPot || 0;
  const speedX = arduinoConnected ? Math.max(0, Math.round((pot / 1023) * 10)) : 0;

  const ctlRef = useRef({
    speed: 0, jumpPulse: 0, resetPulse: 0, connected: false,
    onCrash: () => {}, onCoin: () => {}, onWin: () => {}, onDistance: () => {},
  });
  ctlRef.current.speed = arduinoConnected ? (pot / 1023) * MAX_SPEED : 0;
  ctlRef.current.jumpPulse = jumpPulse.current;
  ctlRef.current.resetPulse = resetPulse.current;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.onCrash = (d) => { setGameOver(true); setDistance(d); playCrash(); };
  ctlRef.current.onCoin = () => { incrementScore(10); playScore(); };
  ctlRef.current.onDistance = (d) => setDistance(d);
  ctlRef.current.onWin = () => {
    if (winRef.current) return;
    winRef.current = true;
    const store = useGameStore.getState();
    if (store.onWin) store.onWin(score);
  };

  // sakrash — edge-triggered
  useEffect(() => {
    const btn = serialBtn || 0;
    if (btn === 1 && prevBtn.current === 0 && arduinoConnected && !gameOver) { jumpPulse.current += 1; playJump(); }
    prevBtn.current = btn;
  }, [serialBtn, arduinoConnected, gameOver]);

  const reset = () => { resetPulse.current += 1; winRef.current = false; setGameOver(false); setDistance(0); };

  const build = useCallback((app) => {
    const scene = assembleRunner(app);
    let t = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05);
      t += dt;
      scene.particles.tick(dt);
      runnerTick(scene, dt, t, ctlRef.current);
    });
    return () => {};
  }, []);

  const panel = {
    background: 'rgba(11,17,32,0.82)', border: '1px solid rgba(0,238,255,0.15)',
    borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace',
  };
  const progress = Math.min(distance / 1000, 1);

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* HUD statlar */}
      <div className="absolute top-3 left-3 flex gap-2">
        {[
          { icon: '📏', value: `${Math.round(distance)}m`, label: 'Masofa' },
          { icon: '⚡', value: `x${speedX}`, label: 'Tezlik' },
          { icon: '⭐', value: Math.round(score), label: 'Ball' },
        ].map((it) => (
          <div key={it.label} style={panel}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#EAF3FF' }}>{it.icon} {it.value}</div>
            <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>{it.label}</div>
          </div>
        ))}
      </div>

      {/* progress */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2/3">
        <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: 'linear-gradient(90deg,#39e06a,#00eeff)', boxShadow: '0 0 12px rgba(0,238,255,0.5)' }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 9, marginTop: 3, color: '#64748b' }}>{Math.round(distance)} / 1000 m</div>
      </div>

      {/* boshqaruv maslahati */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4 pointer-events-none">
        <span style={{ ...panel, fontSize: 9, padding: '4px 10px', color: '#94a3b8' }}>POT → Tezlik</span>
        <span style={{ ...panel, fontSize: 9, padding: '4px 10px', color: '#94a3b8' }}>BTN → Sakrash</span>
      </div>

      {/* Game over */}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto" style={{ background: 'rgba(4,6,14,0.82)', backdropFilter: 'blur(6px)' }}>
          <div style={{ fontSize: 40, fontWeight: 800, fontFamily: 'Orbitron, monospace', color: '#ff2d78', textShadow: '0 0 30px rgba(255,45,120,0.6)' }}>HALOKAT!</div>
          <div style={{ color: '#EAF3FF', fontFamily: 'Chakra Petch, monospace', margin: '10px 0 22px' }}>{Math.round(distance)}m yugurdingiz</div>
          <button onClick={reset} className="btn-primary">Qayta urinish</button>
        </div>
      )}

      {/* Ulanish chipi */}
      {!arduinoConnected && !gameOver && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(0,238,255,0.3)' }}>
          <span style={{ fontSize: 11, color: '#00eeff' }}>🏃 Platani ulang — POT bilan yugur, tugma bilan sakra</span>
        </div>
      )}
    </PixiStage>
  );
}
