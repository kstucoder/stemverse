// greenhouseScene — VOLTRA "Aqlli Issiqxona" PixiJS olami.
// Sim (komponentda) hisoblaydi: temp, humid, growth, health, light, irrig, weather.
// Bu yerda faqat RENDER: shisha issiqxona, kunduz/tun osmon, o'sadigan ekinlar
// (so'lish bilan), purkagich tumani, qirov/issiqlik effekti, yomg'ir, tiklanayotgan
// shahar foni (chiroqlari yoniq — 12-dars payoff).
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000, LH = 560;
const GROUND = 470, N_CROPS = 5;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

function drawPlant(g, growth, health, t, seed) {
  g.clear();
  const h = 16 + growth * 86;
  const droop = (1 - health) * 0.6;
  const healthy = health > 0.45;
  const stemCol = healthy ? 0x3f8a34 : 0x7a6a34;
  const leafCol = healthy ? 0x4fae42 : 0x8a7a3a;
  const sway = Math.sin(t * 1.4 + seed) * (3 + growth * 6) * (1 - droop * 0.6);
  const topX = sway + droop * 22, topY = -h + droop * h * 0.35;
  g.moveTo(0, 0).quadraticCurveTo(sway * 0.5, -h * 0.5, topX, topY).stroke({ width: 3 + growth * 2, color: stemCol });
  const leafN = Math.max(1, Math.floor(1 + growth * 4));
  for (let i = 0; i < leafN; i++) {
    const k = (i + 1) / (leafN + 1);
    const lx = lerp(0, topX, k), ly = lerp(0, topY, k);
    const side = i % 2 === 0 ? 1 : -1;
    g.ellipse(lx + side * (7 + growth * 5), ly, 6 + growth * 5, 3.5 + growth * 2).fill({ color: leafCol, alpha: healthy ? 0.95 : 0.7 });
  }
  if (growth > 0.66 && healthy) { g.circle(topX, topY, 3.5 + growth * 3.5).fill(0xff5a4a).circle(topX - 1.5, topY - 1.5, 1.5).fill({ color: 0xffd0c0, alpha: 0.8 }); }
}

export function assembleGreenhouse(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.05, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const skyDay = new Sprite(gradTexture(['#173a6a', '#3f7ab0', '#8fb8d8', '#dfe8d8'])); skyC.addChild(skyDay);
  const skyNight = new Sprite(gradTexture(['#050a18', '#0a1230', '#10183a', '#141a2e'])); skyC.addChild(skyNight);
  const starC = new Container(); skyC.addChild(starC); const stars = [];
  for (let i = 0; i < 60; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random()).fill(0xeaf3ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random() * 0.4, b: 0.3 + Math.random() * 0.4, sp: 0.5 + Math.random() * 2, ph: Math.random() * 6.28 }); }
  const sun = new Sprite(radialTexture('rgba(255,230,150,0.95)', 256)); sun.anchor.set(0.5); sun.width = sun.height = 120; skyC.addChild(sun);
  const moon = new Sprite(radialTexture('rgba(200,215,255,0.7)', 256)); moon.anchor.set(0.5); moon.width = moon.height = 90; skyC.addChild(moon);

  const root = new Container(); app.stage.addChild(root);

  // tiklanayotgan shahar foni (chiroqlari yoniq)
  const cityBg = makeSkyline(90, 0x1a2438, 23); cityBg.alpha = 0.5; root.addChild(cityBg);
  const cityLights = [];
  for (let i = 0; i < 22; i++) { const g = new Graphics().rect(0, 0, 3, 4).fill(0xffd76a); g.x = 30 + Math.random() * 940; g.y = 360 + Math.random() * 80; g.alpha = 0.3 + Math.random() * 0.4; root.addChild(g); cityLights.push({ g, sp: 0.5 + Math.random() * 2, ph: Math.random() * 6.28, b: g.alpha }); }

  // issiqxona: orqa yorug'lik + tuproq to'shagi
  const houseGlow = new Sprite(radialTexture('rgba(140,220,160,0.18)', 512)); houseGlow.anchor.set(0.5, 1); houseGlow.width = 760; houseGlow.height = 420; houseGlow.x = LW / 2; houseGlow.y = GROUND + 40; houseGlow.blendMode = 'add'; root.addChild(houseGlow);
  const soil = new Graphics();
  soil.rect(150, GROUND, 700, 70).fill(0x2a1c12).rect(150, GROUND, 700, 6).fill(0x3a2818);
  for (let i = 0; i < 40; i++) soil.circle(160 + Math.random() * 680, GROUND + 8 + Math.random() * 54, 1.5 + Math.random() * 2).fill({ color: 0x000000, alpha: 0.2 });
  root.addChild(soil);

  // ekinlar
  const crops = [];
  for (let i = 0; i < N_CROPS; i++) { const g = new Graphics(); const c = new Container(); c.x = 230 + i * 108; c.y = GROUND + 6; c.addChild(g); root.addChild(c); crops.push({ c, g, seed: Math.random() * 6.28 }); }

  // purkagich tumani + yomg'ir
  const mist = makeParticles(root);
  const rainC = new Container(); root.addChild(rainC); const rain = [];
  for (let i = 0; i < 90; i++) { const g = new Graphics().moveTo(0, 0).lineTo(-2, 10).stroke({ width: 1, color: 0x9ecbff, alpha: 0.5 }); g.x = Math.random() * LW; g.y = Math.random() * LH; rainC.addChild(g); rain.push(g); } rainC.alpha = 0;

  // shisha issiqxona ramkasi (old, yarim-shaffof) — ekinlar ustidan
  const glass = new Graphics(); root.addChild(glass);
  const HX0 = 150, HX1 = 850, HY = 150, HYb = GROUND + 70, HXm = 500;
  glass.moveTo(HX0, HYb).lineTo(HX0, HY + 60).lineTo(HXm, HY).lineTo(HX1, HY + 60).lineTo(HX1, HYb).stroke({ width: 5, color: 0x8fb6c8, alpha: 0.5 });
  glass.rect(HX0, HY + 60, HX1 - HX0, HYb - (HY + 60)).fill({ color: 0xafd8e8, alpha: 0.04 });
  for (let x = HX0 + 100; x < HX1; x += 100) glass.moveTo(x, HY + 60 - (Math.abs(x - HXm) < 60 ? 40 : 0)).lineTo(x, HYb).stroke({ width: 1.5, color: 0x8fb6c8, alpha: 0.18 });
  glass.moveTo(HX0, HY + 60).lineTo(HXm, HY).lineTo(HX1, HY + 60).stroke({ width: 1.5, color: 0x8fb6c8, alpha: 0.22 });
  // kondensatsiya tomchilari
  for (let i = 0; i < 30; i++) glass.circle(HX0 + 20 + Math.random() * (HX1 - HX0 - 40), HY + 80 + Math.random() * (HYb - HY - 120), 1 + Math.random() * 1.5).fill({ color: 0xd8f0ff, alpha: 0.15 });

  // effekt overlaylari (qirov / issiqlik)
  const frost = new Graphics().rect(0, 0, 10, 10).fill(0xbfe0ff); frost.alpha = 0; frost.blendMode = 'add'; app.stage.addChild(frost);
  const heat = new Graphics().rect(0, 0, 10, 10).fill(0xff8a3a); heat.alpha = 0; heat.blendMode = 'add'; app.stage.addChild(heat);

  return { app, skyDay, skyNight, starC, stars, sun, moon, root, cityLights, houseGlow, crops, mist, rainC, rain, frost, heat };
}

