// thereminScene — VOLTRA "Aurora Cholg'usi" PixiJS olami.
// LDR (yorug'lik sensori) → ovoz balandligi (pitch). Qo'l soyasi bilan yorug'lik
// nurini ko'tarib-tushirib 3 ta nishon-notaga moslashtirasan. Har nota tutilganda
// osmonda AURORA yoyiladi, olovqurtlar uyg'onadi, uyqudagi shahar chiroqlari
// musiqaga hamohang jonlanadi. 3 nota → shahar to'liq uyg'onadi.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000, LH = 560;
const PEDX = 500, PEDY = 470, YB = 452, YT = 96;
const mapY = (n) => YB - Math.max(0, Math.min(1, n)) * (YB - YT);

function hslHex(h, s, l) {
  h = (h % 360) / 360; const a = s * Math.min(l, 1 - l);
  const f = (n) => { const k = (n + h * 12) % 12; return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))); };
  return (Math.round(f(0) * 255) << 16) | (Math.round(f(8) * 255) << 8) | Math.round(f(4) * 255);
}

const rndi = (n) => Math.floor(Math.random() * n);
// har xil realistik bino — derazalari alohida boshqariladi (progress bilan uyg'onadi)
function makeCityBuilding(x) {
  const c = new Container(); c.x = x;
  const w = 90 + Math.round(Math.random() * 120);
  const floors = 2 + Math.floor(Math.random() * 6);
  const bh = 70 + floors * 40;
  const top = PEDY - bh;
  const facade = [0x0e1524, 0x121a2a, 0x161320, 0x101826][rndi(4)];
  c.addChild(new Graphics().rect(0, top, w, bh).fill(facade).rect(0, top, w, 4).fill({ color: 0x2a3546, alpha: 0.6 }));
  const wins = [];
  const cols = Math.max(2, Math.floor((w - 12) / 26));
  for (let f = 0; f < floors; f++) for (let cc = 0; cc < cols; cc++) {
    if (Math.random() < 0.15) continue;
    const g = new Graphics().roundRect(0, 0, 12, 17, 2).fill(Math.random() < 0.22 ? 0x8ff4ff : 0xffd76a);
    g.x = 8 + cc * ((w - 12) / cols); g.y = top + 14 + f * 40; g.alpha = 0;
    c.addChild(g);
    wins.push({ g, base: 0.5 + Math.random() * 0.5, ph: Math.random() * 6.28, sp: 0.5 + Math.random() * 2, always: Math.random() < 0.1 });
  }
  const d = new Graphics(); const r = Math.random();
  if (r < 0.28) { for (let i = 0; i < 2; i++) d.roundRect(12 + i * 40, top - 12, 26, 12, 2).fill(0x2a3346); }
  else if (r < 0.5) { const tx = w * 0.5; d.rect(tx - 15, top - 30, 30, 30).fill(0x3a2a1e); d.ellipse(tx, top - 30, 17, 6).fill(0x4a3626); }
  else if (r < 0.68) { const px = w * 0.5; d.moveTo(px, top).lineTo(px, top - 38).stroke({ width: 2, color: 0x3a4658 }); d.arc(px + 16, top - 8, 9, Math.PI * 1.1, Math.PI * 1.9).fill(0x2a3346); }
  else if (r < 0.85) { const ax = w * 0.5; d.moveTo(ax - 24, top).lineTo(ax, top - 24).lineTo(ax + 24, top).fill(0x3a2a22); const aw = new Graphics().roundRect(ax - 6, top - 16, 12, 12, 2).fill(0xffdf7a); aw.alpha = 0; c.addChild(aw); wins.push({ g: aw, base: 0.9, ph: Math.random() * 6.28, sp: 1, always: true }); }
  else { const chx = w * 0.62; d.rect(chx, top - 28, 13, 28).fill(0x3a241a); }
  c.addChild(d);
  return { c, w, wins };
}

