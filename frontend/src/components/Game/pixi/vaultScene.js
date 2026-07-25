// vaultScene — VOLTRA "Seyf Sirini Buz" PixiJS olami (realistik bank seyfi).
// Po'lat devorli seyf xonasi: massiv aylanma seyf eshigi (konsentrik metall
// halqalar, radial rigellar, kombinatsiya diski, dastak g'ildiragi, ilgaklar),
// qizil lazer xavfsizlik to'ri, aylanuvchi kamera. Tugma (BTN) har bosilganda
// bitta rigel ochiladi; 5 marta bosilsa eshik ochilib, ichidan oltin ko'rinadi.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';
import { createTweens, Eases } from './tween';

export const LW = 1000;
export const LH = 560;
const CX = 500, CY = 268, R = 138, HINGE = R + 46;
const PINS = 5, BOLTS = 8;

/* konsentrik metall halqalar — cho'yan seyf tuyg'usi */
function metalDisc(r) {
  const g = new Graphics();
  const rings = [[r, 0x2a3142], [r - 8, 0x39415a], [r - 18, 0x2f3648], [r - 30, 0x434c68], [r - 44, 0x2b3244], [r - 58, 0x3d465f]];
  rings.forEach(([rr, c]) => g.circle(0, 0, rr).fill(c));
  // yorug'lik yoyi (metall aks)
  g.arc(0, 0, r - 6, Math.PI * 1.15, Math.PI * 1.75).stroke({ width: 6, color: 0x6b7699, alpha: 0.5 });
  g.arc(0, 0, r - 34, Math.PI * 0.1, Math.PI * 0.7).stroke({ width: 5, color: 0x1a2030, alpha: 0.6 });
  return g;
}

function rivets(r, n) {
  const g = new Graphics();
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; g.circle(Math.cos(a) * r, Math.sin(a) * r, 3).fill(0x59617e).circle(Math.cos(a) * r, Math.sin(a) * r, 1.4).fill(0x1a2030); }
  return g;
}

