// ⚡ VOLTRA Energy City — PixiJS Premium Edition
// Digital Twin: sahnadagi HAMMA narsa haqiqiy Arduino signallaridan jonlanadi.
//   LED (D13)  → binolar birin-ketin yonadi (kaskadli oynalar, portlash, glow)
//   BTN (D2)   → tramvay harakati
//   POT (A0)   → ko'cha chiroqlari yorqinligi + simlardagi energiya pulslari
// Klaviatura/sichqoncha bilan hech narsa qilib bo'lmaydi — faqat plata boshqaradi.
import { useEffect, useRef } from 'react';
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import PixiStage from './pixi/PixiStage';
import { createTweens, Eases } from './pixi/tween';
import ArduinoTwin from './ArduinoTwin';
import useGameStore from '../../stores/gameStore';
import { playTram, playCollect } from './gameAudio';

const LW = 1000, LH = 560;      // logik sahna o'lchami (root shu asosda scale qilinadi)
const GROUND_Y = 470;

/* ---------- texture helpers ---------- */

function gradTexture(stops, height = 512) {
  const cv = document.createElement('canvas');
  cv.width = 2; cv.height = height;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, height);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, height);
  return Texture.from(cv);
}

function radialTexture(color, size = 256) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return Texture.from(cv);
}

/* ---------- scene pieces ---------- */

function makeParticles(parent) {
  const pool = [];
  return {
    burst(x, y, color, n = 14, speed = 160) {
      for (let i = 0; i < n; i++) {
        const g = new Graphics().circle(0, 0, 1.5 + Math.random() * 2.2).fill({ color, alpha: 1 });
        g.x = x; g.y = y;
        const a = Math.random() * Math.PI * 2;
        const sp = speed * (0.3 + Math.random() * 0.7);
        pool.push({ g, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 50, life: 0.6 + Math.random() * 0.7 });
        parent.addChild(g);
      }
    },
    tick(dt) {
      for (let i = pool.length - 1; i >= 0; i--) {
        const p = pool[i];
        p.life -= dt;
        p.vy += 230 * dt;
        p.g.x += p.vx * dt;
        p.g.y += p.vy * dt;
        p.g.alpha = Math.max(p.life, 0);
        if (p.life <= 0) { p.g.destroy(); pool.splice(i, 1); }
      }
    },
  };
}

function makeBuildingSpecs() {
  // 8 ta bino — balandliklar "shahar ritmi" bilan: past-baland-past-eng baland...
  const rhythm = [150, 215, 130, 265, 175, 240, 115, 195];
  const specs = [];
  let x = 120;
  for (let i = 0; i < 8; i++) {
    const w = 58 + Math.random() * 26;
    specs.push({
      x: x + w / 2,
      w,
      h: rhythm[i] + Math.random() * 24,
      antenna: i % 3 === 1,
      tank: i % 4 === 2,
      setback: rhythm[i] > 200,
    });
    x += w + 34;
  }
  return specs;
}

