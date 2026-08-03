// robotArmScene — VOLTRA "Xavfli Yuk: Robot Qo'l" PixiJS olami (realistik 2-servo).
// Digital Twin: apparatdagi 2 servo AYNAN aks etadi:
//   base.write(map(POT1,0,1023,0,180))  -> ELKA burchagi (B)
//   elbow.write(map(POT2,0,1023,0,180)) -> TIRSAK burchagi (E)
// Forward kinematika bilan griper uchi hisoblanadi. TUGMA -> griper (ushla/qo'y).
// Griperni xavfli idish ustiga keltirib ushla, qo'rg'oshin konteynerga joyla.
import { Container, Graphics, Sprite, Texture, TilingSprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
export const PIVOT_X = 500, PIVOT_Y = 470;
export const L1 = 140, L2 = 125;            // yuqori segment + bilak uzunligi
export const GRAB_TOL = 46, DROP_TOL = 66;

// xavfli idishlar + qo'rg'oshin konteyner (ekran koordinatalari — yetib boradigan)
export const CANS = [{ x: 620, y: 252 }, { x: 500, y: 232 }, { x: 392, y: 252 }];
export const CONTAIN = { x: 330, y: 300 };

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const mapRange = (v, a, b, c, d) => c + (clamp(v, Math.min(a, b), Math.max(a, b)) - a) * (d - c) / (b - a);

// forward kinematika: B=elka(deg), E=tirsak(deg) -> {elbow, tip} ekran nuqtalari
export function forwardArm(B, E) {
  const th1 = B * D2R;
  const ex = L1 * Math.cos(th1), ey = L1 * Math.sin(th1);
  const th2 = th1 - (180 - E) * D2R;
  const tx = ex + L2 * Math.cos(th2), ty = ey + L2 * Math.sin(th2);
  return { elbow: { x: PIVOT_X + ex, y: PIVOT_Y - ey }, tip: { x: PIVOT_X + tx, y: PIVOT_Y - ty } };
}
// inverse: ekran nuqta -> {B,E} (elbow-up). Intro qo'lni nishonga olib borishi uchun.
export function solveArm(sx, sy) {
  const mx = sx - PIVOT_X, my = PIVOT_Y - sy;
  let d = clamp(Math.hypot(mx, my), Math.abs(L1 - L2) + 2, L1 + L2 - 2);
  const phi = Math.atan2(my, mx) * R2D;
  const A = Math.acos(clamp((d * d + L1 * L1 - L2 * L2) / (2 * L1 * d), -1, 1)) * R2D;
  const C = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1)) * R2D;
  return { B: phi + A, E: C };
}

/* ---------- lokal tekstura yordamchilari (realizm qatlamlari) ---------- */
function vignetteTexture(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.32, size / 2, size / 2, size * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.72, 'rgba(0,0,0,0.32)'); g.addColorStop(1, 'rgba(2,3,5,0.9)');
  c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}
function noiseTexture(size = 64) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const c = cv.getContext('2d'); const img = c.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  c.putImageData(img, 0, 0); return Texture.from(cv);
}

function makeCanister(x, y) {
  const c = new Container(); c.x = x; c.y = y;
  const glow = new Sprite(radialTexture('rgba(120,255,120,0.55)', 256)); glow.anchor.set(0.5); glow.width = glow.height = 78; glow.blendMode = 'add'; c.addChild(glow);
  const body = new Graphics();
  body.roundRect(-14, -20, 28, 40, 5).fill(0x14322a).stroke({ width: 2, color: 0x2c5a48 });      // korpus
  body.roundRect(-11, -16, 22, 30, 3).fill(0x0e2a20);                                              // ichki
  const liquid = new Graphics(); c.addChild(body, liquid); c._liquid = liquid;
  body.roundRect(-14, -22, 28, 5, 2).fill(0x1a3a30).stroke({ width: 1.5, color: 0x39ff88, alpha: 0.7 }); // qopqoq
  // ☢️ trefoil
  const sym = new Graphics();
  sym.circle(0, 0, 3).fill(0x0a1a12);
  for (let i = 0; i < 3; i++) { const a = i * 120 * D2R - Math.PI / 2; sym.moveTo(0, 0).arc(0, 0, 9, a - 0.5, a + 0.5).lineTo(0, 0).fill({ color: 0xffe14d, alpha: 0.95 }); }
  sym.circle(0, 0, 2).fill(0x0a1a12);
  c.addChild(sym);
  return { c, glow, sym, liquid, held: false, sealed: false };
}

