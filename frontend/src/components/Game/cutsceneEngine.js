// ===== CUTSCENE ENGINE — Shared premium cutscene framework =====
// All 20 games use this engine for their animated intros

export class SceneParticle {
  constructor(x, y, vx, vy, color, size, life) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.color = color; this.size = size; this.life = life; this.maxLife = life;
  }
  update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; this.vy += 20 * dt; this.life -= dt; }
  draw(ctx) {
    const a = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = a; ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size * a, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  get dead() { return this.life <= 0; }
}

export class SceneParticleSystem {
  constructor() { this.p = []; }
  emit(x, y, color, count = 5, speed = 50, size = 3) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, s = speed * (0.3 + Math.random() * 0.7);
      this.p.push(new SceneParticle(x, y, Math.cos(a) * s, Math.sin(a) * s - 30, color, size * (0.5 + Math.random()), 0.5 + Math.random()));
    }
  }
  update(dt) { for (let i = this.p.length - 1; i >= 0; i--) { this.p[i].update(dt); if (this.p[i].dead) this.p.splice(i, 1); } }
  draw(ctx) { for (const p of this.p) p.draw(ctx); }
}

// Camera shake
export function updateShake(intensity, dt) {
  const decay = Math.max(0, intensity - dt * 3);
  return {
    intensity: decay,
    x: (Math.random() - 0.5) * decay * 12,
    y: (Math.random() - 0.5) * decay * 8,
  };
}

// Lightning bolt (recursive)
export function drawLightning(ctx, x1, y1, x2, y2, intensity, displace, detail) {
  if (detail < 1) {
    ctx.strokeStyle = `rgba(255,255,255,${intensity})`;
    ctx.lineWidth = 1 + intensity * 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    return;
  }
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * displace;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * displace;
  drawLightning(ctx, x1, y1, mx, my, intensity, displace * 0.6, detail - 1);
  drawLightning(ctx, mx, my, x2, y2, intensity, displace * 0.6, detail - 1);
  if (detail === 3 && Math.random() > 0.5) {
    ctx.strokeStyle = `rgba(200,200,255,${intensity * 0.35})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo((x1 + mx) / 2, (y1 + my) / 2 + 20);
    ctx.lineTo((x1 + mx) / 2 + (Math.random() - 0.5) * displace * 0.8, (y1 + my) / 2 + displace * 0.8);
    ctx.stroke();
  }
}

// Stars
export function drawStars(ctx, w, h, count, time, brightness = 0.4) {
  for (let i = 0; i < count; i++) {
    const sx = (i * 137 + 50) % w, sy = (i * 73 + 20) % (h * 0.5);
    const b = 0.3 + 0.7 * Math.sin(time * 0.5 + i);
    ctx.fillStyle = `rgba(255,255,255,${b * brightness})`;
    ctx.beginPath(); ctx.arc(sx, sy, 0.5 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
  }
}

// Fog
export function drawFog(ctx, w, h, y, alpha = 0.05) {
  const fog = ctx.createRadialGradient(w / 2, y, 0, w / 2, y, h * 0.4);
  fog.addColorStop(0, `rgba(148,163,184,${alpha})`);
  fog.addColorStop(1, 'transparent');
  ctx.fillStyle = fog; ctx.fillRect(0, 0, w, h);
}

// Vignette
export function drawVignette(ctx, w, h, darkness = 0.3) {
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.7);
  v.addColorStop(0, 'transparent'); v.addColorStop(1, `rgba(0,0,0,${darkness})`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}

// Letterbox
export function drawLetterbox(ctx, w, h, size = 0.06) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h * size);
  ctx.fillRect(0, h - h * size, w, h * size);
}

// Text helper
export function drawSceneText(ctx, text, x, y, color = '#fff', size = '16px', align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `bold ${size} sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

// Gradient sky
export function drawSky(ctx, w, h, colors) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

// Ground
export function drawGround(ctx, w, h, groundY, topColor = '#0f172a', bottomColor = '#020617') {
  const g = ctx.createLinearGradient(0, groundY, 0, h);
  g.addColorStop(0, topColor); g.addColorStop(1, bottomColor);
  ctx.fillStyle = g; ctx.fillRect(0, groundY, w, h - groundY);
}

// Buildings scene
export function drawBuildings(ctx, w, h, groundY, buildings, time, isLit = true) {
  const tw = buildings.reduce((s, b) => s + b.w + 6, 0);
  const sx = Math.max(10, (w - tw) / 2);
  buildings.forEach((b, i) => {
    const bx = sx + buildings.slice(0, i).reduce((s, bb) => s + bb.w + 6, 0);
    const by = groundY - b.h;
    const bg = ctx.createLinearGradient(bx, by, bx + b.w, by);
    bg.addColorStop(0, `hsl(220,8%,${isLit ? 30 : 15}%)`);
    bg.addColorStop(0.5, isLit ? '#2a2a3a' : '#15151a');
    bg.addColorStop(1, `hsl(220,5%,${isLit ? 22 : 12}%)`);
    ctx.fillStyle = bg; ctx.fillRect(bx, by, b.w, b.h);
    ctx.strokeStyle = `rgba(255,255,255,${isLit ? 0.03 : 0.01})`;
    ctx.strokeRect(bx, by, b.w, b.h);
    // Windows
    (b.windows || []).forEach((win, wi) => {
      const wl = isLit && win.lit;
      if (wl) {
        ctx.fillStyle = `rgba(255,221,0,${0.5 + 0.5 * Math.sin(time + i + wi)})`;
        ctx.fillRect(bx + win.x, by + win.y, 6, 4);
      } else {
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(bx + win.x, by + win.y, 6, 4);
      }
    });
    ctx.fillStyle = isLit ? '#1e2a3a' : '#0a0a0f';
    ctx.fillRect(bx - 2, by - 3, b.w + 4, 3);
  });
}

export function generateBuildings(count, maxW, maxH) {
  return Array.from({ length: count }, (_, i) => {
    const bw = 20 + Math.random() * (maxW || 25);
    const bh = 40 + Math.sin(i * 1.7) * 35 + Math.random() * 45;
    const wc = Math.floor(bw / 12);
    const wr = Math.floor(bh / 12);
    return {
      w: bw, h: bh,
      windows: Array.from({ length: Math.min(wc * wr, 20) }, () => ({
        x: 4 + (Math.floor(Math.random() * wc)) * 12,
        y: 6 + (Math.floor(Math.random() * wr)) * 12,
        lit: Math.random() > 0.3,
      })),
    };
  });
}

// Audio
export function playThunderSound(ctx) {
  try {
    const osc = ctx.createOscillator(); const gain = ctx.createGain(); const filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 2);
    gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(150, ctx.currentTime); filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 2);
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 2.5);
  } catch (e) {}
}

