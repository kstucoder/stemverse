// descentScene — VOLTRA "Chuqurlik Missiyasi" PixiJS olami.
// Asteroid bilan Yerga tushgan XAVFLI MODDA yer qa'riga kirib ketgan. Qahramon
// himoya kostyumida yer ostiga tushadi. 1-tugma → SAKRASH (to'siq ustidan),
// 2-tugma → EMAKLASH (past joydan), IKKALA tugma → moddani MAXSUS IDISHGA solish.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const GY = 430, HX = 250, STAND_H = 84, CRAWL_H = 40;
const JUMP = 560, GRAV = 1750, SPEED = 250, GOAL = 100;

function makeHero() {
  const c = new Container();
  const legB = new Graphics().roundRect(-4, 0, 9, 24, 3).fill(0x1a2130); legB.y = -6; legB.x = -3;
  const legF = new Graphics().roundRect(-4, 0, 9, 24, 3).fill(0x232c40); legF.y = -6; legF.x = 5;
  const boots = new Graphics().roundRect(-9, -8, 16, 8, 3).fill(0x0a0d14).roundRect(3, -8, 16, 8, 3).fill(0x0a0d14);
  const torso = new Graphics().roundRect(-13, -50, 26, 42, 8).fill(0xffb020).roundRect(-13, -50, 26, 42, 8).stroke({ width: 2, color: 0xffd76a }); // kostyum
  const stripe = new Graphics().rect(-13, -34, 26, 5).fill(0x1a2130).rect(-13, -22, 26, 5).fill(0x1a2130); // ogohlantirish chizig'i
  const pack = new Graphics().roundRect(-22, -46, 12, 30, 4).fill(0x2a3446).roundRect(-22, -46, 12, 8, 3).fill(0x39e06a); // ryukzak (kislorod)
  const arm = new Graphics().roundRect(-3, 0, 8, 22, 3).fill(0xffb020); arm.x = 11; arm.y = -44; arm.rotation = -0.2;
  const helmet = new Graphics().circle(0, -60, 13).fill(0x2a3446).circle(0, -60, 13).stroke({ width: 2, color: 0x59617e });
  const visor = new Graphics().arc(0, -60, 9, -Math.PI * 0.9, Math.PI * 0.1).fill(0x8ff4ff); visor.alpha = 0.9;
  const lamp = new Graphics().circle(11, -64, 3).fill(0xffffff);
  const beam = new Sprite(radialTexture('rgba(255,244,200,0.35)', 256)); beam.anchor.set(0, 0.5); beam.width = 220; beam.height = 130; beam.x = 12; beam.y = -60;
  c.addChild(beam, pack, boots, legB, legF, torso, stripe, arm, helmet, visor, lamp);
  return { c, legB, legF, arm, torso, helmet, visor, beam, tint: torso };
}

