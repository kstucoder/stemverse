// Secret Code Door — Spy-themed canvas game with code-breaking
import { useState, useRef, useCallback, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import { drawGradientBackground, drawGlow, ParticleSystem, drawProgressBar } from './gameHelpers';
import useGameStore from '../../stores/gameStore';
import { playClick, playError, playWin } from './gameAudio';

const CODE_LENGTH = 5;
const MAX_ATTEMPTS = 3;

export default function SecretCodeDoor() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const secretCode = useRef(Array.from({ length: CODE_LENGTH }, () => Math.round(Math.random())));
  const [enteredCode, setEnteredCode] = useState([]);
  const [attempts, setAttempts] = useState(MAX_ATTEMPTS);
  const [doorOpen, setDoorOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const winRef = useRef(false);
  const lastBtnState = useRef(0);

  const digitPositions = Array.from({ length: CODE_LENGTH }, (_, i) => ({
    x: 30 + i * 60,
    y: 55,
    entered: false,
  }));

  // Handle button press
  useEffect(() => {
    if (doorOpen) return;
    const btn = serialData.button || 0;
    if (btn === 1 && lastBtnState.current === 0) {
      playClick();
      const newCode = [...enteredCode, Math.round(Math.random())];
      setEnteredCode(newCode);
      incrementScore(5);

      // Check if digit matches
      const pos = enteredCode.length;
      if (pos < CODE_LENGTH) {
        if (newCode[pos] !== secretCode.current[pos]) {
          setFeedback('❌ Xato raqam!');
          playError();
          particles.current.emit(50, 50, '#ef4444', 10, 80);
        } else {
          setFeedback(`✅ ${pos + 1}-raqam to'g'ri!`);
          particles.current.emit(50, 50, '#00ff88', 5, 50);
        }
      }

      if (newCode.length >= CODE_LENGTH) {
        // Check full code
        const correct = newCode.every((d, i) => d === secretCode.current[i]);
        if (correct) {
          setDoorOpen(true);
          setFeedback('🔓 ESHIK OCHILDI!');
          playWin();
          particles.current.emit(50, 70, '#ffdd00', 50, 200);
          if (!winRef.current && winConditions) {
            winRef.current = true;
            incrementScore(100);
            if (onWin) onWin(score + 100);
          }
        } else {
          setAttempts(a => a - 1);
          if (attempts <= 1) {
            setFeedback('🔒 TIZIM BLOKLANDI!');
            setEnteredCode([]);
            setAttempts(MAX_ATTEMPTS);
            secretCode.current = Array.from({ length: CODE_LENGTH }, () => Math.round(Math.random()));
          } else {
            setFeedback(`❌ Xato kod! ${attempts - 1} urinish qoldi`);
            playError();
            setEnteredCode([]);
          }
        }
      }
    }
    lastBtnState.current = btn;
  }, [serialData.button, doorOpen, enteredCode]);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, ['#050510', '#0a0020', '#050510']);

    // Vault door
    const dX = w / 2 - 80, dY = h / 2 - 100, dW = 160, dH = 200;

    // Door frame
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(dX - 5, dY - 5, dW + 10, dH + 10);

    // Door
    ctx.fillStyle = doorOpen ? '#0f172a' : '#2a2a3a';
    ctx.fillRect(dX, dY, dW, dH);

    if (!doorOpen) {
      // Door details
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(dX + 10, dY + 10, dW - 20, 50);
      ctx.strokeRect(dX + 10, dY + 70, dW - 20, 50);
      ctx.strokeRect(dX + 10, dY + 130, dW - 20, 50);

      // Code display
      ctx.fillStyle = enteredCode.length > 0 ? '#00f5ff' : '#475569';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(enteredCode.map(() => '●').join(' ') || '— — — — —', w / 2, dY + 38);

      // Progress dots
      for (let i = 0; i < CODE_LENGTH; i++) {
        ctx.fillStyle = i < enteredCode.length ? '#00ff88' : '#1e293b';
        ctx.beginPath();
        ctx.arc(w / 2 - 40 + i * 20, dY + 95, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lock icon
      ctx.font = '40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔒', w / 2, dY + 155);
    } else {
      // Open door
      ctx.fillStyle = 'rgba(0,255,136,0.1)';
      ctx.fillRect(dX, dY, dW, dH);
      ctx.font = '60px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔓', w / 2, dY + dH / 2 + 15);
      drawGlow(ctx, w / 2, dY + dH / 2, 60, 'rgba(0,255,136,0.15)');
    }

    // KEYPAD
    const keys = [
      [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], // Visual representation of binary
    ];
    const ky = h * 0.65;
    keys.forEach((row, ri) => {
      row.forEach((key, ci) => {
        const kx = w / 2 - 80 + ci * 40;
        ctx.fillStyle = enteredCode.length > ri ? '#00f5ff' : '#1e293b';
        ctx.shadowColor = enteredCode.length > ri ? '#00f5ff' : 'transparent';
        ctx.shadowBlur = enteredCode.length > ri ? 8 : 0;
        ctx.beginPath();
        ctx.roundRect(kx, ky + ri * 30, 30, 22, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = enteredCode.length > ri ? '#fff' : '#475569';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(secretCode.current[ri] || 0, kx + 15, ky + ri * 30 + 15);
      });
    });

    // Feedback text
    if (feedback) {
      ctx.fillStyle = doorOpen ? '#00ff88' : feedback.includes('Wrong') || feedback.includes('LOCKED') ? '#ef4444' : '#ffdd00';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(feedback, w / 2, h - 40);
    }

    // Attempts
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
	    ctx.fillText(`Urinishlar: ${'❤️'.repeat(attempts)}${'🖤'.repeat(MAX_ATTEMPTS - attempts)}`, 15, 25);

    // Secret code hint (small, for debugging/show)
    ctx.fillStyle = '#334155';
    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Target: ${secretCode.current.join('')}`, w - 15, h - 15);

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, w - 15, 25);

    particles.current.update(0.016);
    particles.current.draw(ctx);
  }, [enteredCode, doorOpen, feedback, attempts, score, serialData.button]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl" />
  );
}
