// meteorDefenseScene — VOLTRA "Meteor Qalqoni" — 360° RADIAL MUDOFAA (joystik).
// Realistik kosmik muhit: tumanlik, sayyora, galaktika chizig'i, parallaks yulduzlar;
// markazda BATAFSIL stansiya (yashash gumbazi + chiroqlar + antennalar + radar sweep);
// shimmerli energiya qalqoni; olovli meteorlar (embers, izlar); portlash to'lqinlari.
import { Container, Graphics, Sprite, Texture, TilingSprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const CX = 500, CY = 272, CORE_R = 42, SHIELD_R = 72, SPAWN_R = 460, BARREL = 56, GOAL = 500;
const D2R = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

function vignetteTexture(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.34, size / 2, size / 2, size * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.72, 'rgba(0,0,0,0.3)'); g.addColorStop(1, 'rgba(1,2,6,0.92)');
  c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}
function noiseTexture(size = 64) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const img = c.createImageData(size, size); for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; } c.putImageData(img, 0, 0); return Texture.from(cv);
}

function makeMeteor(parent, tex, ang, spd) {
  const c = new Container();
  c.x = CX + Math.cos(ang) * SPAWN_R; c.y = CY + Math.sin(ang) * SPAWN_R;
  const sz = 0.8 + Math.random() * 0.7;
  const trail = new Sprite(tex); trail.anchor.set(0, 0.5); trail.width = 90 * sz; trail.height = 26 * sz; trail.tint = 0xff7a2a; trail.blendMode = 'add'; trail.rotation = ang; c.addChild(trail);
  const glow = new Sprite(tex); glow.anchor.set(0.5); glow.width = glow.height = 54 * sz; glow.tint = 0xffbf70; glow.blendMode = 'add'; c.addChild(glow);
  const core = new Graphics(); const pts = []; for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28; const r = (9 + Math.random() * 5) * sz; pts.push(Math.cos(a) * r, Math.sin(a) * r); } core.poly(pts).fill(0x3a2a1e).stroke({ width: 1.5, color: 0xffcaa0, alpha: 0.9 }); c.addChild(core);
  const hot = new Sprite(tex); hot.anchor.set(0.5); hot.width = hot.height = 20 * sz; hot.tint = 0xffe6a0; hot.blendMode = 'add'; c.addChild(hot);
  parent.addChild(c);
  return { c, core, hot, x: c.x, y: c.y, vx: -Math.cos(ang) * spd, vy: -Math.sin(ang) * spd, r: 14 * sz, sz, emberT: 0, dead: false };
}

