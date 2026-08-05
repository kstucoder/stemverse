// securityScene — VOLTRA "Xavfsizlik Tizimi" — PIR HARAKAT SENSORI (tungi perimetr kamerasi).
// TUNGI baza: shiftga o'rnatilgan PIR sensori (Fresnel gumbaz) pastga FOV konus tashlaydi.
// Skavenjer KVADROKOPTER dronlar o'ngdan chapga (darvozaga) uchadi. Dron PIR zonasiga
// kirganda qo'lni sensor oldida silt (PIR HIGH) -> projektor + signal -> dron qaytariladi.
// Bo'sh zonada silt -> soxta signal. Dron darvozaga yetsa -> buzilish. 10 dron -> perimetr xavfsiz.
import { Container, Graphics, Sprite, Texture, TilingSprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000, LH = 560;
const GATE_X = 140, GROUND = 436, ZX1 = 448, ZX2 = 588, TARGET = 10, SECURITY = 4;
const PIR_X = (ZX1 + ZX2) / 2, PIR_Y = 96, ZONE_TOP = PIR_Y + 20;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

function scanlineTexture() {
  const cv = document.createElement('canvas'); cv.width = 4; cv.height = 4; const c = cv.getContext('2d');
  c.fillStyle = 'rgba(0,0,0,0)'; c.fillRect(0, 0, 4, 4); c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(0, 2, 4, 1); return Texture.from(cv);
}

function radialVignette(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.34, size / 2, size / 2, size * 0.6);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,4,2,0.9)'); c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}

// ---------- KVADROKOPTER DRON ----------
function makeDrone(parent) {
  const c = new Container();
  // termal issiqlik halosi (night-vision'da ko'rinadi)
  const glow = new Sprite(radialTexture('rgba(255,72,44,0.55)', 128)); glow.anchor.set(0.5); glow.width = glow.height = 76; glow.blendMode = 'add'; c.addChild(glow);

  // X-ramka (arm'lar)
  const A = 23, AH = 11;
  const frame = new Graphics();
  frame.moveTo(-A, -AH).lineTo(A, AH).moveTo(-A, AH).lineTo(A, -AH).stroke({ width: 3.5, color: 0x252c34 });
  frame.moveTo(-A, -AH).lineTo(A, AH).moveTo(-A, AH).lineTo(A, -AH).stroke({ width: 1, color: 0x3d4a56 });
  c.addChild(frame);

  // 4 rotor (aylanuvchi parraklar + blur disk + himoya halqasi)
  const rotors = [];
  [[-A, -AH], [A, AH], [-A, AH], [A, -AH]].forEach(([rx, ry], k) => {
    const r = new Container(); r.x = rx; r.y = ry;
    const disc = new Sprite(radialTexture('rgba(150,190,255,0.4)', 64)); disc.anchor.set(0.5); disc.width = disc.height = 24; disc.blendMode = 'add'; r.addChild(disc);
    const ring = new Graphics().circle(0, 0, 12).stroke({ width: 1.5, color: 0x33404b }); r.addChild(ring);
    const blades = new Graphics();
    blades.ellipse(0, 0, 12, 2.4).fill({ color: 0x9fc0ff, alpha: 0.55 });
    blades.ellipse(0, 0, 2.4, 12).fill({ color: 0x9fc0ff, alpha: 0.55 }); r.addChild(blades);
    const hub = new Graphics().circle(0, 0, 2.6).fill(0x1a2028); r.addChild(hub);
    c.addChild(r); rotors.push({ blades, disc, seed: k });
  });

  // markaziy korpus + kanopa
  const body = new Graphics();
  body.roundRect(-14, -10, 28, 20, 6).fill(0x161c22).stroke({ width: 2, color: 0x3a4650 });
  body.roundRect(-14, -10, 28, 8, 5).fill({ color: 0x232c34, alpha: 0.9 });
  body.moveTo(-9, -2).lineTo(9, -2).stroke({ width: 1, color: 0x2a3640 });
  c.addChild(body);

  // navigatsiya chiroqlari (aviatsiya: chap-qizil, o'ng-yashil)
  const nav = new Graphics();
  nav.circle(-A, -AH, 2).fill(0xff2e2e).circle(A, -AH, 2).fill(0x2eff6a); c.addChild(nav);

  // gimbal kamera / LIDAR ko'z (pastda)
  const eyeHousing = new Graphics().circle(0, 11, 5.5).fill(0x0b1015).stroke({ width: 1.5, color: 0x2a3640 }); c.addChild(eyeHousing);
  const eye = new Graphics().circle(0, 11, 3.2).fill(0xff2e1e); c.addChild(eye);

  // pastga skanerlash nuri
  const beam = new Graphics(); beam.poly([-5, 15, 5, 15, 20, 70, -20, 70]).fill({ color: 0x33e0ff, alpha: 0.14 }); beam.blendMode = 'add'; c.addChild(beam);

  // zonada aniqlanganda termal kontur
  const outline = new Graphics(); c.addChild(outline);

  parent.addChild(c);
  return { c, glow, rotors, eye, beam, nav, outline };
}

