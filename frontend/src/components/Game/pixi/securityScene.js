// securityScene — VOLTRA "Xavfsizlik Tizimi" — PIR HARAKAT SENSORI.
// REALISTIK TUNGI MUHIT: haqiqiy osmon (oy, yulduzlar, bulutlar, yorug'lik ifloslanishi),
// chuqurlikli shahar (yoritilgan derazalar, radio minoralar) va haqiqiy XAVFSIZLIK BAZASI
// (bino, kuzatuv minorasi, sun'iy yo'ldosh antennalari, prожektor ustunlari, panjara).
// Shiftga o'rnatilgan PIR sensori (Fresnel gumbaz) pastga FOV konus tashlaydi.
// Skavenjer KVADROKOPTER dronlar o'ngdan chapga (bazaga) uchadi. Dron PIR zonasiga kirganda
// qo'lni sensor oldida silt (PIR HIGH) -> prожektor + signal -> dron qaytariladi.
// Bo'sh zonada silt -> soxta signal. Dron bazaga yetsa -> buzilish. 10 dron -> perimetr xavfsiz.
import { Container, Graphics, Sprite, Texture, TilingSprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const GATE_X = 140, GROUND = 436, ZX1 = 448, ZX2 = 588, TARGET = 10, SECURITY = 4;
const PIR_X = (ZX1 + ZX2) / 2, PIR_Y = 96, ZONE_TOP = PIR_Y + 20;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);

function scanlineTexture() {
  const cv = document.createElement('canvas'); cv.width = 4; cv.height = 4; const c = cv.getContext('2d');
  c.fillStyle = 'rgba(0,0,0,0)'; c.fillRect(0, 0, 4, 4); c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(0, 2, 4, 1); return Texture.from(cv);
}

function radialVignette(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.36, size / 2, size / 2, size * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(1,3,6,0.92)'); c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}

// tabiiy tungi osmon gradienti (kosmosdan ufqqacha)
function skyTexture() {
  const cv = document.createElement('canvas'); cv.width = 8; cv.height = 512; const c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.00, '#04070f'); g.addColorStop(0.35, '#0a1224'); g.addColorStop(0.62, '#132038');
  g.addColorStop(0.82, '#24304a'); g.addColorStop(0.94, '#3a4258'); g.addColorStop(1.00, '#4a4a52');
  c.fillStyle = g; c.fillRect(0, 0, 8, 512); return Texture.from(cv);
}

// ---------- OY (halo + gradient disk + kraterlar) ----------
function makeMoon(parent, x, y, r) {
  const c = new Container(); c.x = x; c.y = y;
  const halo = new Sprite(radialTexture('rgba(200,220,255,0.22)', 512)); halo.anchor.set(0.5); halo.width = halo.height = r * 9; halo.blendMode = 'add'; c.addChild(halo);
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const ctx = cv.getContext('2d');
  const mg = ctx.createRadialGradient(54, 50, r * 0.2, 64, 64, 64);
  mg.addColorStop(0, '#fdfdf6'); mg.addColorStop(0.6, '#e6ecf2'); mg.addColorStop(1, '#c2cede');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(64, 64, 60, 0, 7); ctx.fill();
  ctx.globalAlpha = 0.10; ctx.fillStyle = '#8fa0b8';
  for (let i = 0; i < 12; i++) { const a = Math.random() * 7, rr = Math.random() * 46, cr = 3 + Math.random() * 9; ctx.beginPath(); ctx.arc(64 + Math.cos(a) * rr, 64 + Math.sin(a) * rr, cr, 0, 7); ctx.fill(); }
  const disc = new Sprite(Texture.from(cv)); disc.anchor.set(0.5); disc.width = disc.height = r * 2; c.addChild(disc);
  parent.addChild(c);
}

