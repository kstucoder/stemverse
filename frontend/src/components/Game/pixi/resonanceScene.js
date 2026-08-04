// resonanceScene — VOLTRA "Rezonans Mayog'i: Signal Kaliti" PixiJS olami.
// Digital Twin: 4 tugma = 4 nota (C-D-E-F). Pastga oqayotgan nota-plitkalarni
// zarba halqasida mos tugma bilan chal -> mayoq zaryadlanadi. To'lganda mayoq
// yonib osmonga signal beradi, uzoqdagi omon qolganlar javob chiroqlari yonadi.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000, LH = 560;
export const LANE_XS = [320, 440, 560, 680];
export const STRIKE_Y = 442, WINDOW = 74, FALL = 220, NOTE_W = 86;
export const NOTES = [
  { name: 'C', freq: 262, col: 0xef4444 },
  { name: 'D', freq: 294, col: 0xf7861a },
  { name: 'E', freq: 330, col: 0xf5c518 },
  { name: 'F', freq: 349, col: 0x39e06a },
];
// rezonans melodiyasi (Do-Re-Mi-Fa yuqoriga-pastga)
export const TUNE = [0, 1, 2, 3, 3, 2, 1, 0, 0, 2, 1, 3, 2, 0, 1, 3];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

function makeNote(lane) {
  const c = new Container(); c.x = LANE_XS[lane]; c.y = -40;
  const col = NOTES[lane].col;
  const glow = new Sprite(radialTexture('rgba(255,255,255,0.7)', 128)); glow.anchor.set(0.5); glow.width = glow.height = NOTE_W + 30; glow.tint = col; glow.blendMode = 'add'; c.addChild(glow);
  const tile = new Graphics();
  tile.roundRect(-NOTE_W / 2, -20, NOTE_W, 40, 12).fill({ color: col, alpha: 0.9 }).stroke({ width: 2, color: 0xffffff, alpha: 0.7 });
  tile.circle(0, 0, 8).fill(0xffffff);   // "runa" markazi
  c.addChild(tile);
  return { c, glow, lane, hit: false, missed: false };
}

// batafsil bino (post-falokat): butun yoki vayron; oynalari (warm/cool) + javob oynalari
function makeBuilding2(x, base, w, h, ruined) {
  const c = new Container(); c.x = x;
  const g = new Graphics();
  if (ruined) {
    g.moveTo(-w / 2, base); g.lineTo(-w / 2, base - h);
    const steps = 5; for (let i = 0; i <= steps; i++) { g.lineTo(-w / 2 + w * (i / steps), base - h + (Math.random() * 34 - 8)); }
    g.lineTo(w / 2, base); g.closePath().fill(0x120e1c).stroke({ width: 1, color: 0x352a46, alpha: 0.5 });
  } else {
    g.rect(-w / 2, base - h, w, h).fill(0x161122).stroke({ width: 1, color: 0x39304f, alpha: 0.4 });
    g.rect(-w / 2, base - h, 3, h).fill({ color: 0x6a5686, alpha: 0.4 });                 // tong nuri (chap qirra)
    g.rect(w / 2 - 2, base - h, 2, h).fill({ color: 0x000000, alpha: 0.4 });
  }
  c.addChild(g);
  const wins = [], resp = [];
  if (!ruined) {
    const cols = Math.max(2, Math.floor((w - 10) / 12)), rows = Math.max(3, Math.floor((h - 14) / 15));
    for (let r = 0; r < rows; r++) for (let cxx = 0; cxx < cols; cxx++) {
      if (Math.random() < 0.32) continue;
      const cool = Math.random() < 0.3;
      const wg = new Graphics().rect(0, 0, 5, 7).fill(cool ? 0x9fd8ff : 0xffcf7a);
      wg.x = -w / 2 + 7 + cxx * 12; wg.y = base - h + 8 + r * 15;
      if (Math.random() < 0.42) { wg.alpha = 0; resp.push(wg); }                          // javob oynasi (zaryadда yonadi)
      else { const b = 0.28 + Math.random() * 0.5; wg.alpha = b; wins.push({ g: wg, b, sp: 0.5 + Math.random() * 2, ph: Math.random() * 6.28 }); }
      c.addChild(wg);
    }
  }
  return { c, wins, resp };
}

