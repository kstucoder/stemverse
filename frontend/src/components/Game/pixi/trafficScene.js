// trafficScene — VOLTRA Svetafor olamining PixiJS qurilishi.
// Energy City bilan BITTA vizual til: yoritilgan tungi shahar, glow, bloom,
// tween, particle. Sahnadagi HAMMA narsa haqiqiy Arduino signalidan jonlanadi:
//   STATE:RED/YELLOW/GREEN → chiroqlar + mashinalar oqimi
//   BTN (D2)               → piyoda zebradan o'tadi
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeLamp } from './cityScene';
import { createTweens } from './tween';

export const LW = 1000;
export const LH = 560;
export const ROAD_TOP = 372;   // yo'lning uzoq cheti
export const LANE_Y = 474;     // mashina yo'lagi markazi
export const STOP_X = 592;     // to'xtash chizig'i (zebradan oldin)
export const CROSS_X0 = 604;   // zebra boshlanishi
export const CROSS_X1 = 706;   // zebra tugashi
export const SIGNAL_X = 748;   // svetafor ustuni

const STATE_COLOR = { RED: 0xff2d30, YELLOW: 0xffc21a, GREEN: 0x21e065 };
const MID_X = (CROSS_X0 + CROSS_X1) / 2;

/* ---------- rang yordamchilari ---------- */
function rgba(hex, a = 1) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  return `rgba(${r},${g},${b},${a})`;
}
function shade(hex, f) {
  const r = Math.min(255, ((hex >> 16) & 255) * f) & 255;
  const g = Math.min(255, ((hex >> 8) & 255) * f) & 255;
  const b = Math.min(255, (hex & 255) * f) & 255;
  return (r << 16) | (g << 8) | b;
}

/* ---------- yoritilgan shahar (fon) ----------
   1-o'yin (Energy City) shaharni yoqadi — bu yerda shahar allaqachon nurga to'la:
   derazalarda yonayotgan chiroqlar, mayoqlar, sekin miltillash. */
function makeCity(root) {
  const winList = [];
  const beacons = [];

  function row(seed, bodyColor, hMin, hMax, wMin, wMax, litChance) {
    const g = new Graphics();
    const winC = new Container();
    let x = -30, i = 0;
    while (x < LW + 40) {
      const w = wMin + ((seed * (i + 3) * 37) % (wMax - wMin));
      const h = hMin + ((seed * (i + 7) * 53) % (hMax - hMin));
      const by = ROAD_TOP - h;
      g.rect(x, by, w, h).fill(bodyColor);
      g.rect(x, by, w, 2).fill({ color: 0x2b4066, alpha: 0.5 });
      g.rect(x, by, 3, h).fill({ color: 0x1a2c4a, alpha: 0.6 });
      // derazalar
      const cols = Math.max(2, Math.floor((w - 8) / 11));
      const rows = Math.max(2, Math.floor((h - 12) / 14));
      for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          if (Math.random() > litChance) continue;
          const cool = Math.random() < 0.16;
          const wg = new Graphics().rect(0, 0, 5, 7).fill(cool ? 0x8ff6ff : 0xffd76a);
          wg.x = x + 6 + cc * 11;
          wg.y = by + 8 + r * 14;
          const base = 0.45 + Math.random() * 0.5;
          wg.alpha = base;
          winC.addChild(wg);
          winList.push({ g: wg, base, ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 1.8 });
        }
      }
      // tom mayog'i (ba'zi binolar)
      if (i % 3 === 1) {
        const bcn = new Graphics().circle(x + w / 2, by - 4, 2.2).fill(0xff3b5c);
        winC.addChild(bcn);
        beacons.push({ g: bcn, ph: Math.random() * 6.28 });
      }
      x += w + 5 + ((seed * i * 13) % 16);
      i++;
    }
    root.addChild(g, winC);
  }

  // uzoq (xira) → yaqin (yorqin) qatlamlar
  row(17, 0x0a1428, 60, 130, 34, 70, 0.42);
  row(29, 0x0d1a34, 95, 195, 42, 92, 0.5);

  return {
    tick(t) {
      winList.forEach((w) => { w.g.alpha = w.base * (0.82 + 0.18 * Math.sin(t * w.sp + w.ph)); });
      beacons.forEach((b, i) => { b.g.alpha = 0.35 + 0.5 * Math.abs(Math.sin(t * 1.7 + b.ph + i)); });
    },
  };
}