// ---------- YULDUZLAR (statik dala + miltillovchi yorug'lar + somon yo'li) ----------
function makeStars(parent) {
  const g = new Graphics();
  for (let i = 0; i < 260; i++) { const sx = Math.random() * LW, sy = Math.pow(Math.random(), 1.3) * (GROUND - 40); g.circle(sx, sy, Math.random() * 0.9 + 0.25).fill({ color: 0xdfeaff, alpha: 0.12 + Math.random() * 0.4 }); }
  parent.addChild(g);
  const tw = [];
  for (let i = 0; i < 34; i++) { const s = new Graphics().circle(0, 0, Math.random() * 1.1 + 0.7).fill(0xffffff); s.x = Math.random() * LW; s.y = Math.random() * (GROUND - 90); s.blendMode = 'add'; parent.addChild(s); tw.push({ s, base: 0.5 + Math.random() * 0.5, phase: Math.random() * 6.28, sp: 1.5 + Math.random() * 2.5 }); }
  return tw;
}

// ---------- BULUTLAR (yumshoq, oy nuridan yoritilgan) ----------
function makeCloud(parent, x, y, scale, alpha) {
  const c = new Container(); c.x = x; c.y = y; c.scale.set(scale);
  for (let i = 0; i < 5; i++) { const p = new Sprite(radialTexture('rgba(30,42,66,1)', 256)); p.anchor.set(0.5); p.width = rnd(120, 200); p.height = rnd(46, 70); p.x = rnd(-70, 70); p.y = rnd(-10, 10); p.alpha = alpha; c.addChild(p); }
  const hi = new Sprite(radialTexture('rgba(150,170,210,0.5)', 256)); hi.anchor.set(0.5); hi.width = 150; hi.height = 30; hi.y = -14; hi.blendMode = 'add'; hi.alpha = alpha * 0.5; c.addChild(hi);
  parent.addChild(c);
  return { c, sp: rnd(3, 8) };
}

// ---------- SHAHAR QATLAMI (siluet + yoritilgan derazalar) ----------
// blinker (aviatsiya ogohlantirish chiroqlari) pozitsiyalarini qaytaradi
function paintCity(g, cfg) {
  const blinks = []; let x = cfg.x0, i = 0;
  while (x < cfg.x1) {
    const w = rnd(cfg.wMin, cfg.wMax), h = rnd(cfg.hMin, cfg.hMax), top = cfg.groundY - h;
    g.rect(x, top, w, h).fill(cfg.color);
    g.rect(x, top, 2, h).fill({ color: cfg.edge, alpha: 0.4 });          // oy tomon yorug' qirra
    g.rect(x, top, w, 2).fill({ color: cfg.edge, alpha: 0.28 });
    if (cfg.windows) {
      for (let wy = top + 9; wy < cfg.groundY - 8; wy += 12)
        for (let wx = x + 6; wx < x + w - 8; wx += 11) {
          if (Math.random() > cfg.fill) continue;
          const lit = Math.random() < cfg.lit;
          const col = lit ? (Math.random() < 0.72 ? 0xffcf94 : 0x9fd0ff) : 0x0b1420;
          g.rect(wx, wy, 7, 6).fill({ color: col, alpha: lit ? 0.85 : 0.5 });
        }
    } else {
      for (let n = 0; n < cfg.dots; n++) if (Math.random() < 0.5) g.rect(x + 2 + Math.random() * (w - 4), top + 4 + Math.random() * (h - 8), 1.5, 1.5).fill({ color: 0xffd8a0, alpha: 0.4 });
    }
    if (cfg.towers && Math.random() < 0.3) { const tx = x + w / 2, mh = rnd(20, 42); g.moveTo(tx, top).lineTo(tx, top - mh).stroke({ width: 1.5, color: cfg.color }); blinks.push({ x: tx, y: top - mh }); }
    x += w + rnd(cfg.gapMin, cfg.gapMin + cfg.gapVar); i++;
  }
  return blinks;
}

