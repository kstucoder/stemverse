import { useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas'; import { C, drawGradientBackground, drawVignette, drawScanlines, drawGlassPanel, drawProgressBar, ParticleSystem } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function ObstacleCourse() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const carX = useRef(80);
  const obstacles = useRef([]);
  const speed = useRef(0);
  const winRef = useRef(false);
  const spawnTimer = useRef(0);

  const update = useCallback((dt) => {
    const pot = serialData.pot || 512;
    speed.current = (pot / 1023) * 200 + 50;

    // Button boosts the car forward
    if (serialData.btn === 1) {
      carX.current += 200 * dt;
    }

    // Spawn obstacles
    spawnTimer.current += dt;
    if (spawnTimer.current > 1.5) {
      spawnTimer.current = 0;
      obstacles.current.push({
        x: 800,
        y: 200 + Math.random() * 100,
        w: 20 + Math.random() * 20,
        h: 30 + Math.random() * 30,
        color: ['#ef4444', '#ffdd00', '#ff00e5'][Math.floor(Math.random() * 3)],
      });
    }

    // Move obstacles
    obstacles.current = obstacles.current.filter(o => {
      o.x -= speed.current * dt;
      const dist = Math.hypot(carX.current - o.x, 300 - o.y);
      if (dist < 25) {
        particles.current.emit(carX.current, 300, '#ef4444', 20, 200);
        carX.current = 80;
        obstacles.current = [];
        return false;
      }
      return o.x > -50;
    });

    // Win distance comes from the lesson's own declared win condition, so the
    // sidebar shown to the player always matches what's actually required.
    const targetDist = winConditions?.value ?? 500;
    if (carX.current > targetDist && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(350);
      if (onWin) onWin(score + 350);
    }

    particles.current.update(dt);
  }, [serialData.pot, serialData.btn, score, winConditions, onWin, incrementScore]);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, [C.DARK, C.PANEL, C.DARK]);

    // Ground
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, h * 0.7, w, h * 0.3);

    // Track
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, h * 0.68, w, h * 0.04);
    ctx.setLineDash([20, 15]);
    ctx.strokeStyle = C.GOLD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.lineTo(w, h * 0.7);
    ctx.stroke();
    ctx.setLineDash([]);

    // Car
    const carY = h * 0.65;
    ctx.fillStyle = '#3b82f6';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(carX.current % w - 25, carY - 12, 50, 24, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(carX.current % w - 15, carY - 20, 30, 12, 3);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(carX.current % w - 15, carY + 13, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(carX.current % w + 15, carY + 13, 4, 0, Math.PI * 2);
    ctx.fill();

    // Speed trail
    for (let i = 1; i < 5; i++) {
      ctx.fillStyle = `rgba(59,130,246,${0.1 - i * 0.02})`;
      ctx.beginPath();
      ctx.arc((carX.current - i * 30) % w, carY + 5, 4 - i * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Obstacles
    obstacles.current.forEach(o => {
      ctx.fillStyle = o.color;
      ctx.shadowColor = o.color;
      ctx.shadowBlur = 10;
      const rot = Math.sin(t * 3 + o.x) * 0.1;
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.rotate(rot);
      ctx.fillRect(-o.w / 2, -o.h / 2, o.w, o.h);
      ctx.restore();
      ctx.shadowBlur = 0;
    });

    // Distance counter
    const dist = Math.floor(carX.current);
    drawGlassPanel(ctx, 10, 10, 160, 45, 8);
    ctx.fillStyle = C.WHITE;
    ctx.font = 'bold 20px Chakra Petch, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🏁 ' + dist + 'm', 20, 40);
    ctx.fillStyle = C.MUTED;
    ctx.font = '11px Chakra Petch, monospace';
    ctx.fillText(`Maqsad: ${winConditions?.value ?? 500}m`, 20, 58);

    // Speed indicator
    drawProgressBar(ctx, w / 2 - 100, 15, 200, 8, speed.current / 250, speed.current > 150 ? C.GREEN : C.GOLD);

    // BTN Jump indicator
    ctx.fillStyle = C.MUTED;
    ctx.font = '11px Chakra Petch, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('🏎️ POT: Tezlik  |  🔵 BTN: Kuchaytirish', w - 20, 40);

    particles.current.draw(ctx);

    // Vignette + scanlines
    drawVignette(ctx, w, h);
    drawScanlines(ctx, w, h);
  }, []);

  return (
    <GameCanvas draw={draw} update={update} className="rounded-2xl">
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
    </GameCanvas>
  );
}
