// ColorMixerIntro — "Kroma'ning So'nishi" kinematik cutscene.
// Xronika (ovoz bilan sinxron):
//   GULLASH  — kristall hayot taratadi, gullar ochilgan, kamalak porlaydi,
//              rang zarralari ko'tariladi (playShimmer)
//   YORIQ    — qorong'i yoriq ochiladi, silkinish (playRift)
//   SO'RILISH— ranglar oqim bo'lib yoriqqa so'riladi, gullar so'liydi, kamalak
//              o'chadi, dunyo kulrangga aylanadi (playDrain + playColorPop)
//   SUKUNAT  — jonsiz kulrang olam (playHollow) → Electra dialogi
import { useMemo, useRef, useState } from 'react';
import { Container, Graphics, ColorMatrixFilter } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import { assembleForge, forgeTick } from './pixi/colorScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playShimmer, playRift, playDrain, playColorPop, playHollow } from './gameAudio';

const RX = 500, RY = 64;           // yoriq (olam koordinatasi)
const RAINBOW = [0xff3b3b, 0xff7b1c, 0xffd166, 0x39e06a, 0x3b82ff, 0x9b5de5];

const LINES = [
  { text: "Ko'rdingmi?! Kroma olamini qorong'i yoriq yutib, barcha rangni o'ziga tortib ketdi...", emotion: 'worried' },
  { text: "Gullar so'ldi, kamalak o'chdi — endi hammayoq jonsiz, kulrang. Bu dahshat!", emotion: 'worried' },
  { text: "Rang yorug'likdan tug'iladi: qizil, yashil va ko'k. Platangga RGB LED va 3 potensiometrni ula.", emotion: 'normal' },
  { text: "Har potensiometr bitta kanalni boshqaradi — ularni aralashtirib olamga rangni qaytaramiz. Tayyormisan?", emotion: 'excited' },
];

const lerp = (a, b, k) => a + (b - a) * k;
const hueRGB = (h) => {
  const x = 1 - Math.abs(((h / 60) % 2) - 1);
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = 1; g = x; } else if (h < 120) { r = x; g = 1; }
  else if (h < 180) { g = 1; b = x; } else if (h < 240) { g = x; b = 1; }
  else if (h < 300) { r = x; b = 1; } else { r = 1; b = x; }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

/* gul — so'lish qobiliyati bilan */
function makeFlower(color) {
  const c = new Container();
  const stem = new Graphics().moveTo(0, 0).quadraticCurveTo(4, -18, 0, -34).stroke({ width: 3, color: 0x2f8f4f });
  const leaf = new Graphics().ellipse(7, -15, 6, 3).fill(0x3fae5f);
  const head = new Container(); head.y = -38;
  for (let i = 0; i < 6; i++) {
    const p = new Graphics().ellipse(0, -9, 5, 9).fill(color);
    p.rotation = (i / 6) * Math.PI * 2;
    head.addChild(p);
  }
  head.addChild(new Graphics().circle(0, 0, 5).fill(0xffd54a));
  c.addChild(stem, leaf, head);
  return { c, head };
}

/* kamalak (yuqori yoy) */
function makeRainbow() {
  const g = new Graphics();
  RAINBOW.forEach((col, i) => {
    g.arc(500, 500, 250 + i * 15, Math.PI * 1.1, Math.PI * 1.9).stroke({ width: 13, color: col, alpha: 0.5 });
  });
  return g;
}