// ---------- uzoq sweep-projektor (atmosfera) ----------
function makeSearchlight(parent, x, phase) {
  const c = new Container(); c.x = x; c.y = 62;
  const cone = new Graphics().poly([0, 0, -70, 360, 70, 360]).fill({ color: 0x2ee08a, alpha: 0.09 }); cone.blendMode = 'add'; c.addChild(cone);
  const src = new Sprite(radialTexture('rgba(120,255,180,0.6)', 128)); src.anchor.set(0.5); src.width = src.height = 34; src.blendMode = 'add'; c.addChild(src);
  parent.addChild(c);
  return { c, cone, phase };
}

export function assembleSecurity(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.05, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#02060a', '#05110f', '#04120e', '#020705'])); skyC.addChild(sky);
  const root = new Container(); app.stage.addChild(root);

  // yulduzlar / uzoq haze
  const stars = new Graphics();
  for (let i = 0; i < 70; i++) { const sx = Math.random() * LW, sy = Math.random() * 200; stars.circle(sx, sy, Math.random() * 1.1 + 0.3).fill({ color: 0x9fdcc0, alpha: 0.15 + Math.random() * 0.4 }); }
  root.addChild(stars);

  // uzoq baza silueti (ikki qatlam chuqurlik uchun)
  const city2 = makeSkyline(70, 0x07140f, 33); city2.alpha = 0.4; city2.y = -14; root.addChild(city2);
  const city = makeSkyline(96, 0x0a1a16, 21); city.alpha = 0.55; root.addChild(city);

  // uzoq sweep projektorlar
  const searchlights = [makeSearchlight(root, 250, 0), makeSearchlight(root, 760, 2.1)];

  // suzuvchi tuman banklari
  const fogs = [];
  for (let i = 0; i < 4; i++) {
    const f = new Sprite(radialTexture('rgba(46,120,84,0.13)', 512)); f.anchor.set(0.5);
    f.width = 460 + Math.random() * 220; f.height = 130 + Math.random() * 60;
    f.x = Math.random() * LW; f.y = GROUND - 30 - Math.random() * 90; f.blendMode = 'add';
    root.addChild(f); fogs.push({ s: f, sp: 8 + Math.random() * 14 });
  }

  // yer + perspektiva panjara
  const ground = new Graphics();
  ground.rect(0, GROUND, LW, LH - GROUND).fill(0x051210);
  ground.rect(0, GROUND, LW, 3).fill({ color: 0x2a6a4a, alpha: 0.55 });
  for (let x = -200; x < LW + 200; x += 64) ground.moveTo(x, GROUND).lineTo((x - LW / 2) * 2.4 + LW / 2, LH).stroke({ width: 1, color: 0x0e2620, alpha: 0.5 });
  for (let i = 1; i <= 4; i++) { const yy = GROUND + (LH - GROUND) * (i / 4) * (i / 4); ground.moveTo(0, yy).lineTo(LW, yy).stroke({ width: 1, color: 0x0e2620, alpha: 0.4 }); }
  root.addChild(ground);

  // aniqlash maydoni ostidagi ogohlantirish bo'yog'i (hazard)
  const hazard = new Graphics();
  hazard.poly([ZX1, GROUND, ZX2, GROUND, ZX2 + 34, LH, ZX1 - 34, LH]).fill({ color: 0x0a2a1c, alpha: 0.6 });
  for (let s = -40; s < 220; s += 26) hazard.poly([ZX1 + s, GROUND, ZX1 + s + 12, GROUND, ZX1 + s - 20, LH, ZX1 + s - 32, LH]).fill({ color: 0x143a26, alpha: 0.5 });
  hazard.moveTo(ZX1, GROUND).lineTo(ZX1 - 34, LH).moveTo(ZX2, GROUND).lineTo(ZX2 + 34, LH).stroke({ width: 2, color: 0x39e06a, alpha: 0.28 });
  root.addChild(hazard);

  // darvoza + panjara (chap perimetr)
  const gate = new Graphics();
  gate.rect(0, 110, GATE_X, GROUND - 110).fill(0x0b1816).stroke({ width: 2, color: 0x1f4a3a });
  for (let y = 122; y < GROUND; y += 16) gate.moveTo(6, y).lineTo(GATE_X - 6, y + 10).stroke({ width: 1, color: 0x163a30, alpha: 0.55 });
  for (let y = 122; y < GROUND; y += 16) gate.moveTo(GATE_X - 6, y).lineTo(6, y + 10).stroke({ width: 1, color: 0x163a30, alpha: 0.55 });
  gate.rect(GATE_X - 8, 104, 10, GROUND - 100).fill(0x1f4a3a);          // ustun
  gate.rect(-4, 104, 10, GROUND - 100).fill(0x143228);
  // hazard chiziq ustun ustida
  for (let y = 116; y < GROUND; y += 22) gate.rect(GATE_X - 8, y, 10, 11).fill({ color: 0xffb020, alpha: 0.5 });
  root.addChild(gate);
  const gateLight = new Sprite(radialTexture('rgba(60,255,160,0.6)', 256)); gateLight.anchor.set(0.5); gateLight.width = 170; gateLight.height = 300; gateLight.x = GATE_X; gateLight.y = GROUND - 130; gateLight.blendMode = 'add'; gateLight.alpha = 0.12; root.addChild(gateLight);
  const gateLamp = new Graphics().circle(GATE_X - 3, 112, 5).fill(0xff5a3a); gateLamp.blendMode = 'add'; root.addChild(gateLamp);

  // masofa halqalari (PIR ostida radar hissi)
  const rings = new Graphics(); root.addChild(rings);

  // PIR aniqlash konusi (zona) — dinamik
  const zone = new Graphics(); root.addChild(zone);

  // PIR SENSOR BLOKI (shiftga o'rnatilgan Fresnel gumbaz)
  const pirUnit = new Container(); pirUnit.x = PIR_X; pirUnit.y = PIR_Y; root.addChild(pirUnit);
  const mount = new Graphics();
  mount.rect(-4, -PIR_Y, 8, PIR_Y - 8).fill(0x14201c);                       // shiftga tayanch
  mount.roundRect(-18, -10, 36, 16, 4).fill(0x101815).stroke({ width: 1.5, color: 0x2a4a3c }); // PCB baza
  pirUnit.addChild(mount);
  const pirGlow = new Sprite(radialTexture('rgba(120,255,180,0.7)', 128)); pirGlow.anchor.set(0.5); pirGlow.y = 8; pirGlow.width = pirGlow.height = 56; pirGlow.blendMode = 'add'; pirGlow.alpha = 0.15; pirUnit.addChild(pirGlow);
  const dome = new Graphics();
  dome.ellipse(0, 8, 15, 13).fill(0xdfeee6).stroke({ width: 1.5, color: 0x8fbfa8 });        // oq Fresnel gumbaz
  for (let i = -2; i <= 2; i++) dome.moveTo(i * 5, -2).lineTo(i * 5, 18).stroke({ width: 0.8, color: 0xb8d8c8, alpha: 0.6 });
  for (let j = 2; j <= 18; j += 4) dome.moveTo(-14, j).lineTo(14, j).stroke({ width: 0.8, color: 0xb8d8c8, alpha: 0.5 });
  pirUnit.addChild(dome);
  const pirLed = new Graphics().circle(11, -2, 2.4).fill(0xff3020); pirUnit.addChild(pirLed);

  // intruderlar + projektor
  const intruderC = new Container(); root.addChild(intruderC);
  const spot = new Graphics(); spot.blendMode = 'add'; root.addChild(spot);

  const particles = makeParticles(root);

  // night-vision tint + scanlines + strobe + vignette
  const nvTint = new Graphics().rect(0, 0, 10, 10).fill(0x0a5a3a); nvTint.alpha = 0.16; nvTint.blendMode = 'add'; app.stage.addChild(nvTint);
  const scan = new TilingSprite({ texture: scanlineTexture(), width: 10, height: 10 }); scan.alpha = 0.35; app.stage.addChild(scan);
  const strobe = new Graphics().rect(0, 0, 10, 10).fill(0xff2a1a); strobe.alpha = 0; strobe.blendMode = 'add'; app.stage.addChild(strobe);
  const vign = new Sprite(radialVignette()); vign.alpha = 0.7; app.stage.addChild(vign);

  return {
    app, sky, root, city, fogs, searchlights, gateLight, gateLamp, rings, zone, pirUnit, pirGlow, pirLed, intruderC, spot, particles, nvTint, scan, strobe, vign,
    intruders: [], caught: 0, security: SECURITY, won: false, lost: false,
    lastPir: 0, spawnT: 1.4, spotT: 0, strobeT: 0, elapsed: 0, lastReset: 0, falseFlash: 0,
    spawnDrone(x, y, speed) { const d = makeDrone(this.intruderC); d.x = x; d.y = y; d.speed = speed; this.intruders.push(d); return d; },
    reset() { this.intruders.forEach(d => d.c.destroy()); this.intruders.length = 0; this.caught = 0; this.security = SECURITY; this.won = false; this.lost = false; this.spawnT = 1.4; this.elapsed = 0; },
  };
}

