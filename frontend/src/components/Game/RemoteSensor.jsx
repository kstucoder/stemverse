import { useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas'; import { drawGradientBackground, ParticleSystem } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function RemoteSensor() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const winRef = useRef(false);
  const dataPoints = useRef([]);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, ['#050510', '#0a1a2a', '#050510']);

    // World map background
    ctx.strokeStyle = '#1a2a3a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.35, w * 0.4, h * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.35, w * 0.25, h * 0.12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Continent outlines (simplified)
    ctx.fillStyle = '#1a2a3a';
    ctx.beginPath();
    ctx.ellipse(w * 0.3, h * 0.3, 50, 35, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.28, 40, 30, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.7, h * 0.32, 45, 25, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Data pins on map
    const temp = serialData.temperature || 22;
    const pot = serialData.potentiometer || 512;
    const dist = serialData.distance || 100;

    const pins = [
      { x: w * 0.3, y: h * 0.3, label: '🌡️ ' + Math.round(temp) + '°C', color: '#ef4444', val: temp },
      { x: w * 0.6, y: h * 0.24, label: '📡 ' + Math.round(dist) + 'cm', color: '#00f5ff', val: dist },
      { x: w * 0.75, y: h * 0.35, label: '⚡ ' + Math.round(pot / 10.23) + '%', color: '#ffdd00', val: pot / 10.23 },
    ];

    pins.forEach((pin, i) => {
      ctx.beginPath();
      ctx.moveTo(pin.x, pin.y);
      ctx.lineTo(pin.x + 30, pin.y - 25);
      ctx.strokeStyle = pin.color + '60';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = pin.color;
      ctx.shadowColor = pin.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Pulse ring
      ctx.strokeStyle = pin.color + '30';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, 10 + 5 * Math.sin(t * 2 + i), 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pin.label, pin.x + 30, pin.y - 30);
    });

    // Cloud connection
    ctx.fillStyle = 'rgba(148,163,184,0.1)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.65, 60, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☁️ Firebase', w / 2, h * 0.65 + 7);

    // Connection lines from pins to cloud
    pins.forEach(pin => {
      ctx.strokeStyle = pin.color + '30';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(pin.x, pin.y + 10);
      ctx.lineTo(w / 2, h * 0.65 - 25);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Data particles flowing up
    if (Math.random() < 0.1) {
      particles.current.emit(Math.random() * w, h * 0.65, '#00f5ff', 1, -30);
    }
    particles.current.update(0.016);
    particles.current.draw(ctx);

    // Data log
    ctx.fillStyle = 'rgba(15,23,42,0.85)';
    ctx.beginPath();
    ctx.roundRect(15, h - 85, w - 30, 70, 8);
    ctx.fill();

    ctx.fillStyle = '#00ff88';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    const ts = new Date().toLocaleTimeString();
    ctx.fillText(`[${ts}] 🔥 Firebase: { temp: ${Math.round(temp)}°C, dist: ${Math.round(dist)}cm, power: ${Math.round(pot / 10.23)}% }`, 25, h - 65);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.fillText('📶 ESP32 Connected | 📡 Data sync every 1s | 🌍 Remote monitoring active', 25, h - 42);

    // Win: collect all data types
    if (temp > 20 && dist > 50 && pot > 300 && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(450);
      if (onWin) onWin(score + 450);
    }
  }, [serialData.temperature, serialData.potentiometer, serialData.distance, serialData.button, serialData.led, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      <div className="absolute bottom-4 right-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
    </GameCanvas>
  );
}
