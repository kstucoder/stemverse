// dragonScene — VOLTRA "Uxlab Yotgan Ajdaho va Xazina" PixiJS olami.
// Ikki sarguzashtchi ajdaho g'origa kirgan. Markazdagi sehrli GAVHAR = signal:
// sariq "teginma" → YASHIL "ol!" → kim tez bossa gavharni oladi. Erta bossa —
// AJDAHO UYG'ONADI (falstart, raqib oladi). 5 gavhar → g'ordan qochish.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
const GY = 452, H1X = 300, H2X = 700, GEMX = 500, GEMY = 300;
const GEM_COL = { waiting: 0x556074, ready: 0xffc21a, go: 0x39e06a, result: 0x8a94a8 };

function makeHero(color, dir) {
  const c = new Container(); c.scale.x = dir;
  const glow = new Sprite(radialTexture(`rgba(${(color >> 16) & 255},${(color >> 8) & 255},${color & 255},0.45)`, 128)); glow.anchor.set(0.5); glow.width = glow.height = 120; glow.y = -46;
  const legL = new Graphics().roundRect(-3.5, 0, 8, 24, 3).fill(0x241a12); legL.x = -8; legL.y = -24;
  const legR = new Graphics().roundRect(-3.5, 0, 8, 24, 3).fill(0x2e2418); legR.x = 7; legR.y = -24;
  const body = new Graphics().roundRect(-13, -46, 26, 40, 9).fill(0x3a2e20).roundRect(-13, -46, 26, 40, 9).stroke({ width: 2, color: color }); // sarguzashtchi kamzuli
  const pack = new Graphics().roundRect(-19, -42, 10, 24, 4).fill(0x5a3a22); // ryukzak
  const scarf = new Graphics().moveTo(-10, -46).lineTo(10, -46).lineTo(6, -38).lineTo(-6, -38).fill(color);
  const head = new Graphics().circle(0, -58, 9).fill(0xf1c27d); // yuz
  const cap = new Graphics().arc(0, -58, 10, Math.PI, 2 * Math.PI).fill(color).rect(-11, -59, 22, 3).fill(0x2a1f14);
  const arm = new Graphics().roundRect(-3, 0, 7, 22, 3).fill(0x3a2e20).roundRect(-3, 18, 9, 8, 3).fill(0xf1c27d); arm.x = 12; arm.y = -42; arm.rotation = -0.3;
  const gem = new Graphics().poly([0, -7, 5, 0, 0, 7, -5, 0]).fill(color); gem.x = 22; gem.y = -60; gem.alpha = 0; // olingan gavhar
  c.addChild(glow, pack, legL, legR, body, scarf, arm, head, cap, gem);
  return { c, body, arm, head, glow, gem, color, dir, react: 0 };
}

function makeDragon() {
  const c = new Container();
  // tana — g'or orqasida yotgan yirik yarim halqa
  const body = new Graphics();
  const pts = [[110, 360], [210, 250], [370, 190], [560, 190], [720, 250], [820, 340]];
  for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i]; body.circle(x, y, 52 - Math.abs(i - 2.5) * 3).fill(0x24623c); }
  for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i]; body.circle(x, y - 8, 30).fill({ color: 0x2f7a4a, alpha: 0.6 }); } // yorug' ust
  // orqa tikanlar
  for (let i = 0; i < pts.length - 1; i++) { const [x, y] = pts[i]; body.moveTo(x - 8, y - 44).lineTo(x, y - 66).lineTo(x + 8, y - 44).fill(0x1c4a2e); }
  c.addChild(body);
  // bosh (o'ng tomonda, gavhar tomon) — head container (uyg'onganда ko'tariladi)
  const head = new Container(); head.x = 820; head.y = 345;
  head.addChild(new Graphics().ellipse(0, 0, 56, 40).fill(0x24623c)); // bosh
  head.addChild(new Graphics().moveTo(-40, 6).quadraticCurveTo(-78, 10, -92, 24).quadraticCurveTo(-70, 20, -40, 20).fill(0x2a6e44)); // tumshuq
  head.addChild(new Graphics().moveTo(20, -34).lineTo(30, -60).lineTo(38, -34).fill(0xdfe6d0).moveTo(-6, -36).lineTo(2, -58).lineTo(12, -36).fill(0xdfe6d0)); // shoxlar
  const nostril = new Graphics().circle(-84, 20, 3).fill(0x143020); head.addChild(nostril);
  const eyeClosed = new Graphics().moveTo(-34, -6).quadraticCurveTo(-24, -2, -14, -6).stroke({ width: 3, color: 0x143020 });
  const eyeOpen = new Graphics().ellipse(-24, -8, 11, 13).fill(0xffe14a).circle(-24, -8, 5).fill(0x0a0a0a); eyeOpen.alpha = 0;
  const mouth = new Graphics().moveTo(-40, 14).quadraticCurveTo(-60, 30, -88, 26).stroke({ width: 3, color: 0x143020 }); mouth.alpha = 0;
  head.addChild(eyeClosed, eyeOpen, mouth);
  c.addChild(head);
  return { c, head, eyeClosed, eyeOpen, mouth, nostril, baseY: 345 };
}

