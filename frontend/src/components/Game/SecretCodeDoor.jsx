// Secret Code Door — Spy-themed canvas game with code-breaking
import { useState, useRef, useCallback, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import { C, drawGradientBackground, drawGlow, drawVignette, drawScanlines, ParticleSystem } from './gameHelpers';
import useGameStore from '../../stores/gameStore';
import { playClick, playWin } from './gameAudio';

const CODE_LENGTH = 5;

export default function SecretCodeDoor() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  // The real circuit has exactly ONE push button, so it can only report
  // discrete press events — not a chosen 0/1 digit. The "secret code" is
  // therefore: press the button CODE_LENGTH times in a row to unlock the door.
  const [pressCount, setPressCount] = useState(0);
  const [doorOpen, setDoorOpen] = useState(false);
  const [feedback, setFeedback] = useState('Tugmani ' + CODE_LENGTH + ' marta bosing...');
  const winRef = useRef(false);
  const lastBtnState = useRef(0);

  // Handle button press — edge-triggered so a held button only counts once.
  useEffect(() => {
    if (doorOpen) return;
    const btn = serialData.btn || 0;
    if (btn === 1 && lastBtnState.current === 0) {
      playClick();
      incrementScore(5);
      const next = pressCount + 1;
      setPressCount(next);
      particles.current.emit(50, 50, '#00ff88', 5, 50);

      if (next >= CODE_LENGTH) {
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
        setFeedback(`✅ ${next}/${CODE_LENGTH} bosish qabul qilindi!`);
      }
    }
    lastBtnState.current = btn;
  }, [serialData.btn, doorOpen, pressCount, winConditions, onWin, incrementScore, score]);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, ['#050510', '#0a0020', '#050510']);

    // Vault door
    const dX = w / 2 - 80, dY = h / 2 - 100, dW = 160, dH = 200;

    // Door frame
    ctx.fillStyle = C.PANEL;
    ctx.fillRect(dX - 5, dY - 5, dW + 10, dH + 10);

    // Door
    ctx.fillStyle = doorOpen ? C.DARK : '#2a2a3a';
    ctx.fillRect(dX, dY, dW, dH);

    if (!doorOpen) {
      // Door details
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(dX + 10, dY + 10, dW - 20, 50);
      ctx.strokeRect(dX + 10, dY + 70, dW - 20, 50);
      ctx.strokeRect(dX + 10, dY + 130, dW - 20, 50);

      // Press counter display
      ctx.fillStyle = pressCount > 0 ? C.CYAN : '#475569';
      ctx.font = 'bold 24px Chakra Petch, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('●'.repeat(pressCount).split('').join(' ') || '— — — — —', w / 2, dY + 38);

      // Progress dots
      for (let i = 0; i < CODE_LENGTH; i++) {
        ctx.fillStyle = i < pressCount ? C.GREEN : C.PANEL;
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

    // Button-press indicators — one lamp per required press
    const ky = h * 0.65;
    for (let i = 0; i < CODE_LENGTH; i++) {
      const kx = w / 2 - 80 + i * 40;
      ctx.fillStyle = i < pressCount ? C.CYAN : C.PANEL;
      ctx.shadowColor = i < pressCount ? C.CYAN : 'transparent';
      ctx.shadowBlur = i < pressCount ? 8 : 0;
      ctx.beginPath();
      ctx.roundRect(kx, ky, 30, 22, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = i < pressCount ? C.WHITE : '#475569';
      ctx.font = '10px Chakra Petch, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), kx + 15, ky + 15);
    }

    // Feedback text
    if (feedback) {
      ctx.fillStyle = doorOpen ? C.GREEN : C.GOLD;
      ctx.font = 'bold 14px Chakra Petch, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(feedback, w / 2, h - 40);
    }

    // Instructions
    ctx.fillStyle = C.MUTED;
    ctx.font = '12px Chakra Petch, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`🔘 Tugmani bosing: ${pressCount}/${CODE_LENGTH}`, 15, 25);

    // Score
    ctx.fillStyle = C.WHITE;
    ctx.font = 'bold 14px Chakra Petch, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, w - 15, 25);

    particles.current.update(0.016);
    particles.current.draw(ctx);

    // Vignette + scanlines
    drawVignette(ctx, w, h);
    drawScanlines(ctx, w, h);
  }, [pressCount, doorOpen, feedback, score]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl" />
  );
}
