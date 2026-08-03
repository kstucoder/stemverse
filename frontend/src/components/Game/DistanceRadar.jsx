// 🛡️ VOLTRA "Osmon Qalqoni" — Qo'l bilan boshqariladigan energiya qalqoni.
// Digital Twin: ultrasonik sensor (DIST) = qalqon plitasi balandligi.
// Qo'lni ko'tar-tushir -> plita tik relsda suriladi -> kelayotgan meteorni
// to'g'ri balandlikda kutib olib QAYTAR. O'tib ketsa mahalla qorayadi, yurak −1.
// 12 meteor qaytarilsa -> shahar himoyalandi (onWin).
import { useCallback, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleShield, shieldTick, CAL_NEAR, CAL_FAR } from './pixi/shieldScene';
import useGameStore from '../../stores/gameStore';
import { playZap, playScore, playWin, playError, playBoom, playAlarm } from './gameAudio';

export default function DistanceRadar() {
  const serialDist = useGameStore((s) => s.serialData.dist);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [blocked, setBlocked] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [status, setStatus] = useState('play'); // 'play' | 'won' | 'lost'
  const winRef = useRef(false);
  const resetRef = useRef(0);

  // qo'l masofasi (sm). Ulanmasa demo rejim (avto-boshqaruv).
  const dist = arduinoConnected ? Math.max(0, Math.min(400, Math.round(serialDist ?? 30))) : 30;

  const ctlRef = useRef({ dist: 30, connected: false, demo: true, mode: 'play', resetPulse: 0 });
  ctlRef.current.dist = dist;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.demo = !arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onBlock = (n) => { incrementScore(60); setBlocked(n); playZap(); playScore(); };
  ctlRef.current.onWarn = () => { playAlarm(); };
  ctlRef.current.onMiss = (hp) => { setHearts(hp); playBoom(); useGameStore.getState().triggerShake(14); };
  ctlRef.current.onWin = () => {
    if (winRef.current) return; winRef.current = true; setStatus('won'); playWin();
    const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 100);
  };
  ctlRef.current.onLose = () => { setStatus('lost'); playError(); };

  const restart = () => {
    resetRef.current += 1; winRef.current = false;
    setBlocked(0); setHearts(3); setStatus('play');
  };

  const build = useCallback((app) => {
    const scene = assembleShield(app);
    let t = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; shieldTick(scene, dt, t, ctlRef.current); });
    return () => {};
  }, []);

  const panel = { background: 'rgba(6,18,20,0.82)', border: '1px solid rgba(57,255,208,0.2)', borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const inBand = dist >= CAL_NEAR && dist <= CAL_FAR;

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* yuqori-chap: ball + masofa */}
      <div className="absolute top-3 left-3 flex gap-2">
        <div style={panel}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF' }}>⭐ {Math.round(score)}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5a8a80' }}>Ball</div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: inBand ? '#6affe0' : '#ffca3a', textShadow: '0 0 10px rgba(57,255,208,0.6)' }}>{dist}<span style={{ fontSize: 10 }}>sm</span></div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a80' }}>MASOFA</div>
        </div>
      </div>

      {/* yuqori-o'ng: qaytarilgan + yuraklar */}
      <div className="absolute top-3 right-3 flex gap-2">
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#39e06a', textShadow: '0 0 10px rgba(57,224,106,0.6)' }}>{blocked}/12</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a80' }}>QAYTARILDI</div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 15 }}>{'❤️'.repeat(hearts)}{'🖤'.repeat(Math.max(0, 3 - hearts))}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a80' }}>SHAHAR</div>
        </div>
      </div>

      {/* pastki maslahat */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 320 }}>
        <div style={{ fontSize: 10.5, color: '#8fdccb' }}>
          {status === 'won' ? '🛡️ Shahar himoyalandi — barcha meteor qaytarildi!'
            : status === 'lost' ? '💥 Shahar himoyasi tugadi — qaytadan urin!'
              : !arduinoConnected ? 'Platani ulang — qo\'lni ko\'tar-tushir, qalqonni boshqar'
                : '🎯 Qalqonni meteor balandligiga surib, uni QAYTAR'}
        </div>
      </div>

      {/* ulanmagan ogohlantirish */}
      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(57,255,208,0.3)' }}>
          <span style={{ fontSize: 11, color: '#6affe0' }}>📡 Platani ulang — ultrasonik sensor bilan qalqonni ko'tar-tushir</span>
        </div>
      )}

      {/* g'alaba / mag'lubiyat overlay */}
      {status !== 'play' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(2,9,12,0.55)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>{status === 'won' ? '🛡️' : '💥'}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: status === 'won' ? '#39ffd0' : '#ff7a6a', marginBottom: 4 }}>
              {status === 'won' ? 'Shahar himoyalandi!' : 'Shahar vayron bo\'ldi'}
            </div>
            <div style={{ fontSize: 11, color: '#8fdccb', marginBottom: 14 }}>{blocked} meteor qaytarildi</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#02120f', background: '#39ffd0', border: 'none', cursor: 'pointer', fontWeight: 800 }}>
              🔄 Qaytadan
            </button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
