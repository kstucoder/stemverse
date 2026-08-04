// dockScene — VOLTRA "Ta'minot Doklash" (ROTARY ENKODER bilan aylanma tekislash).
// Enkoder = pod ulash kalitini buradi. Dokning aylanuvchi SLOTiga kalitni burab
// tekisla, YASHIL bo'lganda tugma bilan MAHKAMLA -> doklanadi. 5 dok -> baza ta'minlandi.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
export const RCX = 500, RCY = 280, RING_R = 138, TOL = 15;
const D2R = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const angleDiff = (a, b) => { let d = ((a - b + 540) % 360) - 180; return Math.abs(d); };

export function assembleDock(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.46, bloomScale: 1.1, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#04060f', '#080c1a', '#0a0f1e', '#050810'])); skyC.addChild(sky);
  const starC = new Container(); skyC.addChild(starC); const stars = [];
  for (let i = 0; i < 90; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.3).fill(0xcfe0ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random(), b: 0.3 + Math.random() * 0.5, sp: 0.5 + Math.random() * 2, ph: Math.random() * 6.28 }); }

  const root = new Container(); app.stage.addChild(root);
  const planet = new Sprite(radialTexture('rgba(80,140,220,0.3)', 512)); planet.anchor.set(0.5, 1); planet.width = 900; planet.height = 300; planet.x = LW / 2; planet.y = LH; planet.blendMode = 'add'; root.addChild(planet);

  // POD tanasi (orqada)
  const pod = new Container(); pod.x = RCX; pod.y = RCY; root.addChild(pod);
  const pg = new Graphics();
  pg.roundRect(-118, -96, 236, 192, 24).fill(0x16202e).stroke({ width: 3, color: 0x33506e });
  pg.roundRect(-150, -30, 34, 60, 8).fill(0x1a2634); pg.roundRect(116, -30, 34, 60, 8).fill(0x1a2634); // yon panellar
  pg.rect(-70, -84, 140, 16, ).fill({ color: 0x39c06a, alpha: 0.4 });                                  // yuk (oziq) indikatori
  pod.addChild(pg);

  const glow = new Sprite(radialTexture('rgba(120,220,255,0.5)', 512)); glow.anchor.set(0.5); glow.width = glow.height = 400; glow.x = RCX; glow.y = RCY; glow.blendMode = 'add'; glow.alpha = 0.2; root.addChild(glow);

  // dok halqasi (tashqi, sobit) + slot
  const ring = new Graphics(); root.addChild(ring);
  // aylanuvchi kalit (enkoder)
  const key = new Graphics(); root.addChild(key);
  // markaz hub
  const hub = new Graphics(); root.addChild(hub);
  // qisqichlar (mahkamlashda yopiladi)
  const clamps = new Graphics(); root.addChild(clamps);

  const particles = makeParticles(root);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffffff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  return { app, sky, starC, stars, root, planet, pod, glow, ring, key, hub, clamps, particles, flash };
}

// s = { collarAngle, targetAngle, aligned, lockPulse, docked, connected, flash, flashCol }
export function dockTick(scene, dt, t, s) {
  const { app, sky, starC, stars, root, glow, ring, key, hub, clamps, particles, flash } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  flash.width = w; flash.height = h;
  stars.forEach((st) => { st.g.x = st.fx * w; st.g.y = st.fy * h; st.g.alpha = st.b * (0.4 + 0.5 * Math.sin(t * st.sp + st.ph)); });

  const aligned = !!s.aligned;
  const acol = aligned ? 0x39e06a : 0xffc21a;
  glow.alpha = 0.16 + (aligned ? 0.3 : 0) * (0.6 + 0.4 * Math.sin(t * 6)) + (s.lockPulse || 0) * 0.4;
  glow.tint = aligned ? 0x39e06a : 0x78c8ff;

  // tashqi dok halqasi + belgilar + SLOT (target)
  ring.clear();
  ring.circle(RCX, RCY, RING_R).stroke({ width: 10, color: 0x22364a });
  ring.circle(RCX, RCY, RING_R).stroke({ width: 3, color: 0x3a5a7a, alpha: 0.7 });
  for (let a = 0; a < 360; a += 30) { const rad = a * D2R; ring.moveTo(RCX + Math.cos(rad) * (RING_R - 12), RCY + Math.sin(rad) * (RING_R - 12)).lineTo(RCX + Math.cos(rad) * (RING_R + 12), RCY + Math.sin(rad) * (RING_R + 12)).stroke({ width: 2, color: 0x2c4a66, alpha: 0.6 }); }
  // slot (target) — halqada yoritilgan yoy
  const ta = (s.targetAngle || 0) * D2R;
  ring.arc(RCX, RCY, RING_R, ta - TOL * D2R, ta + TOL * D2R).stroke({ width: 12, color: acol, alpha: 0.5 + (aligned ? 0.4 : 0.2) * (0.6 + 0.4 * Math.sin(t * 5)) });
  ring.moveTo(RCX + Math.cos(ta) * (RING_R - 20), RCY + Math.sin(ta) * (RING_R - 20)).lineTo(RCX + Math.cos(ta) * (RING_R + 20), RCY + Math.sin(ta) * (RING_R + 20)).stroke({ width: 3, color: acol });

  // aylanuvchi kalit (collar) — enkoder burchagi
  key.clear();
  const ca = (s.collarAngle || 0) * D2R;
  const kcol = aligned ? 0x6bffa0 : 0x00eaff;
  key.circle(RCX, RCY, RING_R - 34).stroke({ width: 5, color: 0x1a2c3e });
  key.circle(RCX, RCY, RING_R - 34).stroke({ width: 2, color: kcol, alpha: 0.5 });
  // kalit tishi (pointer)
  const kx = RCX + Math.cos(ca) * (RING_R - 34), ky = RCY + Math.sin(ca) * (RING_R - 34);
  key.moveTo(RCX, RCY).lineTo(kx, ky).stroke({ width: 4, color: kcol, alpha: 0.85 });
  key.poly([kx + Math.cos(ca) * 22, ky + Math.sin(ca) * 22, kx + Math.cos(ca + 2.4) * 12, ky + Math.sin(ca + 2.4) * 12, kx + Math.cos(ca - 2.4) * 12, ky + Math.sin(ca - 2.4) * 12]).fill(kcol);

  // hub
  hub.clear();
  hub.circle(RCX, RCY, 26).fill(0x16222e).stroke({ width: 3, color: kcol, alpha: 0.7 });
  hub.circle(RCX, RCY, 10).fill(aligned ? 0x39e06a : 0x1f3a52);

  // qisqichlar (lockPulse'da yopiladi)
  clamps.clear();
  const close = s.lockPulse || 0;
  for (let i = 0; i < 4; i++) { const a = (i * 90 + 45) * D2R; const rr = RING_R + 26 - close * 22; const cx = RCX + Math.cos(a) * rr, cy = RCY + Math.sin(a) * rr; clamps.roundRect(cx - 9, cy - 6, 18, 12, 3).fill(0x3a5068).stroke({ width: 1, color: 0x5a7a9a }); }

  if (s.flash > 0) { flash.tint = s.flashCol ?? 0xffffff; flash.alpha = s.flash; }
  else flash.alpha = Math.max(0, flash.alpha - dt * 2);

  particles.tick(dt);
}