function makeBuilding(spec, tweens, particles) {
  const c = new Container();
  c.x = spec.x;
  c.y = GROUND_Y;
  const roofY = -spec.h - (spec.setback ? 14 : 0);

  const body = new Graphics();
  body.rect(-spec.w / 2, -spec.h, spec.w, spec.h).fill(0x0c1424);
  if (spec.setback) body.rect(-spec.w * 0.3, -spec.h - 14, spec.w * 0.6, 14).fill(0x0a101d);
  body.rect(-spec.w / 2, -spec.h, 4, spec.h).fill({ color: 0x1b2e4e, alpha: 0.65 });
  body.rect(spec.w / 2 - 3, -spec.h, 3, spec.h).fill({ color: 0x050810, alpha: 0.8 });
  c.addChild(body);

  const trim = new Graphics();
  trim.moveTo(-spec.w / 2, -spec.h).lineTo(spec.w / 2, -spec.h).stroke({ width: 2, color: 0xffd700 });
  trim.alpha = 0.05;
  c.addChild(trim);

  // Oynalar — yonganda pastdan yuqoriga kaskad bilan yonadi
  const winC = new Container();
  const cols = Math.max(2, Math.floor((spec.w - 14) / 13));
  const rows = Math.max(3, Math.floor((spec.h - 20) / 17));
  const wins = [];
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      if (Math.random() < 0.14) continue;
      const cool = Math.random() < 0.12;
      const wg = new Graphics().rect(0, 0, 7, 9).fill(cool ? 0x7ff4ff : 0xffd76a);
      wg.x = -spec.w / 2 + 8 + col * 13;
      wg.y = -spec.h + 10 + r * 17;
      wg.alpha = 0;
      wins.push({ g: wg, row: r, on: 0, base: 0.5 + Math.random() * 0.5, phase: Math.random() * 6.28, spd: 0.6 + Math.random() * 2 });
      winC.addChild(wg);
    }
  }
  c.addChild(winC);

  let beacon = null;
  if (spec.antenna) {
    const ant = new Graphics().moveTo(0, roofY).lineTo(0, roofY - 22).stroke({ width: 1.5, color: 0x24466a });
    c.addChild(ant);
    beacon = new Graphics().circle(0, roofY - 24, 2.4).fill(0xff2d78);
    beacon.alpha = 0.12;
    c.addChild(beacon);
  }
  if (spec.tank) {
    c.addChild(new Graphics().roundRect(spec.w * 0.1, roofY - 10, 15, 10, 2).fill(0x122036));
  }

  let lit = false;
  return {
    c,
    spec,
    setLit(v) {
      if (v === lit) return false;
      lit = v;
      if (v) {
        // "pop" — bino jonlanadi
        tweens.add({ duration: 0.55, ease: Eases.outBack, update: (k) => { c.scale.y = 1 + 0.05 * Math.sin(k * Math.PI); } });
        tweens.add({ duration: 0.4, update: (k) => { trim.alpha = 0.05 + k * 0.95; } });
        wins.forEach((wn) => {
          tweens.add({ delay: (rows - 1 - wn.row) * 0.05, duration: 0.28, update: (k) => { wn.on = k; } });
        });
        particles.burst(spec.x, GROUND_Y - spec.h, 0xffd700, 16, 150);
      } else {
        tweens.add({ duration: 0.6, update: (k) => {
          trim.alpha = 0.05 + (1 - k) * 0.95;
          wins.forEach((wn) => { wn.on = 1 - k; });
        } });
      }
      return v; // yangi yonish bo'ldimi
    },
    tick(t, i) {
      wins.forEach((wn) => {
        wn.g.alpha = wn.on * wn.base * (0.85 + 0.15 * Math.sin(t * wn.spd + wn.phase));
      });
      if (beacon) beacon.alpha = lit ? 0.35 + 0.65 * Math.abs(Math.sin(t * 2.2 + i)) : 0.12;
    },
  };
}

function makeSkyline(specsY, color, seed) {
  const g = new Graphics();
  let x = -20;
  let i = 0;
  while (x < LW + 40) {
    const w = 34 + ((seed * (i + 3) * 37) % 46);
    const h = 40 + ((seed * (i + 7) * 53) % specsY);
    g.rect(x, GROUND_Y - h, w, h).fill(color);
    x += w + 6 + ((seed * i * 13) % 18);
    i++;
  }
  return g;
}

function makeLamp(x) {
  const c = new Container();
  c.x = x; c.y = GROUND_Y;
  const cone = new Graphics().poly([9, -42, 15, -42, 28, 0, -4, 0]).fill({ color: 0xffd76a, alpha: 1 });
  cone.alpha = 0;
  const pole = new Graphics()
    .moveTo(0, 0).lineTo(0, -46).stroke({ width: 2, color: 0x16273f })
    .moveTo(0, -46).lineTo(12, -46).stroke({ width: 2, color: 0x16273f });
  const bulb = new Graphics().circle(12, -44, 3).fill(0xffd76a);
  bulb.alpha = 0.08;
  c.addChild(cone, pole, bulb);
  return { c, set(v) { bulb.alpha = 0.08 + 0.92 * v; cone.alpha = 0.2 * v; } };
}

function makeTram() {
  const c = new Container();
  const light = new Graphics().poly([26, -8, 68, -3, 68, 2, 26, -1]).fill({ color: 0xffe9a0, alpha: 1 });
  light.alpha = 0.08;
  const body = new Graphics()
    .roundRect(-26, -13, 52, 15, 4).fill(0x123048)
    .roundRect(-26, -13, 52, 15, 4).stroke({ width: 1, color: 0x2a5a7a });
  const win = new Graphics();
  [-19, -5, 9].forEach((x) => win.roundRect(x, -10, 10, 6, 1.5).fill(0x9adfff));
  const wheels = new Graphics().circle(-14, 3, 3).fill(0x060a12).circle(14, 3, 3).fill(0x060a12);
  const glow = new Graphics().roundRect(-26, -14, 52, 2.5, 1.5).fill(0x00eeff);
  glow.alpha = 0.12;
  c.addChild(light, body, win, wheels, glow);
  c.y = GROUND_Y + 16;
  c.x = 200;
  return { c, glow, light };
}

