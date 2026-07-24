// stageScene — VOLTRA "Festival Sahnasi" PixiJS olami.
// Tiklangan shaharda tungi konsert. Tugma (BTN) bosilishi = bir BEAT: truss
// prожektorlari yonadi, lazerlar otiladi, ekvalayzer sakraydi, olomon qo'l
// ko'taradi. 8 beat = 1 qo'shiq, 3 qo'shiq = shou. Energy City / Traffic bilan
// bir xil vizual til: glow, bloom, particle.
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000;
export const LH = 560;
const TRUSS_Y = 96;
const STAGE_Y = 388;

const FIXX = [150, 260, 370, 480, 590, 700, 810];  // truss prожektorlari
const SONG_COLORS = [
  { a: 0x00eeff, b: 0x9b5de5 },
  { a: 0xff2d78, b: 0xffd166 },
  { a: 0x39e06a, b: 0x3b82ff },
];

function coneTexture(color) {
  const cv = document.createElement('canvas');
  cv.width = 64; cv.height = 256;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(36, 0); ctx.lineTo(64, 256); ctx.lineTo(0, 256); ctx.closePath(); ctx.fill();
  return cv;
}

export function assembleStage(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.42, bloomScale: 1.1, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container();
  app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#05060f', '#0a0a20', '#0f0a26', '#08060f']));
  skyC.addChild(sky);
  const starC = new Container();
  skyC.addChild(starC);
  const stars = [];
  for (let i = 0; i < 70; i++) {
    const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.3).fill(0xeaf3ff);
    starC.addChild(g);
    stars.push({ g, fx: Math.random(), fy: Math.random() * 0.4, b: 0.3 + Math.random() * 0.4, sp: 0.6 + Math.random() * 2, ph: Math.random() * 6.28 });
  }

  const root = new Container();
  app.stage.addChild(root);

  // uzoq shahar silueti (uzviylik uchun)
  const sky1 = makeSkyline(120, 0x0a1226, 17); sky1.y = STAGE_Y - 470; sky1.alpha = 0.5; root.addChild(sky1);

  // orqa LED ekran + ekvalayzer
  const screen = new Graphics()
    .roundRect(255, 120, 490, 200, 10).fill(0x05060f)
    .roundRect(255, 120, 490, 200, 10).stroke({ width: 2, color: 0x1c2a44 });
  root.addChild(screen);
  const bars = [];
  const barC = new Container();
  root.addChild(barC);
  const BN = 22, bw = 470 / BN;
  for (let i = 0; i < BN; i++) {
    const g = new Graphics();
    g.x = 267 + i * bw; g.y = 312;
    barC.addChild(g);
    bars.push({ g, w: bw - 3, h: 6, target: 6 });
  }

  // truss ramka
  const truss = new Graphics()
    .rect(90, TRUSS_Y - 10, 820, 12).fill(0x11161f)
    .rect(90, TRUSS_Y - 10, 820, 12).stroke({ width: 1, color: 0x2a3444 });
  for (let x = 100; x < 910; x += 40) truss.moveTo(x, TRUSS_Y - 10).lineTo(x + 20, TRUSS_Y + 2).stroke({ width: 1, color: 0x2a3444, alpha: 0.6 });
  root.addChild(truss);

  // prожektor nurlari (koneslar) + linzalar
  const beamTex = Texture.from(coneTexture('rgba(255,255,255,0.55)'));
  const lights = FIXX.map((x, i) => {
    const beam = new Sprite(beamTex);
    beam.anchor.set(0.5, 0);
    beam.x = x; beam.y = TRUSS_Y + 2;
    beam.width = 90; beam.height = STAGE_Y - TRUSS_Y + 30;
    beam.alpha = 0;
    root.addChild(beam);
    const housing = new Graphics().roundRect(x - 12, TRUSS_Y - 6, 24, 16, 3).fill(0x0c1018).roundRect(x - 12, TRUSS_Y - 6, 24, 16, 3).stroke({ width: 1, color: 0x2a3444 });
    const lens = new Graphics().circle(x, TRUSS_Y + 8, 6).fill(0xffffff);
    lens.alpha = 0.2;
    root.addChild(housing, lens);
    return { beam, lens, x, phase: i * 0.7, dir: i % 2 ? 1 : -1 };
  });

  // lazerlar (ikki yon manbadan)
  const lasers = new Graphics();
  root.addChild(lasers);

  // sahna platformasi + old chiroqlari
  const stage = new Graphics()
    .moveTo(160, STAGE_Y).lineTo(840, STAGE_Y).lineTo(910, STAGE_Y + 54).lineTo(90, STAGE_Y + 54).closePath().fill(0x0a0d15)
    .moveTo(160, STAGE_Y).lineTo(840, STAGE_Y).stroke({ width: 2, color: 0x00eeff, alpha: 0.5 });
  root.addChild(stage);
  const footlights = [];
  for (let i = 0; i < 12; i++) {
    const fx = 150 + i * 58;
    const g = new Graphics().circle(fx, STAGE_Y + 6, 3).fill(0xffffff);
    g.alpha = 0.3; root.addChild(g);
    footlights.push(g);
  }

  // tuman
  const fogTex = radialTexture('rgba(140,160,220,0.10)', 512);
  const fogA = new Sprite(fogTex); fogA.anchor.set(0.5); fogA.width = 700; fogA.height = 160; fogA.y = STAGE_Y + 10;
  const fogB = new Sprite(fogTex); fogB.anchor.set(0.5); fogB.width = 900; fogB.height = 180; fogB.y = STAGE_Y + 30;
  root.addChild(fogA, fogB);

  const particles = makeParticles(root);

  // olomon (old plan silueti — qo'l ko'taradigan muxlislar)
  const crowd = [];
  const crowdC = new Container();
  root.addChild(crowdC);
  for (let i = 0; i < 22; i++) {
    const x = 40 + i * 44 + (Math.random() - 0.5) * 16;
    const sc = 0.85 + Math.random() * 0.4;
    const c = new Container();
    c.x = x; c.y = LH + 8; c.scale.set(sc);
    const body = new Graphics().moveTo(-11, 0).lineTo(-8, -30).quadraticCurveTo(0, -40, 8, -30).lineTo(11, 0).closePath().fill(0x04060c);
    const head = new Graphics().circle(0, -40, 6.5).fill(0x04060c);
    const armL = new Graphics().roundRect(-1.6, 0, 3.2, -22, 1.6).fill(0x04060c); armL.x = -7; armL.y = -30;
    const armR = new Graphics().roundRect(-1.6, 0, 3.2, -22, 1.6).fill(0x04060c); armR.x = 7; armR.y = -30;
    // telefon chiroqchasi (kutish paytida)
    const phone = new Graphics().circle(0, -52, 2.2).fill(0xfff2b0); phone.alpha = 0;
    c.addChild(armL, armR, body, head, phone);
    crowdC.addChild(c);
    crowd.push({ c, armL, armR, phone, ph: Math.random() * 6.28, baseY: LH + 8 });
  }

  // strob (butun sahna oq chaqnash)
  const strobe = new Sprite(radialTexture('rgba(255,255,255,0.9)', 512));
  strobe.anchor.set(0.5); strobe.alpha = 0;
  app.stage.addChild(strobe);

  return {
    app, particles,
    skyC, sky, starC, stars,
    root, bars, lights, lasers, stage, footlights, fogA, fogB, crowd, strobe,
    beatEnergy: 0, lastBeat: 0, lastDance: 0, sweepT: 0,
  };
}

