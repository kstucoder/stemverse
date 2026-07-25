// vaultScene — VOLTRA "Seyf Sirini Buz" PixiJS olami.
// Shahar bankidagi tungi o'g'irlik: ulkan aylanma seyf eshigi, lazer xavfsizlik
// to'ri, 5 ta qulf shtifti. Tugma (BTN) har bosilganda bitta shtift ochiladi;
// 5 marta bosilsa seyf ochiladi. Energy City bilan bir xil vizual til.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';
import { createTweens, Eases } from './tween';

export const LW = 1000;
export const LH = 560;
const CX = 500, CY = 278, R = 128;
const PINS = 5;

export function assembleVault(app) {
  const tweens = createTweens();
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.45, bloomScale: 1.0, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container();
  app.stage.addChild(skyC);
  const wall = new Sprite(gradTexture(['#0a0d16', '#0d1220', '#0a0d16', '#070a12']));
  skyC.addChild(wall);

  const root = new Container();
  app.stage.addChild(root);

  // orqa deraza — shahar silueti (bank ichidan ko'ringan shahar)
  const win = new Graphics().roundRect(120, 60, 250, 150, 6).fill(0x060a14).roundRect(120, 60, 250, 150, 6).stroke({ width: 3, color: 0x1c2a44 });
  root.addChild(win);
  const sky = makeSkyline(90, 0x0e1830, 23); sky.y = 210 - 470; sky.x = 60;
  const winMask = new Graphics().roundRect(120, 60, 250, 150, 6).fill(0xffffff);
  sky.mask = winMask; root.addChild(sky, winMask);
  for (let i = 0; i < 3; i++) root.addChild(new Graphics().rect(120 + i * 83, 60, 2, 150).fill({ color: 0x1c2a44, alpha: 0.6 }));

  // marmar pol + aks
  const floor = new Graphics()
    .moveTo(0, 440).lineTo(LW, 440).lineTo(LW, LH).lineTo(0, LH).closePath().fill(0x0a0e18);
  for (let i = -6; i <= 6; i++) floor.moveTo(CX + i * 90, 440).lineTo(CX + i * 200, LH).stroke({ width: 1, color: 0x141c2e, alpha: 0.7 });
  floor.moveTo(0, 440).lineTo(LW, 440).stroke({ width: 2, color: 0x00eeff, alpha: 0.25 });
  root.addChild(floor);

  // spotlight konus
  const spot = new Sprite(radialTexture('rgba(255,240,200,0.10)', 512));
  spot.anchor.set(0.5); spot.width = 420; spot.height = 520; spot.x = CX; spot.y = CY;
  root.addChild(spot);

  // seyf gale'osi (ochilganda oltin nur)
  const goldGlow = new Sprite(radialTexture('rgba(255,200,60,0.9)', 512));
  goldGlow.anchor.set(0.5); goldGlow.width = goldGlow.height = 300; goldGlow.x = CX; goldGlow.y = CY; goldGlow.alpha = 0;
  root.addChild(goldGlow);

  // seyf eshigi (aylanadi/ochiladi)
  const vault = new Container(); vault.x = CX; vault.y = CY;
  root.addChild(vault);
  const body = new Graphics()
    .circle(0, 0, R + 14).fill(0x11161f).circle(0, 0, R + 14).stroke({ width: 4, color: 0x2a3444 })
    .circle(0, 0, R).fill(0x161c28).circle(0, 0, R).stroke({ width: 2, color: 0x33405a });
  vault.addChild(body);

  // qulf halqasi (5 segment — redraw)
  const lockRing = new Graphics();
  vault.addChild(lockRing);

  // markaziy dial (aylanadi)
  const dial = new Graphics()
    .circle(0, 0, 62).fill(0x1c2536).circle(0, 0, 62).stroke({ width: 2, color: 0x3a4a68 });
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; dial.moveTo(Math.cos(a) * 54, Math.sin(a) * 54).lineTo(Math.cos(a) * 62, Math.sin(a) * 62).stroke({ width: 1.5, color: 0x4a5a7a }); }
  vault.addChild(dial);
  const spokes = new Container();
  for (let i = 0; i < 3; i++) { const g = new Graphics().roundRect(-46, -4, 92, 8, 4).fill(0x33405a); g.rotation = (i / 3) * Math.PI; spokes.addChild(g); }
  spokes.addChild(new Graphics().circle(0, 0, 12).fill(0x44557a).circle(0, 0, 12).stroke({ width: 2, color: 0x5a6c92 }));
  vault.addChild(spokes);

  const particles = makeParticles(root);

  // lazer xavfsizlik to'ri (qizil)
  const lasers = new Graphics();
  root.addChild(lasers);

  return {
    app, tweens, particles, skyC, wall, root, spot, goldGlow, vault, lockRing, dial, spokes, lasers,
    pinsS: 0, dialTarget: 0, opened: false, laserA: 1, openT: 0,
  };
}