// ---------- XAVFSIZLIK BAZASI (bino + minora + antennalar + prожektorlar) ----------
function makeBase(parent) {
  const g = new Graphics();
  // asosiy bino (beton blok, yoritilgan ofis derazalari)
  g.rect(596, GROUND - 154, 6, 6).fill(0x1a2636);
  g.rect(600, GROUND - 150, 214, 150).fill(0x0e1620).stroke({ width: 1.5, color: 0x223244 });
  g.rect(600, GROUND - 150, 3, 150).fill({ color: 0x3a4a5e, alpha: 0.45 });
  g.rect(596, GROUND - 156, 222, 7).fill(0x18222f);                     // tom parapeti
  for (let ry = GROUND - 138; ry < GROUND - 12; ry += 16)
    for (let cx = 612; cx < 806; cx += 15) { const lit = Math.random() < 0.5; g.rect(cx, ry, 9, 9).fill({ color: lit ? (Math.random() < 0.6 ? 0xffcf94 : 0x9fd0ff) : 0x0a1018, alpha: lit ? 0.85 : 0.5 }); }
  // tom uskunalari (konditsioner bloklari)
  g.rect(636, GROUND - 168, 28, 13).fill(0x141d28).rect(700, GROUND - 172, 34, 17).fill(0x141d28).rect(760, GROUND - 166, 22, 11).fill(0x141d28);

  // kuzatuv minorasi (o'ng)
  g.rect(842, GROUND - 214, 30, 214).fill(0x0c141d).stroke({ width: 1.5, color: 0x223244 });
  g.rect(842, GROUND - 214, 2, 214).fill({ color: 0x3a4a5e, alpha: 0.4 });
  g.rect(832, GROUND - 224, 50, 24).fill(0x111c28).stroke({ width: 1.5, color: 0x2a3a4a }); // shisha kabina
  g.rect(835, GROUND - 220, 44, 14).fill({ color: 0x9fd0ff, alpha: 0.6 });                  // kabina yorug'i
  g.rect(830, GROUND - 202, 54, 4).fill(0x18222f);
  g.moveTo(857, GROUND - 246).lineTo(857, GROUND - 224).stroke({ width: 2.5, color: 0x2a3a4a }); // mast

  // radio-mast (chap, panjara ustidan) — truss minora
  const mx = 512, mtop = GROUND - 256;
  g.moveTo(mx - 12, GROUND - 150).lineTo(mx, mtop).lineTo(mx + 12, GROUND - 150).stroke({ width: 2, color: 0x2a3a4a });
  for (let yy = GROUND - 150; yy > mtop + 8; yy -= 22) { const k = (GROUND - 150 - yy) / (GROUND - 150 - mtop); const hw = 12 * (1 - k * 0.85); g.moveTo(mx - hw, yy).lineTo(mx + hw, yy - 11).moveTo(mx + hw, yy).lineTo(mx - hw, yy - 11).stroke({ width: 1, color: 0x24313f }); }

  // sun'iy yo'ldosh antennalari (tomda)
  g.ellipse(660, GROUND - 176, 20, 12).fill(0x1a2836).stroke({ width: 1.5, color: 0x33475a }); g.moveTo(660, GROUND - 176).lineTo(672, GROUND - 190).stroke({ width: 1.5, color: 0x33475a }); g.circle(672, GROUND - 190, 2).fill(0xaad4ff);
  g.ellipse(756, GROUND - 182, 15, 9).fill(0x1a2836).stroke({ width: 1.5, color: 0x33475a });

  parent.addChild(g);

  // chaqnovchi mayoqlar (minora + mast + antenna uchi)
  const beacons = [];
  [{ x: 857, y: GROUND - 250 }, { x: mx, y: mtop - 2 }].forEach((p) => { const b = new Graphics().circle(0, 0, 2.6).fill(0xff3020); b.blendMode = 'add'; b.x = p.x; b.y = p.y; parent.addChild(b); beacons.push({ b, phase: Math.random() * 6.28, sp: 1.4 + Math.random() }); });

  return { beacons };
}

