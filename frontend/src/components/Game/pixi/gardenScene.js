// gardenScene — VOLTRA "Harorat Bog'i" PixiJS olami.
// TEMP sensori haroratni beradi. 20–30°C = mukammal zona: o'simliklar gullaydi,
// quyosh chiqadi, kapalaklar uchadi. Sovuqda (<20) qor yog'adi, o'simliklar uxlaydi;
// issiqda (>30) so'liydi, jaziрama. Mukammal zonada 30s ushlab tursang — to'liq gullaydi.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000, LH = 560;
const GY = 400;

const SKY = {
  cold: ['#0f1a3a', '#1a2a52', '#24406e'],
  perfect: ['#0a2a3a', '#1a5a6a', '#3a9a7a'],
  hot: ['#3a1400', '#7a3200', '#b45a10'],
};

function makePlant(x, flowerColor) {
  const c = new Container(); c.x = x; c.y = GY;
  const stem = new Graphics(); c.addChild(stem);
  const leafL = new Graphics().ellipse(0, 0, 11, 5).fill(0x2f9e4f); leafL.x = -3;
  const leafR = new Graphics().ellipse(0, 0, 11, 5).fill(0x38b85f); leafR.x = 3;
  c.addChild(leafL, leafR);
  const flower = new Container(); c.addChild(flower);
  const glow = new Sprite(radialTexture('rgba(255,255,255,0.7)', 128)); glow.anchor.set(0.5); glow.width = glow.height = 46; glow.tint = flowerColor;
  const petals = new Graphics();
  for (let p = 0; p < 6; p++) { const a = (p / 6) * Math.PI * 2; petals.ellipse(Math.cos(a) * 8, Math.sin(a) * 8, 6, 4).fill(flowerColor); }
  petals.circle(0, 0, 4).fill(0xffe14a);
  flower.addChild(glow, petals);
  return { c, stem, leafL, leafR, flower, glow, flowerColor, bloom: 0.1, sway: Math.random() * 6.28 };
}

export function assembleGarden(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.0, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const skyCold = new Sprite(gradTexture(SKY.cold));
  const skyPerfect = new Sprite(gradTexture(SKY.perfect));
  const skyHot = new Sprite(gradTexture(SKY.hot));
  skyPerfect.alpha = 0; skyHot.alpha = 0;
  skyC.addChild(skyCold, skyPerfect, skyHot);

  const root = new Container(); app.stage.addChild(root);

  // quyosh (mukammal) — issiqda qizaradi
  const sun = new Container(); sun.x = 800; sun.y = 120;
  const sunGlow = new Sprite(radialTexture('rgba(255,220,120,0.9)', 512)); sunGlow.anchor.set(0.5); sunGlow.width = sunGlow.height = 260;
  const sunBody = new Graphics().circle(0, 0, 34).fill(0xffe27a);
  sun.addChild(sunGlow, sunBody); sun.alpha = 0; root.addChild(sun);

  // uzoq shahar (uzviylik)
  const sky1 = makeSkyline(90, 0x14243e, 21); sky1.y = GY - 470; sky1.alpha = 0.4; root.addChild(sky1);

  // tuproq
  const ground = new Graphics().rect(0, GY, LW, LH - GY).fill(0x24331f).rect(0, GY, LW, 8).fill(0x2f4a28);
  for (let i = 0; i < 40; i++) ground.circle(Math.random() * LW, GY + 12 + Math.random() * (LH - GY - 12), 1.5).fill({ color: 0x3a5230, alpha: 0.5 });
  root.addChild(ground);

  // o'simliklar
  const COLORS = [0xff5bb5, 0xffd166, 0x00eeff, 0xff6b3d, 0x9b5de5, 0x39e06a];
  const plants = [];
  for (let i = 0; i < 6; i++) { const p = makePlant(120 + i * 150, COLORS[i % COLORS.length]); root.addChild(p.c); plants.push(p); }

  // termometr (chapda)
  const thermo = new Container(); thermo.x = 60; thermo.y = 150;
  thermo.addChild(new Graphics().roundRect(-13, -10, 26, 250, 13).fill(0x0c1420).roundRect(-13, -10, 26, 250, 13).stroke({ width: 2, color: 0x2a3346 }));
  thermo.addChild(new Graphics().roundRect(-7, 8 + (250 - 40) * (1 - 0.6), 14, 220, 7).fill({ color: 0x1a2432, alpha: 0.5 })); // tube bg
  // yashil mukammal zona belgisi (20-30 / 0-50 → 0.4..0.6)
  thermo.addChild(new Graphics().rect(-16, 8 + 220 * (1 - 0.6), 32, 220 * 0.2).fill({ color: 0x39e06a, alpha: 0.18 }));
  const merc = new Graphics(); thermo.addChild(merc);
  const bulb = new Graphics().circle(0, 250, 20).fill(0xff3b46); thermo.addChild(bulb);
  root.addChild(thermo);

  const particles = makeParticles(root);
  const snow = []; const snowC = new Container(); root.addChild(snowC);
  for (let i = 0; i < 60; i++) { const g = new Graphics().circle(0, 0, 1 + Math.random() * 1.6).fill(0xffffff); g.x = Math.random() * LW; g.y = Math.random() * GY; snowC.addChild(g); snow.push({ g, sp: 30 + Math.random() * 40, dx: Math.random() * 20 - 10 }); }
  const heat = new Sprite(radialTexture('rgba(255,120,0,0.25)', 512)); heat.anchor.set(0.5); heat.width = LW; heat.height = 300; heat.x = LW / 2; heat.y = GY - 40; heat.alpha = 0; root.addChild(heat);

  return { app, skyC, skyCold, skyPerfect, skyHot, root, sun, sunBody, sunGlow, plants, merc, bulb, particles, snow, snowC, heat, mixP: 0, mixH: 0 };
}