// s = { temp, humid, growth, health, light, irrig, weather, connected }
export function greenhouseTick(scene, dt, t, s) {
  const { app, skyDay, skyNight, starC, stars, sun, moon, root, cityLights, houseGlow, crops, mist, rainC, rain, frost, heat } = scene;
  const w = app.screen.width, h = app.screen.height;
  skyDay.width = w; skyDay.height = h; skyNight.width = w; skyNight.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  [frost, heat].forEach((o) => { o.width = w; o.height = h; });

  // kun/tun
  const light = clamp(s.light ?? 0.6, 0, 1);
  skyNight.alpha = 1 - light;
  starC.alpha = 1 - light;
  stars.forEach((st) => { st.g.x = st.fx * w; st.g.y = st.fy * h; st.g.alpha = st.b * (0.4 + 0.5 * Math.sin(t * st.sp + st.ph)); });
  const ang = Math.PI * (1 - light);          // quyosh yoyi
  sun.x = w / 2 + Math.cos(ang) * w * 0.4; sun.y = h * 0.72 - Math.sin(Math.PI * light) * h * 0.55; sun.alpha = clamp(light * 1.4, 0, 1);
  moon.x = w / 2 - Math.cos(ang) * w * 0.4; moon.y = h * 0.72 - Math.sin(Math.PI * (1 - light)) * h * 0.5; moon.alpha = clamp((1 - light) * 1.2, 0, 1);

  cityLights.forEach((o) => { o.g.alpha = o.b * (0.6 + 0.4 * Math.sin(t * o.sp + o.ph)) * (0.4 + (1 - light) * 0.6); });
  houseGlow.alpha = 0.12 + clamp(s.growth ?? 0, 0, 1) * 0.22 + clamp(s.health ?? 1, 0, 1) * 0.05;

  // ekinlar
  crops.forEach((cr, i) => { const gr = clamp((s.growth ?? 0) - i * 0.02, 0, 1); drawPlant(cr.g, gr, clamp(s.health ?? 1, 0, 1), t, cr.seed); });

  // purkagich tumani (sug'orish yuqori bo'lsa)
  if ((s.irrig ?? 0) > 0.35 && Math.random() < 0.6) mist.burst(230 + Math.random() * 540, 168, 0xd8f0ff, 1, 30);
  mist.tick(dt);

  // yomg'ir
  const raining = s.weather === 'rain';
  rainC.alpha = lerp(rainC.alpha, raining ? 0.8 : 0, Math.min(dt * 2, 1));
  if (rainC.alpha > 0.02) rain.forEach((g) => { g.y += 520 * dt; g.x -= 90 * dt; if (g.y > LH) { g.y = -12; g.x = Math.random() * LW; } });

  // qirov / issiqlik overlaylari
  const temp = s.temp ?? 22;
  frost.alpha = clamp((16 - temp) / 14, 0, 0.42) * (0.8 + 0.2 * Math.sin(t * 2));
  heat.alpha = clamp((temp - 28) / 14, 0, 0.36) * (0.8 + 0.2 * Math.sin(t * 5));
}
