import { useState, useRef, useCallback, useEffect } from 'react';
import GameCanvas from './GameCanvas'; import { C, drawGradientBackground, drawVignette, drawScanlines, drawProgressBar, ParticleSystem } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function ReactionChampion() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const [state, setState] = useState('waiting'); // waiting, ready, go, result
  const [winner, setWinner] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const timerRef = useRef(null);
  const startTime = useRef(0);
  const winRef = useRef(false);

  const startRound = useCallback(() => {
    setState('ready');
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setState('go');
      startTime.current = Date.now();
    }, delay);
  }, []);

  useEffect(() => {
    startRound();
    return () => clearTimeout(timerRef.current);
  }, [p1Score, p2Score]);

  // The Arduino sends the WINNER NUMBER itself in "BTN:" (0 = no one yet,
  // 1 = pin 2 pressed first, 2 = pin 3 pressed first) — not a plain boolean —
  // so both players must be credited based on the actual value received.
  useEffect(() => {
    if (state !== 'go') return;
    const btn = serialData.btn || 0;
    if (btn === 1 || btn === 2) {
      setWinner(btn);
      if (btn === 1) setP1Score(s => s + 1); else setP2Score(s => s + 1);
      setState('result');
      incrementScore(20);
      particles.current.emit(200, 200, btn === 1 ? '#00f5ff' : '#ff2d78', 30, 200);
      setTimeout(() => setState('waiting'), 1500);
    }
  }, [serialData.btn, state, incrementScore]);

  useEffect(() => {
    if ((p1Score >= 5 || p2Score >= 5) && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(100);
      if (onWin) onWin(score + 100);
    }
  }, [p1Score, p2Score, score, winConditions, onWin, incrementScore]);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, ['#0a0015', '#1a002a', '#0a0015']);

    // Center circle
    const cx = w / 2, cy = h / 2;
    const pulse = state === 'go' ? 20 + 10 * Math.sin(t * 10) : 0;

    ctx.fillStyle = state === 'go' ? C.GREEN : state === 'ready' ? C.GOLD : '#334155';
    ctx.shadowColor = state === 'go' ? C.GREEN : state === 'ready' ? C.GOLD : 'transparent';
    ctx.shadowBlur = pulse;
    ctx.beginPath();
    ctx.arc(cx, cy, state === 'waiting' ? 20 : 30 + pulse * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // State text
    ctx.textAlign = 'center';
    ctx.fillStyle = C.WHITE;
    ctx.font = 'bold 28px Chakra Petch, monospace';
    ctx.fillText(
state === 'waiting' ? "⏳ Tayyorlaning..." :
	      state === 'ready' ? "👀 Kuzating..." :
	      state === 'go' ? "🔥 BOSING!" :
	      `🎉 ${winner}-o'yinchi yutdi!`,
      cx, cy - 60
    );

    if (state === 'go') {
      ctx.fillStyle = `rgba(0,255,136,${0.1 + 0.1 * Math.sin(t * 8)})`;
      ctx.font = 'bold 72px Chakra Petch, monospace';
      ctx.fillText('🔥', cx, cy + 10);
    }

    // Player scores
    ctx.fillStyle = C.CYAN;
    ctx.font = 'bold 24px Chakra Petch, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('O1: ' + p1Score, 30, 50);
    ctx.fillStyle = C.PINK;
    ctx.textAlign = 'right';
    ctx.fillText('O2: ' + p2Score, w - 30, 50);

    // Progress to win (whichever player is ahead)
    const leader = Math.max(p1Score, p2Score);
    drawProgressBar(ctx, w / 2 - 100, h - 40, 200, 8, leader / 5, p1Score >= p2Score ? C.CYAN : C.PINK);

    particles.current.update(0.016);
    particles.current.draw(ctx);

    // Vignette + scanlines
    drawVignette(ctx, w, h);
    drawScanlines(ctx, w, h);

    // LED indicator
    ctx.fillStyle = `rgba(0,255,136,${state === 'go' ? 0.5 + 0.5 * Math.sin(t * 10) : 0.1})`;
    ctx.fillRect(10, h - 30, 12, 12);
  }, [state, p1Score, p2Score, score, winner]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
      <div className="absolute top-4 right-4 glass rounded-xl px-4 py-2 text-xs text-dark-400">
        1-o'yinchi: tugma (pin 2)<br />
        2-o'yinchi: tugma (pin 3)
      </div>
    </GameCanvas>
  );
}
