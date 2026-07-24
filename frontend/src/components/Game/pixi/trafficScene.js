// trafficScene — VOLTRA Svetafor olamining PixiJS qurilishi.
// Energy City bilan BITTA vizual til: tungi shahar, glow, bloom, tween, particle.
// Sahnadagi HAMMA narsa haqiqiy Arduino signalidan jonlanadi:
//   STATE:RED/YELLOW/GREEN → chiroqlar + mashinalar oqimi
//   BTN (D2)               → piyoda zebradan o'tadi
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline, makeLamp } from './cityScene';
import { createTweens, Eases } from './tween';

export const LW = 1000;
export const LH = 560;
export const ROAD_TOP = 372;   // yo'lning uzoq cheti
export const LANE_Y = 474;     // mashina yo'lagi markazi
export const STOP_X = 592;     // to'xtash chizig'i (zebradan oldin)
export const CROSS_X0 = 604;   // zebra boshlanishi
export const CROSS_X1 = 706;   // zebra tugashi
export const SIGNAL_X = 748;   // svetafor ustuni

const STATE_COLOR = { RED: 0xff2d30, YELLOW: 0xffc21a, GREEN: 0x21e065 };

/* ---------- rang yordamchilari ---------- */
function rgba(hex, a = 1) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  return `rgba(${r},${g},${b},${a})`;
}
function shade(hex, f) {
  const r = Math.min(255, ((hex >> 16) & 255) * f);
  const g = Math.min(255, ((hex >> 8) & 255) * f);
  const b = Math.min(255, (hex & 255) * f);
  return (r << 16) | (g << 8) | b;
}

/* ---------- svetafor boshi ---------- */
function makeSignal() {
  const c = new Container();
  c.x = SIGNAL_X;
  c.y = ROAD_TOP - 8;

  // ustun
  const pole = new Graphics()
    .rect(-4, 0, 8, LH - ROAD_TOP + 30).fill(0x11192b)
    .rect(-4, 0, 3, LH - ROAD_TOP + 30).fill({ color: 0x24324c, alpha: 0.7 });
  // ustun tagligi
  const base = new Graphics().ellipse(0, LH - ROAD_TOP + 30, 20, 6).fill(0x070b14);
  c.addChild(base, pole);

  // orqa panel (boshi tepada)
  const headY = -150;
  const board = new Graphics()
    .roundRect(-26, headY, 52, 156, 14).fill(0x0c1220)
    .roundRect(-26, headY, 52, 156, 14).stroke({ width: 2, color: 0x1c2a44 });
  // "kozir" — har chiroq uchun soyabon
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
    const lit = new Graphics()
      .circle(0, d.y, 15).fill(d.color);
    lit.alpha = 0;
    const hood = new Graphics()
      .arc(0, d.y, 20, Math.PI * 1.05, Math.PI * 1.95).stroke({ width: 3, color: 0x060a12 });
    c.addChild(glow, base2, lit, hood);
    return { key: d.key, color: d.color, glow, lit, y: d.y, cur: 0 };
  });

  // yo'lga tushadigan rangli shu'la
  const beam = new Sprite(radialTexture('rgba(255,255,255,0.5)', 256));
  beam.anchor.set(0.5, 0);
  beam.width = 150; beam.height = 150;
  beam.x = 0; beam.y = 6;
  beam.alpha = 0;
  c.addChildAt(beam, 0);

  return { c, bulbs, beam };
}

/* ---------- mashina ---------- */
function makeCar(color) {
  const c = new Container();
  const dark = shade(color, 0.55);
  // soya
  const shadow = new Graphics().ellipse(0, 12, 40, 7).fill({ color: 0x000000, alpha: 0.35 });
  // tana
  const body = new Graphics()
    .roundRect(-38, -14, 76, 22, 7).fill(color)
    .roundRect(-38, -14, 76, 22, 7).stroke({ width: 1.5, color: dark });
  // kabina
  const cabin = new Graphics()
    .moveTo(-20, -14).lineTo(-12, -28).lineTo(12, -28).lineTo(22, -14).closePath()
    .fill(shade(color, 0.8));
  // oynalar
  const glassC = new Graphics()
    .moveTo(-15, -15).lineTo(-9, -26).lineTo(-1, -26).lineTo(-1, -15).closePath().fill({ color: 0x9adfff, alpha: 0.85 })
    .moveTo(3, -15).lineTo(3, -26).lineTo(10, -26).lineTo(18, -15).closePath().fill({ color: 0x9adfff, alpha: 0.85 });
  // g'ildiraklar
  const wheels = new Graphics()
    .circle(-22, 8, 7).fill(0x0a0a0f).circle(-22, 8, 3).fill(0x2a2a34)
    .circle(22, 8, 7).fill(0x0a0a0f).circle(22, 8, 3).fill(0x2a2a34);
  // old far nurlari (o'ngga qaraydi)
  const beam = new Graphics()
    .poly([38, -8, 92, -20, 92, 6, 38, 2]).fill({ color: 0xfff2b0, alpha: 0.16 });
  beam.alpha = 0.9;
  const headlight = new Graphics().circle(38, -6, 3).fill(0xfff2b0);
  // orqa chiroq (chapda)
  const tail = new Graphics().roundRect(-40, -8, 3, 6, 1).fill(0xff3b3b);
  tail.alpha = 0.5;

  c.addChild(shadow, beam, body, cabin, glassC, wheels, headlight, tail);
  return { c, tail, beam, brakeGlow: tail };
}

