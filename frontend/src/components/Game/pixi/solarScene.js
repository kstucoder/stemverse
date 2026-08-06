// solarScene — VOLTRA "Quyosh Yelkani" — STEPPER MOTOR (28BYJ-48 + ULN2003) yangi element.
// Realistik ASTEROID QUYOSH FERMASI: bo'g'imli fotoelement panel stepper bilan ANIQ buriladi va
// siljiyotgan uzoq quyoshni "track" qiladi. Panel normalini quyoshga aniq qaratganda quvvat oqadi
// va reaktor zaryadlanadi. 100% zaryad -> baza to'liq quvvatlanadi.
// POT panel burchagini boshqaradi; stepper qadamba-qadam aniq pozitsiyaga keladi (ULN2003 4 g'altak).
// Saga davomi: janglardan keyin baza quvvati past — quyosh panellarini yo'naltirib reaktorni to'ldiramiz.
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const GROUND = 402, PVX = 500, PVY = 428;                 // regolit ufqi + panel sharniri (pivot)
const A_MIN = -2.86, A_MAX = -0.28;                        // panel burchak diapazoni (rad, ~ -164°..-16°)
const TOL = 0.55;                                          // alignment tolerantligi (rad)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);

function radialVignette(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.36, size / 2, size / 2, size * 0.64);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(2,3,7,0.9)'); c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}
// quyosh diski (yadro + korona gradienti)
function sunTexture(size = 256) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, '#fff2c0'); g.addColorStop(0.5, '#ffd66a'); g.addColorStop(0.8, 'rgba(255,150,60,0.35)'); g.addColorStop(1, 'rgba(255,120,40,0)');
  c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}

// ===== BO'G'IMLI QUYOSH PANELI (stepper bilan buriladi) =====
function makeArray(parent) {
  const c = new Container(); c.x = PVX; c.y = PVY; parent.addChild(c);
  // arm (panelgacha ferma)
  const arm = new Graphics();
  arm.rect(-4, -8, 8, -100 + 8).fill(0x2a3038);                       // asosiy ustun (yuqoriga)
  arm.moveTo(0, -8).lineTo(-6, -96).moveTo(0, -8).lineTo(6, -96).stroke({ width: 1.5, color: 0x3a4650 });
  c.addChild(arm);
  // panel bloki (arm uchida)
  const panel = new Container(); panel.y = -100; c.addChild(panel);
  const pg = new Graphics();
  // ramka
  pg.roundRect(-92, -30, 184, 60, 4).fill(0x0c1420).stroke({ width: 2, color: 0x3a4a5a });
  // 6x2 fotoelement katak (to'q ko'k, ingichka setka)
  for (let r = 0; r < 2; r++) for (let col = 0; col < 6; col++) {
    const x = -88 + col * 30, y = -26 + r * 28;
    pg.roundRect(x, y, 27, 25, 2).fill(0x123a6a).stroke({ width: 0.8, color: 0x1f5a9a });
    pg.moveTo(x + 13, y).lineTo(x + 13, y + 25).stroke({ width: 0.5, color: 0x1a4a80, alpha: 0.7 });
    for (let g = y + 4; g < y + 25; g += 5) pg.moveTo(x, g).lineTo(x + 27, g).stroke({ width: 0.4, color: 0x1a4a80, alpha: 0.5 });
  }
  panel.addChild(pg);
  const shine = new Graphics(); panel.addChild(shine);                 // quyosh aksi (glint)
  const glint = new Sprite(radialTexture('rgba(255,245,200,0.9)', 128)); glint.anchor.set(0.5); glint.width = glint.height = 70; glint.blendMode = 'add'; glint.alpha = 0; panel.addChild(glint);
  // sharnir (stepper hub) — tishli disk
  const hub = new Graphics();
  hub.circle(0, 0, 16).fill(0x1a222c).stroke({ width: 2, color: 0x3a4650 });
  for (let a = 0; a < 24; a++) { const rad = a / 24 * Math.PI * 2; hub.moveTo(Math.cos(rad) * 14, Math.sin(rad) * 14).lineTo(Math.cos(rad) * 17, Math.sin(rad) * 17).stroke({ width: 1, color: 0x2a3640 }); }
  hub.circle(0, 0, 4).fill(0x0c1116);
  c.addChild(hub);
  return { c, panel, shine, glint };
}