export function assembleResonance(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.42, bloomScale: 1.12, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#1a1330', '#3a2648', '#7a4a52', '#c98a5a'])); skyC.addChild(sky); // tong (umidli)
  const glowH = new Sprite(radialTexture('rgba(255,200,120,0.4)', 512)); glowH.anchor.set(0.5, 1); skyC.addChild(glowH); glowH.blendMode = 'add';
  const starC = new Container(); skyC.addChild(starC); const stars = [];
  for (let i = 0; i < 50; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random()).fill(0xeaf3ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random() * 0.4, b: 0.2 + Math.random() * 0.3, sp: 0.5 + Math.random() * 2, ph: Math.random() * 6.28 }); }

  const root = new Container(); app.stage.addChild(root);

  // --- batafsil post-falokat shahar (tongda tiklanayotgan) ---
  const CBASE = 472;
  // yer
  root.addChild(new Graphics().rect(-60, CBASE, LW + 120, LH - CBASE + 40).fill(0x0a0812));
  // tong nur nurlari (binolar ortidan)
  const rays = [];
  for (let i = 0; i < 4; i++) { const s = new Sprite(radialTexture('rgba(255,206,150,0.5)', 256)); s.anchor.set(0.5, 1); s.width = 64; s.height = 520; s.x = 180 + i * 220; s.y = CBASE; s.rotation = -0.28 + i * 0.11; s.blendMode = 'add'; s.alpha = 0.1; root.addChild(s); rays.push(s); }
  // uzoq atmosfera qatlamlari
  const cityBack = makeSkyline(110, 0x201a30, 19); cityBack.alpha = 0.45; root.addChild(cityBack);
  const cityMid = makeSkyline(150, 0x17112a, 33); cityMid.alpha = 0.7; root.addChild(cityMid);
  // old batafsil binolar (chetlar balandroq — o'yin maydonini ramkalaydi)
  const cityWins = [], respWin = [];
  const rubble = new Graphics(); root.addChild(rubble);
  const cityC = new Container(); root.addChild(cityC);
  let bx = 16;
  while (bx < LW - 16) {
    const bw = 46 + Math.random() * 44;
    const distC = Math.abs((bx + bw / 2) - 500) / 500;
    const bh = 66 + Math.random() * 64 + distC * 104;
    const ruined = Math.random() < 0.32;
    const b = makeBuilding2(bx + bw / 2, CBASE, bw, bh, ruined);
    cityC.addChild(b.c);
    b.wins.forEach((o) => cityWins.push(o)); b.resp.forEach((g) => respWin.push(g));
    if (Math.random() < 0.5) { rubble.moveTo(bx - 6, CBASE); for (let k = 0; k < 5; k++) rubble.lineTo(bx + Math.random() * bw, CBASE - Math.random() * 15); rubble.lineTo(bx + bw + 6, CBASE).fill({ color: 0x0c0914, alpha: 0.9 }); }
    bx += bw + 6 + Math.random() * 14;
  }
  // tutun/tuman (vayronalar ustidan suzadi)
  const haze = [];
  for (let i = 0; i < 3; i++) { const s = new Sprite(radialTexture('rgba(170,150,175,0.13)', 512)); s.anchor.set(0.5); s.width = 480 + i * 180; s.height = 140; s.x = Math.random() * LW; s.y = 350 + i * 26; s.blendMode = 'add'; root.addChild(s); haze.push({ s, sp: 8 + i * 6, y0: s.y }); }

  // rezonans minorasi (markazda)
  const tower = new Container(); tower.x = 500; root.addChild(tower);
  const tBody = new Graphics();
  tBody.poly([-34, 470, -20, 150, 20, 150, 34, 470]).fill(0x1a1428).stroke({ width: 2, color: 0x5a4a70, alpha: 0.6 });
  tBody.poly([-20, 150, -10, 96, 10, 96, 20, 150]).fill(0x221a34);
  for (let y = 180; y < 460; y += 40) tBody.moveTo(-30 + (460 - y) * 0.03, y).lineTo(30 - (460 - y) * 0.03, y).stroke({ width: 1, color: 0x4a3a60, alpha: 0.4 });
  tower.addChild(tBody);
  const towerCore = new Sprite(radialTexture('rgba(120,220,255,0.8)', 256)); towerCore.anchor.set(0.5); towerCore.width = 60; towerCore.height = 300; towerCore.y = 300; towerCore.blendMode = 'add'; towerCore.alpha = 0; tower.addChild(towerCore);
  const beam = new Sprite(radialTexture('rgba(150,230,255,0.9)', 256)); beam.anchor.set(0.5, 1); beam.width = 90; beam.height = 600; beam.y = 96; beam.blendMode = 'add'; beam.alpha = 0; tower.addChild(beam);
  const orb = new Graphics(); orb.circle(0, 96, 12).fill(0x9fe8ff); orb.alpha = 0.5; tower.addChild(orb);

  // yo'laklar + strike ring + rezonatorlar
  const laneG = new Graphics(); root.addChild(laneG);
  const noteC = new Container(); root.addChild(noteC);
  const strikeG = new Graphics(); root.addChild(strikeG);
  const resonators = LANE_XS.map((x, i) => {
    const c = new Container(); c.x = x; c.y = STRIKE_Y; root.addChild(c);
    const glow = new Sprite(radialTexture('rgba(255,255,255,0.7)', 128)); glow.anchor.set(0.5); glow.width = glow.height = 96; glow.tint = NOTES[i].col; glow.blendMode = 'add'; glow.alpha = 0.2; c.addChild(glow);
    const cr = new Graphics(); cr.poly([0, -18, 15, 0, 0, 18, -15, 0]).fill({ color: NOTES[i].col, alpha: 0.5 }).stroke({ width: 2, color: 0xffffff, alpha: 0.6 }); c.addChild(cr);
    return { c, glow, cr, i, pulse: 0 };
  });

  const particles = makeParticles(root);

  // zaryad ko'rsatkichi (minora yonida) — root ustida emas, HUD React'da; bu yerda faqat minora glow
  return {
    app, sky, glowH, starC, stars, root, cityWins, respWin, haze, rays, tower, tBody, towerCore, beam, orb,
    laneG, noteC, strikeG, resonators, particles,
    notes: [], spawnAcc: 0, spawnIdx: 0, charge: 0, target: 100, hits: 0, combo: 0, won: false,
    lastBtn: 0, beamA: 0, lastReset: 0,
    spawnNote(lane) { const n = makeNote(lane); this.noteC.addChild(n.c); this.notes.push(n); return n; },
    pulseResonator(i) { if (this.resonators[i]) this.resonators[i].pulse = 1; },
    reset() { this.notes.forEach((n) => n.c.destroy()); this.notes.length = 0; this.spawnAcc = 0; this.spawnIdx = 0; this.charge = 0; this.hits = 0; this.combo = 0; this.won = false; this.beamA = 0; },
  };
}

