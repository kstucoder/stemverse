// roverScene — VOLTRA "Ta'mirlash Roveri" — IR MASOFADAN BOSHQARUV (VS1838B + pult) yangi element.
// Realistik BAZA TASHQI KORPUSI: panellar, zovurlar, quvurlar, mixlar, ogohlantirish chiziqlari,
// meteor/jang shikastlari (yoriq + gaz chiqishi + uchqun). IR PULT tugmalari (▲▼◄►) bilan gusenitsali
// ta'mirlash roverini korpus bo'ylab yurit; shikast ustiga borib OK bilan payvandla. 5 shikast -> korpus butun.
// Saga davomi: reaktor quvvatlangach (18), meteorlardan shikastlangan tashqi korpusni ta'mirlaymiz.
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const RX0 = 70, RX1 = 930, RY0 = 150, RY1 = 500, SPEED = 165, WELD_R = 40, TARGET = 5;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);

function radialVignette(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.36, size / 2, size / 2, size * 0.64);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(3,4,7,0.9)'); c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}

// ===== SHIKAST NUQTASI (yoriq + gaz + payvand yamog'i) =====
function makeDamage(parent, x, y) {
  const c = new Container(); c.x = x; c.y = y; parent.addChild(c);
  const vent = new Sprite(radialTexture('rgba(120,200,255,0.5)', 128)); vent.anchor.set(0.5); vent.y = -6; vent.width = vent.height = 46; vent.blendMode = 'add'; c.addChild(vent);
  const crack = new Graphics();
  crack.moveTo(-18, 4).lineTo(-6, -8).lineTo(2, 2).lineTo(12, -10).lineTo(20, 2).stroke({ width: 3, color: 0x1a0e08 });
  crack.moveTo(-18, 4).lineTo(-6, -8).lineTo(2, 2).lineTo(12, -10).lineTo(20, 2).stroke({ width: 1, color: 0xff6a2a, alpha: 0.7 });
  crack.circle(-6, -8, 2).fill(0xffb060); crack.circle(12, -10, 2).fill(0xffb060);
  c.addChild(crack);
  const ring = new Graphics(); c.addChild(ring);          // aktiv marker
  const patch = new Graphics();                            // payvandlangan yamoq (tuzatilganda)
  patch.roundRect(-20, -12, 40, 24, 3).fill(0x2a3440).stroke({ width: 1.5, color: 0x4a5a68 });
  for (let i = -16; i <= 16; i += 8) patch.circle(i, -8, 1.4).fill(0x1a2028).circle(i, 8, 1.4).fill(0x1a2028);   // mixlar
  patch.moveTo(-18, 0).lineTo(18, 0).stroke({ width: 2, color: 0xffb060, alpha: 0.5 });                          // payvand chizig'i
  patch.alpha = 0; c.addChild(patch);
  return { c, vent, crack, ring, patch, x, y, fixed: false };
}

// ===== TA'MIRLASH ROVERI (gusenitsa + korpus + payvand qo'li) =====
function makeRover(parent) {
  const c = new Container(); parent.addChild(c);
  const light = new Graphics(); light.blendMode = 'add'; c.addChild(light);               // faralar konusi
  const g = new Graphics();
  // gusenitsalar
  g.roundRect(-26, 10, 52, 12, 4).fill(0x0e141a).stroke({ width: 1, color: 0x2a3640 });
  for (let x = -22; x < 24; x += 8) g.circle(x, 16, 3).fill(0x1a2530);
  // korpus
  g.roundRect(-22, -12, 44, 22, 4).fill(0x263341).stroke({ width: 1.5, color: 0x415464 });
  g.roundRect(-16, -20, 22, 10, 3).fill(0x1a2530);                    // kabina
  g.rect(-14, -18, 18, 5, 1).fill({ color: 0x9fd8ff, alpha: 0.8 });   // oyna
  g.rect(-22, -4, 44, 3).fill({ color: 0x0e141a, alpha: 0.8 });       // detal chizig'i
  g.circle(18, -14, 2).fill(0x39ff88);                                // status LED
  c.addChild(g);
  // payvand qo'l (buriladi)
  const arm = new Container(); arm.x = 14; arm.y = -4; c.addChild(arm);
  const ag = new Graphics(); ag.rect(0, -2, 22, 4).fill(0x3a4a58).stroke({ width: 0.8, color: 0x556676 }); ag.roundRect(20, -4, 8, 8, 2).fill(0x1a2028); arm.addChild(ag);
  const torch = new Sprite(radialTexture('rgba(180,220,255,0.9)', 128)); torch.anchor.set(0.5); torch.x = 26; torch.width = torch.height = 26; torch.blendMode = 'add'; torch.alpha = 0; arm.addChild(torch);
  return { c, g, arm, torch, light };
}

