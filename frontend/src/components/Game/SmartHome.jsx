// 🏔️ VOLTRA "Aqlli Baza" — FINAL BOSS — RELAY MODULI (yangi element: quvvat kalitlash).
// Realistik baza kesimi: 5 quyi-tizim (REAKTOR, HAYOT-TA'MINOTI, YORUG'LIK, TERMAL, SHLYUZ).
// POT bilan quvvatni oynaga sozla, band YASHIL bo'lganda BTN bilan relayni ULA -> xona yonadi.
// 5 tizim ham onlayn -> BAZA TO'LIQ ISHGA TUSHDI (missiya yakuni).
import { useCallback, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleBase, baseTick } from './pixi/baseScene';
import useGameStore from '../../stores/gameStore';
import { playScore, playWin, playClick } from './gameAudio';

const TARGET = 5;
const SYS = ['REAKTOR', "HAYOT-TA'MINOTI", "YORUG'LIK", 'TERMAL', 'SHLYUZ'];

export default function SmartHome() {
  const pot = useGameStore((s) => s.serialData.pot);
  const btn = useGameStore((s) => s.serialData.btn);
  const temp = useGameStore((s) => s.serialData.temp);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ online: 0, active: 0, inBand: false });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ pot: 512, btn: 0, temp: 22, connected: false, mode: 'play', resetPulse: 0 });
  ctlRef.current.pot = arduinoConnected ? (pot ?? 512) : 512;
  ctlRef.current.btn = arduinoConnected ? (btn ? 1 : 0) : 0;
  ctlRef.current.temp = temp ?? 22;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onNear = () => playClick();
  ctlRef.current.onEngage = () => { playScore(); playClick(); incrementScore(120); useGameStore.getState().triggerShake?.(8); };
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); useGameStore.getState().triggerShake?.(16); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 500); };

  const build = useCallback((app) => {
    const scene = assembleBase(app);
    let t = 0, acc = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; baseTick(scene, dt, t, ctlRef.current); acc += dt; if (acc > 0.08) { acc = 0; setHud({ online: scene.online, active: scene.activeIdx, inBand: scene.inBand }); } });
    return () => {};
  }, []);

  const restart = () => { resetRef.current += 1; winRef.current = false; setStatus('play'); };
  const panel = { background: 'rgba(6,12,18,0.85)', border: '1px solid rgba(107,255,176,0.28)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const bracket = { position: 'absolute', width: 26, height: 26, borderColor: 'rgba(107,255,176,0.5)', pointerEvents: 'none' };

  return (
    <PixiStage build={build} className="rounded-xl">
      <div style={{ ...bracket, top: 10, left: 10, borderLeft: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, top: 10, right: 10, borderRight: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, left: 10, borderLeft: '2px solid', borderBottom: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, right: 10, borderRight: '2px solid', borderBottom: '2px solid' }} />

      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 10, color: '#8fffc0', letterSpacing: '0.14em' }}>
        <span className="animate-pulse" style={{ color: '#ffd23a' }}>★ FINAL</span>
        <span>BASE-CORE 20</span>
        <span style={{ color: arduinoConnected ? '#6bffb0' : '#8a8a8a' }}>{arduinoConnected ? 'RELAY: ARMED' : 'RELAY: OFFLINE'}</span>
      </div>

      <div className="absolute top-10 left-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#6bffb0' }}>{hud.online}/{TARGET}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a70' }}>TIZIM ONLAYN</div>
      </div>
      <div className="absolute top-10 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: hud.inBand ? '#39ff88' : '#ffd23a' }}>{SYS[hud.active]}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a70' }}>ULANMOQDA</div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 400 }}>
        <div style={{ fontSize: 10.5, color: '#a9f0cc' }}>
          {status === 'won' ? '🏔️ BAZA TO\'LIQ ISHGA TUSHDI — barcha tizimlar onlayn!'
            : !arduinoConnected ? 'Platani ulang — ESP32 + relay moduli baza tizimlarini boshqaradi'
              : hud.inBand ? `🟢 QUVVAT MOS! Tugmani bosib ${SYS[hud.active]} relayini ULA`
                : `⚡ POT bilan quvvatni SARIQ oynaga sozla — ${SYS[hud.active]} tizimi uchun`}
        </div>
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(107,255,176,0.4)' }}>
          <span style={{ fontSize: 12, color: '#6bffb0' }}>🔌 Platani ulang — relay moduli bilan butun bazani ishga tushir</span>
        </div>
      )}

      {status === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(3,8,6,0.6)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '26px 34px', border: '1px solid rgba(255,210,58,0.4)' }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>🏆</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#ffd23a', marginBottom: 4 }}>BAZA ONLAYN!</div>
            <div style={{ fontSize: 12, color: '#a9f0cc', marginBottom: 4 }}>Barcha 5 tizim ishga tushdi — missiya yakunlandi.</div>
            <div style={{ fontSize: 10, color: '#7ac0a0', marginBottom: 14 }}>Bosh Muhandis darajasiga yetding, qo'mondon! 👑</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#0a1408', background: '#6bffb0', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
