// ☢️ VOLTRA "Chuqurlik Missiyasi" (PixiJS Premium Edition)
// Digital Twin: 2 tugma + LED + buzzer. Asteroid tushirgan XAVFLI MODDA yer
// qa'rida. Qahramon kostyumida tushadi: 1-tugma → SAKRASH, 2-tugma → EMAKLASH,
// IKKALA tugma birga → moddani MAXSUS IDISHGA solib zararsizlantirish (g'alaba).
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleDescent, descentTick } from './pixi/descentScene';
import useGameStore from '../../stores/gameStore';
import { playJump, playError, playSeal } from './gameAudio';

export default function ReactionChampion() {
  const serialBtn = useGameStore((s) => s.serialData.btn);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [depth, setDepth] = useState(0);
  const [health, setHealth] = useState(3);
  const [phase, setPhase] = useState('run');
  const prevBtn = useRef(0);
  const jumpP = useRef(0);
  const crawlP = useRef(0);
  const depositP = useRef(0);
  const resetP = useRef(0);
  const winRef = useRef(false);

  const ctlRef = useRef({ jumpPulse: 0, crawlPulse: 0, depositPulse: 0, resetPulse: 0, connected: false, onDepth: () => {}, onHit: () => {}, onChamber: () => {}, onWin: () => {} });
  ctlRef.current.jumpPulse = jumpP.current;
  ctlRef.current.crawlPulse = crawlP.current;
  ctlRef.current.depositPulse = depositP.current;
  ctlRef.current.resetPulse = resetP.current;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.onDepth = (d) => setDepth(d);
  ctlRef.current.onHit = () => { playError(); setHealth((hh) => { const nh = hh - 1; if (nh <= 0) { resetP.current += 1; setDepth(0); setPhase('run'); return 3; } return nh; }); };
  ctlRef.current.onChamber = () => setPhase('chamber');
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; incrementScore(100); playSeal(); setPhase('won'); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 100); };

  // tugma: 1=sakrash, 2=emaklash, 3=ikkisi birga (idishga sol)
  useEffect(() => {
    const v = serialBtn || 0;
    if (v !== prevBtn.current && arduinoConnected) {
      if (v === 3) { depositP.current += 1; }
      else if (v === 1) { jumpP.current += 1; playJump(); }
      else if (v === 2) { crawlP.current += 1; }
    }
    prevBtn.current = v;
  }, [serialBtn, arduinoConnected]);

  const build = useCallback((app) => {
    const scene = assembleDescent(app);
    let t = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; scene.particles.tick(dt); descentTick(scene, dt, t, ctlRef.current); });
    return () => {};
  }, []);

  const panel = { background: 'rgba(14,10,6,0.82)', border: '1px solid rgba(255,176,32,0.22)', borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* Chuqurlik + sog'liq */}
      <div className="absolute top-3 left-3 flex gap-2">
        <div style={{ ...panel, minWidth: 92 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#ffb020' }}>⛏️ {Math.round(depth)}%</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a7a5a' }}>Chuqurlik</div>
        </div>
        <div style={{ ...panel, display: 'flex', alignItems: 'center', gap: 3 }}>
          {[0, 1, 2].map((i) => <span key={i} style={{ fontSize: 15, opacity: i < health ? 1 : 0.2 }}>❤️</span>)}
        </div>
      </div>
      <div className="absolute top-3 right-3" style={panel}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF' }}>⭐ {Math.round(score)}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a7a5a' }}>Ball</div>
      </div>

      {/* Prompt */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 300 }}>
        <div style={{ fontSize: 11, color: phase === 'chamber' ? '#7dff5a' : '#e8c98a' }}>
          {phase === 'won' ? '☢️ Xavfli modda zararsizlantirildi — missiya bajarildi!'
            : phase === 'chamber' ? '🧪 IKKALA tugmani BIRGA bos — moddani idishga sol!'
              : !arduinoConnected ? 'Platani ulang — 2 tugma bilan yer ostiga tushing'
                : '🕹️ 1-tugma = SAKRASH · 2-tugma = EMAKLASH'}
        </div>
      </div>

      {/* Boshqaruv */}
      <div className="absolute bottom-3 right-3" style={{ ...panel, fontSize: 9, color: '#c9a86a', lineHeight: 1.5 }}>
        <span style={{ color: '#ffb020' }}>1-tugma</span>: sakrash (pin 2)<br />
        <span style={{ color: '#8ff4ff' }}>2-tugma</span>: emaklash (pin 3)<br />
        <span style={{ color: '#7dff5a' }}>ikkisi</span>: idishga sol
      </div>

      {!arduinoConnected && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(255,176,32,0.3)' }}>
          <span style={{ fontSize: 11, color: '#ffb020' }}>☢️ Platani ulang — xavfli moddani zararsizlantirish missiyasi</span>
        </div>
      )}
    </PixiStage>
  );
}