export function assembleSolar(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.05, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#040610', '#0a0c1c', '#0e1020', '#120c16'])); skyC.addChild(sky);
  const root = new Container(); app.stage.addChild(root);

  // nebula haze
  const neb = new Sprite(radialTexture('rgba(90,60,140,0.16)', 512)); neb.anchor.set(0.5); neb.x = 300; neb.y = 150; neb.width = 700; neb.height = 320; neb.blendMode = 'add'; root.addChild(neb);
  // yulduzlar (miltillovchi)
  const starG = new Graphics();
  for (let i = 0; i < 220; i++) starG.circle(rnd(0, LW), rnd(0, GROUND - 10), rnd(0.3, 1.1)).fill({ color: 0xdfe6ff, alpha: rnd(0.15, 0.6) });
  root.addChild(starG);
  const twinkle = [];
  for (let i = 0; i < 30; i++) { const s = new Graphics().circle(0, 0, rnd(0.8, 1.4)).fill(0xffffff); s.x = rnd(0, LW); s.y = rnd(0, GROUND - 60); s.blendMode = 'add'; root.addChild(s); twinkle.push({ s, base: rnd(0.5, 1), ph: rnd(0, 6.28), sp: rnd(1.5, 3.5) }); }

  // QUYOSH (korona + disk + lens-flare)
  const sunGlow = new Sprite(radialTexture('rgba(255,180,90,0.5)', 512)); sunGlow.anchor.set(0.5); sunGlow.width = sunGlow.height = 380; sunGlow.blendMode = 'add'; root.addChild(sunGlow);
  const sun = new Sprite(sunTexture()); sun.anchor.set(0.5); sun.width = sun.height = 120; root.addChild(sun);
  const flare = new Graphics(); flare.blendMode = 'add'; root.addChild(flare);

  // BAZA (mid-fon, zaryad oshgani sayin yonadi)
  const baseC = new Container(); root.addChild(baseC);
  const baseG = new Graphics();
  baseG.ellipse(760, GROUND - 6, 150, 26).fill({ color: 0x0a0f0c, alpha: 0.6 });               // soya
  baseG.roundRect(690, GROUND - 60, 150, 56, 6).fill(0x0f1820).stroke({ width: 1.5, color: 0x243441 }); // asosiy modul
  baseG.roundRect(650, GROUND - 44, 46, 40, 5).fill(0x0d151c).stroke({ width: 1, color: 0x223441 });
  baseG.roundRect(834, GROUND - 50, 40, 46, 5).fill(0x0d151c).stroke({ width: 1, color: 0x223441 });
  baseG.rect(756, GROUND - 92, 8, 34).fill(0x1a2530); baseG.moveTo(760, GROUND - 92).lineTo(760, GROUND - 108).stroke({ width: 1.5, color: 0x2a3a48 }); baseG.circle(760, GROUND - 110, 2).fill(0xff5a3a);
  baseG.ellipse(700, GROUND - 66, 18, 8).fill(0x14263a).stroke({ width: 1, color: 0x2e5a8a });   // tarelka
  baseC.addChild(baseG);
  // baza oynalari (zaryad milestone'da yonadi)
  const baseWindows = [];
  const wcoords = [[668, GROUND - 34], [676, GROUND - 24], [712, GROUND - 44], [740, GROUND - 44], [768, GROUND - 44], [848, GROUND - 34]];
  wcoords.forEach(([x, y]) => { const g = new Graphics().roundRect(x, y, 8, 7, 1).fill(0xffcf94); g.alpha = 0.06; baseC.addChild(g); baseWindows.push(g); });
  const baseGlow = new Sprite(radialTexture('rgba(255,200,120,0.5)', 256)); baseGlow.anchor.set(0.5); baseGlow.x = 765; baseGlow.y = GROUND - 40; baseGlow.width = 220; baseGlow.height = 120; baseGlow.blendMode = 'add'; baseGlow.alpha = 0; baseC.addChild(baseGlow);

  // REGOLIT SIRTI (kraterlar, toshlar, chang)
  const ground = new Graphics();
  ground.moveTo(0, GROUND); for (let x = 0; x <= LW; x += 26) ground.lineTo(x, GROUND - Math.sin(x * 0.025) * 6 - rnd(0, 6)); ground.lineTo(LW, LH).lineTo(0, LH).fill(0x120c0a);
  ground.rect(0, GROUND - 3, LW, 3).fill({ color: 0x3a2a1c, alpha: 0.5 });
  for (let i = 0; i < 26; i++) { const rx = rnd(0, LW), ry = rnd(GROUND + 14, LH - 16); ground.ellipse(rx, ry, rnd(5, 16), rnd(2, 6)).fill({ color: 0x0e0a08, alpha: 0.85 }); ground.ellipse(rx - 2, ry - 2, rnd(3, 9), rnd(1, 3)).fill({ color: 0x241812, alpha: 0.6 }); }
  root.addChild(ground);
  const dust = []; for (let i = 0; i < 4; i++) { const d = new Sprite(radialTexture('rgba(150,110,80,0.12)', 256)); d.anchor.set(0.5); d.width = rnd(240, 400); d.height = rnd(50, 90); d.x = rnd(0, LW); d.y = rnd(GROUND, LH - 20); d.blendMode = 'add'; root.addChild(d); dust.push({ s: d, sp: rnd(6, 15) }); }

  // quvvat kabeli (paneldan bazaga)
  const cable = new Graphics(); root.addChild(cable);
  const array = makeArray(root);
  const particles = makeParticles(root);

  // ===== ULN2003 DRAYVER + STEPPER indikator (oldingi panel, mayda detal) =====
  const drv = new Container(); drv.x = 150; drv.y = 486; root.addChild(drv);
  const drvG = new Graphics();
  drvG.roundRect(-60, -34, 120, 60, 6).fill(0x0f2018).stroke({ width: 1.5, color: 0x2a5a3a });   // yashil PCB
  drvG.roundRect(-52, -10, 28, 30, 3).fill(0x1a1a1a).stroke({ width: 1, color: 0x333 });          // IC (ULN2003)
  drvG.rect(-40, 22, 80, 4, 1).fill(0x0a140e);
  drv.addChild(drvG);
  const coilLeds = []; ['IN1', 'IN2', 'IN3', 'IN4'].forEach((_, i) => { const g = new Graphics().circle(-6 + i * 16, -22, 3).fill(0xff5a3a); g.blendMode = 'add'; drv.addChild(g); coilLeds.push(g); });
  // quvvat metri (reaktor zaryadi)
  const meterG = new Graphics(); root.addChild(meterG);
  const alignG = new Graphics(); root.addChild(alignG);

  const vign = new Sprite(radialVignette()); vign.alpha = 0.6; app.stage.addChild(vign);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffffff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  const scene = {
    app, sky, root, twinkle, sunGlow, sun, flare, baseWindows, baseGlow, dust, cable, array, particles, coilLeds, meterG, alignG, drv, vign, flash,
    charge: 0.06, alignment: 0, panelA: -Math.PI / 2 + 0.18, dispA: -Math.PI / 2 + 0.18, sunA: -Math.PI / 2, sunX: 500, sunY: 120,
    milestone: 0, won: false, sunT: rnd(0, 6), lastReset: 0, flashT: 0, cineT: 0,
    reset() { this.charge = 0.06; this.milestone = 0; this.won = false; this.sunT = rnd(0, 6); this.cineT = 0; },
  };
  return scene;
}

