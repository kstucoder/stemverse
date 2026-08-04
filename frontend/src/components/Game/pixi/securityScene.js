// securityScene — VOLTRA "Xavfsizlik Tizimi" — PIR HARAKAT SENSORI (night-vision).
// Tungi perimetr. Skavenjer dronlar bazaga yaqinlashadi. PIR aniqlash zonasida
// dron bo'lganda qo'lni sensor ustida siltasang (PIR HIGH) -> projektor+signal -> dron
// qaytariladi. Bo'sh zonada siltasang -> soxta signal. Dron darvozaga yetsa -> buzilish.
import { Container, Graphics, Sprite, Texture, TilingSprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000, LH = 560;
const GATE_X = 140, GROUND = 436, ZX1 = 448, ZX2 = 588, TARGET = 10, SECURITY = 4;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

function scanlineTexture() {
  const cv = document.createElement('canvas'); cv.width = 4; cv.height = 4; const c = cv.getContext('2d');
  c.fillStyle = 'rgba(0,0,0,0)'; c.fillRect(0, 0, 4, 4); c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(0, 2, 4, 1); return Texture.from(cv);
}

function makeDrone(parent) {
  const c = new Container();
  const glow = new Sprite(radialTexture('rgba(255,60,40,0.7)', 128)); glow.anchor.set(0.5); glow.width = glow.height = 46; glow.blendMode = 'add'; c.addChild(glow);
  const body = new Graphics();
  body.ellipse(0, 0, 20, 12).fill(0x14181c).stroke({ width: 2, color: 0x3a4650 });
  body.roundRect(-8, -18, 16, 8, 3).fill(0x1a2026);                          // yuqori sensor bloki
  body.moveTo(-20, 2).lineTo(-30, 8).moveTo(20, 2).lineTo(30, 8).stroke({ width: 2, color: 0x2a3640 }); // qo'llar
  c.addChild(body);
  const eye = new Graphics().circle(0, 0, 4).fill(0xff3020); c.addChild(eye);
  const outline = new Graphics(); c.addChild(outline);
  const thr = new Sprite(radialTexture('rgba(120,180,255,0.8)', 128)); thr.anchor.set(0.5, 0); thr.width = 20; thr.height = 26; thr.y = 8; thr.blendMode = 'add'; thr.alpha = 0.4; c.addChild(thr);
  parent.addChild(c);
  return { c, glow, eye, outline, thr };
}

export function assembleSecurity(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.05, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#03070a', '#061014', '#04100e', '#020806'])); skyC.addChild(sky);
  const root = new Container(); app.stage.addChild(root);

  // uzoq baza silueti + tuman
  const city = makeSkyline(90, 0x0a1a16, 21); city.alpha = 0.5; root.addChild(city);
  const fog = new Sprite(radialTexture('rgba(60,120,90,0.1)', 512)); fog.anchor.set(0.5); fog.width = 700; fog.height = 200; fog.x = LW / 2; fog.y = GROUND - 40; fog.blendMode = 'add'; root.addChild(fog);

  // yer
  const ground = new Graphics();
  ground.rect(0, GROUND, LW, LH - GROUND).fill(0x061210).rect(0, GROUND, LW, 3).fill({ color: 0x2a6a4a, alpha: 0.5 });
  for (let x = 0; x < LW; x += 60) ground.moveTo(x, GROUND + 20).lineTo(x - 30, LH).stroke({ width: 1, color: 0x0e2620, alpha: 0.5 });
  root.addChild(ground);

  // darvoza / perimetr devori (chap)
  const gate = new Graphics();
  gate.rect(0, 120, GATE_X, GROUND - 120).fill(0x0c1a18).stroke({ width: 2, color: 0x1f4a3a });
  for (let y = 140; y < GROUND; y += 26) gate.moveTo(0, y).lineTo(GATE_X, y).stroke({ width: 1, color: 0x163a30, alpha: 0.6 });
  for (let x = 18; x < GATE_X; x += 26) gate.moveTo(x, 120).lineTo(x, GROUND).stroke({ width: 3, color: 0x14322a });
  gate.rect(GATE_X - 6, 120, 6, GROUND - 120).fill(0x1f4a3a);
  root.addChild(gate);
  const gateLight = new Sprite(radialTexture('rgba(60,255,160,0.6)', 256)); gateLight.anchor.set(0.5); gateLight.width = 160; gateLight.height = 260; gateLight.x = GATE_X; gateLight.y = GROUND - 120; gateLight.blendMode = 'add'; gateLight.alpha = 0.12; root.addChild(gateLight);

  // aniqlash zonasi (PIR ko'rish maydoni)
  const zone = new Graphics(); root.addChild(zone);
  const intruderC = new Container(); root.addChild(intruderC);

  // projektor (trigger'da yonadi)
  const spot = new Graphics(); spot.blendMode = 'add'; root.addChild(spot);

  const particles = makeParticles(root);

  // night-vision tint + scanlines + grain + strobe + vignette
  const nvTint = new Graphics().rect(0, 0, 10, 10).fill(0x0a5a3a); nvTint.alpha = 0.16; nvTint.blendMode = 'add'; app.stage.addChild(nvTint);
  const scan = new TilingSprite({ texture: scanlineTexture(), width: 10, height: 10 }); scan.alpha = 0.35; app.stage.addChild(scan);
  const strobe = new Graphics().rect(0, 0, 10, 10).fill(0xff2a1a); strobe.alpha = 0; strobe.blendMode = 'add'; app.stage.addChild(strobe);
  const vign = new Sprite(radialVignette()); vign.alpha = 0.7; app.stage.addChild(vign);

  return {
    app, sky, root, city, fog, gateLight, zone, intruderC, spot, particles, nvTint, scan, strobe, vign,
    intruders: [], caught: 0, security: SECURITY, won: false, lost: false,
    lastPir: 0, spawnT: 1.4, spotT: 0, strobeT: 0, elapsed: 0, lastReset: 0, falseFlash: 0,
    spawnDrone(x, y, speed) { const d = makeDrone(this.intruderC); d.x = x; d.y = y; d.speed = speed; this.intruders.push(d); return d; },
    reset() { this.intruders.forEach(d => d.c.destroy()); this.intruders.length = 0; this.caught = 0; this.security = SECURITY; this.won = false; this.lost = false; this.spawnT = 1.4; this.elapsed = 0; },
  };
}

function radialVignette(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.34, size / 2, size / 2, size * 0.6);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,4,2,0.9)'); c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}

