// robotArmScene — VOLTRA "Xavfli Yuk: Robot Qo'l" PixiJS olami.
// Digital Twin: 2 potensiometr = robot qo'lning ikki bo'g'imi (polar boshqaruv):
//   POT1 -> asos burchagi (θ),  POT2 -> cho'zilish (r).  TUGMA -> griper (ushla/qo'y).
// Griperni xavfli idish ustiga aniq keltirib ushла, qo'rg'oshin konteynerga joyla.
// 3 idish muhrlansa -> hudud xavfsiz. Radiatsiya (geiger) — atmosfera bosimi.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
export const PIVOT_X = 500, PIVOT_Y = 468;
export const TH_MIN = 30, TH_MAX = 150;     // asos burchagi (deg) — o'ng..chap
export const R_MIN = 92, R_MAX = 250;       // cho'zilish (px)
export const GRAB_TOL = 42, DROP_TOL = 60;

const D2R = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const mapRange = (v, a, b, c, d) => c + (clamp(v, Math.min(a, b), Math.max(a, b)) - a) * (d - c) / (b - a);
const tipPos = (th, r) => ({ x: PIVOT_X + r * Math.cos(th * D2R), y: PIVOT_Y - r * Math.sin(th * D2R) });

// idishlar va konteyner joyi (polar bilan tanlangan -> kafolatlangan yetib boradi)
export const CANS = [
  { th: 62, r: 214 }, { th: 90, r: 236 }, { th: 118, r: 210 },
];
export const CONTAIN = { th: 149, r: 150 };

function makeCanister(x, y) {
  const c = new Container(); c.x = x; c.y = y;
  const glow = new Sprite(radialTexture('rgba(120,255,120,0.6)', 256)); glow.anchor.set(0.5); glow.width = glow.height = 70; glow.blendMode = 'add'; c.addChild(glow);
  const body = new Graphics();
  body.roundRect(-13, -18, 26, 36, 5).fill(0x123a2a).stroke({ width: 2, color: 0x6bff8a, alpha: 0.9 });
  body.rect(-13, -6, 26, 12).fill({ color: 0x0a2a1e, alpha: 0.8 });
  c.addChild(body);
  // ☢️ belgisi
  const sym = new Graphics();
  sym.circle(0, 0, 3).fill(0xffe14d);
  for (let i = 0; i < 3; i++) { const a = i * 120 * D2R - Math.PI / 2; sym.moveTo(0, 0).arc(0, 0, 8, a - 0.5, a + 0.5).lineTo(0, 0).fill({ color: 0xffe14d, alpha: 0.95 }); }
  c.addChild(sym);
  return { c, glow, sym, held: false, sealed: false };
}

export function assembleArm(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.05, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  // fon: yer osti izolyatsiya kamerasi
  const bgC = new Container(); app.stage.addChild(bgC);
  const bg = new Sprite(gradTexture(['#0a0d12', '#12161e', '#0e1116', '#080a0e'])); bgC.addChild(bg);
  const root = new Container(); app.stage.addChild(root);

  // devor panellari + grid
  const wall = new Graphics();
  for (let x = 40; x < LW; x += 80) wall.moveTo(x, 20).lineTo(x, LH).stroke({ width: 1, color: 0x1c2836, alpha: 0.25 });
  for (let y = 40; y < LH; y += 80) wall.moveTo(0, y).lineTo(LW, y).stroke({ width: 1, color: 0x1c2836, alpha: 0.25 });
  root.addChild(wall);

  // pол + ogohlantiruvchi sariq-qora chiziqlar
  const floor = new Graphics();
  floor.rect(0, LH - 46, LW, 46).fill(0x0c1016);
  for (let x = -46; x < LW; x += 46) floor.poly([x, LH - 46, x + 23, LH - 46, x + 46, LH, x + 23, LH]).fill({ color: 0x3a3410, alpha: 0.5 });
  floor.rect(0, LH - 48, LW, 3).fill({ color: 0xffd23f, alpha: 0.35 });
  root.addChild(floor);

  // radiatsiya qizil aura (idishlar atrofida umumiy)
  const radAura = new Sprite(radialTexture('rgba(255,60,40,0.35)', 512)); radAura.anchor.set(0.5); radAura.width = 900; radAura.height = 480; radAura.x = LW / 2; radAura.y = 250; radAura.blendMode = 'add'; radAura.alpha = 0; root.addChild(radAura);

  // qo'rg'oshin konteyner (drop zone)
  const cont = new Container(); const cpos = tipPos(CONTAIN.th, CONTAIN.r); cont.x = cpos.x; cont.y = cpos.y; root.addChild(cont);
  const contBody = new Graphics();
  contBody.roundRect(-46, -30, 92, 74, 8).fill(0x2b2f37).stroke({ width: 3, color: 0x556170 });
  contBody.roundRect(-40, -26, 80, 16, 5).fill(0x0a0d12);                         // ochilish
  contBody.rect(-46, 6, 92, 6).fill({ color: 0x1a1d22, alpha: 0.9 });
  cont.addChild(contBody);
  const contGlow = new Graphics(); cont.addChild(contGlow);
  const contLabel = new Graphics(); contLabel.rect(-16, 20, 32, 12).fill(0x0a0d12).stroke({ width: 1, color: 0x39ff88, alpha: 0.6 }); cont.addChild(contLabel);

  // idishlar
  const canisters = CANS.map((p) => { const t = tipPos(p.th, p.r); const k = makeCanister(t.x, t.y); k.homeX = t.x; k.homeY = t.y; root.addChild(k.c); return k; });

  // robot qo'l
  const armG = new Graphics(); root.addChild(armG);
  const gripG = new Graphics(); root.addChild(gripG);
  // asos platforma
  const base = new Graphics();
  base.roundRect(PIVOT_X - 44, PIVOT_Y + 6, 88, 40, 6).fill(0x1a1f28).stroke({ width: 2, color: 0x3a4658 });
  base.circle(PIVOT_X, PIVOT_Y, 16).fill(0x222a36).stroke({ width: 2, color: 0x4a5a70 });
  root.addChild(base);

  const particles = makeParticles(root);

  return {
    app, bg, root, radAura, cont, contGlow, canisters, armG, gripG, particles,
    // holat
    th: (TH_MIN + TH_MAX) / 2, r: (R_MIN + R_MAX) / 2,
    thTarget: (TH_MIN + TH_MAX) / 2, rTarget: (R_MIN + R_MAX) / 2,
    hold: -1, lastBtn: 0, sealed: 0, target: 3, won: false, rad: 0, geigerAcc: 0, lastReset: 0,
    // intro boshqaruvi
    introTh: (TH_MIN + TH_MAX) / 2, introR: (R_MIN + R_MAX) / 2, introBtn: 0,
    reset() {
      this.canisters.forEach((k) => { k.sealed = false; k.held = false; k.c.visible = true; k.c.scale.set(1); k.c.x = k.homeX; k.c.y = k.homeY; });
      this.hold = -1; this.sealed = 0; this.won = false; this.rad = 0;
    },
  };
}

