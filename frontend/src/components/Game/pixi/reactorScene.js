// reactorScene — VOLTRA "Reaktor Ishga Tushirish Kodi" — 4x4 KEYPAD (yangi element) — FINAL BOSS.
// Realistik REAKTOR BOSHQARUV XONASI: shisha germetik kamera ichida yadro halqalari, sovutish
// quvurlari, ogohlantirish chiroqlari, RPM/harorat asboblari, oldinda fizik 4x4 klaviatura.
// Ekranda ishga tushirish KODI ko'rsatiladi — keypad'da to'g'ri raqamlarni ketma-ket kirit.
// Har bosqich reaktorni bir pog'ona jonlantiradi. 5 bosqich -> REAKTOR GUMBURLAB YONADI (missiya yakuni).
// Saga finali: korpus germetik (19) — endi bosh reaktorni yoqib, butun bazani jonlantiramiz.
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const CX = 500, CY = 210, STAGES = 5, CODELEN = 3;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);
const isDigit = (k) => typeof k === 'number' || (typeof k === 'string' && /^[0-9]$/.test(k));
const KEYS = [['1', '2', '3', 'A'], ['4', '5', '6', 'B'], ['7', '8', '9', 'C'], ['*', '0', '#', 'D']];
const KX0 = 690, KY0 = 388, KC = 46;   // keypad geometriyasi

function radialVignette(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.34, size / 2, size / 2, size * 0.64);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(6,2,2,0.92)'); c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}

