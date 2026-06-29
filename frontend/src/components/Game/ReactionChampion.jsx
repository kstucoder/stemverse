import { useState, useRef, useCallback, useEffect } from 'react';
import GameCanvas from './GameCanvas'; import { drawGradientBackground, ParticleSystem } from './gameHelpers';
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

  useEffect(() => {
    if (state !== 'go') return;
    if (serialData.button === 1) {
      const reaction = Date.now() - startTime.current;
      setWinner(1);
      setP1Score(s => s + 1);
      setState('result');
      incrementScore(20);
      particles.current.emit(200, 200, '#00f5ff', 30, 200);
      setTimeout(() => setState('waiting'), 1500);
    }
  }, [serialData.button, state]);

  useEffect(() => {
    if (p1Score >= 5 && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(100);
      if (onWin) onWin(score + 100);
    }
  }, [p1Score, score, winConditions, onWin]);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, ['#0a0015', '#1a002a', '#0a0015']);

    // Center circle
    const cx = w / 2, cy = h / 2;
    const pulse = state === 'go' ? 20 + 10 * Math.sin(t * 10) : 0;

    ctx.fillStyle = state === 'go' ? '#00ff88' : state === 'ready' ? '#ffdd00' : '#334155';
    ctx.shadowColor = state === 'go' ? '#00ff88' : state === 'ready' ? '#ffdd00' : 'transparent';
    ctx.shadowBlur = pulse;
    ctx.beginPath();
    ctx.arc(cx, cy, state === 'waiting' ? 20 : 30 + pulse * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // State text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(
state === 'waiting' ? "⏳ Tayyorlaning..." :
	      state === 'ready' ? "👀 Kuzating..." :
	      state === 'go' ? "🔥 BOSING!" :
	      "🎉 1-o'yinchi yutdi!",
      cx, cy - 60
    );

    if (state === 'go') {
      ctx.fillStyle = `rgba(0,255,136,${0.1 + 0.1 * Math.sin(t * 8)})`;
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText('🔥', cx, cy + 10);
    }

    // Player scores
    ctx.fillStyle = '#00f5ff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('O1: ' + p1Score, 30, 50);
    ctx.fillStyle = '#ff00e5';
    ctx.textAlign = 'right';
    ctx.fillText('O2: ' + p2Score, w - 30, 50);

    // Progress to win
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w / 2 - 100, h - 40, 200, 8);
    ctx.fillStyle = '#00f5ff';
    ctx.fillRect(w / 2 - 100, h - 40, 200 * (p1Score / 5), 8);

    particles.current.update(0.016);
    particles.current.draw(ctx);

    // LED indicator
    ctx.fillStyle = `rgba(0,255,136,${state === 'go' ? 0.5 + 0.5 * Math.sin(t * 10) : 0.1})`;
    ctx.fillRect(10, h - 30, 12, 12);
  }, [state, p1Score, p2Score, score]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
      <div className="absolute top-4 right-4 glass rounded-xl px-4 py-2 text-xs text-dark-400">
        1-o'yinchi: BTN (pin 2)<br />
        2-o'yinchi: BTN (pin 3) - ulanmagan
      </div>
    </GameCanvas>
  );
}
