// visualizerScene — VOLTRA "Ovoz Vizualizatori" — OVOZ SENSORI (KY-038 mikrofon).
// YANGI ELEMENT: mikrofon haqiqiy ovoz sathini o'lchaydi (serialData.sound). Realistik ALOQA
// BOSHQARUV XONASI: deraza ortida antenna tarelka maydoni, apparat rack'lari + VU-metrlar,
// markazda spektr-analizator monitor, oldinda katta studiya mikrofoni.
// Saga davomi: dronlardan keyin antennani tiklab, flotga AUDIO handshake uzatamiz — ovoz
// sathini SARIQ uzatish oynasiga moslab USHLAB tur -> signal qulflanadi. 3 handshake -> aloqa.
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const WAVES = 3, HOLD = 1.0;
const TOL_BY_WAVE = [0.13, 0.10, 0.075];       // uzatish oynasi kengligi (0..1) — qiyinlashadi
const ML_TOP = 258, ML_BOT = 428, METER_X = 648; // sath-metr (monitor o'ng qismida)
const SCR_CX = 500;                               // monitor markazi
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);
const ly = (v) => lerp(ML_BOT, ML_TOP, clamp(v, 0, 1));   // sath -> ekran y

function radialVignette(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.36, size / 2, size / 2, size * 0.64);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(2,4,6,0.9)'); c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}

// ---------- antenna tarelka (deraza ortida) ----------
function makeDish(parent, x, y, s, tilt) {
  const c = new Container(); c.x = x; c.y = y; c.scale.set(s);
  const base = new Graphics();
  base.rect(-5, 0, 10, 30).fill(0x232a32); base.moveTo(0, 2).lineTo(-14, -8).stroke({ width: 3, color: 0x2e3742 });
  c.addChild(base);
  const dish = new Container(); dish.y = -4; dish.rotation = tilt;
  const dg = new Graphics();
  dg.ellipse(0, 0, 26, 10).fill(0x161c23).stroke({ width: 2, color: 0x3a444f });
  dg.ellipse(0, 0, 20, 7).fill(0x0d1218);
  dg.moveTo(0, 0).lineTo(0, -15).stroke({ width: 1.5, color: 0x49535d }); dg.circle(0, -15, 2.4).fill(0x6a7580);
  dish.addChild(dg); c.addChild(dish);
  parent.addChild(c);
  return { dish, base: y };
}

// ---------- apparat rack (holat LEDlari) ----------
function makeRack(parent, x, y, w, h) {
  const g = new Graphics();
  g.roundRect(x, y, w, h, 4).fill(0x121820).stroke({ width: 1.5, color: 0x2a333d });
  const specs = [];
  for (let ry = y + 12; ry < y + h - 12; ry += 26) {
    g.roundRect(x + 6, ry, w - 12, 18, 3).fill(0x0c1118).stroke({ width: 1, color: 0x222c36 }); // modul
    g.rect(x + 10, ry + 6, w - 40, 6, 1).fill(0x1a2530);                                          // yoriq
    specs.push({ lx: x + w - 12, lyy: ry + 9 });
  }
  parent.addChild(g);
  const leds = [];
  specs.forEach((s) => { const led = new Graphics().circle(s.lx, s.lyy, 2.6).fill(0x39ff88); led.blendMode = 'add'; parent.addChild(led); leds.push({ led, phase: Math.random() * 6.28, sp: 1 + Math.random() * 3, hue: Math.random() < 0.3 ? 0xff9a3c : 0x39ff88 }); });
  return leds;
}

