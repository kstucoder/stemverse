// ReactionIntro — "Asteroid Zarbasi" REALISTIK KINEMATIK cutscene (cross-section).
// Sof falokat voqeasi (introda qahramon va idish YO'Q):
//   1) Tinch tungi ZAMONAVIY shahar — har xil binolar, miltillovchi chiroqlar,
//      neon, mayoqlar, esayotgan shamol (fog + zarralar + shamol ovozi).
//   2) Osmonda ogohlantiruvchi qizil shu'la + uzoqda asteroid uchqunlaydi.
//   3) Asteroid atmosferani yorib tushadi — olovli iz, embers, kamera push-in.
//   4) ZARBA: oq flash, shockwave halqalari, chang buluti, debris, krater,
//      kuchli silkinish, shahar bir lahza olovda — chiroqlar o'chadi.
//   5) XAVFLI MODDA chaqmoqday kuch bilan yer qa'riga kirib ketadi: yashil-oq
//      elektr nayzasi, yoriq tomirlari, kristallar yonishi, chuqurlik shu'lasi.
//   6) Electra missiyani aytadi.
import { useMemo, useRef, useState } from 'react';
import { Container, Graphics, Sprite, Texture, TilingSprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import PixiStage from './pixi/PixiStage';
import { gradTexture, radialTexture } from './pixi/cityScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playThunder, playRift, playZap, playWhoosh, playBoom, playSizzle, startWind } from './gameAudio';

const LW = 1000, LH = 560, SURF = 300, IX = 520;
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (k) => k * k * (3 - 2 * k);
const rnd = (a = 1, b = 0) => b + Math.random() * (a - b);

// Kinematik xronologiya (soniya)
const T = { LETTER: 0.9, ENTRY: 1.7, DESCENT: 2.4, IMPACT: 4.25, SUBST: 4.85, END: 8.4 };

/* ---------- lokal tekstura yordamchilari ---------- */
function vignetteTexture(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.30, size / 2, size / 2, size * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.7, 'rgba(0,0,0,0.35)');
  g.addColorStop(1, 'rgba(2,3,7,0.92)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return Texture.from(cv);
}
function noiseTexture(size = 64) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return Texture.from(cv);
}

/* ---------- zarra tizimi (yumshoq sprite'lar: chang, tutun, embers) ---------- */
function makeFX(parent, tex) {
  const pool = [];
  return {
    spawn(o) {
      const s = new Sprite(tex); s.anchor.set(0.5);
      s.x = o.x; s.y = o.y; s.tint = o.tint; s.alpha = o.alpha ?? 1;
      s.blendMode = o.blend || 'normal'; s.rotation = Math.random() * 6.28;
      parent.addChild(s);
      pool.push({ s, base: o.size, vx: o.vx || 0, vy: o.vy || 0, g: o.g || 0,
        grow: o.grow || 0, spin: o.spin || 0, life: o.life, max: o.life, drag: o.drag ?? 1 });
    },
    tick(dt) {
      for (let i = pool.length - 1; i >= 0; i--) {
        const p = pool[i]; p.life -= dt;
        if (p.life <= 0) { p.s.destroy(); pool.splice(i, 1); continue; }
        p.vx *= Math.pow(p.drag, dt * 60); p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.g * dt;
        p.s.x += p.vx * dt; p.s.y += p.vy * dt; p.s.rotation += p.spin * dt;
        const prog = 1 - p.life / p.max;
        p.s.width = p.s.height = p.base * (1 + p.grow * prog);
        p.s.alpha = Math.min(1, prog * 6) * Math.min(1, p.life / (p.max * 0.5));
      }
    },
  };
}

