import { useState, useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import { drawGradientBackground, ParticleSystem, drawGlow } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function TempGarden() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const [gardenState, setGardenState] = useState('growing');
  const winRef = useRef(false);
  const growTimer = useRef(0);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const temp = serialData.temperature || 25;
    const isCold = temp < 20;
    const isHot = temp > 30;
    const isPerfect = temp >= 20 && temp <= 30;

    // Sky based on temperature
    if (isCold) drawGradientBackground(ctx, w, h, ['#1a1a3e', '#2d2d5e', '#1a1a3e']);
    else if (isHot) drawGradientBackground(ctx, w, h, ['#4a1a00', '#8a3a00', '#4a1a00']);
    else drawGradientBackground(ctx, w, h, ['#0a2a1a', '#1a4a2a', '#0a2a1a']);

    // Ground
    ctx.fillStyle = isHot ? '#3d2b1f' : isCold ? '#2a2a3a' : '#2d4a2d';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);

    // Plants that grow based on temperature
    const plantCount = 5;
    const growth = Math.max(0, Math.min(1, (25 - Math.abs(temp - 25)) / 10));

    for (let i = 0; i < plantCount; i++) {
      const px = w * (0.1 + i * 0.2);
      const py = h * 0.65;

      if (isPerfect) {
        // Flowering plant
        const stemH = 40 + growth * 60;
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py - stemH);
        ctx.stroke();

        // Leaves
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(px - 8, py - stemH * 0.5, 6, 3, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(px + 8, py - stemH * 0.6, 6, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Flower
        const flowerColor = [`#ff00e5`, `#ffdd00`, `#00f5ff`, `#ff6600`, `#9900ff`][i];
        drawGlow(ctx, px, py - stemH, 10, flowerColor + '40');
        ctx.fillStyle = flowerColor;
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * Math.PI * 2 + t;
          ctx.beginPath();
          ctx.ellipse(px + Math.cos(a) * 6, py - stemH + Math.sin(a) * 6, 4, 4, a, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#ffdd00';
        ctx.beginPath();
        ctx.arc(px, py - stemH, 3, 0, Math.PI * 2);
        ctx.fill();

        // Particles for healthy plants
        if (Math.random() < 0.02) {
          particles.current.emit(px, py - stemH, flowerColor, 2, 20);
        }
      } else if (isHot) {
        // Wilted plant
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px + 5, py - 20, px - 3, py - 30);
        ctx.stroke();
        // Brown leaves
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(px, py - 25, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Heat shimmer
        ctx.fillStyle = `rgba(255,100,0,${0.05 + 0.05 * Math.sin(t * 3)})`;
        ctx.fillRect(px - 15, py - 40, 30, 15);
      } else {
        // Dormant plant
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py - 15);
        ctx.stroke();
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(px, py - 17, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snow particles when cold
        if (Math.random() < 0.1) {
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.beginPath();
          ctx.arc(Math.random() * w, Math.random() * h, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    particles.current.update(0.016);
    particles.current.draw(ctx);

    // Grow timer for win
    growTimer.current += 0.016;
    if (isPerfect) {
      if (growTimer.current > 30 && !winRef.current && winConditions) {
        winRef.current = true;
        incrementScore(175);
        if (onWin) onWin(score + 175);
      }
    } else {
      growTimer.current = Math.max(0, growTimer.current - 0.01);
    }

    // HUD
    ctx.fillStyle = 'rgba(15,23,42,0.8)';
    ctx.fillRect(10, 10, 180, 60);
    ctx.strokeStyle = 'rgba(99,102,241,0.3)';
    ctx.strokeRect(10, 10, 180, 60);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('🌡️ Harorat', 20, 30);
    ctx.fillStyle = isPerfect ? '#4ade80' : isHot ? '#ef4444' : '#60a5fa';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(Math.round(temp) + '°C', 20, 55);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(isPerfect ? "✅ Zo'r!" : isHot ? '🔥 Juda issiq!' : "❄️ Juda sovuq!", 20, 70);
  }, [serialData.temperature, serialData.led, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
      <div className="absolute bottom-4 right-4 glass rounded-xl px-4 py-2 text-xs text-dark-400">
        🌡️ 20-30°C = O'simliklar baxtli!<br />
        🟢 Yashil LED = Zo'r hudud
      </div>
    </GameCanvas>
  );
}
