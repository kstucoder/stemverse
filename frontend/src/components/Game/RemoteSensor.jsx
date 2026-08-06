// 🛠️ VOLTRA "Ta'mirlash Roveri" — IR MASOFADAN BOSHQARUV (VS1838B + pult) yangi element.
// IR pult tugmalari (▲▼◄►) bilan roverni baza korpusi bo'ylab yurit; shikast ustiga borib
// OK bilan payvandla. 5 shikast tuzatilsa -> tashqi korpus butun.
import { useCallback, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleRover, roverTick } from './pixi/roverScene';
import useGameStore from '../../stores/gameStore';
import { playScore, playWin, playZap } from './gameAudio';

const TARGET = 5;

export default function RemoteSensor() {
  const ir = useGameStore((s) => s.serialData.ir);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ fixed: 0, weld: 0, inRange: false });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ ir: 'NONE', connected: false, mode: 'play', resetPulse: 0 });
  ctlRef.current.ir = arduinoConnected ? (ir ?? 'NONE') : 'NONE';
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onWeld = () => { playScore(); playZap(); incrementScore(90); useGameStore.getState().triggerShake?.(6); };
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 450); };

  const build = useCallback((app) => {
    const scene = assembleRover(app);
    let t = 0, acc = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; roverTick(scene, dt, t, ctlRef.current); acc += dt; if (acc > 0.08) { acc = 0; setHud({ fixed: scene.fixed, weld: scene.weld, inRange: scene.nearIdx >= 0 && Math.hypot(scene.damages[scene.nearIdx].x - scene.rx, scene.damages[scene.nearIdx].y - scene.ry) < 40 }); } });
    return () => {};
  }, []);

  const restart = () => { resetRef.current += 1; winRef.current = false; setStatus('play'); };
  const panel = { background: 'rgba(10,14,18,0.84)', border: '1px solid rgba(107,255,176,0.28)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const bracket = { position: 'absolute', width: 26, height: 26, borderColor: 'rgba(107,255,176,0.5)', pointerEvents: 'none' };

  return (
    <PixiStage build={build} className="rounded-xl">
      <div style={{ ...bracket, top: 10, left: 10, borderLeft: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, top: 10, right: 10, borderRight: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, left: 10, borderLeft: '2px solid', borderBottom: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, right: 10, borderRight: '2px solid', borderBottom: '2px solid' }} />

      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 10, color: '#8fffc0', letterSpacing: '0.14em' }}>
        <span className="animate-pulse" style={{ color: '#39ff88' }}>◉ ROVER</span>
        <span>HULL-REPAIR 19</span>
        <span style={{ color: arduinoConnected ? '#6bffb0' : '#8a8a8a' }}>{arduinoConnected ? 'IR: LINKED' : 'IR: OFFLINE'}</span>
      </div>

      <div className="absolute top-10 left-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#6bffb0' }}>{hud.fixed}/{TARGET}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a70' }}>SHIKAST TUZATILDI</div>
      </div>
      <div className="absolute top-10 right-3" style={{ ...panel, textAlign: 'center', minWidth: 92 }}>
        <div style={{ width: 76, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', margin: '4px auto 3px' }}>
          <div style={{ width: `${Math.round(hud.weld * 100)}%`, height: '100%', background: '#ffd23a', transition: 'width 0.05s linear' }} />
        </div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a70' }}>PAYVAND</div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 400 }}>
        <div style={{ fontSize: 10.5, color: '#a9f0cc' }}>
          {status === 'won' ? '🛠️ Tashqi korpus to\'liq ta\'mirlandi — baza germetik!'
            : !arduinoConnected ? 'Platani ulang — IR pult bilan ta\'mirlash roverini boshqar'
              : hud.inRange ? '🟢 Shikast yonida! IR pultda OK ni bosib USHLAB tur — payvandla'
                : '🎮 IR pult ▲▼◄► bilan roverni SARIQ shikast ustiga olib bor'}
        </div>
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(107,255,176,0.4)' }}>
          <span style={{ fontSize: 12, color: '#6bffb0' }}>🔌 Platani ulang — IR masofadan boshqaruv pulti bilan roverni yurit</span>
        </div>
      )}

      {status === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(4,8,10,0.55)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>🛠️</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#6bffb0', marginBottom: 4 }}>Korpus ta'mirlandi!</div>
            <div style={{ fontSize: 11, color: '#a9f0cc', marginBottom: 14 }}>{TARGET} shikast payvandlandi — baza germetik</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#04140c', background: '#6bffb0', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
