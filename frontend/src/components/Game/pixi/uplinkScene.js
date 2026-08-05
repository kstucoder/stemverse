// uplinkScene — VOLTRA "Telemetriya Uplinki" — ESP8266 WiFi UPLINK (yangi element: simsiz aloqa).
// Realistik MISSIYA-BOSHQARUV: kosmosdan o'tayotgan flot sun'iy yo'ldoshiga bazadan telemetriya
// paketlarini uzatamiz. POT — uplink antennasini nishonlaydi (azimut), signal kuchaydi;
// signal LOCK bo'lganda BTN bosib data-paketni uzat. 5 paket uzatilsa -> uplink o'rnatildi.
// Saga davomi: aloqa tiklangach (17), endi jonli sensor telemetriyasini flotga stream qilamiz.
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const GROUND = 250, DISH_X = 500, DISH_Y = GROUND, TARGET = 5, RANGE = 62;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);

function radialVignette(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.36, size / 2, size / 2, size * 0.64);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(2,5,10,0.9)'); c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}

// sun'iy yo'ldosh (korpus + quyosh panellari + antenna)
function makeSat(parent) {
  const c = new Container();
  const glow = new Sprite(radialTexture('rgba(120,200,255,0.6)', 128)); glow.anchor.set(0.5); glow.width = glow.height = 60; glow.blendMode = 'add'; c.addChild(glow);
  const g = new Graphics();
  g.rect(-16, -6, 32, 12).fill(0x2a3846).stroke({ width: 1.5, color: 0x5a7286 });   // panellar bar
  g.rect(-30, -8, 14, 16).fill(0x14324a).stroke({ width: 1, color: 0x2e6a9a });      // chap panel
  g.rect(16, -8, 14, 16).fill(0x14324a).stroke({ width: 1, color: 0x2e6a9a });       // o'ng panel
  for (let i = -28; i < -16; i += 4) g.moveTo(i, -8).lineTo(i, 8).stroke({ width: 0.6, color: 0x1a4a6a });
  for (let i = 18; i < 30; i += 4) g.moveTo(i, -8).lineTo(i, 8).stroke({ width: 0.6, color: 0x1a4a6a });
  g.roundRect(-8, -8, 16, 16, 3).fill(0x3a4a5a).stroke({ width: 1.5, color: 0x6a8aa0 }); // korpus
  g.moveTo(0, -8).lineTo(0, -18).stroke({ width: 1.5, color: 0x6a8aa0 }); g.circle(0, -18, 2.5).fill(0x9fd0ff); // antenna
  c.addChild(g);
  const link = new Graphics().circle(0, 8, 3).fill(0x39ff88); link.blendMode = 'add'; c.addChild(link);
  parent.addChild(c);
  return { c, glow, link };
}

