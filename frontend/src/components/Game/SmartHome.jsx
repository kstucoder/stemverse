// 🔴 VOLTRA "Reaktor Ishga Tushirish Kodi" — 4x4 KEYPAD (yangi element) — FINAL BOSS.
// Ekranda ishga tushirish KODI ko'rsatiladi — keypad'da to'g'ri raqamlarni ketma-ket kirit.
// Har bosqich reaktorni jonlantiradi; noto'g'ri raqam kodni qaytaradi. 5 bosqich -> reaktor yonadi.
import { useCallback, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleReactor, reactorTick } from './pixi/reactorScene';
import useGameStore from '../../stores/gameStore';
import { playScore, playWin, playError, playClick } from './gameAudio';

const STAGES = 5;

export default function SmartHome() {
  const key = useGameStore((s) => s.serialData.key);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ stage: 0, code: [], cursor: 0, err: 0 });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ key: 'NONE', connected: false, mode: 'play', resetPulse: 0 });
  ctlRef.current.key = arduinoConnected ? (key ?? 'NONE') : 'NONE';
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onDigit = () => { playClick(); };
  ctlRef.current.onStage = () => { playScore(); incrementScore(100); useGameStore.getState().triggerShake?.(7); };
  ctlRef.current.onError = () => { playError(); useGameStore.getState().triggerShake?.(10); };
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); useGameStore.getState().triggerShake?.(18); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 500); };

  const build = useCallback((app) => {
    const scene = assembleReactor(app);
    let t = 0, acc = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; reactorTick(scene, dt, t, ctlRef.current); acc += dt; if (acc > 0.06) { acc = 0; setHud({ stage: scene.stage, code: scene.code.slice(), cursor: scene.cursor, err: scene.errT }); } });
    return () => {};
  }, []);

  const restart = () => { resetRef.current += 1; winRef.current = false; setStatus('play'); };
  const panel = { background: 'rgba(10,8,10,0.85)', border: '1px solid rgba(57,255,136,0.28)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const bracket = { position: 'absolute', width: 26, height: 26, borderColor: 'rgba(57,255,136,0.5)', pointerEvents: 'none' };

  return (
    <PixiStage build={build} className="rounded-xl">
      <div style={{ ...bracket, top: 10, left: 10, borderLeft: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, top: 10, right: 10, borderRight: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, left: 10, borderLeft: '2px solid', borderBottom: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, right: 10, borderRight: '2px solid', borderBottom: '2px solid' }} />

      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 10, color: '#8fffc0', letterSpacing: '0.14em' }}>
        <span className="animate-pulse" style={{ color: '#ffd23a' }}>★ FINAL</span>
        <span>REACTOR-IGNITION 20</span>
        <span style={{ color: arduinoConnected ? '#39ff88' : '#8a8a8a' }}>{arduinoConnected ? 'KEYPAD: ARMED' : 'KEYPAD: OFFLINE'}</span>
      </div>

      <div className="absolute top-10 left-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#6bffb0' }}>{hud.stage}/{STAGES}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a70' }}>IGNITION BOSQICH</div>
      </div>
      <div className="absolute top-10 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.3em', color: hud.err > 0 ? '#ff5a3a' : '#ffd23a' }}>
          {hud.code.map((d, i) => <span key={i} style={{ color: i < hud.cursor ? '#39ff88' : (hud.err > 0 ? '#ff5a3a' : '#ffd23a') }}>{d}</span>)}
        </div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a70' }}>KOD — KEYPAD'DA TER</div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 400 }}>
        <div style={{ fontSize: 10.5, color: '#a9f0cc' }}>
          {status === 'won' ? '🔴 REAKTOR ISHGA TUSHDI — BAZA TO\'LIQ JONLANDI!'
            : !arduinoConnected ? 'Platani ulang — 4x4 keypad bilan ignition kodini kirit'
              : hud.err > 0 ? '❌ Noto\'g\'ri raqam — kod qaytadan! Diqqat bilan ter'
                : '⌨️ Yuqoridagi KODni keypad\'da ketma-ket ter — reaktorni pog\'ona-pog\'ona yoq'}
        </div>
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(57,255,136,0.4)' }}>
          <span style={{ fontSize: 12, color: '#39ff88' }}>🔌 Platani ulang — 4x4 membrana keypad bilan reaktorni yoq</span>
        </div>
      )}

      {status === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(3,6,5,0.62)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '26px 34px', border: '1px solid rgba(255,210,58,0.4)' }}>
            <div style={{ fontSize: 42, marginBottom: 6 }}>🏆</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#ffd23a', marginBottom: 4 }}>REAKTOR YONDI!</div>
            <div style={{ fontSize: 12, color: '#a9f0cc', marginBottom: 4 }}>Baza to'liq jonlandi — missiya yakunlandi.</div>
            <div style={{ fontSize: 10, color: '#7ac0a0', marginBottom: 14 }}>Bosh Muhandis darajasiga yetding, qo'mondon! 👑</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#0a1408', background: '#6bffb0', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