// ctl = { pins, openPulse, connected }
export function vaultTick(scene, dt, t, ctl) {
  const { app, wall, root, lockRing, dial, spokes, goldGlow, vault, lasers, particles } = scene;
  const w = app.screen.width, h = app.screen.height;
  wall.width = w; wall.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;

  const pins = ctl.connected ? (ctl.pins || 0) : 0;
  scene.pinsS += (pins - scene.pinsS) * Math.min(dt * 6, 1);

  // dial har shtiftda 72° buriladi
  scene.dialTarget = pins * (Math.PI * 2 / PINS);
  dial.rotation += (scene.dialTarget - dial.rotation) * Math.min(dt * 5, 1) + dt * 0.15;
  spokes.rotation += dt * 0.1;

  // qulf halqasi segmentlari
  lockRing.clear();
  for (let i = 0; i < PINS; i++) {
    const a0 = -Math.PI / 2 + (i / PINS) * Math.PI * 2 + 0.06;
    const a1 = -Math.PI / 2 + ((i + 1) / PINS) * Math.PI * 2 - 0.06;
    const unlocked = i < scene.pinsS - 0.3;
    const col = unlocked ? 0x39e06a : 0xff3b46;
    lockRing.arc(0, 0, R - 10, a0, a1).stroke({ width: 7, color: col, alpha: unlocked ? 0.95 : 0.6 });
    // shtift belgisi
    const am = (a0 + a1) / 2;
    lockRing.circle(Math.cos(am) * (R - 26), Math.sin(am) * (R - 26), 4).fill(unlocked ? 0x39e06a : 0xff3b46);
  }

  // ochilish
  if (ctl.openPulse && !scene.opened) {
    scene.opened = true;
    scene.tweens.add({ duration: 1.1, ease: Eases.outCubic, update: (k) => { vault.rotation = k * 0.9; vault.x = 500 + k * 150; goldGlow.alpha = k * 0.9; } });
    for (let n = 0; n < 60; n++) particles.burst(CX, CY, [0xffd700, 0xffe08a, 0xff9f1c][n % 3], 2, 240);
  }

  goldGlow.alpha += ((scene.opened ? 0.7 + 0.2 * Math.sin(t * 3) : 0) - goldGlow.alpha) * Math.min(dt * 2, 1);

  // lazerlar (ochilguncha)
  scene.laserA += ((scene.opened ? 0 : (ctl.connected ? 0.8 : 0.5)) - scene.laserA) * Math.min(dt * 3, 1);
  lasers.clear();
  if (scene.laserA > 0.02) {
    const beams = [[80, 150, 920, 380], [920, 180, 80, 420], [120, 430, 880, 120]];
    beams.forEach((b, i) => {
      const wob = Math.sin(t * 1.5 + i) * 6;
      lasers.moveTo(b[0], b[1] + wob).lineTo(b[2], b[3] - wob).stroke({ width: 2, color: 0xff2d40, alpha: scene.laserA * 0.5 });
    });
  }
}
