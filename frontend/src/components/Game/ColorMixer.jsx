// 🎨 VOLTRA Kroma — Rang Forjasi (PixiJS Premium Edition)
// Digital Twin: 3 ta potensiometr (A0/A1/A2) → R/G/B kanallari → RGB LED.
// Arduino "R:.. G:.. B:.." yuboradi; markaziy kristall shu rangda porlaydi.
// Maqsad-kristall rangiga moslashtir — 3 marta mos kelsa g'alaba.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleForge, forgeTick } from './pixi/colorScene';
import GuideCharacter from './GuideCharacter';
import useGameStore from '../../stores/gameStore';
import { playBloom, playScore } from './gameAudio';

const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(v)));
const randColor = () => ({ r: Math.round(Math.random() * 255), g: Math.round(Math.random() * 255), b: Math.round(Math.random() * 255) });

const MILESTONES = {
  1: { text: 'Birinchi rang tiklandi! Kroma jonlanmoqda.', emotion: 'excited' },
  2: { text: 'Yana bittasi qoldi — davom et!', emotion: 'normal' },
};

export default function ColorMixer() {
  const serialData = useGameStore((s) => s.serialData);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [target, setTarget] = useState(randColor);
  const [round, setRound] = useState(0);
  const [guide, setGuide] = useState(null);
  const winRef = useRef(false);
  const pulseRef = useRef(0);
  const guideTimer = useRef(null);

  const r = clamp255(serialData.r ?? 128);
  const g = clamp255(serialData.g ?? 128);
  const b = clamp255(serialData.b ?? 128);

  const diff = Math.abs(r - target.r) + Math.abs(g - target.g) + Math.abs(b - target.b);
  const similarity = Math.max(0, 100 - diff / 7.65); // 0..100

  // Sahnaga uzatiladigan boshqaruv (ticker o'qiydi)
  const ctlRef = useRef({ r, g, b, target, similarity: 0, connected: false, pulse: 0 });
  ctlRef.current.r = r; ctlRef.current.g = g; ctlRef.current.b = b;
  ctlRef.current.target = target;
  ctlRef.current.similarity = similarity / 100;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.pulse = pulseRef.current;

  // Moslik > 90% → rang tiklandi (edge-triggered, gate bilan)
  useEffect(() => {
    if (!arduinoConnected || winRef.current) return;
    if (similarity > 90) {
      winRef.current = true;
      pulseRef.current += 1;
      incrementScore(100);
      playBloom();
      const next = round + 1;
      setRound(next);
      const m = MILESTONES[next];
      if (m) { setGuide(m); clearTimeout(guideTimer.current); guideTimer.current = setTimeout(() => setGuide(null), 3500); }
      if (next >= 3) {
        const store = useGameStore.getState();
        if (store.onWin) store.onWin(score + 100);
      } else {
        setTarget(randColor());
        setTimeout(() => { winRef.current = false; }, 500);
      }
    }
  }, [similarity, arduinoConnected, round, score, incrementScore]);

  // yaqinlashganda yengil signal (bir marta 80% chegarasida)
  const near80 = useRef(false);
  useEffect(() => {
    if (similarity > 80 && !near80.current) { near80.current = true; playScore(); }
    if (similarity < 75) near80.current = false;
  }, [similarity]);

  useEffect(() => () => clearTimeout(guideTimer.current), []);

  const build = useCallback((app) => {
    const scene = assembleForge(app);
    let t = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05);
      t += dt;
      scene.tweens.tick(dt);
      scene.particles.tick(dt);
      forgeTick(scene, dt, t, ctlRef.current);
    });
    return () => scene.tweens.clear();
  }, []);

  const panel = {
    background: 'rgba(11,17,32,0.82)', border: '1px solid rgba(199,125,255,0.18)',
    borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace',
  };
  const simColor = similarity > 90 ? '#39e06a' : similarity > 60 ? '#ffc21a' : '#ff5a5a';
  const chan = [{ k: 'R', v: r, c: '#ff3b3b' }, { k: 'G', v: g, c: '#39e06a' }, { k: 'B', v: b, c: '#3b82ff' }];

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* Yuqori-chap: ball + tur */}
      <div className="absolute top-3 left-3 flex gap-2">
        <div style={panel}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF', textShadow: '0 0 8px rgba(199,125,255,0.5)' }}>⭐ {Math.round(score)}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>Ball</div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF' }}>{round}/3</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>RANG</div>
        </div>
      </div>

      {/* Yuqori-o'ng: moslik */}
      <div className="absolute top-3 right-3" style={{ ...panel, textAlign: 'center', minWidth: 96 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: simColor, textShadow: `0 0 14px ${simColor}90` }}>{Math.round(similarity)}%</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>MOSLIK</div>
      </div>

      {/* Maqsad yorlig'i (kristall tepasida) */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '4%' }}>
        <span style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8' }}>🎯 Maqsad rang</span>
      </div>

      {/* Past-markaz: R/G/B kanal barlari */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3" style={{ ...panel, padding: '9px 16px' }}>
        {chan.map((ch) => (
          <div key={ch.k} style={{ textAlign: 'center', width: 58 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ch.c }}>{ch.k} {ch.v}</div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 3 }}>
              <div style={{ height: '100%', width: `${(ch.v / 255) * 100}%`, background: ch.c, boxShadow: `0 0 8px ${ch.c}` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Electra izohlari */}
      {guide && (
        <div className="absolute bottom-3 left-3 flex items-end gap-2 animate-slide-up">
          <GuideCharacter emotion={guide.emotion} size={60} />
          <div style={{ ...panel, border: '1px solid rgba(199,125,255,0.3)', maxWidth: 210, marginBottom: 8, fontSize: 11.5, color: '#EAF3FF', fontFamily: 'DM Sans, sans-serif' }}>
            {guide.text}
          </div>
        </div>
      )}

      {/* Ulanish chipi */}
      {!arduinoConnected && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(199,125,255,0.3)' }}>
          <span style={{ fontSize: 11, color: '#c77dff' }}>🎨 Platani ulang — potensiometrlarni burab rang aralashtiring</span>
        </div>
      )}
    </PixiStage>
  );
}