// ctl = { a0, a1, btn, connected, mode:'play'|'intro', resetPulse, onGrab, onSeal, onWin }
export function armTick(scene, dt, t, ctl) {
  const { app, bg, root, radAura, contGlow, canisters, armG, gripG, particles } = scene;
  const w = app.screen.width, h = app.screen.height;
  bg.width = w; bg.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // ----- bo'g'im maqsadlari (faqat ulanganda masofaga bog'lanadi) -----
  if (ctl.connected) {
    scene.thTarget = mapRange(ctl.a0 ?? 512, 0, 1023, TH_MIN, TH_MAX);
    scene.rTarget = mapRange(ctl.a1 ?? 512, 0, 1023, R_MIN, R_MAX);
  } else if (ctl.mode === 'intro') {
    scene.thTarget = scene.introTh; scene.rTarget = scene.introR;
  } else {
    // ulanmagan: sokin idle (o'zi o'ynamaydi, griper ishlamaydi)
    scene.thTarget = 90 + Math.sin(t * 0.5) * 42;
    scene.rTarget = 175 + Math.sin(t * 0.7 + 1) * 55;
  }
  const preTh = scene.th, preR = scene.r;
  scene.th = lerp(scene.th, scene.thTarget, Math.min(dt * 9, 1));
  scene.r = lerp(scene.r, scene.rTarget, Math.min(dt * 9, 1));
  // servo tovushi (sezilarli harakatda) — komponent onMove orqali chaladi
  if (ctl.onMove && (Math.abs(scene.th - preTh) > 0.35 || Math.abs(scene.r - preR) > 1.1)) ctl.onMove();

  const tip = tipPos(scene.th, scene.r);

  // ----- tugma (rising edge) -> ushla / qo'y -----
  const btn = ctl.mode === 'intro' ? scene.introBtn : (ctl.connected ? (ctl.btn ? 1 : 0) : 0);
  if (btn && !scene.lastBtn) {
    if (scene.hold >= 0) {
      // qo'yish: konteyner ustidami?
      const cp = tipPos(CONTAIN.th, CONTAIN.r);
      const k = canisters[scene.hold];
      if (Math.hypot(tip.x - cp.x, tip.y - cp.y) <= DROP_TOL) {
        k.sealed = true; k.held = false; k.c.visible = false; scene.hold = -1; scene.sealed++;
        scene.geigerAcc = 0;
        particles.burst(cp.x, cp.y - 10, 0x39ff88, 20, 150);
        if (ctl.onSeal) ctl.onSeal(scene.sealed);
        if (ctl.mode === 'play' && scene.sealed >= scene.target && !scene.won) { scene.won = true; if (ctl.onWin) ctl.onWin(); }
      } else {
        // noto'g'ri joy -> idish uyiga qaytadi (jazo yo'q)
        k.held = false; scene.hold = -1;
        k.c.x = k.homeX; k.c.y = k.homeY;
        if (ctl.onDrop) ctl.onDrop();
      }
    } else {
      // ushlash: eng yaqin ochiq idish tolerantlikda?
      let best = -1, bd = GRAB_TOL;
      canisters.forEach((k, i) => { if (k.sealed || k.held) return; const d = Math.hypot(tip.x - k.c.x, tip.y - k.c.y); if (d < bd) { bd = d; best = i; } });
      if (best >= 0) { canisters[best].held = true; scene.hold = best; if (ctl.onGrab) ctl.onGrab(); }
    }
  }
  scene.lastBtn = btn;

  // ushlangan idish griperga ergashadi
  if (scene.hold >= 0) { const k = canisters[scene.hold]; k.c.x = tip.x; k.c.y = tip.y + 16; }

  // ----- robot qo'l chizigi (asos -> tirsak -> griper) -----
  const dir = { x: Math.cos(scene.th * D2R), y: -Math.sin(scene.th * D2R) };
  const perp = { x: -dir.y, y: dir.x };
  const upLen = Math.min(scene.r * 0.5, 118);
  const elbow = { x: PIVOT_X + dir.x * upLen + perp.x * 22, y: PIVOT_Y + dir.y * upLen + perp.y * 22 };
  armG.clear();
  // yelka bo'g'imi
  armG.circle(PIVOT_X, PIVOT_Y, 11).fill(0x2a3442);
  // yuqori segment
  armG.moveTo(PIVOT_X, PIVOT_Y).lineTo(elbow.x, elbow.y).stroke({ width: 13, color: 0x3a4658 });
  armG.moveTo(PIVOT_X, PIVOT_Y).lineTo(elbow.x, elbow.y).stroke({ width: 5, color: 0x6a86a8, alpha: 0.7 });
  // tirsak
  armG.circle(elbow.x, elbow.y, 8).fill(0x2a3442).stroke({ width: 2, color: 0x00eaff, alpha: 0.7 });
  // bilak
  armG.moveTo(elbow.x, elbow.y).lineTo(tip.x, tip.y).stroke({ width: 10, color: 0x323e4e });
  armG.moveTo(elbow.x, elbow.y).lineTo(tip.x, tip.y).stroke({ width: 4, color: 0x00eaff, alpha: 0.55 });

  // ----- griper -----
  const holding = scene.hold >= 0;
  // ushlashga yaqin ochiq idish bormi (indikator uchun)
  let nearOpen = false;
  if (!holding) canisters.forEach((k) => { if (!k.sealed && !k.held && Math.hypot(tip.x - k.c.x, tip.y - k.c.y) <= GRAB_TOL) nearOpen = true; });
  const gcol = holding ? 0x6bff8a : nearOpen ? 0xffd23f : 0x00eaff;
  const open = holding ? 5 : 12;   // yopiq/ochiq
  gripG.clear();
  gripG.circle(tip.x, tip.y, 6).fill(0x2a3442).stroke({ width: 2, color: gcol, alpha: 0.9 });
  gripG.moveTo(tip.x - open, tip.y + 2).lineTo(tip.x - open, tip.y + 15).lineTo(tip.x - open + 4, tip.y + 15).stroke({ width: 3, color: gcol });
  gripG.moveTo(tip.x + open, tip.y + 2).lineTo(tip.x + open, tip.y + 15).lineTo(tip.x + open - 4, tip.y + 15).stroke({ width: 3, color: gcol });
  // yaqinlik halqasi
  if (nearOpen) gripG.circle(tip.x, tip.y, 20 + 3 * Math.sin(t * 8)).stroke({ width: 1.5, color: 0xffd23f, alpha: 0.6 });

  // ----- idishlar jimirlashi + konteyner shu'lasi -----
  canisters.forEach((k) => { if (!k.sealed) { k.glow.alpha = 0.4 + 0.25 * Math.sin(t * 4 + k.c.x); k.sym.rotation += dt * 0.6; } });
  contGlow.clear();
  contGlow.roundRect(-40, -26, 80, 16, 5).stroke({ width: 2, color: 0x39ff88, alpha: 0.4 + 0.3 * Math.sin(t * 3) });

  // ----- radiatsiya (geiger) — atmosfera bosimi, jazolamaydi -----
  const exposed = scene.canisters.filter((k) => !k.sealed).length;
  const targetRad = clamp(exposed / scene.target, 0, 1) * (holding ? 1 : 0.65);
  scene.rad = lerp(scene.rad, targetRad, Math.min(dt * 0.6, 1));
  radAura.alpha = scene.rad * 0.4 * (0.7 + 0.3 * Math.sin(t * 7));
  scene.geigerAcc += dt;
  const iv = lerp(0.6, 0.12, scene.rad);
  if (scene.rad > 0.02 && scene.geigerAcc > iv) { scene.geigerAcc = 0; if (ctl.onGeiger) ctl.onGeiger(); }

  particles.tick(dt);
}
