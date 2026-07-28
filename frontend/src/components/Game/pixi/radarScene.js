// radarScene — VOLTRA "Osmon Qalqoni" PixiJS olami.
// Asteroid zarbasidan keyin shaharga meteorit bo'laklari yaqinlashmoqda.
// Ultrasonik sensor (DIST 0-400sm) = radar masofa kursori. Kursor halqasini
// nishon masofasiga moslab, aylanuvchi sweep o'sha burchakdan o'tganda nishon
// QULFLANADI. 5 nishon → shahar himoyalandi. 4 LED = yaqinlik, buzzer beep.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';
import { playBlip } from '../gameAudio';

export const LW = 1000, LH = 560;
const SCX = 500, SCY = 292, R = 196;
const TARGN = 5, TOL = 24;

function makeTargets() {
  const arr = [];
  for (let i = 0; i < TARGN; i++) arr.push({ ang: (i / TARGN) * Math.PI * 2 + Math.random() * 0.8, dist: 70 + Math.random() * 250, found: false, sz: 8 + Math.random() * 4 });
  return arr;
}

export function assembleRadar(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.42, bloomScale: 1.1, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#020a0c', '#04181a', '#03120f', '#01080a'])); skyC.addChild(sky);
  const starC = new Container(); skyC.addChild(starC);
  const stars = [];
  for (let i = 0; i < 70; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.2).fill(0xbfeee0); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random() * 0.4, b: 0.3 + Math.random() * 0.4, sp: 0.6 + Math.random() * 2, ph: Math.random() * 6.28 }); }

  const root = new Container(); app.stage.addChild(root);

  // uzoq shahar (himoya qilinayotgan)
  const sky1 = makeSkyline(90, 0x0a1f1e, 21); sky1.y = 470 - 470 + 60; sky1.alpha = 0.4; root.addChild(sky1);

  // yaqinlashuvchi meteorlar (fon tahdidi)
  const meteorC = new Container(); root.addChild(meteorC);
  const meteors = [];
  for (let i = 0; i < TARGN; i++) { const c = new Container(); const g = new Sprite(radialTexture('rgba(255,150,80,0.9)', 128)); g.anchor.set(0.5); g.width = g.height = 40; const core = new Graphics().circle(0, 0, 4).fill(0xffe0b0); c.addChild(g, core); c.x = 120 + i * 170; c.y = 40 + Math.random() * 60; meteorC.addChild(c); meteors.push({ c, g, vx: -6 - Math.random() * 6, vy: 4 + Math.random() * 3, dead: false }); }

  // radar konsoli
  const scope = new Container(); scope.x = SCX; scope.y = SCY; root.addChild(scope);
  // bezel
  scope.addChild(new Graphics().circle(0, 0, R + 22).fill(0x0c1614).circle(0, 0, R + 22).stroke({ width: 6, color: 0x1c3630 }));
  scope.addChild(new Graphics().circle(0, 0, R + 8).fill(0x061210).circle(0, 0, R).fill(0x03100c).circle(0, 0, R).stroke({ width: 2, color: 0x1f4a40 }));
  // rings + spokes (static)
  const grid = new Graphics();
  for (let i = 1; i <= 4; i++) grid.circle(0, 0, R * (i / 4)).stroke({ width: 1, color: 0x1f6a58, alpha: 0.4 });
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; grid.moveTo(0, 0).lineTo(Math.cos(a) * R, Math.sin(a) * R).stroke({ width: 1, color: 0x1f6a58, alpha: 0.18 }); }
  scope.addChild(grid);

  const sweep = new Graphics(); scope.addChild(sweep);
  const cursor = new Graphics(); scope.addChild(cursor);
  const blips = new Graphics(); scope.addChild(blips);
  scope.addChild(new Graphics().circle(0, 0, 5).fill(0x39ffd0));  // markaz

  const particles = makeParticles(root);

  // 4 yaqinlik LED (konsol pasti)
  const leds = [];
  const ledC = new Container(); ledC.x = SCX; ledC.y = SCY + R + 44; root.addChild(ledC);
  for (let i = 0; i < 4; i++) { const g = new Graphics().circle(-60 + i * 40, 0, 9).fill(0x0a1a18).circle(-60 + i * 40, 0, 9).stroke({ width: 1.5, color: 0x1f4a40 }); ledC.addChild(g); leds.push({ g, x: -60 + i * 40 }); }

  return { app, sky, starC, stars, root, meteors, scope, sweep, cursor, blips, leds, particles, targets: makeTargets(), sweepAng: 0, found: 0, won: false, lastReset: 0, beepAcc: 0 };
}