export function assembleArm(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.05, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const bgC = new Container(); app.stage.addChild(bgC);
  const bg = new Sprite(gradTexture(['#0a0d12', '#111721', '#0c1017', '#07090d'])); bgC.addChild(bg);
  const root = new Container(); app.stage.addChild(root);

  // devor panellari + zovurlar
  const wall = new Graphics();
  for (let x = 60; x < LW; x += 120) wall.rect(x, 20, 84, LH - 80).fill({ color: 0x121a24, alpha: 0.45 }).rect(x, 20, 84, LH - 80).stroke({ width: 1, color: 0x24323f, alpha: 0.4 });
  for (let y = 60; y < LH - 60; y += 90) wall.moveTo(0, y).lineTo(LW, y).stroke({ width: 1, color: 0x1c2836, alpha: 0.2 });
  root.addChild(wall);
  // quvurlar
  const pipes = new Graphics();
  pipes.moveTo(0, 96).lineTo(LW, 96).stroke({ width: 8, color: 0x1a2530, alpha: 0.7 });
  pipes.moveTo(70, 96).lineTo(70, LH - 46).stroke({ width: 6, color: 0x1a2530, alpha: 0.6 });
  pipes.moveTo(930, 96).lineTo(930, LH - 46).stroke({ width: 6, color: 0x1a2530, alpha: 0.6 });
  root.addChild(pipes);

  // ogohlantiruvchi lampalar (miltillaydi)
  const lamps = [];
  [140, 500, 860].forEach((x) => { const g = new Sprite(radialTexture('rgba(255,150,30,0.9)', 128)); g.anchor.set(0.5); g.width = g.height = 46; g.x = x; g.y = 70; g.blendMode = 'add'; root.addChild(g); lamps.push({ g, ph: Math.random() * 6.28 }); });

  // pol + ogohlantiruvchi chiziqlar
  const floor = new Graphics();
  floor.rect(0, LH - 46, LW, 46).fill(0x0b0f15);
  for (let x = -46; x < LW; x += 46) floor.poly([x, LH - 46, x + 23, LH - 46, x + 46, LH, x + 23, LH]).fill({ color: 0x3a3410, alpha: 0.5 });
  floor.rect(0, LH - 48, LW, 3).fill({ color: 0xffd23f, alpha: 0.4 });
  root.addChild(floor);

  const radAura = new Sprite(radialTexture('rgba(255,70,45,0.4)', 512)); radAura.anchor.set(0.5); radAura.width = 900; radAura.height = 470; radAura.x = 520; radAura.y = 250; radAura.blendMode = 'add'; radAura.alpha = 0; root.addChild(radAura);

  // qo'rg'oshin konteyner (drop zone)
  const cont = new Container(); cont.x = CONTAIN.x; cont.y = CONTAIN.y + 34; root.addChild(cont);
  const cb = new Graphics();  // har frame armTick ichida qayta chiziladi
  cont.addChild(cb);
  const contGlow = new Graphics(); cont.addChild(contGlow);

  const canisters = CANS.map((p) => { const k = makeCanister(p.x, p.y); k.homeX = p.x; k.homeY = p.y; root.addChild(k.c); return k; });

  const particles = makeParticles(root);

  // robot qo'l (har frame chiziladi)
  const guideG = new Graphics(); root.addChild(guideG);
  const base = new Graphics(); root.addChild(base);
  const armG = new Graphics(); root.addChild(armG);
  const gripG = new Graphics(); root.addChild(gripG);

  // ekran-fazoviy realizm qatlamlari
  const warnOv = new Graphics().rect(0, 0, 10, 10).fill(0xff2a1a); warnOv.alpha = 0; warnOv.blendMode = 'add'; app.stage.addChild(warnOv);
  const vign = new Sprite(vignetteTexture()); vign.alpha = 0.8; app.stage.addChild(vign);
  const grain = new TilingSprite({ texture: noiseTexture(), width: 10, height: 10 }); grain.alpha = 0.04; grain.blendMode = 'add'; app.stage.addChild(grain);

  return {
    app, bg, root, lamps, radAura, cont, cb, contGlow, canisters, particles,
    guideG, base, armG, gripG, warnOv, vign, grain,
    B: 90, E: 120, hold: -1, lastBtn: 0, sealed: 0, target: 3, won: false, rad: 0, geigerAcc: 0, lastReset: 0, vaporAcc: 0,
    introB: 90, introE: 120, introBtn: 0,
    reset() { this.canisters.forEach((k) => { k.sealed = false; k.held = false; k.c.visible = true; k.c.x = k.homeX; k.c.y = k.homeY; }); this.hold = -1; this.sealed = 0; this.won = false; this.rad = 0; },
  };
}