export function assembleRover(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.52, bloomScale: 1.0, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#04070e', '#070c16', '#0a0f18', '#0b1018'])); skyC.addChild(sky);
  const root = new Container(); app.stage.addChild(root);

  // KOSMOS chizig'i (yuqorida) + yulduz + sayyora
  const stars = new Graphics();
  for (let i = 0; i < 90; i++) stars.circle(rnd(0, LW), rnd(0, 120), rnd(0.3, 1.1)).fill({ color: 0xcfe0ff, alpha: rnd(0.2, 0.6) });
  root.addChild(stars);
  const planetGlow = new Sprite(radialTexture('rgba(120,90,255,0.4)', 256)); planetGlow.anchor.set(0.5); planetGlow.x = 120; planetGlow.y = 66; planetGlow.width = planetGlow.height = 200; planetGlow.blendMode = 'add'; root.addChild(planetGlow);
  const planet = new Graphics(); planet.circle(120, 62, 44).fill(0x2a1f5a); planet.ellipse(108, 54, 18, 9).fill({ color: 0x5a3f8f, alpha: 0.6 }); planet.arc(120, 62, 44, -1.2, 1.0).stroke({ width: 3, color: 0xa07fff, alpha: 0.5 }); root.addChild(planet);

  // ===== BAZA TASHQI KORPUSI (katta panelli sirt) =====
  const hull = new Graphics();
  hull.rect(0, 128, LW, LH - 128).fill(0x141b22);
  hull.rect(0, 128, LW, 4).fill({ color: 0x2a3a48, alpha: 0.7 });
  // panel setkasi + mixlar
  for (let x = 40; x < LW; x += 120) hull.moveTo(x, 132).lineTo(x, LH).stroke({ width: 2, color: 0x0e141a, alpha: 0.7 });
  for (let y = 190; y < LH; y += 90) hull.moveTo(0, y).lineTo(LW, y).stroke({ width: 2, color: 0x0e141a, alpha: 0.7 });
  for (let x = 40; x <= LW; x += 120) for (let y = 190; y <= LH; y += 90) { hull.circle(x, y, 2).fill(0x0a1016); hull.circle(x, y, 1).fill(0x33485a); }
  // panel soyalari (chuqurlik)
  for (let x = 40; x < LW; x += 120) for (let y = 132; y < LH; y += 90) hull.rect(x + 4, y + 4, 112, 82, 2).fill({ color: 0x0f161d, alpha: 0.35 });
  // quvurlar
  hull.roundRect(30, 150, 940, 10, 5).fill(0x1a2530).stroke({ width: 1, color: 0x2e3f4d });
  for (let x = 60; x < 970; x += 60) hull.circle(x, 155, 3).fill(0x0e141a);
  // ogohlantirish chevron chiziq
  for (let x = 0; x < LW; x += 30) hull.poly([x, LH - 26, x + 14, LH - 26, x + 6, LH - 12, x - 8, LH - 12]).fill({ color: x % 60 === 0 ? 0xffb020 : 0x1a1a12, alpha: 0.5 });
  // eskirish dog'lari
  for (let i = 0; i < 14; i++) { const sx = rnd(0, LW), sy = rnd(160, LH - 30); hull.ellipse(sx, sy, rnd(20, 60), rnd(8, 20)).fill({ color: 0x0c1116, alpha: 0.25 }); }
  root.addChild(hull);
  // statik zovur bug'i
  const ventBg = new Sprite(radialTexture('rgba(100,140,180,0.08)', 512)); ventBg.anchor.set(0.5); ventBg.x = 700; ventBg.y = 300; ventBg.width = 400; ventBg.height = 200; ventBg.blendMode = 'add'; root.addChild(ventBg);

  const particles = makeParticles(root);
  // shikast nuqtalari (5, tarqoq)
  const dmgPos = [[240, 230], [780, 250], [430, 380], [650, 430], [850, 350]];
  const damages = dmgPos.map(([x, y]) => makeDamage(root, x, y));
  const rover = makeRover(root);
  rover.c.x = 500; rover.c.y = 470;

  const vign = new Sprite(radialVignette()); vign.alpha = 0.62; app.stage.addChild(vign);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffffff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  const scene = {
    app, sky, root, stars, particles, damages, rover, vign, flash,
    rx: 500, ry: 470, faceX: 1, fixed: 0, weld: 0, nearIdx: -1, won: false,
    lastReset: 0, flashT: 0, moving: false,
    reset() { this.fixed = 0; this.weld = 0; this.won = false; this.rx = 500; this.ry = 470; this.damages.forEach((d) => { d.fixed = false; d.patch.alpha = 0; d.crack.alpha = 1; d.vent.alpha = 1; }); },
  };
  return scene;
}