/* ---------- svetafor boshi ---------- */
function makeSignal() {
  const c = new Container();
  c.x = SIGNAL_X;
  c.y = ROAD_TOP - 8;

  const poleH = LH - ROAD_TOP + 30;
  const pole = new Graphics()
    .rect(-4, 0, 8, poleH).fill(0x11192b)
    .rect(-4, 0, 3, poleH).fill({ color: 0x24324c, alpha: 0.7 });
  const base = new Graphics().ellipse(0, poleH, 20, 6).fill(0x070b14);
  c.addChild(base, pole);

  const headY = -150;
  const board = new Graphics()
    .roundRect(-26, headY, 52, 156, 14).fill(0x0c1220)
    .roundRect(-26, headY, 52, 156, 14).stroke({ width: 2, color: 0x1c2a44 });
  c.addChild(board);

  const defs = [
    { key: 'RED', y: headY + 30, color: STATE_COLOR.RED },
    { key: 'YELLOW', y: headY + 78, color: STATE_COLOR.YELLOW },
    { key: 'GREEN', y: headY + 126, color: STATE_COLOR.GREEN },
  ];
  const bulbs = defs.map((d) => {
    const glow = new Sprite(radialTexture(rgba(d.color, 0.95), 256));
    glow.anchor.set(0.5);
    glow.width = glow.height = 104;
    glow.x = 0; glow.y = d.y;
    glow.alpha = 0;
    const base2 = new Graphics()
      .circle(0, d.y, 17).fill(0x090d16)
      .circle(0, d.y, 17).stroke({ width: 1.5, color: 0x22304a });
    const lit = new Graphics().circle(0, d.y, 15).fill(d.color);
    lit.alpha = 0;
    const hood = new Graphics()
      .arc(0, d.y, 20, Math.PI * 1.05, Math.PI * 1.95).stroke({ width: 3, color: 0x060a12 });
    c.addChild(glow, base2, lit, hood);
    return { key: d.key, color: d.color, glow, lit, y: d.y, cur: 0 };
  });

  const beam = new Sprite(radialTexture('rgba(255,255,255,0.5)', 256));
  beam.anchor.set(0.5, 0);
  beam.width = 150; beam.height = 150;
  beam.x = 0; beam.y = 6;
  beam.alpha = 0;
  c.addChildAt(beam, 0);

  // elektr yoyi qatlami (short-circuit uchun — intro boshqaradi)
  const arc = new Graphics();
  c.addChild(arc);

  return { c, bulbs, beam, arc, headY };
}

