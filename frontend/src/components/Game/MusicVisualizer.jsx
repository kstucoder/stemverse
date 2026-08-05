// 🎙️ VOLTRA "Ovoz Vizualizatori" — OVOZ SENSORI (KY-038 mikrofon).
// YANGI ELEMENT: mikrofon haqiqiy ovoz sathini o'lchaydi (serialData.sound).
// Realistik aloqa boshqaruv xonasi: ovoz sathini SARIQ uzatish oynasiga moslab
// USHLAB tur -> flotga handshake signali qulflanadi. 3 handshake -> aloqa tiklanadi.
import { useCallback, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleVisualizer, visualizerTick } from './pixi/visualizerScene';
import useGameStore from '../../stores/gameStore';
import { playScore, playWin, playClick } from './gameAudio';

const WAVES = 3;

export default function MusicVisualizer() {
  const sound = useGameStore((s) => s.serialData.sound);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ wave: 0, level: 0, target: 0.6, lock: 0, inBand: false });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ level: 0, connected: false, mode: 'play', resetPulse: 0 });
  ctlRef.current.level = arduinoConnected ? Math.max(0, Math.min(1, (sound ?? 0) / 1023)) : 0;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onNear = () => playClick();
  ctlRef.current.onLock = () => { playScore(); incrementScore(100); useGameStore.getState().triggerShake?.(6); };
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playWin(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 300); };

  const build = useCallback((app) => {
    const scene = assembleVisualizer(app);
    let t = 0, hudAcc = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
      visualizerTick(scene, dt, t, ctlRef.current);
      hudAcc += dt; if (hudAcc > 0.08) { hudAcc = 0; setHud({ wave: scene.wave, level: scene.curLevel, target: scene.targetC, lock: scene.lockProgress, inBand: scene.inBand }); }
    });
    return () => {};
  }, []);

  const restart = () => { resetRef.current += 1; winRef.current = false; setStatus('play'); };

  const panel = { background: 'rgba(8,14,18,0.84)', border: '1px solid rgba(57,255,136,0.28)', borderRadius: 12, padding: '7px 13px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const bracket = { position: 'absolute', width: 26, height: 26, borderColor: 'rgba(57,255,136,0.5)', pointerEvents: 'none' };
  const leds = Math.round(Math.max(0, Math.min(1, hud.level)) * 4);

  return (
    <PixiStage build={build} className="rounded-xl">
      <div style={{ ...bracket, top: 10, left: 10, borderLeft: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, top: 10, right: 10, borderRight: '2px solid', borderTop: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, left: 10, borderLeft: '2px solid', borderBottom: '2px solid' }} />
      <div style={{ ...bracket, bottom: 10, right: 10, borderRight: '2px solid', borderBottom: '2px solid' }} />

      {/* REC + holat */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 10, color: '#8fffc0', letterSpacing: '0.14em' }}>
        <span className="animate-pulse" style={{ color: '#ff3b46' }}>● REC</span>
        <span>BROADCAST-LINK 07</span>
        <span style={{ color: arduinoConnected ? '#39ff88' : '#8a8a8a' }}>{arduinoConnected ? 'MIC: ARMED' : 'MIC: OFFLINE'}</span>
      </div>

      {/* uzatish holati */}
      <div className="absolute top-10 left-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#39ff88' }}>{Math.round(hud.level * 100)}%</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a70' }}>UZATISH SATHI</div>
      </div>
      <div className="absolute top-10 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 15 }}>{'◆'.repeat(hud.wave)}{'◇'.repeat(Math.max(0, WAVES - hud.wave))}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#5a8a70' }}>HANDSHAKE {hud.wave}/{WAVES}</div>
      </div>

      {/* lock progress + LED VU */}
      <div className="absolute top-[70px] left-1/2 -translate-x-1/2 flex items-center gap-3" style={{ ...panel, padding: '5px 12px' }}>
        <div style={{ width: 96, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${Math.round(hud.lock * 100)}%`, height: '100%', background: hud.inBand ? '#39ff88' : '#ffd23a', transition: 'width 0.05s linear' }} />
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2, 3].map((i) => (<span key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i < leds ? (i >= 3 ? '#ff5a4a' : '#39ff88') : '#22302a' }} />))}
        </div>
      </div>

      {/* pastki ko'rsatma */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 380 }}>
        <div style={{ fontSize: 10.5, color: '#9fe0bc' }}>
          {status === 'won' ? '📡 Handshake tugadi — flot bilan aloqa tiklandi!'
            : !arduinoConnected ? 'Platani ulang — KY-038 mikrofon ovoz sathini o\'lchaydi'
              : hud.inBand ? '🟢 MOS! Ovozni shu sathda USHLAB tur — signal qulflanmoqda...'
                : '🎙️ Ovoz chiqar (chapak/kuy) — sathni SARIQ uzatish oynasiga moslang'}
        </div>
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(57,255,136,0.4)' }}>
          <span style={{ fontSize: 12, color: '#39ff88' }}>🔌 Platani ulang — mikrofon bilan handshake signalini uzat</span>
        </div>
      )}

      {status === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(4,10,8,0.55)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>📡</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#39ff88', marginBottom: 4 }}>Aloqa tiklandi!</div>
            <div style={{ fontSize: 11, color: '#9fe0bc', marginBottom: 14 }}>{WAVES} handshake qulflandi — flot javob berdi</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#04120c', background: '#39ff88', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
