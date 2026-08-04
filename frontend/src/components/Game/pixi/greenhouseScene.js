// greenhouseScene — VOLTRA "Aqlli Issiqxona" — YOPIQ VERTIKAL GIDROPONIK FERMA.
// Ichkarida hi-tech ferma (po'lat javonlar, magenta grow-light, gidroponika),
// tashqarida DERAZADAN falokat ko'rinadi: vayron shahar + TEZ o'zgaruvchi ob-havo
// (bo'ron/chaqmoq, kul yomg'iri, qahraton, jazirama). Ferma ekinlarni himoya qiladi.
// Sim (komponentda): temp, humid, growth, health, light, irrig, weather -> RENDER.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const SHELF_Y = [244, 338, 432];
const CROP_XS = [388, 470, 552, 634, 716, 798];
const WX = 44, WY = 62, WW = 250, WH = 152;

function drawLeafy(g, growth, health, t, seed) {
  g.clear();
  const healthy = health > 0.45;
  const R = 5 + growth * 15, n = 4 + Math.floor(growth * 5);
  const base = healthy ? 0x4fae42 : 0x9a8a3a, base2 = healthy ? 0x62c455 : 0xac9a4c;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.sin(t * 1.2 + seed) * 0.12;
    const lx = Math.cos(a) * R * 0.55, ly = -Math.abs(Math.sin(a)) * R - growth * 3;
    g.ellipse(lx, ly, 3.5 + growth * 3.5, 7 + growth * 7).fill({ color: i % 2 ? base : base2, alpha: healthy ? 0.95 : 0.68 });
  }
  g.circle(0, 0, 2.5 + growth * 2).fill(0x2e2016);
  if (growth > 0.72 && healthy) g.circle(0, -R * 0.55, 3 + growth * 2).fill(0xff6a4a);
}