/* ---------- piyoda ---------- */
function makePedestrian() {
  const c = new Container();
  const glow = new Sprite(radialTexture('rgba(0,238,255,0.35)', 128));
  glow.anchor.set(0.5);
  glow.width = glow.height = 46;
  glow.y = -14;
  const head = new Graphics().circle(0, -30, 6).fill(0xeaf3ff);
  const body = new Graphics()
    .moveTo(0, -24).lineTo(0, -8).stroke({ width: 5, color: 0x00c8ff })
    .moveTo(0, -20).lineTo(-7, -12).stroke({ width: 3, color: 0x00c8ff })
    .moveTo(0, -20).lineTo(7, -12).stroke({ width: 3, color: 0x00c8ff });
  const legL = new Graphics().moveTo(0, -8).lineTo(-5, 4).stroke({ width: 3.5, color: 0x0a9fd8 });
  const legR = new Graphics().moveTo(0, -8).lineTo(5, 4).stroke({ width: 3.5, color: 0x0a9fd8 });
  c.addChild(glow, legL, legR, body, head);
  return { c, legL, legR };
}

/* ---------- to'liq chorraha yig'ish ---------- */
export function assembleIntersection(app) {
  const tweens = createTweens();

  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.4, bloomScale: 1.05, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  // ----- osmon (ekran bo'yicha) -----
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

  // ----- olam (scale qilinadi) -----
  const root = new Container();
  app.stage.addChild(root);

  // gorizont shu'lasi
  const horizonGlow = new Sprite(radialTexture('rgba(80,120,220,0.16)', 512));
  horizonGlow.anchor.set(0.5);
  horizonGlow.width = LW * 1.3; horizonGlow.height = 260;
  horizonGlow.x = LW / 2; horizonGlow.y = ROAD_TOP + 6;
  root.addChild(horizonGlow);

  // orqa skyline (cityScene yordamchisini ROAD_TOP ga surib qo'yamiz)
  const sky1 = makeSkyline(110, 0x0a1226, 17); sky1.y = ROAD_TOP - 470; root.addChild(sky1);
  const sky2 = makeSkyline(160, 0x0d1730, 29); sky2.y = ROAD_TOP - 470; root.addChild(sky2);

  // ----- yo'l -----
  const road = new Graphics();
  road.rect(0, ROAD_TOP, LW, LH - ROAD_TOP).fill(0x090d16);
  // trotuar (uzoq chet)
  road.rect(0, ROAD_TOP, LW, 12).fill(0x111a2c);
  road.rect(0, ROAD_TOP, LW, 2).fill({ color: 0x00eeff, alpha: 0.35 });
  // yaqin chet (past)
  road.rect(0, LH - 16, LW, 16).fill(0x0d1524);
  // markaziy sariq uzuq chiziq
  for (let x = 0; x < LW; x += 54) road.rect(x, LANE_Y + 22, 30, 3).fill({ color: 0xffd700, alpha: 0.22 });
  // to'xtash chizig'i
  road.rect(STOP_X - 6, ROAD_TOP + 26, 6, LH - ROAD_TOP - 46).fill({ color: 0xffffff, alpha: 0.28 });
  root.addChild(road);

  // zebra (vertikal oq chiziqlar)
  const zebra = new Graphics();
  for (let x = CROSS_X0; x < CROSS_X1; x += 18) {
    zebra.rect(x, ROAD_TOP + 28, 10, LH - ROAD_TOP - 50).fill({ color: 0xeaf3ff, alpha: 0.5 });
  }
  root.addChild(zebra);

  const particles = makeParticles(root);

  // ko'cha chiroqlari (cityScene lampasi)
  const lamps = [130, 900].map((x) => {
    const l = makeLamp(x);
    l.c.y = ROAD_TOP + 4;
    root.addChild(l.c);
    return l;
  });

  // mashinalar (bitta yo'lak, o'ngga harakat)
  const palette = [0x3a86ff, 0xff6b6b, 0xffd166, 0x06d6a0, 0xef476f, 0x8d99ae, 0xbdb2ff];
  const cars = [];
  let startX = -60;
  for (let i = 0; i < 5; i++) {
    const car = makeCar(palette[i % palette.length]);
    car.x = startX;
    car.v = 0;
    car.c.x = startX;
    car.c.y = LANE_Y;
    root.addChild(car.c);
    cars.push(car);
    startX -= 96 + Math.random() * 40;
  }

  const signal = makeSignal();
  root.addChild(signal.c);

  const ped = makePedestrian();
  ped.c.x = (CROSS_X0 + CROSS_X1) / 2;
  ped.c.y = LH - 10;
  root.addChild(ped.c);

  return {
    app, tweens, particles,
    skyC, sky, starC, stars, moon,
    root, road, cars, signal, lamps, ped,
    // silliqlangan ichki holatlar
    energyS: 0, walkT: 0, prevState: null, flashT: 0,
  };
}

