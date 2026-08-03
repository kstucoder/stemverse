// shieldScene — VOLTRA "Osmon Qalqoni" PixiJS olami (yangi mexanika).
// Digital Twin: ultrasonik sensor (DIST) = ENERGIYA QALQONI balandligi.
// Qo'l yaqin/uzoq -> qalqon plitasi tik relsda pastga/tepaga suriladi.
// O'ngdan kelayotgan meteorni to'g'ri balandlikda kutib olib QAYTAR.
// O'tib ketsa -> mahalla qorayadi, yurak kamayadi. 4 LED = balandlik darajasi.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
export const RAIL_X = 250, RAIL_TOP = 66, RAIL_BOT = 430;
export const CITY_X = 150;                 // meteor bu chiziqqa yetsa -> mahallaga uriladi
export const PLATE_H = 96, CATCH_TOL = 58; // ushlash tolerantligi (bolabop, saxiy)
// kalibrlash: qo'l masofasi (sm) -> plita y. Uzoq(baland qo'l) -> tepa.
export const CAL_NEAR = 7, CAL_FAR = 55;

const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mapRange = (v, a, b, c, d) => c + (clamp(v, Math.min(a, b), Math.max(a, b)) - a) * (d - c) / (b - a);

/* ---------- meteor ---------- */
function makeMeteor(parent, tex) {
  const c = new Container();
  const trail = new Sprite(tex); trail.anchor.set(0.5); trail.width = 120; trail.height = 26; trail.tint = 0xff8a3a; trail.blendMode = 'add'; trail.x = 42;
  const glow = new Sprite(tex); glow.anchor.set(0.5); glow.width = glow.height = 54; glow.tint = 0xffb060; glow.blendMode = 'add';
  const core = new Graphics();
  { const pts = []; for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28; const r = 9 + Math.random() * 4; pts.push(Math.cos(a) * r, Math.sin(a) * r); } core.poly(pts).fill(0x3a2a1e).stroke({ width: 1.5, color: 0xffcaa0, alpha: 0.9 }); }
  c.addChild(trail, glow, core);
  parent.addChild(c);
  return { c, glow, core, trail };
}

/* ---------- mahalla (himoya qilinadigan) ---------- */
function makeDistrict(x, w) {
  const c = new Container(); c.x = x;
  const glow = new Sprite(radialTexture('rgba(255,210,120,0.5)', 256)); glow.anchor.set(0.5, 1); glow.width = w * 1.6; glow.height = 90; glow.y = LH - 8; glow.blendMode = 'add';
  const body = new Graphics();
  const wins = [];
  let bx = 6;
  while (bx < w - 20) {
    const bw = 26 + Math.random() * 22, bh = 40 + Math.random() * 96;
    body.rect(bx, LH - 40 - bh, bw, bh).fill(0x0b1a24).rect(bx, LH - 40 - bh, bw, bh).stroke({ width: 1, color: 0x1d4a5a, alpha: 0.5 });
    const cols = Math.max(1, Math.floor(bw / 12)), rows = Math.max(2, Math.floor(bh / 16));
    for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) {
      if (Math.random() < 0.25) continue;
      const wg = new Graphics().rect(0, 0, 5, 6).fill(Math.random() < 0.3 ? 0x9fe8ff : 0xffd27a);
      wg.x = bx + 5 + cc * 12; wg.y = LH - 40 - bh + 7 + r * 16; wg.alpha = 0.4 + Math.random() * 0.5;
      wins.push({ g: wg, b: wg.alpha, sp: 0.5 + Math.random() * 2, ph: Math.random() * 6.28 });
    }
    bx += bw + 10;
  }
  c.addChild(glow, body);
  wins.forEach((wn) => c.addChild(wn.g));
  return { c, glow, wins, alive: true, x, w };
}