// ---------- analog VU-metr (strelka) ----------
function makeVU(parent, x, y) {
  const c = new Container(); c.x = x; c.y = y;
  const face = new Graphics();
  face.roundRect(-34, -26, 68, 40, 4).fill(0x0e141a).stroke({ width: 1.5, color: 0x2a333d });
  face.rect(-30, -22, 60, 26).fill(0xe8dcc0);                       // krem shkala
  face.rect(6, -22, 24, 26).fill({ color: 0xff5a4a, alpha: 0.25 }); // qizil zona
  for (let a = -50; a <= 50; a += 20) { const rad = a * Math.PI / 180; face.moveTo(Math.sin(rad) * 24, 2 - Math.cos(rad) * 24).lineTo(Math.sin(rad) * 27, 2 - Math.cos(rad) * 27).stroke({ width: 1, color: 0x2a2a2a }); }
  c.addChild(face);
  const needle = new Graphics().moveTo(0, 2).lineTo(0, -22).stroke({ width: 1.6, color: 0xc21a1a }); needle.pivot.set(0, 2); needle.y = 2; c.addChild(needle);
  const hub = new Graphics().circle(0, 2, 2.4).fill(0x222); c.addChild(hub);
  parent.addChild(c);
  return needle;
}

// ---------- studiya mikrofoni (YANGI ELEMENT, oldinda) ----------
function makeMic(parent) {
  const c = new Container(); c.x = 188; c.y = 0;
  // shok-mount tayanch
  const stand = new Graphics();
  stand.moveTo(-2, 560).lineTo(-2, 470).lineTo(2, 470).lineTo(2, 560).fill(0x2a3038);        // ustun
  stand.ellipse(0, 470, 40, 12).stroke({ width: 3, color: 0x3a444f });                        // shok halqa
  for (let a = 0; a < 6; a++) { const rad = a / 6 * Math.PI * 2; stand.moveTo(Math.cos(rad) * 40, 470 + Math.sin(rad) * 12).lineTo(0, 452).stroke({ width: 1, color: 0x39ff88, alpha: 0.3 }); }
  c.addChild(stand);
  // mikrofon korpusi
  const body = new Graphics();
  body.roundRect(-19, 400, 38, 66, 16).fill(0x1a1f26).stroke({ width: 2, color: 0x3a444f });   // korpus
  body.roundRect(-16, 404, 32, 30, 13).fill(0x0c1016);                                          // to'r uyasi
  for (let gy = 408; gy < 432; gy += 4) body.moveTo(-15, gy).lineTo(15, gy).stroke({ width: 1, color: 0x2a3640 });
  for (let gx = -14; gx <= 14; gx += 4) body.moveTo(gx, 406).lineTo(gx, 432).stroke({ width: 1, color: 0x2a3640 });
  body.rect(-8, 444, 16, 4, 2).fill(0x39ff88);                                                  // yozuv indikator chizig'i
  c.addChild(body);
  const glow = new Sprite(radialTexture('rgba(57,255,136,0.8)', 128)); glow.anchor.set(0.5); glow.y = 418; glow.width = glow.height = 90; glow.blendMode = 'add'; glow.alpha = 0.18; c.addChildAt(glow, 0);
  const recDot = new Graphics().circle(0, 452, 3).fill(0xff3b46); recDot.blendMode = 'add'; c.addChild(recDot);
  parent.addChild(c);
  return { glow, recDot };
}