export function assembleReactor(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.46, bloomScale: 1.2, brightness: 1.02, blur: 6, quality: 5 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#08050a', '#0e0812', '#120a12', '#0c0810'])); skyC.addChild(sky);
  const root = new Container(); app.stage.addChild(root);

  // ===== REAKTOR KAMERASI (shisha germetik) =====
  const chamber = new Graphics();
  chamber.roundRect(300, 60, 400, 300, 16).fill(0x060a10).stroke({ width: 4, color: 0x1e2c38 });
  chamber.roundRect(300, 60, 400, 300, 16).stroke({ width: 1.5, color: 0x33485a });
  // sovutish quvurlari (kameraga kiruvchi)
  for (const sx of [300, 700]) { chamber.rect(sx === 300 ? 250 : 700, 120, 50, 14, 4).fill(0x1a2530).stroke({ width: 1, color: 0x2e3f4d }); chamber.rect(sx === 300 ? 250 : 700, 250, 50, 14, 4).fill(0x1a2530).stroke({ width: 1, color: 0x2e3f4d }); }
  root.addChild(chamber);
  // koolant oqimi (quvurlarda)
  const coolG = new Graphics(); root.addChild(coolG);

  // yadro halosi + halqalar + yadro sferasi
  const coreGlow = new Sprite(radialTexture('rgba(120,180,255,0.6)', 512)); coreGlow.anchor.set(0.5); coreGlow.x = CX; coreGlow.y = CY; coreGlow.width = coreGlow.height = 320; coreGlow.blendMode = 'add'; coreGlow.alpha = 0.12; root.addChild(coreGlow);
  const rings = [];
  for (let i = 0; i < 3; i++) { const r = new Graphics(); const rad = 96 - i * 22; r.ellipse(0, 0, rad, rad * (0.4 + i * 0.12)).stroke({ width: 3 - i * 0.5, color: [0x2e6ab0, 0x3a7ac0, 0x4a8ad0][i] }); r.x = CX; r.y = CY; root.addChild(r); rings.push(r); }
  const core = new Graphics(); root.addChild(core);          // dinamik yadro
  const coreSpark = new Sprite(radialTexture('rgba(200,230,255,0.95)', 128)); coreSpark.anchor.set(0.5); coreSpark.x = CX; coreSpark.y = CY; coreSpark.width = coreSpark.height = 60; coreSpark.blendMode = 'add'; root.addChild(coreSpark);

  // ogohlantirish strob chiroqlari (yon devor)
  const strobes = [];
  [[292, 90], [708, 90], [292, 330], [708, 330]].forEach(([x, y]) => { const g = new Graphics().circle(x, y, 6).fill(0xff3b2a); g.blendMode = 'add'; root.addChild(g); strobes.push({ g, ph: rnd(0, 6.28) }); });

  // ===== BOSHQARUV KONSOLI (oldingi) =====
  const console_ = new Graphics();
  console_.rect(0, 372, LW, LH - 372).fill(0x0a0e14);
  console_.rect(0, 372, LW, 3).fill({ color: 0x2a3a48, alpha: 0.6 });
  console_.poly([40, 380, LW - 40, 380, LW - 12, LH, 12, LH]).fill(0x11171f).stroke({ width: 1.5, color: 0x243441 });
  root.addChild(console_);

  // KOD DISPLEY (chapda) — bosqich + kirilayotgan kod
  const disp = new Graphics(); root.addChild(disp);
  const dispGlow = new Sprite(radialTexture('rgba(57,255,136,0.4)', 256)); dispGlow.anchor.set(0.5); dispGlow.x = 320; dispGlow.y = 440; dispGlow.width = 320; dispGlow.height = 130; dispGlow.blendMode = 'add'; dispGlow.alpha = 0.1; root.addChild(dispGlow);

  // RPM / HARORAT asboblari (o'rtada)
  const gauges = new Graphics(); root.addChild(gauges);
  const gaugeNeedles = [new Graphics(), new Graphics()];
  gaugeNeedles.forEach((n, i) => { n.x = 540 + i * 70; n.y = 470; n.pivot.set(0, 0); root.addChild(n); });

  // ===== 4x4 KEYPAD (fizik) =====
  const keypad = new Graphics(); root.addChild(keypad);
  keypad.roundRect(KX0 - 14, KY0 - 14, KC * 4 + 20, KC * 4 + 20, 8).fill(0x141b22).stroke({ width: 2, color: 0x2e3f4d });
  const keyGlow = new Graphics(); root.addChild(keyGlow);      // bosilgan tugma yorug'i
  const keyLabels = new Graphics(); root.addChild(keyLabels);  // (statik tugma korpuslari)
  for (let r = 0; r < 4; r++) for (let cc = 0; cc < 4; cc++) {
    const x = KX0 + cc * KC, y = KY0 + r * KC;
    keyLabels.roundRect(x, y, KC - 8, KC - 8, 5).fill(0x1e2732).stroke({ width: 1, color: 0x39485a });
    keyLabels.roundRect(x + 3, y + 3, KC - 14, 6, 3).fill({ color: 0xffffff, alpha: 0.05 });
  }

  const particles = makeParticles(root);
  const vign = new Sprite(radialVignette()); vign.alpha = 0.64; app.stage.addChild(vign);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffffff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  const scene = {
    app, sky, root, coolG, coreGlow, rings, core, coreSpark, strobes, disp, dispGlow, gauges, gaugeNeedles, keyGlow, particles, vign, flash,
    stage: 0, code: [], cursor: 0, prevKey: 'NONE', pressed: null, pressT: 0,
    won: false, ignite: 0, spin: 0, errT: 0, okT: 0, lastReset: 0, demoT: 0,
    newCode() { this.code = Array.from({ length: CODELEN }, () => String(Math.floor(rnd(0, 10)))); this.cursor = 0; },
    reset() { this.stage = 0; this.won = false; this.ignite = 0; this.spin = 0; this.newCode(); },
  };
  scene.newCode();
  return scene;
}

// bitta raqam bosilganda ishlov berish (ham real, ham demo uchun)
function registerDigit(scene, d, ctl) {
  if (scene.won) return;
  scene.pressed = d; scene.pressT = 0.18;
  if (d === scene.code[scene.cursor]) {
    scene.cursor++; scene.okT = 0.25; if (ctl.onDigit) ctl.onDigit();
    if (scene.cursor >= scene.code.length) {
      scene.stage++; scene.spin += 1; scene.okT = 0.6;
      scene.particles.burst(CX, CY, 0x6bffb0, 22, 200);
      if (ctl.onStage) ctl.onStage(scene.stage);
      if (scene.stage >= STAGES) {
        if (ctl.connected && ctl.mode !== 'intro') { scene.won = true; scene.ignite = 1; if (ctl.onWin) ctl.onWin(); }
        else { scene.stage = STAGES; scene.newCode(); }   // demo takrorlamasin
      } else scene.newCode();
    }
  } else { scene.cursor = 0; scene.errT = 0.5; if (ctl.onError) ctl.onError(); }
}