/* ---------- har xil mashinalar ---------- */
function makeCar(color, type) {
  const c = new Container();
  const dark = shade(color, 0.55);
  const front = type === 'truck' ? 46 : type === 'suv' ? 42 : 40;

  const shadow = new Graphics().ellipse(0, 12, front + 4, 7).fill({ color: 0x000000, alpha: 0.35 });
  const body = new Graphics();
  const glass = new Graphics();

  if (type === 'truck') {
    body.roundRect(-6, -32, 52, 34, 3).fill(shade(color, 0.72))            // yuk qutisi
      .roundRect(-46, -17, 42, 25, 5).fill(color)                          // kabina
      .roundRect(-46, -17, 92, 25, 5).stroke({ width: 1.5, color: dark });
    glass.roundRect(-42, -13, 15, 9, 2).fill({ color: 0x9adfff, alpha: 0.85 });
  } else if (type === 'suv') {
    body.roundRect(-42, -15, 84, 24, 6).fill(color)
      .roundRect(-42, -15, 84, 24, 6).stroke({ width: 1.5, color: dark })
      .roundRect(-26, -31, 48, 17, 4).fill(shade(color, 0.82));
    glass.roundRect(-22, -29, 19, 12, 2).fill({ color: 0x9adfff, alpha: 0.85 })
      .roundRect(2, -29, 17, 12, 2).fill({ color: 0x9adfff, alpha: 0.85 });
  } else if (type === 'taxi') {
    body.roundRect(-38, -14, 76, 22, 7).fill(0xffce1a)
      .roundRect(-38, -14, 76, 22, 7).stroke({ width: 1.5, color: 0xb8860b })
      .moveTo(-20, -14).lineTo(-12, -28).lineTo(12, -28).lineTo(22, -14).closePath().fill(0xffe07a);
    for (let i = 0; i < 8; i++) body.rect(-30 + i * 8, -2, 4, 4).fill(i % 2 ? 0x111111 : 0xffffff);
    body.roundRect(-8, -34, 16, 6, 2).fill(0x1a1a1a);                       // tom belgisi
    glass.moveTo(-15, -15).lineTo(-9, -26).lineTo(-1, -26).lineTo(-1, -15).closePath().fill({ color: 0x9adfff, alpha: 0.85 })
      .moveTo(3, -15).lineTo(3, -26).lineTo(10, -26).lineTo(18, -15).closePath().fill({ color: 0x9adfff, alpha: 0.85 });
  } else { // sedan
    body.roundRect(-38, -14, 76, 22, 7).fill(color)
      .roundRect(-38, -14, 76, 22, 7).stroke({ width: 1.5, color: dark })
      .moveTo(-20, -14).lineTo(-12, -28).lineTo(12, -28).lineTo(22, -14).closePath().fill(shade(color, 0.8));
    glass.moveTo(-15, -15).lineTo(-9, -26).lineTo(-1, -26).lineTo(-1, -15).closePath().fill({ color: 0x9adfff, alpha: 0.85 })
      .moveTo(3, -15).lineTo(3, -26).lineTo(10, -26).lineTo(18, -15).closePath().fill({ color: 0x9adfff, alpha: 0.85 });
  }

  const wheels = new Graphics()
    .circle(-22, 8, 7).fill(0x0a0a0f).circle(-22, 8, 3).fill(0x2a2a34)
    .circle(22, 8, 7).fill(0x0a0a0f).circle(22, 8, 3).fill(0x2a2a34);
  const beam = new Graphics().poly([front, -8, front + 54, -20, front + 54, 6, front, 2]).fill({ color: 0xfff2b0, alpha: 0.16 });
  const headlight = new Graphics().circle(front, -6, 3).fill(0xfff2b0);
  const tail = new Graphics().roundRect(-front - 2, -8, 3, 6, 1).fill(0xff3b3b);
  tail.alpha = 0.5;
  const honk = new Graphics();

  c.addChild(shadow, beam, body, glass, wheels, headlight, tail, honk);
  return { c, tail, beam, honk, type, front, honkT: 0, honkTimer: 1 + Math.random() * 2.5 };
}

function drawHonk(g, k) {
  g.clear();
  if (k <= 0) return;
  const a = Math.min(1, k) * 0.9;
  g.arc(34, -30, 6, -0.85, 0.85).stroke({ width: 2, color: 0xffd21a, alpha: a });
  g.arc(34, -30, 11, -0.85, 0.85).stroke({ width: 2, color: 0xffd21a, alpha: a * 0.55 });
}