// ctl = { pot, connected, mode, resetPulse, onCharge, onWin, onNear }
export function solarTick(scene, dt, t, ctl) {
  const { app, sky, root, twinkle, sunGlow, sun, flare, baseWindows, baseGlow, dust, cable, array, particles, coilLeds, meterG, alignG, vign, flash } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH); root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  vign.width = w; vign.height = h; flash.width = w; flash.height = h;
  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // QUYOSH orbit bo'ylab sekin siljiydi
  scene.sunT += dt * 0.12;
  scene.sunX = 500 + Math.sin(scene.sunT) * 330; scene.sunY = 128 - Math.cos(scene.sunT) * 34;
  sun.x = sunGlow.x = scene.sunX; sun.y = sunGlow.y = scene.sunY; sun.scale.set((120 / 256) * (1 + 0.02 * Math.sin(t * 3)));
  sunGlow.alpha = 0.45 + 0.1 * Math.sin(t * 2);
  // lens-flare nurlari
  flare.clear(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 0.1; const ln = 60 + 30 * Math.sin(t * 3 + i); flare.moveTo(scene.sunX, scene.sunY).lineTo(scene.sunX + Math.cos(a) * ln, scene.sunY + Math.sin(a) * ln).stroke({ width: 1, color: 0xffe6a0, alpha: 0.12 }); }
  twinkle.forEach((o) => { o.s.alpha = o.base * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * o.sp + o.ph))); });
  dust.forEach((d) => { d.s.x -= d.sp * dt; if (d.s.x < -220) d.s.x = LW + 220; });

  // quyoshning pivotga nisbatan kerakli burchagi
  scene.sunA = clamp(Math.atan2(scene.sunY - PVY, scene.sunX - PVX), A_MIN, A_MAX);

  // panel burchagi: FAQAT ulangan plata boshqaradi; aks holda BO'SHASHGAN holat (nishonlanmaydi)
  const isIntro = ctl.mode === 'intro';
  const playing = ctl.connected && !isIntro && !scene.won;
  const REST_A = -Math.PI / 2 + 0.18;   // panel osilib qolgan (quyoshga qaratilmagan)
  if (playing) scene.panelA = lerp(A_MIN, A_MAX, clamp((ctl.pot ?? 512) / 1023, 0, 1));
  else scene.panelA += (REST_A - scene.panelA) * Math.min(1, dt * 1.4);

  // STEPPER: dispA panelA tomon QADAMBA-QADAM (aniq, diskret) keladi
  const STEP = 0.035;                       // bitta qadam (rad)
  const diff = scene.panelA - scene.dispA;
  const moving = Math.abs(diff) > STEP * 0.6;
  if (moving) scene.dispA += Math.sign(diff) * Math.min(Math.abs(diff), STEP * (1 + 6 * dt * 60 / 60));
  array.c.rotation = scene.dispA + Math.PI / 2;   // arm yuqoriga qaragani uchun offset
  // ULN2003 g'altak ketma-ketligi (harakatda yonadi)
  const seq = Math.floor(t * 24) % 4;
  coilLeds.forEach((g, i) => { g.tint = 0x39ff88; g.alpha = moving ? (i === seq ? 1 : 0.12) : 0.1; });

  // ALIGNMENT (dispA quyoshga qanchalik aniq)
  const d = Math.abs(scene.dispA - scene.sunA);
  scene.alignment = clamp(1 - d / TOL, 0, 1);
  const power = Math.pow(scene.alignment, 2);      // aniqlik^2 -> quvvat

  // glint (panel quyoshni aks ettiradi)
  array.glint.alpha = power * 0.9; array.glint.x = lerp(-70, 70, (scene.sunX - (PVX - 200)) / 400);
  array.shine.clear(); if (power > 0.3) array.shine.rect(-92, -30, 184, 60).fill({ color: 0xfff2c0, alpha: power * 0.12 });

  // ZARYAD — faqat real o'yinda oshadi
  if (playing) {
    scene.charge = clamp(scene.charge + (power > 0.35 ? 0.11 * power : -0.02) * dt, 0, 1);
    const ms = Math.floor(scene.charge * 5 + 1e-6);
    if (ms > scene.milestone) { scene.milestone = ms; scene.flashT = 0.4; particles.burst(PVX, PVY - 100, 0x39ff88, 16, 170); if (ctl.onCharge) ctl.onCharge(ms); }
    if (scene.charge >= 1 && !scene.won) { scene.won = true; if (ctl.onWin) ctl.onWin(); }
  } else if (isIntro) {
    // KINEMATIK KRIZ: reaktor quvvati asta tugaydi, baza qorong'ilashadi
    scene.cineT += dt; scene.milestone = 0;
    scene.charge = clamp(lerp(0.58, 0.05, clamp(scene.cineT / 4.2, 0, 1)), 0, 1);
  } else {
    // ulanmagan o'yin: kritik past — o'zi o'ynamaydi, o'yinchini kutadi
    scene.milestone = 0; scene.charge = 0.06 + 0.015 * Math.sin(t * 3);
  }

  // baza yorishadi (milestone'ga qarab)
  baseWindows.forEach((g, i) => { g.alpha = i < scene.milestone ? (0.85 + 0.1 * Math.sin(t * 4 + i)) : 0.06; });
  baseGlow.alpha = scene.charge * 0.4;

  // quvvat kabeli (paneldan bazaga) — oqim zaryadga qarab
  cable.clear();
  const px = PVX + Math.cos(scene.dispA) * 100, py = PVY + Math.sin(scene.dispA) * 100;
  cable.moveTo(PVX, PVY).quadraticCurveTo(600, GROUND + 6, 760, GROUND - 20).stroke({ width: 2, color: 0x1a2a20 });
  if (power > 0.35) for (let k = 0; k < 4; k++) { const kk = (t * 0.5 + k / 4) % 1; const cx = lerp(PVX, 760, kk), cy = lerp(PVY, GROUND - 20, kk) + Math.sin(kk * Math.PI) * -20; cable.circle(cx, cy, 2).fill({ color: 0x6bffb0, alpha: (1 - kk) * power }); }

  // ===== QUVVAT METRI + ALIGNMENT indikator =====
  meterG.clear();
  const mx = 500, my = 512, mw = 300;
  meterG.roundRect(mx - mw / 2 - 6, my - 8, mw + 12, 16, 8).fill({ color: 0x081410, alpha: 0.8 }).stroke({ width: 1.5, color: 0x2a5a3a });
  meterG.roundRect(mx - mw / 2, my - 4, mw * scene.charge, 8, 4).fill({ color: scene.charge >= 1 ? 0x6bffb0 : (scene.charge < 0.25 ? 0xff5a3a : 0x39ff88), alpha: 0.95 });
  for (let m = 1; m < 5; m++) meterG.moveTo(mx - mw / 2 + mw * m / 5, my - 8).lineTo(mx - mw / 2 + mw * m / 5, my + 8).stroke({ width: 1, color: 0x0a2018, alpha: 0.8 });
  // alignment halqasi (pivot atrofida)
  alignG.clear();
  const acol = scene.alignment > 0.85 ? 0x39ff88 : (scene.alignment > 0.5 ? 0xffd23a : 0xff6a4a);
  alignG.circle(PVX, PVY, 26).stroke({ width: 2, color: 0x1a2a34, alpha: 0.6 });
  alignG.arc(PVX, PVY, 26, -Math.PI / 2, -Math.PI / 2 + scene.alignment * Math.PI * 2).stroke({ width: 3, color: acol, alpha: 0.9 });

  scene.flashT = Math.max(0, scene.flashT - dt);
  if (!playing) { flash.tint = 0xff3b2a; flash.alpha = (0.04 + (scene.charge < 0.2 ? 0.06 : 0)) * (0.5 + 0.5 * Math.sin(t * 6)); }
  else { flash.tint = 0x9fffcf; flash.alpha = scene.flashT * 0.28; }
  particles.tick(dt);
}
