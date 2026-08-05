// stationScene — VOLTRA "Sirt Sensor Stansiyasi" — ESP32 + DHT22 (yangi element: NAMLIK sensori).
// Realistik ASTEROID SIRTI: quyosh panelli avtonom sensor mayoq bazadan uzoqda joylashtirilgan.
// 4 asbob: HARORAT, NAMLIK (DHT22 — yangi), YORUG'LIK (LDR), MASOFA. Stansiya bitta o'lchov uchun
// TARGET so'raydi — real sensorni sozlab (DHT'ga puf, LDR'ni yop, qo'l silt) qiymatni oynaga
// moslab ushlab tur -> namuna yig'iladi va bazaga relay qilinadi. 6 namuna -> profil to'liq.
// Saga davomi: uplink o'rnatilgach (18), asteroid muhitini o'lchash uchun sensor mayoq joylaymiz.
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const HZ = 300, TARGET = 6, HOLD = 1.0;
const GX = [250, 410, 570, 730], GY = 330, GH = 118;   // 4 asbob (gauge) x-lari
const LABELS = ['HARORAT', 'NAMLIK', "YORUG'LIK", 'MASOFA'];
const COLS = [0xff9a3c, 0x00e5ff, 0xffd23a, 0x39ff88];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);

function radialVignette(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.36, size / 2, size / 2, size * 0.64);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(6,3,2,0.9)'); c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}