function makeWires(specs, parent) {
  const wires = new Graphics();
  const curves = [];
  for (let i = 0; i < specs.length - 1; i++) {
    const a = specs[i], b = specs[i + 1];
    const p0 = { x: a.x, y: GROUND_Y - a.h - 6 };
    const p2 = { x: b.x, y: GROUND_Y - b.h - 6 };
    const pc = { x: (p0.x + p2.x) / 2, y: Math.max(p0.y, p2.y) + 26 };
    wires.moveTo(p0.x, p0.y).quadraticCurveTo(pc.x, pc.y, p2.x, p2.y).stroke({ width: 1, color: 0x123044, alpha: 0.9 });
    curves.push({ p0, pc, p2 });
  }
  parent.addChild(wires);
  const dots = curves.map((cv) => {
    const d = new Graphics().circle(0, 0, 2).fill(0x00eeff);
    d.alpha = 0;
    parent.addChild(d);
    return { cv, d, t: Math.random() };
  });
  return {
    // POT qiymati pulslar tezligini boshqaradi — energiya simlarda "oqadi"
    tick(dt, energy) {
      const spd = energy <= 1 ? 0 : 0.15 + (energy / 100) * 1.15;
      dots.forEach((o) => {
        if (spd === 0) { o.d.alpha = Math.max(0, o.d.alpha - dt * 2); return; }
        o.t = (o.t + spd * dt) % 1;
        const t = o.t, mt = 1 - t;
        o.d.x = mt * mt * o.cv.p0.x + 2 * mt * t * o.cv.pc.x + t * t * o.cv.p2.x;
        o.d.y = mt * mt * o.cv.p0.y + 2 * mt * t * o.cv.pc.y + t * t * o.cv.p2.y;
        o.d.alpha = 0.95;
      });
    },
  };
}

/* ---------- scene builder (PixiStage chaqiradi) ---------- */