export function assembleGreenhouse(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.46, bloomScale: 1.08, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const bgC = new Container(); app.stage.addChild(bgC);
  const bg = new Sprite(gradTexture(['#0a0e12', '#10161c', '#0c1116', '#080b0f'])); bgC.addChild(bg);
  const root = new Container(); app.stage.addChild(root);

  // po'lat devor + rivetlar
  const wall = new Graphics();
  for (let x = 30; x < LW; x += 120) wall.rect(x, 20, 100, LH - 100).fill({ color: 0x121a20, alpha: 0.5 }).rect(x, 20, 100, LH - 100).stroke({ width: 1, color: 0x243038, alpha: 0.4 });
  for (let x = 30; x < LW; x += 120) for (let y = 40; y < LH - 90; y += 60) wall.circle(x + 6, y, 1.6).fill(0x2a3640);
  root.addChild(wall);
  root.addChild(new Graphics().rect(0, LH - 74, LW, 74).fill(0x0b0f13).rect(0, LH - 74, LW, 3).fill({ color: 0x2a3640, alpha: 0.7 }));

  // ===== DERAZA: tashqaridagi FALOKAT + TEZ ob-havo =====
  const windowC = new Container(); root.addChild(windowC);
  const winSky = new Sprite(gradTexture(['#1a1626', '#3a2a2e', '#5a3a30'])); winSky.x = WX; winSky.y = WY; winSky.width = WW; winSky.height = WH; windowC.addChild(winSky);
  const winNight = new Sprite(gradTexture(['#05060f', '#0a0c1a', '#12101e'])); winNight.x = WX; winNight.y = WY; winNight.width = WW; winNight.height = WH; windowC.addChild(winNight);
  const redGlow = new Sprite(radialTexture('rgba(255,90,30,0.75)', 256)); redGlow.anchor.set(0.5, 1); redGlow.width = 180; redGlow.height = 120; redGlow.x = WX + WW * 0.62; redGlow.y = WY + WH; redGlow.blendMode = 'add'; redGlow.alpha = 0.5; windowC.addChild(redGlow);
  // vayron shahar silueti
  const dcity = new Graphics();
  let cx = WX; while (cx < WX + WW) {
    const bw = 12 + Math.random() * 18, bh = 20 + Math.random() * 62, bx = cx;
    if (Math.random() < 0.55) { dcity.moveTo(bx, WY + WH); dcity.lineTo(bx, WY + WH - bh); for (let s = 1; s <= 4; s++) dcity.lineTo(bx + (bw) * (s / 4), WY + WH - bh + (Math.random() * 22 - 6)); dcity.lineTo(bx + bw, WY + WH); dcity.closePath().fill(0x0a0d14); }
    else dcity.rect(bx, WY + WH - bh, bw, bh).fill(0x0a0d14);
    cx += bw + 3;
  }
  windowC.addChild(dcity);
  // tutun ustunlari
  const smoke = [];
  for (let i = 0; i < 3; i++) { const s = new Sprite(radialTexture('rgba(60,55,60,0.5)', 256)); s.anchor.set(0.5, 1); s.width = 70; s.height = 150; s.x = WX + 40 + i * 80; s.y = WY + WH; windowC.addChild(s); smoke.push({ s, ph: Math.random() * 6.28, x0: s.x }); }
  // ob-havo overlaylari (tez cross-fade)
  const mkOv = (col) => { const g = new Graphics().rect(WX, WY, WW, WH).fill(col); g.alpha = 0; windowC.addChild(g); return g; };
  const wStorm = mkOv(0x121c30), wAsh = mkOv(0x6a3418), wCold = mkOv(0x35597f), wHeat = mkOv(0xc2500e);
  wStorm.blendMode = wCold.blendMode = 'normal'; wAsh.blendMode = wHeat.blendMode = 'add';
  // yog'in zarralari (yomg'ir chiziqlari + kul/qor nuqtalari)
  const wLines = []; for (let i = 0; i < 34; i++) { const g = new Graphics().moveTo(0, 0).lineTo(-2, 9).stroke({ width: 1, color: 0x9ecbff, alpha: 0.55 }); g.x = WX + Math.random() * WW; g.y = WY + Math.random() * WH; g.alpha = 0; windowC.addChild(g); wLines.push(g); }
  const wDots = []; for (let i = 0; i < 30; i++) { const g = new Graphics().circle(0, 0, 1.4).fill(0xffffff); g.x = WX + Math.random() * WW; g.y = WY + Math.random() * WH; g.alpha = 0; windowC.addChild(g); wDots.push({ g, vx: -8 - Math.random() * 12, vy: 18 + Math.random() * 26 }); }
  const winMask = new Graphics().rect(WX, WY, WW, WH).fill(0xffffff); root.addChild(winMask); windowC.mask = winMask;
  // ramka
  const winFrame = new Graphics();
  winFrame.rect(WX - 5, WY - 5, WW + 10, WH + 10).stroke({ width: 6, color: 0x2c3a44 });
  winFrame.moveTo(WX + WW / 2, WY).lineTo(WX + WW / 2, WY + WH).moveTo(WX, WY + WH / 2).lineTo(WX + WW, WY + WH / 2).stroke({ width: 3, color: 0x2c3a44, alpha: 0.8 });
  root.addChild(winFrame);
  root.addChild(new Graphics().rect(WX - 5, WY + WH + 5, WW + 10, 4).fill(0x1a2229));

  // devor ekranlari (monitoring)
  const panels = [];
  [[WX + 20, WY + WH + 26], [WX + 130, WY + WH + 26]].forEach(([px, py], i) => {
    root.addChild(new Graphics().roundRect(px, py, 96, 40, 5).fill(0x0a1016).roundRect(px, py, 96, 40, 5).stroke({ width: 1.5, color: i ? 0x2b7de0 : 0x39c06a, alpha: 0.6 }));
    const bar = new Graphics(); root.addChild(bar); panels.push({ bar, px, py, col: i ? 0x2b7de0 : 0x39c06a });
  });

  // gidroponik javonlar (3 qavat) + grow-light + ekinlar
  const growLights = [], crops = [], nozzles = [];
  SHELF_Y.forEach((sy) => {
    const lg = new Sprite(radialTexture('rgba(255,60,150,0.85)', 256)); lg.anchor.set(0.5, 0); lg.width = 520; lg.height = 120; lg.x = 592; lg.y = sy - 60; lg.blendMode = 'add'; lg.alpha = 0.3; root.addChild(lg);
    root.addChild(new Graphics().roundRect(332, sy - 66, 520, 8, 3).fill(0x1a1420).roundRect(336, sy - 64, 512, 3, 2).fill({ color: 0xff3d8b, alpha: 0.9 }));
    growLights.push(lg);
    root.addChild(new Graphics().rect(330, sy + 8, 524, 10).fill(0x1c262e).rect(330, sy + 6, 524, 3).fill(0x2c3a44));
    root.addChild(new Graphics().roundRect(348, sy - 2, 488, 10, 3).fill(0x123038).roundRect(348, sy - 2, 488, 4, 2).fill({ color: 0x2fa8c8, alpha: 0.5 }));
    nozzles.push({ x: 592, y: sy - 58 });
    CROP_XS.forEach((x) => { const g = new Graphics(); const c = new Container(); c.x = x; c.y = sy; c.addChild(g); root.addChild(c); crops.push({ g, seed: Math.random() * 6.28 }); });
  });
  const pipes = new Graphics();
  pipes.moveTo(322, 180).lineTo(322, LH - 74).stroke({ width: 7, color: 0x1c262e });
  pipes.moveTo(862, 180).lineTo(862, LH - 74).stroke({ width: 7, color: 0x1c262e });
  SHELF_Y.forEach((sy) => { pipes.moveTo(322, sy + 12).lineTo(348, sy + 12).moveTo(862, sy + 12).lineTo(836, sy + 12).stroke({ width: 4, color: 0x243038 }); });
  root.addChild(pipes);
  const fans = [];
  [[900, 150], [900, 420]].forEach(([fx, fy]) => {
    const c = new Container(); c.x = fx; c.y = fy; root.addChild(c);
    c.addChild(new Graphics().circle(0, 0, 26).fill(0x0c1218).circle(0, 0, 26).stroke({ width: 2, color: 0x2c3a44 }));
    const blades = new Graphics(); for (let b = 0; b < 4; b++) { const a = b * Math.PI / 2; blades.ellipse(Math.cos(a) * 12, Math.sin(a) * 12, 5, 12).fill({ color: 0x3a4a56, alpha: 0.9 }); } c.addChild(blades);
    fans.push(blades);
  });

  const mist = makeParticles(root);
  const frost = new Graphics().rect(0, 0, 10, 10).fill(0xbfe0ff); frost.alpha = 0; frost.blendMode = 'add'; app.stage.addChild(frost);
  const heat = new Graphics().rect(0, 0, 10, 10).fill(0xff7a30); heat.alpha = 0; heat.blendMode = 'add'; app.stage.addChild(heat);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xdfe8ff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  return { app, bg, root, winNight, redGlow, smoke, wStorm, wAsh, wCold, wHeat, wLines, wDots, panels, growLights, crops, nozzles, fans, mist, frost, heat, flash, lightAcc: 0 };
}