// ctl = { temp, zone, growth(0..1), connected }
export function gardenTick(scene, dt, t, ctl) {
  const { app, skyCold, skyPerfect, skyHot, root, sun, sunBody, plants, merc, bulb, particles, snow, snowC, heat } = scene;
  const w = app.screen.width, h = app.screen.height;
  [skyCold, skyPerfect, skyHot].forEach((s) => { s.width = w; s.height = h; });
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;

  const temp = ctl.connected ? (ctl.temp ?? 25) : 12;
  const zone = temp < 20 ? 'cold' : temp > 30 ? 'hot' : 'perfect';
  const growth = ctl.growth || 0;

  // osmon almashinuvi
  scene.mixP += (((zone === 'perfect') ? 1 : 0) - scene.mixP) * Math.min(dt * 1.5, 1);
  scene.mixH += (((zone === 'hot') ? 1 : 0) - scene.mixH) * Math.min(dt * 1.5, 1);
  skyPerfect.alpha = scene.mixP; skyHot.alpha = scene.mixH;
  sun.alpha = scene.mixP * (0.6 + 0.4 * Math.sin(t)) + scene.mixH; sun.y = 120 - scene.mixP * 10;
  sunBody.tint = zone === 'hot' ? 0xff7a3a : 0xffe27a;
  heat.alpha = scene.mixH * (0.5 + 0.2 * Math.sin(t * 5));

  // termometr simob (0-50°C → ustun)
  const frac = Math.max(0, Math.min(1, temp / 50));
  merc.clear();
  merc.roundRect(-7, 8 + 220 * (1 - frac), 14, 220 * frac + 12, 7).fill(zone === 'perfect' ? 0x39e06a : zone === 'hot' ? 0xff3b46 : 0x3b82ff);
  bulb.tint = zone === 'perfect' ? 0x39e06a : zone === 'hot' ? 0xff3b46 : 0x3b82ff;

  // o'simliklar
  plants.forEach((p, i) => {
    const targetBloom = zone === 'perfect' ? 0.5 + growth * 0.5 : zone === 'hot' ? 0.12 : 0.28;
    p.bloom += (targetBloom - p.bloom) * Math.min(dt * 1.2, 1);
    const stemH = 20 + p.bloom * 78;
    const droop = zone === 'hot' ? 18 * (1 - p.bloom) : 0;
    p.stem.clear();
    p.stem.moveTo(0, 0).quadraticCurveTo(droop * 0.5, -stemH * 0.6, droop, -stemH).stroke({ width: 4, color: zone === 'hot' ? 0x8a6a30 : 0x2f9e4f });
    p.leafL.x = -3 + droop * 0.4; p.leafL.y = -stemH * 0.5; p.leafR.x = 3 + droop * 0.4; p.leafR.y = -stemH * 0.62;
    p.leafL.tint = p.leafR.tint = zone === 'hot' ? 0x9a7a3a : 0xffffff;
    p.flower.x = droop; p.flower.y = -stemH;
    const open = Math.max(0, (p.bloom - 0.5) / 0.5);
    p.flower.scale.set(open); p.flower.rotation = Math.sin(t * 1.5 + p.sway) * 0.1;
    p.glow.alpha = open * (0.4 + 0.2 * Math.sin(t * 3 + i));
    if (zone === 'perfect' && open > 0.7 && Math.random() < 0.02) particles.burst(120 + i * 150 + droop, GY - stemH, p.flowerColor, 2, 60);
  });

  // qor (sovuq)
  snowC.alpha = zone === 'cold' ? 1 : Math.max(0, snowC.alpha - dt);
  if (snowC.alpha > 0.01) snow.forEach((s) => { s.g.y += s.sp * dt; s.g.x += s.dx * dt; if (s.g.y > GY) { s.g.y = -5; s.g.x = Math.random() * LW; } });
}