// ctl = { key, connected, mode, resetPulse, onDigit, onError, onStage, onWin }
export function reactorTick(scene, dt, t, ctl) {
  const { app, sky, root, coolG, coreGlow, rings, core, coreSpark, strobes, disp, dispGlow, gauges, gaugeNeedles, keyGlow, particles, vign, flash } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH); root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  vign.width = w; vign.height = h; flash.width = w; flash.height = h;
  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  const playing = (ctl.connected && !scene.won) || ctl.mode === 'intro';

  // KIRISH: keypad (ulangan) yoki demo (avto-teradi)
  if (ctl.connected) {
    const k = ctl.key === undefined || ctl.key === null ? 'NONE' : (typeof ctl.key === 'number' ? String(ctl.key) : ctl.key);
    if (k !== scene.prevKey) { if (isDigit(k) && playing) registerDigit(scene, String(k), ctl); scene.prevKey = k; }
  } else if (playing) {
    scene.demoT += dt;
    if (scene.demoT > 0.55 && scene.stage < STAGES) { scene.demoT = 0; registerDigit(scene, scene.code[scene.cursor], ctl); }
  }

  // taymerlar
  scene.pressT = Math.max(0, scene.pressT - dt); scene.okT = Math.max(0, scene.okT - dt); scene.errT = Math.max(0, scene.errT - dt);
  scene.spin = lerp(scene.spin, scene.stage, Math.min(1, dt * 3));
  if (scene.ignite > 0) scene.ignite = Math.min(2, scene.ignite + dt);

  // ===== YADRO (bosqichga qarab kuchayadi + ignite'da portlaydi) =====
  const lvl = scene.stage / STAGES;
  const spinSpeed = 0.4 + scene.spin * 0.6 + (scene.ignite > 0 ? scene.ignite * 3 : 0);
  rings.forEach((r, i) => { r.rotation += dt * spinSpeed * (i % 2 ? -1 : 1) * (1 + i * 0.3); r.scale.set(1 + (scene.ignite > 0 ? scene.ignite * 0.4 : 0)); });
  core.clear();
  const coreR = 22 + lvl * 14 + (scene.ignite > 0 ? scene.ignite * 60 : 0) + 2 * Math.sin(t * 10);
  const hot = scene.ignite > 0 ? 0xffffff : (lvl > 0.7 ? 0x9fe0ff : 0x4a8ad0);
  core.circle(CX, CY, coreR).fill({ color: hot, alpha: 0.9 });
  core.circle(CX, CY, coreR + 6).stroke({ width: 2, color: 0xaad0ff, alpha: 0.5 });
  coreGlow.alpha = 0.12 + lvl * 0.4 + (scene.ignite > 0 ? scene.ignite * 0.5 : 0); coreGlow.scale.set(1 + lvl * 0.3 + (scene.ignite > 0 ? scene.ignite : 0));
  coreSpark.alpha = 0.3 + lvl * 0.5; coreSpark.scale.set(1 + 0.3 * Math.sin(t * 12));
  if (scene.ignite > 0 && scene.ignite < 0.5 && Math.random() < 0.5) particles.burst(CX, CY, 0x9fe0ff, 10, 320);

  // koolant oqimi (bosqichga qarab tezlashadi)
  coolG.clear();
  for (const [px, dir] of [[262, 1], [712, -1]]) for (const py of [127, 257]) { for (let k = 0; k < 3; k++) { const kk = ((t * (0.4 + lvl) + k / 3) % 1); const cx = px + dir * kk * 34; coolG.circle(cx, py, 2.4).fill({ color: 0x4aa0ff, alpha: 0.6 * (1 - kk) }); } }

  // strob chiroqlari (ignite'da tez qizil)
  strobes.forEach((s) => { const fast = scene.ignite > 0 ? 18 : (scene.errT > 0 ? 20 : 5); s.g.alpha = (Math.sin(t * fast + s.ph) > 0.3 ? 0.9 : 0.1); s.g.tint = scene.errT > 0 ? 0xff2a1a : (scene.ignite > 0 ? 0xffd23a : 0xff5a3a); });

  // ===== KOD DISPLEY =====
  disp.clear();
  disp.roundRect(210, 400, 220, 88, 8).fill(0x04140c).stroke({ width: 2, color: scene.errT > 0 ? 0xff3b2a : 0x2a5a3a });
  disp.rect(220, 408, 200, 2).fill({ color: 0x39ff88, alpha: 0.3 });
  // bosqich indikatori
  for (let i = 0; i < STAGES; i++) disp.circle(226 + i * 16, 420, 5).fill({ color: i < scene.stage ? 0x6bffb0 : 0x1a3a2a, alpha: i < scene.stage ? 1 : 0.6 });
  // kod raqamlari (kirilganlari yashil)
  for (let i = 0; i < scene.code.length; i++) {
    const x = 250 + i * 56, y = 452;
    const entered = i < scene.cursor;
    disp.roundRect(x, y, 44, 30, 4).fill(entered ? 0x0e3a24 : 0x0a1a12).stroke({ width: 1.5, color: entered ? 0x39ff88 : (i === scene.cursor ? 0xffd23a : 0x1e4a34) });
  }
  dispGlow.alpha = 0.1 + scene.okT * 0.4;

  // ===== ASBOBLAR (RPM/HARORAT strelkalari) =====
  gauges.clear();
  ['RPM', 'TEMP'].forEach((_, i) => { const gx = 540 + i * 70, gy = 470; gauges.roundRect(gx - 26, gy - 24, 52, 40, 4).fill(0x0e141a).stroke({ width: 1.5, color: 0x2a3a48 }); gauges.rect(gx - 22, gy - 20, 44, 24, 2).fill(0xe8dcc0); gauges.rect(gx + 4, gy - 20, 18, 24, 1).fill({ color: 0xff5a4a, alpha: 0.25 }); });
  gaugeNeedles.forEach((n, i) => { n.clear(); n.moveTo(0, 4).lineTo(0, -20).stroke({ width: 1.6, color: 0xc21a1a }); n.rotation = lerp(-0.9, 0.9, clamp(lvl + (i ? 0.05 : 0) + 0.04 * Math.sin(t * 6 + i) + (scene.ignite > 0 ? 0.3 : 0), 0, 1)); });

  // ===== KEYPAD bosilgan tugma yorug'i =====
  keyGlow.clear();
  const pk = scene.pressed;
  if (scene.pressT > 0 && pk != null) {
    for (let r = 0; r < 4; r++) for (let cc = 0; cc < 4; cc++) if (KEYS[r][cc] === String(pk)) {
      const x = KX0 + cc * KC, y = KY0 + r * KC;
      keyGlow.roundRect(x, y, KC - 8, KC - 8, 5).fill({ color: scene.errT > 0 ? 0xff3b2a : 0x39ff88, alpha: 0.5 * (scene.pressT / 0.18) });
    }
  }
  // status LED keypad tepasida
  keyGlow.circle(KX0 + KC * 4 - 6, KY0 - 20, 3).fill({ color: scene.won ? 0x6bffb0 : (playing ? 0x39ff88 : 0x555), alpha: 0.5 + 0.5 * Math.sin(t * 4) });

  scene.flashT = scene.okT;
  flash.tint = scene.errT > 0 ? 0xff5a3a : (scene.ignite > 0 ? 0xffffff : 0x9fffcf);
  flash.alpha = scene.ignite > 0 ? clamp((scene.ignite - 0.1) * 0.5, 0, 0.5) : Math.max(scene.errT * 0.25, scene.okT * 0.3);

  particles.tick(dt);
}