export function assembleDuel(app) {   // nomi saqlangan (import mos)
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.45, bloomScale: 1.0, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const bg = new Sprite(gradTexture(['#0a0806', '#161009', '#0d0a08', '#060403'])); skyC.addChild(bg);

  const root = new Container(); app.stage.addChild(root);

  // g'or devor / stalaktitlar
  const cave = new Graphics();
  for (let x = 0; x < LW; x += 70) { const hgt = 30 + Math.random() * 50; cave.moveTo(x, 0).lineTo(x + 20, hgt).lineTo(x + 40, 0).fill(0x120d08); }
  cave.rect(0, 0, LW, 18).fill(0x0d0906);
  root.addChild(cave);

  const dragon = makeDragon(); root.addChild(dragon.c);

  // mash'alalar
  const torches = [];
  [90, 910].forEach((tx) => { const c = new Container(); c.x = tx; c.y = 150; c.addChild(new Graphics().rect(-3, 0, 6, 60).fill(0x3a2a1a)); const fl = new Sprite(radialTexture('rgba(255,170,60,0.9)', 128)); fl.anchor.set(0.5, 1); fl.width = 46; fl.height = 70; fl.y = 4; c.addChild(fl); root.addChild(c); torches.push({ c, fl, ph: Math.random() * 6.28 }); });

  // xazina uyumi + gavhar (signal)
  const hoard = new Graphics();
  for (let i = 0; i < 60; i++) { const hx = GEMX - 130 + Math.random() * 260, hy = GY - 30 + Math.random() * 26; hoard.circle(hx, hy, 4 + Math.random() * 4).fill([0xffd23f, 0xffe08a, 0xd9a520][i % 3]); }
  hoard.ellipse(GEMX, GY - 4, 150, 22).fill({ color: 0xffd23f, alpha: 0.12 });
  root.addChild(hoard);
  const gemGlow = new Sprite(radialTexture('rgba(255,255,255,0.85)', 256)); gemGlow.anchor.set(0.5); gemGlow.width = gemGlow.height = 170; gemGlow.x = GEMX; gemGlow.y = GEMY; root.addChild(gemGlow);
  const gemRays = new Graphics(); gemRays.x = GEMX; gemRays.y = GEMY; root.addChild(gemRays);
  const gem = new Graphics().poly([0, -26, 18, -6, 12, 22, -12, 22, -18, -6]).fill(0xffffff).poly([0, -26, 18, -6, 0, 2]).fill({ color: 0xffffff, alpha: 0.5 }); gem.x = GEMX; gem.y = GEMY; root.addChild(gem);

  const particles = makeParticles(root);
  const heroes = [makeHero(0x00eeff, 1), makeHero(0xff2d78, -1)];
  heroes[0].c.x = H1X; heroes[0].c.y = GY; heroes[1].c.x = H2X; heroes[1].c.y = GY;
  root.addChild(heroes[0].c, heroes[1].c);

  // chang zarralari
  const dust = []; const dustC = new Container(); root.addChild(dustC);
  for (let i = 0; i < 30; i++) { const g = new Graphics().circle(0, 0, 1 + Math.random()).fill(0xffe0a0); g.x = Math.random() * LW; g.y = Math.random() * LH; g.alpha = 0.15; dustC.addChild(g); dust.push({ g, sp: 4 + Math.random() * 8, ph: Math.random() * 6.28 }); }

  return { app, bg, root, dragon, torches, gem, gemGlow, gemRays, particles, heroes, dust, wake: 0, prevState: null, lastRound: 0, flash: 0 };
}