export function assembleTheremin(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.38, bloomScale: 1.15, brightness: 1.0, blur: 7, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#04060f', '#0a0a22', '#0f0a2a', '#080814'])); skyC.addChild(sky);
  const starC = new Container(); skyC.addChild(starC);
  const stars = [];
  for (let i = 0; i < 100; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.5).fill(0xeaf3ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random() * 0.62, b: 0.3 + Math.random() * 0.5, sp: 0.6 + Math.random() * 2, ph: Math.random() * 6.28 }); }
  const moon = new Sprite(radialTexture('rgba(200,220,255,0.5)', 256)); moon.anchor.set(0.5); moon.width = moon.height = 130; skyC.addChild(moon);

  const root = new Container(); app.stage.addChild(root);

  const aurora = new Graphics(); root.addChild(aurora);      // osmon auroraси

  // uzoq dim skyline (chuqurlik) + har xil realistik binolar (uyquda, uyg'onadi)
  const sky1 = makeSkyline(150, 0x0a1428, 23); sky1.y = PEDY - 470; sky1.alpha = 0.28; root.addChild(sky1);
  const cityC = new Container(); root.addChild(cityC);
  const wins = [];
  let cbx = -40;
  while (cbx < LW + 40) { const b = makeCityBuilding(cbx); cityC.addChild(b.c); b.wins.forEach((wn) => wins.push(wn)); cbx += b.w + 6 + Math.random() * 26; }

  const beam = new Graphics(); root.addChild(beam);          // nur ustuni
  const target = new Graphics(); root.addChild(target);      // nishon halqasi

  const orb = new Container(); orb.x = PEDX;                  // pitch indikatori
  const oGlow = new Sprite(radialTexture('rgba(255,255,255,0.8)', 256)); oGlow.anchor.set(0.5); oGlow.width = oGlow.height = 130;
  const oCore = new Graphics().circle(0, 0, 15).fill(0xffffff);
  orb.addChild(oGlow, oCore); root.addChild(orb);

  // pedestal (cholg'u tagligi)
  const ped = new Container(); ped.x = PEDX; ped.y = PEDY; root.addChild(ped);
  ped.addChild(new Graphics().ellipse(0, 8, 60, 16).fill(0x0c1220).ellipse(0, 8, 60, 16).stroke({ width: 2, color: 0x2a3552 }));
  ped.addChild(new Graphics().moveTo(-26, 6).lineTo(-16, -34).lineTo(16, -34).lineTo(26, 6).fill(0x141c30).moveTo(-26, 6).lineTo(-16, -34).lineTo(16, -34).lineTo(26, 6).stroke({ width: 2, color: 0x2a3552 }));
  ped.addChild(new Graphics().poly([0, -60, 14, -40, 0, -28, -14, -40]).fill(0x9adfff).poly([0, -60, 14, -40, 0, -28, -14, -40]).stroke({ width: 1.5, color: 0xffffff, alpha: 0.7 })); // kristall

  const particles = makeParticles(root);

  // olovqurtlar
  const flies = []; const flyC = new Container(); root.addChild(flyC);
  for (let i = 0; i < 34; i++) { const g = new Graphics().circle(0, 0, 2).fill(0xbfffa0); g.x = Math.random() * LW; g.y = 140 + Math.random() * 300; g.alpha = 0; flyC.addChild(g); flies.push({ g, x: g.x, y: g.y, ph: Math.random() * 6.28, sp: 0.3 + Math.random() * 0.6 }); }

  return { app, skyC, sky, starC, stars, moon, root, aurora, wins, beam, target, orb, oGlow, oCore, ped, particles, flies, lastCapture: 0, awaken: 0 };
}