/* ---------- realistik odam (kutuvchi yoki o'tuvchi) ---------- */
function makePerson(coat, skin, hair) {
  const c = new Container();
  const shadow = new Graphics().ellipse(0, 3, 8, 2.6).fill({ color: 0x000000, alpha: 0.3 });
  const legR = new Graphics().roundRect(-1.7, 0, 3.4, 13, 1.4).fill(0x1c2942);
  const legL = new Graphics().roundRect(-1.7, 0, 3.4, 13, 1.4).fill(0x22304a);
  legR.x = 2.4; legL.x = -2.4; legR.y = legL.y = -13;
  const coatG = new Graphics().roundRect(-6.5, -31, 13, 21, 4).fill(coat);
  const armR = new Graphics().roundRect(-1.4, 0, 2.8, 15, 1.3).fill(shade(coat, 0.82));
  const armL = new Graphics().roundRect(-1.4, 0, 2.8, 15, 1.3).fill(shade(coat, 0.82));
  armR.x = 6.4; armL.x = -6.4; armR.y = armL.y = -30;
  const head = new Graphics().circle(0, -37, 5).fill(skin);
  const hairG = new Graphics().arc(0, -37, 5.2, Math.PI * 0.95, Math.PI * 2.05).fill(hair);
  c.addChild(shadow, legR, legL, coatG, armR, armL, head, hairG);
  return { c, legR, legL, armR, armL, head };
}