// ---------- PROЖEKTOR USTUNI (perimetr yoritish + volumetrik nur) ----------
function makeFloodPole(parent, x) {
  const c = new Container(); c.x = x; c.y = GROUND;
  const pole = new Graphics().moveTo(0, 0).lineTo(0, -122).stroke({ width: 3, color: 0x1a2430 }); c.addChild(pole);
  const arm = new Graphics().moveTo(0, -122).lineTo(10, -128).stroke({ width: 3, color: 0x1a2430 }); c.addChild(arm);
  const beam = new Graphics().poly([-2, -126, 16, -126, 78, 120, -58, 120]).fill({ color: 0xffe6a8, alpha: 0.1 }); beam.blendMode = 'add'; c.addChild(beam);
  const head = new Graphics().roundRect(-4, -134, 22, 11, 3).fill(0x141c26).stroke({ width: 1, color: 0x2a3a4a }); c.addChild(head);
  const lamp = new Sprite(radialTexture('rgba(255,236,176,0.9)', 128)); lamp.anchor.set(0.5); lamp.x = 7; lamp.y = -128; lamp.width = lamp.height = 26; lamp.blendMode = 'add'; c.addChild(lamp);
  const pool = new Sprite(radialTexture('rgba(255,232,170,0.5)', 256)); pool.anchor.set(0.5); pool.x = 10; pool.y = 118; pool.width = 200; pool.height = 44; pool.blendMode = 'add'; pool.alpha = 0.22; c.addChild(pool);
  parent.addChild(c);
  return { beam, lamp, phase: Math.random() * 6.28 };
}

// ---------- KVADROKOPTER DRON ----------
function makeDrone(parent) {
  const c = new Container();
  const glow = new Sprite(radialTexture('rgba(255,72,44,0.5)', 128)); glow.anchor.set(0.5); glow.width = glow.height = 74; glow.blendMode = 'add'; c.addChild(glow);
  const A = 23, AH = 11;
  const frame = new Graphics();
  frame.moveTo(-A, -AH).lineTo(A, AH).moveTo(-A, AH).lineTo(A, -AH).stroke({ width: 3.5, color: 0x252c34 });
  frame.moveTo(-A, -AH).lineTo(A, AH).moveTo(-A, AH).lineTo(A, -AH).stroke({ width: 1, color: 0x3d4a56 });
  c.addChild(frame);
  const rotors = [];
  [[-A, -AH], [A, AH], [-A, AH], [A, -AH]].forEach(([rx, ry], k) => {
    const r = new Container(); r.x = rx; r.y = ry;
    const disc = new Sprite(radialTexture('rgba(150,190,255,0.4)', 64)); disc.anchor.set(0.5); disc.width = disc.height = 24; disc.blendMode = 'add'; r.addChild(disc);
    const ring = new Graphics().circle(0, 0, 12).stroke({ width: 1.5, color: 0x33404b }); r.addChild(ring);
    const blades = new Graphics(); blades.ellipse(0, 0, 12, 2.4).fill({ color: 0x9fc0ff, alpha: 0.55 }); blades.ellipse(0, 0, 2.4, 12).fill({ color: 0x9fc0ff, alpha: 0.55 }); r.addChild(blades);
    const hub = new Graphics().circle(0, 0, 2.6).fill(0x1a2028); r.addChild(hub);
    c.addChild(r); rotors.push({ blades, disc, seed: k });
  });
  const body = new Graphics();
  body.roundRect(-14, -10, 28, 20, 6).fill(0x161c22).stroke({ width: 2, color: 0x3a4650 });
  body.roundRect(-14, -10, 28, 8, 5).fill({ color: 0x232c34, alpha: 0.9 });
  body.moveTo(-9, -2).lineTo(9, -2).stroke({ width: 1, color: 0x2a3640 });
  c.addChild(body);
  const nav = new Graphics(); nav.circle(-A, -AH, 2).fill(0xff2e2e).circle(A, -AH, 2).fill(0x2eff6a); c.addChild(nav);
  const eyeHousing = new Graphics().circle(0, 11, 5.5).fill(0x0b1015).stroke({ width: 1.5, color: 0x2a3640 }); c.addChild(eyeHousing);
  const eye = new Graphics().circle(0, 11, 3.2).fill(0xff2e1e); c.addChild(eye);
  const beam = new Graphics(); beam.poly([-5, 15, 5, 15, 20, 70, -20, 70]).fill({ color: 0x33e0ff, alpha: 0.14 }); beam.blendMode = 'add'; c.addChild(beam);
  const outline = new Graphics(); c.addChild(outline);
  parent.addChild(c);
  return { c, glow, rotors, eye, beam, nav, outline };
}