export function assembleMeteorDefense(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.42, bloomScale: 1.14, brightness: 1.0, blur: 7, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  // ---- kosmik fon (ekran-fazoviy) ----
  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#02030a', '#050716', '#080a1c', '#04050e'])); skyC.addChild(sky);
  const galaxy = new Sprite(radialTexture('rgba(120,140,220,0.14)', 512)); galaxy.anchor.set(0.5); galaxy.rotation = -0.5; galaxy.blendMode = 'add'; skyC.addChild(galaxy);
  const neb1 = new Sprite(radialTexture('rgba(90,60,160,0.18)', 512)); neb1.anchor.set(0.5); neb1.blendMode = 'add'; skyC.addChild(neb1);
  const neb2 = new Sprite(radialTexture('rgba(30,120,140,0.16)', 512)); neb2.anchor.set(0.5); neb2.blendMode = 'add'; skyC.addChild(neb2);
  const starFar = new Container(); skyC.addChild(starFar); const starsFar = [];
  for (let i = 0; i < 120; i++) { const g = new Graphics().circle(0, 0, 0.5 + Math.random() * 0.9).fill(0xaecbff); starFar.addChild(g); starsFar.push({ g, fx: Math.random(), fy: Math.random(), b: 0.2 + Math.random() * 0.3, sp: 0.4 + Math.random() * 1.5, ph: Math.random() * 6.28 }); }
  const starNear = new Container(); skyC.addChild(starNear); const starsNear = [];
  for (let i = 0; i < 46; i++) { const g = new Graphics().circle(0, 0, 1 + Math.random() * 1.4).fill(0xeaf3ff); starNear.addChild(g); starsNear.push({ g, fx: Math.random(), fy: Math.random(), b: 0.4 + Math.random() * 0.5, sp: 0.6 + Math.random() * 2, ph: Math.random() * 6.28 }); }
  // uzoq sayyora
  const planet = new Container(); skyC.addChild(planet);
  const pGlow = new Sprite(radialTexture('rgba(90,150,230,0.5)', 512)); pGlow.anchor.set(0.5); pGlow.width = pGlow.height = 320; pGlow.blendMode = 'add'; planet.addChild(pGlow);
  const pBody = new Graphics(); pBody.circle(0, 0, 74).fill(0x1b3a5a); pBody.circle(0, 0, 74).stroke({ width: 2, color: 0x2e5a82, alpha: 0.6 });
  for (let i = 0; i < 5; i++) { const yy = -50 + i * 24; pBody.ellipse(0, yy, 72 - Math.abs(yy) * 0.4, 5).fill({ color: [0x24507a, 0x2e5e88][i % 2], alpha: 0.5 }); }
  pBody.circle(22, -8, 74).fill({ color: 0x02030a, alpha: 0.55 });   // terminator soyasi
  planet.addChild(pBody);
  const shoot = new Graphics().moveTo(0, 0).lineTo(-40, -14).stroke({ width: 1.5, color: 0xeaf3ff }); shoot.alpha = 0; skyC.addChild(shoot);

  const root = new Container(); app.stage.addChild(root);

  const meteorC = new Container(); root.addChild(meteorC);
  const ringsG = new Graphics(); root.addChild(ringsG);      // portlash to'lqinlari
  const boltC = new Container(); root.addChild(boltC);
  const dome = new Graphics(); root.addChild(dome);          // energiya qalqoni

  // ---- markaziy stansiya (batafsil) ----
  const station = new Container(); station.x = CX; station.y = CY; root.addChild(station);
  const baseGlow = new Sprite(radialTexture('rgba(57,255,208,0.5)', 512)); baseGlow.anchor.set(0.5); baseGlow.width = baseGlow.height = 300; baseGlow.blendMode = 'add'; baseGlow.alpha = 0.22; station.addChild(baseGlow);
  // solar panel qanotlari
  const panels = new Graphics();
  [[-1], [1]].forEach(([s]) => { panels.roundRect(s * (CORE_R + 6), -22, s * 46, 44, 3).fill(0x14324a).stroke({ width: 1, color: 0x2e6a9a, alpha: 0.6 }); for (let k = 1; k < 4; k++) panels.moveTo(s * (CORE_R + 6 + k * 11), -22).lineTo(s * (CORE_R + 6 + k * 11), 22).stroke({ width: 1, color: 0x1f4a6a, alpha: 0.5 }); });
  station.addChild(panels);
  // struktura halqasi + pylonlar
  const struct = new Graphics();
  struct.circle(0, 0, CORE_R + 10).stroke({ width: 3, color: 0x2a4658 });
  for (let a = 0; a < 360; a += 60) struct.moveTo(Math.cos(a * D2R) * (CORE_R - 4), Math.sin(a * D2R) * (CORE_R - 4)).lineTo(Math.cos(a * D2R) * (CORE_R + 12), Math.sin(a * D2R) * (CORE_R + 12)).stroke({ width: 4, color: 0x34566e });
  station.addChild(struct);
  // yashash gumbazi (tiklangan shahar chiroqlari)
  const habitat = new Graphics();
  habitat.circle(0, 0, CORE_R).fill(0x0e1e2c).stroke({ width: 2, color: 0x3a6a8a });
  station.addChild(habitat);
  const winC = new Container(); station.addChild(winC); const wins = [];
  for (let i = 0; i < 26; i++) { const a = Math.random() * 6.28, r = Math.random() * (CORE_R - 8); const g = new Graphics().rect(0, 0, 2.4, 2.4).fill(Math.random() < 0.3 ? 0x9fe8ff : 0xffd76a); g.x = Math.cos(a) * r; g.y = Math.sin(a) * r; winC.addChild(g); wins.push({ g, b: 0.4 + Math.random() * 0.5, sp: 0.5 + Math.random() * 2.5, ph: Math.random() * 6.28 }); }
  // radar sweep
  const radar = new Graphics(); station.addChild(radar);
  // antennalar + mayoqlar
  const antennas = new Graphics(); const beacons = [];
  [30, 150, 270].forEach((deg) => { const a = deg * D2R; const bx = Math.cos(a) * (CORE_R + 14), by = Math.sin(a) * (CORE_R + 14); antennas.moveTo(Math.cos(a) * CORE_R, Math.sin(a) * CORE_R).lineTo(bx, by).stroke({ width: 1.5, color: 0x3a5a72 }); const bg = new Graphics().circle(bx, by, 2.2).fill(0xff2d55); beacons.push({ g: bg, ph: Math.random() * 6.28 }); station.addChild(bg); });
  station.addChild(antennas);
  const core = new Graphics(); core.circle(0, 0, 12).fill(0x1a3a4a).stroke({ width: 2, color: 0x39ffd0, alpha: 0.7 }); station.addChild(core);

  // ---- zenit to'pi ----
  const turret = new Container(); turret.x = CX; turret.y = CY; root.addChild(turret);
  const bg2 = new Graphics();
  bg2.roundRect(6, -9, BARREL, 18, 5).fill(0x243646).stroke({ width: 1.5, color: 0x5a86b0 });
  for (let k = 0; k < 4; k++) bg2.rect(16 + k * 10, -12, 3, 24).fill({ color: 0x3a5e7a, alpha: 0.7 });   // sovutish qovurg'alari
  bg2.roundRect(BARREL, -11, 12, 22, 3).fill(0x3a5e82);
  bg2.roundRect(2, -6, 12, 12, 3).fill(0x2a4a5e);
  turret.addChild(bg2);
  const coil = new Sprite(radialTexture('rgba(120,255,220,0.9)', 128)); coil.anchor.set(0.5); coil.width = coil.height = 22; coil.x = 20; coil.blendMode = 'add'; coil.alpha = 0.5; turret.addChild(coil);
  const muzzle = new Sprite(radialTexture('rgba(150,255,230,0.95)', 128)); muzzle.anchor.set(0.5); muzzle.width = muzzle.height = 34; muzzle.x = BARREL + 10; muzzle.blendMode = 'add'; muzzle.alpha = 0; turret.addChild(muzzle);

  const particles = makeParticles(root);
  const mtex = radialTexture('rgba(255,255,255,0.9)', 128);

  // ---- ekran-fazoviy ----
  const warn = new Graphics().rect(0, 0, 10, 10).fill(0xff3020); warn.alpha = 0; warn.blendMode = 'add'; app.stage.addChild(warn);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xff5a3a); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);
  const vign = new Sprite(vignetteTexture()); vign.alpha = 0.82; app.stage.addChild(vign);
  const grain = new TilingSprite({ texture: noiseTexture(), width: 10, height: 10 }); grain.alpha = 0.045; grain.blendMode = 'add'; app.stage.addChild(grain);

  return {
    app, sky, galaxy, neb1, neb2, starFar, starsFar, starNear, starsNear, planet, shoot, root, meteorC, ringsG, boltC, dome,
    station, baseGlow, wins, radar, beacons, turret, coil, muzzle, mtex, particles, flash, warn, vign, grain,
    meteors: [], bolts: [], rings: [], shield: 5, progress: 0, won: false, lost: false,
    aim: 0, spawnT: 1.2, fireCd: 0, lastBtn: 0, elapsed: 0, lastReset: 0, hitFlash: 0, shootT: 5,
    spawnMeteor(ang, spd) { this.meteors.push(makeMeteor(this.meteorC, this.mtex, ang, spd)); },
    reset() { this.meteors.forEach(m => m.c.destroy()); this.meteors.length = 0; this.bolts.forEach(b => b.g.destroy()); this.bolts.length = 0; this.rings.length = 0; this.shield = 5; this.progress = 0; this.won = false; this.lost = false; this.spawnT = 1.2; this.elapsed = 0; },
  };
}