// ctl = { state, winner, p1, p2, connected, roundPulse, foul }
export function duelTick(scene, dt, t, ctl) {
  const { app, bg, root, dragon, torches, gem, gemGlow, gemRays, particles, heroes, dust } = scene;
  const w = app.screen.width, h = app.screen.height;
  bg.width = w; bg.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;

  const state = ctl.connected ? (ctl.state || 'waiting') : 'waiting';
  const col = GEM_COL[state] || GEM_COL.waiting;

  // raund natijasi
  if (ctl.roundPulse !== scene.lastRound) {
    scene.lastRound = ctl.roundPulse;
    const win = ctl.winner;
    if (ctl.foul) {
      scene.wake = 1;                                  // AJDAHO UYG'ONADI
      const fouler = 3 - win; if (heroes[fouler - 1]) heroes[fouler - 1].react = -1;
      particles.burst(820, 320, 0xffe14a, 20, 200); scene.flash = 0.4;
    } else if (win === 1 || win === 2) {
      heroes[win - 1].react = 1; heroes[2 - win].react = -0.4;
      particles.burst(GEMX, GEMY, 0xffd23f, 26, 220); scene.flash = 0.3;
    }
  }

  // gavhar signal
  gem.tint = col; gemGlow.tint = col;
  const pulse = state === 'go' ? (0.9 + 0.3 * Math.sin(t * 12)) : state === 'ready' ? (0.5 + 0.2 * Math.sin(t * 6)) : 0.22;
  gemGlow.alpha = pulse; gem.scale.set(state === 'go' ? 1.15 + 0.12 * Math.sin(t * 12) : 1); gem.rotation = Math.sin(t * 1.5) * 0.1;
  gemRays.clear();
  if (state === 'go') { for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + t; gemRays.moveTo(Math.cos(a) * 28, Math.sin(a) * 28).lineTo(Math.cos(a) * 64, Math.sin(a) * 64).stroke({ width: 3, color: 0x39e06a, alpha: 0.5 }); } }

  // ajdaho: uyquda pishillaydi; uyg'onsa bosh ko'tariladi, ko'z ochiladi, o'kiradi
  scene.wake = Math.max(0, scene.wake - dt * 0.5);
  const wk = scene.wake;
  dragon.head.y = dragon.baseY - wk * 40 + Math.sin(t * 1.4) * 3;           // nafas + ko'tarilish
  dragon.head.rotation = -wk * 0.12;
  dragon.eyeOpen.alpha = wk; dragon.eyeClosed.alpha = 1 - wk; dragon.mouth.alpha = wk;
  if (wk > 0.5 && Math.random() < 0.4) particles.burst(730 + Math.random() * 40, 360 - wk * 40, [0xff7a2a, 0x8a6a3a][Math.floor(Math.random() * 2)], 2, 120);
  // uyqu pishillashi (burundan tutun)
  if (wk < 0.2 && Math.random() < 0.04) particles.burst(736, 365, 0x6a7488, 2, 30);

  // sarguzashtchilar (react: 1 gavharni oladi, <0 qo'rqib chekinadi)
  heroes.forEach((b, i) => {
    b.react += (0 - b.react) * Math.min(dt * 2.2, 1);
    const homeX = i === 0 ? H1X : H2X;
    b.c.x = homeX + Math.max(0, b.react) * (GEMX - homeX) * 0.5 * 0.7 + Math.min(0, b.react) * 40 * (-b.dir);
    b.body.rotation = Math.min(0, b.react) * 0.4 * (-b.dir) + Math.sin(t * 2 + i) * 0.02;
    b.arm.rotation = -0.3 - Math.max(0, b.react) * 1.4;
    b.gem.alpha = Math.max(0, b.react);
    b.gem.y = -60 - Math.max(0, b.react) * 8;
    b.glow.alpha = 0.25 + Math.max(0, b.react) * 0.4;
    b.c.y = GY + Math.sin(t * 2 + i * 2) * 1;
  });

  // mash'ala + chang
  torches.forEach((tr) => { tr.fl.alpha = 0.7 + 0.3 * Math.sin(t * 10 + tr.ph); tr.fl.scale.set(1 + 0.08 * Math.sin(t * 13 + tr.ph)); });
  dust.forEach((d) => { d.g.y -= d.sp * dt; d.g.x += Math.sin(t + d.ph) * 6 * dt; if (d.g.y < 0) { d.g.y = LH; d.g.x = Math.random() * LW; } });

  scene.flash = Math.max(0, scene.flash - dt * 1.8);
}
