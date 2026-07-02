import { useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas'; import { C, drawGradientBackground, drawVignette, drawScanlines, drawProgressBar, ParticleSystem } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function ParkingAssistant() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const parkTimer = useRef(0);
  const winRef = useRef(false);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, [C.DARK, C.PANEL, C.DARK]);

    const dist = serialData.dist ?? 200;
    const isParked = dist < 5 && dist > 0;

    // Parking spot
    ctx.strokeStyle = C.GOLD;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(w * 0.15, h * 0.2, w * 0.7, h * 0.5);
    ctx.setLineDash([]);

    // "P" sign
    ctx.fillStyle = C.PANEL;
    ctx.fillRect(w * 0.12, h * 0.15, 40, 30);
    ctx.fillStyle = C.GOLD;
    ctx.font = 'bold 18px Chakra Petch, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('P', w * 0.12 + 20, h * 0.15 + 22);

    // Car (moves based on distance)
    const carX = w * 0.5;
    const carY = h * 0.25 + (1 - Math.min(dist / 100, 1)) * (h * 0.4);
    const carScale = 1 - Math.min(dist / 200, 0.3);

    // Car body
    ctx.fillStyle = isParked ? C.GREEN : '#3b82f6';
    ctx.shadowColor = isParked ? C.GREEN : '#3b82f6';
    ctx.shadowBlur = isParked ? 30 : 10;
    ctx.beginPath();
    ctx.roundRect(carX - 40 * carScale, carY - 15 * carScale, 80 * carScale, 30 * carScale, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Car roof
    ctx.fillStyle = isParked ? '#00cc66' : '#2563eb';
    ctx.beginPath();
    ctx.roundRect(carX - 25 * carScale, carY - 22 * carScale, 50 * carScale, 15 * carScale, 3);
    ctx.fill();

    // Windows
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(carX - 20 * carScale, carY - 20 * carScale, 18 * carScale, 10 * carScale);
    ctx.fillRect(carX + 2 * carScale, carY - 20 * carScale, 18 * carScale, 10 * carScale);

    // Wheels
    ctx.fillStyle = C.DARK;
    ctx.beginPath();
    ctx.arc(carX - 25 * carScale, carY + 16 * carScale, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(carX + 25 * carScale, carY + 16 * carScale, 5, 0, Math.PI * 2);
    ctx.fill();

    // Distance indicator
    const barW = 200;
    const distPct = Math.min(dist / 100, 1);
    const barColor = dist < 10 ? '#ef4444' : dist < 30 ? C.GOLD : C.GREEN;
    drawProgressBar(ctx, w / 2 - barW / 2, h - 60, barW, 12, 1 - distPct, barColor);

    ctx.textAlign = 'center';
    ctx.fillStyle = C.WHITE;
    ctx.font = 'bold 20px Chakra Petch, monospace';
    ctx.fillText(Math.round(dist) + ' cm', w / 2, h - 80);

    ctx.fillStyle = isParked ? C.GREEN : C.MUTED;
    ctx.font = '14px Chakra Petch, monospace';
    ctx.fillText(isParked ? '✅ MUKAMMAL PARK!' : '🚗 Sekin orqaga...', w / 2, h - 100);

    // Win check
    if (isParked) {
      parkTimer.current += 0.016;
      if (parkTimer.current > 3 && !winRef.current && winConditions) {
        winRef.current = true;
        incrementScore(250);
        if (onWin) onWin(score + 250);
      }
      particles.current.emit(carX, carY, '#00ff88', 2, 50);
    } else {
      parkTimer.current = 0;
    }

    particles.current.update(0.016);
    particles.current.draw(ctx);

    // Vignette + scanlines
    drawVignette(ctx, w, h);
    drawScanlines(ctx, w, h);

    // Proximity beep visualization
    if (dist < 30 && dist > 0) {
      const ringR = 5 + (30 - dist) * 2;
      ctx.strokeStyle = `rgba(239,68,68,${0.3 + 0.3 * Math.sin(t * (30 - dist) * 2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(carX, carY, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [serialData.dist, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
      <div className="absolute top-4 right-4 glass rounded-xl px-4 py-2 text-xs text-dark-400">
	        📡 MAS &lt; 5cm = Joylashdi!<br />
        🔴 &lt;10cm ⚠️ &lt;30cm 🟢 &gt;30cm
      </div>
    </GameCanvas>
  );
}
