// 🔓 VOLTRA "Seyf Sirini Buz" (PixiJS Premium Edition — disk kombinatsiya qulfi)
// Digital Twin: POT = seyf diski (0–39 raqam), BTN = tasdiqlash, LED+buzzer.
// 3 raqamli kombinatsiyani top: diskni har raqamga burab, tugma bilan tasdiqla.
// 3 raqam to'g'ri → po'lat eshik ochiladi (komponent onWin).
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleVault, vaultTick } from './pixi/vaultScene';
import useGameStore from '../../stores/gameStore';
import { playClunk, playChime, playError, playWin } from './gameAudio';

const makeCombo = () => [
  5 + Math.floor(Math.random() * 9),
  17 + Math.floor(Math.random() * 9),
  29 + Math.floor(Math.random() * 9),
];
const TOL = 1;

export default function SecretCodeDoor() {
  const serialBtn = useGameStore((s) => s.serialData.btn);
  const serialPot = useGameStore((s) => s.serialData.pot);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [combo] = useState(makeCombo);
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [wrong, setWrong] = useState(false);
  const prevBtn = useRef(0);
  const winRef = useRef(false);
  const wrongTimer = useRef(null);

  const dialNum = arduinoConnected ? Math.round(((serialPot || 0) / 1023) * 39) : 0;
  const target = combo[Math.min(step, 2)];
  const onTarget = arduinoConnected && !open && Math.abs(dialNum - target) <= TOL;

  const ctlRef = useRef({ dialNum: 0, step: 0, onTarget: false, openPulse: false, connected: false });
  ctlRef.current.dialNum = dialNum;
  ctlRef.current.step = step;
  ctlRef.current.onTarget = onTarget;
  ctlRef.current.openPulse = open;
  ctlRef.current.connected = arduinoConnected;

  useEffect(() => {
    if (open) return;
    const btn = serialBtn || 0;
    if (btn === 1 && prevBtn.current === 0 && arduinoConnected) {
      if (Math.abs(dialNum - target) <= TOL) {
        const next = step + 1;
        incrementScore(20);
        setStep(next);
        if (next >= 3) {
          setOpen(true);
          playWin();
          if (!winRef.current) { winRef.current = true; const st = useGameStore.getState(); if (st.onWin) st.onWin(score + 100); }
        } else {
          playClunk(); playChime(600 + next * 120);
        }
      } else {
        playError();
        setWrong(true);
        clearTimeout(wrongTimer.current);
        wrongTimer.current = setTimeout(() => setWrong(false), 600);
      }
    }
    prevBtn.current = btn;
  }, [serialBtn, arduinoConnected, open, dialNum, target, step, score, incrementScore]);

  useEffect(() => () => clearTimeout(wrongTimer.current), []);

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

      {/* Yuqori-o'ng: disk raqami */}
      <div className="absolute top-3 right-3" style={{ ...panel, textAlign: 'center', minWidth: 84 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: onTarget ? '#39e06a' : wrong ? '#ff3b46' : '#EAF3FF', textShadow: `0 0 12px ${onTarget ? '#39e06a' : '#00eeff'}70` }}>{String(dialNum).padStart(2, '0')}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>DISK</div>
      </div>

      {/* Markaz-yuqori: kombinatsiya */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3" style={{ top: '9%', ...panel, padding: '9px 18px' }}>
        {combo.map((n, i) => {
          const done = i < step;
          const cur = i === step;
          return (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, fontWeight: 800,
                color: done ? '#0a0d14' : cur ? '#0a0d14' : '#64748b',
                background: done ? '#39e06a' : cur ? (onTarget ? '#39e06a' : '#ffc21a') : 'rgba(255,255,255,0.05)',
                border: cur ? '2px solid #fff' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: cur ? `0 0 14px ${onTarget ? '#39e06a' : '#ffc21a'}80` : 'none',
                transition: 'all 0.2s',
              }}>{done || cur ? String(n).padStart(2, '0') : '??'}</div>
            </div>
          );
        })}
      </div>

      {/* Past-markaz: ko'rsatma */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 260 }}>
        <div style={{ fontSize: 10.5, color: onTarget ? '#39e06a' : '#94a3b8' }}>
          {open ? '🔓 Seyf ochildi — yadro qaytarildi!'
            : !arduinoConnected ? 'Platani ulang — potensiometr diskni aylantiradi'
              : onTarget ? '✅ Raqam ustidasan — TUGMANI BOS!'
                : `🎯 Diskni ${String(target).padStart(2, '0')} raqamiga bur (${step + 1}/3)`}
        </div>
      </div>

      {/* Ulanish chipi */}
      {!arduinoConnected && !open && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(0,238,255,0.3)' }}>
          <span style={{ fontSize: 11, color: '#00eeff' }}>🔒 Platani ulang — disk (POT) + tasdiq (tugma) bilan seyfni oching</span>
        </div>
      )}
    </PixiStage>
  );
}
