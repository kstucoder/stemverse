// dockScene — VOLTRA "Ta'minot Doklash" — REALISTIK kosmik doklash bazasi (rotary enkoder).
// Aperturadan sekin AYLANAYOTGAN ta'minot podi ko'rinadi (uning ulash kaliti bilan).
// Enkoder stansiyaning capture-halqasini buradi -> kalitni pod kalitiga TEKISLA,
// tugma bilan gidravlik qisqichlarni yop -> doklanadi. 5 dok -> baza ta'minlandi.
import { Container, Graphics, Sprite, Texture, TilingSprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
export const RCX = 500, RCY = 284, RING_R = 128, TOL = 15;
const AP_R = 118, HOUSE_R = 196;
const D2R = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const angleDiff = (a, b) => { let d = ((a - b + 540) % 360) - 180; return Math.abs(d); };

function vignetteTexture(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.32, size / 2, size / 2, size * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.7, 'rgba(0,0,0,0.32)'); g.addColorStop(1, 'rgba(1,2,6,0.92)');
  c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}
function noiseTexture(size = 64) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const img = c.createImageData(size, size); for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; } c.putImageData(img, 0, 0); return Texture.from(cv);
}

export function assembleDock(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.44, bloomScale: 1.12, brightness: 1.0, blur: 7, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  // ---- kosmik fon ----
  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#02030a', '#050815', '#080a1a', '#04050e'])); skyC.addChild(sky);
  const neb = new Sprite(radialTexture('rgba(70,60,150,0.16)', 512)); neb.anchor.set(0.5); neb.blendMode = 'add'; skyC.addChild(neb);
  const starC = new Container(); skyC.addChild(starC); const stars = [];
  for (let i = 0; i < 130; i++) { const g = new Graphics().circle(0, 0, 0.5 + Math.random() * 1.2).fill(0xcfe0ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random(), b: 0.3 + Math.random() * 0.5, sp: 0.4 + Math.random() * 2, ph: Math.random() * 6.28 }); }
  const planet = new Container(); skyC.addChild(planet);
  const pGlow = new Sprite(radialTexture('rgba(70,150,230,0.45)', 512)); pGlow.anchor.set(0.5); pGlow.width = pGlow.height = 360; pGlow.blendMode = 'add'; planet.addChild(pGlow);
  const pBody = new Graphics(); pBody.circle(0, 0, 96).fill(0x14304a).stroke({ width: 2, color: 0x2a5578, alpha: 0.5 });
  for (let i = 0; i < 6; i++) { const yy = -70 + i * 26; pBody.ellipse(0, yy, 94 - Math.abs(yy) * 0.35, 6).fill({ color: [0x1e4266, 0x285a80][i % 2], alpha: 0.5 }); }
  planet.addChild(pBody);
  const pCity = new Graphics(); for (let i = 0; i < 40; i++) { const a = Math.random() * 6.28, r = Math.random() * 90; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (x > 20) pCity.circle(x, y, 0.8).fill({ color: 0xffd76a, alpha: 0.6 }); } planet.addChild(pCity);
  planet.addChild(new Graphics().circle(-26, 6, 96).fill({ color: 0x02030a, alpha: 0.6 }));

  const root = new Container(); app.stage.addChild(root);

  // ---- stansiya korpusi (og'ir mexanik disk; markazda aperturaga TESHIK bo'ladi) ----
  const house = new Graphics(); root.addChild(house);
  house.circle(RCX, RCY, HOUSE_R).fill(0x0e161f).circle(RCX, RCY, HOUSE_R).stroke({ width: 4, color: 0x2a3f52 });
  for (let a = 0; a < 360; a += 30) { const rad = a * D2R; house.moveTo(RCX + Math.cos(rad) * (AP_R + 8), RCY + Math.sin(rad) * (AP_R + 8)).lineTo(RCX + Math.cos(rad) * (HOUSE_R - 4), RCY + Math.sin(rad) * (HOUSE_R - 4)).stroke({ width: 1.5, color: 0x22384a, alpha: 0.7 }); const br = (AP_R + HOUSE_R) / 2; house.circle(RCX + Math.cos(rad + 0.26) * br, RCY + Math.sin(rad + 0.26) * br, 2.5).fill(0x1a2c3a).stroke({ width: 1, color: 0x3a5a72, alpha: 0.6 }); }
  for (let a = 0; a < 360; a += 20) { const rad = a * D2R; const r1 = HOUSE_R - 18, r2 = HOUSE_R - 8; house.poly([RCX + Math.cos(rad) * r1, RCY + Math.sin(rad) * r1, RCX + Math.cos(rad + 0.12) * r2, RCY + Math.sin(rad + 0.12) * r2, RCX + Math.cos(rad - 0.12) * r2, RCY + Math.sin(rad - 0.12) * r2]).fill({ color: a % 40 === 0 ? 0xffd23f : 0x1a2634, alpha: 0.35 }); }
  for (let a = 0; a < 360; a += 90) { const rad = (a + 45) * D2R; house.moveTo(RCX + Math.cos(rad) * HOUSE_R, RCY + Math.sin(rad) * HOUSE_R).lineTo(RCX + Math.cos(rad) * (HOUSE_R + 40), RCY + Math.sin(rad) * (HOUSE_R + 40)).stroke({ width: 8, color: 0x1a2836 }); }

  // ---- aperturadan ko'rinadigan chuqur kosmos + POD (korpus ustidan) ----
  const apBack = new Graphics().circle(RCX, RCY, AP_R).fill(0x03040c).circle(RCX, RCY, AP_R).stroke({ width: 3, color: 0x33506a }); root.addChild(apBack);
  const apStars = new Container(); root.addChild(apStars); const apS = [];
  for (let i = 0; i < 30; i++) { const a = Math.random() * 6.28, r = Math.random() * AP_R; const g = new Graphics().circle(0, 0, 0.7).fill(0xbcd4ff); g.x = RCX + Math.cos(a) * r; g.y = RCY + Math.sin(a) * r; apStars.addChild(g); apS.push({ g, b: 0.3 + Math.random() * 0.5, sp: 0.5 + Math.random() * 2, ph: Math.random() * 6.28 }); }
  const pod = new Container(); pod.x = RCX; pod.y = RCY; root.addChild(pod);
  const podBody = new Graphics();
  podBody.roundRect(-58, -40, 116, 80, 14).fill(0x263647).stroke({ width: 3, color: 0x5a86a8 });
  podBody.roundRect(-42, -26, 30, 52, 6).fill(0x16242f);
  podBody.rect(-38, -6, 22, 12).fill({ color: 0x39c06a, alpha: 0.5 });
  podBody.roundRect(20, -22, 26, 44, 5).fill(0x1a2a38);
  podBody.roundRect(52, -20, 12, 14, 3).fill(0x11202a); podBody.roundRect(52, 6, 12, 14, 3).fill(0x11202a);
  pod.addChild(podBody);
  const thr1 = new Sprite(radialTexture('rgba(120,200,255,0.9)', 128)); thr1.anchor.set(0, 0.5); thr1.width = 40; thr1.height = 16; thr1.x = 64; thr1.y = -13; thr1.blendMode = 'add'; pod.addChild(thr1);
  const thr2 = new Sprite(radialTexture('rgba(120,200,255,0.9)', 128)); thr2.anchor.set(0, 0.5); thr2.width = 40; thr2.height = 16; thr2.x = 64; thr2.y = 13; thr2.blendMode = 'add'; pod.addChild(thr2);
  const podKey = new Graphics(); podKey.moveTo(-58, 0).lineTo(-92, -12).lineTo(-92, 12).closePath().fill(0xffd23f); pod.addChild(podKey);
  pod.addChild(new Graphics().circle(-4, -34, 2.5).fill(0x39ff88).circle(-4, 34, 2.5).fill(0xff3b46));
  const podMask = new Graphics().circle(RCX, RCY, AP_R).fill(0xffffff); root.addChild(podMask); pod.mask = podMask;

  // capture halqa (enkoder buradi) + doklash chiroqlari + qisqichlar + reticle + fx
  const collar = new Graphics(); root.addChild(collar);
  const gl = []; const glC = new Container(); root.addChild(glC);
  for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.28; const g = new Graphics(); g.x = RCX + Math.cos(a) * (AP_R + 22); g.y = RCY + Math.sin(a) * (AP_R + 22); glC.addChild(g); gl.push({ g, a }); }
  const clamps = new Graphics(); root.addChild(clamps);
  const reticle = new Graphics(); root.addChild(reticle);
  const fx = new Graphics(); root.addChild(fx);
  const particles = makeParticles(root);

  const strobes = [];
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { const g = new Sprite(radialTexture('rgba(255,180,40,0.9)', 128)); g.anchor.set(0.5); g.width = g.height = 40; g.x = RCX + sx * (HOUSE_R - 20); g.y = RCY + sy * (HOUSE_R - 20); g.blendMode = 'add'; g.alpha = 0; root.addChild(g); strobes.push({ g, ph: Math.random() * 6.28 }); });

  const vign = new Sprite(vignetteTexture()); vign.alpha = 0.8; app.stage.addChild(vign);
  const grain = new TilingSprite({ texture: noiseTexture(), width: 10, height: 10 }); grain.alpha = 0.04; grain.blendMode = 'add'; app.stage.addChild(grain);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffffff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  return { app, sky, neb, starC, stars, planet, root, apStars, apS, pod, thr1, thr2, collar, gl, clamps, reticle, fx, strobes, particles, vign, grain, flash };
}

