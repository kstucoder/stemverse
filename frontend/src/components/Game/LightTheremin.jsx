// 🎵 VOLTRA "Yorug'lik Cholg'usi" (PixiJS Premium Edition)
// Digital Twin: LDR (yorug'lik sensori) → ovoz balandligi. Qo'l soyasi bilan
// pitch'ni boshqarib, 3 ta nishon-notaga navbatma-navbat moslashtir (biroz ushlab
// tur) — 3 nota tutilsa g'alaba. Jonli ossilator har kadr yangilanadi.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleTheremin, thereminTick } from './pixi/thereminScene';
import useGameStore from '../../stores/gameStore';
import { startLiveTone, updateLiveTone, stopLiveTone, playChime } from './gameAudio';

const TARGETS = [0.28, 0.55, 0.82];
const HOLD = 0.8;

export default function LightTheremin() {
  const serialLdr = useGameStore((s) => s.serialData.ldr);
  const score = useGameStore((s) => s.score);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [note, setNote] = useState(0);
  const [prog, setProg] = useState(0);
  const [freqHz, setFreqHz] = useState(200);

  const freqNormRef = useRef(0);
  const connRef = useRef(false);
  const noteIdxRef = useRef(0);
  const holdRef = useRef(0);
  const capturePulseRef = useRef(0);
  const winRef = useRef(false);
  const hudAcc = useRef(0);

  const ctlRef = useRef({ freqNorm: 0, targetNorm: 0.28, matched: false, captureProgress: 0, capturePulse: 0, connected: false, noteIndex: 0 });

  const fn = arduinoConnected ? Math.min(1, (serialLdr || 0) / 1023) : 0;
  freqNormRef.current = fn;
  connRef.current = arduinoConnected;

  useEffect(() => {
    startLiveTone();
    let raf, last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const f = freqNormRef.current; const conn = connRef.current;
      const freq = 200 + f * 1800;
      updateLiveTone(freq, conn ? 0.1 : 0);
      const idx = noteIdxRef.current;
      if (conn && idx < 3) {
        const target = TARGETS[idx];
        const matched = Math.abs(f - target) < 0.05;
        holdRef.current = matched ? Math.min(HOLD, holdRef.current + dt) : Math.max(0, holdRef.current - dt * 1.5);
        ctlRef.current.matched = matched;
        if (holdRef.current >= HOLD) {
          holdRef.current = 0;
          noteIdxRef.current = idx + 1;
          capturePulseRef.current += 1;
          playChime(freq);
          useGameStore.getState().incrementScore(50);
          setNote(idx + 1);
          if (idx + 1 >= 3 && !winRef.current) {
            winRef.current = true;
            const st = useGameStore.getState();
            if (st.onWin) st.onWin(st.score);
          }
        }
      } else { ctlRef.current.matched = false; holdRef.current = 0; }

      ctlRef.current.freqNorm = f;
      ctlRef.current.targetNorm = TARGETS[Math.min(noteIdxRef.current, 2)];
      ctlRef.current.captureProgress = holdRef.current / HOLD;
      ctlRef.current.capturePulse = capturePulseRef.current;
      ctlRef.current.connected = conn;
      ctlRef.current.noteIndex = noteIdxRef.current;
      ctlRef.current.progress = Math.min(noteIdxRef.current, 3) / 3;

      hudAcc.current += dt;
      if (hudAcc.current > 0.1) { hudAcc.current = 0; setProg(holdRef.current / HOLD); setFreqHz(Math.round(freq)); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); stopLiveTone(); };
  }, []);

  const build = useCallback((app) => {
    const scene = assembleTheremin(app);
    let t = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05);
      t += dt;
      scene.particles.tick(dt);
      thereminTick(scene, dt, t, ctlRef.current);
    });
    return () => {};
  }, []);

  const panel = {
    background: 'rgba(11,17,32,0.82)', border: '1px solid rgba(120,90,255,0.22)',
    borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace',
  };

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* Yuqori-chap: ball + notalar */}
      <div className="absolute top-3 left-3 flex gap-2">
        <div style={panel}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF', textShadow: '0 0 8px rgba(120,90,255,0.5)' }}>⭐ {Math.round(score)}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>Ball</div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF' }}>{Math.min(note, 3)}/3</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>NOTA</div>
        </div>
      </div>

      {/* Yuqori-o'ng: chastota */}
      <div className="absolute top-3 right-3" style={{ ...panel, textAlign: 'center', minWidth: 96 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#a78bfa', textShadow: '0 0 12px rgba(120,90,255,0.6)' }}>{freqHz}Hz</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>CHASTOTA</div>
      </div>

      {/* Past-markaz: ushlash progressi */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, padding: '9px 16px', minWidth: 220, textAlign: 'center' }}>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 5 }}>
          <div style={{ height: '100%', width: `${prog * 100}%`, background: 'linear-gradient(90deg,#39e06a,#a78bfa)', boxShadow: '0 0 8px rgba(57,224,106,0.6)' }} />
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>
          {arduinoConnected ? "☀️ Qo'lingni sensor ustida harakatlantir — nishon notaga moslash" : 'Platani ulang'}
        </div>
      </div>

      {/* Ulanish chipi */}
      {!arduinoConnected && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(120,90,255,0.3)' }}>
          <span style={{ fontSize: 11, color: '#a78bfa' }}>🎵 Platani ulang — LDR sensorli yorug'lik cholg'usi</span>
        </div>
      )}
    </PixiStage>
  );
}
