// meteorDefenseScene — VOLTRA "Meteor Qalqoni" — 360° RADIAL MUDOFAA (joystik).
// Markazda baza. Meteorlar HAR TOMONDAN bazaga yopiriladi. Joystik zenit to'pini
// istalgan yo'nalishga buradi (to'liq 360°), tugma otadi. Meteor bazaga tegsa qalqon -1.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const CX = 500, CY = 272, CORE_R = 40, SHIELD_R = 66, SPAWN_R = 440, BARREL = 56, GOAL = 500;
const D2R = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

function makeMeteor(parent, tex, ang, spd) {
  const c = new Container();
  c.x = CX + Math.cos(ang) * SPAWN_R; c.y = CY + Math.sin(ang) * SPAWN_R;
  const trail = new Sprite(tex); trail.anchor.set(0.5); trail.width = 70; trail.height = 26; trail.tint = 0xff8a3a; trail.blendMode = 'add'; trail.rotation = ang; trail.x = Math.cos(ang) * 26; trail.y = Math.sin(ang) * 26; c.addChild(trail);
  const glow = new Sprite(tex); glow.anchor.set(0.5); glow.width = glow.height = 46; glow.tint = 0xffb060; glow.blendMode = 'add'; c.addChild(glow);
  const core = new Graphics(); const pts = []; for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28; const r = 9 + Math.random() * 4; pts.push(Math.cos(a) * r, Math.sin(a) * r); } core.poly(pts).fill(0x3a2a1e).stroke({ width: 1.5, color: 0xffcaa0, alpha: 0.9 }); c.addChild(core);
  parent.addChild(c);
  return { c, core, x: c.x, y: c.y, vx: -Math.cos(ang) * spd, vy: -Math.sin(ang) * spd, r: 15, dead: false };
}

export function assembleMeteorDefense(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.44, bloomScale: 1.12, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#03040c', '#070a18', '#0a0e1e', '#060810'])); skyC.addChild(sky);
  const starC = new Container(); skyC.addChild(starC); const stars = [];
  for (let i = 0; i < 110; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.3).fill(0xcfe0ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random(), b: 0.3 + Math.random() * 0.5, sp: 0.5 + Math.random() * 2, ph: Math.random() * 6.28 }); }

  const root = new Container(); app.stage.addChild(root);

  const meteorC = new Container(); root.addChild(meteorC);
  const boltC = new Container(); root.addChild(boltC);
  const dome = new Graphics(); root.addChild(dome);

  // markaziy baza
  const baseGlow = new Sprite(radialTexture('rgba(57,255,208,0.5)', 512)); baseGlow.anchor.set(0.5); baseGlow.width = baseGlow.height = 260; baseGlow.x = CX; baseGlow.y = CY; baseGlow.blendMode = 'add'; baseGlow.alpha = 0.25; root.addChild(baseGlow);
  const baseG = new Graphics();
  baseG.circle(CX, CY, CORE_R).fill(0x122232).stroke({ width: 3, color: 0x3a6a8a });
  for (let a = 0; a < 360; a += 45) baseG.moveTo(CX + Math.cos(a * D2R) * CORE_R, CY + Math.sin(a * D2R) * CORE_R).lineTo(CX + Math.cos(a * D2R) * (CORE_R + 8), CY + Math.sin(a * D2R) * (CORE_R + 8)).stroke({ width: 3, color: 0x2a4a5e });
  baseG.circle(CX, CY, 16).fill(0x1a3a4a).stroke({ width: 2, color: 0x39ffd0, alpha: 0.6 });
  root.addChild(baseG);

  // aylanuvchi zenit to'pi (markazda, istalgan yo'nalishga)
  const turret = new Container(); turret.x = CX; turret.y = CY; root.addChild(turret);
  const bg = new Graphics();
  bg.roundRect(6, -8, BARREL, 16, 5).fill(0x2a3e52).stroke({ width: 1.5, color: 0x5a86b0 });
  bg.roundRect(BARREL, -10, 10, 20, 3).fill(0x3a5e82);
  turret.addChild(bg);
  const muzzle = new Sprite(radialTexture('rgba(120,255,220,0.9)', 128)); muzzle.anchor.set(0.5); muzzle.width = muzzle.height = 30; muzzle.x = BARREL + 8; muzzle.blendMode = 'add'; muzzle.alpha = 0; turret.addChild(muzzle);

  const particles = makeParticles(root);
  const mtex = radialTexture('rgba(255,255,255,0.9)', 128);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xff4a3a); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  return {
    app, sky, starC, stars, root, meteorC, boltC, dome, baseGlow, turret, muzzle, mtex, particles, flash,
    meteors: [], bolts: [], shield: 5, progress: 0, won: false, lost: false,
    aim: 0, spawnT: 1.2, fireCd: 0, lastBtn: 0, elapsed: 0, lastReset: 0, hitFlash: 0,
    spawnMeteor(ang, spd) { this.meteors.push(makeMeteor(this.meteorC, this.mtex, ang, spd)); },
    reset() { this.meteors.forEach(m => m.c.destroy()); this.meteors.length = 0; this.bolts.forEach(b => b.g.destroy()); this.bolts.length = 0; this.shield = 5; this.progress = 0; this.won = false; this.lost = false; this.spawnT = 1.2; this.elapsed = 0; },
  };
}