// s = { collarAngle, targetAngle, aligned, lockPulse, docked, connected, flash, flashCol }
export function dockTick(scene, dt, t, s) {
  const { app, sky, neb, starC, stars, planet, root, apS, pod, thr1, thr2, collar, gl, clamps, reticle, strobes, particles, vign, grain, flash } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h; neb.x = w * 0.7; neb.y = h * 0.3; neb.width = neb.height = 620;
  planet.x = w * 0.16; planet.y = h * 0.82; planet.scale.set(clamp(Math.min(w, h) / 560, 0.7, 1.25));
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  vign.width = w; vign.height = h; grain.width = w; grain.height = h; grain.tilePosition.set(Math.random() * 64, Math.random() * 64); flash.width = w; flash.height = h;
  stars.forEach((st) => { st.g.x = st.fx * w; st.g.y = st.fy * h; st.g.alpha = st.b * (0.4 + 0.5 * Math.sin(t * st.sp + st.ph)); });
  apS.forEach((st) => { st.g.alpha = st.b * (0.4 + 0.5 * Math.sin(t * st.sp + st.ph)); });

  const aligned = !!s.aligned;
  const diff = angleDiff(s.collarAngle || 0, s.targetAngle || 0);
  const acol = aligned ? 0x39e06a : diff < 45 ? 0xffc21a : 0xff5a4a;

  pod.rotation = (s.targetAngle || 0) * D2R;
  const tf = 0.5 + 0.5 * Math.sin(t * 22);
  thr1.alpha = 0.3 + 0.4 * tf; thr2.alpha = 0.3 + 0.4 * (1 - tf);

  collar.clear();
  const ca = (s.collarAngle || 0) * D2R;
  const kcol = aligned ? 0x6bffa0 : 0x00eaff;
  collar.circle(RCX, RCY, AP_R + 12).stroke({ width: 8, color: 0x16242f });
  for (let i = 0; i < 36; i++) { const a = (i / 36) * 6.28 + ca; collar.moveTo(RCX + Math.cos(a) * (AP_R + 8), RCY + Math.sin(a) * (AP_R + 8)).lineTo(RCX + Math.cos(a) * (AP_R + 16), RCY + Math.sin(a) * (AP_R + 16)).stroke({ width: 2, color: 0x2c4a60 }); }
  collar.circle(RCX, RCY, AP_R + 12).stroke({ width: 2, color: kcol, alpha: 0.4 });
  const kx = RCX + Math.cos(ca) * (AP_R + 12), ky = RCY + Math.sin(ca) * (AP_R + 12);
  collar.poly([RCX + Math.cos(ca) * (AP_R - 2), RCY + Math.sin(ca) * (AP_R - 2), kx + Math.cos(ca + 1.6) * 12, ky + Math.sin(ca + 1.6) * 12, kx + Math.cos(ca - 1.6) * 12, ky + Math.sin(ca - 1.6) * 12]).fill(kcol);
  collar.circle(kx, ky, 5).fill(kcol);

  gl.forEach((l) => { const d = angleDiff(l.a / D2R, s.collarAngle || 0); const on = d < 40; const col = aligned ? 0x39e06a : d < 20 ? 0x6affe0 : 0x1f3a52; l.g.clear(); l.g.circle(0, 0, 3.5).fill(on ? col : 0x0e1a24).circle(0, 0, 3.5).stroke({ width: 1, color: on ? col : 0x1f3a52, alpha: 0.7 }); });

  clamps.clear();
  const close = clamp(s.lockPulse || 0, 0, 1);
  for (let i = 0; i < 4; i++) { const a = (i * 90 + 45) * D2R; const rr = HOUSE_R - 30; const bx = RCX + Math.cos(a) * rr, by = RCY + Math.sin(a) * rr; const tx = RCX + Math.cos(a) * (AP_R + 20 + (1 - close) * 40), ty = RCY + Math.sin(a) * (AP_R + 20 + (1 - close) * 40); clamps.moveTo(bx, by).lineTo(tx, ty).stroke({ width: 7, color: 0x33506a }); clamps.roundRect(tx - 8, ty - 8, 16, 16, 3).fill(0x3a5068).stroke({ width: 1, color: 0x5a7a9a }); }

  reticle.clear();
  reticle.circle(RCX, RCY, AP_R + 30).stroke({ width: 1.5, color: acol, alpha: 0.25 + (aligned ? 0.4 : 0) * (0.6 + 0.4 * Math.sin(t * 6)) });
  [0, 90, 180, 270].forEach((d) => { const a = d * D2R; reticle.moveTo(RCX + Math.cos(a) * (AP_R + 26), RCY + Math.sin(a) * (AP_R + 26)).lineTo(RCX + Math.cos(a) * (AP_R + 40), RCY + Math.sin(a) * (AP_R + 40)).stroke({ width: 2, color: acol, alpha: 0.5 }); });
  const ta = (s.targetAngle || 0) * D2R;
  reticle.circle(RCX + Math.cos(ta) * (AP_R + 12), RCY + Math.sin(ta) * (AP_R + 12), 8).stroke({ width: 2, color: aligned ? 0x39e06a : 0xffd23f, alpha: 0.85 });

  strobes.forEach((st) => { st.g.alpha = (0.15 + 0.5 * Math.abs(Math.sin(t * 3 + st.ph))) * (aligned ? 0.4 : 1); st.g.tint = aligned ? 0x39e06a : 0xffb028; });

  if (s.lockPulse > 0.6) { for (let k = 0; k < 4; k++) { const a = (k * 90 + 45) * D2R; particles.burst(RCX + Math.cos(a) * (AP_R + 24), RCY + Math.sin(a) * (AP_R + 24), 0xfff0c0, 3, 120); } }

  if (s.flash > 0) { flash.tint = s.flashCol ?? 0xffffff; flash.alpha = s.flash; } else flash.alpha = Math.max(0, flash.alpha - dt * 2);

  particles.tick(dt);
}
