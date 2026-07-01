// ⚡ VOLTRA Energy City — Premium Edition
// Arduino LED shaharni yoritadi, tramvay harakatlanadi

import { useRef, useCallback, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import {
  C, ParticleSystem, generateStars, drawStarField,
  drawGradientBackground, drawGround, drawGlow,
  drawGlassPanel, drawNeonStat, drawProgressBar,
  drawVignette, drawScanlines, drawGrid,
} from './gameHelpers';
import useGameStore from '../../stores/gameStore';
import { playTram } from './gameAudio';

export default function EnergyCity() {
  const { serialData, cityState, score, incrementScore, addPopup } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const starsRef = useRef(generateStars(80));
  const buildingsRef = useRef(generateBuildings());
  const tramPos = useRef(0);
  const lastScoreTime = useRef(0);

  // Auto-score
  useEffect(() => {
    const timer = setInterval(() => incrementScore(1), 1000);
    return () => clearInterval(timer);
  }, []);

  function generateBuildings() {
    return Array.from({ length: cityState.totalBuildings || 8 }, (_, i) => ({
      width: 40 + Math.random() * 30,
      height: 80 + Math.sin(i * 1.5) * 50 + Math.random() * 60,
      windows: Array.from({ length: 5 + Math.floor(Math.random() * 6) }, () => ({
        x: 4 + Math.random() * 12,
        y: 8 + Math.random() * 30,
        w: 4 + Math.random() * 4,
        h: 4 + Math.random() * 4,
      })),
      antenna: Math.random() > 0.6,
    }));
  }

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);

    const isNight = cityState.isNight;
    const buildings = buildingsRef.current;
    const totalW = buildings.reduce((s, b) => s + b.width + 10, 0);
    const startX = (w - totalW) / 2;
    const groundY = h * 0.75;

    // === SKY ===
    if (isNight) {
      drawGradientBackground(ctx, w, h, ['#020617', '#070B16', '#0B1120']);
      drawStarField(ctx, w, h, starsRef.current, t);
      // Moon
      drawGlow(ctx, w - 100, 80, 80, 'rgba(0,238,255,0.08)');
      ctx.fillStyle = '#EAF3FF';
      ctx.shadowColor = '#00EEFF';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(w - 100, 80, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      drawGradientBackground(ctx, w, h, ['#0a0a2a', '#1a1050', '#2a1a70', '#4a3080']);
      // Sun with glow
      drawGlow(ctx, w - 100, 80, 100, 'rgba(255,215,0,0.2)');
      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 50;
      ctx.beginPath();
      ctx.arc(w - 100, 80, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // === GRID ===
    drawGrid(ctx, w, h, 50, 0.03);

    // === GROUND + ROAD ===
    drawGround(ctx, w, groundY, C.DARK, C.PANEL);
    ctx.fillStyle = 'rgba(0,238,255,0.04)';
    ctx.fillRect(0, groundY + 15, w, 18);
    // Road dashes
    ctx.setLineDash([20, 20]);
    ctx.strokeStyle = `rgba(255,215,0,0.15)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 24);
    ctx.lineTo(w, groundY + 24);
    ctx.stroke();
    ctx.setLineDash([]);

    // === BUILDINGS ===
    buildings.forEach((b, i) => {
      const bx = startX + buildings.slice(0, i).reduce((s, bb) => s + bb.width + 10, 0);
      const bh = b.height;
      const lit = i < Math.floor(cityState.buildingsLit);

      // Building body with gradient
      const bgrad = ctx.createLinearGradient(0, groundY + 15 - bh, 0, groundY + 15);
      if (lit) {
        bgrad.addColorStop(0, `hsl(${40 + i * 8}, 90%, ${45 + Math.sin(t + i) * 10}%)`);
        bgrad.addColorStop(1, `hsl(${40 + i * 8}, 60%, 25%)`);
      } else {
        bgrad.addColorStop(0, '#1a2440');
        bgrad.addColorStop(1, '#0f172a');
      }
      ctx.fillStyle = bgrad;
      ctx.fillRect(bx, groundY + 15 - bh, b.width, bh);

      // Building border glow
      if (lit) {
        ctx.strokeStyle = `rgba(255,215,0,0.2)`;
        ctx.shadowColor = 'rgba(255,215,0,0.3)';
        ctx.shadowBlur = 6;
      } else {
        ctx.strokeStyle = C.LINE;
        ctx.shadowBlur = 0;
      }
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, groundY + 15 - bh, b.width, bh);
      ctx.shadowBlur = 0;

      // Windows (when lit)
      if (lit) {
        b.windows.forEach((win) => {
          const wx = bx + win.x + win.w / 2;
          const wy = groundY + 15 - bh + win.y + win.h / 2;
          drawGlow(ctx, wx, wy, 8, 'rgba(255,215,0,0.1)');
          ctx.fillStyle = `rgba(255,215,0,${0.5 + 0.5 * Math.sin(t * 3 + i + win.x)})`;
          ctx.fillRect(bx + win.x, groundY + 15 - bh + win.y, win.w, win.h);
        });
      }

      // Antenna
      if (b.antenna) {
        ctx.strokeStyle = lit ? 'rgba(255,215,0,0.3)' : C.MUTED;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx + b.width / 2, groundY + 15 - bh);
        ctx.lineTo(bx + b.width / 2, groundY + 15 - bh - 15);
        ctx.stroke();
        if (lit) {
          ctx.fillStyle = '#FF2D78';
          ctx.shadowColor = '#FF2D78';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(bx + b.width / 2, groundY + 15 - bh - 15, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Roof line glow
      if (lit) {
        ctx.strokeStyle = '#FFD700';
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx, groundY + 15 - bh);
        ctx.lineTo(bx + b.width, groundY + 15 - bh);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // === Power lines ===
    buildings.forEach((_, i) => {
      if (i < buildings.length - 1) {
        const x1 = startX + buildings.slice(0, i + 1).reduce((s, b) => s + b.width + 10, 0) - 5;
        const x2 = startX + buildings.slice(0, i + 2).reduce((s, b) => s + b.width + 10, 0) - 5;
        ctx.strokeStyle = 'rgba(0,238,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, groundY + 15 - buildings[i].height - 10);
        ctx.quadraticCurveTo(
          (x1 + x2) / 2,
          groundY + 15 - Math.max(buildings[i].height, buildings[i + 1].height) - 25,
          x2, groundY + 15 - buildings[i + 1].height - 10
        );
        ctx.stroke();
      }
    });

    // === TRAM ===
    tramPos.current = (tramPos.current + (cityState.tramActive ? 2.5 : 0.3)) % (w + 100);
    const tx = tramPos.current - 50;
    const tramLit = cityState.tramActive;
    
    // Tram body
    ctx.fillStyle = tramLit ? C.CYAN : '#334155';
    ctx.shadowColor = tramLit ? C.CYAN : 'transparent';
    ctx.shadowBlur = tramLit ? 15 : 0;
    const tramY = groundY + 18;
    ctx.fillRect(tx, tramY, 42, 10);
    ctx.shadowBlur = 0;
    // Tram windows
    ctx.fillStyle = tramLit ? C.WHITE : '#475569';
    [6, 19, 32].forEach(ox => {
      ctx.fillRect(tx + ox, tramY + 2, 7, 6);
    });
    // Tram glow trail
    if (tramLit) {
      ctx.fillStyle = 'rgba(0,238,255,0.15)';
      ctx.fillRect(tx + 42, tramY + 2, 20, 6);
    }

    // === PARTICLES (sparks from active buildings) ===
    if (cityState.buildingsLit > 2 && Math.random() < 0.04) {
      const bi = Math.floor(Math.random() * Math.floor(cityState.buildingsLit));
      const bx2 = startX + buildings.slice(0, bi).reduce((s, b) => s + b.width + 10, 0) + buildings[bi].width / 2;
      particles.current.emit(bx2, groundY - buildings[bi].height + 10, '#FFD700', 3, 30);
    }
    particles.current.update(0.016);
    particles.current.draw(ctx);

    // === SCANLINES ===
    drawScanlines(ctx, w, h);

    // === HUD: Stats ===
    drawNeonStat(ctx, '🏙️', score, 'Ball', 16, 16, C.CYAN);
    drawNeonStat(ctx, '⚡', `${cityState.energyLevel}%`, 'Quvvat', 120, 16, C.CYAN);
    drawNeonStat(ctx, '😊', `${Math.round(cityState.citizenHappiness)}%`, 'Baxt', 224, 16, C.PINK);

    // === HUD: Building count indicator ===
    const bx = w - 130;
    drawGlassPanel(ctx, bx, 12, 116, 36, 10);
    ctx.font = 'bold 13px Chakra Petch, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.WHITE;
    ctx.shadowColor = C.CYAN;
    ctx.shadowBlur = 4;
    ctx.fillText(`${cityState.buildingsLit}/${cityState.totalBuildings}`, bx + 58, 30);
    ctx.shadowBlur = 0;
    ctx.font = '8px Chakra Petch, sans-serif';
    ctx.fillStyle = C.MUTED;
    ctx.fillText('BINOLAR', bx + 58, 42);

    // === PROGRESS BAR ===
    const progress = Math.min(cityState.buildingsLit / cityState.totalBuildings, 1);
    drawProgressBar(ctx, w / 2 - 100, h - 38, 200, 10, progress, C.GOLD);
    ctx.font = 'bold 10px Chakra Petch, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.WHITE;
    ctx.shadowColor = C.GOLD;
    ctx.shadowBlur = 3;
    ctx.fillText(`${Math.round(progress * 100)}%`, w / 2, h - 44);
    ctx.shadowBlur = 0;

    // === SERIAL INDICATORS ===
    const inds = [
      { active: serialData.led === 1, color: C.CYAN, label: 'LED', x: 20 },
      { active: serialData.button === 1, color: C.PINK, label: 'BTN', x: 70 },
    ];
    inds.forEach(ind => {
      ctx.fillStyle = ind.active ? ind.color : 'rgba(255,255,255,0.06)';
      ctx.shadowColor = ind.active ? ind.color : 'transparent';
      ctx.shadowBlur = ind.active ? 10 : 0;
      ctx.beginPath();
      ctx.arc(ind.x, h - 60, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = '9px Chakra Petch, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ind.active ? ind.color : C.MUTED;
      ctx.fillText(ind.label, ind.x, h - 45);
    });

    // POT meter
    const potVal = serialData.potentiometer || 0;
    const potPct = potVal / 1023;
    ctx.fillStyle = C.MUTED;
    ctx.font = '9px Chakra Petch, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('POT', 120, h - 45);
    drawProgressBar(ctx, 100, h - 58, 60, 4, potPct, C.GREEN);

    // === VIGNETTE ===
    drawVignette(ctx, w, h);

  }, [cityState, serialData, score]);

  return <GameCanvas draw={draw} className="rounded-xl overflow-hidden" />;
}
