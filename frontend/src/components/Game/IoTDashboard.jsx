import { useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas'; import { C, drawGradientBackground, drawVignette, drawScanlines, drawGlassPanel } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function IoTDashboard() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const arduinoConnected = useGameStore(s => s.arduinoConnected);
  const winRef = useRef(false);
  const dataLog = useRef([]);
  const targetTimer = useRef(0);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, ['#050510', '#0a0a2a', '#050510']);

    const pot = serialData.pot || 0;
    const btn = serialData.btn || 0;
    const dist = serialData.dist || 0;
    const temp = serialData.temp || 0;

    dataLog.current.push({ pot, btn, dist, temp, time: t });
    if (dataLog.current.length > 100) dataLog.current.shift();

    // Dashboard grid
    const gauges = [
      { label: 'POT', value: pot, max: 1023, unit: '', color: C.CYAN, x: 30, y: 30 },
      { label: 'BTN', value: btn, max: 1, unit: '', color: C.PINK, x: 220, y: 30 },
      { label: 'DIST', value: dist, max: 400, unit: 'cm', color: C.GREEN, x: 30, y: 170 },
      { label: 'TEMP', value: temp, max: 50, unit: '°C', color: C.GOLD, x: 220, y: 170 },
    ];

    gauges.forEach(g => {
      drawGlassPanel(ctx, g.x, g.y, 170, 120, 10);

      ctx.fillStyle = g.color;
      ctx.font = 'bold 36px Chakra Petch, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(g.value + g.unit, g.x + 15, g.y + 45);

      ctx.fillStyle = C.MUTED;
      ctx.font = '10px Chakra Petch, monospace';
      ctx.fillText('📡 ' + g.label, g.x + 15, g.y + 18);

      // Gauge bar
      const pct = g.value / g.max;
      ctx.fillStyle = C.DARK;
      ctx.beginPath();
      ctx.roundRect(g.x + 15, g.y + 65, 140, 8, 4);
      ctx.fill();
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.roundRect(g.x + 15, g.y + 65, 140 * pct, 8, 4);
      ctx.fill();
    });

    // Live chart
    drawGlassPanel(ctx, 30, 310, w - 60, 120, 10);

    ctx.fillStyle = C.MUTED;
    ctx.font = '10px Chakra Petch, monospace';
    ctx.textAlign = 'left';
    ctx.fillText("📈 Jonli Ma'lumot", 45, 332);

    // Draw lines
    const colors = [C.CYAN, C.PINK, C.GREEN, C.GOLD];
    const fields = ['pot', 'btn', 'dist', 'temp'];
    const maxValues = [1023, 1, 400, 50];

    fields.forEach((field, fi) => {
      ctx.strokeStyle = colors[fi];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const data = dataLog.current;
      for (let i = 0; i < data.length; i++) {
        const x = 45 + (i / 100) * (w - 110);
        const y = 390 - (data[i][field] / maxValues[fi]) * 30;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // WiFi indicator
    ctx.fillStyle = arduinoConnected ? C.GREEN : '#ef4444';
    ctx.shadowColor = arduinoConnected ? C.GREEN : '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(w - 40, 20, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = C.WHITE;
    ctx.font = '9px Chakra Petch, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(arduinoConnected ? '📶 ESP8266 Ulangan' : '⚠️ Arduino ulanmagan', w - 55, 23);

    // Firebase indicator
    ctx.fillStyle = 'rgba(255,193,7,0.2)';
    ctx.beginPath();
    ctx.roundRect(w - 160, 35, 140, 20, 5);
    ctx.fill();
    ctx.fillStyle = '#ffc107';
    ctx.font = '9px Chakra Petch, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 Firebase Sinx: FAOLLASHTIRILDI', w - 90, 48);

    // Win: the demo Arduino code only actually transmits POT over serial, so
    // the win condition is driven by what's real — hold the potentiometer
    // above 800 for ~5 seconds (5 "targets", one per second held).
    if (pot > 800) targetTimer.current += 0.016;
    else targetTimer.current = Math.max(0, targetTimer.current - 0.02);
    const targetsHit = Math.min(5, Math.floor(targetTimer.current));
    ctx.fillStyle = C.CYAN;
    ctx.font = '11px Chakra Petch, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`🎯 POT'ni 800+ da ${5}s ushlab turing: ${targetsHit}/5`, w / 2, 300);
    if (arduinoConnected && targetsHit >= 5 && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(400);
      if (onWin) onWin(score + 400);
    }

    // Vignette + scanlines
    drawVignette(ctx, w, h);
    drawScanlines(ctx, w, h);
  }, [serialData.pot, serialData.btn, serialData.dist, serialData.temp, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      {!arduinoConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl z-10">
          <p className="text-white text-xl font-game animate-pulse" style={{ fontFamily: 'Chakra Petch, monospace' }}>🔌 Arduino'ni ulang</p>
        </div>
      )}
      <div className="absolute bottom-4 right-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
    </GameCanvas>
  );
}
