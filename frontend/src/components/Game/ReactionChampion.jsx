// ⚔️ VOLTRA "Neon Refleks Dueli" (PixiJS Premium Edition)
// Digital Twin: 2 tugma + LED + buzzer. Markazdagi signal tasodifiy YASHIL bo'ladi
// → birinchi bo'lib tugmasini bosgan o'yinchi yutadi (Arduino BTN:1/BTN:2 yuboradi).
// Yashildan oldin bossa — falstart (raqib ochko oladi). 5 g'alaba → chempion.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleDuel, duelTick } from './pixi/duelScene';
import useGameStore from '../../stores/gameStore';
import { playScore, playError, playWin } from './gameAudio';

export default function ReactionChampion() {
  const serialBtn = useGameStore((s) => s.serialData.btn);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [state, setState] = useState('waiting');
  const [winner, setWinner] = useState(0);
  const [foul, setFoul] = useState(false);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [reactionMs, setReactionMs] = useState(0);

  const prevBtn = useRef(0);
  const goTimer = useRef(null);
  const nextTimer = useRef(null);
  const goStart = useRef(0);
  const winRef = useRef(false);
  const roundPulse = useRef(0);
  const stateRef = useRef('waiting');
  stateRef.current = state;

  const ctlRef = useRef({ state: 'waiting', winner: 0, p1: 0, p2: 0, connected: false, roundPulse: 0 });
  ctlRef.current.state = state; ctlRef.current.winner = winner; ctlRef.current.p1 = p1; ctlRef.current.p2 = p2;
  ctlRef.current.connected = arduinoConnected; ctlRef.current.roundPulse = roundPulse.current;

  const startRound = useCallback(() => {
    if (winRef.current) return;
    setWinner(0); setFoul(false); setReactionMs(0);
    setState('ready');
    clearTimeout(goTimer.current);
    goTimer.current = setTimeout(() => { setState('go'); goStart.current = performance.now(); }, 1500 + Math.random() * 3000);
  }, []);

  const resolveRound = useCallback((win, isFoul) => {
    clearTimeout(goTimer.current);
    setWinner(win); setFoul(isFoul);
    roundPulse.current += 1;
    incrementScore(isFoul ? 5 : 20);
    isFoul ? playError() : playScore();
    setState('result');
    const setter = win === 1 ? setP1 : setP2;
    setter((prev) => {
      const nv = prev + 1;
      if (nv >= 5) {
        if (!winRef.current) { winRef.current = true; incrementScore(100); playWin(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 100); }
      } else {
        clearTimeout(nextTimer.current);
        nextTimer.current = setTimeout(() => startRound(), 1900);
      }
      return nv;
    });
  }, [incrementScore, startRound]);

  // tugma (edge): BTN:1 / BTN:2 = qaysi o'yinchi birinchi bosgani
  useEffect(() => {
    const v = serialBtn || 0;
    if ((v === 1 || v === 2) && prevBtn.current === 0 && arduinoConnected) {
      const s = stateRef.current;
      if (s === 'ready') resolveRound(v === 1 ? 2 : 1, true);          // falstart → raqib yutadi
      else if (s === 'go') { setReactionMs(Math.round(performance.now() - goStart.current)); resolveRound(v, false); }
    }
    prevBtn.current = v;
  }, [serialBtn, arduinoConnected, resolveRound]);

  // ulanganda duel boshlanadi
  useEffect(() => {
    if (arduinoConnected && !winRef.current) startRound();
    return () => { clearTimeout(goTimer.current); clearTimeout(nextTimer.current); };
  }, [arduinoConnected, startRound]);

  const build = useCallback((app) => {
    const scene = assembleDuel(app);
    let t = 0;
    app.ticker.add((tk) => { const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt; scene.particles.tick(dt); duelTick(scene, dt, t, ctlRef.current); });
    return () => {};
  }, []);

  const prompt = state === 'ready' ? '👀 Kuzating...' : state === 'go' ? '🔥 BOSING!' : state === 'result' ? (foul ? `⛔ Falstart! ${3 - winner}-o'yinchi shoshdi` : `🎉 ${winner}-o'yinchi yutdi!`) : '⚔️ Duelga tayyorlaning';
  const promptColor = state === 'go' ? '#21e065' : state === 'ready' ? '#ffc21a' : foul ? '#ff3b46' : '#EAF3FF';
  const panel = { background: 'rgba(11,8,22,0.82)', border: '1px solid rgba(155,93,229,0.25)', borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const pip = (on, c) => ({ width: 12, height: 12, borderRadius: '50%', background: on ? c : 'rgba(255,255,255,0.08)', boxShadow: on ? `0 0 8px ${c}` : 'none' });

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* Tablo */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-4" style={{ ...panel, padding: '8px 18px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#00eeff' }}>{p1}</div>
          <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>{[0, 1, 2, 3, 4].map((i) => <span key={i} style={pip(i < p1, '#00eeff')} />)}</div>
        </div>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>VS</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#ff2d78' }}>{p2}</div>
          <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>{[0, 1, 2, 3, 4].map((i) => <span key={i} style={pip(i < p2, '#ff2d78')} />)}</div>
        </div>
      </div>

      {/* Markaziy prompt */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '46%', textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: state === 'go' ? 34 : 22, color: promptColor, textShadow: `0 0 20px ${promptColor}90`, letterSpacing: '0.04em' }}>{prompt}</div>
        {state === 'result' && !foul && reactionMs > 0 && <div style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 13, color: '#94a3b8', marginTop: 4 }}>reaksiya: {(reactionMs / 1000).toFixed(3)}s</div>}
      </div>

      {/* Ball */}
      <div className="absolute bottom-3 left-3" style={panel}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF' }}>⭐ {Math.round(score)}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>Ball</div>
      </div>

      {/* Boshqaruv */}
      <div className="absolute bottom-3 right-3" style={{ ...panel, fontSize: 9, color: '#94a3b8', lineHeight: 1.5 }}>
        <span style={{ color: '#00eeff' }}>1-o'yinchi</span>: tugma (pin 2)<br />
        <span style={{ color: '#ff2d78' }}>2-o'yinchi</span>: tugma (pin 3)
      </div>

      {!arduinoConnected && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(155,93,229,0.3)' }}>
          <span style={{ fontSize: 11, color: '#c77dff' }}>⚔️ Platani ulang — 2 tugma bilan refleks duelini boshlang</span>
        </div>
      )}
    </PixiStage>
  );
}