const COATS = [0x3a86ff, 0xef476f, 0x06d6a0, 0x8d99ae, 0xffd166, 0x9b5de5, 0xf15bb5, 0x00bbf9];
const SKINS = [0xf1c27d, 0xe0ac69, 0xc68642, 0xffdbac];
const HAIRS = [0x2a1a0a, 0x4a3020, 0x111111, 0x6b4a2a, 0x5a5a5a];
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---------- to'liq chorraha yig'ish ---------- */
export function assembleIntersection(app) {
  const tweens = createTweens();

  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.4, bloomScale: 1.05, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  // ----- osmon -----
  const skyC = new Container();
  app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#050a18', '#0a1430', '#132145', '#1b2a52']));
  skyC.addChild(sky);

  const starC = new Container();
  skyC.addChild(starC);
  const stars = [];
  for (let i = 0; i < 90; i++) {
    const g = new Graphics().circle(0, 0, 0.7 + Math.random() * 1.5).fill(0xeaf3ff);
    starC.addChild(g);
    stars.push({ g, fx: Math.random(), fy: Math.random(), b: 0.4 + Math.random() * 0.5, sp: 0.6 + Math.random() * 2.2, ph: Math.random() * 6.28 });
  }

  const moon = new Container();
  const moonGlow = new Sprite(radialTexture('rgba(190,215,255,0.16)', 512));
  moonGlow.anchor.set(0.5); moonGlow.width = moonGlow.height = 260;
  moon.addChild(moonGlow, new Graphics().circle(0, 0, 20).fill(0xeaf3ff));
  moon.addChild(new Graphics()
    .circle(-6, -3, 4).fill({ color: 0xc3d3e8, alpha: 0.7 })
    .circle(7, 5, 2.6).fill({ color: 0xc3d3e8, alpha: 0.6 }));
  skyC.addChild(moon);

  // ----- olam -----
  const root = new Container();
  app.stage.addChild(root);

  const horizonGlow = new Sprite(radialTexture('rgba(90,130,230,0.18)', 512));
  horizonGlow.anchor.set(0.5);
  horizonGlow.width = LW * 1.3; horizonGlow.height = 280;
  horizonGlow.x = LW / 2; horizonGlow.y = ROAD_TOP + 6;
  root.addChild(horizonGlow);

  const city = makeCity(root);

  // ----- yo'l -----
  const road = new Graphics();
  road.rect(0, ROAD_TOP, LW, LH - ROAD_TOP).fill(0x090d16);
  road.rect(0, ROAD_TOP, LW, 12).fill(0x111a2c);
  road.rect(0, ROAD_TOP, LW, 2).fill({ color: 0x00eeff, alpha: 0.35 });
  road.rect(0, LH - 16, LW, 16).fill(0x0d1524);
  for (let x = 0; x < LW; x += 54) road.rect(x, LANE_Y + 22, 30, 3).fill({ color: 0xffd700, alpha: 0.22 });
  road.rect(STOP_X - 6, ROAD_TOP + 26, 6, LH - ROAD_TOP - 46).fill({ color: 0xffffff, alpha: 0.28 });
  root.addChild(road);

  const zebra = new Graphics();
  for (let x = CROSS_X0; x < CROSS_X1; x += 18) {
    zebra.rect(x, ROAD_TOP + 28, 10, LH - ROAD_TOP - 50).fill({ color: 0xeaf3ff, alpha: 0.5 });
  }
  root.addChild(zebra);

  const particles = makeParticles(root);

  const lamps = [130, 900].map((x) => {
    const l = makeLamp(x);
    l.c.y = ROAD_TOP + 4;
    root.addChild(l.c);
    return l;
  });

  // ----- mashinalar (har xil turlar, zich navbat) -----
  const palette = [0x3a86ff, 0xff6b6b, 0xffd166, 0x06d6a0, 0xef476f, 0x8d99ae, 0xbdb2ff, 0xff9f1c];
  const types = ['sedan', 'sedan', 'suv', 'taxi', 'sedan', 'truck', 'suv', 'sedan'];
  const cars = [];
  let startX = -40;
  for (let i = 0; i < 8; i++) {
    const type = types[i % types.length];
    const car = makeCar(palette[i % palette.length], type);
    car.x = startX; car.v = 0; car.c.x = startX; car.c.y = LANE_Y;
    root.addChild(car.c);
    cars.push(car);
    startX -= 92 + Math.random() * 34;
  }

  // ----- kutib turgan piyodalar (trotuarda) -----
  const waiters = [];
  const waitSpots = [
    { x: CROSS_X0 - 26, y: LH - 6 }, { x: CROSS_X0 - 12, y: LH - 4 },
    { x: CROSS_X1 + 14, y: LH - 5 }, { x: CROSS_X0 - 20, y: ROAD_TOP + 20 },
    { x: CROSS_X1 + 20, y: ROAD_TOP + 18 }, { x: 180, y: LH - 5 }, { x: 300, y: LH - 4 },
  ];
  waitSpots.forEach((sp, i) => {
    const p = makePerson(rnd(COATS), rnd(SKINS), rnd(HAIRS));
    p.c.x = sp.x; p.c.y = sp.y;
    p.c.scale.set(0.92 + Math.random() * 0.16);
    root.addChild(p.c);
    waiters.push({ p, baseY: sp.y, ph: Math.random() * 6.28, look: Math.random() * 6.28 });
  });

  // ----- o'tuvchi piyoda (RED'da zebradan o'tadi) -----
  const crosser = makePerson(0x00c8ff, rnd(SKINS), 0x1a1a1a);
  crosser.c.x = MID_X;
  crosser.c.y = LH - 8;
  root.addChild(crosser.c);

  const signal = makeSignal();
  root.addChild(signal.c);

  return {
    app, tweens, particles,
    skyC, sky, starC, stars, moon,
    root, road, city, cars, signal, lamps, waiters, crosser,
    energyS: 0, walkT: 0, prevState: null,
  };
}

const CRUISE = 210; // px/s