export function assembleStation(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.55, bloomScale: 1.0, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#060510', '#0c0a1a', '#120b18', '#1a0f14'])); skyC.addChild(sky);
  const root = new Container(); app.stage.addChild(root);

  // KOSMOS: yulduzlar + Yer + uzoq baza
  const stars = new Graphics();
  for (let i = 0; i < 150; i++) stars.circle(rnd(0, LW), rnd(0, HZ - 20), rnd(0.3, 1.1)).fill({ color: 0xdfe6ff, alpha: rnd(0.2, 0.7) });
  root.addChild(stars);
  const earthGlow = new Sprite(radialTexture('rgba(70,130,255,0.45)', 256)); earthGlow.anchor.set(0.5); earthGlow.x = 830; earthGlow.y = 80; earthGlow.width = earthGlow.height = 220; earthGlow.blendMode = 'add'; root.addChild(earthGlow);
  const earth = new Graphics();
  earth.circle(830, 80, 46).fill(0x163e70); earth.ellipse(818, 72, 20, 10).fill({ color: 0x2f8f6a, alpha: 0.65 }); earth.arc(830, 80, 46, -1.2, 1.0).stroke({ width: 3, color: 0x7ac0ff, alpha: 0.5 });
  root.addChild(earth);
  // uzoq baza silueti (ufqda)
  const baseSil = new Graphics();
  baseSil.rect(70, HZ - 40, 60, 40).fill(0x0f1a22); baseSil.rect(120, HZ - 58, 26, 58).fill(0x0f1a22);
  baseSil.moveTo(90, HZ - 40).lineTo(90, HZ - 62).stroke({ width: 1.5, color: 0x1c2c38 }); baseSil.circle(90, HZ - 64, 2).fill(0xff5a3a);
  baseSil.ellipse(150, HZ - 40, 16, 8).fill(0x0f1a22);
  root.addChild(baseSil);
  const baseGlow = new Sprite(radialTexture('rgba(57,255,136,0.4)', 256)); baseGlow.anchor.set(0.5); baseGlow.x = 110; baseGlow.y = HZ - 40; baseGlow.width = 180; baseGlow.height = 90; baseGlow.blendMode = 'add'; baseGlow.alpha = 0.12; root.addChild(baseGlow);

  // ASTEROID SIRTI (regolit)
  const ground = new Graphics();
  ground.moveTo(0, HZ);
  for (let x = 0; x <= LW; x += 30) ground.lineTo(x, HZ - Math.sin(x * 0.03) * 8 - rnd(0, 7));
  ground.lineTo(LW, LH).lineTo(0, LH).fill(0x140d0a);
  ground.rect(0, HZ - 3, LW, 3).fill({ color: 0x3a2a1a, alpha: 0.5 });
  for (let i = 0; i < 30; i++) { const rx = rnd(0, LW), ry = rnd(HZ + 10, LH - 20); ground.ellipse(rx, ry, rnd(4, 14), rnd(2, 6)).fill({ color: 0x1c130e, alpha: 0.8 }); }
  root.addChild(ground);
  // chang zarralari
  const dust = [];
  for (let i = 0; i < 5; i++) { const d = new Sprite(radialTexture('rgba(120,90,70,0.14)', 256)); d.anchor.set(0.5); d.width = rnd(200, 380); d.height = rnd(50, 90); d.x = rnd(0, LW); d.y = rnd(HZ, LH - 30); d.blendMode = 'add'; root.addChild(d); dust.push({ s: d, sp: rnd(6, 16) }); }

  // ===== SENSOR STANSIYASI =====
  const st = new Graphics();
  // tripod oyoqlar
  st.moveTo(500, HZ - 4).lineTo(470, HZ + 60).moveTo(500, HZ - 4).lineTo(530, HZ + 60).moveTo(500, HZ - 4).lineTo(500, HZ + 62).stroke({ width: 4, color: 0x2a3038 });
  st.moveTo(500, HZ - 4).lineTo(500, 150).stroke({ width: 5, color: 0x2e3742 });   // mast
  // instrument box
  st.roundRect(468, 150, 64, 44, 5).fill(0x18202a).stroke({ width: 2, color: 0x3a4a58 });
  st.rect(474, 156, 52, 8, 1).fill(0x0c1a14);
  root.addChild(st);
  // quyosh paneli (qiya)
  const panel = new Graphics();
  panel.poly([500, 138, 588, 116, 604, 128, 516, 150]).fill(0x0e2a52).stroke({ width: 1.5, color: 0x2e6ab0 });
  for (let i = 0; i < 5; i++) { const k = i / 5; panel.moveTo(lerp(500, 588, k) + 8, lerp(138, 116, k)).lineTo(lerp(516, 604, k) + 8, lerp(150, 128, k)).stroke({ width: 0.8, color: 0x1a4a8a }); }
  root.addChild(panel);
  const stLed = new Graphics().circle(500, 150, 3).fill(0x39ff88); stLed.blendMode = 'add'; root.addChild(stLed);
  // relay nur (stansiyadan bazaga)
  const relay = new Graphics(); relay.blendMode = 'add'; root.addChild(relay);

  // ===== 4 ASBOB (gauge) PANELI =====
  const panelBg = new Graphics();
  panelBg.roundRect(210, GY - 26, 580, GH + 70, 10).fill({ color: 0x0a0f14, alpha: 0.82 }).stroke({ width: 1.5, color: 0x243441 });
  root.addChild(panelBg);
  const gaugeG = new Graphics(); root.addChild(gaugeG);        // dinamik (o'qishlar + target)
  const glowSprites = GX.map((gx) => { const s = new Sprite(radialTexture('rgba(0,229,255,0.8)', 128)); s.anchor.set(0.5); s.x = gx; s.y = GY + GH / 2; s.width = s.height = 60; s.blendMode = 'add'; s.alpha = 0; root.addChild(s); return s; });
  const particles = makeParticles(root);

  const vign = new Sprite(radialVignette()); vign.alpha = 0.62; app.stage.addChild(vign);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffffff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  const scene = {
    app, sky, root, stars, dust, stLed, relay, panelBg, gaugeG, glowSprites, particles, vign, flash,
    samples: 0, activeIdx: 1, targetC: 0.6, tol: 0.12, lockProgress: 0, inBand: false, won: false,
    readings: [0.5, 0.5, 0.5, 0.5], lastReset: 0, flashT: 0, demoT: 0, relayT: 0,
    newRequest() { this.activeIdx = Math.floor(Math.random() * 4); this.tol = clamp(0.13 - this.samples * 0.008, 0.07, 0.13); let c; do { c = rnd(0.28, 0.82); } while (Math.abs(c - this.readings[this.activeIdx]) < 0.2); this.targetC = c; this.lockProgress = 0; },
    reset() { this.samples = 0; this.won = false; this.lockProgress = 0; this.newRequest(); },
  };
  scene.newRequest();
  return scene;
}

