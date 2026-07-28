// gardenScene — VOLTRA "Harorat Bog'i" PixiJS olami (asteroid iqlim falokati).
// Shaharga asteroid qulab, iqlim izdan chiqqan: goh qahraton sovuq (qor bo'ron,
// muz), goh jazirama issiq (heat shimmer, qovjirash). Gullar endi ochilay deganda
// muzlaydi yoki qovjiraydi. TEMP 20–30°C 'oltin zona'da 30s ushlansa — gullaydi.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000, LH = 560;
const GY = 400;
const clamp = (v) => Math.max(0, Math.min(1, v));

const SKY = {
  cold: ['#0a1230', '#16224a', '#2a3a66'],
  perfect: ['#0a2a3a', '#1a5a6a', '#3a9a7a'],
  hot: ['#3a1200', '#7a2e00', '#c25410'],
};

function makePlant(x, flowerColor) {
  const c = new Container(); c.x = x; c.y = GY;
  const stem = new Graphics(); c.addChild(stem);
  const leafL = new Graphics().ellipse(0, 0, 11, 5).fill(0x2f9e4f); leafL.x = -3;
  const leafR = new Graphics().ellipse(0, 0, 11, 5).fill(0x38b85f); leafR.x = 3;
  c.addChild(leafL, leafR);
  const flower = new Container(); c.addChild(flower);
  const glow = new Sprite(radialTexture('rgba(255,255,255,0.7)', 128)); glow.anchor.set(0.5); glow.width = glow.height = 48; glow.tint = flowerColor;
  const petals = new Graphics();
  for (let p = 0; p < 6; p++) { const a = (p / 6) * Math.PI * 2; petals.ellipse(Math.cos(a) * 8, Math.sin(a) * 8, 6, 4).fill(flowerColor); }
  const bud = new Graphics().circle(0, 0, 5).fill(0x6a9e4a);   // g'uncha (doim ko'rinadi)
  const ice = new Graphics();                                  // muz kristallari
  flower.addChild(glow, petals, bud, ice);
  return { c, stem, leafL, leafR, flower, glow, petals, bud, ice, flowerColor, grown: 0, pf: 0, petalOpen: 0, sway: Math.random() * 6.28 };
}

export function assembleGarden(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.0, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const skyCold = new Sprite(gradTexture(SKY.cold));
  const skyPerfect = new Sprite(gradTexture(SKY.perfect)); skyPerfect.alpha = 0;
  const skyHot = new Sprite(gradTexture(SKY.hot)); skyHot.alpha = 0;
  skyC.addChild(skyCold, skyPerfect, skyHot);

  const root = new Container(); app.stage.addChild(root);

  const sun = new Container(); sun.x = 800; sun.y = 120;
  const sunGlow = new Sprite(radialTexture('rgba(255,220,120,0.9)', 512)); sunGlow.anchor.set(0.5); sunGlow.width = sunGlow.height = 260;
  const sunBody = new Graphics().circle(0, 0, 34).fill(0xffe27a);
  sun.addChild(sunGlow, sunBody); sun.alpha = 0; root.addChild(sun);

  // uzoq shahar (asteroid qulagan shahar)
  const sky1 = makeSkyline(90, 0x14243e, 21); sky1.y = GY - 470; sky1.alpha = 0.4; root.addChild(sky1);

  const ground = new Graphics().rect(0, GY, LW, LH - GY).fill(0x24331f).rect(0, GY, LW, 8).fill(0x2f4a28);
  for (let i = 0; i < 40; i++) ground.circle(Math.random() * LW, GY + 12 + Math.random() * (LH - GY - 12), 1.5).fill({ color: 0x3a5230, alpha: 0.5 });
  root.addChild(ground);
  // issiqda yer yorig'i / sovuqda muz sirtidan porlash
  const groundFx = new Graphics(); root.addChild(groundFx);

  const COLORS = [0xff5bb5, 0xffd166, 0x00eeff, 0xff6b3d, 0x9b5de5, 0x39e06a];
  const plants = [];
  for (let i = 0; i < 6; i++) { const p = makePlant(120 + i * 150, COLORS[i % COLORS.length]); root.addChild(p.c); plants.push(p); }

  // termometr
  const thermo = new Container(); thermo.x = 60; thermo.y = 150;
  thermo.addChild(new Graphics().roundRect(-13, -10, 26, 250, 13).fill(0x0c1420).roundRect(-13, -10, 26, 250, 13).stroke({ width: 2, color: 0x2a3346 }));
  thermo.addChild(new Graphics().rect(-16, 8 + 220 * (1 - 0.6), 32, 220 * 0.2).fill({ color: 0x39e06a, alpha: 0.18 }));
  const merc = new Graphics(); thermo.addChild(merc);
  const bulb = new Graphics().circle(0, 250, 20).fill(0xff3b46); thermo.addChild(bulb);
  root.addChild(thermo);

  const particles = makeParticles(root);

  // qor + shamol (bo'ron)
  const snow = []; const snowC = new Container(); root.addChild(snowC);
  for (let i = 0; i < 90; i++) { const g = new Graphics().circle(0, 0, 1 + Math.random() * 1.8).fill(0xffffff); g.x = Math.random() * LW; g.y = Math.random() * GY; snowC.addChild(g); snow.push({ g, sp: 40 + Math.random() * 60, sway: Math.random() * 6.28 }); }
  const windG = new Graphics(); root.addChild(windG);
  const haze = new Sprite(radialTexture('rgba(210,230,255,0.5)', 512)); haze.anchor.set(0.5); haze.width = LW * 1.4; haze.height = LH * 1.4; haze.x = LW / 2; haze.y = LH / 2; haze.alpha = 0; root.addChild(haze);

  // issiq: shimmer + embers
  const heat = new Sprite(radialTexture('rgba(255,120,0,0.3)', 512)); heat.anchor.set(0.5); heat.width = LW; heat.height = 320; heat.x = LW / 2; heat.y = GY - 40; heat.alpha = 0; root.addChild(heat);

  return {
    app, skyC, skyCold, skyPerfect, skyHot, root, sun, sunBody, sunGlow, plants, merc, bulb, particles,
    snow, snowC, windG, haze, heat, ground, groundFx,
    mixP: 0, mixH: 0, coldS: 0, hotS: 0, emberAcc: 0,
  };
}

