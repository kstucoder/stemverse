// visualizerScene — VOLTRA "Musiqa Vizualizatori" — FREKANS SOZLASH (synthwave signal-tuning).
// Digital Twin: potensiometr (POT) tovush chastotasini boshqaradi. Ekranda "target" chastota
// bandi paydo bo'ladi — potni burab spektr cho'qqisini shu bandga MOSLAB, ushlab turasan ->
// signal qulflanadi (to'lqin yopiladi). 3 to'lqin qulflansa -> g'alaba. Buzzer real pitch chaladi.
// Synthwave estetikasi: quyosh, perspektiva panjara ufq, reaktiv spektr, ossiloskop, bloom.
import { Container, Graphics, Sprite, Texture, TilingSprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const HZ = 286;                      // ufq chizig'i
const FMIN = 120, FMAX = 1200;       // chastota diapazoni (Hz)
const BX1 = 130, BX2 = 870, BY = 492; // sozlash paneli geometriyasi
const NBARS = 54, WAVES = 3, HOLD = 1.1;
const TOL_BY_WAVE = [60, 46, 36];    // qulflash tolerantligi (Hz) — qiyinlashadi
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const fx = (freq) => BX1 + clamp((freq - FMIN) / (FMAX - FMIN), 0, 1) * (BX2 - BX1);
const pxPerHz = (BX2 - BX1) / (FMAX - FMIN);

function scanlineTexture() {
  const cv = document.createElement('canvas'); cv.width = 4; cv.height = 4; const c = cv.getContext('2d');
  c.fillStyle = 'rgba(0,0,0,0)'; c.fillRect(0, 0, 4, 4); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 2, 4, 1); return Texture.from(cv);
}
function radialVignette(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.34, size / 2, size / 2, size * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(4,2,12,0.92)'); c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}
function skyTexture() {
  const cv = document.createElement('canvas'); cv.width = 8; cv.height = 512; const c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#0a0320'); g.addColorStop(0.4, '#1a0740'); g.addColorStop(0.7, '#3a1060'); g.addColorStop(0.9, '#7a1a6e'); g.addColorStop(1, '#ff5f7e');
  c.fillStyle = g; c.fillRect(0, 0, 8, 512); return Texture.from(cv);
}
// synthwave quyosh (gorizontal tirqishli disk)
function sunTexture(size = 256) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, size);
  g.addColorStop(0, '#fff05a'); g.addColorStop(0.45, '#ff8f4a'); g.addColorStop(0.75, '#ff3d7f'); g.addColorStop(1, '#c81e6a');
  c.fillStyle = g; c.beginPath(); c.arc(size / 2, size / 2, size / 2 - 2, 0, 7); c.fill();
  c.globalCompositeOperation = 'destination-out';
  for (let i = 0, y = size * 0.5; y < size; i++, y += 6 + i * 1.6) { c.fillRect(0, y, size, 3 + i * 0.9); }
  return Texture.from(cv);
}

export function assembleVisualizer(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.42, bloomScale: 1.3, brightness: 1.05, blur: 6, quality: 5 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(skyTexture()); skyC.addChild(sky);
  const root = new Container(); app.stage.addChild(root);

  // yulduzlar
  const stars = new Graphics();
  for (let i = 0; i < 150; i++) { const sx = Math.random() * LW, sy = Math.random() * (HZ - 20); stars.circle(sx, sy, Math.random() * 1.1 + 0.3).fill({ color: 0xffd8f0, alpha: 0.2 + Math.random() * 0.5 }); }
  root.addChild(stars);

  // quyosh + halo
  const sunGlow = new Sprite(radialTexture('rgba(255,90,150,0.5)', 512)); sunGlow.anchor.set(0.5); sunGlow.width = sunGlow.height = 420; sunGlow.x = LW / 2; sunGlow.y = 196; sunGlow.blendMode = 'add'; root.addChild(sunGlow);
  const sun = new Sprite(sunTexture()); sun.anchor.set(0.5); sun.width = sun.height = 210; sun.x = LW / 2; sun.y = 200; root.addChild(sun);

  // uzoq tog'lar silueti (ufqda)
  const mtns = new Graphics(); mtns.moveTo(0, HZ);
  let mx = 0; while (mx < LW) { const pw = 60 + Math.random() * 80, ph = 30 + Math.random() * 60; mtns.lineTo(mx + pw / 2, HZ - ph).lineTo(mx + pw, HZ); mx += pw; }
  mtns.lineTo(LW, HZ).lineTo(LW, HZ + 4).lineTo(0, HZ + 4).fill(0x1a0b32);
  root.addChild(mtns);

  // reaktiv spektr (ufqda turadi, tepaga o'sadi)
  const specG = new Graphics(); root.addChild(specG);
  const samples = new Float32Array(NBARS);

  // perspektiva panjara (ufqdan pastga)
  const gridG = new Graphics(); root.addChild(gridG);
  const horizonLine = new Sprite(radialTexture('rgba(0,230,255,0.7)', 256)); horizonLine.anchor.set(0.5); horizonLine.width = LW * 1.1; horizonLine.height = 40; horizonLine.x = LW / 2; horizonLine.y = HZ; horizonLine.blendMode = 'add'; root.addChild(horizonLine);

  // ossiloskop to'lqini
  const oscG = new Graphics(); root.addChild(oscG);

  // SOZLASH PANELI (gameplay) + marker glow + zarralar
  const tuneG = new Graphics(); root.addChild(tuneG);
  const markerGlow = new Sprite(radialTexture('rgba(0,255,180,0.8)', 128)); markerGlow.anchor.set(0.5); markerGlow.width = markerGlow.height = 70; markerGlow.blendMode = 'add'; markerGlow.y = BY; root.addChild(markerGlow);
  const particles = makeParticles(root);

  // overlaylar
  const scan = new TilingSprite({ texture: scanlineTexture(), width: 10, height: 10 }); scan.alpha = 0.16; app.stage.addChild(scan);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffffff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);
  const vign = new Sprite(radialVignette()); vign.alpha = 0.66; app.stage.addChild(vign);

  const scene = {
    app, sky, root, sun, sunGlow, stars, specG, samples, gridG, horizonLine, oscG, tuneG, markerGlow, particles, scan, flash, vign,
    wave: 0, curFreq: FMIN, targetFreq: 500, tol: TOL_BY_WAVE[0], lockProgress: 0, inBand: false,
    won: false, lastReset: 0, flashT: 0, lockedT: 0,
    newTarget() {
      this.tol = TOL_BY_WAVE[Math.min(this.wave, TOL_BY_WAVE.length - 1)];
      let f; do { f = FMIN + 130 + Math.random() * (FMAX - FMIN - 260); } while (Math.abs(f - this.curFreq) < 240);
      this.targetFreq = f; this.lockProgress = 0;
    },
    reset() { this.wave = 0; this.won = false; this.lockProgress = 0; this.curFreq = FMIN; this.newTarget(); },
  };
  scene.newTarget();
  return scene;
}