// ctl = { ir ('UP'|'DOWN'|'LEFT'|'RIGHT'|'OK'|'NONE'), connected, mode, resetPulse, onWeld, onWin, onNear }
export function roverTick(scene, dt, t, ctl) {
  const { app, sky, root, stars, particles, damages, rover, vign, flash } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH); root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  vign.width = w; vign.height = h; flash.width = w; flash.height = h;
  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }
  stars.alpha = 0.7 + 0.3 * Math.sin(t * 0.6);

  const playing = (ctl.connected && !scene.won) || ctl.mode === 'intro';

  // eng yaqin tuzatilmagan shikast
  let nd = -1, ndd = Infinity;
  damages.forEach((d, i) => { if (d.fixed) return; const dd = Math.hypot(d.x - scene.rx, d.y - scene.ry); if (dd < ndd) { ndd = dd; nd = i; } });
  scene.nearIdx = nd;
  const inRange = nd >= 0 && ndd < WELD_R;

  // HARAKAT: IR pult (ulangan) yoki avto-pilot (demo)
  let vx = 0, vy = 0, welding = false;
  if (ctl.connected) {
    const c = (ctl.ir || 'NONE').toString().toUpperCase();
    if (c === 'UP') vy = -1; else if (c === 'DOWN') vy = 1; else if (c === 'LEFT') vx = -1; else if (c === 'RIGHT') vx = 1;
    welding = c === 'OK' && inRange;
  } else if (nd >= 0) {                              // avto-pilot: shikastga bor, payvandla
    const ddx = damages[nd].x - scene.rx, ddy = damages[nd].y - scene.ry, dd = Math.hypot(ddx, ddy) || 1;
    if (dd > WELD_R - 6) { vx = ddx / dd; vy = ddy / dd; } else welding = true;
  }
  scene.moving = (vx || vy) && !welding;
  if (welding) { vx = 0; vy = 0; }
  scene.rx = clamp(scene.rx + vx * SPEED * dt, RX0, RX1); scene.ry = clamp(scene.ry + vy * SPEED * dt, RY0, RY1);
  if (vx) scene.faceX = vx > 0 ? 1 : -1;
  rover.c.x = scene.rx; rover.c.y = scene.ry; rover.g.scale.x = scene.faceX; rover.arm.scale.x = scene.faceX; rover.arm.x = 14 * scene.faceX;
  // faralar konusi (harakat yo'nalishi)
  rover.light.clear();
  rover.light.poly([12 * scene.faceX, -6, (12 + 70) * scene.faceX, -30, (12 + 70) * scene.faceX, 20]).fill({ color: 0xbfe0ff, alpha: 0.06 });

  // gusenitsa "tebranishi"
  rover.g.y = Math.sin(t * 22) * (scene.moving ? 0.8 : 0.2);

  // PAYVANDLASH
  if (welding && playing && nd >= 0) {
    scene.weld = clamp(scene.weld + dt / 0.95, 0, 1);
    // qo'l shikastga qaraydi
    const ddx = damages[nd].x - scene.rx, ddy = damages[nd].y - scene.ry;
    rover.arm.rotation = Math.atan2(ddy, ddx * scene.faceX) * (scene.faceX);
    rover.torch.alpha = 0.6 + 0.4 * Math.sin(t * 40);
    if (Math.random() < 0.5) particles.burst(damages[nd].x, damages[nd].y, 0xffd23a, 3, 120);
    if (scene.weld >= 1) {
      const d = damages[nd]; d.fixed = true; scene.fixed++; scene.weld = 0; scene.flashT = 0.4;
      particles.burst(d.x, d.y, 0x6bffb0, 20, 190); particles.burst(d.x, d.y, 0xffffff, 8, 130);
      if (ctl.onWeld) ctl.onWeld(scene.fixed);
      if (scene.fixed >= TARGET && ctl.connected && ctl.mode !== 'intro' && !scene.won) { scene.won = true; if (ctl.onWin) ctl.onWin(); }
    }
  } else { scene.weld = Math.max(0, scene.weld - dt * 1.5); rover.torch.alpha = 0; rover.arm.rotation = lerp(rover.arm.rotation || 0, 0, Math.min(1, dt * 6)); }

  // shikastlarni yangilash (animatsiya + tuzatilgan holat)
  damages.forEach((d, i) => {
    if (d.fixed) { d.patch.alpha = Math.min(1, d.patch.alpha + dt * 3); d.crack.alpha = Math.max(0, d.crack.alpha - dt * 3); d.vent.alpha = Math.max(0, d.vent.alpha - dt * 3); d.ring.clear(); return; }
    d.vent.alpha = 0.35 + 0.25 * Math.sin(t * 3 + i); d.vent.scale.set(1 + 0.15 * Math.sin(t * 4 + i));
    if (Math.random() < 0.02) particles.burst(d.x, d.y - 6, 0x9fd0ff, 2, 60);
    d.ring.clear();
    const active = i === scene.nearIdx;
    const col = (active && inRange) ? 0x39ff88 : (active ? 0xffd23a : 0xff5a3a);
    d.ring.circle(0, 0, 26 + (active ? 3 * Math.sin(t * 6) : 0)).stroke({ width: active ? 2.5 : 1.5, color: col, alpha: active ? 0.8 : 0.4 });
    if (active && inRange) { d.ring.moveTo(-30, 0).lineTo(-24, 0).moveTo(30, 0).lineTo(24, 0).stroke({ width: 2, color: 0x39ff88 }); }
  });

  scene.flashT = Math.max(0, scene.flashT - dt); flash.tint = 0xcfffe0; flash.alpha = scene.flashT * 0.3;
  particles.tick(dt);
}