/* ---------- zamonaviy shahar (2 qatlam, har xil binolar) ---------- */
function buildCity(parent) {
  const layers = [];

  const genSpecs = (x0, x1, hMin, hMax, gapMin, gapMax) => {
    const specs = []; let x = x0;
    while (x < x1) {
      const w = rnd(78, 40);
      const h = rnd(hMax, hMin);
      const roll = Math.random();
      const type = roll < 0.22 ? 'setback' : roll < 0.38 ? 'tapered' : roll < 0.5 ? 'spire' : 'flat';
      specs.push({ x: x + w / 2, w, h, type, tank: Math.random() < 0.3,
        neon: Math.random() < 0.34, neonC: Math.floor(rnd(3)), beacon: Math.random() < 0.42 });
      x += w + rnd(gapMax, gapMin);
    }
    return specs;
  };

  const makeLayer = (specs, tint, alpha, detail) => {
    const c = new Container(); c.alpha = alpha; parent.addChild(c);
    const items = [];
    specs.forEach((sp) => {
      const b = new Container(); b.x = sp.x; b.y = SURF; c.addChild(b);
      const body = new Graphics();
      body.rect(-sp.w / 2, -sp.h, sp.w, sp.h).fill(tint.body);
      body.rect(-sp.w / 2, -sp.h, 3, sp.h).fill({ color: tint.edge, alpha: 0.55 });   // chap yorug' qirra
      body.rect(sp.w / 2 - 2, -sp.h, 2, sp.h).fill({ color: 0x000000, alpha: 0.5 });   // o'ng soya
      body.rect(-sp.w / 2, -sp.h, sp.w, sp.h).stroke({ width: 1, color: tint.edge, alpha: 0.22 });
      let roofY = -sp.h;
      if (sp.type === 'setback') { const tw = sp.w * 0.62, th = rnd(30, 16); body.rect(-tw / 2, roofY - th, tw, th).fill(tint.body).stroke({ width: 1, color: tint.edge, alpha: 0.2 }); roofY -= th; }
      else if (sp.type === 'tapered') { body.poly([-sp.w / 2, roofY, sp.w / 2, roofY, sp.w * 0.28, roofY - 30, -sp.w * 0.28, roofY - 30]).fill(tint.body); roofY -= 30; }
      else if (sp.type === 'spire') { body.poly([-4, roofY, 4, roofY, 0, roofY - rnd(52, 34)]).fill(tint.edge); roofY -= 40; }
      b.addChild(body);
      if (sp.tank) b.addChild(new Graphics().roundRect(sp.w * 0.08, roofY - 12, 16, 12, 2).fill(tint.body).stroke({ width: 1, color: tint.edge, alpha: 0.3 }));

      let beacon = null;
      if (sp.beacon) {
        b.addChild(new Graphics().moveTo(0, roofY).lineTo(0, roofY - 26).stroke({ width: 1.5, color: tint.edge, alpha: 0.5 }));
        beacon = new Graphics().circle(0, roofY - 28, 2.4).fill(0xff2d55); b.addChild(beacon);
      }
      let neon = null;
      if (sp.neon) {
        const col = [0x00eaff, 0xff3d8b, 0x39e06a][sp.neonC];
        neon = new Graphics().rect(-sp.w / 2 + 4, -sp.h * (0.4 + Math.random() * 0.4), sp.w - 8, 3).fill(col);
        neon.alpha = 0.6; b.addChild(neon);
      }
      const wins = [];
      if (detail) {
        const cols = Math.max(2, Math.floor((sp.w - 10) / 11));
        const rows = Math.max(3, Math.floor((sp.h - 16) / 15));
        for (let r = 0; r < rows; r++) for (let cx = 0; cx < cols; cx++) {
          if (Math.random() < 0.16) continue;
          const cool = Math.random() < 0.3;
          const wg = new Graphics().rect(0, 0, 6, 8).fill(cool ? 0x9fdcff : 0xffcf7a);
          wg.x = -sp.w / 2 + 7 + cx * 11; wg.y = -sp.h + 8 + r * 15;
          const base = Math.random() < 0.15 ? 0 : 0.35 + Math.random() * 0.6;
          wg.alpha = base;
          wins.push({ g: wg, base, sp: 0.4 + Math.random() * 2.2, ph: Math.random() * 6.28, flick: Math.random() < 0.24 });
          b.addChild(wg);
        }
      }
      items.push({ wins, beacon, neon });
    });
    layers.push({ items });
  };

  // orqa qatlam (uzoq, xira, ko'kimtir — atmosfera perspektivasi)
  makeLayer(genSpecs(-40, LW + 60, 70, 165, 6, 22), { body: 0x0b1428, edge: 0x2a4a78 }, 0.7, false);
  // old qatlam (baland, batafsil, derazali)
  makeLayer(genSpecs(-30, LW + 40, 120, 236, 10, 30), { body: 0x090f1e, edge: 0x2f6096 }, 1, true);

  return {
    tick(t, dim) {
      layers.forEach((L) => L.items.forEach((it, i) => {
        it.wins.forEach((wn) => {
          let a = wn.base;
          if (wn.base > 0) {
            a *= wn.flick ? (0.55 + 0.45 * Math.sin(t * wn.sp + wn.ph)) * (Math.random() < 0.025 ? 0.25 : 1)
                          : (0.82 + 0.18 * Math.sin(t * wn.sp + wn.ph));
          }
          wn.g.alpha = a * dim;
        });
        if (it.beacon) it.beacon.alpha = (0.2 + 0.8 * Math.abs(Math.sin(t * 2.1 + i))) * dim;
        if (it.neon) it.neon.alpha = (0.4 + 0.4 * Math.sin(t * 3 + i)) * (Math.random() < 0.03 ? 0.2 : 1) * dim;
      }));
    },
  };
}

