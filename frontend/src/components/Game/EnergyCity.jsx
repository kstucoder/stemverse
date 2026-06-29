// Energy City — Canvas flagship game with particles, night/day, tram, stars
import { useRef, useCallback, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import { drawGradientBackground, drawGlow, ParticleSystem } from './gameHelpers';
import useGameStore from '../../stores/gameStore';
import { playTram, playScore } from './gameAudio';

export default function EnergyCity() {
  const { serialData, cityState, score, incrementScore, addPopup } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const starsRef = useRef(generateStars());
  const buildingsRef = useRef(generateBuildings());
  const tramPos = useRef(0);

  // Auto-score timer
  useEffect(() => {
    const timer = setInterval(() => incrementScore(1), 1000);
    return () => clearInterval(timer);
  }, []);

  function generateStars() {
    return Array.from({ length: 60 }, () => ({
      x: Math.random(), y: Math.random() * 0.5,
      size: 0.5 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function generateBuildings() {
    return Array.from({ length: cityState.totalBuildings || 8 }, (_, i) => ({
      width: 30 + Math.random() * 20,
      height: 60 + Math.sin(i * 1.5) * 40 + Math.random() * 40,
      x: 0,
      windows: Array.from({ length: 4 + Math.floor(Math.random() * 4) }, () => ({
        x: 3 + Math.random() * 8,
        y: 5 + Math.random() * 20,
        w: 4 + Math.random() * 3,
        h: 4 + Math.random() * 3,
      })),
    }));
  }

  const draw = useCallback((ctx, w, h, t) => {
    timeRef.current = t;
    ctx.clearRect(0, 0, w, h);

    const isNight = cityState.isNight;
    const buildings = buildingsRef.current;
    const totalW = buildings.reduce((s, b) => s + b.width + 8, 0);
    const startX = (w - totalW) / 2;

    // Sky
    if (isNight) {
      drawGradientBackground(ctx, w, h, ['#020617', '#0f172a', '#1e293b']);
      // Stars
      starsRef.current.forEach((s) => {
        const twinkle = 0.5 + 0.5 * Math.sin(t * 2 + s.phase);
        ctx.globalAlpha = twinkle * s.brightness;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    } else {
      drawGradientBackground(ctx, w, h, ['#1e1b4b', '#3730a3', '#6366f1', '#818cf8']);
      // Sun
      ctx.fillStyle = '#ffdd00';
      ctx.shadowColor = '#ffdd00';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(w - 80, 70, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Sun rays
      ctx.strokeStyle = 'rgba(255,221,0,0.15)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t;
        ctx.beginPath();
        ctx.moveTo(w - 80 + Math.cos(a) * 35, 70 + Math.sin(a) * 35);
        ctx.lineTo(w - 80 + Math.cos(a) * 55, 70 + Math.sin(a) * 55);
        ctx.stroke();
      }
    }

    // Ground
    const gh = h * 0.2;
    ctx.fillStyle = isNight ? '#0f172a' : '#1e293b';
    ctx.fillRect(0, h - gh, w, gh);
    // Road
    ctx.fillStyle = isNight ? '#1e293b' : '#334155';
    ctx.fillRect(0, h - gh - 20, w, 20);
    // Road lines
    ctx.setLineDash([15, 15]);
    ctx.strokeStyle = 'rgba(255,221,0,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h - gh - 10);
    ctx.lineTo(w, h - gh - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Buildings
    buildings.forEach((b, i) => {
      const bx = startX + buildings.slice(0, i).reduce((s, bb) => s + bb.width + 8, 0);
      const bh = b.height;
      const lit = i < Math.floor(cityState.buildingsLit);

      // Building body
      ctx.fillStyle = lit
        ? `hsl(${40 + i * 5}, 80%, ${40 + Math.sin(t + i) * 10}%)`
        : '#1e293b';
      ctx.fillRect(bx, h - gh - 20 - bh, b.width, bh);

      // Building border
      ctx.strokeStyle = lit ? 'rgba(255,221,0,0.2)' : '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, h - gh - 20 - bh, b.width, bh);

      // Glow when lit
      if (lit) {
        drawGlow(ctx, bx + b.width / 2, h - gh - 20 - bh / 2, 30, 'rgba(255,221,0,0.08)');
        // Windows
        b.windows.forEach((win) => {
          ctx.fillStyle = `rgba(255,221,0,${0.6 + 0.4 * Math.sin(t * 2 + i + win.x)})`;
          ctx.fillRect(bx + win.x, h - gh - 20 - bh + win.y, win.w, win.h);
        });
      }

      // Roof
      ctx.fillStyle = lit ? '#ffdd00' : '#334155';
      ctx.fillRect(bx - 2, h - gh - 20 - bh - 4, b.width + 4, 4);
    });

    // Power lines between buildings
    if (!isNight) {
      ctx.strokeStyle = 'rgba(148,163,184,0.2)';
      ctx.lineWidth = 1;
      buildings.forEach((_, i) => {
        if (i < buildings.length - 1) {
          const x1 = startX + buildings.slice(0, i + 1).reduce((s, b) => s + b.width + 8, 0) - 8;
          const x2 = startX + buildings.slice(0, i + 2).reduce((s, b) => s + b.width + 8, 0) - 8;
          ctx.beginPath();
          ctx.moveTo(x1, h - gh - 20 - buildings[i].height - 15);
          ctx.quadraticCurveTo((x1 + x2) / 2, h - gh - 20 - Math.max(buildings[i].height, buildings[i + 1].height) - 30, x2, h - gh - 20 - buildings[i + 1].height - 15);
          ctx.stroke();
        }
      });
    }

    // Tram on road
    tramPos.current = (tramPos.current + (cityState.tramActive ? 2 : 0.3)) % (w + 100);
    const tx = tramPos.current - 50;
    ctx.fillStyle = cityState.tramActive ? '#00f5ff' : '#475569';
    ctx.shadowColor = cityState.tramActive ? '#00f5ff' : 'transparent';
    ctx.shadowBlur = cityState.tramActive ? 15 : 0;
    ctx.fillRect(tx, h - gh - 12, 40, 12);
    ctx.shadowBlur = 0;
    // Tram windows
    ctx.fillStyle = cityState.tramActive ? '#fff' : '#64748b';
    ctx.fillRect(tx + 5, h - gh - 10, 8, 8);
    ctx.fillRect(tx + 18, h - gh - 10, 8, 8);
    ctx.fillRect(tx + 31, h - gh - 10, 8, 8);
    // Tram line
    if (cityState.tramActive) {
      ctx.fillStyle = 'rgba(0,245,255,0.3)';
      ctx.fillRect(tx + 15, h - gh - 14, 10, 2);
    }

    // Particles for lit city
    if (cityState.buildingsLit > 3 && Math.random() < 0.05) {
      particles.current.emit(Math.random() * w, h - gh - 50, '#ffdd00', 1, -20);
    }
    particles.current.update(0.016);
    particles.current.draw(ctx);

    // HUD
    ctx.fillStyle = 'rgba(15,23,42,0.85)';
    // Score
    ctx.beginPath();
    ctx.roundRect(10, 10, 95, 35, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🏙️ ${score}`, 18, 33);

    // Power
    ctx.beginPath();
    ctx.roundRect(115, 10, 95, 35, 8);
    ctx.fill();
    ctx.fillStyle = cityState.energyLevel > 50 ? '#00ff88' : '#ff6600';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`⚡ ${cityState.energyLevel}%`, 123, 33);

    // Happiness
    ctx.beginPath();
    ctx.roundRect(220, 10, 95, 35, 8);
    ctx.fill();
    ctx.fillStyle = cityState.citizenHappiness > 70 ? '#ff00e5' : '#ef4444';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`😊 ${Math.round(cityState.citizenHappiness)}%`, 228, 33);

    // Progress to win
    const progress = Math.min(cityState.buildingsLit / cityState.totalBuildings, 1);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 80, h - 30, 160, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#ffdd00';
    ctx.shadowColor = '#ffdd00';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 80, h - 30, 160 * progress, 8, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Serial status indicators (bottom-left)
    const indicators = [
      { active: serialData.led === 1, color: '#00ff88', label: 'LED' },
      { active: serialData.button === 1, color: '#00f5ff', label: 'BTN' },
    ];
    indicators.forEach((ind, i) => {
      ctx.fillStyle = ind.active ? ind.color : '#1e293b';
      ctx.shadowColor = ind.active ? ind.color : 'transparent';
      ctx.shadowBlur = ind.active ? 8 : 0;
      ctx.beginPath();
      ctx.arc(20 + i * 40, h - 55, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ind.label, 20 + i * 40, h - 43);
    });

    // POT meter
    const potW = (serialData.potentiometer / 1023) * 60;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(100, h - 58, 60, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#ffdd00';
    ctx.beginPath();
    ctx.roundRect(100, h - 58, potW, 8, 4);
    ctx.fill();

    // Serial data label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`POT: ${serialData.potentiometer || 0}`, 100, h - 63);

    // Combo display
    const combo = useGameStore.getState().combo;
    if (combo > 2) {
      ctx.fillStyle = '#ffdd00';
      ctx.font = `bold ${14 + Math.min(combo, 20)}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`🔥 ${combo}x`, w - 15, 70);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText('COMBO', w - 15, 82);
    }
  }, [cityState, serialData, score, incrementScore, addPopup]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl" />
  );
}