// ctl = { a0, a1, btn, connected, mode:'play'|'intro', resetPulse, onMove, onGrab, onDrop, onSeal, onGeiger, onWin }
export function armTick(scene, dt, t, ctl) {
  const { app, bg, root, lamps, radAura, cont, contGlow, canisters, particles, guideG, base, armG, gripG, warnOv, vign, grain } = scene;
  const w = app.screen.width, h = app.screen.height;
  bg.width = w; bg.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  [warnOv].forEach((o) => { o.width = w; o.height = h; });
  vign.width = w; vign.height = h; grain.width = w; grain.height = h; grain.tilePosition.set(Math.random() * 64, Math.random() * 64);

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // ----- servo maqsad burchaklari (apparatga sodiq: map 0..1023 -> 0..180) -----
  let tB, tE;
  if (ctl.connected) { tB = mapRange(ctl.a0 ?? 512, 0, 1023, 0, 180); tE = mapRange(ctl.a1 ?? 512, 0, 1023, 0, 180); }
  else if (ctl.mode === 'intro') { tB = scene.introB; tE = scene.introE; }
  else { tB = 90 + Math.sin(t * 0.5) * 46; tE = 120 + Math.sin(t * 0.7 + 1) * 40; }   // ulanmagan: idle

  // servo harakati — cheklangan tezlik (realistik), sezilarli harakatда tovush
  const SPEED = 200; // deg/s
  const stepB = clamp(tB - scene.B, -SPEED * dt, SPEED * dt);
  const stepE = clamp(tE - scene.E, -SPEED * dt, SPEED * dt);
  scene.B += stepB; scene.E += stepE;
  if (ctl.onMove && (Math.abs(stepB) > 0.35 || Math.abs(stepE) > 0.35)) ctl.onMove();

  const { elbow, tip } = forwardArm(scene.B, scene.E);

  // ----- tugma rising edge -> ushla / qo'y -----
  const btn = ctl.mode === 'intro' ? scene.introBtn : (ctl.connected ? (ctl.btn ? 1 : 0) : 0);
  if (btn && !scene.lastBtn) {
    if (scene.hold >= 0) {
      const k = canisters[scene.hold];
      if (Math.hypot(tip.x - CONTAIN.x, tip.y - CONTAIN.y) <= DROP_TOL) {
        k.sealed = true; k.held = false; k.c.visible = false; scene.hold = -1; scene.sealed++; scene.geigerAcc = 0;
        particles.burst(CONTAIN.x, CONTAIN.y, 0x39ff88, 22, 150);
        if (ctl.onSeal) ctl.onSeal(scene.sealed);
        if (ctl.mode === 'play' && scene.sealed >= scene.target && !scene.won) { scene.won = true; if (ctl.onWin) ctl.onWin(); }
      } else { k.held = false; scene.hold = -1; k.c.x = k.homeX; k.c.y = k.homeY; if (ctl.onDrop) ctl.onDrop(); }
    } else {
      let best = -1, bd = GRAB_TOL;
      canisters.forEach((k, i) => { if (k.sealed || k.held) return; const d = Math.hypot(tip.x - k.c.x, tip.y - k.c.y); if (d < bd) { bd = d; best = i; } });
      if (best >= 0) { canisters[best].held = true; scene.hold = best; if (ctl.onGrab) ctl.onGrab(); }
    }
  }
  scene.lastBtn = btn;
  if (scene.hold >= 0) { const k = canisters[scene.hold]; k.c.x = tip.x; k.c.y = tip.y + 18; }

  // ----- yo'l ko'rsatkichi (aktiv nishonga chiziq, masofaga qarab rang) -----
  guideG.clear();
  let targetPt = null;
  if (scene.hold >= 0) targetPt = { x: CONTAIN.x, y: CONTAIN.y };
  else { let bd = Infinity; canisters.forEach((k) => { if (k.sealed || k.held) return; const d = Math.hypot(tip.x - k.c.x, tip.y - k.c.y); if (d < bd) { bd = d; targetPt = { x: k.c.x, y: k.c.y }; } }); }
  if (targetPt && !scene.won) {
    const d = Math.hypot(tip.x - targetPt.x, tip.y - targetPt.y);
    const near = d < (scene.hold >= 0 ? DROP_TOL : GRAB_TOL);
    const col = near ? 0x39ff88 : d < 120 ? 0xffd23f : 0xff5a4a;
    for (let i = 0; i < 6; i++) { const a0 = i / 6, a1 = (i + 0.5) / 6; guideG.moveTo(lerp(tip.x, targetPt.x, a0), lerp(tip.y, targetPt.y, a0)).lineTo(lerp(tip.x, targetPt.x, a1), lerp(tip.y, targetPt.y, a1)).stroke({ width: 2, color: col, alpha: 0.5 }); }
    guideG.circle(targetPt.x, targetPt.y, 26 + 4 * Math.sin(t * 6)).stroke({ width: 2, color: col, alpha: near ? 0.9 : 0.5 });
  }

  // ----- asos turret (hazard stripe + boltlar) -----
  base.clear();
  base.roundRect(PIVOT_X - 52, PIVOT_Y + 8, 104, 42, 6).fill(0x161c26).stroke({ width: 2, color: 0x36445a });
  for (let x = PIVOT_X - 46; x < PIVOT_X + 46; x += 16) base.poly([x, PIVOT_Y + 10, x + 8, PIVOT_Y + 10, x + 16, PIVOT_Y + 22, x + 8, PIVOT_Y + 22]).fill({ color: 0xffd23f, alpha: 0.2 });
  [-40, 40].forEach((dx) => base.circle(PIVOT_X + dx, PIVOT_Y + 44, 3).fill(0x0a0d12).stroke({ width: 1, color: 0x4a5a70 }));
  base.circle(PIVOT_X, PIVOT_Y, 20).fill(0x1e2733).stroke({ width: 3, color: 0x46586e });   // turret disk
  base.circle(PIVOT_X, PIVOT_Y, 20).stroke({ width: 1, color: 0x00eaff, alpha: 0.3 });

  // ----- robot qo'l (metall segmentlar + gidravlika + boltlar) -----
  const seg = (x0, y0, x1, y1, wOuter, wCore, coreCol) => {
    armG.moveTo(x0, y0).lineTo(x1, y1).stroke({ width: wOuter, color: 0x2a3542, cap: 'round' });
    armG.moveTo(x0, y0).lineTo(x1, y1).stroke({ width: wOuter - 4, color: 0x415168, cap: 'round' });
    armG.moveTo(x0, y0).lineTo(x1, y1).stroke({ width: wCore, color: coreCol, alpha: 0.6, cap: 'round' });
  };
  armG.clear();
  seg(PIVOT_X, PIVOT_Y, elbow.x, elbow.y, 18, 5, 0x8fb6d8);            // yuqori segment
  // gidravlika silindri (yuqori segment yonida)
  const mx = (PIVOT_X + elbow.x) / 2, my = (PIVOT_Y + elbow.y) / 2;
  armG.moveTo(PIVOT_X, PIVOT_Y).lineTo(mx, my).stroke({ width: 4, color: 0x556577, alpha: 0.7 });
  seg(elbow.x, elbow.y, tip.x, tip.y, 14, 4, 0x00eaff);               // bilak
  // bo'g'imlar (boltli)
  armG.circle(PIVOT_X, PIVOT_Y, 12).fill(0x263241).stroke({ width: 2, color: 0x5a6e86 });
  armG.circle(elbow.x, elbow.y, 10).fill(0x263241).stroke({ width: 2.5, color: 0x00eaff, alpha: 0.8 });
  armG.circle(elbow.x, elbow.y, 3).fill(0x0a0d12);

  // ----- griper (ikki artikulli tirnoq) -----
  const holding = scene.hold >= 0;
  let nearOpen = false;
  if (!holding) canisters.forEach((k) => { if (!k.sealed && !k.held && Math.hypot(tip.x - k.c.x, tip.y - k.c.y) <= GRAB_TOL) nearOpen = true; });
  const gcol = holding ? 0x6bff8a : nearOpen ? 0xffd23f : 0x00eaff;
  const spread = holding ? 4 : 12;
  // bilak yo'nalishi bo'ylab griper
  const fa = Math.atan2(tip.y - elbow.y, tip.x - elbow.x);
  const nx = Math.cos(fa), ny = Math.sin(fa), px = -ny, pyy = nx;
  gripG.clear();
  gripG.circle(tip.x, tip.y, 7).fill(0x263241).stroke({ width: 2, color: gcol, alpha: 0.9 });
  [-1, 1].forEach((s) => {
    const bx = tip.x + px * spread * s, by = tip.y + pyy * spread * s;
    const ex = bx + nx * 16, ey = by + ny * 16;
    gripG.moveTo(tip.x + px * 4 * s, tip.y + pyy * 4 * s).lineTo(bx, by).lineTo(ex, ey).stroke({ width: 4, color: gcol, cap: 'round' });
    gripG.circle(ex, ey, 2.5).fill(gcol);
  });
  if (nearOpen) gripG.circle(tip.x, tip.y, 22 + 3 * Math.sin(t * 8)).stroke({ width: 1.5, color: 0xffd23f, alpha: 0.6 });

  // ----- idishlar: suyuqlik + jimirlash + bug' -----
  canisters.forEach((k) => {
    if (k.sealed) return;
    k.glow.alpha = 0.4 + 0.22 * Math.sin(t * 4 + k.c.x);
    k._liquid.clear(); const lvl = 0.5 + 0.12 * Math.sin(t * 2 + k.c.x);
    k._liquid.roundRect(-10, 14 - 26 * lvl, 20, 26 * lvl, 3).fill({ color: 0x39ff88, alpha: 0.35 });
    k.sym.rotation += dt * 0.5;
  });
  scene.vaporAcc += dt;
  if (scene.vaporAcc > 0.5) { scene.vaporAcc = 0; canisters.forEach((k) => { if (!k.sealed && !k.held && Math.random() < 0.6) particles.burst(k.c.x + (Math.random() - 0.5) * 8, k.c.y - 18, 0x8fffc0, 1, 22); }); }

  // ----- konteyner + lampalar -----
  scene.cb.clear();
  scene.cb.roundRect(-52, -34, 104, 86, 8).fill(0x262b33).stroke({ width: 3, color: 0x59667a });
  scene.cb.roundRect(-44, -30, 88, 16, 5).fill(0x0a0d12);                 // ochilish
  scene.cb.rect(-52, 8, 104, 6).fill({ color: 0x1a1d22, alpha: 0.9 });
  contGlow.clear();
  contGlow.roundRect(-44, -30, 88, 16, 5).stroke({ width: 2, color: 0x39ff88, alpha: 0.45 + 0.3 * Math.sin(t * 3) });
  lamps.forEach((l, i) => { l.g.alpha = (0.3 + 0.5 * Math.abs(Math.sin(t * 2.5 + l.ph))) * (0.5 + scene.rad * 0.5); });

  // ----- radiatsiya (geiger + qizil flash) — jazolamaydi -----
  const exposed = scene.canisters.filter((k) => !k.sealed).length;
  const targetRad = clamp(exposed / scene.target, 0, 1) * (holding ? 1 : 0.62);
  scene.rad = lerp(scene.rad, targetRad, Math.min(dt * 0.6, 1));
  radAura.alpha = scene.rad * 0.38 * (0.7 + 0.3 * Math.sin(t * 7));
  warnOv.alpha = scene.rad > 0.55 ? (scene.rad - 0.55) * 0.28 * (0.5 + 0.5 * Math.sin(t * 9)) : 0;
  scene.geigerAcc += dt;
  const iv = lerp(0.6, 0.12, scene.rad);
  if (scene.rad > 0.02 && scene.geigerAcc > iv) { scene.geigerAcc = 0; if (ctl.onGeiger) ctl.onGeiger(); }

  particles.tick(dt);
}
