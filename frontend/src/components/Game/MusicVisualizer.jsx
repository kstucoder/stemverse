// 🎚️ VOLTRA "Musiqa Vizualizatori" — FREKANS SOZLASH (synthwave signal-tuning).
// Digital Twin: potensiometr tovush chastotasini boshqaradi. Target chastota bandiga
// spektr cho'qqisini moslab, ushlab tur -> signal qulflanadi. 3 to'lqin -> g'alaba.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleVisualizer, visualizerTick } from './pixi/visualizerScene';
import useGameStore from '../../stores/gameStore';
import { startLiveTone, updateLiveTone, stopLiveTone, playScore, playWin, playClick } from './gameAudio';

const FMIN = 120, FMAX = 1200, WAVES = 3;
const NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteOf = (f) => NOTE[((Math.round(Math.log2(f / 440) * 12 + 69) % 12) + 12) % 12] || '?';

export default function MusicVisualizer() {
  const pot = useGameStore((s) => s.serialData.pot);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ wave: 0, curFreq: FMIN, targetFreq: 500, lock: 0, inBand: false });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ pot: 512, connected: false, mode: 'play', resetPulse: 0 });
  ctlRef.current.pot = arduinoConnected ? (pot ?? 512) : 512;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onNear = () => playClick();
  ctlRef.current.onLock = (wave) => { playScore(); incrementScore(100); useGameStore.getState().triggerShake?.(6); };
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 300); };

  useEffect(() => { startLiveTone(); return () => stopLiveTone(); }, []);
  useEffect(() => { resetRef.current += 1; winRef.current = false; setStatus('play'); }, [arduinoConnected]);
  const restart = () => { resetRef.current += 1; winRef.current = false; setStatus('play'); };

  const build = useCallback((app) => {
    const scene = assembleVisualizer(app);
    let t = 0, hudAcc = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
      visualizerTick(scene, dt, t, ctlRef.current);
      updateLiveTone(scene.curFreq, ctlRef.current.connected && !scene.won ? 0.07 : 0);
      hudAcc += dt; if (hudAcc > 0.08) { hudAcc = 0; setHud({ wave: scene.wave, curFreq: scene.curFreq, targetFreq: scene.targetFreq, lock: scene.lockProgress, inBand: scene.inBand }); }
    });
    return () => {};
  }, []);

  const panel = { background: 'rgba(10,6,26,0.82)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const bracket = { position: 'absolute', width: 26, height: 26, borderColor: 'rgba(255,45,149,0.55)', pointerEvents: 'none' };
  const diff = Math.abs(hud.curFreq - hud.targetFreq);
  const leds = Math.round(Math.max(0, 1 - diff / 300) * 4);

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* CRT ramka burchaklari */}
      <div style={{ ...bracket, top: 10, left: 10, borderLeft: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, top: 10, right: 10, borderRight: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, left: 10, borderLeft: '2px solid', borderBottom: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, right: 10, borderRight: '2px solid', borderBottom: '2px solid' }} />

      {/* yuqori panel: hozirgi nota/chastota */}
      <div className="absolute top-3 left-3" style={{ ...panel }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: hud.inBand ? '#39ff88' : '#00e5ff', lineHeight: 1 }}>{noteOf(hud.curFreq)} <span style={{ fontSize: 13, color: '#b48fd8' }}>{Math.round(hud.curFreq)}Hz</span></div>
        <div style={{ fontSize: 8, letterSpacing: '0.14em', color: '#8a6fb0', marginTop: 2 }}>POT → CHASTOTA</div>
      </div>

      {/* target */}
      <div className="absolute top-3 right-3" style={{ ...panel, textAlign: 'right' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#ffe45a', lineHeight: 1 }}>🎯 {noteOf(hud.targetFreq)} · {Math.round(hud.targetFreq)}Hz</div>
        <div style={{ fontSize: 8, letterSpacing: '0.14em', color: '#8a6fb0', marginTop: 3 }}>SIGNAL · TO'LQIN {Math.min(hud.wave + 1, WAVES)}/{WAVES}</div>
      </div>

      {/* to'lqin progress + LED strip */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 flex items-center gap-3" style={{ ...panel, padding: '5px 12px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 1, 2].map((i) => (<span key={i} style={{ fontSize: 14, color: i < hud.wave ? '#39ff88' : '#3a2a5a' }}>{i < hud.wave ? '◆' : '◇'}</span>))}
        </div>
        <div style={{ width: 96, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${Math.round(hud.lock * 100)}%`, height: '100%', background: hud.inBand ? '#39ff88' : '#00e5ff', transition: 'width 0.05s linear' }} />
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2, 3].map((i) => (<span key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i < leds ? (hud.inBand ? '#39ff88' : '#ffcf3a') : '#2a1c44' }} />))}
        </div>
      </div>

      {/* pastki ko'rsatma */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 360 }}>
        <div style={{ fontSize: 10.5, color: '#c9a9ef' }}>
          {status === 'won' ? '🏆 Barcha signallar sozlandi — vizualizator sinxron!'
            : !arduinoConnected ? 'Platani ulang — potensiometr bilan chastotani sozlang'
              : hud.inBand ? '🟢 MOS! Ushlab tur — signal qulflanmoqda...'
                : '🎚️ Potni burab spektr cho\'qqisini SARIQ target bandga moslang'}
        </div>
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(255,45,149,0.45)' }}>
          <span style={{ fontSize: 12, color: '#ff6ec7' }}>🔌 Platani ulang — potensiometrni burab signalni sozlang</span>
        </div>
      )}

      {status === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(8,2,20,0.55)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>🎛️</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#39ff88', marginBottom: 4 }}>Signal sozlandi!</div>
            <div style={{ fontSize: 11, color: '#c9a9ef', marginBottom: 14 }}>{WAVES} to'lqin muvaffaqiyatli qulflandi</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#0a0620', background: '#00e5ff', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