export function assembleVault(app) {
  const tweens = createTweens();
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 0.9, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container();
  app.stage.addChild(skyC);
  const bg = new Sprite(gradTexture(['#0c0f16', '#12161f', '#0c0f16', '#080a10']));
  skyC.addChild(bg);

  const root = new Container();
  app.stage.addChild(root);

  // ---- po'lat devor panellari + rivetlar ----
  const wall = new Graphics();
  for (let x = 0; x < LW; x += 125) for (let y = 0; y < 440; y += 110) {
    wall.roundRect(x + 4, y + 4, 117, 102, 4).fill(0x161b26).roundRect(x + 4, y + 4, 117, 102, 4).stroke({ width: 1.5, color: 0x0c1018 });
    [[x + 12, y + 12], [x + 113, y + 12], [x + 12, y + 98], [x + 113, y + 98]].forEach(([rx, ry]) => wall.circle(rx, ry, 2.6).fill(0x2c3346).circle(rx, ry, 1.2).fill(0x0a0d14));
  }
  root.addChild(wall);

  // ---- pol + aks ----
  const floor = new Graphics().rect(0, 440, LW, LH - 440).fill(0x0a0d14);
  for (let i = -7; i <= 7; i++) floor.moveTo(CX + i * 70, 440).lineTo(CX + i * 220, LH).stroke({ width: 1, color: 0x141a28, alpha: 0.8 });
  floor.rect(0, 440, LW, 3).fill({ color: 0x00eeff, alpha: 0.18 });
  root.addChild(floor);

  // spotlight
  const spot = new Sprite(radialTexture('rgba(255,244,214,0.12)', 512));
  spot.anchor.set(0.5); spot.width = 480; spot.height = 560; spot.x = CX; spot.y = CY - 30;
  root.addChild(spot);

  // ---- oltin ichki (ochilganda ko'rinadi) ----
  const interior = new Container(); interior.x = CX; interior.y = CY;
  const goldGlow = new Sprite(radialTexture('rgba(255,205,70,0.95)', 512)); goldGlow.anchor.set(0.5); goldGlow.width = goldGlow.height = 300;
  const vaultHole = new Graphics().circle(0, 0, R - 6).fill(0x0a0803);
  const bars = new Graphics();
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4 - r; c++) { const bx = -60 + c * 34 + r * 17, by = 40 - r * 16; bars.roundRect(bx, by, 30, 13, 2).fill(0xffd23f).roundRect(bx, by, 30, 4, 2).fill(0xfff0a0); }
  const core = new Graphics().circle(0, -22, 20).fill(0x00eeff).circle(0, -22, 12).fill(0xbdf5ff);
  interior.addChild(goldGlow, vaultHole, bars, core);
  interior.alpha = 0; interior.scale.set(0.9);
  // interior romdan KEYIN qo'shiladi (rom teshigidan ko'rinishi uchun)

  // ---- seyf romi (devordagi teshik atrofidagi qalin po'lat) ----
  const frame = new Container(); frame.x = CX; frame.y = CY;
  frame.addChild(new Graphics().circle(0, 0, R + 34).fill(0x1c222f).circle(0, 0, R + 34).stroke({ width: 3, color: 0x0c1018 }));
  frame.addChild(new Graphics().circle(0, 0, R + 20).fill(0x252c3c));
  frame.addChild(rivets(R + 27, 32));
  root.addChild(frame);

  // ilgaklar (o'ng tomonda)
  const hinges = new Graphics();
  [-70, 70].forEach((dy) => { hinges.roundRect(CX + R + 10, CY + dy - 16, 30, 32, 6).fill(0x2c3346).roundRect(CX + R + 10, CY + dy - 16, 30, 32, 6).stroke({ width: 2, color: 0x4a5470 }); hinges.circle(CX + R + 25, CY + dy, 5).fill(0x59617e); });
  root.addChild(hinges);
  root.addChild(interior);   // rom+ilgakdan keyin — teshikdan oltin ko'rinadi

  // ---- eshik pardasi (ilgak atrofida ochiladi) ----
  const doorLeaf = new Container();
  doorLeaf.position.set(CX + HINGE, CY);
  doorLeaf.pivot.set(HINGE, 0);
  root.addChild(doorLeaf);

  doorLeaf.addChild(metalDisc(R));
  doorLeaf.addChild(rivets(R - 12, 24));

  // radial rigellar (ochilganda tashqariga siljiydi)
  const bolts = [];
  for (let i = 0; i < BOLTS; i++) {
    const a = (i / BOLTS) * Math.PI * 2;
    const bc = new Container(); bc.rotation = a;
    const peg = new Graphics().roundRect(R - 40, -6, 52, 12, 3).fill(0x565f7c).roundRect(R - 40, -6, 52, 12, 3).stroke({ width: 1, color: 0x2a3246 });
    bc.addChild(peg);
    doorLeaf.addChild(bc);
    bolts.push({ bc, peg });
  }

  // kombinatsiya diski (aylanadi, chiziqchali)
  const dial = new Graphics();
  dial.circle(0, 0, 66).fill(0x1a2030).circle(0, 0, 66).stroke({ width: 3, color: 0x4a5470 });
  dial.circle(0, 0, 58).stroke({ width: 1, color: 0x2c3346 });
  for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; const rr = i % 5 === 0 ? 50 : 55; dial.moveTo(Math.cos(a) * rr, Math.sin(a) * rr).lineTo(Math.cos(a) * 63, Math.sin(a) * 63).stroke({ width: i % 5 === 0 ? 2 : 1, color: 0x6b7699 }); }
  doorLeaf.addChild(dial);
  // dial ko'rsatkichi (qizil)
  const pointer = new Graphics().poly([0, -70, -5, -60, 5, -60]).fill(0xffffff);
  pointer.tint = 0xff3b46;
  doorLeaf.addChild(pointer);

  // dastak g'ildiragi
  const wheel = new Container();
  for (let i = 0; i < 3; i++) { const g = new Graphics().roundRect(-52, -5, 104, 10, 5).fill(0x39415a).roundRect(-52, -5, 104, 10, 5).stroke({ width: 1, color: 0x59617e }); g.rotation = (i / 3) * Math.PI; wheel.addChild(g); }
  [-52, 52].forEach((x) => wheel.addChild(new Graphics().circle(x, 0, 8).fill(0x4a5470)));
  wheel.addChild(new Graphics().circle(0, 0, 16).fill(0x2c3346).circle(0, 0, 16).stroke({ width: 2, color: 0x59617e }).circle(0, 0, 6).fill(0x1a2030));
  doorLeaf.addChild(wheel);

  // 5 ta qulf-LED (holat ko'rsatkichi)
  const pinLEDs = [];
  for (let i = 0; i < PINS; i++) {
    const px = -44 + i * 22, py = R - 30;
    const led = new Graphics().circle(px, py, 5).fill(0x3a1015);
    doorLeaf.addChild(led);
    pinLEDs.push({ led, px, py });
  }

  const particles = makeParticles(root);

  // ---- lazer xavfsizlik to'ri ----
  const lasers = new Graphics();
  root.addChild(lasers);
  const laserPts = [[70, 150, 930, 250], [930, 120, 70, 330], [120, 400, 900, 180], [60, 300, 940, 420]];

  // ---- shift kamerasi (aylanadi) ----
  const cam = new Container(); cam.x = 150; cam.y = 40;
  cam.addChild(new Graphics().roundRect(-18, -14, 36, 20, 5).fill(0x1a2030).roundRect(-18, -14, 36, 20, 5).stroke({ width: 1.5, color: 0x4a5470 }));
  const camEye = new Graphics().circle(0, 12, 7).fill(0x0a0d14).circle(0, 12, 3).fill(0xff3b46);
  cam.addChild(camEye);
  root.addChild(cam);

  // ---- devordagi boshqaruv tablosi (lazerni faollashtiradi) ----
  const panel = new Container(); panel.x = 838; panel.y = 196;
  panel.addChild(new Graphics().roundRect(-44, -56, 88, 112, 8).fill(0x141a26).roundRect(-44, -56, 88, 112, 8).stroke({ width: 2, color: 0x2c3346 }));
  const panelScreen = new Graphics().roundRect(-34, -46, 68, 42, 4).fill(0x0a1420).roundRect(-34, -46, 68, 42, 4).stroke({ width: 1, color: 0x223049 });
  panel.addChild(panelScreen);
  for (let i = 0; i < 6; i++) panel.addChild(new Graphics().circle(-24 + (i % 3) * 24, 12 + Math.floor(i / 3) * 24, 6).fill(0x2c3346).circle(-24 + (i % 3) * 24, 12 + Math.floor(i / 3) * 24, 6).stroke({ width: 1, color: 0x4a5470 }));
  root.addChild(panel);

  // ogohlantirish chiroqlari
  const warn = new Graphics();
  root.addChild(warn);

  return {
    app, tweens, particles, skyC, bg, root, spot, interior, goldGlow, core, frame, doorLeaf, bolts, dial, pointer, wheel, pinLEDs, lasers, laserPts, cam, camEye, warn, panel, panelScreen, CX, CY, R,
    stepS: 0, dialR: 0, opened: false, laserA: 1, warnT: 0,
  };
}