function drawRift(g, open) {
  g.clear();
  if (open <= 0.01) return;
  const cx = RX, top = 16, len = 150 * open;
  g.ellipse(cx, top + len * 0.5, 30 * open, len * 0.62).fill({ color: 0x1a0426, alpha: 0.5 * open });
  let x = cx, y = top; g.moveTo(x, y);
  const segs = 8;
  for (let i = 0; i < segs; i++) { x = cx + (Math.random() - 0.5) * 24 * open; y = top + (len / segs) * (i + 1); g.lineTo(x, y); }
  g.stroke({ width: 2 * open + 0.5, color: 0xe0b3ff, alpha: 0.9 });
  y = top; g.moveTo(cx, y);
  for (let i = 0; i < segs; i++) { x = cx + (Math.random() - 0.5) * 10 * open; y = top + (len / segs) * (i + 1); g.lineTo(x, y); }
  g.stroke({ width: 1, color: 0xffffff, alpha: 0.75 * open });
}

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleForge(app);
  const cm = new ColorMatrixFilter();
  scene.root.filters = [cm];

  // intro'da maqsad-kristall va halqa kerak emas
  scene.targetCrystal.visible = false;
  scene.tHalo.visible = false;
  scene.ring.visible = false;

  // kamalak (kristall orqasida)
  const rainbow = makeRainbow();
  scene.root.addChildAt(rainbow, 1);

  // gullar (yer bo'ylab)
  const flowerDefs = [
    { x: 165, y: 458 }, { x: 275, y: 468 }, { x: 380, y: 460 },
    { x: 620, y: 460 }, { x: 725, y: 470 }, { x: 835, y: 458 },
    { x: 300, y: 502 }, { x: 700, y: 502 },
  ];
  const flowers = flowerDefs.map((d, i) => {
    const color = RAINBOW[i % RAINBOW.length];
    const f = makeFlower(color);
    f.c.x = d.x; f.c.y = d.y;
    scene.root.addChild(f.c);
    return { ...f, wx: d.x, wy: d.y, color };
  });

  // yoriq (olam qatlamida)
  const rift = new Graphics();
  scene.root.addChild(rift);

  // RANGLI OQIM — filtrsiz qatlam (root desaturatsiyasi ta'sir qilmaydi)
  const streamLayer = new Container();
  app.stage.addChild(streamLayer);
  const streams = [];

  // manba nuqtalari (gullar + kamalak + kristall)
  const sources = [];
  flowers.forEach((f) => sources.push({ x: f.wx, y: f.wy - 38, color: f.color }));
  for (let i = 0; i < 10; i++) {
    const ang = Math.PI * (1.12 + 0.72 * Math.random());
    sources.push({ x: 500 + Math.cos(ang) * (255 + Math.random() * 80), y: 500 + Math.sin(ang) * (255 + Math.random() * 80), color: RAINBOW[i % RAINBOW.length] });
  }
  sources.push({ x: 500, y: 250, color: 0xffffff });

  let t = 0, done = false;
  let riftOpen = 0, riftTarget = 0, sat = 1;
  let emitAcc = 0, popCount = 0;
  let shimmered = false, cracked = false, hollowed = false;

  ctlRef.current.skip = () => {
    if (done) return;
    done = true; sat = 0; riftTarget = 0.3;
    cm.reset(); cm.saturate(-1, false);
    onSceneDone();
  };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.tweens.tick(dt);
    scene.particles.tick(dt);

    if (!shimmered && t > 0.2) { shimmered = true; playShimmer(); }

    // ---- ssenariy ----
    let drainK = 0;
    if (t < 2.6) {
      // GULLASH — quvnoq rang zarralari
      if (Math.random() < 0.08) {
        const s = sources[Math.floor(Math.random() * flowers.length)];
        scene.particles.burst(s.x, s.y, s.color, 3, 90);
      }
    } else {
      if (!cracked) { cracked = true; riftTarget = 1; playRift(); playDrain(); useGameStore.getState().triggerShake(9); }
      drainK = Math.min((t - 2.7) / 3.1, 1);
      sat = 1 - drainK;
      if (!hollowed && drainK >= 1 && t > 5.9) { hollowed = true; done = true; playHollow(); onSceneDone(); }
    }

    riftOpen += (riftTarget - riftOpen) * Math.min(dt * 4, 1);
    drawRift(rift, riftOpen);

    // gullar so'liydi, kamalak o'chadi
    flowers.forEach((f, i) => {
      const wil = Math.min(1, Math.max(0, (drainK - i * 0.04) * 1.3));
      f.head.rotation = wil * 0.95;
      f.head.y = -38 + wil * 12;
      f.head.scale.set(1 - wil * 0.28);
    });
    rainbow.alpha = 1 - drainK;

    // desaturatsiya
    cm.reset();
    cm.saturate(sat - 1, false);

    const col = hueRGB((t * 70) % 360);
    forgeTick(scene, dt, t, { r: col.r, g: col.g, b: col.b, target: { r: 0, g: 0, b: 0 }, similarity: 0, connected: true, pulse: 0 });

    // kristall so'nishi (forgeTick'dan keyin)
    const life = 1 - drainK * 0.72;
    scene.cGlow.alpha *= life;
    scene.aura.alpha *= life;

    // ---- rangli oqim yoriqqa so'riladi ----
    const S = scene.root.scale.x, ox = scene.root.x, oy = scene.root.y;
    if (cracked && drainK < 1) {
      emitAcc += dt;
      while (emitAcc > 0.045) {
        emitAcc -= 0.045;
        const s = sources[Math.floor(Math.random() * sources.length)];
        const g = new Graphics().circle(0, 0, 2 + Math.random() * 2.6).fill(s.color);
        streamLayer.addChild(g);
        streams.push({ g, wx0: s.x, wy0: s.y, p: 0, dur: 0.7 + Math.random() * 0.5, sway: (Math.random() - 0.5) * 100, color: s.color });
      }
    }
    for (let i = streams.length - 1; i >= 0; i--) {
      const st = streams[i];
      st.p += dt / st.dur;
      const e = st.p * st.p * st.p; // yoriqqa tortilish (tezlashish)
      let wx = lerp(st.wx0, RX, e);
      let wy = lerp(st.wy0, RY, e);
      wx += Math.sin(st.p * Math.PI) * st.sway * (1 - e);
      st.g.x = ox + wx * S;
      st.g.y = oy + wy * S;
      st.g.scale.set(S * (1.25 - e * 0.8));
      st.g.alpha = st.p < 0.12 ? st.p * 8 : (1 - e);
      if (st.p >= 1) {
        if ((popCount++ % 5) === 0) playColorPop(560 + Math.random() * 620);
        st.g.destroy(); streams.splice(i, 1);
      }
    }
  });

  return () => { scene.tweens.clear(); streams.forEach((s) => s.g.destroy()); };
}

export default function ColorMixerIntro({ onStart }) {
  const [phase, setPhase] = useState('scene'); // scene | talk
  const ctlRef = useRef({});

  const build = useMemo(
    () => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')),
    []
  );

  return (
    <div className="absolute inset-0 z-30" style={{ background: '#05060f' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button
              onClick={() => ctlRef.current.skip?.()}
              className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-colors"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#94a3b8', background: 'rgba(11,17,32,0.7)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
            >
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}

        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox
              name="ELECTRA"
              role="Rang muhandisi"
              lines={LINES}
              actionLabel="🎨 Ranglarni qaytar"
              onAction={onStart}
              accent="#c77dff"
            />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
