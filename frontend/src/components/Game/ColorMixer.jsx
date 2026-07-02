import { useState, useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import { C, drawVignette, drawScanlines, drawGlassPanel, drawProgressBar } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function ColorMixer() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const arduinoConnected = useGameStore(s => s.arduinoConnected);
  const [target, setTarget] = useState({ r: 128, g: 128, b: 128 });
  const winRef = useRef(false);
  const roundRef = useRef(0);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, C.DARK);
    grad.addColorStop(1, C.PANEL);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Real R/G/B from the three potentiometers (A0/A1/A2), sent by the
    // Arduino as "R:.. G:.. B:.." on one line and parsed into separate keys.
    const r = Math.max(0, Math.min(255, Math.round(serialData.r ?? 128)));
    const g = Math.max(0, Math.min(255, Math.round(serialData.g ?? 128)));
    const b = Math.max(0, Math.min(255, Math.round(serialData.b ?? 128)));

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
    ctx.fillStyle = C.MUTED;
    ctx.font = '14px Chakra Petch, monospace';
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

    ctx.fillStyle = similarity > 80 ? C.GREEN : similarity > 50 ? C.GOLD : '#ef4444';
    ctx.font = 'bold 18px Chakra Petch, monospace';
    ctx.fillText(`Moslik: ${Math.round(similarity)}%`, w / 2, h - 80);

    // Similarity bar
    drawProgressBar(ctx, w / 2 - 100, h - 60, 200, 10, similarity / 100,
      similarity > 80 ? C.GREEN : similarity > 50 ? C.GOLD : '#ef4444');

    // Win condition
    if (arduinoConnected && similarity > 90 && !winRef.current && winConditions) {
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
      } else {
        winRef.current = false; // Allow the next round to trigger again
      }
    }

    // Score panel
    drawGlassPanel(ctx, 10, 10, 120, 35, 10);
    ctx.fillStyle = C.WHITE;
    ctx.font = 'bold 14px Chakra Petch, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Tur: ' + roundRef.current + '/3', 20, 32);

    // Vignette + scanlines
    drawVignette(ctx, w, h);
    drawScanlines(ctx, w, h);
  }, [serialData.r, serialData.g, serialData.b, target, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      {!arduinoConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl z-10">
          <p className="text-white text-xl font-game animate-pulse" style={{ fontFamily: 'Chakra Petch, monospace' }}>🔌 Arduino'ni ulang</p>
        </div>
      )}
    </GameCanvas>
  );
}
