// ☀️ VOLTRA "Quyosh Yelkani" — STEPPER MOTOR (28BYJ-48 + ULN2003) yangi element.
// POT panel burchagini boshqaradi; stepper qadamba-qadam aniq buriladi va siljiyotgan quyoshni
// track qiladi. Panel normalini quyoshga aniq qaratganda reaktor zaryadlanadi. 100% -> g'alaba.
import { useCallback, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleSolar, solarTick } from './pixi/solarScene';
import useGameStore from '../../stores/gameStore';
import { playScore, playWin, playClick } from './gameAudio';

export default function IoTDashboard() {
  const pot = useGameStore((s) => s.serialData.pot);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ charge: 0, align: 0, ms: 0 });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ pot: 512, connected: false, mode: 'play', resetPulse: 0 });
  ctlRef.current.pot = arduinoConnected ? (pot ?? 512) : 512;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onCharge = () => { playScore(); incrementScore(70); useGameStore.getState().triggerShake?.(4); };
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 400); };

  const build = useCallback((app) => {
    const scene = assembleSolar(app);
    let t = 0, acc = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; solarTick(scene, dt, t, ctlRef.current); acc += dt; if (acc > 0.08) { acc = 0; setHud({ charge: scene.charge, align: scene.alignment, ms: scene.milestone }); } });
    return () => {};
  }, []);

  const restart = () => { resetRef.current += 1; winRef.current = false; setStatus('play'); };
  const panel = { background: 'rgba(14,12,8,0.84)', border: '1px solid rgba(255,200,120,0.3)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const bracket = { position: 'absolute', width: 26, height: 26, borderColor: 'rgba(255,200,120,0.5)', pointerEvents: 'none' };

  return (
    <PixiStage build={build} className="rounded-xl">
      <div style={{ ...bracket, top: 10, left: 10, borderLeft: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, top: 10, right: 10, borderRight: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, left: 10, borderLeft: '2px solid', borderBottom: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, right: 10, borderRight: '2px solid', borderBottom: '2px solid' }} />

      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 10, color: '#ffd9a0', letterSpacing: '0.14em' }}>
        <span className="animate-pulse" style={{ color: '#ffd23a' }}>☀ SOLAR</span>
        <span>ARRAY-FARM 18</span>
        <span style={{ color: arduinoConnected ? '#39ff88' : '#8a8a8a' }}>{arduinoConnected ? 'STEPPER: READY' : 'STEPPER: OFFLINE'}</span>
      </div>

      <div className="absolute top-10 left-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#6bffb0' }}>{Math.round(hud.charge * 100)}%</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#8a7a5a' }}>REAKTOR ZARYADI</div>
      </div>
      <div className="absolute top-10 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: hud.align > 0.85 ? '#39ff88' : (hud.align > 0.5 ? '#ffd23a' : '#ff6a4a') }}>{Math.round(hud.align * 100)}%</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#8a7a5a' }}>NISHONLASH</div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 380 }}>
        <div style={{ fontSize: 10.5, color: '#f0d9b0' }}>
          {status === 'won' ? '☀️ Reaktor to\'la quvvatlandi — baza yorishdi!'
            : !arduinoConnected ? 'Platani ulang — stepper bilan quyosh panelini buring'
              : hud.align > 0.85 ? '🟢 ANIQ NISHON! Quvvat oqmoqda — quyosh siljisa, kuzatib bor'
                : '🔆 POT bilan panelni ANIQ quyoshga qarat — nishon 85%+ bo\'lsin'}
        </div>
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(255,200,120,0.4)' }}>
          <span style={{ fontSize: 12, color: '#ffd23a' }}>🔌 Platani ulang — stepper motor bilan quyosh panelini yo'nalt</span>
        </div>
      )}

      {status === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(10,8,4,0.55)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>☀️</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#6bffb0', marginBottom: 4 }}>Reaktor to'la zaryadlandi!</div>
            <div style={{ fontSize: 11, color: '#f0d9b0', marginBottom: 14 }}>Quyosh panellari bazani to'liq quvvatladi</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#1a1204', background: '#ffd23a', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