function buildScene(app) {
  const tweens = createTweens();
  let t = 0;

  // Butun sahnaga bloom: threshold tufayli faqat yorug' piksellar "nurlanadi"
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.35, bloomScale: 1.1, brightness: 1.0, blur: 5, quality: 4 })];

  // --- Osmon (ekran bo'yicha, scale qilinmaydi) ---
  const skyC = new Container();
  app.stage.addChild(skyC);
  const skyNight = new Sprite(gradTexture(['#03040c', '#070c1a', '#0c1226']));
  const skyDay = new Sprite(gradTexture(['#1a1040', '#3a1e63', '#7a3e6e', '#c96b52']));
  skyDay.alpha = 0;
  skyC.addChild(skyNight, skyDay);

  const stars = [];
  const starC = new Container();
  skyC.addChild(starC);
  for (let i = 0; i < 110; i++) {
    const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.3).fill(0xeaf3ff);
    starC.addChild(g);
    stars.push({ g, fx: Math.random(), fy: Math.random(), b: 0.35 + Math.random() * 0.65, sp: 0.6 + Math.random() * 2.4, ph: Math.random() * 6.28 });
  }

  // Oy va quyosh — kun/tun almashishida crossfade
  const moon = new Container();
  moon.addChild(new Graphics().circle(0, 0, 24).fill(0xeaf3ff));
  const craters = new Graphics()
    .circle(-7, -4, 4.5).fill({ color: 0xc3d3e8, alpha: 0.7 })
    .circle(8, 6, 3).fill({ color: 0xc3d3e8, alpha: 0.6 })
    .circle(4, -9, 2.2).fill({ color: 0xc3d3e8, alpha: 0.5 });
  moon.addChild(craters);
  const sun = new Graphics().circle(0, 0, 30).fill(0xffd700);
  sun.alpha = 0;
  skyC.addChild(moon, sun);

  // Uchar yulduz
  const shoot = new Graphics().moveTo(0, 0).lineTo(-36, -13).stroke({ width: 1.5, color: 0xeaf3ff });
  shoot.alpha = 0;
  skyC.addChild(shoot);
  let shootTimer = 4;
  let shootLife = 0;

  // Tuman qatlamlari
  const fogTex = radialTexture('rgba(120,160,220,0.06)', 512);
  const fogA = new Sprite(fogTex); fogA.width = 700; fogA.height = 130;
  const fogB = new Sprite(fogTex); fogB.width = 900; fogB.height = 150;
  skyC.addChild(fogA, fogB);

  // --- Shahar (logik olam, scale qilinadi) ---
  const root = new Container();
  app.stage.addChild(root);

  root.addChild(makeSkyline(120, 0x080d18, 17));
  root.addChild(makeSkyline(180, 0x0a1120, 29));

  const particles = makeParticles(root);

  // Yo'l
  const road = new Graphics();
  road.rect(0, GROUND_Y, LW, LH - GROUND_Y).fill(0x060a12);
  road.rect(0, GROUND_Y + 1, LW, 9).fill({ color: 0x00eeff, alpha: 0.035 });
  road.moveTo(0, GROUND_Y).lineTo(LW, GROUND_Y).stroke({ width: 2, color: 0x00eeff, alpha: 0.3 });
  for (let x = 0; x < LW; x += 46) road.rect(x, GROUND_Y + 28, 22, 2).fill({ color: 0xffd700, alpha: 0.12 });
  root.addChild(road);

  // Binolar + yonish "glow pool"lari
  const specs = makeBuildingSpecs();
  const poolTex = radialTexture('rgba(255,215,0,0.55)', 256);
  const pools = specs.map((s) => {
    const p = new Sprite(poolTex);
    p.anchor.set(0.5);
    p.width = s.w * 1.7; p.height = 26;
    p.x = s.x; p.y = GROUND_Y + 8;
    p.alpha = 0;
    root.addChild(p);
    return p;
  });

  const wires = makeWires(specs, root);
  const buildings = specs.map((s) => {
    const b = makeBuilding(s, tweens, particles);
    root.addChild(b.c);
    return b;
  });

  const lamps = [70, 500, 930].map((x) => {
    const l = makeLamp(x);
    root.addChild(l.c);
    return l;
  });

  const tram = makeTram();
  root.addChild(tram.c);

  // --- Jonli holat (har frame store'dan o'qiladi) ---
  let dayAlpha = 0;
  let energyS = 0;
  let tramSpeed = 22;
  let prevLit = 0;
  let winFlash = 0;

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    tweens.tick(dt);
    particles.tick(dt);

    const w = app.screen.width, h = app.screen.height;

    // layout: osmon to'liq ekran, olam pastga yopishgan holda scale
    skyNight.width = skyDay.width = w;
    skyNight.height = skyDay.height = h;
    const sc = Math.min(w / LW, h / LH);
    root.scale.set(sc);
    root.x = (w - LW * sc) / 2;
    root.y = h - LH * sc;

    moon.x = w - 110; moon.y = 88;
    sun.x = w - 110; sun.y = 88;

    // --- Arduino holati ---
    const st = useGameStore.getState();
    const connected = st.arduinoConnected;
    const cs = st.cityState;
    const litCount = connected ? Math.floor(cs.buildingsLit) : 0;
    const energyT = connected ? cs.energyLevel : 0;
    const night = connected ? cs.isNight : true;
    const tramOn = connected ? cs.tramActive : false;

    // kun/tun crossfade
    dayAlpha += ((night ? 0 : 1) - dayAlpha) * Math.min(dt * 1.1, 1);
    skyDay.alpha = dayAlpha;
    moon.alpha = 1 - dayAlpha;
    sun.alpha = dayAlpha;
    starC.alpha = 1 - dayAlpha;

    stars.forEach((s) => {
      s.g.x = s.fx * w;
      s.g.y = s.fy * h * 0.55;
      s.g.alpha = s.b * (0.55 + 0.45 * Math.sin(t * s.sp + s.ph));
    });

    // uchar yulduz
    shootTimer -= dt;
    if (shootTimer <= 0) {
      shootTimer = 6 + Math.random() * 9;
      shoot.x = w * (0.1 + Math.random() * 0.5);
      shoot.y = 30 + Math.random() * 90;
      shootLife = 0;
    }
    shootLife += dt;
    if (shootLife < 0.9) {
      shoot.x += 500 * dt;
      shoot.y += 170 * dt;
      shoot.alpha = Math.max(0, 1 - shootLife / 0.9) * (1 - dayAlpha) * 0.9;
    } else shoot.alpha = 0;

    // tuman siljishi
    fogA.x = ((t * 7) % (w + 800)) - 700; fogA.y = h * 0.52;
    fogB.x = w - (((t * 4) % (w + 1000)) - 100) - 900; fogB.y = h * 0.62;

    // binolar (yangi yonish → ovoz + flash)
    buildings.forEach((b, i) => {
      if (b.setLit(i < litCount) && i < litCount) {
        playCollect();
        winFlash = 0.35;
      }
      b.tick(t, i);
      pools[i].alpha += (((i < litCount) ? 0.4 : 0) - pools[i].alpha) * Math.min(dt * 3, 1);
    });
    prevLit = litCount;

    // POT → chiroqlar + sim pulslari
    energyS += (energyT - energyS) * Math.min(dt * 2.5, 1);
    lamps.forEach((l) => l.set(energyS / 100));
    wires.tick(dt, energyS);

    // BTN → tramvay
    tramSpeed += ((tramOn ? 150 : 22) - tramSpeed) * Math.min(dt * 2, 1);
    tram.c.x += tramSpeed * dt;
    if (tram.c.x > LW + 80) tram.c.x = -80;
    tram.glow.alpha = tramOn ? 0.45 + 0.3 * Math.sin(t * 6) : 0.1;
    tram.light.alpha = tramOn ? 0.3 : 0.06;

    // yonish lahzasida butun sahna yengil "flash"
    if (winFlash > 0) {
      winFlash = Math.max(0, winFlash - dt);
      app.stage.alpha = 1 + winFlash * 0.15;
    } else app.stage.alpha = 1;
  });

  return () => tweens.clear();
}

