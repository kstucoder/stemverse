// meteorDefenseScene — VOLTRA "Meteor Qalqoni" olami (asteroid sagasi yakuni).
// POT = zenit to'pini nishonlaydi, TUGMA = energiya zaryadini otadi. Yuqoridan
// tushayotgan meteorlarni bazaga yetmasdan yo'q qil. Meteor bazaga tegsa qalqon -1.
// Yetarli meteor yo'q qilinsa (progress) -> baza saqlanadi. Qalqon 0 -> mag'lub.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000, LH = 560;
const TX = 500, TY = 486, BASE_Y = 496, GOAL = 500;
const D2R = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

function makeMeteor(parent, tex, x, spd) {
  const c = new Container(); c.x = x; c.y = -30;
  const trail = new Sprite(tex); trail.anchor.set(0.5); trail.width = 30; trail.height = 70; trail.tint = 0xff8a3a; trail.blendMode = 'add'; trail.y = -30; c.addChild(trail);
  const glow = new Sprite(tex); glow.anchor.set(0.5); glow.width = glow.height = 46; glow.tint = 0xffb060; glow.blendMode = 'add'; c.addChild(glow);
  const core = new Graphics(); const pts = []; for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28; const r = 9 + Math.random() * 4; pts.push(Math.cos(a) * r, Math.sin(a) * r); } core.poly(pts).fill(0x3a2a1e).stroke({ width: 1.5, color: 0xffcaa0, alpha: 0.9 }); c.addChild(core);
  parent.addChild(c);
  // meteorlar bazaga (markaz) qarab biroz yaqinlashadi -> markazdagi to'p uchun adolatli
  return { c, core, x, y: -30, vx: (TX - x) * 0.12 + (Math.random() - 0.5) * 24, vy: spd, r: 16, dead: false };
}

export function assembleMeteorDefense(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.44, bloomScale: 1.12, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#03040c', '#070a18', '#0a0e1e', '#060810'])); skyC.addChild(sky);
  const starC = new Container(); skyC.addChild(starC); const stars = [];
  for (let i = 0; i < 100; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.3).fill(0xcfe0ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random() * 0.8, b: 0.3 + Math.random() * 0.5, sp: 0.5 + Math.random() * 2, ph: Math.random() * 6.28 }); }

  const root = new Container(); app.stage.addChild(root);

  // himoya qilinayotgan shahar/baza
  const city = makeSkyline(90, 0x0f1a2e, 21); city.alpha = 0.7; root.addChild(city);
  const ground = new Graphics().rect(0, BASE_Y, LW, LH - BASE_Y).fill(0x0a1018).rect(0, BASE_Y, LW, 3).fill(0x1f3a5a); root.addChild(ground);

  const meteorC = new Container(); root.addChild(meteorC);
  const boltC = new Container(); root.addChild(boltC);
  const particles = makeParticles(root);

  // qalqon gumbazi (baza ustida)
  const dome = new Graphics(); root.addChild(dome);

  // zenit to'pi (turret)
  const turret = new Container(); turret.x = TX; turret.y = TY; root.addChild(turret);
  const base = new Graphics();
  base.roundRect(-30, 6, 60, 34, 8).fill(0x1a2634).stroke({ width: 2, color: 0x3a5a7a });
  base.circle(0, 6, 16).fill(0x223244).stroke({ width: 2, color: 0x4a6a8a });
  turret.addChild(base);
  const barrel = new Container(); turret.addChild(barrel);
  const bg = new Graphics();
  bg.roundRect(-6, -52, 12, 56, 4).fill(0x2a3e52).stroke({ width: 1.5, color: 0x5a86b0 });
  bg.roundRect(-8, -56, 16, 8, 3).fill(0x3a5e82);
  bg.moveTo(0, -56).lineTo(0, -64).stroke({ width: 2, color: 0x39ffd0, alpha: 0.6 });
  barrel.addChild(bg);
  const muzzle = new Sprite(radialTexture('rgba(120,255,220,0.9)', 128)); muzzle.anchor.set(0.5); muzzle.width = muzzle.height = 30; muzzle.y = -58; muzzle.blendMode = 'add'; muzzle.alpha = 0; barrel.addChild(muzzle);

  const mtex = radialTexture('rgba(255,255,255,0.9)', 128);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xff4a3a); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  return {
    app, sky, starC, stars, root, meteorC, boltC, particles, dome, turret, barrel, muzzle, mtex, flash,
    meteors: [], bolts: [], shield: 5, progress: 0, won: false, lost: false,
    aim: 0, spawnT: 1.2, fireCd: 0, lastBtn: 0, elapsed: 0, lastReset: 0, hitFlash: 0,
    spawnMeteor(x, spd) { this.meteors.push(makeMeteor(this.meteorC, this.mtex, x, spd)); },
    reset() { this.meteors.forEach(m => m.c.destroy()); this.meteors.length = 0; this.bolts.forEach(b => b.g.destroy()); this.bolts.length = 0; this.shield = 5; this.progress = 0; this.won = false; this.lost = false; this.spawnT = 1.2; this.elapsed = 0; },
  };
}