// ctl = { pir, connected, mode, resetPulse, onTrigger, onCatch, onFalse, onBreach, onWin, onLose }
export function securityTick(scene, dt, t, ctl) {
  const { app, sky, root, gateLight, zone, spot, intruders, particles, nvTint, scan, strobe, vign } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  [nvTint, strobe].forEach((o) => { o.width = w; o.height = h; }); vign.width = w; vign.height = h;
  scan.width = w; scan.height = h; scan.tilePosition.y = (t * 30) % 4;

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // aniqlash zonasi shimmer
  zone.clear();
  zone.rect(ZX1, 130, ZX2 - ZX1, GROUND - 130).fill({ color: 0x39e06a, alpha: 0.05 + 0.03 * Math.sin(t * 3) });
  zone.moveTo(ZX1, 130).lineTo(ZX1, GROUND).moveTo(ZX2, 130).lineTo(ZX2, GROUND).stroke({ width: 1.5, color: 0x39e06a, alpha: 0.3 });
  const scanY = 130 + ((t * 90) % (GROUND - 130));
  zone.moveTo(ZX1, scanY).lineTo(ZX2, scanY).stroke({ width: 1.5, color: 0x6bffa0, alpha: 0.4 });
  gateLight.alpha = 0.1 + 0.05 * Math.sin(t * 2);

  const playing = ctl.mode !== 'intro' && ctl.connected && !scene.won && !scene.lost;

  // PIR rising edge -> trigger
  const pir = ctl.mode === 'intro' ? (ctl.pir || 0) : (ctl.connected ? (ctl.pir ? 1 : 0) : 0);
  if (pir && !scene.lastPir && !scene.won && !scene.lost) {
    scene.spotT = 0.5; scene.strobeT = 0.35; if (ctl.onTrigger) ctl.onTrigger();
    // zonadagi eng yaqin dronni ushlash
    let best = null, bx = Infinity;
    intruders.forEach((d) => { if (d.dead) return; if (d.x >= ZX1 - 10 && d.x <= ZX2 + 10 && d.x < bx) { bx = d.x; best = d; } });
    if (best) { best.dead = true; best.caught = true; scene.caught++; particles.burst(best.x, best.y, 0x39ff88, 20, 180); particles.burst(best.x, best.y, 0xffffff, 8, 120); if (ctl.onCatch) ctl.onCatch(scene.caught); if (scene.caught >= TARGET && !scene.won && ctl.mode !== 'intro') { scene.won = true; if (ctl.onWin) ctl.onWin(); } }
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
    if (d.dead) { d.c.alpha -= dt * 2; d.c.y += (d.caught ? 120 : 0) * dt; d.c.rotation += dt * 4; if (d.c.alpha <= 0) { d.c.destroy(); intruders.splice(i, 1); } continue; }
    d.x -= d.speed * dt; d.c.x = d.x; d.c.y = d.y + Math.sin(t * 3 + i) * 4;
    d.eye.alpha = 0.5 + 0.5 * Math.sin(t * 6 + i); d.thr.alpha = 0.3 + 0.3 * Math.sin(t * 20 + i);
    const inZone = d.x >= ZX1 - 10 && d.x <= ZX2 + 10;
    d.outline.clear(); if (inZone) d.outline.ellipse(0, 0, 24, 16).stroke({ width: 2, color: 0x39ff88, alpha: 0.6 + 0.3 * Math.sin(t * 8) });
    d.glow.alpha = inZone ? 0.7 : 0.4;
    if (d.x <= GATE_X + 10) { d.dead = true; d.c.destroy(); intruders.splice(i, 1); particles.burst(GATE_X + 20, d.y, 0xff4a2a, 22, 200); scene.strobeT = 0.5; if (ctl.mode !== 'intro') { scene.security = Math.max(0, scene.security - 1); if (ctl.onBreach) ctl.onBreach(scene.security); if (scene.security <= 0 && !scene.lost) { scene.lost = true; if (ctl.onLose) ctl.onLose(); } } }
  }

  // projektor
  scene.spotT = Math.max(0, scene.spotT - dt); scene.falseFlash = Math.max(0, scene.falseFlash - dt * 1.6);
  spot.clear();
  if (scene.spotT > 0) { const a = scene.spotT / 0.5; const cxx = (ZX1 + ZX2) / 2; spot.poly([cxx - 30, 60, cxx + 30, 60, ZX2 + 20, GROUND, ZX1 - 20, GROUND]).fill({ color: 0xfff2c0, alpha: a * 0.28 }); spot.circle(cxx, 60, 14).fill({ color: 0xfff2c0, alpha: a * 0.6 }); }

  // strobe (signal / buzilish / soxta)
  scene.strobeT = Math.max(0, scene.strobeT - dt);
  strobe.tint = scene.falseFlash > 0 ? 0xffc21a : 0xff2a1a;
  strobe.alpha = Math.max(scene.falseFlash * 0.2, scene.strobeT > 0 ? (0.14 * (0.5 + 0.5 * Math.sin(t * 30))) : 0);
  nvTint.alpha = 0.16 + scene.strobeT * 0.1;

  particles.tick(dt);
}