// ctl = { beatPulse, dancePulse, intensity, songIndex, ledOn, connected }
export function stageTick(scene, dt, t, ctl) {
  const { app, root, sky, starC, stars, bars, lights, lasers, footlights, fogA, fogB, crowd, strobe, particles } = scene;
  const w = app.screen.width, h = app.screen.height;

  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc);
  root.x = (w - LW * sc) / 2;
  root.y = h - LH * sc;
  strobe.x = w / 2; strobe.y = h / 2; strobe.width = w * 1.4; strobe.height = h * 1.4;

  stars.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)); });

  const conn = ctl.connected;
  const song = SONG_COLORS[(ctl.songIndex || 0) % SONG_COLORS.length];

  // beat trigger
  if (ctl.beatPulse !== scene.lastBeat) {
    scene.lastBeat = ctl.beatPulse;
    scene.beatEnergy = 1;
    bars.forEach((b) => { b.target = 20 + Math.random() * 150; });
    particles.burst(FIXX[Math.floor(Math.random() * FIXX.length)], TRUSS_Y + 20, Math.random() < 0.5 ? song.a : song.b, 6, 160);
    strobe.alpha = 0.22;
  }
  // dance complete trigger
  if (ctl.dancePulse !== scene.lastDance) {
    scene.lastDance = ctl.dancePulse;
    for (let k = 0; k < 60; k++) particles.burst(120 + Math.random() * 760, TRUSS_Y + 10, [0xff2d78, 0xffd166, 0x00eeff, 0x39e06a][k % 4], 2, 260);
    strobe.alpha = 0.5;
  }
  scene.beatEnergy = Math.max(0, scene.beatEnergy - dt * 3.2);
  strobe.alpha = Math.max(0, strobe.alpha - dt * 2.2);
  const be = conn ? scene.beatEnergy : 0;
  scene.sweepT += dt;

  // ekvalayzer
  bars.forEach((b) => {
    b.target = Math.max(6, b.target - dt * 90);
    b.h += (b.target - b.h) * Math.min(dt * 12, 1);
    const col = b.h > 100 ? song.b : song.a;
    b.g.clear();
    b.g.roundRect(0, -b.h, b.w, b.h, 2).fill({ color: col, alpha: conn ? 0.9 : 0.25 });
  });

  // prожektorlar
  lights.forEach((L, i) => {
    L.lens.alpha = 0.15 + be * 0.85;
    L.lens.tint = i % 2 ? song.b : song.a;
    L.beam.tint = i % 2 ? song.b : song.a;
    L.beam.alpha = (0.08 + be * 0.6) * (conn ? 1 : 0.15);
    L.beam.rotation = Math.sin(scene.sweepT * 1.2 + L.phase) * 0.22 * L.dir;
  });

  // lazerlar
  lasers.clear();
  if (be > 0.05) {
    [[150, TRUSS_Y + 4], [850, TRUSS_Y + 4]].forEach((src, si) => {
      for (let k = 0; k < 5; k++) {
        const ang = (si ? Math.PI * 0.62 : Math.PI * 0.38) + (k - 2) * 0.12 + Math.sin(scene.sweepT * 2 + k) * 0.05;
        const len = 520;
        lasers.moveTo(src[0], src[1]).lineTo(src[0] + Math.cos(ang) * len, src[1] + Math.sin(ang) * len)
          .stroke({ width: 1.6, color: k % 2 ? song.a : song.b, alpha: be * 0.7 });
      }
    });
  }

  // old chiroqlar
  footlights.forEach((g, i) => { g.alpha = conn ? 0.25 + be * 0.7 * (0.6 + 0.4 * Math.sin(t * 6 + i)) : 0.15; });

  // tuman
  fogA.x = 500 + Math.sin(t * 0.3) * 120; fogB.x = 500 - Math.sin(t * 0.24) * 150;
  fogA.alpha = 0.5 + be * 0.3; fogB.alpha = 0.4 + be * 0.2;

  // olomon — beat'da qo'l ko'taradi, kutganda telefon chiroqchasi
  crowd.forEach((p) => {
    const bob = Math.sin(t * 2 + p.ph) * 2;
    p.c.y = p.baseY + bob;
    const raise = conn ? be : 0;
    p.armL.rotation = raise * -0.5 + Math.sin(t * 4 + p.ph) * 0.08 * raise;
    p.armR.rotation = raise * 0.5 - Math.sin(t * 4 + p.ph) * 0.08 * raise;
    p.phone.alpha = conn ? Math.max(0, 0.5 - be) * 0.7 : 0.5 + 0.3 * Math.sin(t * 2 + p.ph);
  });

  strobe.alpha = Math.min(strobe.alpha, 0.5);
}
