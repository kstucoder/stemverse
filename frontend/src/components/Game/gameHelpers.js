// VOLTRA Premium Game Rendering Toolkit

// ========= COLORS =========
export const C = {
  CYAN:    '#00EEFF',
  PINK:    '#FF2D78',
  GOLD:    '#FFD700',
  GREEN:   '#00FF88',
  ORANGE:  '#FF7A2C',
  PURPLE:  '#9B5DE5',
  WHITE:   '#EAF3FF',
  DARK:    '#04060E',
  PANEL:   '#0B1120',
  GLASS:   'rgba(11,17,32,0.85)',
  MUTED:   '#64748b',
  LINE:    'rgba(0,238,255,0.12)',
  CYAN_GLOW: 'rgba(0,238,255,0.3)',
};

// ========= PARTICLE SYSTEM (ENHANCED) =========
export class Particle {
  constructor(x, y, color, velocity, life) {
    this.x = x; this.y = y; this.color = color;
    this.vx = velocity.x; this.vy = velocity.y;
    this.life = life; this.maxLife = life;
    this.size = 2 + Math.random() * 3;
  }
  update(dt) {
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.vy += 50 * dt; this.life -= dt;
  }
  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
  get dead() { return this.life <= 0; }
}

export class ParticleSystem {
  constructor() { this.particles = []; }
  emit(x, y, color, count = 10, speed = 100) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.3 + Math.random() * 0.7);
      this.particles.push(new Particle(x, y, color,
        { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
        0.5 + Math.random() * 1.5
      ));
    }
  }
  burst(x, y, color, count = 30, speed = 200) {
    this.emit(x, y, color, count, speed);
  }
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].dead) this.particles.splice(i, 1);
    }
  }
  draw(ctx) { for (const p of this.particles) p.draw(ctx); }
}

// ========= STARFIELD =========
export function generateStars(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random(), y: Math.random() * 0.6,
    size: 0.5 + Math.random() * 1.5,
    brightness: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
  }));
}

export function drawStarField(ctx, w, h, stars, time) {
  for (const s of stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(time * 2 + s.phase);
    ctx.globalAlpha = twinkle * s.brightness;
    ctx.fillStyle = '#EAF3FF';
    ctx.shadowColor = '#00EEFF';
    ctx.shadowBlur = twinkle * 4;
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

// ========= BACKGROUND =========
export function drawGradientBackground(ctx, w, h, colors) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// ========= VIGNETTE =========
export function drawVignette(ctx, w, h) {
  const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.4, w / 2, h / 2, w * 0.9);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// ========= SCANLINES =========
export function drawScanlines(ctx, w, h, alpha = 0.03) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
}

// ========= HUD PANELS =========
export function drawGlassPanel(ctx, x, y, w, h, radius = 12, borderColor = C.LINE) {
  // Background
  ctx.fillStyle = C.GLASS;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();
  // Border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, radius);
  ctx.stroke();
  // Top highlight
  const hl = ctx.createLinearGradient(x, y, x, y + h);
  hl.addColorStop(0, 'rgba(255,255,255,0.03)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  roundRect(ctx, x + 1, y + 1, w - 2, h - 2, radius - 1);
  ctx.fill();
}

export function drawPanelTop(ctx, x, y, w, h) {
  ctx.fillStyle = C.GLASS;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
}

// ========= NEON TEXT =========
export function drawNeonStat(ctx, icon, value, label, x, y, glowColor = C.CYAN) {
  // Background panel
  ctx.fillStyle = C.GLASS;
  roundRect(ctx, x - 4, y - 18, 100, 36, 10);
  ctx.fill();
  ctx.strokeStyle = C.LINE;
  ctx.lineWidth = 1;
  roundRect(ctx, x - 4, y - 18, 100, 36, 10);
  ctx.stroke();
  
  // Icon + value
  ctx.font = 'bold 15px Chakra Petch, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = C.WHITE;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 6;
  ctx.fillText(`${icon} ${value}`, x + 4, y);
  ctx.shadowBlur = 0;
  
  // Label
  ctx.font = '9px Chakra Petch, sans-serif';
  ctx.fillStyle = C.MUTED;
  ctx.fillText(label, x + 4, y + 13);
}

// ========= PROGRESS BAR =========
export function drawProgressBar(ctx, x, y, w, h, progress, color = C.CYAN, bgColor = 'rgba(255,255,255,0.05)') {
  // Track
  ctx.fillStyle = bgColor;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  if (progress > 0) {
    const pw = w * Math.min(progress, 1);
    // Glow background
    ctx.fillStyle = `rgba(${hexToRgb(color)}, 0.15)`;
    roundRect(ctx, x, y, pw, h, h / 2);
    ctx.fill();
    // Fill
    const grad = ctx.createLinearGradient(x, y, x + pw, y);
    grad.addColorStop(0, color);
    grad.addColorStop(1, adjustBrightness(color, 1.3));
    ctx.fillStyle = grad;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    roundRect(ctx, x, y, pw, h, h / 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ========= GROUND =========
export function drawGround(ctx, w, h, color1 = C.DARK, color2 = C.PANEL) {
  const gh = h * 0.2;
  const grad = ctx.createLinearGradient(0, h - gh, 0, h);
  grad.addColorStop(0, color2);
  grad.addColorStop(1, color1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, h - gh, w, gh);
  // Ground line glow
  ctx.strokeStyle = C.CYAN;
  ctx.globalAlpha = 0.15;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h - gh);
  ctx.lineTo(w, h - gh);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// ========= GLOW =========
export function drawGlow(ctx, x, y, radius, color) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(0.4, adjustAlpha(color, 0.5));
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// ========= STANDARD HELPERS =========
export function drawWinProgress(ctx, x, y, current, target, label = 'Progress') {
  const progress = target > 0 ? current / target : 0;
  ctx.fillStyle = C.MUTED;
  ctx.font = '10px Chakra Petch, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y - 5);
  drawProgressBar(ctx, x, y + 2, 120, 8, progress, progress >= 1 ? C.GREEN : C.CYAN);
  ctx.fillStyle = C.WHITE;
  ctx.font = 'bold 9px Chakra Petch, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.round(progress * 100)}%`, x + 125, y + 8);
}

// ========= ROUNDED RECT =========
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ========= GRID BACKGROUND =========
export function drawGrid(ctx, w, h, spacing = 40, alpha = 0.04) {
  ctx.strokeStyle = `rgba(0,238,255,${alpha})`;
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
}

// ========= UTILITY =========
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '0,238,255';
}

function adjustBrightness(hex, factor) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return hex;
  const clamp = (v) => Math.min(255, Math.max(0, Math.round(v * factor)));
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(clamp(parseInt(r[1], 16)))}${toHex(clamp(parseInt(r[2], 16)))}${toHex(clamp(parseInt(r[3], 16)))}`;
}

function adjustAlpha(color, alpha) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (!r) return color;
  return `rgba(${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)},${alpha})`;
}