/* ---------- React component ---------- */

export default function EnergyCity() {
  const score = useGameStore((s) => s.score);
  const cityState = useGameStore((s) => s.cityState);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const led = useGameStore((s) => s.serialData.led);
  const btn = useGameStore((s) => s.serialData.btn);
  const prevLed = useRef(led);
  const prevBtn = useRef(btn);

  // Ball FAQAT haqiqiy signal o'zgarishida (edge-triggered)
  useEffect(() => {
    if (led !== prevLed.current) {
      prevLed.current = led;
      if (led === 1) incrementScore(10);
    }
  }, [led, incrementScore]);
  useEffect(() => {
    if (btn !== prevBtn.current) {
      prevBtn.current = btn;
      if (btn === 1) { incrementScore(5); playTram(); }
    }
  }, [btn, incrementScore]);

  const lit = arduinoConnected ? Math.floor(cityState.buildingsLit) : 0;
  const energy = arduinoConnected ? cityState.energyLevel : 0;
  const happy = arduinoConnected ? Math.round(cityState.citizenHappiness) : 50;
  const progress = Math.min(lit / cityState.totalBuildings, 1);

  const panel = {
    background: 'rgba(11,17,32,0.82)',
    border: '1px solid rgba(0,238,255,0.12)',
    borderRadius: 12,
    padding: '7px 14px',
    backdropFilter: 'blur(8px)',
    fontFamily: 'Chakra Petch, monospace',
  };

  return (
    <PixiStage build={buildScene} className="rounded-xl">
      {/* Yuqori-chap: statlar */}
      <div className="absolute top-3 left-3 flex gap-2">
        {[
          { icon: '⭐', value: score, label: 'Ball', color: '#00EEFF' },
          { icon: '⚡', value: `${energy}%`, label: 'Quvvat', color: '#FFD700' },
          { icon: '😊', value: `${happy}%`, label: 'Baxt', color: '#FF2D78' },
        ].map((s) => (
          <div key={s.label} style={panel}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF', textShadow: `0 0 8px ${s.color}66` }}>
              {s.icon} {s.value}
            </div>
            <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Yuqori-o'ng: binolar hisobi */}
      <div className="absolute top-3 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF', textShadow: '0 0 8px rgba(0,238,255,0.4)' }}>
          {lit}/{cityState.totalBuildings}
        </div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>BINOLAR</div>
      </div>

      {/* Past-markaz: progress */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-56">
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #FFD700, #FF9F1C)',
            boxShadow: '0 0 12px rgba(255,215,0,0.5)',
            transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 9, marginTop: 3, color: '#64748b', fontFamily: 'Chakra Petch, monospace' }}>
          {Math.round(progress * 100)}% yoritildi
        </div>
      </div>

      {/* Past-o'ng: jonli mini-plata (Digital Twin ko'zgusi) */}
      <div className="absolute bottom-3 right-3">
        <ArduinoTwin />
      </div>

      {/* Signal kutish chipi — sahnani to'smaydi, shahar qorong'i turadi */}
      {!arduinoConnected && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(255,215,0,0.3)' }}>
          <span style={{ fontSize: 11, color: '#FFD700' }}>🔌 Arduino signali kutilmoqda — shahar qorong'ida...</span>
        </div>
      )}
    </PixiStage>
  );
}
