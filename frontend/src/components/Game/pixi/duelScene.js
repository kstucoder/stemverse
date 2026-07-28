// duelScene — VOLTRA "Neon Refleks Dueli" PixiJS olami.
// Ikki robot jangchi arenada yuzma-yuz. Markazdagi signal minorasi tasodifiy
// YASHIL bo'ladi → kim tezroq tugmasini bossa, uning roboti zarba beradi, raqib
// chayqaladi. 5 g'alaba → chempion. (2 tugma + LED + buzzer)
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000, LH = 560;
const GY = 432, P1X = 250, P2X = 750, SIGX = 500, SIGY = 150;
const STATE_COL = { waiting: 0x3a4658, ready: 0xffc21a, go: 0x21e065, result: 0x6a7488 };

function makeRobot(color, dir) {
  const c = new Container(); c.scale.x = dir;
  const glow = new Sprite(radialTexture(`rgba(${(color >> 16) & 255},${(color >> 8) & 255},${color & 255},0.5)`, 128)); glow.anchor.set(0.5); glow.width = glow.height = 150; glow.y = -60;
  const legL = new Graphics().roundRect(-4, 0, 9, 30, 3).fill(0x1a2130); legL.x = -10; legL.y = -30;
  const legR = new Graphics().roundRect(-4, 0, 9, 30, 3).fill(0x232c40); legR.x = 8; legR.y = -30;
  const torso = new Container(); torso.y = -30;
  torso.addChild(new Graphics().roundRect(-18, -52, 36, 54, 10).fill(0x232c3e).roundRect(-18, -52, 36, 54, 10).stroke({ width: 2, color: color }));
  torso.addChild(new Graphics().circle(0, -26, 8).fill(color).circle(0, -26, 4).fill(0xffffff));   // ko'krak yadrosi
  const head = new Graphics().roundRect(-13, -78, 26, 22, 7).fill(0x1c2434).roundRect(-11, -72, 22, 8, 3).fill(color); torso.addChild(head);
  const backArm = new Graphics().roundRect(-4, 0, 8, 26, 4).fill(0x1c2434); backArm.x = -16; backArm.y = -46; backArm.rotation = 0.3;
  const frontArm = new Graphics().roundRect(-4, 0, 9, 30, 4).fill(0x2a3550).roundRect(-4, 22, 11, 11, 4).fill(color); frontArm.x = 15; frontArm.y = -46; frontArm.rotation = 0.2;
  c.addChild(glow, legL, legR, backArm, torso, frontArm);
  return { c, torso, frontArm, backArm, glow, legL, legR, color, dir, react: 0 };
}

export function assembleDuel(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.42, bloomScale: 1.1, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#0a0016', '#16062a', '#0d0620', '#08040f'])); skyC.addChild(sky);
  const starC = new Container(); skyC.addChild(starC);
  const stars = [];
  for (let i = 0; i < 60; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.2).fill(0xeaf3ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random() * 0.4, b: 0.3 + Math.random() * 0.4, sp: 0.6 + Math.random() * 2, ph: Math.random() * 6.28 }); }

  const root = new Container(); app.stage.addChild(root);
  const sky1 = makeSkyline(120, 0x160a2e, 21); sky1.y = GY - 470; sky1.alpha = 0.5; root.addChild(sky1);

  // olomon
  const crowd = []; const crowdC = new Container(); root.addChild(crowdC);
  for (let i = 0; i < 26; i++) { const c = new Container(); c.x = 30 + i * 38; c.y = GY - 6; c.scale.set(0.7 + Math.random() * 0.3); c.addChild(new Graphics().moveTo(-10, 0).lineTo(-7, -26).quadraticCurveTo(0, -34, 7, -26).lineTo(10, 0).closePath().fill(0x080512)); c.addChild(new Graphics().circle(0, -34, 6).fill(0x080512)); const armL = new Graphics().roundRect(-1.5, 0, 3, -18, 1.5).fill(0x080512); armL.x = -6; armL.y = -26; const armR = new Graphics().roundRect(-1.5, 0, 3, -18, 1.5).fill(0x080512); armR.x = 6; armR.y = -26; c.addChild(armL, armR); crowdC.addChild(c); crowd.push({ c, armL, armR, ph: Math.random() * 6.28 }); }

  // arena maydoni
  const floor = new Graphics().rect(0, GY, LW, LH - GY).fill(0x0d0a1a).rect(0, GY, LW, 3).fill({ color: 0xff2d78, alpha: 0.35 });
  for (let x = 0; x < LW; x += 44) floor.rect(x, GY + 24, 22, 2).fill({ color: 0x9b5de5, alpha: 0.1 });
  root.addChild(floor);

  // spotlightlar
  const spots = [];
  for (let i = 0; i < 3; i++) { const s = new Sprite(radialTexture('rgba(255,255,255,0.12)', 256)); s.anchor.set(0.5, 0); s.width = 160; s.height = 340; s.x = 250 + i * 250; s.y = 30; root.addChild(s); spots.push({ s, ph: i * 1.3 }); }

  // signal minorasi
  const tower = new Container(); tower.x = SIGX; tower.y = SIGY; root.addChild(tower);
  tower.addChild(new Graphics().rect(-6, 0, 12, GY - SIGY).fill(0x141a28).rect(-6, 0, 4, GY - SIGY).fill({ color: 0x2a3446, alpha: 0.7 }));
  tower.addChild(new Graphics().roundRect(-34, -38, 68, 76, 16).fill(0x0c1220).roundRect(-34, -38, 68, 76, 16).stroke({ width: 2, color: 0x2a3446 }));
  const sigGlow = new Sprite(radialTexture('rgba(255,255,255,0.85)', 256)); sigGlow.anchor.set(0.5); sigGlow.width = sigGlow.height = 150; tower.addChild(sigGlow);
  const sigOrb = new Graphics().circle(0, 0, 26).fill(0xffffff); tower.addChild(sigOrb);
  const rays = new Graphics(); tower.addChild(rays);

  const particles = makeParticles(root);
  const bots = [makeRobot(0x00eeff, 1), makeRobot(0xff2d78, -1)];
  bots[0].c.x = P1X; bots[0].c.y = GY; bots[1].c.x = P2X; bots[1].c.y = GY;
  root.addChild(bots[0].c, bots[1].c);

  return { app, sky, starC, stars, root, crowd, spots, tower, sigGlow, sigOrb, rays, particles, bots, prevState: null, flash: 0, lastRound: 0 };
}

