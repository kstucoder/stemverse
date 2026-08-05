// baseScene — VOLTRA "Aqlli Baza" FINAL BOSS — RELAY MODULI (yangi element: quvvat kalitlash).
// Realistik BAZA KESIMI: 5 ta quyi-tizimli xona (REAKTOR, HAYOT-TA'MINOTI, YORUG'LIK, TERMAL,
// SHLYUZ) dastlab qorong'i. Relay paneli orqali har birini ISHGA TUSHIRAMIZ: POT bilan quvvatni
// kerakli oynaga sozla, band YASHIL bo'lganda BTN bilan relayni ULA — armatura "klik" etadi,
// xona yonadi. 5 tizim ham onlayn bo'lsa -> BAZA TO'LIQ ISHGA TUSHDI (missiya yakuni).
// Saga finali: muhit profili yig'ilgach (19), butun bazani integratsiya qilib onlayn qilamiz.
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const TARGET = 5, HOLD_NONE = 0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);
const SYS = [
  { name: 'REAKTOR', col: 0xff6a3c, x: 150 },
  { name: 'HAYOT', col: 0x39ff88, x: 322 },
  { name: 'YORUG\'LIK', col: 0xffd23a, x: 494 },
  { name: 'TERMAL', col: 0x00e5ff, x: 666 },
  { name: 'SHLYUZ', col: 0x6ab0ff, x: 838 },
];
const RY = 150, RW = 150, RH = 150;   // xona geometriyasi

function radialVignette(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.36, size / 2, size / 2, size * 0.64);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(2,4,8,0.9)'); c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}