export function assembleUplink(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.55, bloomScale: 1.0, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#03060e', '#07101f', '#0a1526', '#0c1420'])); skyC.addChild(sky);
  const root = new Container(); app.stage.addChild(root);

  // KOSMOS: yulduzlar + Yer + orbit yoyi
  const stars = new Graphics();
  for (let i = 0; i < 140; i++) stars.circle(rnd(0, LW), rnd(0, GROUND - 10), rnd(0.3, 1.1)).fill({ color: 0xcfe0ff, alpha: rnd(0.2, 0.7) });
  root.addChild(stars);
  const earthGlow = new Sprite(radialTexture('rgba(70,140,255,0.5)', 256)); earthGlow.anchor.set(0.5); earthGlow.x = 130; earthGlow.y = 70; earthGlow.width = earthGlow.height = 260; earthGlow.blendMode = 'add'; root.addChild(earthGlow);
  const earth = new Graphics();
  earth.circle(130, 70, 62).fill(0x14487a); earth.ellipse(112, 60, 26, 13).fill({ color: 0x2f8f6a, alpha: 0.7 }); earth.ellipse(150, 84, 20, 10).fill({ color: 0x2f8f6a, alpha: 0.6 }); earth.arc(130, 70, 62, -1.3, 0.9).stroke({ width: 4, color: 0x7ac0ff, alpha: 0.5 });
  root.addChild(earth);
  const orbit = new Graphics();
  for (let x = 40; x < LW - 20; x += 24) orbit.moveTo(x, 70 - Math.sin(x / LW * Math.PI) * 22).lineTo(x + 12, 70 - Math.sin((x + 12) / LW * Math.PI) * 22).stroke({ width: 1, color: 0x2e5a7a, alpha: 0.5 });
  root.addChild(orbit);

  const beam = new Graphics(); beam.blendMode = 'add'; root.addChild(beam);   // uplink nur (dishdan sat'ga)
  const sat = makeSat(root);
  const particles = makeParticles(root);

  // ===== MISSIYA-BOSHQARUV XONASI =====
  const room = new Graphics();
  room.rect(0, GROUND, LW, LH - GROUND).fill(0x0a1018);
  room.rect(0, GROUND, LW, 3).fill({ color: 0x1c3346, alpha: 0.6 });
  for (let x = 40; x < LW; x += 70) room.moveTo(x, GROUND).lineTo(x, LH).stroke({ width: 1, color: 0x101c28, alpha: 0.5 });
  root.addChild(room);

  // katta devor-ekran (orbit xaritasi + telemetriya grafik)
  const screen = new Graphics();
  screen.roundRect(300, GROUND + 16, 400, 150, 8).fill(0x05131a).stroke({ width: 3, color: 0x1a3a4a });
  screen.roundRect(300, GROUND + 16, 400, 18, 8).fill(0x0c2230);
  root.addChild(screen);
  const graphG = new Graphics(); root.addChild(graphG);          // telemetriya chizig'i (real-time)
  const telem = new Float32Array(60);

  // signal ustunlari + paket LEDlari (HUD sahna ichida)
  const sigG = new Graphics(); root.addChild(sigG);

  // apparat rack'lar (chap/o'ng) — blink LEDlar
  const rackLeds = [];
  [[24, GROUND + 24], [900, GROUND + 24]].forEach(([rx, ry]) => {
    const g = new Graphics(); g.roundRect(rx, ry, 76, 260, 4).fill(0x121820).stroke({ width: 1.5, color: 0x2a333d });
    for (let y = ry + 10; y < ry + 250; y += 22) { g.roundRect(rx + 6, y, 64, 15, 2).fill(0x0c1118).stroke({ width: 1, color: 0x222c36 }); }
    root.addChild(g);
    for (let y = ry + 10; y < ry + 250; y += 22) { const led = new Graphics().circle(rx + 64, y + 7, 2.4).fill(0x39ff88); led.blendMode = 'add'; root.addChild(led); rackLeds.push({ led, phase: rnd(0, 6.28), sp: rnd(1, 4), hue: Math.random() < 0.3 ? 0xff9a3c : 0x39ff88 }); }
  });

  // uplink DISH (tomda, pot bilan nishonlaydi)
  const dishC = new Container(); dishC.x = DISH_X; dishC.y = DISH_Y; root.addChild(dishC);
  const dishG = new Graphics();
  dishG.rect(-5, 0, 10, 34).fill(0x232a32);                                    // pedestal
  dishC.addChild(dishG);
  const dishHead = new Container(); dishHead.y = -2; dishC.addChild(dishHead);
  const dh = new Graphics();
  dh.ellipse(0, 0, 30, 12).fill(0x161c23).stroke({ width: 2, color: 0x3a444f });
  dh.ellipse(0, 0, 23, 8).fill(0x0d1218);
  dh.moveTo(0, 0).lineTo(0, -18).stroke({ width: 2, color: 0x49535d }); dh.circle(0, -18, 3).fill(0x9fd0ff);
  dishHead.addChild(dh);

  // konsol (oldingi stol)
  const desk = new Graphics();
  desk.poly([60, 470, LW - 60, 470, LW - 20, 512, 20, 512]).fill(0x141b22).stroke({ width: 1.5, color: 0x2a333d });
  for (let i = 0; i < 10; i++) { const kx = 120 + i * 30; desk.circle(kx, 490, 7).fill(0x1a222c).stroke({ width: 1, color: 0x33404b }); }
  for (let i = 0; i < 8; i++) desk.roundRect(560 + i * 24, 484, 16, 12, 2).fill(i % 3 === 0 ? 0x2a5a3a : 0x24303c);
  root.addChild(desk);

  const vign = new Sprite(radialVignette()); vign.alpha = 0.6; app.stage.addChild(vign);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffffff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  const scene = {
    app, sky, root, stars, sat, beam, dishHead, graphG, telem, sigG, rackLeds, particles, vign, flash,
    packets: 0, signal: 0, aimX: 500, satX: 200, satDir: 1, locked: false, won: false,
    lastBtn: 0, lastReset: 0, flashT: 0, demoT: 0, tempTelem: 40,
    reset() { this.packets = 0; this.won = false; this.satX = 120; this.telem.fill(0); },
  };
  return scene;
}