// ctl = { pins, openPulse, connected }
export function vaultTick(scene, dt, t, ctl) {
  const { app, bg, root, doorLeaf, bolts, dial, pointer, pinLEDs, interior, goldGlow, lasers, laserPts, cam, camEye, warn, particles } = scene;
  const w = app.screen.width, h = app.screen.height;
  bg.width = w; bg.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;

  const step = ctl.connected ? (ctl.step || 0) : 0;
  scene.stepS += (step - scene.stepS) * Math.min(dt * 6, 1);
  const frac = scene.stepS / 3;

  // disk POT bilan REAL VAQTDA aylanadi; ko'rsatkich (tepada) qo'zg'almas turadi
  const dialNum = ctl.connected ? (ctl.dialNum || 0) : 0;
  dial.rotation = (dialNum / 40) * Math.PI * 2;
  pointer.tint = ctl.onTarget ? 0x39e06a : 0xff3b46;
  pointer.rotation = 0;

  // rigellar tashqariga siljiydi (har tasdiqlangan raqamda)
  bolts.forEach((b) => { b.peg.x = frac * 30; b.peg.tint = frac > 0.1 ? 0x6ad07a : 0x565f7c; });

  // 3 ta step LED (kombinatsiya raqamlari)
  pinLEDs.forEach((p, i) => {
    const on = i < Math.round(scene.stepS);
    const nextGlow = ctl.onTarget && i === Math.round(scene.stepS);
    p.led.clear();
    p.led.circle(p.px, p.py, 5).fill(on ? 0x39e06a : nextGlow ? 0xffc21a : 0x3a1015);
    if (on || nextGlow) p.led.circle(p.px, p.py, 7).stroke({ width: 1.5, color: on ? 0x39e06a : 0xffc21a, alpha: 0.6 });
  });

  // ochilish
  if (ctl.openPulse && !scene.opened) {
    scene.opened = true;
    scene.tweens.add({ duration: 1.4, ease: Eases.outCubic, update: (k) => { doorLeaf.rotation = k * 1.15; } });
    scene.tweens.add({ duration: 0.9, delay: 0.3, ease: Eases.outCubic, update: (k) => { interior.alpha = k; interior.scale.set(0.9 + k * 0.1); } });
    for (let n = 0; n < 70; n++) particles.burst(CX, CY, [0xffd23f, 0xfff0a0, 0xff9f1c][n % 3], 2, 250);
  }
  goldGlow.alpha = scene.opened ? 0.6 + 0.25 * Math.sin(t * 2.5) : 0;

  // lazerlar (ochilguncha)
  scene.laserA += ((scene.opened ? 0 : (ctl.connected ? 0.85 : 0.6)) - scene.laserA) * Math.min(dt * 3, 1);
  lasers.clear();
  if (scene.laserA > 0.02) {
    laserPts.forEach((b, i) => {
      const wob = Math.sin(t * 1.4 + i) * 8;
      lasers.moveTo(b[0], b[1] + wob).lineTo(b[2], b[3] - wob).stroke({ width: 1.5, color: 0xff2d40, alpha: scene.laserA * 0.4 });
      lasers.circle(b[0], b[1] + wob, 3).fill({ color: 0xff2d40, alpha: scene.laserA });
    });
  }

  // kamera skani
  cam.children[0].rotation = 0;
  camEye.rotation = Math.sin(t * 0.6) * 0.5;
  cam.rotation = Math.sin(t * 0.6) * 0.15;

  // ogohlantirish chiroqlari (ochilmagan holatda pulslar)
  scene.warnT += dt;
  warn.clear();
  const wa = scene.opened ? 0 : 0.3 + 0.3 * Math.abs(Math.sin(t * 2.5));
  if (wa > 0.02) { warn.circle(60, 60, 8).fill({ color: 0xff2d40, alpha: wa }); warn.circle(940, 60, 8).fill({ color: 0xff2d40, alpha: wa }); }
}