// ctl = { aimAngle (deg, 0=o'ng, to'liq 360), btn, connected, mode, resetPulse, onFire, onDestroy, onHit, onWin, onLose }
export function meteorTick(scene, dt, t, ctl) {
  const { app, sky, starC, stars, root, boltC, dome, baseGlow, turret, muzzle, mtex, meteors, bolts, particles, flash } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  flash.width = w; flash.height = h;
  stars.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.4 + 0.5 * Math.sin(t * s.sp + s.ph)); });

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // nishon: joystik burchagi (to'liq 360°) yoki idle aylanish
  let aimT = ctl.connected ? (ctl.aimAngle ?? 0) : (t * 40) % 360;
  // eng qisqa yo'l bilan silliq burilish
  let da = ((aimT - scene.aim + 540) % 360) - 180;
  scene.aim += da * Math.min(dt * 12, 1);
  turret.rotation = scene.aim * D2R;
  muzzle.alpha = Math.max(0, muzzle.alpha - dt * 4);

  const playing = ctl.mode !== 'intro' && ctl.connected && !scene.won && !scene.lost;

  // otish
  scene.fireCd -= dt;
  const btn = ctl.connected || ctl.mode === 'intro' ? (ctl.btn ? 1 : 0) : 0;
  if (btn && !scene.lastBtn && scene.fireCd <= 0 && !scene.won && !scene.lost) {
    scene.fireCd = 0.2; muzzle.alpha = 1;
    const a = scene.aim * D2R;
    const g = new Graphics().roundRect(-9, -2.5, 18, 5, 2).fill(0xa8fff0).stroke({ width: 1, color: 0x39ffd0 });
    g.x = CX + Math.cos(a) * (BARREL + 12); g.y = CY + Math.sin(a) * (BARREL + 12); g.rotation = a;
    boltC.addChild(g);
    bolts.push({ g, x: g.x, y: g.y, vx: Math.cos(a) * 720, vy: Math.sin(a) * 720, dead: false });
    if (ctl.onFire) ctl.onFire();
  }
  scene.lastBtn = btn;

  // spawn (har tomondan)
  if (playing) {
    scene.elapsed += dt;
    const diff = clamp(scene.progress / GOAL, 0, 1);
    scene.spawnT -= dt;
    if (scene.spawnT <= 0) { scene.spawnT = lerp(1.9, 1.0, diff) * (0.85 + Math.random() * 0.4); scene.spawnMeteor(Math.random() * Math.PI * 2, lerp(52, 110, diff)); }
  }

  // boltlar
  for (let i = bolts.length - 1; i >= 0; i--) {
    const b = bolts[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.g.x = b.x; b.g.y = b.y;
    if (Math.hypot(b.x - CX, b.y - CY) > 540) { b.g.destroy(); bolts.splice(i, 1); }
  }

  // meteorlar + to'qnashuv
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i]; if (m.dead) continue;
    m.x += m.vx * dt; m.y += m.vy * dt; m.c.x = m.x; m.c.y = m.y; m.core.rotation += dt * 3;
    for (let j = bolts.length - 1; j >= 0; j--) {
      const b = bolts[j]; if (Math.hypot(b.x - m.x, b.y - m.y) < m.r + 14) {
        m.dead = true; b.g.destroy(); bolts.splice(j, 1);
        particles.burst(m.x, m.y, 0xffb040, 16, 170); particles.burst(m.x, m.y, 0x39ffd0, 8, 120);
        scene.progress = Math.min(GOAL, scene.progress + 20);
        if (ctl.onDestroy) ctl.onDestroy(scene.progress);
        if (scene.progress >= GOAL && !scene.won && ctl.mode !== 'intro') { scene.won = true; if (ctl.onWin) ctl.onWin(); }
        break;
      }
    }
    if (m.dead) { m.c.destroy(); meteors.splice(i, 1); continue; }
    if (Math.hypot(m.x - CX, m.y - CY) < SHIELD_R) {
      m.dead = true; m.c.destroy(); meteors.splice(i, 1);
      particles.burst(m.x, m.y, 0xff5a2a, 22, 200); scene.hitFlash = 0.6;
      if (ctl.mode !== 'intro') { scene.shield = Math.max(0, scene.shield - 1); if (ctl.onHit) ctl.onHit(scene.shield); if (scene.shield <= 0 && !scene.lost) { scene.lost = true; if (ctl.onLose) ctl.onLose(); } }
    }
  }

  // qalqon gumbazi (aylana)
  dome.clear();
  const sN = clamp(scene.shield / 5, 0, 1);
  dome.circle(CX, CY, SHIELD_R).stroke({ width: 2.5, color: scene.hitFlash > 0.1 ? 0xff5a4a : 0x39ffd0, alpha: 0.15 + sN * 0.35 + scene.hitFlash * 0.4 });
  baseGlow.alpha = 0.2 + sN * 0.2 + scene.hitFlash * 0.3;
  scene.hitFlash = Math.max(0, scene.hitFlash - dt * 1.6);
  flash.alpha = Math.max(0, (flash.alpha || 0) - dt * 2); if (scene.hitFlash > 0.5) flash.alpha = 0.22;

  particles.tick(dt);
}
