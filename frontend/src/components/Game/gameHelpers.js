// Pure game utility functions — no JSX, no React hooks

export class Particle {
  constructor(x, y, color, velocity, life) {
    this.x = x; this.y = y;
    this.color = color;
    this.vx = velocity.x; this.vy = velocity.y;
    this.life = life; this.maxLife = life;
    this.size = 2 + Math.random() * 3;
  }
  update(dt) {
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.vy += 50 * dt;
    this.life -= dt; this.size *= 0.98;
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
  get dead() { return this.life <= 0 || this.size < 0.3; }
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
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].dead) this.particles.splice(i, 1);
    }
  }
  draw(ctx) { for (const p of this.particles) p.draw(ctx); }
}

export function drawStarField(ctx, w, h, stars, time) {
  for (const s of stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(time + s.phase);
    ctx.globalAlpha = twinkle * s.brightness;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function generateStars(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random(), y: Math.random() * 0.6,
    size: 0.5 + Math.random() * 1.5,
    brightness: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
  }));
}

export function drawGround(ctx, w, h, color1 = '#0f172a', color2 = '#1e293b') {
  const gh = h * 0.25;
  const grad = ctx.createLinearGradient(0, h - gh, 0, h);
  grad.addColorStop(0, color2); grad.addColorStop(1, color1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, h - gh, w, gh);
}

export function drawGradientBackground(ctx, w, h, colors) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

export function drawGlow(ctx, x, y, radius, color) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, color); grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

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

// Standard progress bar
export function drawProgressBar(ctx, x, y, w, h, progress, color = '#00ff88', bgColor = '#1e293b') {
  ctx.fillStyle = bgColor;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  if (progress > 0) {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    roundRect(ctx, x, y, w * Math.min(progress, 1), h, h / 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

export function drawHudBg(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(15,23,42,0.8)';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
}

export function drawWinProgress(ctx, x, y, current, target, label = 'Progress') {
  const progress = target > 0 ? current / target : 0;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y - 5);
  drawProgressBar(ctx, x, y + 2, 120, 8, progress, progress >= 1 ? '#00ff88' : '#6366f1');
  ctx.fillStyle = '#fff';
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.round(progress * 100)}%`, x + 125, y + 8);
}