// ctl = { pir, connected, mode, resetPulse, onTrigger, onCatch, onFalse, onBreach, onWin, onLose }
export function securityTick(scene, dt, t, ctl) {
  const { app, sky, root, fogs, searchlights, gateLight, gateLamp, rings, zone, pirGlow, pirLed, intruders, particles, nvTint, scan, strobe, vign } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  [nvTint, strobe].forEach((o) => { o.width = w; o.height = h; }); vign.width = w; vign.height = h;
  scan.width = w; scan.height = h; scan.tilePosition.y = (t * 30) % 4;

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // atmosfera: sweep projektorlar + tuman drift
  searchlights.forEach((s) => { s.c.rotation = Math.sin(t * 0.28 + s.phase) * 0.5; s.cone.alpha = 0.06 + 0.04 * (0.5 + 0.5 * Math.sin(t * 0.9 + s.phase)); });
  fogs.forEach((f) => { f.s.x -= f.sp * dt; if (f.s.x < -260) f.s.x = LW + 260; });
  gateLight.alpha = 0.1 + 0.05 * Math.sin(t * 2);
  gateLamp.alpha = 0.5 + 0.5 * Math.abs(Math.sin(t * 3));

  const trig = scene.spotT > 0;

  // PIR aniqlash konusi (dinamik FOV) + skanerlash sweep
  zone.clear();
  const coneA = (trig ? 0.16 : 0.05) + 0.02 * Math.sin(t * 3);
  zone.poly([PIR_X - 15, ZONE_TOP, PIR_X + 15, ZONE_TOP, ZX2, GROUND, ZX1, GROUND]).fill({ color: 0x2ee06a, alpha: coneA });
  zone.moveTo(PIR_X - 15, ZONE_TOP).lineTo(ZX1, GROUND).moveTo(PIR_X + 15, ZONE_TOP).lineTo(ZX2, GROUND).stroke({ width: 1.5, color: 0x39e06a, alpha: 0.3 + (trig ? 0.3 : 0) });
  const k = (t * 0.55) % 1; const sy = lerp(ZONE_TOP, GROUND, k);
  const lx = lerp(PIR_X - 15, ZX1, k), rx = lerp(PIR_X + 15, ZX2, k);
  zone.moveTo(lx, sy).lineTo(rx, sy).stroke({ width: 1.5, color: 0x6bffa0, alpha: 0.45 });

  // yer radar halqalari (PIR ostida)
  rings.clear();
  for (let r = 1; r <= 3; r++) { const rr = ((t * 26 + r * 26) % 78) + 8; rings.ellipse(PIR_X, GROUND + 4, rr, rr * 0.28).stroke({ width: 1, color: 0x39e06a, alpha: 0.28 * (1 - rr / 90) }); }

  // PIR LED / gumbaz holati
  pirLed.tint = trig ? 0xff2a1a : (ctl.connected ? 0x39ff88 : 0x555555);
  pirLed.alpha = trig ? 1 : (ctl.connected ? 0.5 + 0.5 * Math.sin(t * 4) : 0.4);
  pirGlow.alpha = 0.12 + scene.spotT * 0.7 + (ctl.connected ? 0.05 : 0);

  const playing = ctl.mode !== 'intro' && ctl.connected && !scene.won && !scene.lost;

  // PIR rising edge -> trigger
  const pir = ctl.mode === 'intro' ? (ctl.pir || 0) : (ctl.connected ? (ctl.pir ? 1 : 0) : 0);
  if (pir && !scene.lastPir && !scene.won && !scene.lost) {
    scene.spotT = 0.5; scene.strobeT = 0.35; if (ctl.onTrigger) ctl.onTrigger();
    let best = null, bx = Infinity;
    intruders.forEach((d) => { if (d.dead) return; if (d.x >= ZX1 - 10 && d.x <= ZX2 + 10 && d.x < bx) { bx = d.x; best = d; } });
    if (best) { best.dead = true; best.caught = true; scene.caught++; particles.burst(best.x, best.y, 0x39ff88, 22, 190); particles.burst(best.x, best.y, 0xffffff, 8, 130); if (ctl.onCatch) ctl.onCatch(scene.caught); if (scene.caught >= TARGET && !scene.won && ctl.mode !== 'intro') { scene.won = true; if (ctl.onWin) ctl.onWin(); } }
    else { scene.falseFlash = 0.4; if (ctl.onFalse) ctl.onFalse(); }
  }
  scene.lastPir = pir;

  // spawn
  if (playing) {
    scene.elapsed += dt; const diff = clamp(scene.caught / TARGET, 0, 1);
    scene.spawnT -= dt;
    if (scene.spawnT <= 0) { scene.spawnT = lerp(2.2, 1.1, diff) * (0.8 + Math.random() * 0.5); const d = makeDrone(scene.intruderC); d.x = LW + 40; d.y = 150 + Math.random() * (GROUND - 190); d.speed = lerp(55, 105, diff) * (0.9 + Math.random() * 0.3); scene.intruders.push(d); }
  }

  // dronlar
  for (let i = intruders.length - 1; i >= 0; i--) {
    const d = intruders[i];
    // rotorlar doim aylanadi
    d.rotors.forEach((ro) => { ro.blades.rotation += dt * (46 + ro.seed * 6); ro.disc.alpha = 0.22 + 0.14 * Math.sin(t * 30 + ro.seed * 1.7); });
    if (d.dead) { d.c.alpha -= dt * 2; d.c.y += (d.caught ? 130 : 0) * dt; d.c.rotation += dt * 4; d.beam.alpha = 0; if (d.c.alpha <= 0) { d.c.destroy(); intruders.splice(i, 1); } continue; }
    d.x -= d.speed * dt; d.c.x = d.x; d.c.y = d.y + Math.sin(t * 3 + i) * 5; d.c.rotation = Math.sin(t * 2.4 + i) * 0.05;
    d.eye.alpha = 0.5 + 0.5 * Math.sin(t * 6 + i);
    d.beam.alpha = 0.1 + 0.06 * Math.sin(t * 8 + i);
    const inZone = d.x >= ZX1 - 10 && d.x <= ZX2 + 10;
    d.outline.clear(); if (inZone) { d.outline.roundRect(-28, -20, 56, 42, 8).stroke({ width: 2, color: 0x39ff88, alpha: 0.55 + 0.3 * Math.sin(t * 8) }); }
    d.glow.alpha = inZone ? 0.75 : 0.45; d.glow.tint = inZone ? 0x66ffaa : 0xffffff;
    if (d.x <= GATE_X + 12) { d.dead = true; d.c.destroy(); intruders.splice(i, 1); particles.burst(GATE_X + 22, d.y, 0xff4a2a, 24, 210); scene.strobeT = 0.5; if (ctl.mode !== 'intro') { scene.security = Math.max(0, scene.security - 1); if (ctl.onBreach) ctl.onBreach(scene.security); if (scene.security <= 0 && !scene.lost) { scene.lost = true; if (ctl.onLose) ctl.onLose(); } } }
  }

  // projektor (PIR gumbazidan pastga volumetrik konus)
  scene.spotT = Math.max(0, scene.spotT - dt); scene.falseFlash = Math.max(0, scene.falseFlash - dt * 1.6);
  scene.spot.clear();
  if (scene.spotT > 0) {
    const a = scene.spotT / 0.5;
    scene.spot.poly([PIR_X - 22, ZONE_TOP - 4, PIR_X + 22, ZONE_TOP - 4, ZX2 + 34, GROUND, ZX1 - 34, GROUND]).fill({ color: 0xfff2c0, alpha: a * 0.3 });
    scene.spot.circle(PIR_X, ZONE_TOP - 2, 16).fill({ color: 0xfff2c0, alpha: a * 0.6 });
    scene.spot.ellipse((ZX1 + ZX2) / 2, GROUND + 2, 90, 22).fill({ color: 0xfff2c0, alpha: a * 0.22 });
  }

  // strobe (signal / buzilish / soxta)
  scene.strobeT = Math.max(0, scene.strobeT - dt);
  strobe.tint = scene.falseFlash > 0 ? 0xffc21a : 0xff2a1a;
  strobe.alpha = Math.max(scene.falseFlash * 0.2, scene.strobeT > 0 ? (0.14 * (0.5 + 0.5 * Math.sin(t * 30))) : 0);
  nvTint.alpha = 0.16 + scene.strobeT * 0.1;

  particles.tick(dt);
}
