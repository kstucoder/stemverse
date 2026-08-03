// 🎵 VOLTRA "Rezonans Mayog'i: Signal Kaliti" — 4 tugma ritm o'yini.
// Digital Twin: 4 tugma = 4 nota (C-D-E-F). Pastga oqayotgan notalarni zarba
// halqasida mos tugma bilan chal -> mayoq zaryadlanadi. To'lganda mayoq yonib
// osmonga signal beradi, omon qolganlar javob beradi. Faqat Arduino ulanganda.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleResonance, resonanceTick, NOTES } from './pixi/resonanceScene';
import useGameStore from '../../stores/gameStore';
import { playNote, playError, playBeacon, playChime } from './gameAudio';

export default function PianoPlayer() {
  const btn = useGameStore((s) => s.serialData.btn);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [charge, setCharge] = useState(0);
  const [combo, setCombo] = useState(0);
  const [status, setStatus] = useState('play');
  const winRef = useRef(false);
  const resetRef = useRef(0);

  const ctlRef = useRef({ btn: 0, connected: false, mode: 'play', resetPulse: 0 });
  ctlRef.current.btn = arduinoConnected ? (btn | 0) : 0;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onHit = ({ freq, combo: cmb }) => { playNote(freq); if (cmb > 0 && cmb % 5 === 0) playChime(880 + cmb * 10); incrementScore(10); setCombo(cmb); };
  ctlRef.current.onMiss = () => setCombo(0);
  ctlRef.current.onWrong = () => { playError(); setCombo(0); };
  ctlRef.current.onCharge = (c) => setCharge(c);
  ctlRef.current.onWin = () => {
    if (winRef.current) return; winRef.current = true; setStatus('won'); playBeacon();
    const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 120);
  };

  useEffect(() => {
    resetRef.current += 1; winRef.current = false;
    setCharge(0); setCombo(0); setStatus('play');
  }, [arduinoConnected]);

  const restart = () => { resetRef.current += 1; winRef.current = false; setCharge(0); setCombo(0); setStatus('play'); };

  const build = useCallback((app) => {
    const scene = assembleResonance(app);
    let t = 0, lastCharge = -1;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
      resonanceTick(scene, dt, t, ctlRef.current);
      if (scene.charge !== lastCharge) { lastCharge = scene.charge; ctlRef.current.onCharge?.(scene.charge); }
    });
    return () => {};
  }, []);

  const panel = { background: 'rgba(20,14,32,0.82)', border: '1px solid rgba(245,197,24,0.22)', borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* yuqori-chap: zaryad */}
      <div className="absolute top-3 left-3 flex gap-2">
        <div style={{ ...panel, minWidth: 150 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#b79a6a', marginBottom: 4 }}>MAYOQ ZARYADI · {Math.round(charge)}%</div>
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round(charge)}%`, background: 'linear-gradient(90deg,#f5c518,#39e06a,#9fe8ff)', transition: 'width 0.15s', boxShadow: '0 0 8px rgba(159,232,255,0.6)' }} />
          </div>
        </div>
      </div>

      {/* yuqori-o'ng: kombo + ball */}
      <div className="absolute top-3 right-3 flex gap-2">
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: combo >= 5 ? '#9fe8ff' : '#f5c518' }}>×{combo}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#b79a6a' }}>KOMBO</div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#EAF3FF' }}>⭐ {Math.round(score)}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#b79a6a' }}>Ball</div>
        </div>
      </div>

      {/* pastki maslahat + tugma-nota moslik */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 330 }}>
        <div style={{ fontSize: 10.5, color: '#d8c39a', marginBottom: 6 }}>
          {status === 'won' ? '🎵 Mayoq yondi — signal uzatildi, omon qolganlar javob beryapti!'
            : !arduinoConnected ? 'Platani ulang — 4 tugma bilan notalarni chal, mayoqni jonlantir'
              : '🎯 Nota zarba halqasiga yetganda mos tugmani bos'}
        </div>
        {arduinoConnected && status === 'play' && (
          <div className="flex gap-2 justify-center">
            {NOTES.map((n, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 800, color: '#0a0a12', background: `#${n.col.toString(16).padStart(6, '0')}`, borderRadius: 6, padding: '3px 9px', fontFamily: 'Chakra Petch, monospace' }}>{i + 1}·{n.name}</span>
            ))}
          </div>
        )}
      </div>

      {/* ulanmagan */}
      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(245,197,24,0.35)' }}>
          <span style={{ fontSize: 12, color: '#f5c518' }}>🔌 Platani ulang — rezonans melodiyasini chal</span>
        </div>
      )}

      {/* g'alaba */}
      {status === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(20,14,32,0.5)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>🎇</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#9fe8ff', marginBottom: 4 }}>Mayoq yondi!</div>
            <div style={{ fontSize: 11, color: '#d8c39a', marginBottom: 14 }}>Signal uzatildi — hamma uyga qaytmoqda</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#14121a', background: '#9fe8ff', border: 'none', cursor: 'pointer', fontWeight: 800 }}>
              🔄 Qaytadan
            </button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