// ctl = { pot, btn, connected, mode, resetPulse, onTransmit, onWin, onNear }
export function uplinkTick(scene, dt, t, ctl) {
  const { app, sky, root, stars, sat, beam, dishHead, graphG, telem, sigG, rackLeds, particles, vign, flash } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH); root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  vign.width = w; vign.height = h; flash.width = w; flash.height = h;

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // sun'iy yo'ldosh orbit bo'ylab harakat
  scene.satX += scene.satDir * lerp(60, 95, scene.packets / TARGET) * dt;
  if (scene.satX > LW - 60) scene.satDir = -1; if (scene.satX < 60) scene.satDir = 1;
  const satY = 70 - Math.sin(scene.satX / LW * Math.PI) * 22;
  sat.c.x = scene.satX; sat.c.y = satY; sat.c.rotation = Math.sin(t) * 0.05;

  // atmosfera
  stars.alpha = 0.7 + 0.3 * Math.sin(t * 0.7);
  rackLeds.forEach((o) => { o.led.tint = o.hue; o.led.alpha = Math.sin(t * o.sp + o.phase) > 0.4 ? 0.9 : 0.15; });

  // nishonlash: pot -> aimX; ulanmaganda demo (sat'ni kuzatadi)
  const playing = ctl.connected && !scene.won;
  if (ctl.connected) scene.aimX = lerp(120, 880, clamp((ctl.pot ?? 512) / 1023, 0, 1));
  else { scene.demoT += dt; scene.aimX += (scene.satX - scene.aimX) * Math.min(1, dt * 2.2); }

  const dx = scene.aimX - scene.satX;
  scene.signal = clamp(1 - Math.abs(dx) / RANGE, 0, 1);
  scene.locked = scene.signal > 0.55;

  // dish nishonlash burchagi (aimX, satY tomon)
  const ang = Math.atan2(satY - DISH_Y, scene.aimX - DISH_X);
  dishHead.rotation = clamp(ang + Math.PI / 2, -1.2, 1.2);

  // uplink nur
  beam.clear();
  if (scene.signal > 0.15) {
    const a = scene.signal;
    beam.moveTo(DISH_X - 6, DISH_Y - 14).lineTo(scene.satX - 8, satY + 6).lineTo(scene.satX + 8, satY + 6).lineTo(DISH_X + 6, DISH_Y - 14).fill({ color: scene.locked ? 0x39ff88 : 0x2e8ad0, alpha: 0.06 + a * 0.18 });
    beam.moveTo(DISH_X, DISH_Y - 16).lineTo(scene.satX, satY + 4).stroke({ width: 1 + a * 1.5, color: scene.locked ? 0x6bffb0 : 0x6ab0ff, alpha: 0.25 + a * 0.5 });
  }
  sat.link.alpha = 0.3 + scene.signal * 0.7; sat.link.tint = scene.locked ? 0x39ff88 : 0xffb020;
  sat.glow.alpha = 0.4 + scene.signal * 0.4;

  // BTN rising edge -> paket uzat (lock bo'lganda)
  const btn = ctl.connected ? (ctl.btn ? 1 : 0) : (scene.locked && Math.sin(scene.demoT * 2) > 0.9 ? 1 : 0);
  if (btn && !scene.lastBtn && scene.locked && playing) {
    scene.packets++; scene.flashT = 0.35;
    particles.burst(DISH_X, DISH_Y - 16, 0x39ff88, 8, 160);
    // paket sat'ga uchadi
    const p = { g: new Graphics().rect(-3, -3, 6, 6).fill(0x9fffcf), x: DISH_X, y: DISH_Y - 16, tx: scene.satX, ty: satY, k: 0 };
    p.g.blendMode = 'add'; root.addChild(p.g); (scene.pkts || (scene.pkts = [])).push(p);
    if (ctl.onTransmit) ctl.onTransmit(scene.packets);
    if (scene.packets >= TARGET && ctl.mode !== 'intro') { scene.won = true; if (ctl.onWin) ctl.onWin(); }
  }
  scene.lastBtn = btn;

  // uchayotgan paketlar
  if (scene.pkts) for (let i = scene.pkts.length - 1; i >= 0; i--) { const p = scene.pkts[i]; p.k += dt * 2.2; p.g.x = lerp(p.x, p.tx, p.k); p.g.y = lerp(p.y, p.ty, p.k) - Math.sin(p.k * Math.PI) * 30; p.g.alpha = 1 - p.k; if (p.k >= 1) { p.g.destroy(); scene.pkts.splice(i, 1); } }

  // telemetriya grafik (real-time, temp'dan yoki demo)
  scene.tempTelem = ctl.connected ? (ctl.temp ?? scene.tempTelem) : 40 + 8 * Math.sin(t * 0.8) + 4 * Math.sin(t * 2.3);
  for (let i = 0; i < telem.length - 1; i++) telem[i] = telem[i + 1];
  telem[telem.length - 1] = clamp((scene.tempTelem - 20) / 40, 0, 1);
  graphG.clear();
  const gx0 = 316, gy0 = GROUND + 40, gw = 368, gh = 96;
  graphG.moveTo(gx0, gy0 + gh - telem[0] * gh);
  for (let i = 0; i < telem.length; i++) graphG.lineTo(gx0 + (i / (telem.length - 1)) * gw, gy0 + gh - telem[i] * gh);
  graphG.stroke({ width: 2, color: 0x39ff88, alpha: 0.85 });
  for (let gy = 0; gy <= 3; gy++) graphG.moveTo(gx0, gy0 + (gy / 3) * gh).lineTo(gx0 + gw, gy0 + (gy / 3) * gh).stroke({ width: 1, color: 0x163a2a, alpha: 0.5 });

  // signal ustunlari + paket indikator (ekran chetida)
  sigG.clear();
  for (let b = 0; b < 5; b++) { const on = scene.signal * 5 > b; sigG.rect(712, GROUND + 150 - b * 16, 22, 12).fill({ color: on ? (b > 3 ? 0x39ff88 : 0x6ab0ff) : 0x1a2a36, alpha: on ? 0.95 : 0.5 }); }
  for (let b = 0; b < TARGET; b++) sigG.circle(320 + b * 18, GROUND + 176, 5).fill({ color: b < scene.packets ? 0x39ff88 : 0x243441, alpha: b < scene.packets ? 1 : 0.6 });

  scene.flashT = Math.max(0, scene.flashT - dt); flash.tint = 0x9fffcf; flash.alpha = scene.flashT * 0.3;
  particles.tick(dt);
}