// ctl = { temp, hum, ldr, dist, connected, mode, resetPulse, onSample, onWin, onNear }
export function stationTick(scene, dt, t, ctl) {
  const { app, sky, root, stars, dust, stLed, relay, gaugeG, glowSprites, particles, vign, flash } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH); root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  vign.width = w; vign.height = h; flash.width = w; flash.height = h;

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  stars.alpha = 0.7 + 0.3 * Math.sin(t * 0.6);
  dust.forEach((d) => { d.s.x -= d.sp * dt; if (d.s.x < -220) d.s.x = LW + 220; });
  stLed.alpha = 0.4 + 0.4 * Math.abs(Math.sin(t * 2));

  // o'qishlarni yangilash (ulanganда real sensor, aks holda demo)
  const norm = ctl.connected
    ? [clamp((ctl.temp ?? 25) / 50, 0, 1), clamp((ctl.hum ?? 50) / 100, 0, 1), clamp((ctl.ldr ?? 512) / 1023, 0, 1), clamp((ctl.dist ?? 50) / 100, 0, 1)]
    : null;
  if (norm) { for (let i = 0; i < 4; i++) scene.readings[i] += (norm[i] - scene.readings[i]) * Math.min(1, dt * 10); }
  else { scene.demoT += dt; for (let i = 0; i < 4; i++) { const base = i === scene.activeIdx ? scene.targetC + 0.01 * Math.sin(scene.demoT * 3) : 0.5 + 0.18 * Math.sin(scene.demoT * (0.6 + i * 0.3) + i); scene.readings[i] += (clamp(base, 0, 1) - scene.readings[i]) * Math.min(1, dt * 2.5); } }

  const playing = (ctl.connected && !scene.won) || ctl.mode === 'intro';
  const val = scene.readings[scene.activeIdx];
  const dist = Math.abs(val - scene.targetC);
  scene.inBand = dist <= scene.tol;
  if (playing) {
    scene.lockProgress = clamp(scene.lockProgress + (scene.inBand ? dt / HOLD : -dt * 0.9), 0, 1);
    if (scene.lockProgress >= 1) {
      scene.samples++; scene.flashT = 0.45; scene.relayT = 0.8;
      particles.burst(GX[scene.activeIdx], GY + GH / 2, COLS[scene.activeIdx], 22, 190); particles.burst(500, 150, 0x39ff88, 10, 150);
      if (ctl.onSample) ctl.onSample(scene.samples);
      if (scene.samples >= TARGET && ctl.connected && ctl.mode !== 'intro') { scene.won = true; if (ctl.onWin) ctl.onWin(); }
      else scene.newRequest();
    }
  }

  // relay nur (namuna yig'ilganda bazaga)
  scene.relayT = Math.max(0, scene.relayT - dt);
  relay.clear();
  if (scene.relayT > 0) { const a = scene.relayT / 0.8; relay.moveTo(500, 150).lineTo(110, HZ - 50).stroke({ width: 1 + a * 2, color: 0x6bffb0, alpha: a * 0.6 }); }

  // ===== ASBOBLARNI CHIZISH =====
  gaugeG.clear();
  for (let i = 0; i < 4; i++) {
    const gx = GX[i], active = i === scene.activeIdx, col = COLS[i];
    // korpus
    gaugeG.roundRect(gx - 26, GY, 52, GH, 6).fill({ color: 0x061019, alpha: 0.9 }).stroke({ width: active ? 2 : 1.2, color: active ? col : 0x2a3a48 });
    for (let g = 0; g <= 8; g++) { const gy = lerp(GY + GH - 6, GY + 6, g / 8); gaugeG.moveTo(gx - 26, gy).lineTo(gx - 20, gy).stroke({ width: 1, color: 0x223441, alpha: 0.7 }); }
    // target oyna (faqat aktiv)
    if (active) {
      const yHi = lerp(GY + GH - 6, GY + 6, clamp(scene.targetC + scene.tol, 0, 1)), yLo = lerp(GY + GH - 6, GY + 6, clamp(scene.targetC - scene.tol, 0, 1));
      const bandCol = scene.inBand ? 0x39ff88 : (dist < scene.tol * 2 ? 0xffd23a : 0xff5a4a);
      gaugeG.rect(gx - 24, yHi, 48, yLo - yHi).fill({ color: bandCol, alpha: 0.16 + (scene.inBand ? 0.12 : 0) });
      gaugeG.moveTo(gx - 24, lerp(GY + GH - 6, GY + 6, scene.targetC)).lineTo(gx + 24, lerp(GY + GH - 6, GY + 6, scene.targetC)).stroke({ width: 1.5, color: 0xffe45a, alpha: 0.7 });
    }
    // o'qish ustuni
    const vy = lerp(GY + GH - 6, GY + 6, clamp(scene.readings[i], 0, 1));
    gaugeG.rect(gx - 22, vy, 44, GY + GH - 6 - vy).fill({ color: col, alpha: 0.85 });
    gaugeG.moveTo(gx - 24, vy).lineTo(gx + 24, vy).stroke({ width: 2, color: 0xffffff, alpha: 0.85 });
    // qulflash halqasi (aktiv)
    if (active && scene.lockProgress > 0.01) { const a0 = -Math.PI / 2, a1 = a0 + scene.lockProgress * Math.PI * 2; gaugeG.arc(gx, GY + GH + 26, 12, a0, a1).stroke({ width: 3, color: 0x39ff88, alpha: 0.95 }); }
    gaugeG.circle(gx, GY + GH + 26, 4).fill(active ? col : 0x243441);
  }
  glowSprites.forEach((s, i) => { s.alpha = i === scene.activeIdx ? (0.2 + 0.3 * (scene.inBand ? 1 : 0.4)) : 0; s.tint = COLS[i]; });

  scene.flashT = Math.max(0, scene.flashT - dt); flash.tint = 0x9fffcf; flash.alpha = scene.flashT * 0.3;
  particles.tick(dt);
}