// s = { temp, humid, growth, health, light, irrig, weather }
export function greenhouseTick(scene, dt, t, s) {
  const { app, bg, root, winNight, redGlow, smoke, wStorm, wAsh, wCold, wHeat, wLines, wDots, panels, growLights, crops, nozzles, fans, mist, frost, heat, flash } = scene;
  const w = app.screen.width, h = app.screen.height;
  bg.width = w; bg.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  [frost, heat, flash].forEach((o) => { o.width = w; o.height = h; });

  const light = clamp(s.light ?? 0.6, 0, 1);
  const temp = s.temp ?? 22, growth = clamp(s.growth ?? 0, 0, 1), health = clamp(s.health ?? 1, 0, 1);
  const wx = s.weather || 'clear';

  // deraza: tun + falokat shu'lasi + tutun
  winNight.alpha = 1 - light;
  redGlow.alpha = 0.35 + 0.2 * Math.sin(t * 3) + (wx === 'ash' ? 0.25 : 0);
  smoke.forEach((o, i) => { o.s.x = o.x0 + Math.sin(t * 0.5 + o.ph) * 8; o.s.alpha = 0.3 + 0.15 * Math.sin(t * 0.8 + i); });

  // ===== TEZ ob-havo cross-fade =====
  const ease = Math.min(dt * 3.2, 1);   // tez o'tish
  wStorm.alpha = lerp(wStorm.alpha, wx === 'storm' ? 0.5 : 0, ease);
  wCold.alpha = lerp(wCold.alpha, wx === 'cold' ? 0.5 : 0, ease);
  wAsh.alpha = lerp(wAsh.alpha, wx === 'ash' ? 0.42 : 0, ease);
  wHeat.alpha = lerp(wHeat.alpha, wx === 'heat' ? 0.4 : 0, ease);
  // yomg'ir chiziqlari (storm)
  const rainOn = wx === 'storm' ? 0.9 : 0;
  wLines.forEach((g) => { g.alpha = lerp(g.alpha, rainOn, ease); if (g.alpha > 0.05) { g.y += 230 * dt; g.x -= 50 * dt; if (g.y > WY + WH) { g.y = WY; g.x = WX + Math.random() * WW; } } });
  // kul(ash)/qor(cold) nuqtalari
  const dotsOn = (wx === 'ash' || wx === 'cold') ? 0.9 : 0;
  const dotCol = wx === 'ash' ? 0xff8a3a : 0xdfeeff;
  wDots.forEach((o) => { o.g.alpha = lerp(o.g.alpha, dotsOn, ease); o.g.tint = dotCol; if (o.g.alpha > 0.05) { o.g.x += o.vx * dt; o.g.y += o.vy * dt; if (o.g.y > WY + WH) { o.g.y = WY; o.g.x = WX + Math.random() * WW; } if (o.g.x < WX) o.g.x = WX + WW; } });
  // chaqmoq (storm) — vaqti-vaqti bilan yorug'lik
  scene.lightAcc -= dt;
  if (wx === 'storm' && scene.lightAcc <= 0) { scene.lightAcc = 1.5 + Math.random() * 3; flash.alpha = 0.5; }
  flash.alpha = Math.max(0, flash.alpha - dt * 2.2);

  // grow-light rangi (haqiqiy haroratga qarab)
  growLights.forEach((lg, i) => { lg.tint = temp < 16 ? 0x6a86ff : temp > 28 ? 0xffab40 : 0xff3d8b; lg.alpha = 0.26 + 0.1 * Math.sin(t * 3 + i) + growth * 0.12; });

  // ekinlar
  crops.forEach((cr, i) => { const gr = clamp(growth - (i % CROP_XS.length) * 0.015, 0, 1); drawLeafy(cr.g, gr, health, t, cr.seed); });

  // purkagich
  if ((s.irrig ?? 0) > 0.35 && Math.random() < 0.7) { const nz = nozzles[Math.floor(Math.random() * nozzles.length)]; mist.burst(nz.x + (Math.random() - 0.5) * 200, nz.y + 6, 0xd8f0ff, 1, 26); }
  mist.tick(dt);

  // ventilyatorlar
  const fanSpd = 1.5 + clamp((temp - 20) / 12, 0, 1) * 8;
  fans.forEach((b) => { b.rotation += fanSpd * dt; });

  // devor ekranlari
  panels.forEach((p, i) => { const v = i === 0 ? clamp((temp - 8) / 28, 0, 1) : clamp((s.humid ?? 50) / 100, 0, 1); p.bar.clear(); p.bar.rect(p.px + 8, p.py + 30 - 22 * v, 80, 22 * v).fill({ color: p.col, alpha: 0.5 }); p.bar.moveTo(p.px + 8, p.py + 30).lineTo(p.px + 88, p.py + 30).stroke({ width: 1, color: p.col, alpha: 0.4 }); });

  // qirov / issiqlik (haqiqiy haroratga qarab)
  frost.alpha = clamp((16 - temp) / 14, 0, 0.4) * (0.8 + 0.2 * Math.sin(t * 2));
  heat.alpha = clamp((temp - 28) / 14, 0, 0.34) * (0.8 + 0.2 * Math.sin(t * 5));
}