// ctl = { state, connected, pedestrianCrossing, onGreen }
export function intersectionTick(scene, dt, t, ctl) {
  const { app, root, sky, starC, stars, moon, city, cars, signal, lamps, waiters, crosser, particles } = scene;
  const w = app.screen.width, h = app.screen.height;

  // ----- layout -----
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc);
  root.x = (w - LW * sc) / 2;
  root.y = h - LH * sc;
  moon.x = w - 150; moon.y = 110;

  stars.forEach((s) => {
    s.g.x = s.fx * w; s.g.y = s.fy * h * 0.5;
    s.g.alpha = s.b * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
  });

  city.tick(t);

  const state = ctl.state || 'RED';
  const green = state === 'GREEN';

  // ----- svetafor chiroqlari -----
  const flick = 0.9 + 0.1 * Math.sin(t * 9);
  signal.bulbs.forEach((b) => {
    const target = b.key === state ? 1 : 0;
    b.cur += (target - b.cur) * Math.min(dt * 9, 1);
    b.lit.alpha = b.cur;
    b.glow.alpha = b.cur * 0.85 * flick;
  });
  const active = STATE_COLOR[state] || STATE_COLOR.RED;
  signal.beam.tint = active;
  signal.beam.alpha = 0.10 + 0.05 * Math.sin(t * 4);

  if (scene.prevState !== state) {
    if (state === 'GREEN') {
      particles.burst(SIGNAL_X, ROAD_TOP - 24, 0x21e065, 18, 170);
      if (ctl.onGreen) ctl.onGreen();
    }
    scene.prevState = state;
  }

  // ----- mashinalar oqimi (car-following) + signal berish -----
  const GAP = 92;
  cars.sort((a, b) => a.x - b.x);
  for (let i = cars.length - 1; i >= 0; i--) {
    const car = cars[i];
    const ahead = cars[i + 1];
    let limit = Infinity;
    if (!green && car.x < STOP_X) limit = STOP_X;
    if (ahead) limit = Math.min(limit, ahead.x - GAP);

    const gapToLimit = limit === Infinity ? 9999 : limit - car.x;
    const desired = Math.max(0, Math.min(CRUISE, gapToLimit * 2.4));
    car.v += (desired - car.v) * Math.min(dt * 4, 1);
    if (car.v < 1.5) car.v = 0;
    car.x += car.v * dt;
    car.c.x = car.x;

    const stopped = car.v < 30 && !green;
    car.tail.alpha = stopped ? 0.95 : 0.45;
    car.beam.alpha = 0.5 + 0.4 * (car.v / CRUISE);

    // tiqilib qolgan mashina signal beradi (honk to'lqini)
    if (stopped && car.x < STOP_X) {
      car.honkTimer -= dt;
      if (car.honkTimer <= 0) { car.honkTimer = 1.1 + Math.random() * 2.4; car.honkT = 0.7; }
    } else car.honkTimer = 0.6 + Math.random() * 1.5;
    if (car.honkT > 0) { car.honkT -= dt; drawHonk(car.honk, car.honkT / 0.7); if (car.honkT <= 0) car.honk.clear(); }

    if (car.x > LW + 90) {
      const minX = Math.min(...cars.map((cc) => cc.x));
      car.x = minX - GAP - Math.random() * 46;
      car.v = 0; car.c.x = car.x;
    }
  }

  // ----- kutuvchi piyodalar (idle) -----
  waiters.forEach((wt, i) => {
    const bob = Math.sin(t * 1.6 + wt.ph) * 1.1;
    wt.p.c.y = wt.baseY + bob;
    // vaqti-vaqti bilan boshini burish
    wt.p.head.x = Math.sin(t * 0.5 + wt.look) * 1.2;
  });

  // ----- o'tuvchi piyoda -----
  const crossing = ctl.pedestrianCrossing && state === 'RED';
  const targetT = crossing ? 1 : 0;
  scene.walkT += (targetT - scene.walkT) * Math.min(dt * 1.6, 1);
  crosser.c.y = (LH - 8) - scene.walkT * (LH - 8 - (ROAD_TOP + 20));
  const step = crossing ? Math.sin(t * 8) : 0;
  crosser.legR.rotation = step * 0.5;
  crosser.legL.rotation = -step * 0.5;
  crosser.armR.rotation = -step * 0.4;
  crosser.armL.rotation = step * 0.4;
  crosser.c.alpha = (crossing || scene.walkT > 0.02) ? 1 : 0;

  // ----- ko'cha lampalari -----
  scene.energyS += ((ctl.connected ? 1 : 0.7) - scene.energyS) * Math.min(dt * 2, 1);
  lamps.forEach((l) => l.set(0.75 + 0.25 * scene.energyS));
}