export function meteorTick(scene, dt, t, ctl) {
  const { app, sky, galaxy, neb1, neb2, starFar, starsFar, starNear, starsNear, planet, shoot, root, ringsG, dome, station, baseGlow, wins, radar, beacons, turret, coil, muzzle, meteors, bolts, rings, particles, flash, warn, vign, grain } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  galaxy.x = w * 0.5; galaxy.y = h * 0.4; galaxy.width = w * 1.6; galaxy.height = h * 0.9;
  neb1.x = w * 0.24; neb1.y = h * 0.7; neb1.width = neb1.height = 560;
  neb2.x = w * 0.8; neb2.y = h * 0.3; neb2.width = neb2.height = 500;
  planet.x = w * 0.84; planet.y = h * 0.2; planet.scale.set(clamp(Math.min(w, h) / 560, 0.7, 1.2));
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  [flash, warn].forEach((o) => { o.width = w; o.height = h; });
  vign.width = w; vign.height = h; grain.width = w; grain.height = h; grain.tilePosition.set(Math.random() * 64, Math.random() * 64);
  starsFar.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.4 + 0.5 * Math.sin(t * s.sp + s.ph)); });
  starsNear.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)); });
  // uchar yulduz
  scene.shootT -= dt; if (scene.shootT <= 0) { scene.shootT = 6 + Math.random() * 8; shoot.x = w * (0.1 + Math.random() * 0.5); shoot.y = 30 + Math.random() * 120; shoot._life = 0; }
  if (shoot._life !== undefined && shoot._life < 0.9) { shoot._life += dt; shoot.x += 520 * dt; shoot.y += 170 * dt; shoot.alpha = Math.max(0, 1 - shoot._life / 0.9) * 0.9; } else shoot.alpha = 0;

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // nishon (joystik 360°) yoki idle
  let aimT = ctl.connected ? (ctl.aimAngle ?? 0) : (t * 40) % 360;
  let da = ((aimT - scene.aim + 540) % 360) - 180; scene.aim += da * Math.min(dt * 12, 1);
  turret.rotation = scene.aim * D2R;
  muzzle.alpha = Math.max(0, muzzle.alpha - dt * 4);
  coil.alpha = 0.4 + 0.25 * Math.sin(t * 8) + (scene.fireCd > 0 ? 0.3 : 0);

  const playing = ctl.mode !== 'intro' && ctl.connected && !scene.won && !scene.lost;

  // otish
  scene.fireCd -= dt;
  const btn = ctl.connected || ctl.mode === 'intro' ? (ctl.btn ? 1 : 0) : 0;
  if (btn && !scene.lastBtn && scene.fireCd <= 0 && !scene.won && !scene.lost) {
    scene.fireCd = 0.2; muzzle.alpha = 1;
    const a = scene.aim * D2R;
    const bc = new Container(); bc.x = CX + Math.cos(a) * (BARREL + 12); bc.y = CY + Math.sin(a) * (BARREL + 12); bc.rotation = a;
    const bglow = new Sprite(scene.mtex); bglow.anchor.set(0.5); bglow.width = 40; bglow.height = 14; bglow.tint = 0x6affe0; bglow.blendMode = 'add'; bc.addChild(bglow);
    bc.addChild(new Graphics().roundRect(-10, -2.5, 20, 5, 2).fill(0xd8fff5).stroke({ width: 1, color: 0x39ffd0 }));
    scene.boltC.addChild(bc);
    bolts.push({ g: bc, x: bc.x, y: bc.y, vx: Math.cos(a) * 720, vy: Math.sin(a) * 720, dead: false });
    if (ctl.onFire) ctl.onFire();
  }
  scene.lastBtn = btn;

  // spawn
  if (playing) {
    scene.elapsed += dt; const diff = clamp(scene.progress / GOAL, 0, 1);
    scene.spawnT -= dt;
    if (scene.spawnT <= 0) { scene.spawnT = lerp(1.9, 1.0, diff) * (0.85 + Math.random() * 0.4); scene.spawnMeteor(Math.random() * Math.PI * 2, lerp(52, 110, diff)); }
  }

  // boltlar
  for (let i = bolts.length - 1; i >= 0; i--) { const b = bolts[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.g.x = b.x; b.g.y = b.y; if (Math.hypot(b.x - CX, b.y - CY) > 560) { b.g.destroy(); bolts.splice(i, 1); } }

  // meteorlar
  let nearest = 9999;
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i]; if (m.dead) continue;
    m.x += m.vx * dt; m.y += m.vy * dt; m.c.x = m.x; m.c.y = m.y; m.core.rotation += dt * 3; m.hot.alpha = 0.7 + 0.3 * Math.sin(t * 12 + i);
    const dc = Math.hypot(m.x - CX, m.y - CY); if (dc < nearest) nearest = dc;
    // embers (olovli izdan uchqun)
    m.emberT -= dt; if (m.emberT <= 0) { m.emberT = 0.05 + Math.random() * 0.06; const ba = Math.atan2(m.vy, m.vx) + Math.PI; particles.burst(m.x + Math.cos(ba) * 10, m.y + Math.sin(ba) * 10, Math.random() < 0.5 ? 0xff8a3a : 0xffd070, 1, 40); }
    for (let j = bolts.length - 1; j >= 0; j--) {
      const b = bolts[j]; if (Math.hypot(b.x - m.x, b.y - m.y) < m.r + 14) {
        m.dead = true; b.g.destroy(); bolts.splice(j, 1);
        particles.burst(m.x, m.y, 0xffb040, 18, 190); particles.burst(m.x, m.y, 0x39ffd0, 10, 130);
        rings.push({ x: m.x, y: m.y, r: 4, vr: 320, max: 60 + m.sz * 30, col: 0xffcf80, w: 3 });
        scene.progress = Math.min(GOAL, scene.progress + 20);
        if (ctl.onDestroy) ctl.onDestroy(scene.progress);
        if (scene.progress >= GOAL && !scene.won && ctl.mode !== 'intro') { scene.won = true; if (ctl.onWin) ctl.onWin(); }
        break;
      }
    }
    if (m.dead) { m.c.destroy(); meteors.splice(i, 1); continue; }
    if (dc < SHIELD_R) {
      m.dead = true; m.c.destroy(); meteors.splice(i, 1);
      particles.burst(m.x, m.y, 0xff5a2a, 26, 220); rings.push({ x: m.x, y: m.y, r: 6, vr: 420, max: 120, col: 0xff5a3a, w: 5 }); scene.hitFlash = 0.7;
      if (ctl.mode !== 'intro') { scene.shield = Math.max(0, scene.shield - 1); if (ctl.onHit) ctl.onHit(scene.shield); if (scene.shield <= 0 && !scene.lost) { scene.lost = true; if (ctl.onLose) ctl.onLose(); } }
    }
  }

  // portlash to'lqinlari
  ringsG.clear();
  for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.r += r.vr * dt; const a = clamp(1 - r.r / r.max, 0, 1); if (a <= 0) { rings.splice(i, 1); continue; } ringsG.circle(r.x, r.y, r.r).stroke({ width: r.w * a + 0.5, color: r.col, alpha: a * 0.8 }); }

  // ---- stansiya jonli elementlari ----
  wins.forEach((o) => { o.g.alpha = o.b * (0.6 + 0.4 * Math.sin(t * o.sp + o.ph)); });
  beacons.forEach((b, i) => { b.g.alpha = 0.25 + 0.75 * Math.abs(Math.sin(t * 2.2 + b.ph)); });
  radar.clear(); const ra = (t * 1.1) % (Math.PI * 2); radar.moveTo(0, 0).arc(0, 0, CORE_R - 4, ra, ra + 0.5).lineTo(0, 0).fill({ color: 0x39ffd0, alpha: 0.12 });

  // ---- energiya qalqoni (shimmerli aylana + hex tugunlar) ----
  dome.clear();
  const sN = clamp(scene.shield / 5, 0, 1);
  const dcol = scene.hitFlash > 0.1 ? 0xff5a4a : 0x39ffd0;
  dome.circle(CX, CY, SHIELD_R).stroke({ width: 2.5, color: dcol, alpha: 0.18 + sN * 0.3 + scene.hitFlash * 0.45 });
  dome.circle(CX, CY, SHIELD_R - 5).stroke({ width: 1, color: dcol, alpha: (0.1 + sN * 0.15) * (0.6 + 0.4 * Math.sin(t * 4)) });
  for (let a = 0; a < 360; a += 30) { const rad = a * D2R + t * 0.2; dome.circle(CX + Math.cos(rad) * SHIELD_R, CY + Math.sin(rad) * SHIELD_R, 2).fill({ color: dcol, alpha: 0.3 + sN * 0.4 }); }
  baseGlow.alpha = 0.18 + sN * 0.2 + scene.hitFlash * 0.3;
  scene.hitFlash = Math.max(0, scene.hitFlash - dt * 1.6);

  // ogohlantirish (meteor yaqin) + flash
  warn.alpha = nearest < SHIELD_R + 90 ? clamp((SHIELD_R + 90 - nearest) / 90, 0, 1) * 0.16 * (0.5 + 0.5 * Math.sin(t * 12)) : 0;
  flash.alpha = Math.max(0, (flash.alpha || 0) - dt * 2); if (scene.hitFlash > 0.55) flash.alpha = 0.24;

  particles.tick(dt);
}
