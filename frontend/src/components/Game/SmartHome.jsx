import { useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas'; import { drawGradientBackground, ParticleSystem } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function SmartHome() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const winRef = useRef(false);
  const devices = useRef({
    lights: false, ac: false, door: false, alarm: false
  });

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, ['#0a0a1a', '#1a1a2a', '#0a0a1a']);

    const btn = serialData.button || 0;
    const pot = serialData.potentiometer || 512;
    const temp = serialData.temperature || 22;
    const dist = serialData.distance || 100;

    // House floor plan
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.1, h * 0.05, w * 0.8, h * 0.55);

    // Roof
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.05);
    ctx.lineTo(w * 0.5, h * 0.02);
    ctx.lineTo(w * 0.95, h * 0.05);
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    // Rooms
    const rooms = [
      { x: w * 0.12, y: h * 0.1, w: w * 0.25, h: h * 0.22, name: 'Living Room', icon: '🛋️' },
      { x: w * 0.4, y: h * 0.1, w: w * 0.25, h: h * 0.22, name: 'Kitchen', icon: '🍳' },
      { x: w * 0.68, y: h * 0.1, w: w * 0.22, h: h * 0.22, name: 'Bedroom', icon: '🛏️' },
      { x: w * 0.12, y: h * 0.35, w: w * 0.35, h: h * 0.23, name: 'Garage', icon: '🚗' },
      { x: w * 0.5, y: h * 0.35, w: w * 0.4, h: h * 0.23, name: 'Office', icon: '💻' },
    ];

    rooms.forEach(room => {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(room.x, room.y, room.w, room.h, 4);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(room.x, room.y, room.w, room.h, 4);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(room.icon, room.x + room.w / 2, room.y + room.h / 2 + 5);
      ctx.font = '9px sans-serif';
      ctx.fillText(room.name, room.x + room.w / 2, room.y + room.h / 2 + 25);
    });

    // Device controls
    const toggleLight = btn === 1;
    const acTemp = Math.round((pot / 1023) * 10 + 18);

    devices.current.lights = toggleLight;
    devices.current.ac = temp > 25;
    devices.current.door = dist < 20;

    // Status indicators
    const status = [
      { label: '💡 Chiroqlar', active: devices.current.lights, x: w * 0.12, y: h * 0.65 },
      { label: '❄️ Konditsioner ' + acTemp + '°C', active: devices.current.ac, x: w * 0.35, y: h * 0.65 },
      { label: '🚪 Eshik', active: devices.current.door, x: w * 0.58, y: h * 0.65 },
      { label: '🔔 Signal', active: temp > 28 || dist < 10, x: w * 0.78, y: h * 0.65 },
    ];

    status.forEach((s, i) => {
      ctx.fillStyle = s.active ? '#00ff88' : '#1e293b';
      ctx.shadowColor = s.active ? '#00ff88' : 'transparent';
      ctx.shadowBlur = s.active ? 10 : 0;
      ctx.beginPath();
      ctx.roundRect(s.x, s.y, 80, 28, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = s.active ? '#0a0a1a' : '#64748b';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, s.x + 40, s.y + 18);
    });

    // Energy meter
    const energy = (devices.current.lights ? 30 : 0) + (devices.current.ac ? 50 : 0) + (devices.current.door ? 10 : 0);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(w * 0.12, h * 0.75, w * 0.76, 18, 9);
    ctx.fill();
    ctx.fillStyle = energy > 60 ? '#ef4444' : energy > 30 ? '#ffdd00' : '#00ff88';
    ctx.beginPath();
    ctx.roundRect(w * 0.12, h * 0.75, w * 0.76 * (energy / 100), 18, 9);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ Energiya: ' + energy + '%', w / 2, h * 0.77 + 12);

    // Firebase connection
    ctx.fillStyle = 'rgba(255,193,7,0.15)';
    ctx.beginPath();
    ctx.roundRect(w * 0.12, h * 0.85, w * 0.76, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#ffc107';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 ESP32 + Firebase — Aqlli Uy Boshqaruvi | Real-time bulut sinxronlash', w / 2, h * 0.85 + 15);

    // Particles
    if (devices.current.lights) particles.current.emit(w * 0.5, h * 0.5, '#ffdd00', 1, 20);
    particles.current.update(0.016);
    particles.current.draw(ctx);

    // Win: manage energy efficiently
    if (energy > 20 && energy < 60 && temp < 28 && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(500);
      if (onWin) onWin(score + 500);
    }
  }, [serialData.button, serialData.potentiometer, serialData.temperature, serialData.distance, serialData.led, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      <div className="absolute bottom-4 right-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
    </GameCanvas>
  );
}
