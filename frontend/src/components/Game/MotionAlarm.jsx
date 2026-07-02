import { useRef, useCallback, useEffect } from 'react';
import GameCanvas from './GameCanvas'; import { C, drawGradientBackground, drawVignette, drawScanlines, drawProgressBar, ParticleSystem } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function MotionAlarm() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const intruders = useRef(0); // counts discrete PIR trigger EVENTS, not frames
  const motionPrevRef = useRef(0);
  const winRef = useRef(false);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const motion = serialData.pir || 0;
    const isAlarm = motion === 1;
    if (motion === 1 && motionPrevRef.current === 0) intruders.current++;
    motionPrevRef.current = motion;

    drawGradientBackground(ctx, w, h, isAlarm ? ['#2a0000', '#1a0000', '#0a0000'] : ['#0a0a1a', '#1a1a2a', '#0a0a1a']);

    // Building floor plan
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, w - 60, h - 100);

    // Rooms
    const rooms = [
      { x: 40, y: 40, w: (w - 80) / 3, h: (h - 120) / 2, name: 'Lobby', color: '#3b82f6' },
      { x: 40 + (w - 80) / 3, y: 40, w: (w - 80) / 3, h: (h - 120) / 2, name: 'Lab', color: '#22c55e' },
      { x: 40 + 2 * (w - 80) / 3, y: 40, w: (w - 80) / 3, h: (h - 120) / 2, name: 'Server', color: '#f97316' },
      { x: 40, y: 50 + (h - 120) / 2, w: (w - 80) / 3, h: (h - 120) / 2, name: 'Office', color: '#8b5cf6' },
      { x: 40 + (w - 80) / 3, y: 50 + (h - 120) / 2, w: (w - 80) / 3, h: (h - 120) / 2, name: 'Storage', color: '#ec4899' },
      { x: 40 + 2 * (w - 80) / 3, y: 50 + (h - 120) / 2, w: (w - 80) / 3, h: (h - 120) / 2, name: 'Vault', color: '#ef4444' },
    ];

    rooms.forEach((room, i) => {
      ctx.fillStyle = isAlarm ? `${room.color}15` : `${room.color}08`;
      ctx.fillRect(room.x, room.y, room.w, room.h);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(room.x, room.y, room.w, room.h);

      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.font = '11px sans-serif';
      ctx.fillText(room.name, room.x + room.w / 2, room.y + room.h / 2);

      if (isAlarm && i === Math.floor(t / 2) % 6) {
        ctx.fillStyle = `rgba(239,68,68,${0.1 + 0.1 * Math.sin(t * 5)})`;
        ctx.fillRect(room.x, room.y, room.w, room.h);
        ctx.fillStyle = '#ef4444';
        ctx.font = '20px sans-serif';
        ctx.fillText('⚠️', room.x + room.w / 2, room.y + room.h / 2 + 20);
      }
    });

    // Motion detected flash
    if (isAlarm) {
      ctx.fillStyle = `rgba(239,68,68,${0.05 + 0.05 * Math.sin(t * 10)})`;
      ctx.fillRect(0, 0, w, h);

      particles.current.emit(Math.random() * w, Math.random() * h, '#ef4444', 3, 100);
    }

    // Win: detect 10 separate intrusion events (matches the lesson's real
    // requirement and the hint text below).
    if (intruders.current >= 10 && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(300);
      if (onWin) onWin(score + 300);
    }

    // Status bar
    drawGlassPanel(ctx, 10, h - 55, 160, 40, 8);
    ctx.fillStyle = isAlarm ? '#ef4444' : C.GREEN;
    ctx.font = 'bold 14px Chakra Petch, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(isAlarm ? '🚨 SIGNAL!' : '🟢 XAVFSIZ', 20, h - 32);
    ctx.fillStyle = C.MUTED;
    ctx.font = '11px Chakra Petch, monospace';
    ctx.fillText('Aniqlangan: ' + Math.min(intruders.current, 10) + '/10', 20, h - 15);

    // Progress
    drawProgressBar(ctx, w - 210, h - 45, 200, 15, Math.min(intruders.current / 10, 1), '#ef4444');
    ctx.fillStyle = C.WHITE;
    ctx.font = '10px Chakra Petch, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.min(intruders.current, 10) + '/10', w - 110, h - 34);

    particles.current.update(0.016);
    particles.current.draw(ctx);

    // Vignette + scanlines
    drawVignette(ctx, w, h);
    drawScanlines(ctx, w, h);
  }, [serialData.pir, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
      <div className="absolute top-4 right-4 glass rounded-xl px-4 py-2 text-xs text-dark-400">
	        🔴 PIR harakat → Signal!<br />
	        Yutish uchun 10 ta bosqinni aniqlang
      </div>
    </GameCanvas>
  );
}
