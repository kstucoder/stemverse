import { useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas'; import { C, drawGradientBackground, drawVignette, drawScanlines, drawGlassPanel, ParticleSystem } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function RemoteSensor() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const winRef = useRef(false);
  const dataPoints = useRef([]);
  const aliveTimer = useRef(0);

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

    // Data pins on map — driven by the two sensors this lesson's Arduino code
    // actually transmits (LM35 temperature + LDR light level).
    const temp = serialData.temp ?? 22;
    const ldr = serialData.ldr ?? 512;
    const lightPct = ldr / 10.23;

    const pins = [
      { x: w * 0.3, y: h * 0.3, label: '🌡️ ' + Math.round(temp) + '°C', color: '#ef4444', val: temp },
      { x: w * 0.6, y: h * 0.24, label: '☀️ ' + Math.round(lightPct) + '%', color: '#ffdd00', val: lightPct },
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
    drawGlassPanel(ctx, 15, h - 85, w - 30, 70, 8);

    ctx.fillStyle = C.GREEN;
    ctx.font = '10px Chakra Petch, monospace';
    ctx.textAlign = 'left';
    const ts = new Date().toLocaleTimeString();
    ctx.fillText(`[${ts}] 🔥 Firebase: { temp: ${Math.round(temp)}°C, light: ${Math.round(lightPct)}% }`, 25, h - 65);
    ctx.fillStyle = C.MUTED;
    ctx.font = '9px Chakra Petch, monospace';
    ctx.fillText('📶 ESP32 Ulangan | 📡 1s sinxronlash | 🌍 Masofaviy kuzatuv faol', 25, h - 42);

    // Win: keep both real sensors reporting healthy values for the lesson's
    // declared duration (time_alive, in ms) — matches the sidebar shown to
    // the player instead of an instant, disconnected threshold check.
    if (temp > 20 && lightPct > 30) aliveTimer.current += 0.016;
    else aliveTimer.current = Math.max(0, aliveTimer.current - 0.02);
    const neededSec = (winConditions?.value ?? 60000) / 1000;
    if (aliveTimer.current > neededSec && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(450);
      if (onWin) onWin(score + 450);
    }

    // Vignette + scanlines
    drawVignette(ctx, w, h);
    drawScanlines(ctx, w, h);
  }, [serialData.temp, serialData.ldr, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      <div className="absolute bottom-4 right-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
    </GameCanvas>
  );
}