export function assembleBase(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.52, bloomScale: 1.05, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#03060e', '#070d1a', '#0a1220', '#0a0f18'])); skyC.addChild(sky);
  const root = new Container(); app.stage.addChild(root);

  // KOSMOS foni (deraza ortida)
  const stars = new Graphics();
  for (let i = 0; i < 120; i++) stars.circle(rnd(0, LW), rnd(0, 130), rnd(0.3, 1.1)).fill({ color: 0xcfe0ff, alpha: rnd(0.2, 0.6) });
  root.addChild(stars);
  const earthGlow = new Sprite(radialTexture('rgba(70,130,255,0.4)', 256)); earthGlow.anchor.set(0.5); earthGlow.x = 890; earthGlow.y = 60; earthGlow.width = earthGlow.height = 200; earthGlow.blendMode = 'add'; root.addChild(earthGlow);
  const earth = new Graphics(); earth.circle(890, 56, 40).fill(0x163e70); earth.arc(890, 56, 40, -1.2, 1.0).stroke({ width: 3, color: 0x7ac0ff, alpha: 0.5 }); root.addChild(earth);

  // BAZA KORPUSI (kesim)
  const hull = new Graphics();
  hull.roundRect(48, RY - 20, 904, RH + 40, 22).fill(0x0c1219).stroke({ width: 4, color: 0x243441 });
  hull.roundRect(48, RY - 20, 904, RH + 40, 22).stroke({ width: 1.5, color: 0x33485a });
  root.addChild(hull);

  // XONALAR (quyi-tizimlar) — dastlab qorong'i
  const rooms = SYS.map((s, i) => {
    const c = new Container(); c.x = s.x; c.y = RY + RH / 2; root.addChild(c);
    const glow = new Sprite(radialTexture('rgba(255,255,255,0.8)', 256)); glow.anchor.set(0.5); glow.width = glow.height = 150; glow.blendMode = 'add'; glow.alpha = 0; glow.tint = s.col; c.addChild(glow);
    const cell = new Graphics();
    cell.rect(-RW / 2 + 6, -RH / 2 + 6, RW - 12, RH - 12).fill(0x070c12).stroke({ width: 1.5, color: 0x1e2c38 });
    // uskuna silueti (tizimga qarab)
    if (i === 0) { cell.circle(0, 6, 24).fill(0x12202a).stroke({ width: 2, color: 0x2a4a5a }); cell.circle(0, 6, 12).fill(0x0c1a22); }          // reaktor
    else if (i === 1) { for (let k = -1; k <= 1; k++) cell.roundRect(k * 20 - 8, -18, 16, 48, 3).fill(0x0e1a16).stroke({ width: 1, color: 0x1e4a36 }); } // ta'minot tanklar
    else if (i === 2) { cell.rect(-30, -30, 60, 8, 2).fill(0x1a1a0e); cell.moveTo(-24, -22).lineTo(-24, 20).moveTo(0, -22).lineTo(0, 20).moveTo(24, -22).lineTo(24, 20).stroke({ width: 2, color: 0x2a2a12 }); } // yorug'lik panellari
    else if (i === 3) { for (let k = -22; k <= 22; k += 11) cell.moveTo(k, -26).lineTo(k, 26).stroke({ width: 3, color: 0x123038 }); }              // termal radiator
    else { cell.circle(0, 6, 26).stroke({ width: 3, color: 0x1e3a5a }); cell.circle(0, 6, 18).stroke({ width: 2, color: 0x1e3a5a }); cell.rect(-4, -24, 8, 20).fill(0x14263a); } // shlyuz
    c.addChild(cell);
    const machine = new Graphics(); c.addChild(machine);   // onlayn animatsiya
    const border = new Graphics(); c.addChild(border);      // aktiv highlight
    const label = new Graphics(); c.addChild(label);
    return { c, glow, machine, border, col: s.col, name: s.name };
  });
  // xona ajratuvchi devorlar
  const walls = new Graphics();
  for (let i = 1; i < 5; i++) walls.rect(48 + i * (904 / 5) - 2, RY - 18, 4, RH + 36).fill(0x1a2734);
  root.addChild(walls);

  // quvvat shinasi (power bus) — pastda
  const busY = RY + RH + 26;
  const bus = new Graphics(); bus.rect(60, busY, 880, 6, 3).fill(0x14202a).stroke({ width: 1, color: 0x2a3a48 }); root.addChild(bus);
  const busFlow = new Graphics(); busFlow.blendMode = 'add'; root.addChild(busFlow);

  // ===== RELAY PANELI + QUVVAT GAUGE (oldingi konsol) =====
  const console_ = new Graphics();
  console_.poly([40, 452, LW - 40, 452, LW - 10, LH, 10, LH]).fill(0x0b1017).stroke({ width: 1.5, color: 0x243441 });
  root.addChild(console_);
  // 5 relay (armatura + LED)
  const relays = rooms.map((r, i) => {
    const c = new Container(); c.x = SYS[i].x; c.y = 500; root.addChild(c);
    const box = new Graphics(); box.roundRect(-30, -22, 60, 44, 4).fill(0x101820).stroke({ width: 1.5, color: 0x2a3a48 }); box.rect(-24, -16, 48, 6, 1).fill(0x0a1218); c.addChild(box);
    const arm = new Graphics(); arm.rect(-2, -6, 20, 5).fill(0x5a6a78); arm.pivot.set(-2, -3); arm.x = -8; arm.y = 4; c.addChild(arm);   // armatura (aylanadi)
    const coil = new Graphics().roundRect(6, -4, 16, 12, 2).fill(0x1a2630).stroke({ width: 1, color: 0x33485a }); c.addChild(coil);
    const led = new Graphics().circle(20, -14, 3).fill(0xff3b46); led.blendMode = 'add'; c.addChild(led);
    return { arm, led, col: SYS[i].col };
  });
  // quvvat gauge (gorizontal)
  const gaugeG = new Graphics(); root.addChild(gaugeG);
  const markerGlow = new Sprite(radialTexture('rgba(255,255,255,0.9)', 128)); markerGlow.anchor.set(0.5); markerGlow.y = 470; markerGlow.width = markerGlow.height = 40; markerGlow.blendMode = 'add'; root.addChild(markerGlow);

  const particles = makeParticles(root);
  const vign = new Sprite(radialVignette()); vign.alpha = 0.62; app.stage.addChild(vign);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffffff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  const scene = {
    app, sky, root, stars, rooms, walls, bus, busFlow, relays, gaugeG, markerGlow, particles, vign, flash,
    onlineFlags: [false, false, false, false, false], online: 0, activeIdx: 0,
    power: 0.2, targetC: 0.6, tol: 0.11, inBand: false, won: false,
    lastBtn: 0, lastReset: 0, flashT: 0, demoT: 0, armAnim: [0, 0, 0, 0, 0],
    pickActive() { const i = this.onlineFlags.findIndex((f) => !f); this.activeIdx = i < 0 ? 0 : i; this.tol = 0.11; this.targetC = rnd(0.32, 0.8); },
    reset() { this.onlineFlags = [false, false, false, false, false]; this.online = 0; this.won = false; this.armAnim = [0, 0, 0, 0, 0]; this.pickActive(); },
  };
  scene.pickActive();
  return scene;
}

