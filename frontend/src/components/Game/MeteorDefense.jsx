// ☄️ VOLTRA "Meteor Qalqoni" — POT nishonlaydi, TUGMA otadi (asteroid sagasi yakuni).
// Digital Twin: POT = zenit to'pi burchagi, TUGMA = energiya zaryadi. Tushayotgan
// meteorlarni bazaga yetmasdan yo'q qil. Meteor tegsa qalqon -1. Progress to'lsa g'alaba.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleMeteorDefense, meteorTick } from './pixi/meteorDefenseScene';
import useGameStore from '../../stores/gameStore';
import { playZap, playScore, playCrash, playWin, playHollow } from './gameAudio';

export default function MeteorDefense() {
  const jx = useGameStore((s) => s.serialData.jx);
  const jy = useGameStore((s) => s.serialData.jy);
  const btn = useGameStore((s) => s.serialData.btn);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ shield: 5, progress: 0 });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), loseRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ aimAngle: 0, btn: 0, connected: false, mode: 'play', resetPulse: 0 });
  // joystik -> to'liq 360° nishon burchagi (markazdan chetlanish yo'nalishi; deadzone)
  {
    const dx = (arduinoConnected ? (jx ?? 512) : 512) - 512;
    const dy = (arduinoConnected ? (jy ?? 512) : 512) - 512;
    if (Math.hypot(dx, dy) > 60) ctlRef.current.aimAngle = Math.atan2(dy, dx) * 180 / Math.PI;
  }
  ctlRef.current.btn = arduinoConnected ? (btn ? 1 : 0) : 0;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onFire = () => playZap();
  ctlRef.current.onDestroy = () => { playScore(); incrementScore(15); };
  ctlRef.current.onHit = () => { playCrash(); useGameStore.getState().triggerShake(16); };
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 150); };
  ctlRef.current.onLose = () => { if (loseRef.current) return; loseRef.current = true; setStatus('lost'); playHollow(); };

  useEffect(() => { resetRef.current += 1; winRef.current = false; loseRef.current = false; setStatus('play'); }, [arduinoConnected]);
  const restart = () => { resetRef.current += 1; winRef.current = false; loseRef.current = false; setStatus('play'); };

  const build = useCallback((app) => {
    const scene = assembleMeteorDefense(app);
    let t = 0, hudAcc = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
      meteorTick(scene, dt, t, ctlRef.current);
      hudAcc += dt; if (hudAcc > 0.1) { hudAcc = 0; setHud({ shield: scene.shield, progress: scene.progress }); }
    });
    return () => {};
  }, []);

  const panel = { background: 'rgba(6,10,20,0.82)', border: '1px solid rgba(57,255,208,0.25)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };

  return (
    <PixiStage build={build} className="rounded-xl">
      <div className="absolute top-3 left-3 flex gap-2">
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 15 }}>{'🛡️'.repeat(hud.shield)}{'▫️'.repeat(Math.max(0, 5 - hud.shield))}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a80' }}>BAZA QALQONI</div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#EAF3FF' }}>⭐ {Math.round(score)}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a80' }}>Ball</div>
        </div>
      </div>

      <div className="absolute top-3 right-3" style={{ ...panel, width: 150 }}>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a80', marginBottom: 3 }}>HIMOYA · {Math.round((hud.progress / 500) * 100)}%</div>
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round((hud.progress / 500) * 100)}%`, background: 'linear-gradient(90deg,#39ffd0,#6affe0)', transition: 'width 0.15s', boxShadow: '0 0 8px rgba(57,255,208,0.6)' }} />
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 320 }}>
        <div style={{ fontSize: 11, color: '#8fdccb' }}>
          {status === 'won' ? '☄️ Meteor to\'dasi qaytarildi — baza saqlab qolindi!'
            : status === 'lost' ? '💥 Baza qalqoni yo\'q bo\'ldi — qaytadan urin!'
              : !arduinoConnected ? 'Platani ulang — JOYSTIK nishonlaydi, TUGMA otadi'
                : '🎯 Joystikni meteor tomon yo\'nalt, tugma bilan ot'}
        </div>
        {arduinoConnected && status === 'play' && (
          <div className="flex gap-2 justify-center mt-1.5">
            <span style={{ fontSize: 9, color: '#8fdccb', background: 'rgba(6,10,20,0.7)', border: '1px solid rgba(57,255,208,0.2)', borderRadius: 6, padding: '3px 8px' }}>🕹️ JOYSTIK → Nishon</span>
            <span style={{ fontSize: 9, color: '#8fdccb', background: 'rgba(6,10,20,0.7)', border: '1px solid rgba(57,255,208,0.2)', borderRadius: 6, padding: '3px 8px' }}>TUGMA → Ot ⚡</span>
          </div>
        )}
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(57,255,208,0.4)' }}>
          <span style={{ fontSize: 12, color: '#39ffd0' }}>📡 Platani ulang — meteorlardan bazani himoya qil</span>
        </div>
      )}

      {(status === 'won' || status === 'lost') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(4,8,14,0.55)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>{status === 'won' ? '🛡️' : '💥'}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: status === 'won' ? '#39ffd0' : '#ff7a6a', marginBottom: 4 }}>{status === 'won' ? 'Baza saqlab qolindi!' : 'Baza vayron bo\'ldi'}</div>
            <div style={{ fontSize: 11, color: '#8fdccb', marginBottom: 14 }}>Himoya: {Math.round((hud.progress / 500) * 100)}%</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#04120f', background: '#39ffd0', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
