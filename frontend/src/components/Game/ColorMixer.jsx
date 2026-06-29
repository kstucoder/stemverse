import { useState, useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import useGameStore from '../../stores/gameStore';

export default function ColorMixer() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const [target, setTarget] = useState({ r: 128, g: 128, b: 128 });
  const winRef = useRef(false);
  const roundRef = useRef(0);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Current color from serial (simulate with potentiometer if no RGB POTs)
    const r = Math.round((serialData.potentiometer || 512) / 1023 * 255);
    const g = Math.round(((serialData.distance || 200) / 400) * 255);
    const b = 128;

    const currentColor = `rgb(${r},${g},${b})`;

    // Target color display
    const tw = 120, th = 120;
    ctx.fillStyle = `rgb(${target.r},${target.g},${target.b})`;
    ctx.shadowColor = `rgb(${target.r},${target.g},${target.b})`;
    ctx.shadowBlur = 20;
    ctx.fillRect(w / 2 - tw - 20, h / 2 - th / 2, tw, th);
    ctx.shadowBlur = 0;

    // Current color
    ctx.fillStyle = currentColor;
    ctx.shadowColor = currentColor;
    ctx.shadowBlur = 20;
    ctx.fillRect(w / 2 + 20, h / 2 - th / 2, tw, th);
    ctx.shadowBlur = 0;

    // Labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('🎯 MAQSAD', w / 2 - tw - 20 + tw / 2, h / 2 - th / 2 - 15);
    ctx.fillText('🎨 SIZNING ARALASHMAN', w / 2 + 20 + tw / 2, h / 2 - th / 2 - 15);

    // Color values
    ctx.font = '12px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`R: ${target.r}`, w / 2 - tw - 20 + 20, h / 2 + th / 2 + 20);
    ctx.fillText(`R: ${r}`, w / 2 + 20 + 20, h / 2 + th / 2 + 20);
    ctx.fillStyle = '#22c55e';
    ctx.fillText(`G: ${target.g}`, w / 2 - tw - 20 + 20, h / 2 + th / 2 + 35);
    ctx.fillText(`G: ${g}`, w / 2 + 20 + 20, h / 2 + th / 2 + 35);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(`B: ${target.b}`, w / 2 - tw - 20 + 20, h / 2 + th / 2 + 50);
    ctx.fillText(`B: ${b}`, w / 2 + 20 + 20, h / 2 + th / 2 + 50);

    // Similarity score
    const diff = Math.abs(r - target.r) + Math.abs(g - target.g) + Math.abs(b - target.b);
    const similarity = Math.max(0, 100 - diff / 7.65);

    ctx.fillStyle = similarity > 80 ? '#00ff88' : similarity > 50 ? '#ffdd00' : '#ef4444';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Moslik: ${Math.round(similarity)}%`, w / 2, h - 80);

    // Similarity bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w / 2 - 100, h - 60, 200, 10);
    ctx.fillStyle = similarity > 80 ? '#00ff88' : similarity > 50 ? '#ffdd00' : '#ef4444';
    ctx.fillRect(w / 2 - 100, h - 60, 200 * (similarity / 100), 10);

    // Win condition
    if (similarity > 90 && !winRef.current && winConditions) {
      winRef.current = true;
      roundRef.current++;
      incrementScore(100);
      // New target
      setTarget({
        r: Math.round(Math.random() * 255),
        g: Math.round(Math.random() * 255),
        b: Math.round(Math.random() * 255),
      });
      if (roundRef.current >= 3 && onWin) {
        onWin(score + 100);
      }
      winRef.current = false; // Allow multiple rounds
    }

    // Score
    ctx.fillStyle = 'rgba(15,23,42,0.8)';
    ctx.fillRect(10, 10, 100, 35);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Tur: ' + roundRef.current + '/3', 20, 32);
  }, [serialData.potentiometer, serialData.distance, serialData.led, target, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl" />
  );
}