/* ---------- yashil elektr nayza ---------- */
function drawBolt(g, ytop, ybot, jitter) {
  const segs = Math.max(6, Math.floor((ybot - ytop) / 16));
  const pts = [[IX, ytop]];
  for (let i = 1; i <= segs; i++) {
    const x = IX + (Math.random() - 0.5) * jitter * (i / segs);
    pts.push([x, ytop + (ybot - ytop) * (i / segs)]);
  }
  const stroke = (ww, col, a) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke({ width: ww, color: col, alpha: a }); };
  stroke(9, 0x39e06a, 0.35);
  stroke(5, 0x9dff6a, 0.85);
  stroke(1.8, 0xf4ffe6, 0.95);
  for (let i = 2; i < pts.length - 1; i += 2) {
    const [px, py] = pts[i];
    g.moveTo(px, py).lineTo(px + (Math.random() - 0.5) * 70, py + 6 + Math.random() * 26)
      .stroke({ width: 2, color: 0x7dff5a, alpha: 0.55 });
  }
}

function buildIntroScene(app, ctlRef, onSceneDone) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.55, bloomScale: 1.1, brightness: 1.0, blur: 7, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const world = new Container(); app.stage.addChild(world);

  // ------- osmon -------
  const sky = new Sprite(gradTexture(['#05070f', '#0a0f26', '#0b1030', '#0a0a1c'])); sky.x = -250; sky.y = -250; sky.width = LW + 500; sky.height = SURF + 300; world.addChild(sky);
  const moonGlow = new Sprite(radialTexture('rgba(180,205,255,0.18)', 512)); moonGlow.anchor.set(0.5); moonGlow.width = moonGlow.height = 320; moonGlow.x = 205; moonGlow.y = 88; world.addChild(moonGlow);
  const moon = new Sprite(radialTexture('rgba(210,222,255,0.6)', 256)); moon.anchor.set(0.5); moon.width = moon.height = 104; moon.x = 205; moon.y = 88; world.addChild(moon);
  const starC = new Container(); world.addChild(starC); const stars = [];
  for (let i = 0; i < 90; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.4).fill(0xeaf3ff); g.x = Math.random() * LW; g.y = Math.random() * (SURF - 40); starC.addChild(g); stars.push({ g, b: 0.3 + Math.random() * 0.55, sp: 0.5 + Math.random() * 2, ph: Math.random() * 6.28 }); }

  // shamol fog qatlamlari (drift)
  const fogTex = radialTexture('rgba(150,175,225,0.09)', 512);
  const fogs = [];
  for (let i = 0; i < 3; i++) { const f = new Sprite(fogTex); f.anchor.set(0.5); f.width = 620 + i * 220; f.height = 120 + i * 40; f.x = Math.random() * LW; f.y = 90 + i * 70; f.blendMode = 'add'; world.addChild(f); fogs.push({ f, sp: 24 + i * 14, y0: f.y }); }

  // ogohlantiruvchi qizil shu'la
  const warn = new Sprite(radialTexture('rgba(255,70,30,0.55)', 256)); warn.anchor.set(0.5); warn.width = 560; warn.height = 340; warn.x = 760; warn.y = 40; warn.alpha = 0; warn.blendMode = 'add'; world.addChild(warn);

  // ------- zamonaviy shahar -------
  const cityGlow = new Sprite(radialTexture('rgba(70,110,210,0.16)', 512)); cityGlow.anchor.set(0.5); cityGlow.width = LW * 1.3; cityGlow.height = 260; cityGlow.x = LW / 2; cityGlow.y = SURF + 6; cityGlow.blendMode = 'add'; world.addChild(cityGlow);
  const city = buildCity(world);

  // ------- yer kesimi (qatlamlar + chuqurlik) -------
  const earth = new Graphics();
  earth.rect(-250, SURF, LW + 500, 5).fill(0x33405a);
  [[SURF, SURF + 95, 0x2c1e12], [SURF + 95, SURF + 190, 0x241820], [SURF + 190, LH + 60, 0x10131f]].forEach(([y0, y1, col]) => earth.rect(-250, y0, LW + 500, y1 - y0).fill(col));
  for (let i = 0; i < 140; i++) earth.circle(Math.random() * LW, SURF + 8 + Math.random() * (LH - SURF), 2 + Math.random() * 4).fill({ color: 0x000000, alpha: 0.2 });
  world.addChild(earth);
  const gems = [];
  for (let i = 0; i < 14; i++) { const g = new Graphics().poly([0, -6, 4, 0, 0, 6, -4, 0]).fill(0x2e4a44); g.x = 70 + Math.random() * 860; g.y = SURF + 195 + Math.random() * 70; g.alpha = 0.5; world.addChild(g); gems.push({ g, y: g.y, col: [0x8ff4c0, 0x9dff6a, 0x6bff8a][i % 3] }); }

  const deepGlow = new Sprite(radialTexture('rgba(120,255,120,0.7)', 256)); deepGlow.anchor.set(0.5); deepGlow.width = 200; deepGlow.height = 240; deepGlow.x = IX; deepGlow.blendMode = 'add'; deepGlow.alpha = 0; world.addChild(deepGlow);
  const veinG = new Graphics(); world.addChild(veinG);
  const crater = new Graphics(); world.addChild(crater);
  const bolt = new Graphics(); world.addChild(bolt);

  const veins = [];
  (function branch(x, y, ang, len, depth) {
    if (depth <= 0 || len < 9) return;
    const nx = x + Math.cos(ang) * len, ny = clamp(y + Math.sin(ang) * len, SURF, LH + 30);
    veins.push({ x1: x, y1: y, x2: nx, y2: ny, rev: (Math.min(ny, LH) - SURF) / (LH - SURF), w: 1 + depth * 0.6 });
    branch(nx, ny, ang + (Math.random() - 0.5) * 0.8, len * 0.78, depth - 1);
    if (Math.random() < 0.65) branch(nx, ny, ang + (Math.random() - 0.5) * 1.5, len * 0.62, depth - 1);
  })(IX, SURF, Math.PI / 2, 62, 6);

  // ------- asteroid -------
  const shock = new Graphics(); world.addChild(shock);
  const meteor = new Container(); meteor.visible = false; world.addChild(meteor);
  const mTrail = new Sprite(radialTexture('rgba(255,140,60,0.9)', 256)); mTrail.anchor.set(0.5, 0.5); mTrail.width = 320; mTrail.height = 46; mTrail.rotation = Math.PI * 0.72; mTrail.x = 90; mTrail.y = -90; mTrail.blendMode = 'add'; meteor.addChild(mTrail);
  const mGlow = new Sprite(radialTexture('rgba(255,210,120,0.98)', 256)); mGlow.anchor.set(0.5); mGlow.width = mGlow.height = 96; mGlow.blendMode = 'add'; meteor.addChild(mGlow);
  const mCore = new Graphics();
  { const pts = []; for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28; const r = 9 + Math.random() * 5; pts.push(Math.cos(a) * r, Math.sin(a) * r); } mCore.poly(pts).fill(0x3a2a20).stroke({ width: 1.5, color: 0xffb060, alpha: 0.8 }); }
  meteor.addChild(mCore);

  // ------- yer qa'riga kirayotgan modda yadrosi (qizigan asteroid bo'lagi) -------
  const subCore = new Container(); subCore.visible = false; world.addChild(subCore);
  const scGlow = new Sprite(radialTexture('rgba(140,255,150,0.9)', 256)); scGlow.anchor.set(0.5); scGlow.width = scGlow.height = 88; scGlow.blendMode = 'add'; subCore.addChild(scGlow);
  const scHot = new Sprite(radialTexture('rgba(255,205,130,0.95)', 256)); scHot.anchor.set(0.5); scHot.width = scHot.height = 44; scHot.blendMode = 'add'; subCore.addChild(scHot);
  const scRock = new Graphics();
  { const pts = []; for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28; const r = 8 + Math.random() * 4; pts.push(Math.cos(a) * r, Math.sin(a) * r); } scRock.poly(pts).fill(0x2e1d10).stroke({ width: 1.6, color: 0x9dff6a, alpha: 0.95 }); }
  subCore.addChild(scRock);

  // ------- zarra tizimlari -------
  const softTex = radialTexture('rgba(255,255,255,0.85)', 128);
  const smoke = makeFX(world, softTex);
  const embers = makeFX(world, softTex);
  const debris = [];

  // shamol zarralari (uchayotgan chang/barg) — o'ngdan chapga esadi
  const windC = new Container(); world.addChild(windC);
  const winds = [];
  for (let i = 0; i < 46; i++) {
    const s = new Sprite(softTex); s.anchor.set(0.5); s.tint = 0xbcd0f0; s.blendMode = 'add';
    s.width = s.height = 2 + Math.random() * 5; s.x = Math.random() * LW; s.y = Math.random() * (SURF - 10);
    s.alpha = 0.05 + Math.random() * 0.14; windC.addChild(s);
    winds.push({ s, sp: 60 + Math.random() * 110, amp: 6 + Math.random() * 16, ph: Math.random() * 6.28, base: s.alpha, y0: s.y });
  }

  // ------- ekran-fazoviy qatlamlar -------
  const grade = new Graphics().rect(0, 0, 10, 10).fill(0x0a1430); grade.alpha = 0.28; grade.blendMode = 'multiply'; app.stage.addChild(grade);
  const warmOv = new Graphics().rect(0, 0, 10, 10).fill(0xff8434); warmOv.alpha = 0; warmOv.blendMode = 'add'; app.stage.addChild(warmOv);
  const greenOv = new Graphics().rect(0, 0, 10, 10).fill(0x2bd45f); greenOv.alpha = 0; greenOv.blendMode = 'add'; app.stage.addChild(greenOv);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xfff4e2); flash.alpha = 0; app.stage.addChild(flash);
  const vign = new Sprite(vignetteTexture()); vign.alpha = 0.85; app.stage.addChild(vign);
  const grain = new TilingSprite({ texture: noiseTexture(), width: 10, height: 10 }); grain.alpha = 0.05; grain.blendMode = 'add'; app.stage.addChild(grain);
  const barTop = new Graphics(); const barBot = new Graphics(); app.stage.addChild(barTop, barBot);

  // ------- audio: shamol ambiyensi -------
  const stopWind = startWind();

  let t = 0, done = false, impacted = false, substarted = false, whooshed = false;
  let flashA = 0, warmA = 0, greenA = 0, boltP = 0, substP = 0, rumbleAcc = 0, camShake = 0;
  let windGust = 1, cityDim = 1;
  const rings = [];
  const cam = { zoom: 1, fx: LW / 2, fy: LH / 2 };

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  function doImpact() {
    impacted = true; meteor.visible = false; warn.alpha = 0;
    flashA = 1; warmA = 0.7; windGust = 3.2;
    playBoom(); playRift(); playThunder();
    useGameStore.getState().triggerShake(24); camShake = 1;
    rings.push({ r: 0, sp: 720, w: 11 }, { r: 0, sp: 480, w: 7 });
    crater.clear();
    crater.ellipse(IX, SURF + 4, 96, 20).fill(0x0a0a0f);
    crater.moveTo(IX - 120, SURF).quadraticCurveTo(IX, SURF + 34, IX + 120, SURF).stroke({ width: 4, color: 0x1a1208 });
    for (let i = 0; i < 22; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      smoke.spawn({ x: IX + (Math.random() - 0.5) * 70, y: SURF - 4, tint: [0x5a4c3c, 0x6b5d4a, 0x40372c][i % 3],
        size: 60 + Math.random() * 70, vx: Math.cos(a) * (60 + Math.random() * 120), vy: Math.sin(a) * (70 + Math.random() * 130) - 30,
        g: 26, grow: 2.2, spin: (Math.random() - 0.5) * 1.2, life: 2.2 + Math.random() * 1.6, drag: 0.965 });
    }
    for (let i = 0; i < 40; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      embers.spawn({ x: IX, y: SURF - 6, tint: [0xffb040, 0xff7a2a, 0xffe089][i % 3], blend: 'add',
        size: 6 + Math.random() * 10, vx: Math.cos(a) * (120 + Math.random() * 320), vy: Math.sin(a) * (140 + Math.random() * 320),
        g: 240, grow: -0.4, life: 0.7 + Math.random() * 1.1, drag: 0.98 });
    }
    for (let i = 0; i < 20; i++) {
      const g = new Graphics();
      const pts = []; const rr = 4 + Math.random() * 7; for (let k = 0; k < 6; k++) { const aa = (k / 6) * 6.28; const r = rr * (0.6 + Math.random() * 0.6); pts.push(Math.cos(aa) * r, Math.sin(aa) * r); }
      g.poly(pts).fill(0x2a2018).stroke({ width: 1, color: 0xffa050, alpha: 0.5 });
      g.x = IX; g.y = SURF - 6; world.addChild(g);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const sp = 200 + Math.random() * 340;
      debris.push({ g, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, spin: (Math.random() - 0.5) * 12, life: 1.4 + Math.random() * 1.2 });
    }
  }

  function startSubstance() {
    substarted = true; playZap(); playSizzle();
    useGameStore.getState().triggerShake(10); camShake = Math.max(camShake, 0.7);
  }

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    const w = app.screen.width, h = app.screen.height;

    // ----- kamera (fit + push-in + shake) -----
    const fit = Math.min(w / LW, h / LH);
    let zoom = 1;
    if (t > T.DESCENT) zoom = 1 + smooth(clamp((t - T.DESCENT) / (T.IMPACT - T.DESCENT), 0, 1)) * 0.07;
    if (impacted) zoom = 1.075 + Math.max(0, 0.05 * camShake);
    cam.zoom += (zoom - cam.zoom) * Math.min(dt * 6, 1);
    const tfx = lerp(LW / 2, IX, t > T.DESCENT ? 0.5 : 0), tfy = lerp(LH / 2, SURF + 40, t > T.DESCENT ? 0.5 : 0);
    cam.fx += (tfx - cam.fx) * Math.min(dt * 3, 1); cam.fy += (tfy - cam.fy) * Math.min(dt * 3, 1);
    camShake = Math.max(0, camShake - dt * 1.8);
    const sh = camShake * 10;
    const sc = fit * cam.zoom;
    world.scale.set(sc);
    world.x = w / 2 - cam.fx * sc + (Math.random() - 0.5) * sh;
    world.y = h / 2 - cam.fy * sc + (Math.random() - 0.5) * sh;

    // ----- ekran qatlamlari layout -----
    [flash, warmOv, greenOv, grade].forEach(o => { o.width = w; o.height = h; });
    vign.width = w; vign.height = h; grain.width = w; grain.height = h;
    grain.tilePosition.set(Math.random() * 64, Math.random() * 64);
    const barH = h * 0.085 * smooth(clamp(t / T.LETTER, 0, 1));
    barTop.clear().rect(0, 0, w, barH).fill(0x000000);
    barBot.clear().rect(0, h - barH, w, barH).fill(0x000000);

    // ----- shamol (gust silliqlanadi) -----
    windGust += (1 - windGust) * Math.min(dt * 1.5, 1);
    const gustNow = windGust * (1 + 0.35 * Math.sin(t * 0.7) + 0.2 * Math.sin(t * 1.9));
    fogs.forEach((o) => { o.f.x -= o.sp * gustNow * dt; if (o.f.x < -350) o.f.x = LW + 350; o.f.y = o.y0 + Math.sin(t * 0.5 + o.sp) * 10; });
    winds.forEach((o) => {
      o.s.x -= o.sp * gustNow * dt; o.s.y = o.y0 + Math.sin(t * 1.3 + o.ph) * o.amp;
      if (o.s.x < -12) { o.s.x = LW + 12; o.y0 = Math.random() * (SURF - 10); }
      o.s.alpha = o.base * clamp(gustNow, 0.5, 3) * (impacted ? 0.4 : 1);
    });

    // ----- yulduzlar + shahar (miltillovchi chiroqlar) -----
    stars.forEach(s => { s.g.alpha = s.b * (0.4 + 0.5 * Math.sin(t * s.sp + s.ph)); });
    if (impacted) cityDim += ((boltP > 0.05 ? 0.35 : 0.7) - cityDim) * Math.min(dt * 2, 1);
    const dimNow = clamp(cityDim + flashA * 0.8, 0, 1.4);
    city.tick(t, dimNow);

    // ----- ogohlantiruvchi shu'la -----
    if (t > T.ENTRY && !impacted) warn.alpha = clamp((t - T.ENTRY) / 1.6, 0, 1) * (0.55 + 0.45 * Math.sin(t * 9)) * 0.7;

    // ----- asteroid tushishi -----
    if (!impacted && t >= T.ENTRY && t < T.IMPACT) {
      if (!whooshed) { whooshed = true; playWhoosh(); }
      meteor.visible = true;
      const k = smooth(clamp((t - T.ENTRY) / (T.IMPACT - T.ENTRY), 0, 1));
      const ak = k * k;
      meteor.x = lerp(1210, IX, ak); meteor.y = lerp(-200, SURF - 6, ak); meteor.scale.set(0.35 + ak * 1.05);
      mTrail.alpha = 0.5 + 0.5 * Math.sin(t * 30);
      warmA = Math.max(warmA, ak * 0.35);
      windGust = Math.max(windGust, 1 + ak * 1.4); // yaqinlashganda shamol kuchayadi
      if (k > 0.15 && Math.random() < 0.9) {
        embers.spawn({ x: meteor.x - Math.cos(0.72) * 30, y: meteor.y - Math.sin(0.72) * 30, tint: [0xffcf7a, 0xff8a3a][Math.random() < 0.5 ? 0 : 1], blend: 'add',
          size: 5 + Math.random() * 8, vx: -120 - Math.random() * 120, vy: -120 - Math.random() * 120, g: 40, grow: -0.5, life: 0.4 + Math.random() * 0.5, drag: 0.97 });
      }
    } else if (!impacted && t >= T.IMPACT) {
      doImpact();   // frame-rate'dan qat'i nazar aynan bir marta ishga tushadi
    }

    // ----- xavfli modda yer qa'riga -----
    if (impacted && t >= T.SUBST) {
      if (!substarted) startSubstance();
      substP += dt * 0.8;
      boltP = clamp(substP, 0, 1);
      const depthK = 1 - (1 - boltP) * (1 - boltP);          // easeOut — modda YER QA'RIGA shiddat bilan kiradi
      const ybot = SURF + depthK * (LH - SURF - 8);
      bolt.clear();
      // chaqmoq sirtdan modda yadrosigacha ulanadi (yadro pastga kirib boradi)
      drawBolt(bolt, SURF, ybot, (substP < 1.5 ? 30 : 12) + 20 * Math.sin(t * 22));
      // modda yadrosi — chaqmoq bilan birga chuqurga kirib boradi
      subCore.visible = true;
      subCore.x = IX + Math.sin(t * 16) * 3; subCore.y = ybot;
      const scP = 0.82 + 0.18 * Math.sin(t * 20);
      scGlow.scale.set(scP * (1 + depthK * 0.4)); scHot.scale.set(scP);
      scRock.rotation += dt * 3.5;
      veinG.clear();
      const pulse = 0.45 + 0.35 * Math.sin(t * 6);
      veins.forEach(v => { if (v.rev <= boltP + 0.05) { const a = clamp((boltP - v.rev) * 3, 0, 1); veinG.moveTo(v.x1, v.y1).lineTo(v.x2, v.y2).stroke({ width: v.w, color: 0x7dff5a, alpha: a * pulse }); } });
      deepGlow.y = ybot; deepGlow.alpha = Math.min(0.75, boltP) * (0.7 + 0.3 * Math.sin(t * 5));
      deepGlow.width = 120 + boltP * 160; deepGlow.height = 140 + boltP * 220;
      greenA = clamp(substP * 0.5, 0, 0.4) * (0.7 + 0.3 * Math.sin(t * 4));
      gems.forEach(gm => { const on = clamp((boltP - (gm.y - SURF) / (LH - SURF)) * 3, 0, 1); gm.g.alpha = 0.5 + on * 0.5; gm.g.scale.set(1 + on * 0.5); if (on > 0) gm.g.clear().poly([0, -6, 4, 0, 0, 6, -4, 0]).fill(gm.col); });
      rumbleAcc += dt;
      if (substP < 1.4 && rumbleAcc > 0.42) { rumbleAcc = 0; playThunder(); useGameStore.getState().triggerShake(6); camShake = Math.max(camShake, 0.4); if (Math.random() < 0.6) playSizzle(); }
      if (substP < 1.5 && Math.random() < 0.5) embers.spawn({ x: IX + (Math.random() - 0.5) * 46, y: ybot, tint: 0x9dff6a, blend: 'add', size: 5 + Math.random() * 7, vx: (Math.random() - 0.5) * 120, vy: -40 - Math.random() * 120, g: 120, grow: -0.4, life: 0.5 + Math.random() * 0.6, drag: 0.97 });
    }

    // ----- debris -----
    for (let i = debris.length - 1; i >= 0; i--) {
      const d = debris[i]; d.life -= dt; if (d.life <= 0) { d.g.destroy(); debris.splice(i, 1); continue; }
      d.vy += 520 * dt; d.g.x += d.vx * dt; d.g.y += d.vy * dt; d.g.rotation += d.spin * dt;
      if (d.g.y > SURF - 4 && d.vy > 0) { d.vy *= -0.32; d.vx *= 0.5; d.g.y = SURF - 4; }
      d.g.alpha = Math.min(1, d.life);
    }

    // ----- flash / shockwave / overlaylar -----
    flashA = Math.max(0, flashA - dt * 2.4); flash.alpha = flashA;
    warmA = Math.max(0, warmA - dt * (impacted ? 1.3 : 0.4)); warmOv.alpha = Math.min(0.6, warmA);
    greenOv.alpha = greenA;
    grade.alpha = 0.28 - warmA * 0.15;
    shock.clear();
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.r += r.sp * dt; const a = Math.max(0, 1 - r.r / 620);
      if (a <= 0) { rings.splice(i, 1); continue; }
      shock.circle(IX, SURF, r.r).stroke({ width: r.w * a + 1, color: 0xffd9a8, alpha: a * 0.8 });
    }

    smoke.tick(dt); embers.tick(dt);
    if (!done && t > T.END) { done = true; onSceneDone(); }
  });

  return () => { stopWind(0.3); };
}

export default function ReactionIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#04060c' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#94a3b8', background: 'rgba(11,17,32,0.7)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox name="ELECTRA" role="Qutqaruv muhandisi" lines={LINES} actionLabel="☢️ Chuqurlikka tush" onAction={onStart} accent="#ffb020" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}

const LINES = [
  { text: "Ko'rdingmi?! Osmondan asteroid tushdi va to'g'ridan-to'g'ri shahar chetiga urildi — zarbadan butun yer larzaga keldi!", emotion: 'worried' },
  { text: "Undan chiqqan XAVFLI modda chaqmoqday kuch bilan yer qa'riga — juda chuqurga kirib ketdi. U atrofni zaharlab, tarqalyapti.", emotion: 'worried' },
  { text: "Uni topib, maxsus idishga solib zararsizlantirish kerak. Buning uchun kimdir chuqurlikka tushishi shart — bu SEN, muhandis!", emotion: 'normal' },
  { text: "Platangga 2 tugma, LED va buzzer ula. 1-tugma bilan SAKRA, 2-tugma bilan EMAKLA, moddaga yetganda IKKALA tugmani BIRGA bos. Tayyormisan?", emotion: 'excited' },
];
