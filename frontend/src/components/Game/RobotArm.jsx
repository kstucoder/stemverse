// 🦾 VOLTRA "Xavfli Yuk: Robot Qo'l" — servo robot qo'l (pick-and-place).
// Digital Twin: 2 potensiometr = 2 bo'g'im (POT1->burchak, POT2->cho'zilish),
// TUGMA -> griper. Xavfli idishni ushlab, qo'rg'oshin konteynerga joyla.
// 3 idish muhrlansa -> hudud xavfsiz (onWin). Faqat Arduino ulanganda ishlaydi.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleArm, armTick } from './pixi/robotArmScene';
import useGameStore from '../../stores/gameStore';
import { playServo, playGeiger, playClunk, playSeal, playWin, playError } from './gameAudio';

export default function RobotArm() {
  const pot = useGameStore((s) => s.serialData.pot);
  const pot2 = useGameStore((s) => s.serialData.pot2);
  const btn = useGameStore((s) => s.serialData.btn);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [sealed, setSealed] = useState(0);
  const [holding, setHolding] = useState(false);
  const [status, setStatus] = useState('play');
  const [distress, setDistress] = useState(true);   // operator yordam so'rayapti (boshlanishda)
  const winRef = useRef(false);
  const resetRef = useRef(0);
  const servoAcc = useRef(0);

  const ctlRef = useRef({ a0: 512, a1: 512, btn: 0, connected: false, mode: 'play', resetPulse: 0 });
  ctlRef.current.a0 = arduinoConnected ? (pot ?? 512) : 512;
  ctlRef.current.a1 = arduinoConnected ? (pot2 ?? 512) : 512;
  ctlRef.current.btn = arduinoConnected ? (btn ? 1 : 0) : 0;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onMove = () => { const now = performance.now(); if (now - servoAcc.current > 130) { servoAcc.current = now; playServo(); } };
  ctlRef.current.onGrab = () => { playClunk(); setHolding(true); };
  ctlRef.current.onDrop = () => { playError(); setHolding(false); };
  ctlRef.current.onGeiger = () => playGeiger();
  ctlRef.current.onSeal = (n) => { playSeal(); incrementScore(120); setSealed(n); setHolding(false); };
  ctlRef.current.onWin = () => {
    if (winRef.current) return; winRef.current = true; setStatus('won'); playWin();
    const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 100);
  };

  useEffect(() => {
    resetRef.current += 1; winRef.current = false;
    setSealed(0); setHolding(false); setStatus('play');
    if (arduinoConnected) {
      setDistress(true);
      const id = setTimeout(() => setDistress(false), 8500);
      return () => clearTimeout(id);
    }
  }, [arduinoConnected]);

  const restart = () => { resetRef.current += 1; winRef.current = false; setSealed(0); setHolding(false); setStatus('play'); };

  const build = useCallback((app) => {
    const scene = assembleArm(app);
    let t = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; armTick(scene, dt, t, ctlRef.current); });
    return () => {};
  }, []);

  const panel = { background: 'rgba(10,14,20,0.82)', border: '1px solid rgba(0,234,255,0.2)', borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const baseDeg = Math.round(((ctlRef.current.a0) / 1023) * 180);
  const elbowDeg = Math.round(((ctlRef.current.a1) / 1023) * 180);

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* yuqori-chap: burchak + cho'zilish */}
      <div className="absolute top-3 left-3 flex gap-2">
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#00eaff', textShadow: '0 0 10px rgba(0,234,255,0.6)' }}>{baseDeg}°</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a7a8a' }}>ASOS SERVO</div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#6affe0', textShadow: '0 0 10px rgba(57,255,208,0.6)' }}>{elbowDeg}°</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a7a8a' }}>TIRSAK SERVO</div>
        </div>
      </div>

      {/* yuqori-o'ng: griper + muhrlangan */}
      <div className="absolute top-3 right-3 flex gap-2">
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: holding ? '#6bff8a' : '#5a7a8a' }}>{holding ? '✊ USHLADI' : '✋ OCHIQ'}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a7a8a' }}>GRIPER</div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#39ff88', textShadow: '0 0 10px rgba(57,255,136,0.6)' }}>{sealed}/3</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a7a8a' }}>MUHRLANDI</div>
        </div>
      </div>

      {/* pastki maslahat */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 340 }}>
        <div style={{ fontSize: 10.5, color: '#8fc5dc' }}>
          {status === 'won' ? '🦾 Barcha xavfli idish muhrlandi — hudud xavfsiz!'
            : !arduinoConnected ? 'Platani ulang — 2 potensiometr bilan robot qo\'lni boshqar'
              : holding ? '📦 Endi qo\'rg\'oshin konteyner ustiga olib borib, tugma bilan QO\'YIB YUBOR'
                : '🎯 Griperni idish ustiga aniq keltirib, tugma bilan USHLA'}
        </div>
      </div>

      {/* boshqaruv eslatmasi */}
      {arduinoConnected && status === 'play' && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
          {['POT1 → Asos servo', 'POT2 → Tirsak servo', 'TUGMA → Griper'].map((s) => (
            <span key={s} style={{ fontSize: 9, color: '#8fc5dc', background: 'rgba(10,14,20,0.7)', border: '1px solid rgba(0,234,255,0.15)', borderRadius: 7, padding: '4px 9px', fontFamily: 'Chakra Petch, monospace' }}>{s}</span>
          ))}
        </div>
      )}

      {/* ulanmagan */}
      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(0,234,255,0.3)' }}>
          <span style={{ fontSize: 11, color: '#00eaff' }}>🔌 Platani ulang — servo robot qo'lni boshqar</span>
        </div>
      )}

      {/* operator yordam so'rayapti — boshqaruv tizimi buzilgan */}
      {arduinoConnected && status === 'play' && distress && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse pointer-events-none" style={{ ...panel, maxWidth: 460, border: '1px solid rgba(255,90,74,0.45)', background: 'rgba(30,12,12,0.85)' }}>
          <div style={{ fontSize: 11, color: '#ff8a6a', fontWeight: 700, textAlign: 'center' }}>📡 SIGNAL: Operatorning boshqaruv tizimi shikastlangan!</div>
          <div style={{ fontSize: 10, color: '#e7b4a4', textAlign: 'center', marginTop: 2 }}>U sizdan yordam so'rayapti — robot qo'lni endi SIZ boshqaring, muhandis.</div>
        </div>
      )}

      {/* g'alaba overlay */}
      {status === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(6,10,14,0.55)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>🦾</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#39ff88', marginBottom: 4 }}>Hudud xavfsiz!</div>
            <div style={{ fontSize: 11, color: '#8fc5dc', marginBottom: 14 }}>3 xavfli idish muhrlandi</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#06120f', background: '#39ff88', border: 'none', cursor: 'pointer', fontWeight: 800 }}>
              🔄 Qaytadan
            </button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