// ctl = { pot, connected, mode, resetPulse, onLock, onWin, onNear }
export function visualizerTick(scene, dt, t, ctl) {
  const { app, sky, root, sun, sunGlow, specG, samples, gridG, horizonLine, oscG, tuneG, markerGlow, particles, scan, flash, vign } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH); root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  scan.width = w; scan.height = h; scan.tilePosition.y = (t * 30) % 4; flash.width = w; flash.height = h; vign.width = w; vign.height = h;

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  const playing = ctl.connected && !scene.won;
  // chastota: ulanган bo'lsa POT'dan, aks holda avto-sweep (demo)
  const rawFreq = ctl.connected ? FMIN + clamp((ctl.pot ?? 512) / 1023, 0, 1) * (FMAX - FMIN)
    : FMIN + (0.5 + 0.5 * Math.sin(t * 0.4)) * (FMAX - FMIN);
  scene.curFreq += (rawFreq - scene.curFreq) * Math.min(1, dt * 14);

  // quyosh nafas olishi
  const pulse = 1 + 0.02 * Math.sin(t * 2); sun.scale.set(pulse * (210 / sun.texture.width)); sunGlow.alpha = 0.5 + 0.15 * Math.sin(t * 2);
  horizonLine.alpha = 0.5 + 0.2 * Math.sin(t * 3);

  // ---- SPEKTR: sizning pitch cho'qqisi + fon to'lqinlari ----
  specG.clear();
  const bw = (BX2 - BX1 + 120) / NBARS;
  for (let i = 0; i < NBARS; i++) {
    const barFreq = FMIN + (i / (NBARS - 1)) * (FMAX - FMIN);
    const peak = Math.exp(-Math.pow((barFreq - scene.curFreq) / 130, 2));      // pitch cho'qqisi
    const noise = 0.14 + 0.11 * Math.sin(t * 4 + i * 0.55) + 0.06 * Math.sin(t * 9 + i);
    const target = clamp(noise + peak * 0.95, 0, 1.15);
    samples[i] += (target - samples[i]) * Math.min(1, dt * 12);
    const v = samples[i]; const bh = v * 150;
    const x = (LW - (NBARS * bw)) / 2 + i * bw;
    const hue = 190 + (i / NBARS) * 130;
    const col = hslHex(hue, 100, 52 + v * 22);
    specG.roundRect(x, HZ - bh, bw - 3, bh, 2).fill({ color: col, alpha: 0.85 });
    specG.roundRect(x, HZ - bh, bw - 3, 3, 1).fill({ color: 0xffffff, alpha: 0.5 * v });
  }

  // ---- PERSPEKTIVA PANJARA ----
  gridG.clear();
  const VPX = LW / 2, VPY = HZ;
  for (let i = -11; i <= 11; i++) { const xb = LW / 2 + i * (LW / 11); gridG.moveTo(VPX, VPY).lineTo(xb, LH).stroke({ width: 1.4, color: (i % 2 ? 0xff2d95 : 0x00e5ff), alpha: 0.22 }); }
  const fscroll = (t * 0.28) % 1;
  for (let k = 0; k < 15; k++) { const d = (k + fscroll) / 15; const y = VPY + (LH - VPY) * d * d; gridG.moveTo(0, y).lineTo(LW, y).stroke({ width: 1 + d * 1.4, color: 0xff2d95, alpha: 0.1 + d * 0.32 }); }

  // ---- OSSILOSKOP ----
  oscG.clear();
  const amp = 16 + 22 * ((scene.curFreq - FMIN) / (FMAX - FMIN)); const oy = 356; const kk = 0.016 * (scene.curFreq / 380);
  for (let pass = 0; pass < 2; pass++) {
    const lw = pass === 0 ? 5 : 2, al = pass === 0 ? 0.12 : 0.9;
    for (let x = 0; x <= LW; x += 4) { const y = oy + Math.sin((x + t * 220) * kk) * amp * Math.exp(-Math.pow((x - LW / 2) / 460, 2)); x === 0 ? oscG.moveTo(x, y) : oscG.lineTo(x, y); }
    oscG.stroke({ width: lw, color: 0x00e5ff, alpha: al });
  }

  // ---- SOZLASH GAMEPLAY ----
  const dist = Math.abs(scene.curFreq - scene.targetFreq);
  scene.inBand = dist <= scene.tol;
  if (playing) {
    const was = scene.lockProgress;
    scene.lockProgress = clamp(scene.lockProgress + (scene.inBand ? dt / HOLD : -dt * 0.9), 0, 1);
    if (was < 0.5 && scene.lockProgress >= 0.5 && ctl.onNear) ctl.onNear();
    if (scene.lockProgress >= 1) {
      scene.wave++; scene.flashT = 0.5; scene.lockedT = 0.6;
      particles.burst(fx(scene.targetFreq), BY, 0x39ff88, 26, 220); particles.burst(fx(scene.targetFreq), BY, 0x00e5ff, 14, 160);
      if (ctl.onLock) ctl.onLock(scene.wave);
      if (scene.wave >= WAVES) { scene.won = true; if (ctl.onWin) ctl.onWin(); }
      else scene.newTarget();
    }
  }

  // panel chizish
  tuneG.clear();
  tuneG.roundRect(BX1 - 14, BY - 7, (BX2 - BX1) + 28, 14, 7).fill({ color: 0x0a0820, alpha: 0.72 }).stroke({ width: 1.5, color: 0x00e5ff, alpha: 0.4 });
  for (let f = FMIN; f <= FMAX; f += 90) { const xt = fx(f); tuneG.moveTo(xt, BY - 4).lineTo(xt, BY + 4).stroke({ width: 1, color: 0x00e5ff, alpha: 0.3 }); }
  // target band
  const xT = fx(scene.targetFreq), wTol = scene.tol * pxPerHz;
  const bandCol = scene.inBand ? 0x39ff88 : (dist < scene.tol * 2 ? 0xffd23a : 0xff3b6b);
  tuneG.rect(xT - wTol, BY - 30, wTol * 2, 60).fill({ color: bandCol, alpha: 0.13 + (scene.inBand ? 0.12 : 0) });
  tuneG.moveTo(xT, BY - 34).lineTo(xT, BY + 34).stroke({ width: 2, color: 0xffe45a, alpha: 0.8 });
  tuneG.moveTo(xT - wTol, BY - 30).lineTo(xT - wTol, BY + 30).moveTo(xT + wTol, BY - 30).lineTo(xT + wTol, BY + 30).stroke({ width: 1.5, color: bandCol, alpha: 0.5 });
  // marker
  const xM = fx(scene.curFreq); const mCol = scene.inBand ? 0x39ff88 : 0x00e5ff;
  markerGlow.x = xM; markerGlow.tint = mCol; markerGlow.alpha = 0.45 + 0.35 * scene.lockProgress + (scene.inBand ? 0.2 : 0);
  tuneG.moveTo(xM, BY - 26).lineTo(xM, BY + 26).stroke({ width: 3, color: mCol, alpha: 0.95 });
  tuneG.circle(xM, BY, 8).fill(mCol).circle(xM, BY, 8).stroke({ width: 2, color: 0xffffff, alpha: 0.6 });
  // qulflash halqasi (progress arc)
  if (scene.lockProgress > 0.01) {
    const a0 = -Math.PI / 2, a1 = a0 + scene.lockProgress * Math.PI * 2;
    tuneG.arc(xM, BY, 17, a0, a1).stroke({ width: 3.5, color: 0x39ff88, alpha: 0.9 });
  }

  scene.flashT = Math.max(0, scene.flashT - dt); scene.lockedT = Math.max(0, scene.lockedT - dt);
  flash.tint = 0x9fffcf; flash.alpha = scene.flashT * 0.4;

  particles.tick(dt);
}

// kichik HSL -> hex yordamchi (spektr ranglari uchun)
function hslHex(hh, s, l) {
  s /= 100; l /= 100; const k = (n) => (n + hh / 30) % 12; const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return ((Math.round(f(0) * 255) << 16) | (Math.round(f(8) * 255) << 8) | Math.round(f(4) * 255));
}
