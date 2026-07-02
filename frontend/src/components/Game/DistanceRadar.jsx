import { useState, useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import { C, drawGradientBackground, drawGlassPanel, drawVignette, drawScanlines, ParticleSystem, drawGlow } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function DistanceRadar() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const arduinoConnected = useGameStore(s => s.arduinoConnected);
  const particles = useRef(new ParticleSystem());
  const angle = useRef(0);
  const detected = useRef(new Set());
  const targets = useRef(
    Array.from({ length: 5 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 80 + Math.random() * 150,
      found: false,
      size: 8 + Math.random() * 5,
    }))
  );
  const winRef = useRef(false);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, ['#001a1a', '#003030', '#001a1a']);

    const cx = w / 2, cy = h / 2;
    const maxR = Math.min(w, h) * 0.35;
    const dist = serialData.dist ?? 200;
    const distNorm = Math.min(dist / 400, 1);

    // Radar circles
    for (let i = 1; i <= 4; i++) {
      ctx.strokeStyle = `rgba(0,245,255,${0.1 + i * 0.05})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * (i / 4), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Sweep line
    angle.current += 0.02;
    const sweepAngle = angle.current;
    ctx.strokeStyle = 'rgba(0,245,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
    ctx.stroke();

    // Sweep glow
    const grad = ctx.createConicGradient(sweepAngle, cx, cy);
    grad.addColorStop(0, 'rgba(0,245,255,0.15)');
    grad.addColorStop(0.05, 'rgba(0,245,255,0.05)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxR, sweepAngle - 0.3, sweepAngle);
    ctx.closePath();
    ctx.fill();

    // Targets
    targets.current.forEach((target) => {
      const tx = cx + Math.cos(target.angle) * target.dist * (maxR / 250);
      const ty = cy + Math.sin(target.angle) * target.dist * (maxR / 250);

      // Check if sweep hits target
      const angleDiff = Math.abs(sweepAngle - target.angle) % (Math.PI * 2);
      if (angleDiff < 0.05 && !target.found && Math.abs(dist - target.dist) < 30) {
        target.found = true;
        detected.current.add(target);
        incrementScore(50);
        particles.current.emit(tx, ty, '#00ff88', 20, 150);
      }

      if (target.found) {
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(tx, ty, target.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(t * 2 + target.angle)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(tx, ty, target.size, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Distance indicator
    const blipDist = Math.min(dist / 400, 1);
    const blipX = cx + Math.cos(sweepAngle) * maxR * blipDist;
    const blipY = cy + Math.sin(sweepAngle) * maxR * blipDist;
    drawGlow(ctx, blipX, blipY, 15, 'rgba(255,255,0,0.3)');
    ctx.fillStyle = '#ffdd00';
    ctx.shadowColor = '#ffdd00';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(blipX, blipY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    particles.current.update(0.016);
    particles.current.draw(ctx);

    // Win
    if (arduinoConnected && detected.current.size >= 5 && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(50);
      if (onWin) onWin(score + 50);
    }

    // HUD
    drawGlassPanel(ctx, 10, 10, 160, 55, 10);
    ctx.fillStyle = C.MUTED;
    ctx.font = '11px Chakra Petch, monospace';
    ctx.fillText('📡 Masofa', 20, 30);
    ctx.fillStyle = C.CYAN;
    ctx.font = 'bold 20px Chakra Petch, monospace';
    ctx.fillText(dist + 'cm', 20, 55);
    ctx.fillStyle = C.GOLD;
    ctx.font = '11px Chakra Petch, monospace';
    ctx.fillText('🎯 ' + detected.current.size + '/5 topildi', 20, 72);

    // Vignette + scanlines
    drawVignette(ctx, w, h);
    drawScanlines(ctx, w, h);
  }, [serialData.dist, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      {!arduinoConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl z-10">
          <p className="text-white text-xl font-game animate-pulse" style={{ fontFamily: 'Chakra Petch, monospace' }}>🔌 Arduino'ni ulang</p>
        </div>
      )}
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
    </GameCanvas>
  );
}