const CRUISE = 210; // px/s

// ctl = { state, connected, pedestrianCrossing, onGreen }
export function intersectionTick(scene, dt, t, ctl) {
  const { app, root, sky, starC, stars, moon, cars, signal, lamps, ped, particles } = scene;
  const w = app.screen.width, h = app.screen.height;

  // ----- layout -----
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc);
  root.x = (w - LW * sc) / 2;
  root.y = h - LH * sc;
  moon.x = w - 150; moon.y = 110;

  // yulduzlar
  stars.forEach((s) => {
    s.g.x = s.fx * w;
    s.g.y = s.fy * h * 0.5;
    s.g.alpha = s.b * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
  });

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
  // yo'lga tushgan rangli nur
  const active = STATE_COLOR[state] || STATE_COLOR.RED;
  signal.beam.tint = active;
  signal.beam.alpha = 0.10 + 0.05 * Math.sin(t * 4);

  // holat o'zgarganda GREEN portlashi
  if (scene.prevState !== state) {
    if (state === 'GREEN') {
      particles.burst(SIGNAL_X, ROAD_TOP - 24, 0x21e065, 18, 170);
      if (ctl.onGreen) ctl.onGreen();
    }
    scene.prevState = state;
  }

  // ----- mashinalar oqimi (car-following) -----
  const GAP = 90;
  cars.sort((a, b) => a.x - b.x); // chapdan-o'ngga
  for (let i = cars.length - 1; i >= 0; i--) {
    const car = cars[i];
    const ahead = cars[i + 1];
    let limit = Infinity;
    // qizil/sariqda to'xtash chizig'idan o'tmaslik (agar hali orqada bo'lsa)
    if (!green && car.x < STOP_X) limit = STOP_X;
    if (ahead) limit = Math.min(limit, ahead.x - GAP);

    const gapToLimit = limit === Infinity ? 9999 : limit - car.x;
    const desired = Math.max(0, Math.min(CRUISE, gapToLimit * 2.4));
    car.v += (desired - car.v) * Math.min(dt * 4, 1);
    if (car.v < 1.5) car.v = 0;
    car.x += car.v * dt;
    car.c.x = car.x;

    // tormoz chiroqlari sekinlaganda yorqin
    const braking = car.v < 40 && !green;
    car.brakeGlow.alpha = braking ? 0.9 : 0.45;
    car.beam.alpha = 0.5 + 0.4 * (car.v / CRUISE);

    // ekrandan chiqsa — navbat oxiriga qaytadi
    if (car.x > LW + 90) {
      const minX = Math.min(...cars.map((c) => c.x));
      car.x = minX - GAP - Math.random() * 50;
      car.v = 0;
      car.c.x = car.x;
    }
  }

  // ----- piyoda -----
  const crossing = ctl.pedestrianCrossing && state === 'RED';
  const targetT = crossing ? 1 : 0;
  scene.walkT += (targetT - scene.walkT) * Math.min(dt * 1.6, 1);
  // pastdan yuqoriga (yaqin trotuardan uzoqqa)
  ped.c.y = (LH - 10) - scene.walkT * (LH - 10 - (ROAD_TOP + 22));
  const step = Math.sin(t * 9) * (crossing ? 4 : 0);
  ped.legL.rotation = step * 0.05;
  ped.legR.rotation = -step * 0.05;
  ped.c.x = (CROSS_X0 + CROSS_X1) / 2 + (crossing ? 0 : Math.sin(t * 2) * 2);
  // kutayotganda yengil miltillash
  ped.c.alpha = crossing ? 1 : 0.55 + 0.25 * Math.sin(t * 3);

  // ----- ko'cha lampalari (tunda doim yoniq) -----
  scene.energyS += ((ctl.connected ? 1 : 0.6) - scene.energyS) * Math.min(dt * 2, 1);
  lamps.forEach((l) => l.set(0.7 + 0.3 * scene.energyS));
}