// ctl = { freqNorm, targetNorm, matched, captureProgress, capturePulse, progress, connected, noteIndex }
export function thereminTick(scene, dt, t, ctl) {
  const { app, sky, starC, stars, moon, root, aurora, wins, beam, target, orb, oGlow, oCore, particles, flies } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  moon.x = w * 0.16; moon.y = h * 0.2;
  stars.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.4 + 0.5 * Math.sin(t * s.sp + s.ph)); });

  const fn = ctl.connected ? (ctl.freqNorm || 0) : 0.04;
  const progress = ctl.progress || 0;
  scene.awaken += (progress - scene.awaken) * Math.min(dt * 1.2, 1);
  const fy = mapY(fn);
  const hue = 150 + fn * 180;
  const col = hslHex(hue, 0.8, 0.62);
  const intensity = 0.25 + fn * 0.55 + scene.awaken * 0.4 + (ctl.matched ? 0.25 : 0);

  // ---- aurora ribbonlari ----
  aurora.clear();
  const bands = 3;
  for (let b = 0; b < bands; b++) {
    const bh = hslHex(hue + b * 55, 0.75, 0.55);
    const yBase = 60 + b * 34;
    const amp = (18 + b * 8) * intensity;
    aurora.moveTo(0, yBase);
    for (let x = 0; x <= LW; x += 24) aurora.lineTo(x, yBase + Math.sin(x * 0.008 + t * (0.6 + b * 0.25) + b) * amp);
    for (let x = LW; x >= 0; x -= 24) aurora.lineTo(x, yBase + 40 + Math.sin(x * 0.008 + t * (0.6 + b * 0.25) + b + 1) * amp);
    aurora.fill({ color: bh, alpha: 0.05 + intensity * 0.12 });
  }

  // ---- shahar derazalari (progress bilan uyg'onadi + pitch pulsi) ----
  wins.forEach((wn) => {
    const base = wn.always ? 0.7 : (0.06 + scene.awaken * 0.85) * wn.base;
    const pulse = 0.35 * fn * Math.sin(t * (2 + wn.sp) + wn.ph);
    wn.g.alpha = Math.max(0, base + pulse) * (0.65 + 0.35 * Math.sin(t * wn.sp + wn.ph));
  });

  // ---- nur ustuni ----
  beam.clear();
  beam.moveTo(PEDX - 4, PEDY - 60).lineTo(PEDX - 14, fy).lineTo(PEDX + 14, fy).lineTo(PEDX + 4, PEDY - 60).fill({ color: col, alpha: 0.28 + fn * 0.3 });
  beam.roundRect(PEDX - 4, fy, 8, PEDY - 60 - fy, 4).fill({ color: col, alpha: 0.85 });

  // ---- pitch orb ----
  orb.y = fy; oCore.tint = col; oGlow.tint = col; oGlow.alpha = 0.4 + 0.2 * Math.sin(t * 5);
  orb.scale.set(1 + 0.1 * Math.sin(t * 6));

  // ---- nishon halqasi ----
  const ty = mapY(ctl.targetNorm || 0.5);
  const matched = ctl.matched;
  const tcol = matched ? 0x39e06a : 0xffc21a;
  target.clear();
  target.circle(PEDX, ty, 30).stroke({ width: 2, color: tcol, alpha: 0.35 });
  target.moveTo(PEDX - 150, ty).lineTo(PEDX - 40, ty).moveTo(PEDX + 40, ty).lineTo(PEDX + 150, ty).stroke({ width: 2, color: tcol, alpha: 0.7 });
  const cp = Math.max(0, Math.min(1, ctl.captureProgress || 0));
  if (cp > 0.01) target.arc(PEDX, ty, 30, -Math.PI / 2, -Math.PI / 2 + cp * Math.PI * 2).stroke({ width: 5, color: 0x39e06a, alpha: 0.95 });

  // ---- olovqurtlar ----
  flies.forEach((f) => {
    f.ph += dt * f.sp;
    const play = fn > 0.08 ? 1 : 0.3;
    const tx = fn > 0.15 ? PEDX + Math.cos(f.ph * 2) * 90 : f.x + Math.cos(f.ph) * 40;
    const tyy = fn > 0.15 ? fy + Math.sin(f.ph * 2) * 70 : f.y + Math.sin(f.ph) * 30;
    f.g.x += (tx - f.g.x) * Math.min(dt * 0.8, 1);
    f.g.y += (tyy - f.g.y) * Math.min(dt * 0.8, 1);
    f.g.alpha = (0.2 + scene.awaken * 0.6) * play * (0.5 + 0.5 * Math.sin(f.ph * 4));
    f.g.tint = hslHex(hue + 40, 0.6, 0.7);
  });

  // ---- nota tutildi — aurora portlashi ----
  if (ctl.capturePulse !== scene.lastCapture) {
    scene.lastCapture = ctl.capturePulse;
    particles.burst(PEDX, ty, 0x39e06a, 30, 220);
    for (let i = 0; i < 10; i++) particles.burst(PEDX + (Math.random() - 0.5) * 200, ty - Math.random() * 60, col, 3, 180);
  }
}