export function assembleDescent(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.0, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const bg = new Sprite(gradTexture(['#0a0806', '#140d0a', '#0d0908', '#060403'])); skyC.addChild(bg);

  const root = new Container(); app.stage.addChild(root);

  // qatlamli tuproq/tosh (chuqurlik bilan rang o'zgaradi)
  const strataC = new Container(); root.addChild(strataC);
  const strata = [];
  for (let k = 0; k < 2; k++) { const g = new Graphics(); for (let i = 0; i < 60; i++) { g.circle(Math.random() * LW, Math.random() * LH, 2 + Math.random() * 4).fill({ color: 0x2a1e14, alpha: 0.5 }); } g.x = k * LW; strataC.addChild(g); strata.push(g); }

  // shift (ceiling) + pol
  const ceil = new Graphics().rect(0, 0, LW, 70).fill(0x120c08); for (let x = 0; x < LW; x += 60) ceil.moveTo(x, 70).lineTo(x + 18, 96).lineTo(x + 36, 70).fill(0x0d0906); root.addChild(ceil);
  const groundC = new Container(); root.addChild(groundC);
  const groundSegs = [];
  for (let k = 0; k < 2; k++) { const g = new Graphics().rect(0, GY, LW, LH - GY).fill(0x1a1109).rect(0, GY, LW, 4).fill({ color: 0xffb020, alpha: 0.25 }); for (let x = 0; x < LW; x += 40) g.rect(x, GY + 20, 20, 2).fill({ color: 0x3a2a18, alpha: 0.6 }); g.x = k * LW; groundC.addChild(g); groundSegs.push(g); }

  const obstaclesG = new Graphics(); root.addChild(obstaclesG);

  // xavfli modda kamerasi (oxirida) — idish + modda
  const chamber = new Container(); chamber.alpha = 0; root.addChild(chamber);
  const hazGlow = new Sprite(radialTexture('rgba(120,255,90,0.85)', 256)); hazGlow.anchor.set(0.5); hazGlow.width = hazGlow.height = 220; hazGlow.x = 690; hazGlow.y = GY - 120; chamber.addChild(hazGlow);
  const hazard = new Graphics().poly([0, -20, 16, -4, 10, 18, -10, 18, -16, -4]).fill(0x7dff5a).poly([0, -20, 16, -4, 0, 2]).fill({ color: 0xd0ffb0, alpha: 0.6 }); hazard.x = 690; hazard.y = GY - 120; chamber.addChild(hazard);
  const canister = new Container(); canister.x = 690; canister.y = GY; chamber.addChild(canister);
  canister.addChild(new Graphics().roundRect(-26, -60, 52, 60, 12).fill(0x1c2636).roundRect(-26, -60, 52, 60, 12).stroke({ width: 3, color: 0x39e06a }));
  canister.addChild(new Graphics().roundRect(-20, -54, 40, 48, 8).fill(0x0a1420));
  const canFill = new Graphics(); canister.addChild(canFill);
  canister.addChild(new Graphics().roundRect(-30, -70, 60, 14, 6).fill(0x2a3446)); // qopqoq

  const particles = makeParticles(root);
  const hero = makeHero(); hero.c.x = HX; hero.c.y = GY; root.addChild(hero.c);

  // tuman/chang
  const dust = []; const dustC = new Container(); root.addChild(dustC);
  for (let i = 0; i < 26; i++) { const g = new Graphics().circle(0, 0, 1 + Math.random()).fill(0xffd0a0); g.x = Math.random() * LW; g.y = Math.random() * LH; g.alpha = 0.12; dustC.addChild(g); dust.push({ g, sp: 5 + Math.random() * 10, ph: Math.random() * 6.28 }); }

  return {
    app, bg, root, strata, groundSegs, ceil, obstaclesG, chamber, hazard, hazGlow, canister, canFill, particles, hero, dust,
    heroY: 0, vy: 0, grounded: true, crawlT: 0, depth: 0, phase: 'run', sealed: 0,
    obstacles: [], spawnAcc: 0, scroll: 0, hitFlash: 0, runCycle: 0, distAcc: 0,
    lastJump: 0, lastCrawl: 0, lastDeposit: 0, lastReset: 0, reached: false,
  };
}

function reset(s) {
  s.heroY = 0; s.vy = 0; s.grounded = true; s.crawlT = 0; s.depth = 0; s.phase = 'run'; s.sealed = 0;
  s.obstacles = []; s.spawnAcc = 0; s.hitFlash = 0; s.reached = false; s.chamber.alpha = 0;
}

