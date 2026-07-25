// 🔓 VOLTRA "Seyf Sirini Buz" (PixiJS Premium Edition)
// Digital Twin: bitta tugma (BTN). Har bosish bitta qulf shtiftini ochadi;
// 5 marta bosilsa seyf ochiladi. Win: 5 bosish (komponent onWin).
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleVault, vaultTick } from './pixi/vaultScene';
import GuideCharacter from './GuideCharacter';
import useGameStore from '../../stores/gameStore';
import { playClunk, playWin } from './gameAudio';

const CODE = 5;

export default function SecretCodeDoor() {
  const serialBtn = useGameStore((s) => s.serialData.btn);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [pins, setPins] = useState(0);
  const [open, setOpen] = useState(false);
  const prevBtn = useRef(0);
  const winRef = useRef(false);

  const ctlRef = useRef({ pins: 0, openPulse: false, connected: false });
  ctlRef.current.pins = pins;
  ctlRef.current.openPulse = open;
  ctlRef.current.connected = arduinoConnected;

  useEffect(() => {
    if (open) return;
    const btn = serialBtn || 0;
    if (btn === 1 && prevBtn.current === 0 && arduinoConnected) {
      const next = pins + 1;
      incrementScore(10);
      if (next >= CODE) {
        setPins(CODE);
        setOpen(true);
        playWin();
        if (!winRef.current) {
          winRef.current = true;
          const store = useGameStore.getState();
          if (store.onWin) store.onWin(score + 100);
        }
      } else {
        setPins(next);
        playClunk();
      }
    }
    prevBtn.current = btn;
  }, [serialBtn, arduinoConnected, open, pins, score, incrementScore]);

  const build = useCallback((app) => {
    const scene = assembleVault(app);
    let t = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05);
      t += dt;
      scene.tweens.tick(dt);
      scene.particles.tick(dt);
      vaultTick(scene, dt, t, ctlRef.current);
    });
    return () => scene.tweens.clear();
  }, []);

  const panel = {
    background: 'rgba(11,17,32,0.82)', border: '1px solid rgba(0,238,255,0.15)',
    borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace',
  };

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* Yuqori-chap: ball */}
      <div className="absolute top-3 left-3" style={panel}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF', textShadow: '0 0 8px rgba(0,238,255,0.5)' }}>⭐ {Math.round(score)}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>Ball</div>
      </div>

      {/* Yuqori-o'ng: holat */}
      <div className="absolute top-3 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: open ? '#39e06a' : '#ff3b46', textShadow: `0 0 12px ${open ? '#39e06a' : '#ff3b46'}80` }}>{open ? 'OCHIQ' : 'QULF'}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>SEYF</div>
      </div>

      {/* Past-markaz: shtift progressi */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, padding: '9px 16px' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 5 }}>
          {Array.from({ length: CODE }).map((_, i) => (
            <span key={i} style={{
              width: 22, height: 10, borderRadius: 3,
              background: i < pins ? 'linear-gradient(90deg,#39e06a,#00eeff)' : 'rgba(255,59,70,0.25)',
              boxShadow: i < pins ? '0 0 8px rgba(57,224,106,0.6)' : 'none',
            }} />
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>
          {open ? '🔓 Seyf ochildi!' : arduinoConnected ? `🔘 Sirli kodni kiriting: ${pins}/${CODE}` : 'Platani ulang'}
        </div>
      </div>

      {/* Ulanish chipi */}
      {!arduinoConnected && !open && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(255,59,70,0.3)' }}>
          <span style={{ fontSize: 11, color: '#ff6b6b' }}>🔒 Platani ulang — tugma bilan seyfni buzing</span>
        </div>
      )}
    </PixiStage>
  );
}
