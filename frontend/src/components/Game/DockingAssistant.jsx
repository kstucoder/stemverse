// 🛰️ VOLTRA "Ta'minot Doklash" — ultrasonik masofa bilan aniq doklash.
// Digital Twin: HC-SR04 masofa = pod ↔ dok oralig'i. Podni YASHIL zonaga keltirib
// bir lahza ushlab tur -> doklanadi. Juda yaqin -> to'qnashuv. 5 dok -> g'alaba.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleDock, dockTick, GAP_MAX } from './pixi/dockScene';
import useGameStore from '../../stores/gameStore';
import { playBlip, playSeal, playCrash, playWin } from './gameAudio';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const zoneOf = (d) => d > 45 ? 'far' : d > 17 ? 'slow' : d >= 7 ? 'sweet' : d >= 4 ? 'danger' : 'crash';

export default function DockingAssistant() {
  const serialDist = useGameStore((s) => s.serialData.dist);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ dist: 80, zone: 'far', docked: 0 });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ dist: 80, connected: false, resetPulse: 0 });
  ctlRef.current.dist = arduinoConnected ? clamp(serialDist ?? 80, 0, 200) : 80;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onBeep = (z) => playBlip(z === 'danger' ? 1600 : z === 'sweet' ? 1100 : 760);
  ctlRef.current.onDock = () => { playSeal(); incrementScore(80); };
  ctlRef.current.onCrash = () => { playCrash(); useGameStore.getState().triggerShake(14); };
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 120); };

  useEffect(() => { resetRef.current += 1; winRef.current = false; setStatus('play'); }, [arduinoConnected]);
  const restart = () => { resetRef.current += 1; winRef.current = false; setStatus('play'); };

  const build = useCallback((app) => {
    const scene = assembleDock(app);
    const sim = { dist: 80, gap: GAP_MAX, docked: 0, holdT: 0, armed: true, flash: 0, flashCol: 0xffffff, beepAcc: 0, lastReset: 0 };
    let t = 0, hudAcc = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
      const c = ctlRef.current;
      if (c.resetPulse !== sim.lastReset) { sim.lastReset = c.resetPulse; Object.assign(sim, { dist: 80, gap: GAP_MAX, docked: 0, holdT: 0, armed: true, flash: 0, beepAcc: 0 }); }

      const targetDist = c.connected ? c.dist : 80;
      sim.dist = lerp(sim.dist, targetDist, Math.min(dt * 8, 1));
      const d = sim.dist;
      const gap = clamp((d - 4) / 76, 0, 1) * GAP_MAX;
      sim.gap = lerp(sim.gap, gap, Math.min(dt * 10, 1));
      let zone = c.connected ? zoneOf(d) : 'idle';

      if (c.connected && !winRef.current) {
        if (zone === 'sweet' && sim.armed) { sim.holdT += dt; if (sim.holdT >= 1.0) { sim.docked++; sim.armed = false; sim.holdT = 0; sim.flash = 0.6; sim.flashCol = 0x39e06a; c.onDock?.(); if (sim.docked >= 5) c.onWin?.(); } }
        else if (zone !== 'sweet') sim.holdT = Math.max(0, sim.holdT - dt * 1.5);
        if (zone === 'crash' && sim.armed) { sim.flash = 0.7; sim.flashCol = 0xff3b46; sim.holdT = 0; sim.beepAcc += dt; if (sim.beepAcc > 0.4) { sim.beepAcc = 0; c.onCrash?.(); } }
        else if (!sim.armed && d > 45) sim.armed = true;
        if (['slow', 'sweet', 'danger'].includes(zone)) { sim.beepAcc += dt; const iv = zone === 'danger' ? 0.1 : zone === 'sweet' ? 0.2 : clamp(d / 90, 0.25, 0.55); if (sim.beepAcc > iv) { sim.beepAcc = 0; c.onBeep?.(zone); } }
      }
      sim.flash = Math.max(0, sim.flash - dt * 2);

      dockTick(scene, dt, t, { gap: sim.gap, zone, holdFrac: sim.holdT, docked: sim.armed ? undefined : sim.docked, connected: c.connected, flash: sim.flash, flashCol: sim.flashCol });
      hudAcc += dt; if (hudAcc > 0.1) { hudAcc = 0; setHud({ dist: Math.round(sim.dist), zone, docked: sim.docked }); }
    });
    return () => {};
  }, []);

  const panel = { background: 'rgba(8,14,24,0.82)', border: '1px solid rgba(43,108,192,0.28)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const zc = hud.zone === 'sweet' ? '#39e06a' : hud.zone === 'slow' ? '#ffc21a' : (hud.zone === 'danger' || hud.zone === 'crash') ? '#ff3b46' : '#7fa8d8';
  const zt = hud.zone === 'sweet' ? '✅ TO\'XTA — doklanmoqda' : hud.zone === 'slow' ? '🟡 Sekin yaqinlash' : hud.zone === 'danger' ? '🔴 Juda yaqin!' : hud.zone === 'crash' ? '💥 To\'qnashuv!' : '➡️ Yaqinlash';
  const prox = clamp(1 - (hud.dist - 4) / 76, 0, 1);

  return (
    <PixiStage build={build} className="rounded-xl">
      <div className="absolute top-3 left-3 flex gap-2">
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: zc, textShadow: `0 0 10px ${zc}70` }}>{hud.dist}<span style={{ fontSize: 10 }}>sm</span></div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a7a9a' }}>MASOFA</div>
        </div>
      </div>
      <div className="absolute top-3 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#39e06a', textShadow: '0 0 10px rgba(57,224,106,0.6)' }}>{hud.docked}/5</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a7a9a' }}>DOKLANDI</div>
      </div>

      {/* yaqinlik bari */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2" style={{ ...panel, width: 240 }}>
        <div style={{ height: 9, borderRadius: 5, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round(prox * 100)}%`, background: zc, transition: 'width 0.1s', boxShadow: `0 0 8px ${zc}` }} />
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 320 }}>
        <div style={{ fontSize: 11, color: zc, fontWeight: 700 }}>
          {status === 'won' ? '🛰️ Barcha ta\'minot doklandi — baza to\'la ta\'minlandi!'
            : !arduinoConnected ? 'Platani ulang — ultrasonik sensor pod masofasini beradi' : zt}
        </div>
        {arduinoConnected && status === 'play' && (
          <div style={{ fontSize: 9, color: '#8fb4d8', marginTop: 4 }}>Qo'lni sensorga yaqinlashtir/uzoqlashtir → podni YASHIL zonada 1s ushla</div>
        )}
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(43,108,192,0.4)' }}>
          <span style={{ fontSize: 12, color: '#2b6cc0' }}>📡 Platani ulang — ta'minot podini dokla</span>
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