export function assembleVisualizer(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.62, bloomScale: 0.9, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#05070c', '#0a0e15', '#0e131b', '#0a0d12'])); skyC.addChild(sky);
  const root = new Container(); app.stage.addChild(root);

  // ===== DERAZA ORTIDAGI KOSMOS + ANTENNA MAYDONI =====
  const winX0 = 56, winY0 = 22, winX1 = 944, winY1 = 244;
  const space = new Graphics();
  space.rect(winX0, winY0, winX1 - winX0, winY1 - winY0).fill(0x04070e);          // kosmos foni
  root.addChild(space);
  const stars = new Graphics();
  for (let i = 0; i < 130; i++) { const sx = rnd(winX0, winX1), sy = rnd(winY0, winY1 - 40); stars.circle(sx, sy, Math.random() * 1 + 0.25).fill({ color: 0xcfe0ff, alpha: 0.2 + Math.random() * 0.5 }); }
  root.addChild(stars);
  // uzoq sayyora (Yer) + porlash
  const planetGlow = new Sprite(radialTexture('rgba(90,150,255,0.5)', 256)); planetGlow.anchor.set(0.5); planetGlow.x = 815; planetGlow.y = 92; planetGlow.width = planetGlow.height = 170; planetGlow.blendMode = 'add'; root.addChild(planetGlow);
  const planet = new Graphics();
  planet.circle(815, 92, 40).fill(0x1a3a6a); planet.ellipse(806, 86, 20, 10).fill({ color: 0x2a6a8a, alpha: 0.6 }); planet.ellipse(824, 100, 14, 7).fill({ color: 0x2a6a8a, alpha: 0.5 }); planet.arc(815, 92, 40, -1.2, 1.0).stroke({ width: 3, color: 0x6ab0ff, alpha: 0.5 });
  root.addChild(planet);
  // regolit yuzasi
  const rego = new Graphics();
  rego.moveTo(winX0, winY1); rego.lineTo(winX0, winY1 - 34);
  for (let x = winX0; x <= winX1; x += 40) rego.lineTo(x, winY1 - 30 - Math.sin(x * 0.05) * 6 - Math.random() * 6);
  rego.lineTo(winX1, winY1).fill(0x0d1319);
  rego.rect(winX0, winY1 - 32, winX1 - winX0, 2).fill({ color: 0x2a4a5a, alpha: 0.4 });
  root.addChild(rego);
  // antenna tarelkalar (asosiy aylanuvchi + statik)
  const dishMain = makeDish(root, 300, winY1 - 30, 1.5, -0.5);
  makeDish(root, 150, winY1 - 26, 1.0, -0.35); makeDish(root, 470, winY1 - 24, 0.85, -0.6); makeDish(root, 600, winY1 - 28, 1.1, -0.42);
  // deraza oynasi aksi + ramka
  const glassRefl = new Graphics(); glassRefl.poly([winX0, winY0, winX0 + 150, winY0, winX0 + 60, winY1, winX0, winY1]).fill({ color: 0x6fb0d0, alpha: 0.05 }); root.addChild(glassRefl);
  const frame = new Graphics();
  frame.rect(winX0 - 8, winY0 - 8, winX1 - winX0 + 16, winY1 - winY0 + 16).stroke({ width: 8, color: 0x1c232c });
  frame.rect(winX0 - 8, winY0 - 8, winX1 - winX0 + 16, 5).fill({ color: 0x39ff88, alpha: 0.12 });
  for (let mx = winX0 + 222; mx < winX1; mx += 222) frame.rect(mx - 3, winY0, 6, winY1 - winY0).fill(0x1c232c);   // mullionlar
  frame.rect(winX0, (winY0 + winY1) / 2 - 3, winX1 - winX0, 6).fill(0x1c232c);
  root.addChild(frame);

  // ===== BOSHQARUV XONASI DEVORI =====
  const wall = new Graphics();
  wall.rect(0, winY1 + 8, LW, 470 - (winY1 + 8)).fill(0x0e131a);
  wall.rect(0, winY1 + 8, LW, 3).fill({ color: 0x1c2530, alpha: 0.6 });
  for (let x = 40; x < LW; x += 80) wall.moveTo(x, winY1 + 8).lineTo(x, 470).stroke({ width: 1, color: 0x141b23, alpha: 0.5 });
  root.addChild(wall);

  // apparat rack'lar (chap/o'ng) + VU-metrlar
  const rackLeds = [...makeRack(root, 16, winY1 + 20, 118, 236), ...makeRack(root, 866, winY1 + 20, 118, 236)];
  const vus = [makeVU(root, 74, winY1 + 232), makeVU(root, 924, winY1 + 232)];

  // ===== MARKAZIY MONITOR (spektr-analizator) =====
  const bezel = new Graphics();
  bezel.roundRect(316, winY1 - 2, 368, 214, 10).fill(0x05080c).stroke({ width: 6, color: 0x1a2028 });
  bezel.roundRect(316, winY1 - 2, 368, 214, 10).stroke({ width: 1.5, color: 0x2e3a46 });
  bezel.circle(330, winY1 + 202, 2.5).fill(0x39ff88).circle(670, winY1 + 202, 2.5).fill(0xff9a3c); // panel LEDlari
  root.addChild(bezel);
  const screenGlow = new Sprite(radialTexture('rgba(40,120,90,0.5)', 512)); screenGlow.anchor.set(0.5); screenGlow.x = SCR_CX; screenGlow.y = 340; screenGlow.width = 420; screenGlow.height = 260; screenGlow.blendMode = 'add'; screenGlow.alpha = 0.16; root.addChild(screenGlow);
  const specG = new Graphics(); root.addChild(specG);          // spektr (ekran ichida)
  const oscG = new Graphics(); root.addChild(oscG);            // ossiloskop
  const meterG = new Graphics(); root.addChild(meterG);        // sath-metr + target + marker
  const markerGlow = new Sprite(radialTexture('rgba(57,255,136,0.9)', 128)); markerGlow.anchor.set(0.5); markerGlow.x = METER_X; markerGlow.width = markerGlow.height = 46; markerGlow.blendMode = 'add'; root.addChild(markerGlow);
  const samples = new Float32Array(34);

  // ===== BOSHQARUV KONSOLI (oldingi stol) =====
  const desk = new Graphics();
  desk.poly([0, 470, LW, 470, LW, LH, 0, LH]).fill(0x0b0f14);
  desk.poly([90, 470, LW - 90, 470, LW - 40, 512, 40, 512]).fill(0x141b22).stroke({ width: 1.5, color: 0x2a333d }); // qiya panel
  // faderlar
  for (let i = 0; i < 6; i++) { const fx = 150 + i * 26; desk.rect(fx, 478, 3, 26).fill(0x0a0e12); desk.roundRect(fx - 5, 478 + (i % 3) * 6, 13, 7, 2).fill(0x39485a); }
  // knoblar
  for (let i = 0; i < 5; i++) { const kx = 360 + i * 24; desk.circle(kx, 492, 8).fill(0x1a222c).stroke({ width: 1.5, color: 0x33404b }); desk.moveTo(kx, 492).lineTo(kx + Math.cos(i - 2) * 6, 492 + Math.sin(i - 2) * 6).stroke({ width: 1.5, color: 0x6bffa0 }); }
  // yoritilgan tugmalar
  for (let i = 0; i < 8; i++) { const bx = 610 + i * 22; desk.roundRect(bx, 486, 15, 12, 2).fill(i % 3 === 0 ? 0x2a5a3a : 0x24303c); }
  root.addChild(desk);
  const deskGlow = new Sprite(radialTexture('rgba(57,255,136,0.4)', 512)); deskGlow.anchor.set(0.5); deskGlow.x = SCR_CX; deskGlow.y = 486; deskGlow.width = 520; deskGlow.height = 120; deskGlow.blendMode = 'add'; deskGlow.alpha = 0.1; root.addChild(deskGlow);

  // ===== MIKROFON (YANGI ELEMENT) =====
  const mic = makeMic(root);
  const particles = makeParticles(root);

  // overlaylar
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffffff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);
  const vign = new Sprite(radialVignette()); vign.alpha = 0.6; app.stage.addChild(vign);

  const scene = {
    app, sky, root, stars, planetGlow, dishMain, rackLeds, vus, screenGlow, specG, oscG, meterG, markerGlow, samples, deskGlow, mic, particles, flash, vign,
    wave: 0, curLevel: 0, targetC: 0.6, tol: TOL_BY_WAVE[0], lockProgress: 0, inBand: false,
    won: false, lastReset: 0, flashT: 0, demoT: 0,
    newTarget() { this.tol = TOL_BY_WAVE[Math.min(this.wave, TOL_BY_WAVE.length - 1)]; let c; do { c = rnd(0.35, 0.86); } while (Math.abs(c - this.targetC) < 0.22); this.targetC = c; this.lockProgress = 0; },
    reset() { this.wave = 0; this.won = false; this.lockProgress = 0; this.curLevel = 0; this.newTarget(); },
  };
  scene.newTarget();
  return scene;
}