// ---------- uzoq sweep-projektor (baza tomon, oq nur) ----------
function makeSearchlight(parent, x, phase) {
  const c = new Container(); c.x = x; c.y = 46;
  const cone = new Graphics().poly([0, 0, -60, 380, 60, 380]).fill({ color: 0xdfeaf5, alpha: 0.06 }); cone.blendMode = 'add'; c.addChild(cone);
  const src = new Sprite(radialTexture('rgba(220,235,255,0.6)', 128)); src.anchor.set(0.5); src.width = src.height = 28; src.blendMode = 'add'; c.addChild(src);
  parent.addChild(c);
  return { c, cone, phase };
}

export function assembleSecurity(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.55, bloomScale: 1.0, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(skyTexture()); skyC.addChild(sky);
  const root = new Container(); app.stage.addChild(root);

  // OSMON: somon yo'li + yulduzlar + oy + bulutlar
  const milky = new Sprite(radialTexture('rgba(120,150,210,0.1)', 512)); milky.anchor.set(0.5); milky.width = 900; milky.height = 240; milky.x = 560; milky.y = 150; milky.rotation = -0.5; milky.blendMode = 'add'; root.addChild(milky);
  const starTw = makeStars(root);
  makeMoon(root, 806, 96, 34);
  const clouds = [makeCloud(root, 260, 120, 1.1, 0.5), makeCloud(root, 620, 74, 0.85, 0.42), makeCloud(root, 900, 150, 1.25, 0.55), makeCloud(root, 120, 200, 0.9, 0.4)];

  // ufq yorug'lik ifloslanishi (shahar issiq porlashi)
  const horizonGlow = new Sprite(radialTexture('rgba(255,180,110,0.16)', 512)); horizonGlow.anchor.set(0.5); horizonGlow.width = LW * 1.2; horizonGlow.height = 260; horizonGlow.x = LW / 2; horizonGlow.y = GROUND + 20; horizonGlow.blendMode = 'add'; root.addChild(horizonGlow);

  // uzoq sweep projektorlar (osmonda)
  const searchlights = [makeSearchlight(root, 240, 0), makeSearchlight(root, 740, 2.3)];

  // SHAHAR: uzoq (atmosfera) -> o'rta (yoritilgan)
  const farG = new Graphics(); paintCity(farG, { x0: -20, x1: LW + 20, groundY: GROUND - 6, wMin: 26, wMax: 60, hMin: 40, hMax: 120, color: 0x0c1626, edge: 0x1c2c44, windows: false, dots: 5, towers: false, gapMin: 4, gapVar: 10 }); farG.alpha = 0.7; root.addChild(farG);
  const haze = new Sprite(radialTexture('rgba(30,50,80,0.5)', 512)); haze.anchor.set(0.5); haze.width = LW * 1.3; haze.height = 200; haze.x = LW / 2; haze.y = GROUND - 40; root.addChild(haze);
  const midG = new Graphics(); const midBlinks = paintCity(midG, { x0: -20, x1: LW + 20, groundY: GROUND, wMin: 40, wMax: 88, hMin: 70, hMax: 190, color: 0x0a121e, edge: 0x2a3c54, windows: true, fill: 0.85, lit: 0.4, towers: true, gapMin: 6, gapVar: 16 }); root.addChild(midG);
  const cityBlink = [];
  midBlinks.forEach((p) => { const b = new Graphics().circle(0, 0, 2.2).fill(0xff3b3b); b.blendMode = 'add'; b.x = p.x; b.y = p.y; root.addChild(b); cityBlink.push({ b, phase: Math.random() * 6.28, sp: 1.3 + Math.random() * 0.8 }); });

  // XAVFSIZLIK BAZASI
  const base = makeBase(root);

  // prожektor ustunlari (perimetr)
  const floodPoles = [makeFloodPole(root, 92), makeFloodPole(root, 300), makeFloodPole(root, 882)];

  // yer (ho'l beton + shahar aksi + belgilar)
  const ground = new Graphics();
  ground.rect(0, GROUND, LW, LH - GROUND).fill(0x070d12);
  ground.rect(0, GROUND, LW, 3).fill({ color: 0x2a4a5a, alpha: 0.5 });
  for (let rx = 60; rx < LW; rx += 96) ground.rect(rx, GROUND, 10, (LH - GROUND) * rnd(0.4, 0.9)).fill({ color: 0xffdca0, alpha: 0.05 }); // ho'l aks
  for (let x = -220; x < LW + 220; x += 66) ground.moveTo(x, GROUND).lineTo((x - LW / 2) * 2.5 + LW / 2, LH).stroke({ width: 1, color: 0x11202a, alpha: 0.5 });
  for (let i = 1; i <= 4; i++) { const yy = GROUND + (LH - GROUND) * (i / 4) * (i / 4); ground.moveTo(0, yy).lineTo(LW, yy).stroke({ width: 1, color: 0x11202a, alpha: 0.4 }); }
  root.addChild(ground);

  // yer tumani (mist)
  const fogs = [];
  for (let i = 0; i < 4; i++) { const f = new Sprite(radialTexture('rgba(120,150,180,0.1)', 512)); f.anchor.set(0.5); f.width = rnd(460, 700); f.height = rnd(120, 190); f.x = Math.random() * LW; f.y = GROUND - rnd(10, 60); f.blendMode = 'add'; root.addChild(f); fogs.push({ s: f, sp: rnd(8, 22) }); }

  // aniqlash maydoni ostidagi hazard bo'yoq
  const hazard = new Graphics();
  hazard.poly([ZX1, GROUND, ZX2, GROUND, ZX2 + 34, LH, ZX1 - 34, LH]).fill({ color: 0x0a2a1c, alpha: 0.55 });
  for (let s = -40; s < 220; s += 26) hazard.poly([ZX1 + s, GROUND, ZX1 + s + 12, GROUND, ZX1 + s - 20, LH, ZX1 + s - 32, LH]).fill({ color: 0x143a26, alpha: 0.45 });
  hazard.moveTo(ZX1, GROUND).lineTo(ZX1 - 34, LH).moveTo(ZX2, GROUND).lineTo(ZX2 + 34, LH).stroke({ width: 2, color: 0x39e06a, alpha: 0.26 });
  root.addChild(hazard);

  // DARVOZA + PANJARA (chap perimetr)
  const gate = new Graphics();
  gate.rect(0, 110, GATE_X, GROUND - 110).fill(0x0b1816).stroke({ width: 2, color: 0x1f4a3a });
  for (let y = 122; y < GROUND; y += 16) gate.moveTo(6, y).lineTo(GATE_X - 6, y + 10).stroke({ width: 1, color: 0x163a30, alpha: 0.55 });
  for (let y = 122; y < GROUND; y += 16) gate.moveTo(GATE_X - 6, y).lineTo(6, y + 10).stroke({ width: 1, color: 0x163a30, alpha: 0.55 });
  gate.rect(GATE_X - 8, 104, 10, GROUND - 100).fill(0x1f4a3a); gate.rect(-4, 104, 10, GROUND - 100).fill(0x143228);
  for (let y = 116; y < GROUND; y += 22) gate.rect(GATE_X - 8, y, 10, 11).fill({ color: 0xffb020, alpha: 0.5 });
  root.addChild(gate);
  const gateLight = new Sprite(radialTexture('rgba(60,255,160,0.6)', 256)); gateLight.anchor.set(0.5); gateLight.width = 170; gateLight.height = 300; gateLight.x = GATE_X; gateLight.y = GROUND - 130; gateLight.blendMode = 'add'; gateLight.alpha = 0.12; root.addChild(gateLight);
  const gateLamp = new Graphics().circle(GATE_X - 3, 112, 5).fill(0xff5a3a); gateLamp.blendMode = 'add'; root.addChild(gateLamp);

  // radar halqalari + PIR konus (zona)
  const rings = new Graphics(); root.addChild(rings);
  const zone = new Graphics(); root.addChild(zone);

  // PIR SENSOR BLOKI (shiftga o'rnatilgan Fresnel gumbaz)
  const pirUnit = new Container(); pirUnit.x = PIR_X; pirUnit.y = PIR_Y; root.addChild(pirUnit);
  const mount = new Graphics();
  mount.rect(-4, -PIR_Y, 8, PIR_Y - 8).fill(0x14201c);
  mount.roundRect(-18, -10, 36, 16, 4).fill(0x101815).stroke({ width: 1.5, color: 0x2a4a3c });
  pirUnit.addChild(mount);
  const pirGlow = new Sprite(radialTexture('rgba(120,255,180,0.7)', 128)); pirGlow.anchor.set(0.5); pirGlow.y = 8; pirGlow.width = pirGlow.height = 56; pirGlow.blendMode = 'add'; pirGlow.alpha = 0.15; pirUnit.addChild(pirGlow);
  const dome = new Graphics();
  dome.ellipse(0, 8, 15, 13).fill(0xdfeee6).stroke({ width: 1.5, color: 0x8fbfa8 });
  for (let i = -2; i <= 2; i++) dome.moveTo(i * 5, -2).lineTo(i * 5, 18).stroke({ width: 0.8, color: 0xb8d8c8, alpha: 0.6 });
  for (let j = 2; j <= 18; j += 4) dome.moveTo(-14, j).lineTo(14, j).stroke({ width: 0.8, color: 0xb8d8c8, alpha: 0.5 });
  pirUnit.addChild(dome);
  const pirLed = new Graphics().circle(11, -2, 2.4).fill(0xff3020); pirUnit.addChild(pirLed);

  const intruderC = new Container(); root.addChild(intruderC);
  const spot = new Graphics(); spot.blendMode = 'add'; root.addChild(spot);
  const particles = makeParticles(root);

  // kamera overlaylari (yumshoq — realistik muhit ko'rinsin)
  const nvTint = new Graphics().rect(0, 0, 10, 10).fill(0x0a3a4a); nvTint.alpha = 0.06; nvTint.blendMode = 'add'; app.stage.addChild(nvTint);
  const scan = new TilingSprite({ texture: scanlineTexture(), width: 10, height: 10 }); scan.alpha = 0.16; app.stage.addChild(scan);
  const strobe = new Graphics().rect(0, 0, 10, 10).fill(0xff2a1a); strobe.alpha = 0; strobe.blendMode = 'add'; app.stage.addChild(strobe);
  const vign = new Sprite(radialVignette()); vign.alpha = 0.72; app.stage.addChild(vign);

  return {
    app, sky, root, starTw, clouds, searchlights, cityBlink, base, floodPoles, fogs, gateLight, gateLamp, rings, zone, pirGlow, pirLed, intruderC, spot, particles, nvTint, scan, strobe, vign,
    intruders: [], caught: 0, security: SECURITY, won: false, lost: false,
    lastPir: 0, spawnT: 1.4, spotT: 0, strobeT: 0, elapsed: 0, lastReset: 0, falseFlash: 0,
    spawnDrone(x, y, speed) { const d = makeDrone(this.intruderC); d.x = x; d.y = y; d.speed = speed; this.intruders.push(d); return d; },
    reset() { this.intruders.forEach(d => d.c.destroy()); this.intruders.length = 0; this.caught = 0; this.security = SECURITY; this.won = false; this.lost = false; this.spawnT = 1.4; this.elapsed = 0; },
  };
}

