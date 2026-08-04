// greenhouseScene — VOLTRA "Aqlli Issiqxona" — YOPIQ VERTIKAL GIDROPONIK FERMA.
// (8-darsdan farqli: u ochiq gulzor edi; bu — hi-tech ichki ferma: po'lat javonlar,
//  magenta grow-light panellari, gidroponik tovoqlar, quvurlar, purkagichlar,
//  ventilyatorlar, devor ekranlari va tashqariga qaraydigan deraza.)
// Sim (komponentda): temp, humid, growth, health, light, irrig, weather -> RENDER.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const SHELF_Y = [244, 338, 432];
const CROP_XS = [388, 470, 552, 634, 716, 798];

function drawLeafy(g, growth, health, t, seed) {
  g.clear();
  const healthy = health > 0.45;
  const R = 5 + growth * 15;
  const n = 4 + Math.floor(growth * 5);
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

  // --- po'lat devor panellari + zovurlar ---
  const wall = new Graphics();
  for (let x = 30; x < LW; x += 120) wall.rect(x, 20, 100, LH - 100).fill({ color: 0x121a20, alpha: 0.5 }).rect(x, 20, 100, LH - 100).stroke({ width: 1, color: 0x243038, alpha: 0.4 });
  for (let x = 30; x < LW; x += 120) for (let y = 40; y < LH - 90; y += 60) wall.circle(x + 6, y, 1.6).fill(0x2a3640);   // rivetlar
  root.addChild(wall);
  // pastki texnik zona
  root.addChild(new Graphics().rect(0, LH - 74, LW, 74).fill(0x0b0f13).rect(0, LH - 74, LW, 3).fill({ color: 0x2a3640, alpha: 0.7 }));

  // --- tashqariga qaraydigan deraza (ob-havo/tun shu yerda ko'rinadi) ---
  const WX = 44, WY = 62, WW = 250, WH = 150;
  const windowC = new Container(); root.addChild(windowC);
  const skyDay = new Sprite(gradTexture(['#245a8a', '#5a9ac0', '#a8c8d8'])); skyDay.x = WX; skyDay.y = WY; skyDay.width = WW; skyDay.height = WH; windowC.addChild(skyDay);
  const skyNight = new Sprite(gradTexture(['#050a18', '#0a1230', '#141a2e'])); skyNight.x = WX; skyNight.y = WY; skyNight.width = WW; skyNight.height = WH; windowC.addChild(skyNight);
  const winSun = new Sprite(radialTexture('rgba(255,230,150,0.9)', 256)); winSun.anchor.set(0.5); winSun.width = winSun.height = 90; winSun.x = WX + WW * 0.7; winSun.y = WY + WH * 0.4; windowC.addChild(winSun);
  const winCity = new Graphics();
  let cx = WX; while (cx < WX + WW) { const bw = 12 + Math.random() * 16, bh = 20 + Math.random() * 55; winCity.rect(cx, WY + WH - bh, bw, bh).fill(0x0c1622); if (Math.random() < 0.6) for (let k = 0; k < 3; k++) winCity.rect(cx + 2 + Math.random() * (bw - 5), WY + WH - bh + 4 + Math.random() * (bh - 8), 2, 2).fill({ color: 0xffd76a, alpha: 0.7 }); cx += bw + 3; }
  windowC.addChild(winCity);
  const winRainC = new Container(); windowC.addChild(winRainC); const winRain = [];
  for (let i = 0; i < 40; i++) { const g = new Graphics().moveTo(0, 0).lineTo(-2, 8).stroke({ width: 1, color: 0x9ecbff, alpha: 0.5 }); g.x = WX + Math.random() * WW; g.y = WY + Math.random() * WH; winRainC.addChild(g); winRain.push(g); } winRainC.alpha = 0;
  const winMask = new Graphics().rect(WX, WY, WW, WH).fill(0xffffff); root.addChild(winMask); windowC.mask = winMask;
  const winFrame = new Graphics();
  winFrame.rect(WX - 5, WY - 5, WW + 10, WH + 10).stroke({ width: 6, color: 0x2c3a44 });
  winFrame.moveTo(WX + WW / 2, WY).lineTo(WX + WW / 2, WY + WH).moveTo(WX, WY + WH / 2).lineTo(WX + WW, WY + WH / 2).stroke({ width: 3, color: 0x2c3a44, alpha: 0.8 });
  root.addChild(winFrame);
  root.addChild(new Graphics().rect(WX - 5, WY + WH + 5, WW + 10, 4).fill(0x1a2229)); // tokcha

  // --- devor ekranlari (dekorativ monitoring) ---
  const panels = [];
  [[WX + 20, WY + WH + 26], [WX + 130, WY + WH + 26]].forEach(([px, py], i) => {
    root.addChild(new Graphics().roundRect(px, py, 96, 40, 5).fill(0x0a1016).roundRect(px, py, 96, 40, 5).stroke({ width: 1.5, color: i ? 0x2b7de0 : 0x39c06a, alpha: 0.6 }));
    const bar = new Graphics(); root.addChild(bar); panels.push({ bar, px, py, col: i ? 0x2b7de0 : 0x39c06a });
  });

  // --- gidroponik javonlar (3 qavat) + grow-light + tovoq + ekinlar ---
  const growLights = [], crops = [], nozzles = [];
  SHELF_Y.forEach((sy, si) => {
    // grow-light nurini (magenta) — javon ustida
    const lg = new Sprite(radialTexture('rgba(255,60,150,0.85)', 256)); lg.anchor.set(0.5, 0); lg.width = 520; lg.height = 120; lg.x = 592; lg.y = sy - 60; lg.blendMode = 'add'; lg.alpha = 0.3; root.addChild(lg);
    // light bar
    root.addChild(new Graphics().roundRect(332, sy - 66, 520, 8, 3).fill(0x1a1420).roundRect(336, sy - 64, 512, 3, 2).fill({ color: 0xff3d8b, alpha: 0.9 }));
    growLights.push(lg);
    // javon beam + gidroponik tovoq (suv)
    root.addChild(new Graphics().rect(330, sy + 8, 524, 10, ).fill(0x1c262e).rect(330, sy + 6, 524, 3).fill(0x2c3a44));
    root.addChild(new Graphics().roundRect(348, sy - 2, 488, 10, 3).fill(0x123038).roundRect(348, sy - 2, 488, 4, 2).fill({ color: 0x2fa8c8, alpha: 0.5 }));  // suv tovog'i
    // purkagich nozzle (o'rtada)
    nozzles.push({ x: 592, y: sy - 58 });
    // ekinlar
    CROP_XS.forEach((x) => { const g = new Graphics(); const c = new Container(); c.x = x; c.y = sy; c.addChild(g); root.addChild(c); crops.push({ g, seed: Math.random() * 6.28 }); });
  });

  // yon quvurlar (gidroponik liniya)
  const pipes = new Graphics();
  pipes.moveTo(322, 180).lineTo(322, LH - 74).stroke({ width: 7, color: 0x1c262e });
  pipes.moveTo(862, 180).lineTo(862, LH - 74).stroke({ width: 7, color: 0x1c262e });
  SHELF_Y.forEach((sy) => { pipes.moveTo(322, sy + 12).lineTo(348, sy + 12).moveTo(862, sy + 12).lineTo(836, sy + 12).stroke({ width: 4, color: 0x243038 }); });
  root.addChild(pipes);

  // ventilyatorlar (iqlim) — aylanadi
  const fans = [];
  [[900, 150], [900, 420]].forEach(([fx, fy]) => {
    const c = new Container(); c.x = fx; c.y = fy; root.addChild(c);
    c.addChild(new Graphics().circle(0, 0, 26).fill(0x0c1218).circle(0, 0, 26).stroke({ width: 2, color: 0x2c3a44 }));
    const blades = new Graphics(); for (let b = 0; b < 4; b++) { const a = b * Math.PI / 2; blades.ellipse(Math.cos(a) * 12, Math.sin(a) * 12, 5, 12).fill({ color: 0x3a4a56, alpha: 0.9 }); } c.addChild(blades);
    fans.push(blades);
  });

  const mist = makeParticles(root);

  // effekt overlaylari
  const frost = new Graphics().rect(0, 0, 10, 10).fill(0xbfe0ff); frost.alpha = 0; frost.blendMode = 'add'; app.stage.addChild(frost);
  const heat = new Graphics().rect(0, 0, 10, 10).fill(0xff7a30); heat.alpha = 0; heat.blendMode = 'add'; app.stage.addChild(heat);

  return { app, bg, root, skyDay, skyNight, winSun, winRainC, winRain, panels, growLights, crops, nozzles, fans, mist, frost, heat };
}