// ctl = { temp, zone, growth(0..1), connected }
export function gardenTick(scene, dt, t, ctl) {
  const { app, skyCold, skyPerfect, skyHot, root, sun, sunBody, plants, merc, bulb, particles, snow, snowC, windG, haze, heat, groundFx } = scene;
  const w = app.screen.width, h = app.screen.height;
  [skyCold, skyPerfect, skyHot].forEach((s) => { s.width = w; s.height = h; });
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;

  const temp = ctl.connected ? (ctl.temp ?? 25) : 8;
  const zone = temp < 20 ? 'cold' : temp > 30 ? 'hot' : 'perfect';
  const growth = ctl.growth || 0;
  const coldF = clamp((20 - temp) / 24);   // qanchalik sovuq (0..1)
  const hotF = clamp((temp - 30) / 24);     // qanchalik issiq (0..1)
  scene.coldS += (coldF - scene.coldS) * Math.min(dt * 3, 1);
  scene.hotS += (hotF - scene.hotS) * Math.min(dt * 3, 1);

  // osmon
  scene.mixP += (((zone === 'perfect') ? 1 : 0) - scene.mixP) * Math.min(dt * 1.6, 1);
  scene.mixH += (scene.hotS - scene.mixH) * Math.min(dt * 2, 1);
  skyPerfect.alpha = scene.mixP; skyHot.alpha = scene.mixH;
  sun.alpha = scene.mixP * (0.6 + 0.4 * Math.sin(t)) + scene.hotS; sun.y = 120 - scene.mixP * 10;
  sunBody.tint = scene.hotS > 0.3 ? 0xff5a2a : 0xffe27a; sun.scale.set(1 + scene.hotS * 0.4);
  heat.alpha = scene.hotS * (0.5 + 0.25 * Math.sin(t * 5)); heat.y = GY - 40 + Math.sin(t * 3) * 6;

  // termometr
  const frac = clamp(temp / 50);
  merc.clear();
  merc.roundRect(-7, 8 + 220 * (1 - frac), 14, 220 * frac + 12, 7).fill(zone === 'perfect' ? 0x39e06a : zone === 'hot' ? 0xff3b46 : 0x3b82ff);
  bulb.tint = zone === 'perfect' ? 0x39e06a : zone === 'hot' ? 0xff3b46 : 0x3b82ff;

  // yer effekti: issiqda yoriqlar, sovuqda muz porlashi
  groundFx.clear();
  if (scene.hotS > 0.1) { for (let i = 0; i < 8; i++) { const gx = 60 + i * 120; groundFx.moveTo(gx, GY + 10).lineTo(gx + 14, GY + 30).lineTo(gx + 4, GY + 50).stroke({ width: 2, color: 0x5a1e08, alpha: scene.hotS * 0.6 }); } }
  if (scene.coldS > 0.1) groundFx.rect(0, GY, LW, LH - GY).fill({ color: 0xbfe0ff, alpha: scene.coldS * 0.14 });

  // o'simliklar — POYA BALANDLIGI = to'plangan progress (saqlanadi), GULBARG
  // faqat oltin zonada ochiladi; zonadan chiqsa yumiladi va muzlaydi/qovjiraydi.
  plants.forEach((p, i) => {
    p.grown += (growth - p.grown) * Math.min(dt * 2, 1);                        // haqiqiy progress (balandlik)
    p.pf += (((zone === 'perfect') ? 1 : 0) - p.pf) * Math.min(dt * 2.5, 1);    // hozirgi 'oltin zona' holati
    const stemH = 20 + p.grown * 74 + p.pf * 8;
    const droop = scene.hotS * 20 * (0.7 - p.grown * 0.3);
    p.stem.clear();
    p.stem.moveTo(0, 0).quadraticCurveTo(droop * 0.5, -stemH * 0.6, droop, -stemH).stroke({ width: 4, color: scene.hotS > 0.3 ? 0x8a6a30 : scene.coldS > 0.3 ? 0x6a8f7a : 0x2f9e4f });
    const leafTint = scene.hotS > 0.3 ? 0x9a7a3a : scene.coldS > 0.3 ? 0xbfe0ff : 0xffffff;
    p.leafL.x = -3 + droop * 0.4; p.leafL.y = -stemH * 0.5; p.leafR.x = 3 + droop * 0.4; p.leafR.y = -stemH * 0.62;
    p.leafL.tint = p.leafR.tint = leafTint;
    p.flower.x = droop; p.flower.y = -stemH;

    // gulbarglar faqat OLTIN ZONADA + progress bilan ochiladi (zonadan chiqsa yumiladi)
    const openTarget = (zone === 'perfect') ? clamp((p.grown - 0.1) / 0.9) : 0;
    p.petalOpen += (openTarget - p.petalOpen) * Math.min(dt * 3, 1);
    const po = p.petalOpen;
    p.bud.scale.set(0.7 + p.grown * 0.5 + p.pf * 0.22);                          // g'uncha shishadi (balandlik saqlanadi)
    p.bud.tint = scene.coldS > 0.35 ? 0xaad4ff : scene.hotS > 0.35 ? 0x7a4420 : (po > 0.4 ? 0xffe14a : 0x6a9e4a);
    p.petals.alpha = po; p.petals.scale.set(0.55 + po * 0.5); p.petals.rotation = Math.sin(t * 1.5 + p.sway) * 0.1;
    p.glow.alpha = po * (0.4 + 0.2 * Math.sin(t * 3 + i)); p.glow.tint = p.flowerColor;

    // muz kristallari (juda sovuqda — baland poyada ham)
    p.ice.clear();
    if (scene.coldS > 0.4) { const a = scene.coldS; for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2; p.ice.moveTo(0, 0).lineTo(Math.cos(ang) * 9, Math.sin(ang) * 9).stroke({ width: 1.5, color: 0xeaf6ff, alpha: a * 0.8 }); } p.ice.circle(0, 0, 3).fill({ color: 0xffffff, alpha: a * 0.7 }); }

    if (zone === 'perfect' && po > 0.7 && Math.random() < 0.02) particles.burst(120 + i * 150 + droop, GY - stemH, p.flowerColor, 2, 60);
  });

  // qor bo'ron
  snowC.alpha = scene.coldS;
  if (scene.coldS > 0.02) snow.forEach((s) => { s.sway += dt * 2; s.g.y += s.sp * dt * (0.6 + scene.coldS); s.g.x += (30 + scene.coldS * 120) * dt + Math.sin(s.sway) * 8 * dt; if (s.g.y > GY || s.g.x > LW) { s.g.y = -5; s.g.x = Math.random() * LW - 100; } });
  // shamol chiziqlari (bo'ron)
  windG.clear();
  if (scene.coldS > 0.3) { for (let i = 0; i < 10; i++) { const y = 40 + Math.random() * (GY - 40); const x = ((t * 400 + i * 140) % (LW + 200)) - 100; windG.moveTo(x, y).lineTo(x - 60 - scene.coldS * 60, y + 14).stroke({ width: 1.5, color: 0xeaf6ff, alpha: scene.coldS * 0.3 }); } }
  haze.alpha = Math.max(0, scene.coldS - 0.35) * 0.5;

  // issiq embers
  if (scene.hotS > 0.4) { scene.emberAcc += dt; if (scene.emberAcc > 0.08) { scene.emberAcc = 0; particles.burst(Math.random() * LW, GY + 6, [0xff7a2a, 0xffb03a, 0xff4a1a][Math.floor(Math.random() * 3)], 2, 70); } }
}