export function playAlarmSound(ctx) {
  try {
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'square'; osc.frequency.setValueAtTime(800 + i * 100, ctx.currentTime + i * 0.3);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.3); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.3); osc.stop(ctx.currentTime + i * 0.3 + 0.2);
    }
  } catch (e) {}
}

export function playExplosionSound(ctx) {
  try {
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

export function playPowerUpSound(ctx) {
  try {
    [400, 500, 600, 800, 1000].forEach((f, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08); osc.stop(ctx.currentTime + i * 0.08 + 0.1);
    });
  } catch (e) {}
}

export function playWhooshSound(ctx) {
  try {
    const osc = ctx.createOscillator(); const gain = ctx.createGain(); const filter = ctx.createBiquadFilter();
    osc.type = 'sine'; osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.06, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    filter.type = 'bandpass'; filter.frequency.value = 500; filter.Q.value = 2;
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

// Road
export function drawRoad(ctx, w, y) {
  ctx.fillStyle = '#1a1a2a'; ctx.fillRect(0, y, w, 18);
  ctx.setLineDash([12, 16]); ctx.strokeStyle = 'rgba(255,221,0,0.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, y + 9); ctx.lineTo(w, y + 9); ctx.stroke();
  ctx.setLineDash([]);
}

// Trees
export function drawTrees(ctx, w, h, groundY, count, time) {
  for (let i = 0; i < count; i++) {
    const tx = (i * (w / count) + 20) % w;
    const th = 40 + Math.sin(i * 2.3) * 15;
    // Trunk
    ctx.fillStyle = '#2d1a0e'; ctx.fillRect(tx - 2, groundY - th, 4, th);
    // Crown
    ctx.fillStyle = `hsl(140,30%,${20 + Math.sin(time + i) * 5}%)`;
    ctx.beginPath(); ctx.arc(tx, groundY - th - 10, 20 + Math.sin(i) * 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(tx - 10, groundY - th + 5, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(tx + 10, groundY - th + 5, 15, 0, Math.PI * 2); ctx.fill();
  }
}

// Rain
export function drawRain(ctx, w, h, drops, dt) {
  ctx.strokeStyle = 'rgba(148,163,184,0.2)'; ctx.lineWidth = 1;
  drops.forEach(d => {
    d.x -= d.speed * dt * 0.3; d.y += d.speed * dt;
    if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
    if (d.x < -10) d.x = w + 10;
    ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 1, d.y + d.len); ctx.stroke();
  });
}

export function generateRain(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 900, y: Math.random() * 500,
    speed: 200 + Math.random() * 400, len: 6 + Math.random() * 10,
  }));
}

// Clouds
export function drawCloudLayer(ctx, w, clouds, dt) {
  clouds.forEach(c => {
    c.x += c.speed * dt * 0.5;
    if (c.x > w + c.w) c.x = -c.w * 2;
    ctx.fillStyle = `rgba(148,163,184,${c.alpha})`;
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w * 0.45, c.h * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x + c.w * 0.3, c.y - c.h * 0.15, c.w * 0.3, c.h * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  });
}

export function generateClouds(layers) {
  return Array.from({ length: layers }, (_, li) => ({
    x: Math.random() * 300, y: 20 + li * 30 + Math.random() * 10,
    w: 80 + Math.random() * 60 + li * 30, h: 15 + Math.random() * 10 + li * 5,
    speed: 10 + Math.random() * 8 - li * 3, alpha: 0.06 + li * 0.05,
  }));
}