// ctl = { dist, connected, resetPulse, onDetect, onWin }
export function radarTick(scene, dt, t, ctl) {
  const { app, sky, starC, stars, root, meteors, sweep, cursor, blips, leds, targets, particles } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  stars.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.4 + 0.5 * Math.sin(t * s.sp + s.ph)); });

  if (ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.targets = makeTargets(); scene.found = 0; scene.won = false; meteors.forEach((m, i) => { m.dead = false; m.c.alpha = 1; m.c.x = 120 + i * 170; m.c.y = 40; }); }

  const dist = ctl.connected ? Math.max(0, Math.min(400, ctl.dist ?? 200)) : 200;
  const distN = dist / 400;
  const cr = distN * R;                    // kursor radiusi

  // sweep aylanadi
  scene.sweepAng = (scene.sweepAng + dt * 1.15) % (Math.PI * 2);
  const ang = scene.sweepAng;

  // afterglow trail
  sweep.clear();
  const N = 18, span = 0.75;
  for (let i = 0; i < N; i++) { const a0 = ang - (i / N) * span, a1 = ang - ((i + 1) / N) * span; sweep.moveTo(0, 0).arc(0, 0, R, a1, a0).lineTo(0, 0).fill({ color: 0x39ffd0, alpha: (1 - i / N) * 0.10 }); }
  sweep.moveTo(0, 0).lineTo(Math.cos(ang) * R, Math.sin(ang) * R).stroke({ width: 2, color: 0x6affe0, alpha: 0.85 });

  // kursor halqa (joriy masofa)
  cursor.clear();
  cursor.circle(0, 0, cr).stroke({ width: 2, color: 0xffd23f, alpha: 0.5 + 0.3 * Math.sin(t * 5) });
  cursor.circle(Math.cos(ang) * cr, Math.sin(ang) * cr, 5).fill(0xffd23f);

  // nishonlar + detektsiya
  const targs = scene.targets;
  blips.clear();
  targs.forEach((tg) => {
    const rr = (tg.dist / 400) * R;
    const bx = Math.cos(tg.ang) * rr, by = Math.sin(tg.ang) * rr;
    const aligned = Math.abs(dist - tg.dist) < TOL;
    if (!tg.found) {
      let dA = Math.abs(ang - tg.ang) % (Math.PI * 2); if (dA > Math.PI) dA = Math.PI * 2 - dA;
      if (dA < 0.07 && aligned && ctl.connected) {
        tg.found = true; scene.found++;
        particles.burst(bx, by, 0x39e06a, 22, 170);
        const m = meteors[scene.found - 1]; if (m) { m.dead = true; particles.burst(0, 0, 0xff9f3a, 10, 120); }
        if (ctl.onDetect) ctl.onDetect(scene.found);
        if (scene.found >= TARGN && !scene.won) { scene.won = true; if (ctl.onWin) ctl.onWin(); }
      }
      const col = aligned ? 0xffd23f : 0xffffff;
      blips.circle(bx, by, tg.sz + 2 * Math.sin(t * 3 + tg.ang)).stroke({ width: 1.5, color: col, alpha: aligned ? 0.9 : 0.4 + 0.3 * Math.sin(t * 2 + tg.ang) });
      blips.moveTo(bx - 4, by).lineTo(bx + 4, by).moveTo(bx, by - 4).lineTo(bx, by + 4).stroke({ width: 1, color: col, alpha: 0.5 });
    } else {
      blips.circle(bx, by, tg.sz).fill({ color: 0x39e06a, alpha: 0.9 });
      blips.rect(bx - tg.sz - 3, by - tg.sz - 3, (tg.sz + 3) * 2, (tg.sz + 3) * 2).stroke({ width: 1.5, color: 0x39e06a, alpha: 0.8 });
    }
  });

  // yaqinlik LED (yaqin = ko'proq LED + qizil)
  const lvl = Math.round((1 - distN) * 4);
  leds.forEach((l, i) => { const on = i < lvl; l.g.clear(); const col = lvl >= 4 ? 0xff3b46 : lvl === 3 ? 0xffc21a : 0x39e06a; l.g.circle(l.x, 0, 9).fill(on ? col : 0x0a1a18).circle(l.x, 0, 9).stroke({ width: 1.5, color: on ? col : 0x1f4a40 }); });

  // beep (yaqin = tez)
  if (ctl.connected) { scene.beepAcc += dt; const iv = 0.12 + distN * 0.9; if (scene.beepAcc > iv) { scene.beepAcc = 0; playBlip(1100 + (1 - distN) * 700); } }

  // meteorlar (fon)
  meteors.forEach((m) => {
    if (m.dead) { m.c.alpha = Math.max(0, m.c.alpha - dt * 1.5); return; }
    m.c.x += m.vx * dt * 6; m.c.y += m.vy * dt * 6;
    if (m.c.x < -40 || m.c.y > 260) { m.c.x = LW + 40; m.c.y = 20 + Math.random() * 40; }
    m.g.alpha = 0.7 + 0.3 * Math.sin(t * 4 + m.c.x);
  });
}
