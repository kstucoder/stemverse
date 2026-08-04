// 🛰️ VOLTRA "Ta'minot Doklash" — ROTARY ENKODER bilan aylanma tekislash.
// Digital Twin: enkoder = ulash kalitini buradi. Dokning aylanuvchi SLOTiga kalitni
// tekisla (YASHIL), tugma bilan MAHKAMLA -> doklanadi. 5 dok -> baza ta'minlandi.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleDock, dockTick, TOL, angleDiff } from './pixi/dockScene';
import useGameStore from '../../stores/gameStore';
import { playBlip, playSeal, playError, playWin } from './gameAudio';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrap = (a) => ((a % 360) + 360) % 360;

export default function DockingAssistant() {
  const enc = useGameStore((s) => s.serialData.enc);
  const btn = useGameStore((s) => s.serialData.btn);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ docked: 0, aligned: false, diff: 180 });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ enc: 0, btn: 0, connected: false, resetPulse: 0 });
  ctlRef.current.enc = arduinoConnected ? wrap(enc ?? 0) : 0;
  ctlRef.current.btn = arduinoConnected ? (btn ? 1 : 0) : 0;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onBeep = (near) => playBlip(700 + near * 900);
  ctlRef.current.onDock = () => { playSeal(); incrementScore(80); };
  ctlRef.current.onFail = () => playError();
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 120); };

  useEffect(() => { resetRef.current += 1; winRef.current = false; setStatus('play'); }, [arduinoConnected]);
  const restart = () => { resetRef.current += 1; winRef.current = false; setStatus('play'); };

  const build = useCallback((app) => {
    const scene = assembleDock(app);
    const sim = { collar: 0, target: 40, tSpeed: 24, tTimer: 3, docked: 0, lockPulse: 0, flash: 0, flashCol: 0xffffff, beepAcc: 0, lastBtn: 0, lastReset: 0 };
    let t = 0, hudAcc = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
      const c = ctlRef.current;
      if (c.resetPulse !== sim.lastReset) { sim.lastReset = c.resetPulse; Object.assign(sim, { collar: 0, target: 40, tSpeed: 24, tTimer: 3, docked: 0, lockPulse: 0, flash: 0, beepAcc: 0 }); }

      // kalit burchagi (enkoder) yoki demo aylanish
      sim.collar = c.connected ? c.enc : wrap(sim.collar + 30 * dt);
      // slot (target) aylanadi — chaqqonlik dok soniga qarab oshadi
      sim.tTimer -= dt; if (sim.tTimer <= 0) { sim.tTimer = 2 + Math.random() * 2.5; sim.tSpeed = (Math.random() < 0.5 ? -1 : 1) * (22 + sim.docked * 5 + Math.random() * 14); }
      sim.target = wrap(sim.target + sim.tSpeed * dt);

      const diff = angleDiff(sim.collar, sim.target);
      const aligned = diff < TOL;
      const active = c.connected && !winRef.current;

      if (active) {
        // tugma rising edge -> mahkamlash
        if (c.btn && !sim.lastBtn) {
          if (aligned) { sim.docked++; sim.lockPulse = 1; sim.flash = 0.5; sim.flashCol = 0x39e06a; sim.target = wrap(sim.target + 100 + Math.random() * 160); sim.tSpeed = (Math.random() < 0.5 ? -1 : 1) * (26 + sim.docked * 5); c.onDock?.(); if (sim.docked >= 5) c.onWin?.(); }
          else { sim.flash = 0.3; sim.flashCol = 0xff3b46; c.onFail?.(); }
        }
        // tekislash beep (yaqinlashsa tez, tuner kabi)
        sim.beepAcc += dt; const near = clamp(1 - diff / 90, 0, 1); const iv = aligned ? 0.14 : 0.6 - near * 0.4;
        if (sim.beepAcc > iv) { sim.beepAcc = 0; c.onBeep?.(near); }
      }
      sim.lastBtn = c.btn;
      sim.lockPulse = Math.max(0, sim.lockPulse - dt * 1.6);
      sim.flash = Math.max(0, sim.flash - dt * 2);

      dockTick(scene, dt, t, { collarAngle: sim.collar, targetAngle: sim.target, aligned, lockPulse: sim.lockPulse, docked: sim.docked, connected: c.connected, flash: sim.flash, flashCol: sim.flashCol });
      hudAcc += dt; if (hudAcc > 0.1) { hudAcc = 0; setHud({ docked: sim.docked, aligned, diff: Math.round(diff) }); }
    });
    return () => {};
  }, []);

  const panel = { background: 'rgba(8,14,24,0.82)', border: '1px solid rgba(0,234,255,0.25)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const zc = hud.aligned ? '#39e06a' : '#00c8e0';

  return (
    <PixiStage build={build} className="rounded-xl">
      <div className="absolute top-3 left-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: zc }}>{hud.aligned ? '✅ TEKIS' : `${hud.diff}°`}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a7a9a' }}>TEKISLASH</div>
      </div>
      <div className="absolute top-3 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#39e06a', textShadow: '0 0 10px rgba(57,224,106,0.6)' }}>{hud.docked}/5</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a7a9a' }}>DOKLANDI</div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 330 }}>
        <div style={{ fontSize: 11, color: zc, fontWeight: 700 }}>
          {status === 'won' ? '🛰️ Barcha ta\'minot doklandi — baza to\'la ta\'minlandi!'
            : !arduinoConnected ? 'Platani ulang — enkoder kalitni buradi' : hud.aligned ? '🟢 TEKIS! Tugmani bos — MAHKAMLA' : '🔄 Enkoderni burab kalitni SLOTga tekisla'}
        </div>
        {arduinoConnected && status === 'play' && (
          <div className="flex gap-2 justify-center mt-1.5">
            <span style={{ fontSize: 9, color: '#8fb4d8', background: 'rgba(8,14,24,0.7)', border: '1px solid rgba(0,234,255,0.2)', borderRadius: 6, padding: '3px 8px' }}>🔄 ENKODER → Burчак</span>
            <span style={{ fontSize: 9, color: '#8fb4d8', background: 'rgba(8,14,24,0.7)', border: '1px solid rgba(0,234,255,0.2)', borderRadius: 6, padding: '3px 8px' }}>TUGMA → Mahkamla</span>
          </div>
        )}
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(0,234,255,0.4)' }}>
          <span style={{ fontSize: 12, color: '#00eaff' }}>🔄 Platani ulang — enkoder bilan kalitni tekisla</span>
        </div>
      )}

      {status === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(4,8,16,0.55)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>🛰️</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#39e06a', marginBottom: 4 }}>Baza ta'minlandi!</div>
            <div style={{ fontSize: 11, color: '#8fb4d8', marginBottom: 14 }}>5 ta pod muvaffaqiyatli doklandi</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#04121f', background: '#39e06a', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