// ctl = { state, winner, p1, p2, connected, roundPulse }
export function duelTick(scene, dt, t, ctl) {
  const { app, sky, starC, stars, root, crowd, spots, sigGlow, sigOrb, rays, particles, bots } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  stars.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.4 + 0.5 * Math.sin(t * s.sp + s.ph)); });

  const state = ctl.connected ? (ctl.state || 'waiting') : 'waiting';
  const col = STATE_COL[state] || STATE_COL.waiting;

  // holat o'zgarishlari
  if (scene.prevState !== state) {
    if (state === 'go') { scene.flash = 0.5; for (let i = 0; i < 20; i++) particles.burst(SIGX, SIGY, 0x21e065, 2, 150); }
    scene.prevState = state;
  }
  // raund natijasi → g'olib zarbasi
  if (ctl.roundPulse !== scene.lastRound) {
    scene.lastRound = ctl.roundPulse;
    const win = ctl.winner;
    if (win === 1 || win === 2) {
      bots[win - 1].react = 1; bots[2 - win].react = -1;
      const wx = win === 1 ? P1X : P2X;
      particles.burst((P1X + P2X) / 2, GY - 60, win === 1 ? 0x00eeff : 0xff2d78, 26, 220);
      scene.flash = 0.4;
    }
  }

  // signal orb
  sigOrb.tint = col; sigGlow.tint = col;
  const pulse = state === 'go' ? (0.9 + 0.3 * Math.sin(t * 12)) : state === 'ready' ? (0.5 + 0.2 * Math.sin(t * 6)) : 0.25;
  sigGlow.alpha = pulse; sigOrb.scale.set(state === 'go' ? 1.2 + 0.15 * Math.sin(t * 12) : 1);
  rays.clear();
  if (state === 'go') { for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + t; rays.moveTo(Math.cos(a) * 30, Math.sin(a) * 30).lineTo(Math.cos(a) * 70, Math.sin(a) * 70).stroke({ width: 3, color: 0x21e065, alpha: 0.5 }); } }

  // robotlar (react: 1 zarba, -1 chayqalish, 0 idle) → sekin qaytadi
  bots.forEach((b, i) => {
    b.react += (0 - b.react) * Math.min(dt * 2.5, 1);
    const homeX = i === 0 ? P1X : P2X;
    const inward = b.dir; // markazga
    const tense = state === 'go' || state === 'ready' ? 1 : 0;
    // zarba: markazga intiladi + old qo'l urish; chayqalish: orqaga + egiladi
    b.c.x = homeX + b.react * 46 * inward;
    b.torso.rotation = (-b.react) * 0.28 * inward + Math.sin(t * 2 + i) * 0.02;
    b.frontArm.rotation = 0.2 - Math.max(0, b.react) * 1.5 + (tense ? -0.2 : 0);
    b.glow.alpha = 0.3 + Math.max(0, b.react) * 0.5 + (tense ? 0.15 : 0);
    // idle nafas
    b.c.y = GY + Math.sin(t * 2 + i * 2) * 1.5;
    if (b.react < -0.3) { if (Math.random() < 0.3) particles.burst(b.c.x, GY - 50, 0xffc21a, 1, 60); } // uchqun
  });

  // spotlightlar
  spots.forEach((sp) => { sp.s.rotation = Math.sin(t * 0.8 + sp.ph) * 0.3; sp.s.alpha = 0.1 + (state === 'go' ? 0.1 : 0); });

  // olomon — go/result da qo'l ko'taradi
  const hype = state === 'go' || state === 'result' ? 1 : 0.3;
  crowd.forEach((p) => { p.c.y = (GY - 6) + Math.sin(t * 3 + p.ph) * 2 * hype; p.armL.rotation = -hype * 0.5 + Math.sin(t * 5 + p.ph) * 0.2 * hype; p.armR.rotation = hype * 0.5 - Math.sin(t * 5 + p.ph) * 0.2 * hype; });

  // flash
  scene.flash = Math.max(0, scene.flash - dt * 1.8);
}