// s = { temp, humid, growth, health, light, irrig, weather }
export function greenhouseTick(scene, dt, t, s) {
  const { app, bg, root, skyDay, skyNight, winSun, winRainC, winRain, panels, growLights, crops, nozzles, fans, mist, frost, heat } = scene;
  const w = app.screen.width, h = app.screen.height;
  bg.width = w; bg.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  [frost, heat].forEach((o) => { o.width = w; o.height = h; });

  const light = clamp(s.light ?? 0.6, 0, 1);
  const temp = s.temp ?? 22, growth = clamp(s.growth ?? 0, 0, 1), health = clamp(s.health ?? 1, 0, 1);

  // deraza: tun/kun + ob-havo
  skyNight.alpha = 1 - light;
  winSun.alpha = clamp(light * 1.3, 0, 1) * (s.weather === 'sun' ? 1 : 0.5);
  const raining = s.weather === 'rain';
  winRainC.alpha = lerp(winRainC.alpha, raining ? 0.85 : 0, Math.min(dt * 2, 1));
  if (winRainC.alpha > 0.02) winRain.forEach((g) => { g.y += 160 * dt; g.x -= 30 * dt; if (g.y > 212) { g.y = 62; g.x = 44 + Math.random() * 250; } });

  // grow-light rangi haroratga qarab (sovuq->ko'k, mo''tadil->magenta, issiq->amber)
  growLights.forEach((lg, i) => { lg.tint = temp < 16 ? 0x6a86ff : temp > 28 ? 0xffab40 : 0xff3d8b; lg.alpha = 0.26 + 0.1 * Math.sin(t * 3 + i) + growth * 0.12; });

  // ekinlar
  crops.forEach((cr, i) => { const gr = clamp(growth - (i % CROP_XS.length) * 0.015, 0, 1); drawLeafy(cr.g, gr, health, t, cr.seed); });

  // purkagich (sug'orish)
  if ((s.irrig ?? 0) > 0.35 && Math.random() < 0.7) { const nz = nozzles[Math.floor(Math.random() * nozzles.length)]; mist.burst(nz.x + (Math.random() - 0.5) * 200, nz.y + 6, 0xd8f0ff, 1, 26); }
  mist.tick(dt);

  // ventilyatorlar — issiqda tez aylanadi
  const fanSpd = 1.5 + clamp((temp - 20) / 12, 0, 1) * 8;
  fans.forEach((b) => { b.rotation += fanSpd * dt; });

  // devor ekranlari (temp/humid bar)
  panels.forEach((p, i) => { const v = i === 0 ? clamp((temp - 8) / 28, 0, 1) : clamp((s.humid ?? 50) / 100, 0, 1); p.bar.clear(); p.bar.rect(p.px + 8, p.py + 30 - 22 * v, 80, 22 * v).fill({ color: p.col, alpha: 0.5 }); p.bar.moveTo(p.px + 8, p.py + 30).lineTo(p.px + 88, p.py + 30).stroke({ width: 1, color: p.col, alpha: 0.4 }); });

  // qirov / issiqlik
  frost.alpha = clamp((16 - temp) / 14, 0, 0.4) * (0.8 + 0.2 * Math.sin(t * 2));
  heat.alpha = clamp((temp - 28) / 14, 0, 0.34) * (0.8 + 0.2 * Math.sin(t * 5));
}