export function assembleShield(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.45, bloomScale: 1.1, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  // osmon
  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#020a12', '#04121f', '#051a22', '#02090e'])); skyC.addChild(sky);
  const starC = new Container(); skyC.addChild(starC);
  const stars = [];
  for (let i = 0; i < 80; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.3).fill(0xbfeee0); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random() * 0.55, b: 0.3 + Math.random() * 0.45, sp: 0.6 + Math.random() * 2, ph: Math.random() * 6.28 }); }

  const root = new Container(); app.stage.addChild(root);

  // himoya gumbazi (energiya arki) — shahar ustida
  const domeGlow = new Sprite(radialTexture('rgba(57,255,208,0.14)', 512)); domeGlow.anchor.set(0.5, 1); domeGlow.width = 900; domeGlow.height = 520; domeGlow.x = LW / 2; domeGlow.y = LH; domeGlow.blendMode = 'add'; root.addChild(domeGlow);
  const dome = new Graphics(); root.addChild(dome);

  // mahallalar
  const districts = [];
  const DN = 5, dw = LW / DN;
  for (let i = 0; i < DN; i++) { const d = makeDistrict(i * dw, dw); root.addChild(d.c); districts.push(d); }

  // meteor teksturasi + pool
  const mtex = radialTexture('rgba(255,255,255,0.9)', 128);
  const meteorC = new Container(); root.addChild(meteorC);
  const meteors = [];

  const particles = makeParticles(root);

  // qalqon plitasi (tik rels)
  const railG = new Graphics(); root.addChild(railG);
  railG.moveTo(RAIL_X, RAIL_TOP).lineTo(RAIL_X, RAIL_BOT).stroke({ width: 2, color: 0x1f6a58, alpha: 0.3 });
  const teleG = new Graphics(); root.addChild(teleG);   // meteor tushish balandligi markerlari
  const plate = new Container(); plate.x = RAIL_X; root.addChild(plate);
  const plateGlow = new Sprite(radialTexture('rgba(57,255,208,0.7)', 256)); plateGlow.anchor.set(0.5); plateGlow.width = 150; plateGlow.height = PLATE_H + 70; plateGlow.blendMode = 'add'; plate.addChild(plateGlow);
  const plateBody = new Graphics();
  plateBody.roundRect(-13, -PLATE_H / 2, 26, PLATE_H, 8).fill({ color: 0x0a2e2a, alpha: 0.9 });
  plateBody.roundRect(-13, -PLATE_H / 2, 26, PLATE_H, 8).stroke({ width: 2.5, color: 0x39ffd0, alpha: 0.95 });
  for (let i = -1; i <= 1; i++) plateBody.moveTo(-9, i * 22).lineTo(9, i * 22).stroke({ width: 1.5, color: 0x6affe0, alpha: 0.5 });
  plate.addChild(plateBody);
  const ripple = new Graphics(); plate.addChild(ripple);

  // 4 daraja LED (plita yonida)
  const leds = [];
  const ledC = new Container(); ledC.x = RAIL_X - 46; root.addChild(ledC);
  for (let i = 0; i < 4; i++) { const g = new Graphics(); ledC.addChild(g); leds.push({ g, y: RAIL_BOT - 12 - i * 26 }); }

  return {
    app, sky, starC, stars, root, dome, domeGlow, districts, meteorC, meteors, mtex,
    plate, plateGlow, plateBody, ripple, railG, teleG, leds, particles,
    // holat
    plateY: (RAIL_TOP + RAIL_BOT) / 2, plateTargetY: (RAIL_TOP + RAIL_BOT) / 2,
    hearts: 3, blocked: 0, target: 12, won: false, lost: false,
    spawnT: 1.2, elapsed: 0, rippleT: 0, domePulse: 0, warnAcc: 0, lastReset: 0,
    // intro/tashqi boshqaruv uchun
    spawnMeteor(y, speed) {
      const m = makeMeteor(this.meteorC, this.mtex);
      m.c.x = LW + 50; m.c.y = clamp(y, RAIL_TOP + 10, RAIL_BOT - 10);
      m.spd = speed || 175; m.blocked = false; m.dead = false; m.tele = 1; m.deflect = 0;
      this.meteors.push(m);
      return m;
    },
    // fon meteori (ulanmaganda ko'rinish uchun) — o'yin mantig'iga ta'sir qilmaydi
    spawnAmbient(y, speed) {
      const m = this.spawnMeteor(y, speed);
      m.ambient = true; m.c.y = y; m.c.scale.set(0.68); m.c.alpha = 0.85;
      return m;
    },
    reset() {
      this.meteors.forEach((m) => m.c.destroy()); this.meteors.length = 0;
      this.districts.forEach((d) => { d.alive = true; });
      this.hearts = 3; this.blocked = 0; this.won = false; this.lost = false; this.spawnT = 1.2; this.elapsed = 0;
    },
  };
}