// ctl = { potAim (0-1023), btn, connected, mode, resetPulse, onFire, onDestroy, onHit, onWin, onLose }
export function meteorTick(scene, dt, t, ctl) {
  const { app, sky, starC, stars, root, meteorC, boltC, particles, dome, barrel, muzzle, mtex, flash, meteors, bolts } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  flash.width = w; flash.height = h;
  stars.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.4 + 0.5 * Math.sin(t * s.sp + s.ph)); });

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // nishon: JOYSTIK burchagi (aimAngle) yoki ulanmagan idle sweep
  let aimT;
  if (ctl.connected) aimT = clamp(ctl.aimAngle ?? 0, -80, 80);
  else aimT = Math.sin(t * 0.6) * 45;
  scene.aim = lerp(scene.aim, aimT, Math.min(dt * 10, 1));
  barrel.rotation = scene.aim * D2R;
  muzzle.alpha = Math.max(0, muzzle.alpha - dt * 4);

  const playing = ctl.mode !== 'intro' && ctl.connected && !scene.won && !scene.lost;

  // otish (tugma rising edge + cooldown)
  scene.fireCd -= dt;
  const btn = ctl.mode === 'intro' ? (ctl.btn || 0) : (ctl.connected ? (ctl.btn ? 1 : 0) : 0);
  if (btn && !scene.lastBtn && scene.fireCd <= 0 && !scene.won && !scene.lost) {
    scene.fireCd = 0.2; muzzle.alpha = 1;
    const a = scene.aim * D2R;
    const g = new Graphics().roundRect(-2.5, -10, 5, 20, 2).fill(0xa8fff0).stroke({ width: 1, color: 0x39ffd0 });
    g.x = TX + Math.sin(a) * 54; g.y = TY - Math.cos(a) * 54; g.rotation = a;
    boltC.addChild(g);
    bolts.push({ g, x: g.x, y: g.y, vx: Math.sin(a) * 720, vy: -Math.cos(a) * 720, dead: false });
    if (ctl.onFire) ctl.onFire();
  }
  scene.lastBtn = btn;

  // meteor spawn
  if (playing) {
    scene.elapsed += dt;
    const diff = clamp(scene.progress / GOAL, 0, 1);
    scene.spawnT -= dt;
    if (scene.spawnT <= 0) { scene.spawnT = lerp(1.9, 1.05, diff) * (0.85 + Math.random() * 0.4); scene.meteors.push(makeMeteor(meteorC, mtex, 150 + Math.random() * 700, lerp(58, 128, diff))); }
  }

  // boltlar
  for (let i = bolts.length - 1; i >= 0; i--) {
    const b = bolts[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.g.x = b.x; b.g.y = b.y;
    if (b.y < -30 || b.x < -30 || b.x > LW + 30) { b.g.destroy(); bolts.splice(i, 1); }
  }

  // meteorlar + to'qnashuv
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i]; if (m.dead) continue;
    m.x += m.vx * dt; m.y += m.vy * dt; m.c.x = m.x; m.c.y = m.y; m.core.rotation += dt * 3;
    // bolt bilan urilish
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
    // bazaga urilish
    if (m.y > BASE_Y - 6) {
      m.dead = true; m.c.destroy(); meteors.splice(i, 1);
      particles.burst(m.x, BASE_Y - 10, 0xff5a2a, 22, 200); scene.hitFlash = 0.6;
      if (ctl.mode !== 'intro') { scene.shield = Math.max(0, scene.shield - 1); if (ctl.onHit) ctl.onHit(scene.shield); if (scene.shield <= 0 && !scene.lost) { scene.lost = true; if (ctl.onLose) ctl.onLose(); } }
    }
  }

  // qalqon gumbazi (shield qolganiga qarab)
  dome.clear();
  const sN = clamp(scene.shield / 5, 0, 1);
  const domeA = 0.12 + sN * 0.3 + scene.hitFlash * 0.4;
  dome.moveTo(60, BASE_Y).quadraticCurveTo(LW / 2, BASE_Y - 250 - scene.hitFlash * 30, LW - 60, BASE_Y).stroke({ width: 2.5, color: scene.hitFlash > 0.1 ? 0xff5a4a : 0x39ffd0, alpha: domeA });
  scene.hitFlash = Math.max(0, scene.hitFlash - dt * 1.6);
  flash.tint = 0xff4a3a; flash.alpha = Math.max(0, (flash.alpha || 0) - dt * 2); if (scene.hitFlash > 0.5) flash.alpha = 0.25;

  particles.tick(dt);
}