// ctl = { btn, connected, mode:'play'|'intro', resetPulse, onHit, onMiss, onWrong, onWin }
export function resonanceTick(scene, dt, t, ctl) {
  const { app, sky, glowH, starC, stars, root, cityWins, respWin, haze, rays, towerCore, beam, orb, laneG, strikeG, resonators, notes, particles } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  glowH.x = w / 2; glowH.y = h; glowH.width = w * 1.2; glowH.height = h * 0.6;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  stars.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.4 + 0.5 * Math.sin(t * s.sp + s.ph)) * (1 - scene.charge / 100 * 0.6); });

  if (ctl.resetPulse !== undefined && ctl.resetPulse !== scene.lastReset) { scene.lastReset = ctl.resetPulse; scene.reset(); }

  // yo'laklar
  laneG.clear();
  LANE_XS.forEach((x, i) => {
    laneG.rect(x - NOTE_W / 2, 60, NOTE_W, STRIKE_Y - 60).fill({ color: NOTES[i].col, alpha: 0.04 });
    laneG.moveTo(x - NOTE_W / 2, 60).lineTo(x - NOTE_W / 2, STRIKE_Y).moveTo(x + NOTE_W / 2, 60).lineTo(x + NOTE_W / 2, STRIKE_Y).stroke({ width: 1, color: NOTES[i].col, alpha: 0.12 });
  });
  // strike ring
  strikeG.clear();
  strikeG.moveTo(LANE_XS[0] - 70, STRIKE_Y).lineTo(LANE_XS[3] + 70, STRIKE_Y).stroke({ width: 2, color: 0xffffff, alpha: 0.25 });
  LANE_XS.forEach((x, i) => strikeG.circle(x, STRIKE_Y, 26).stroke({ width: 2, color: NOTES[i].col, alpha: 0.4 + 0.2 * Math.sin(t * 4 + i) }));

  // ----- nota spawn (faqat ulanган play, g'alaba emas) -----
  const playing = ctl.mode === 'play' && ctl.connected && !scene.won;
  if (playing) {
    scene.spawnAcc += dt;
    const iv = lerp(0.78, 0.5, scene.charge / 100);   // zaryad oshsa tezroq
    if (scene.spawnAcc >= iv) { scene.spawnAcc = 0; scene.spawnNote(TUNE[scene.spawnIdx % TUNE.length]); scene.spawnIdx++; }
  }

  // ----- tugma rising edge -> lane hit -----
  const btn = ctl.mode === 'intro' ? 0 : (ctl.connected ? (ctl.btn | 0) : 0);
  if (btn >= 1 && btn <= 4 && btn !== scene.lastBtn) {
    const lane = btn - 1;
    let best = null, bd = WINDOW;
    notes.forEach((n) => { if (n.hit || n.missed || n.lane !== lane) return; const d = Math.abs(n.c.y - STRIKE_Y); if (d < bd) { bd = d; best = n; } });
    if (best) {
      best.hit = true; scene.hits++; scene.combo++; scene.charge = clamp(scene.charge + 6, 0, 100);
      scene.pulseResonator(lane); particles.burst(LANE_XS[lane], STRIKE_Y, NOTES[lane].col, 16, 150);
      if (ctl.onHit) ctl.onHit({ lane, freq: NOTES[lane].freq, combo: scene.combo });
      if (scene.charge >= scene.target && !scene.won) { scene.won = true; scene.beamA = 1; if (ctl.onWin) ctl.onWin(); }
    } else { scene.combo = 0; scene.charge = clamp(scene.charge - 3, 0, 100); if (ctl.onWrong) ctl.onWrong(); }
  }
  scene.lastBtn = btn;

  // ----- notalar tushishi + miss -----
  for (let i = notes.length - 1; i >= 0; i--) {
    const n = notes[i];
    if (n.hit) { n.c.y += FALL * dt; n.c.alpha -= dt * 4; n.c.scale.set(n.c.scale.x + dt * 2); if (n.c.alpha <= 0) { n.c.destroy(); notes.splice(i, 1); } continue; }
    n.c.y += FALL * dt;
    n.glow.alpha = 0.5 + 0.3 * Math.sin(t * 8 + i);
    if (!n.missed && n.c.y > STRIKE_Y + WINDOW) { n.missed = true; scene.combo = 0; if (playing) scene.charge = clamp(scene.charge - 2, 0, 100); if (ctl.onMiss) ctl.onMiss(); }
    if (n.c.y > LH + 40) { n.c.destroy(); notes.splice(i, 1); }
    else if (n.missed) n.c.alpha = Math.max(0.25, n.c.alpha - dt * 0.6);
  }

  // ----- rezonatorlar puls -----
  resonators.forEach((r) => { r.pulse = Math.max(0, r.pulse - dt * 2.2); r.glow.alpha = 0.2 + r.pulse * 0.8; r.cr.scale.set(1 + r.pulse * 0.5); r.cr.rotation += dt * (0.3 + r.pulse * 4); });

  // ----- minora zaryadi + javob chiroqlari + nur -----
  const chN = scene.charge / 100;
  towerCore.alpha = lerp(towerCore.alpha, 0.15 + chN * 0.7, Math.min(dt * 3, 1));
  orb.alpha = 0.4 + chN * 0.6 + 0.1 * Math.sin(t * 5);
  orb.scale.set(1 + chN * 0.4 + 0.05 * Math.sin(t * 6));
  // shahar oynalari miltillaydi
  cityWins.forEach((o) => { o.g.alpha = o.b * (0.65 + 0.35 * Math.sin(t * o.sp + o.ph)); });
  // javob oynalari — zaryad oshgani sari yonadi (omon qolganlar uyga qaytadi)
  respWin.forEach((g, i) => { const on = i / respWin.length < chN; g.alpha = lerp(g.alpha, on ? (0.4 + 0.45 * Math.sin(t * 3 + i)) : 0, Math.min(dt * 2, 1)); });
  // tutun drifti + nur pulsatsiyasi
  haze.forEach((o) => { o.s.x -= o.sp * dt; if (o.s.x < -300) o.s.x = LW + 300; o.s.y = o.y0 + Math.sin(t * 0.4 + o.sp) * 8; });
  rays.forEach((s, i) => { s.alpha = 0.09 + 0.05 * Math.sin(t * 0.6 + i); });
  if (scene.won) { scene.beamA = Math.min(1, scene.beamA + dt * 2); if (Math.random() < 0.3) particles.burst(500, 96, 0x9fe8ff, 3, 200); }
  beam.alpha = scene.beamA * (0.7 + 0.3 * Math.sin(t * 12));
  beam.width = 70 + scene.beamA * 50;

  particles.tick(dt);
}