// ctl = { pir, connected, mode, resetPulse, onTrigger, onCatch, onFalse, onBreach, onWin, onLose }
export function securityTick(scene, dt, t, ctl) {
  const { app, sky, root, starTw, clouds, searchlights, cityBlink, base, floodPoles, fogs, gateLight, gateLamp, rings, zone, pirGlow, pirLed, intruders, particles, nvTint, scan, strobe, vign } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  [nvTint, strobe].forEach((o) => { o.width = w; o.height = h; }); vign.width = w; vign.height = h;
  scan.width = w; scan.height = h; scan.tilePosition.y = (t * 30) % 4;

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // OSMON animatsiyasi
  starTw.forEach((o) => { o.s.alpha = o.base * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * o.sp + o.phase))); });
  clouds.forEach((o) => { o.c.x -= o.sp * dt; if (o.c.x < -260) o.c.x = LW + 260; });
  searchlights.forEach((s) => { s.c.rotation = Math.sin(t * 0.24 + s.phase) * 0.5; s.cone.alpha = 0.04 + 0.03 * (0.5 + 0.5 * Math.sin(t * 0.8 + s.phase)); });
  cityBlink.forEach((o) => { o.b.alpha = (Math.sin(t * o.sp + o.phase) > 0.55) ? 0.95 : 0.12; });
  base.beacons.forEach((o) => { o.b.alpha = (Math.sin(t * o.sp + o.phase) > 0.3) ? 1 : 0.14; });
  floodPoles.forEach((o) => { const fl = 0.9 + 0.1 * Math.sin(t * 22 + o.phase) + (Math.random() < 0.01 ? -0.3 : 0); o.beam.alpha = 0.09 * fl; o.lamp.alpha = fl; });
  fogs.forEach((f) => { f.s.x -= f.sp * dt; if (f.s.x < -300) f.s.x = LW + 300; });
  gateLight.alpha = 0.1 + 0.05 * Math.sin(t * 2);
  gateLamp.alpha = 0.5 + 0.5 * Math.abs(Math.sin(t * 3));

  const trig = scene.spotT > 0;

  // PIR aniqlash konusi (FOV) + skanerlash sweep
  zone.clear();
  const coneA = (trig ? 0.16 : 0.05) + 0.02 * Math.sin(t * 3);
  zone.poly([PIR_X - 15, ZONE_TOP, PIR_X + 15, ZONE_TOP, ZX2, GROUND, ZX1, GROUND]).fill({ color: 0x2ee06a, alpha: coneA });
  zone.moveTo(PIR_X - 15, ZONE_TOP).lineTo(ZX1, GROUND).moveTo(PIR_X + 15, ZONE_TOP).lineTo(ZX2, GROUND).stroke({ width: 1.5, color: 0x39e06a, alpha: 0.3 + (trig ? 0.3 : 0) });
  const k = (t * 0.55) % 1; const sy = lerp(ZONE_TOP, GROUND, k);
  const lx = lerp(PIR_X - 15, ZX1, k), rx = lerp(PIR_X + 15, ZX2, k);
  zone.moveTo(lx, sy).lineTo(rx, sy).stroke({ width: 1.5, color: 0x6bffa0, alpha: 0.45 });

  rings.clear();
  for (let r = 1; r <= 3; r++) { const rr = ((t * 26 + r * 26) % 78) + 8; rings.ellipse(PIR_X, GROUND + 4, rr, rr * 0.28).stroke({ width: 1, color: 0x39e06a, alpha: 0.28 * (1 - rr / 90) }); }

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
  nvTint.alpha = 0.06 + scene.strobeT * 0.1;

  particles.tick(dt);
}