// ctl = { level (0..1), connected, mode, resetPulse, onLock, onWin, onNear }
export function visualizerTick(scene, dt, t, ctl) {
  const { app, sky, root, stars, planetGlow, dishMain, rackLeds, vus, screenGlow, specG, oscG, meterG, markerGlow, samples, mic, particles, flash, vign } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH); root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  flash.width = w; flash.height = h; vign.width = w; vign.height = h;

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // ovoz sathi — VU ballistikasi (tez ko'tarilish / sekin tushish); ulanmaganda demo
  if (ctl.connected) { const tgt = clamp(ctl.level ?? 0, 0, 1); const a = tgt > scene.curLevel ? Math.min(1, dt * 20) : Math.min(1, dt * 4); scene.curLevel += (tgt - scene.curLevel) * a; }
  else { scene.demoT += dt; const drive = scene.targetC - 0.01 + 0.05 * Math.sin(scene.demoT * 1.2) + 0.03 * Math.sin(scene.demoT * 3.3); scene.curLevel += (clamp(drive, 0, 1) - scene.curLevel) * Math.min(1, dt * 3); }

  // atmosfera
  stars.alpha = 0.7 + 0.3 * Math.sin(t * 0.8);
  planetGlow.alpha = 0.4 + 0.1 * Math.sin(t * 0.5);
  dishMain.dish.rotation = -0.5 + 0.12 * Math.sin(t * 0.4);
  rackLeds.forEach((o) => { o.led.tint = o.hue; o.led.alpha = (Math.sin(t * o.sp + o.phase) > 0.4 ? 0.9 : 0.15); });
  vus.forEach((n, i) => { n.rotation = lerp(-0.9, 0.9, clamp(scene.curLevel + (i ? -0.06 : 0.06) + 0.05 * Math.sin(t * 8 + i), 0, 1)); });
  const micActive = scene.curLevel > 0.06;
  mic.glow.alpha = 0.15 + scene.curLevel * 0.7; mic.glow.scale.set(1 + scene.curLevel * 0.3);
  mic.recDot.alpha = micActive ? (0.5 + 0.5 * Math.sin(t * 8)) : 0.25;
  screenGlow.alpha = 0.14 + scene.curLevel * 0.2;

  // ===== SPEKTR (ekran ichida, ovozga reaktiv) =====
  specG.clear();
  const N = samples.length, sx0 = 336, sw = 268 / N, sBase = 418;
  for (let i = 0; i < N; i++) {
    const env = Math.exp(-Math.pow((i / N - 0.5) * 2.2, 2));                 // markazda balandroq
    const tgt = clamp((0.12 + 0.9 * scene.curLevel) * env * (0.7 + 0.5 * Math.sin(t * 7 + i * 0.7)) + 0.05, 0, 1);
    samples[i] += (tgt - samples[i]) * Math.min(1, dt * 14);
    const v = samples[i], bh = v * 74;
    const col = v > 0.72 ? 0xff5a4a : (v > 0.5 ? 0xffd23a : 0x39ff88);
    specG.rect(sx0 + i * sw, sBase - bh, sw - 1.5, bh).fill({ color: col, alpha: 0.9 });
  }
  specG.moveTo(sx0, sBase + 1).lineTo(sx0 + N * sw, sBase + 1).stroke({ width: 1, color: 0x2a4a3a, alpha: 0.6 });

  // ===== OSSILOSKOP =====
  oscG.clear();
  const oy = 276, amp = 8 + scene.curLevel * 30;
  for (let x = 336; x <= 600; x += 4) { const y = oy + Math.sin((x + t * 200) * 0.05) * amp * Math.exp(-Math.pow((x - 468) / 130, 2)); x === 336 ? oscG.moveTo(x, y) : oscG.lineTo(x, y); }
  oscG.stroke({ width: 1.5, color: 0x00e5ff, alpha: 0.75 });

  // ===== GAMEPLAY: sath-metr + uzatish oynasi + qulflash =====
  const allowPlay = (ctl.connected && !scene.won) || ctl.mode === 'intro';
  const dist = Math.abs(scene.curLevel - scene.targetC);
  scene.inBand = dist <= scene.tol;
  if (allowPlay) {
    scene.lockProgress = clamp(scene.lockProgress + (scene.inBand ? dt / HOLD : -dt * 0.9), 0, 1);
    if (scene.lockProgress >= 1) {
      scene.wave++; scene.flashT = 0.5;
      particles.burst(METER_X, ly(scene.targetC), 0x39ff88, 24, 200); particles.burst(METER_X, ly(scene.targetC), 0xffffff, 10, 140);
      if (ctl.onLock) ctl.onLock(scene.wave);
      if (scene.wave >= WAVES && ctl.connected && ctl.mode !== 'intro') { scene.won = true; if (ctl.onWin) ctl.onWin(); }
      else scene.newTarget();
    }
  }

  meterG.clear();
  const mx = METER_X;
  // metr korpusi
  meterG.roundRect(mx - 16, ML_TOP - 8, 32, (ML_BOT - ML_TOP) + 16, 6).fill({ color: 0x061009, alpha: 0.85 }).stroke({ width: 1.5, color: 0x2a4a3a });
  for (let g = 0; g <= 10; g++) { const gy = lerp(ML_BOT, ML_TOP, g / 10); meterG.moveTo(mx - 16, gy).lineTo(mx - 11, gy).stroke({ width: 1, color: 0x2a4a3a, alpha: 0.7 }); }
  // uzatish target oynasi
  const yHi = ly(scene.targetC + scene.tol), yLo = ly(scene.targetC - scene.tol);
  const bandCol = scene.inBand ? 0x39ff88 : (dist < scene.tol * 2 ? 0xffd23a : 0xff5a4a);
  meterG.rect(mx - 15, yHi, 30, yLo - yHi).fill({ color: bandCol, alpha: 0.16 + (scene.inBand ? 0.14 : 0) });
  meterG.moveTo(mx - 15, ly(scene.targetC)).lineTo(mx + 15, ly(scene.targetC)).stroke({ width: 1.5, color: 0xffe45a, alpha: 0.7 });
  // sath ustuni (VU)
  const yc = ly(scene.curLevel);
  const lc = scene.curLevel > 0.72 ? 0xff5a4a : (scene.inBand ? 0x39ff88 : 0x00e5ff);
  meterG.rect(mx - 13, yc, 26, ML_BOT - yc).fill({ color: lc, alpha: 0.9 });
  meterG.moveTo(mx - 15, yc).lineTo(mx + 15, yc).stroke({ width: 2.5, color: 0xffffff, alpha: 0.9 });
  markerGlow.y = yc; markerGlow.tint = lc; markerGlow.alpha = 0.4 + 0.4 * scene.lockProgress + (scene.inBand ? 0.2 : 0);
  // qulflash progress
  if (scene.lockProgress > 0.01) { const a0 = -Math.PI / 2, a1 = a0 + scene.lockProgress * Math.PI * 2; meterG.arc(mx, ly(scene.targetC), 22, a0, a1).stroke({ width: 3, color: 0x39ff88, alpha: 0.95 }); }

  scene.flashT = Math.max(0, scene.flashT - dt); flash.tint = 0x9fffcf; flash.alpha = scene.flashT * 0.35;
  particles.tick(dt);
}
