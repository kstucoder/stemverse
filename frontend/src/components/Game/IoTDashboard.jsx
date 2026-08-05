// 📡 VOLTRA "Telemetriya Uplinki" — ESP8266 WiFi UPLINK (yangi element: simsiz aloqa).
// Realistik missiya-boshqaruv: POT uplink antennasini flot sun'iy yo'ldoshiga nishonlaydi,
// signal LOCK bo'lganda BTN bilan data-paket uzat. 5 paket -> uplink o'rnatildi.
import { useCallback, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleUplink, uplinkTick } from './pixi/uplinkScene';
import useGameStore from '../../stores/gameStore';
import { playScore, playWin, playClick } from './gameAudio';

const TARGET = 5;

export default function IoTDashboard() {
  const pot = useGameStore((s) => s.serialData.pot);
  const btn = useGameStore((s) => s.serialData.btn);
  const temp = useGameStore((s) => s.serialData.temp);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ packets: 0, signal: 0, locked: false });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ pot: 512, btn: 0, temp: 40, connected: false, mode: 'play', resetPulse: 0 });
  ctlRef.current.pot = arduinoConnected ? (pot ?? 512) : 512;
  ctlRef.current.btn = arduinoConnected ? (btn ? 1 : 0) : 0;
  ctlRef.current.temp = temp ?? 40;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onTransmit = () => { playScore(); playClick(); incrementScore(80); };
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 400); };

  const build = useCallback((app) => {
    const scene = assembleUplink(app);
    let t = 0, acc = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; uplinkTick(scene, dt, t, ctlRef.current); acc += dt; if (acc > 0.08) { acc = 0; setHud({ packets: scene.packets, signal: scene.signal, locked: scene.locked }); } });
    return () => {};
  }, []);

  const restart = () => { resetRef.current += 1; winRef.current = false; setStatus('play'); };
  const panel = { background: 'rgba(8,14,20,0.84)', border: '1px solid rgba(106,176,255,0.3)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const bracket = { position: 'absolute', width: 26, height: 26, borderColor: 'rgba(106,176,255,0.5)', pointerEvents: 'none' };

  return (
    <PixiStage build={build} className="rounded-xl">
      <div style={{ ...bracket, top: 10, left: 10, borderLeft: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, top: 10, right: 10, borderRight: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, left: 10, borderLeft: '2px solid', borderBottom: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, right: 10, borderRight: '2px solid', borderBottom: '2px solid' }} />

      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 10, color: '#9fc8ff', letterSpacing: '0.14em' }}>
        <span className="animate-pulse" style={{ color: '#39ff88' }}>▲ UPLINK</span>
        <span>MISSION-CTRL 18</span>
        <span style={{ color: arduinoConnected ? '#6ab0ff' : '#8a8a8a' }}>{arduinoConnected ? 'WiFi: CONNECTED' : 'WiFi: OFFLINE'}</span>
      </div>

      <div className="absolute top-10 left-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#6ab0ff' }}>{hud.packets}/{TARGET}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a7a9a' }}>PAKET UZATILDI</div>
      </div>
      <div className="absolute top-10 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: hud.locked ? '#39ff88' : '#ffb020' }}>{Math.round(hud.signal * 100)}%</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a7a9a' }}>{hud.locked ? 'SIGNAL LOCK' : 'SIGNAL'}</div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 380 }}>
        <div style={{ fontSize: 10.5, color: '#a9d0ff' }}>
          {status === 'won' ? '📡 Uplink o\'rnatildi — telemetriya flotga stream bo\'lyapti!'
            : !arduinoConnected ? 'Platani ulang — ESP8266 WiFi uplink antennasini boshqaring'
              : hud.locked ? '🟢 SIGNAL LOCK! Tugmani bosib data-paketni UZAT'
                : '🛰️ POT bilan antennani sun\'iy yo\'ldoshga nishonla — signalni ushla'}
        </div>
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(106,176,255,0.4)' }}>
          <span style={{ fontSize: 12, color: '#6ab0ff' }}>🔌 Platani ulang — WiFi orqali flotga telemetriya uzat</span>
        </div>
      )}

      {status === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(4,10,16,0.55)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>📡</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#6ab0ff', marginBottom: 4 }}>Uplink o'rnatildi!</div>
            <div style={{ fontSize: 11, color: '#a9d0ff', marginBottom: 14 }}>{TARGET} telemetriya paketi flotga yetdi</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#04101c', background: '#6ab0ff', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
