// 🛰️ VOLTRA "Sirt Sensor Stansiyasi" — ESP32 + DHT22 (yangi element: NAMLIK sensori).
// Realistik asteroid sirti: avtonom sensor mayoq. Stansiya bitta o'lchov uchun TARGET so'raydi —
// real sensorni sozlab (DHT'ga puf, LDR'ni yop, qo'l silt) qiymatni oynaga moslab ushlab tur.
// 6 namuna yig'ilsa -> muhit profili to'liq, bazaga relay qilinadi.
import { useCallback, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleStation, stationTick } from './pixi/stationScene';
import useGameStore from '../../stores/gameStore';
import { playScore, playWin, playClick } from './gameAudio';

const TARGET = 6;
const LABELS = ['HARORAT', 'NAMLIK', "YORUG'LIK", 'MASOFA'];
const HINTS = ['sensorni isit/sovut', 'DHT22 ga NAFAS ol (namlik)', 'LDR ustini yop/och', "qo'lni sensorga yaqinlashtir"];

export default function RemoteSensor() {
  const temp = useGameStore((s) => s.serialData.temp);
  const hum = useGameStore((s) => s.serialData.hum);
  const ldr = useGameStore((s) => s.serialData.ldr);
  const dist = useGameStore((s) => s.serialData.dist);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ samples: 0, active: 1, inBand: false, lock: 0 });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ temp: 25, hum: 50, ldr: 512, dist: 50, connected: false, mode: 'play', resetPulse: 0 });
  ctlRef.current.temp = temp ?? 25; ctlRef.current.hum = hum ?? 50; ctlRef.current.ldr = ldr ?? 512; ctlRef.current.dist = dist ?? 50;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onNear = () => playClick();
  ctlRef.current.onSample = () => { playScore(); incrementScore(90); useGameStore.getState().triggerShake?.(5); };
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 450); };

  const build = useCallback((app) => {
    const scene = assembleStation(app);
    let t = 0, acc = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; stationTick(scene, dt, t, ctlRef.current); acc += dt; if (acc > 0.08) { acc = 0; setHud({ samples: scene.samples, active: scene.activeIdx, inBand: scene.inBand, lock: scene.lockProgress }); } });
    return () => {};
  }, []);

  const restart = () => { resetRef.current += 1; winRef.current = false; setStatus('play'); };
  const panel = { background: 'rgba(10,8,10,0.84)', border: '1px solid rgba(0,229,255,0.28)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const bracket = { position: 'absolute', width: 26, height: 26, borderColor: 'rgba(0,229,255,0.5)', pointerEvents: 'none' };

  return (
    <PixiStage build={build} className="rounded-xl">
      <div style={{ ...bracket, top: 10, left: 10, borderLeft: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, top: 10, right: 10, borderRight: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, left: 10, borderLeft: '2px solid', borderBottom: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, right: 10, borderRight: '2px solid', borderBottom: '2px solid' }} />

      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 10, color: '#8fe0ff', letterSpacing: '0.14em' }}>
        <span className="animate-pulse" style={{ color: '#39ff88' }}>◉ FIELD</span>
        <span>SURFACE-STATION 19</span>
        <span style={{ color: arduinoConnected ? '#00e5ff' : '#8a8a8a' }}>{arduinoConnected ? 'DHT22: ONLINE' : 'DHT22: OFFLINE'}</span>
      </div>

      <div className="absolute top-10 left-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#00e5ff' }}>{hud.samples}/{TARGET}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a9a' }}>NAMUNA</div>
      </div>
      <div className="absolute top-10 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: hud.inBand ? '#39ff88' : '#ffd23a' }}>{LABELS[hud.active]}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a9a' }}>SO'RALGAN O'LCHOV</div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 400 }}>
        <div style={{ fontSize: 10.5, color: '#a9e6ff' }}>
          {status === 'won' ? '🛰️ Muhit profili to\'liq — bazaga relay qilindi!'
            : !arduinoConnected ? 'Platani ulang — ESP32 + DHT22 stansiyasi muhitni o\'lchaydi'
              : hud.inBand ? '🟢 MOS! Shu qiymatda USHLAB tur — namuna yig\'ilmoqda...'
                : `🎯 ${LABELS[hud.active]} so'raldi — ${HINTS[hud.active]}, qiymatni SARIQ oynaga moslang`}
        </div>
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(0,229,255,0.4)' }}>
          <span style={{ fontSize: 12, color: '#00e5ff' }}>🔌 Platani ulang — DHT22 namlik/harorat sensori bilan muhitni o'lcha</span>
        </div>
      )}

      {status === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(6,4,8,0.55)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>🛰️</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#00e5ff', marginBottom: 4 }}>Profil to'liq!</div>
            <div style={{ fontSize: 11, color: '#a9e6ff', marginBottom: 14 }}>{TARGET} muhit namunasi bazaga relay qilindi</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#04141c', background: '#00e5ff', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