// ctl = { jumpPulse, crawlPulse, depositPulse, resetPulse, connected, onDepth, onHit, onChamber, onWin }
export function descentTick(scene, dt, t, ctl) {
  const s = scene;
  const { app, bg, root, strata, groundSegs, obstaclesG, chamber, hazard, hazGlow, canFill, particles, hero, dust } = s;
  const w = app.screen.width, h = app.screen.height;
  bg.width = w; bg.height = h;
  const scl = Math.min(w / LW, h / LH);
  root.scale.set(scl); root.x = (w - LW * scl) / 2; root.y = (h - LH * scl) / 2;

  if (ctl.resetPulse !== s.lastReset) { s.lastReset = ctl.resetPulse; reset(s); }

  const conn = ctl.connected;
  const running = s.phase === 'run' && conn;
  const scroll = running ? SPEED * dt : 0;
  s.scroll += scroll;

  // parallaks
  strata.forEach((g, i) => { g.x = i * LW - ((s.scroll * 0.4) % LW); });
  const gd = -((s.scroll) % LW); groundSegs[0].x = gd; groundSegs[1].x = gd + LW;

  if (s.phase === 'run' && conn) {
    s.depth = Math.min(GOAL, s.depth + scroll * 0.021);
    s.distAcc += dt; if (s.distAcc > 0.1) { s.distAcc = 0; if (ctl.onDepth) ctl.onDepth(s.depth); }
    if (s.depth >= GOAL && !s.reached) { s.reached = true; s.phase = 'chamber'; s.obstacles = []; if (ctl.onChamber) ctl.onChamber(); }

    // sakrash
    if (ctl.jumpPulse !== s.lastJump) { s.lastJump = ctl.jumpPulse; if (s.grounded) { s.vy = JUMP; s.grounded = false; } }
    if (!s.grounded) { s.vy -= GRAV * dt; s.heroY += s.vy * dt; if (s.heroY <= 0) { s.heroY = 0; s.vy = 0; s.grounded = true; } }
    // emaklash
    if (ctl.crawlPulse !== s.lastCrawl) { s.lastCrawl = ctl.crawlPulse; if (s.grounded) s.crawlT = 0.55; }
    if (s.crawlT > 0) s.crawlT -= dt;
    const crawling = s.crawlT > 0;
    const heroH = crawling ? CRAWL_H : STAND_H;

    // spawn (jump/crawl navbatlashadi)
    s.spawnAcc += scroll;
    if (s.spawnAcc > 300 + Math.random() * 130) { s.spawnAcc = 0; const jump = Math.random() < 0.5; s.obstacles.push({ x: LW + 40, type: jump ? 'jump' : 'crawl', hit: false }); }
    // harakat + to'qnashuv
    s.obstacles.forEach((o) => { o.x -= scroll; });
    s.obstacles = s.obstacles.filter((o) => o.x > -60);
    for (const o of s.obstacles) {
      if (o.hit) continue;
      if (Math.abs(o.x - HX) < 22) {
        if (o.type === 'jump' && s.heroY < 42) { o.hit = true; if (ctl.onHit) ctl.onHit(); s.hitFlash = 0.4; particles.burst(HX, GY - 20, 0xff5a3c, 12, 140); }
        else if (o.type === 'crawl' && heroH > 52) { o.hit = true; if (ctl.onHit) ctl.onHit(); s.hitFlash = 0.4; particles.burst(HX, GY - 60, 0xff5a3c, 12, 140); }
      }
    }
  } else if (s.phase === 'chamber') {
    // idish ko'rinadi, qahramon to'xtaydi
    chamber.alpha += (1 - chamber.alpha) * Math.min(dt * 2, 1);
    // deposit: ikkala tugma birga
    if (ctl.depositPulse !== s.lastDeposit) {
      s.lastDeposit = ctl.depositPulse;
      if (s.sealed < 1) { s.sealed = 1; particles.burst(690, GY - 60, 0x7dff5a, 40, 200); if (ctl.onWin) ctl.onWin(); s.phase = 'won'; }
    }
  }

  // ---- hero render ----
  hero.c.y = GY - s.heroY;
  const crawling = s.crawlT > 0;
  hero.c.scale.y = crawling ? 0.52 : 1;
  hero.c.rotation = crawling ? 0.12 : 0;
  if (s.grounded && running && !crawling) { s.runCycle += dt * 11; const sw = Math.sin(s.runCycle); hero.legF.rotation = sw * 0.7; hero.legB.rotation = -sw * 0.7; hero.arm.rotation = -0.2 - sw * 0.5; }
  else if (crawling) { hero.legF.rotation = 0.8; hero.legB.rotation = 0.5; hero.arm.rotation = 0.6; }
  else { hero.legF.rotation = 0.4; hero.legB.rotation = -0.2; hero.arm.rotation = -0.5; }
  hero.visor.tint = s.hitFlash > 0 ? 0xff5a3c : 0x8ff4ff;
  hero.torso.tint = s.hitFlash > 0 ? 0xff7a5a : 0xffffff;
  s.hitFlash = Math.max(0, s.hitFlash - dt * 2);

  // ---- to'siqlar (tom osti / yer to'sig'i) ----
  obstaclesG.clear();
  s.obstacles.forEach((o) => {
    if (o.type === 'jump') { // yerdagi o'tkir tosh
      obstaclesG.moveTo(o.x - 16, GY).lineTo(o.x - 6, GY - 40).lineTo(o.x + 2, GY).lineTo(o.x + 8, GY - 30).lineTo(o.x + 18, GY).fill(0x3a2a1a).stroke({ width: 2, color: 0xff9f3a });
    } else { // shiftdan osilgan tosh (emaklab o'tiladi)
      const gapH = 46;
      obstaclesG.moveTo(o.x - 20, GY - gapH).lineTo(o.x, GY - gapH - 40).lineTo(o.x + 20, GY - gapH).lineTo(o.x + 10, GY - gapH).lineTo(o.x, GY - gapH - 16).lineTo(o.x - 10, GY - gapH).closePath().fill(0x2a2016).stroke({ width: 2, color: 0x8ff4ff });
      obstaclesG.rect(o.x - 22, GY - gapH - 4, 44, 4).fill({ color: 0x8ff4ff, alpha: 0.5 });
    }
  });

  // ---- xavfli modda kamerasi ----
  hazard.rotation = Math.sin(t * 2) * 0.15; hazard.scale.set(1 + 0.08 * Math.sin(t * 4)); hazard.tint = s.sealed ? 0x2a3446 : 0xffffff;
  hazGlow.alpha = s.sealed ? 0 : 0.4 + 0.2 * Math.sin(t * 3);
  if (s.phase === 'chamber' && !s.sealed && Math.random() < 0.1) particles.burst(690, GY - 120, 0x7dff5a, 1, 40);
  canFill.clear(); if (s.sealed) canFill.roundRect(-20, -50, 40, 44, 6).fill({ color: 0x7dff5a, alpha: 0.5 });

  // chang
  dust.forEach((d) => { d.g.y -= d.sp * dt * 0.4; d.g.x -= scroll * 0.3; if (d.g.y < 0 || d.g.x < 0) { d.g.y = LH; d.g.x = Math.random() * LW; } });
}
