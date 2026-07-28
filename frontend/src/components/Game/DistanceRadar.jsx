// 📡 VOLTRA "Osmon Qalqoni" (PixiJS Premium Edition)
// Digital Twin: ultrasonik sensor (DIST 0-400sm) = radar masofa kursori.
// Kursor halqasini nishon masofasiga moslab, aylanuvchi sweep o'sha burchakdan
// o'tganda nishon qulflanadi. 5 nishon → shahar himoyalandi (komponent onWin).
import { useCallback, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleRadar, radarTick } from './pixi/radarScene';
import useGameStore from '../../stores/gameStore';

export default function DistanceRadar() {
  const serialDist = useGameStore((s) => s.serialData.dist);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [detected, setDetected] = useState(0);
  const winRef = useRef(false);

  const dist = arduinoConnected ? Math.max(0, Math.min(400, Math.round(serialDist ?? 200))) : 200;

  const ctlRef = useRef({ dist: 200, connected: false, resetPulse: 0, onDetect: () => {}, onWin: () => {} });
  ctlRef.current.dist = dist;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.onDetect = (n) => { incrementScore(50); setDetected(n); };
  ctlRef.current.onWin = () => {
    if (winRef.current) return;
    winRef.current = true;
    const st = useGameStore.getState();
    if (st.onWin) st.onWin(st.score + 50);
  };

  const build = useCallback((app) => {
    const scene = assembleRadar(app);
    let t = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; scene.particles.tick(dt); radarTick(scene, dt, t, ctlRef.current); });
    return () => {};
  }, []);

  const panel = { background: 'rgba(6,18,16,0.82)', border: '1px solid rgba(57,255,208,0.2)', borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };

  return (
    <PixiStage build={build} className="rounded-xl">
      <div className="absolute top-3 left-3 flex gap-2">
        <div style={panel}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF' }}>⭐ {Math.round(score)}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5a8a80' }}>Ball</div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#6affe0', textShadow: '0 0 10px rgba(57,255,208,0.6)' }}>{dist}sm</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a80' }}>MASOFA</div>
        </div>
      </div>

      <div className="absolute top-3 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#39e06a', textShadow: '0 0 10px rgba(57,224,106,0.6)' }}>{detected}/5</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a80' }}>QULFLANDI</div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 300 }}>
        <div style={{ fontSize: 10.5, color: '#8fdccb' }}>
          {detected >= 5 ? '🛡️ Barcha nishon qulflandi — shahar himoyalandi!'
            : !arduinoConnected ? 'Platani ulang — ultrasonik sensor radar masofasini beradi'
              : '🎯 Sariq kursor halqasini nishonга moslab, sweep o\'tishini kut'}
        </div>
      </div>

      {!arduinoConnected && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(57,255,208,0.3)' }}>
          <span style={{ fontSize: 11, color: '#6affe0' }}>📡 Platani ulang — ultrasonik radar bilan meteorlarni qulfla</span>
        </div>
      )}
    </PixiStage>
  );
}