const GX0 = 300, GX1 = 700, GYY = 470;   // quvvat gauge geometriyasi
const gxOf = (v) => GX0 + clamp(v, 0, 1) * (GX1 - GX0);

// ctl = { pot, btn, temp, connected, mode, resetPulse, onEngage, onWin, onNear }
export function baseTick(scene, dt, t, ctl) {
  const { app, sky, root, stars, rooms, busFlow, relays, gaugeG, markerGlow, particles, vign, flash } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH); root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  vign.width = w; vign.height = h; flash.width = w; flash.height = h;

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  stars.alpha = 0.7 + 0.3 * Math.sin(t * 0.6);

  // quvvat: pot (ulangan) yoki demo (target'ga homing)
  const playing = (ctl.connected && !scene.won) || ctl.mode === 'intro';
  if (ctl.connected) scene.power += (clamp((ctl.pot ?? 512) / 1023, 0, 1) - scene.power) * Math.min(1, dt * 12);
  else { scene.demoT += dt; scene.power += ((scene.targetC + 0.008 * Math.sin(scene.demoT * 3)) - scene.power) * Math.min(1, dt * 2.2); }

  const dist = Math.abs(scene.power - scene.targetC);
  scene.inBand = dist <= scene.tol;

  // BTN rising edge -> relayni ula (band ichida, aktiv tizim onlayn emas)
  const btn = ctl.connected ? (ctl.btn ? 1 : 0) : (scene.inBand && Math.floor(scene.demoT * 1.6) % 2 === 0 ? 1 : 0);
  if (btn && !scene.lastBtn && scene.inBand && playing && !scene.onlineFlags[scene.activeIdx]) {
    const i = scene.activeIdx;
    scene.onlineFlags[i] = true; scene.online++; scene.armAnim[i] = 1; scene.flashT = 0.5;
    particles.burst(SYS_X(i), RY + RH / 2, rooms[i].col, 26, 210); particles.burst(SYS_X(i), 500, 0xffffff, 8, 140);
    if (ctl.onEngage) ctl.onEngage(scene.online);
    if (scene.online >= TARGET && ctl.connected && ctl.mode !== 'intro') { scene.won = true; if (ctl.onWin) ctl.onWin(); }
    else scene.pickActive();
  }
  scene.lastBtn = btn;

  // xonalar holati
  rooms.forEach((r, i) => {
    const on = scene.onlineFlags[i], active = i === scene.activeIdx && !on;
    scene.armAnim[i] = Math.min(1, scene.armAnim[i] + (on ? dt * 4 : 0));
    r.glow.alpha = on ? 0.28 + 0.06 * Math.sin(t * 4 + i) : 0;
    // uskuna animatsiyasi (onlayn)
    r.machine.clear();
    if (on) {
      if (i === 0) r.machine.circle(0, 6, 6 + 2 * Math.sin(t * 8)).fill({ color: 0xffcaa0, alpha: 0.9 });        // reaktor yadro
      else if (i === 2) { for (let k = -24; k <= 24; k += 24) r.machine.rect(k - 3, -30, 6, 8).fill({ color: 0xfff2b0, alpha: 0.9 }); } // yorug'lik
      else r.machine.circle(0, 6, 4).fill({ color: r.col, alpha: 0.9 });
    }
    // aktiv highlight
    r.border.clear();
    if (active) r.border.rect(-RW / 2 + 4, -RH / 2 + 4, RW - 8, RH - 8).stroke({ width: 2, color: scene.inBand ? 0x39ff88 : r.col, alpha: 0.5 + 0.35 * Math.sin(t * 6) });
    r.label.clear(); r.label.rect(-RW / 2 + 6, RH / 2 - 20, RW - 12, 14).fill({ color: on ? r.col : 0x0c141c, alpha: on ? 0.25 : 0.6 });
  });

  // quvvat shinasi oqimi (onlayn tizim soniga qarab)
  busFlow.clear();
  const flowW = (scene.online / TARGET) * 880;
  busFlow.rect(60, RY + RH + 26, flowW, 6).fill({ color: 0x6bffb0, alpha: 0.5 + 0.2 * Math.sin(t * 4) });
  for (let x = 60; x < 60 + flowW; x += 24) { const px = 60 + ((x - 60 + t * 120) % Math.max(1, flowW)); busFlow.circle(px, RY + RH + 29, 2).fill({ color: 0xffffff, alpha: 0.6 }); }

  // relaylar (armatura + LED)
  relays.forEach((rl, i) => { rl.arm.rotation = lerp(0, -0.5, scene.armAnim[i]); rl.led.tint = scene.onlineFlags[i] ? 0x39ff88 : (i === scene.activeIdx ? 0xffd23a : 0xff3b46); rl.led.alpha = scene.onlineFlags[i] ? 0.9 : (i === scene.activeIdx ? 0.5 + 0.5 * Math.sin(t * 6) : 0.4); });

  // quvvat gauge (gorizontal) + target oyna + marker
  gaugeG.clear();
  gaugeG.roundRect(GX0 - 14, GYY - 7, (GX1 - GX0) + 28, 14, 7).fill({ color: 0x081018, alpha: 0.8 }).stroke({ width: 1.5, color: 0x2a4a5a });
  const active = scene.activeIdx, aCol = rooms[active].col;
  const xT = gxOf(scene.targetC), wTol = scene.tol * (GX1 - GX0);
  const bandCol = scene.inBand ? 0x39ff88 : (dist < scene.tol * 2 ? 0xffd23a : 0xff5a4a);
  gaugeG.rect(xT - wTol, GYY - 22, wTol * 2, 44).fill({ color: bandCol, alpha: 0.16 + (scene.inBand ? 0.12 : 0) });
  gaugeG.moveTo(xT, GYY - 26).lineTo(xT, GYY + 26).stroke({ width: 2, color: 0xffe45a, alpha: 0.75 });
  const xM = gxOf(scene.power);
  gaugeG.moveTo(xM, GYY - 20).lineTo(xM, GYY + 20).stroke({ width: 3, color: scene.inBand ? 0x39ff88 : aCol, alpha: 0.95 });
  gaugeG.circle(xM, GYY, 7).fill(scene.inBand ? 0x39ff88 : aCol);
  markerGlow.x = xM; markerGlow.tint = scene.inBand ? 0x39ff88 : aCol; markerGlow.alpha = 0.4 + (scene.inBand ? 0.4 : 0);

  scene.flashT = Math.max(0, scene.flashT - dt); flash.tint = 0x9fffcf; flash.alpha = scene.flashT * 0.32;
  particles.tick(dt);
}

function SYS_X(i) { return SYS[i].x; }
