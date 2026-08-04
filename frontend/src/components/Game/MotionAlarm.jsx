// 🛡️ VOLTRA "Xavfsizlik Tizimi" — PIR HARAKAT SENSORI (night-vision perimetr).
// Digital Twin: PIR sensori harakatni sezadi. Aniqlash zonasida skavenjer dron
// bo'lganda qo'lni sensor ustida silt (PIR HIGH) -> projektor+signal -> dron qaytariladi.
// Bo'sh zonada silt -> soxta signal. Dron darvozaga yetsa -> buzilish. 10 dron -> perimetr xavfsiz.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleSecurity, securityTick } from './pixi/securityScene';
import useGameStore from '../../stores/gameStore';
import { playAlarm, playScore, playZap, playError, playCrash, playWin, playHollow } from './gameAudio';

export default function MotionAlarm() {
  const pir = useGameStore((s) => s.serialData.pir);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ caught: 0, security: 4 });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), loseRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ pir: 0, connected: false, mode: 'play', resetPulse: 0 });
  ctlRef.current.pir = arduinoConnected ? (pir ? 1 : 0) : 0;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onTrigger = () => playAlarm();
  ctlRef.current.onCatch = () => { playScore(); playZap(); incrementScore(20); };
  ctlRef.current.onFalse = () => playError();
  ctlRef.current.onBreach = () => { playCrash(); useGameStore.getState().triggerShake(14); };
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 150); };
  ctlRef.current.onLose = () => { if (loseRef.current) return; loseRef.current = true; setStatus('lost'); playHollow(); };

  useEffect(() => { resetRef.current += 1; winRef.current = false; loseRef.current = false; setStatus('play'); }, [arduinoConnected]);
  const restart = () => { resetRef.current += 1; winRef.current = false; loseRef.current = false; setStatus('play'); };

  const build = useCallback((app) => {
    const scene = assembleSecurity(app);
    let t = 0, hudAcc = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; securityTick(scene, dt, t, ctlRef.current); hudAcc += dt; if (hudAcc > 0.1) { hudAcc = 0; setHud({ caught: scene.caught, security: scene.security }); } });
    return () => {};
  }, []);

  const panel = { background: 'rgba(4,14,10,0.82)', border: '1px solid rgba(57,224,106,0.28)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const bracket = { position: 'absolute', width: 26, height: 26, borderColor: 'rgba(57,224,106,0.5)', pointerEvents: 'none' };

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* night-vision kamera ramkasi */}
      <div style={{ ...bracket, top: 10, left: 10, borderLeft: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, top: 10, right: 10, borderRight: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, left: 10, borderLeft: '2px solid', borderBottom: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, right: 10, borderRight: '2px solid', borderBottom: '2px solid' }} />

      {/* REC + status */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 10, color: '#6bffa0', letterSpacing: '0.14em' }}>
        <span className="animate-pulse" style={{ color: '#ff3b46' }}>● REC</span>
        <span>PERIMETR-CAM 04</span>
        <span style={{ color: arduinoConnected ? '#39e06a' : '#8a8a8a' }}>{arduinoConnected ? 'PIR: ARMED' : 'PIR: OFFLINE'}</span>
      </div>

      <div className="absolute top-10 left-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#39ff88' }}>{hud.caught}/10</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a70' }}>QAYTARILDI</div>
      </div>
      <div className="absolute top-10 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 15 }}>{'🛡️'.repeat(hud.security)}{'▫️'.repeat(Math.max(0, 4 - hud.security))}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a70' }}>PERIMETR</div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 340 }}>
        <div style={{ fontSize: 10.5, color: '#8fdcae' }}>
          {status === 'won' ? '🛡️ Barcha dron qaytarildi — perimetr xavfsiz!'
            : status === 'lost' ? '🚨 Perimetr buzildi — qaytadan urin!'
              : !arduinoConnected ? 'Platani ulang — PIR sensori harakatni sezadi'
                : '🎯 Dron YASHIL zonaga kirganda qo\'lni PIR ustida SILT — signal ber'}
        </div>
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(57,224,106,0.4)' }}>
          <span style={{ fontSize: 12, color: '#39e06a' }}>🔌 Platani ulang — PIR harakat sensori bilan perimetrni qo'riqla</span>
        </div>
      )}

      {(status === 'won' || status === 'lost') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(2,10,6,0.55)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>{status === 'won' ? '🛡️' : '🚨'}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: status === 'won' ? '#39ff88' : '#ff7a6a', marginBottom: 4 }}>{status === 'won' ? 'Perimetr xavfsiz!' : 'Perimetr buzildi'}</div>
            <div style={{ fontSize: 11, color: '#8fdcae', marginBottom: 14 }}>{hud.caught} dron qaytarildi</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#04120c', background: '#39e06a', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
