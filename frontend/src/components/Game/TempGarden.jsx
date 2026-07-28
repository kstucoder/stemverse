// 🌱 VOLTRA "Harorat Bog'i" (PixiJS Premium Edition)
// Digital Twin: TEMP sensori. 20–30°C = mukammal zona — o'simliklar gullaydi.
// Shu zonada 30 soniya ushlab tur — bog' to'liq jonlanadi (komponent onWin).
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleGarden, gardenTick } from './pixi/gardenScene';
import useGameStore from '../../stores/gameStore';
import { playLevelUp, playError } from './gameAudio';

const GOAL = 30;

export default function TempGarden() {
  const serialTemp = useGameStore((s) => s.serialData.temp);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ temp: 12, grow: 0 });
  const tempRef = useRef(12);
  const connRef = useRef(false);
  const growRef = useRef(0);
  const winRef = useRef(false);
  const prevZone = useRef(null);
  const hudAcc = useRef(0);
  const ctlRef = useRef({ temp: 12, zone: 'cold', growth: 0, connected: false });

  tempRef.current = arduinoConnected ? (serialTemp ?? 25) : 12;
  connRef.current = arduinoConnected;

  useEffect(() => {
    let raf, last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const temp = tempRef.current; const conn = connRef.current;
      const zone = temp < 20 ? 'cold' : temp > 30 ? 'hot' : 'perfect';
      if (conn) {
        if (prevZone.current && zone !== prevZone.current) {
          if (zone === 'perfect') playLevelUp(); else if (prevZone.current === 'perfect') playError();
        }
        prevZone.current = zone;
        if (zone === 'perfect') growRef.current = Math.min(GOAL, growRef.current + dt);
        else growRef.current = Math.max(0, growRef.current - dt * 0.5);
        if (growRef.current >= GOAL && !winRef.current) {
          winRef.current = true;
          incrementScore(175);
          const st = useGameStore.getState();
          if (st.onWin) st.onWin(st.score + 175);
        }
      }
      ctlRef.current = { temp, zone, growth: growRef.current / GOAL, connected: conn };
      hudAcc.current += dt;
      if (hudAcc.current > 0.15) { hudAcc.current = 0; setHud({ temp: Math.round(temp), grow: growRef.current }); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [incrementScore]);

  const build = useCallback((app) => {
    const scene = assembleGarden(app);
    let t = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; scene.particles.tick(dt); gardenTick(scene, dt, t, ctlRef.current); });
    return () => {};
  }, []);

  const zone = hud.temp < 20 ? 'cold' : hud.temp > 30 ? 'hot' : 'perfect';
  const zoneColor = zone === 'perfect' ? '#39e06a' : zone === 'hot' ? '#ff3b46' : '#3b82ff';
  const panel = { background: 'rgba(11,17,32,0.82)', border: '1px solid rgba(57,224,106,0.2)', borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };

  return (
    <PixiStage build={build} className="rounded-xl">
      <div className="absolute top-3 left-3 flex gap-2">
        <div style={panel}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF' }}>⭐ {Math.round(score)}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>Ball</div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: zoneColor, textShadow: `0 0 10px ${zoneColor}70` }}>{hud.temp}°C</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>{zone === 'perfect' ? "MUKAMMAL" : zone === 'hot' ? 'JAZIRAMA' : 'SOVUQ'}</div>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, minWidth: 250, textAlign: 'center' }}>
        <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 5 }}>
          <div style={{ height: '100%', width: `${(hud.grow / GOAL) * 100}%`, background: 'linear-gradient(90deg,#39e06a,#ffd166)', boxShadow: '0 0 8px rgba(57,224,106,0.6)' }} />
        </div>
        <div style={{ fontSize: 10, color: zone === 'perfect' ? '#39e06a' : '#94a3b8' }}>
          {!arduinoConnected ? 'Platani ulang — TEMP sensori haroratni beradi'
            : zone === 'perfect' ? `🌸 Zo'r! Haroratni ushlab tur: ${Math.round(hud.grow)}/${GOAL}s`
              : '🎯 Haroratni 20–30°C oralig\'iga keltir'}
        </div>
      </div>

      {!arduinoConnected && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(57,224,106,0.3)' }}>
          <span style={{ fontSize: 11, color: '#39e06a' }}>🌱 Platani ulang — harorat sensori bilan bog'ni gullat</span>
        </div>
      )}
    </PixiStage>
  );
}