// ctl = { dist, connected, mode:'play'|'intro', demo, onBlock, onMiss, onWin, onLose, resetPulse }
export function shieldTick(scene, dt, t, ctl) {
  const { app, sky, starC, stars, root, dome, domeGlow, districts, meteors, plate, plateGlow, plateBody, ripple, teleG, leds, particles } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  stars.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.4 + 0.5 * Math.sin(t * s.sp + s.ph)); });

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // ----- qalqon plitasi pozitsiyasi -----
  // Faqat Arduino ulanganda plita masofaga bog'lanadi. Ulanmaganda o'zi O'YNAMAYDI —
  // sokin idle turadi (meteorlarni avtomatik ushlamaydi).
  let targetY;
  if (ctl.connected) targetY = mapRange(ctl.dist ?? 200, CAL_NEAR, CAL_FAR, RAIL_BOT, RAIL_TOP); // uzoq(baland) -> tepa
  else if (ctl.mode === 'intro') targetY = scene.plateTargetY;                                   // intro skripti boshqaradi
  else targetY = (RAIL_TOP + RAIL_BOT) / 2 + Math.sin(t * 0.7) * 55;                             // ulanmagan: sokin tebranish
  targetY = clamp(targetY, RAIL_TOP, RAIL_BOT);
  scene.plateY += (targetY - scene.plateY) * Math.min(dt * 12, 1);
  plate.y = scene.plateY;
  plateGlow.alpha = 0.55 + 0.2 * Math.sin(t * 4);
  plateBody.tint = 0xffffff;

  // ripple (blokdan keyin)
  ripple.clear();
  if (scene.rippleT > 0) { scene.rippleT -= dt; const k = 1 - scene.rippleT / 0.5; ripple.circle(0, 0, 20 + k * 70).stroke({ width: 4 * (1 - k) + 1, color: 0x6affe0, alpha: (1 - k) * 0.9 }); }

  // ----- meteorlarni spawn qilish -----
  if (ctl.mode === 'play' && ctl.connected && !scene.won && !scene.lost) {
    // HAQIQIY o'yin — faqat Arduino ulangan bo'lsa
    scene.elapsed += dt;
    const diff = clamp(scene.elapsed / 60, 0, 1);
    scene.spawnT -= dt;
    if (scene.spawnT <= 0) {
      scene.spawnT = lerp(2.1, 0.95, diff) * (0.8 + Math.random() * 0.5);
      const speed = lerp(150, 320, diff) * (0.9 + Math.random() * 0.3);
      scene.spawnMeteor(RAIL_TOP + 20 + Math.random() * (RAIL_BOT - RAIL_TOP - 40), speed);
      if (diff > 0.35 && Math.random() < 0.3) scene.spawnMeteor(RAIL_TOP + 20 + Math.random() * (RAIL_BOT - RAIL_TOP - 40), speed * 1.05); // ikkinchi meteor
    }
  } else if (ctl.mode === 'play' && !ctl.connected) {
    // ULANMAGAN — faqat ko'rinish uchun fon meteorlari (ball yo'q, shaharga tegmaydi)
    scene.spawnT -= dt;
    if (scene.spawnT <= 0) { scene.spawnT = 1.3 + Math.random() * 1.5; scene.spawnAmbient(26 + Math.random() * 90, 200 + Math.random() * 90); }
  }

  // ----- meteorlar fizikasi + blok/miss -----
  let anyNear = false;
  teleG.clear();
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    if (m.dead) { m.c.alpha -= dt * 2; m.deflect += dt; m.c.x += 180 * dt; m.c.y -= 40 * dt; if (m.c.alpha <= 0) { m.c.destroy(); meteors.splice(i, 1); } continue; }
    m.c.x -= m.spd * dt;
    m.core.rotation += dt * 3;
    m.glow.alpha = 0.7 + 0.3 * Math.sin(t * 6 + i);
    // fon (ambient) meteori: hech qanday blok/miss/ball yo'q — faqat uchib o'tadi
    if (m.ambient) { if (m.c.x < -60) { m.c.destroy(); meteors.splice(i, 1); } continue; }
    // telegraph (rels yaqinida marker) — meteor yaqinlashsa tez miltillaydi
    const near = m.c.x < RAIL_X + 260;
    if (near) anyNear = true;
    // threshold ogohlantirish: meteor xavf zonasiga kirganda bir marta
    if (!m.warned && m.c.x < RAIL_X + 150) { m.warned = true; if (ctl.onWarn) ctl.onWarn(m); }
    // telegraph marker: rels chetida meteor balandligini oldindan ko'rsatadi
    if (!m.blocked && m.c.x > RAIL_X) {
      const prox = clamp(1 - (m.c.x - RAIL_X) / 700, 0, 1);           // 0 uzoq -> 1 yaqin
      const aligned = Math.abs(m.c.y - scene.plateY) <= CATCH_TOL;
      const col = aligned ? 0x39ffd0 : prox > 0.7 ? 0xff5a4a : 0xffd23f;
      const a = 0.3 + prox * 0.6;
      teleG.moveTo(RAIL_X - 8, m.c.y).lineTo(RAIL_X - 20, m.c.y - 8).lineTo(RAIL_X - 20, m.c.y + 8).closePath().fill({ color: col, alpha: a });
      teleG.circle(RAIL_X, m.c.y, 10 + (1 - prox) * 26).stroke({ width: 2, color: col, alpha: a * 0.8 });
    }

    if (!m.blocked && m.c.x <= RAIL_X + 10) {
      if (Math.abs(m.c.y - scene.plateY) <= CATCH_TOL) {
        // BLOK!
        m.blocked = true; m.dead = true; m.deflect = 0;
        scene.blocked++; scene.rippleT = 0.5; scene.domePulse = 1;
        particles.burst(RAIL_X, m.c.y, 0x39ffd0, 20, 180);
        particles.burst(RAIL_X, m.c.y, 0xffffff, 10, 120);
        if (ctl.onBlock) ctl.onBlock(scene.blocked);
        if (ctl.mode === 'play' && scene.blocked >= scene.target && !scene.won) { scene.won = true; if (ctl.onWin) ctl.onWin(); }
      }
    }
    // shield chizig'idan o'tib ketdi -> mahallaga uriladi
    if (!m.blocked && m.c.x <= CITY_X) {
      m.dead = true; m.c.alpha = 0;
      const d = districts[hitDistrict(scene, m.c.x)]; if (d && d.alive) d.alive = false;
      particles.burst(clamp(m.c.x, 20, LW), LH - 60, 0xff6a2a, 24, 200);
      scene.domePulse = 1;
      if (ctl.mode === 'play' && !scene.won && !scene.lost) {
        scene.hearts = Math.max(0, scene.hearts - 1);
        if (scene.hearts <= 0) { scene.lost = true; if (ctl.onLose) ctl.onLose(); }
      }
      if (ctl.onMiss) ctl.onMiss(scene.hearts);   // ovoz/effekt + HUD (har rejimda)
    }
  }

  // ----- gumbaz -----
  scene.domePulse = Math.max(0, scene.domePulse - dt * 1.6);
  dome.clear();
  const domeA = 0.25 + scene.domePulse * 0.5 + 0.08 * Math.sin(t * 2);
  dome.moveTo(40, LH).quadraticCurveTo(LW / 2, LH - 470 - scene.domePulse * 20, LW - 40, LH).stroke({ width: 2.5, color: 0x39ffd0, alpha: domeA });
  domeGlow.alpha = 0.12 + scene.domePulse * 0.25;

  // ----- mahallalar (chiroqlar / qorayish) -----
  districts.forEach((d) => {
    const target = d.alive ? 1 : 0;
    d.glow.alpha = lerp(d.glow.alpha, d.alive ? 0.4 : 0, Math.min(dt * 2, 1));
    d.wins.forEach((wn) => {
      const lit = d.alive ? wn.b * (0.7 + 0.3 * Math.sin(t * wn.sp + wn.ph)) : Math.max(0, wn.g.alpha - dt * 1.5);
      wn.g.alpha = lit;
    });
  });

  // ----- 4 daraja LED (plita balandligi: past->0, tepa->4) -----
  const lvl = Math.round(mapRange(scene.plateY, RAIL_BOT, RAIL_TOP, 0, 4));
  leds.forEach((l, i) => { const on = i < lvl; const col = lvl >= 4 ? 0x39ffd0 : lvl >= 3 ? 0x6affe0 : 0x2bd45f; l.g.clear(); l.g.circle(0, l.y, 7).fill(on ? col : 0x0a1a18).circle(0, l.y, 7).stroke({ width: 1.5, color: on ? col : 0x1f4a40 }); });

  // ----- threshold ogohlantirish (meteor yaqin) -----
  scene.warnAcc += dt;
  scene._anyNear = anyNear;

  particles.tick(dt);
}

function hitDistrict(scene, x) {
  const dw = LW / scene.districts.length;
  return clamp(Math.floor(clamp(x, 0, LW - 1) / dw), 0, scene.districts.length - 1);
}
