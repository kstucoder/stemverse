// ColorMixerIntro — "Rang Anomaliyasi" kinematik cutscene.
// 1 va 2-o'yin bilan BITTA olam: tungi Energy City shahri. Osmonda ilmiy
// hodisa — RANG YUTUVCHI QORA TUYNUK paydo bo'ladi va binolar, gullar,
// mashinalar ranglarini spiral bo'lib o'ziga tortib yutadi; shahar kulrangga
// aylanadi. So'ng Electra RGB bilan ranglarni qayta yaratishni so'raydi.
// Ovozlar har bosqichga sinxron.
import { useMemo, useRef, useState } from 'react';
import { Container, Graphics, Sprite, ColorMatrixFilter } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import { assembleCity, cityTick, radialTexture, GROUND_Y } from './pixi/cityScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playRift, playDrain, playColorPop, playHollow } from './gameAudio';

const BHX = 540, BHY = 116;                       // qora tuynuk (olam koordinatasi)
const FLOWER_COLORS = [0xff3b3b, 0xff7b1c, 0xffd166, 0x39e06a, 0x3b82ff, 0x9b5de5, 0xf15bb5];
const lerp = (a, b, k) => a + (b - a) * k;

const LINES = [
  { text: "Osmonga qara! Shahar uzra g'alati anomaliya — rang yutuvchi qora tuynuk paydo bo'ldi!", emotion: 'worried' },
  { text: "U binolar, gullar, mashinalar — butun shaharning rangini o'ziga tortib yutmoqda. Hammayoq kulrang bo'lyapti!", emotion: 'worried' },
  { text: "Ranglar yo'qolmasin! Rang — bu yorug'lik: qizil, yashil, ko'k. Platangga RGB LED va 3 potensiometrni ula.", emotion: 'normal' },
  { text: "Kanallarni aralashtirib yo'qolgan ranglarni qayta yaratamiz va shaharga qaytaramiz. Tayyormisan?", emotion: 'excited' },
];

/* gul — so'lish qobiliyati bilan */
function makeFlower(color) {
  const c = new Container();
  const stem = new Graphics().moveTo(0, 0).quadraticCurveTo(4, -16, 0, -30).stroke({ width: 3, color: 0x2f8f4f });
  const leaf = new Graphics().ellipse(6, -13, 5, 2.6).fill(0x3fae5f);
  const head = new Container(); head.y = -34;
  for (let i = 0; i < 6; i++) {
    const p = new Graphics().ellipse(0, -8, 4.5, 8).fill(color);
    p.rotation = (i / 6) * Math.PI * 2;
    head.addChild(p);
  }
  head.addChild(new Graphics().circle(0, 0, 4.5).fill(0xffd54a));
  c.addChild(stem, leaf, head);
  return { c, head };
}

/* qora tuynuk — akkretsiya diski + fotonli halqa + tortish gale'osi */
function makeBlackHole() {
  const c = new Container();
  const halo = new Sprite(radialTexture('rgba(150,90,255,0.45)', 256));
  halo.anchor.set(0.5); halo.width = halo.height = 300;
  const disk = new Container();
  [[74, 0xffb03a, 9], [58, 0xff5a3c, 7], [44, 0x7fd0ff, 5]].forEach(([rr, col, wdt]) => {
    disk.addChild(new Graphics().ellipse(0, 0, rr, rr * 0.34).stroke({ width: wdt, color: col, alpha: 0.75 }));
  });
  // spiral tortilayotgan materiya izlari
  const streaks = new Graphics();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    streaks.moveTo(Math.cos(a) * 40, Math.sin(a) * 14)
      .arc(0, 0, 40 - i * 3, a, a + 1.2).stroke({ width: 2, color: 0xffe0a0, alpha: 0.5 });
  }
  disk.addChild(streaks);
  const core = new Graphics().circle(0, 0, 30).fill(0x04030a).circle(0, 0, 30).stroke({ width: 2, color: 0x1a1030 });
  const photon = new Graphics().circle(0, 0, 33).stroke({ width: 3, color: 0xffe6b0, alpha: 0.95 });
  c.addChild(halo, disk, core, photon);
  c.scale.set(0);
  return { c, disk, halo };
}

function buildIntroScene(app, ctlRef, onSceneDone) {
  // 1-o'yin shahri — yoritilgan, rang-barang
  const city = assembleCity(app, { startLit: true });
  const cm = new ColorMatrixFilter();
  city.root.filters = [cm];

  // gullar (old plan, ko'cha bo'ylab)
  const flowerDefs = [
    { x: 120, y: 512 }, { x: 250, y: 520 }, { x: 380, y: 514 },
    { x: 640, y: 514 }, { x: 770, y: 522 }, { x: 890, y: 510 },
    { x: 430, y: 540 }, { x: 600, y: 540 },
  ];
  const flowers = flowerDefs.map((d, i) => {
    const color = FLOWER_COLORS[i % FLOWER_COLORS.length];
    const f = makeFlower(color);
    f.c.x = d.x; f.c.y = d.y;
    city.root.addChild(f.c);
    return { ...f, wx: d.x, wy: d.y, color };
  });

  // qora tuynuk + rangli oqim — FILTRSIZ ustki qatlam (desaturatsiya ta'sir qilmaydi)
  const topLayer = new Container();
  app.stage.addChild(topLayer);
  const bh = makeBlackHole();
  topLayer.addChild(bh.c);
  const streamLayer = new Container();
  topLayer.addChild(streamLayer);
  const streams = [];

  function randSource() {
    const roll = Math.random();
    if (roll < 0.62) return { x: 90 + Math.random() * 820, y: 210 + Math.random() * 230, color: Math.random() < 0.2 ? 0x7ff4ff : 0xffd76a };
    if (roll < 0.85) { const f = flowers[Math.floor(Math.random() * flowers.length)]; return { x: f.wx, y: f.wy - 28, color: f.color }; }
    return { x: 100 + Math.random() * 800, y: GROUND_Y + 20 + Math.random() * 40, color: FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)] };
  }

  let t = 0, done = false;
  let bhScale = 0, bhTarget = 0, drainK = 0;
  let emitAcc = 0, popCount = 0;
  let formed = false, hollowed = false;

  ctlRef.current.skip = () => {
    if (done) return;
    done = true; drainK = 1; bhTarget = 1;
    cm.reset(); cm.saturate(-1, false);
    onSceneDone();
  };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    city.tweens.tick(dt);
    city.particles.tick(dt);

    // ---- ssenariy ----
    if (t < 2.4) {
      drainK = 0;
    } else {
      if (!formed) { formed = true; bhTarget = 1; playRift(); playDrain(); useGameStore.getState().triggerShake(10); }
      drainK = Math.min((t - 2.5) / 3.4, 1);
      if (!hollowed && drainK >= 1 && t > 6.1) { hollowed = true; done = true; playHollow(); onSceneDone(); }
    }

    bhScale += (bhTarget - bhScale) * Math.min(dt * 3, 1);
    bh.disk.rotation += dt * 0.7;
    bh.halo.alpha = 0.4 + 0.25 * Math.sin(t * 3);

    // gullar so'liydi
    flowers.forEach((f, i) => {
      const wil = Math.min(1, Math.max(0, (drainK - i * 0.03) * 1.3));
      f.head.rotation = wil * 0.95;
      f.head.y = -34 + wil * 11;
      f.head.scale.set(1 - wil * 0.3);
    });

    // shahar so'nadi + rangsizlanadi
    cm.reset();
    cm.saturate(-drainK, false);
    cityTick(city, dt, t, {
      litCount: Math.round(8 - 6 * drainK),
      energy: 90 * (1 - drainK * 0.85),
      night: true,
      tramOn: drainK < 0.5,
      shooting: false,
    });

    // ---- rangli oqim qora tuynukka spiral bo'lib so'riladi ----
    const S = city.root.scale.x, ox = city.root.x, oy = city.root.y;
    // qora tuynukni osmonga joylashtirish (ekran koordinatasi)
    bh.c.x = ox + BHX * S; bh.c.y = oy + BHY * S;
    bh.c.scale.set(S * bhScale);

    if (formed && drainK < 1) {
      emitAcc += dt;
      while (emitAcc > 0.04) {
        emitAcc -= 0.04;
        const s = randSource();
        const dx = s.x - BHX, dy = s.y - BHY;
        const g = new Graphics().circle(0, 0, 2 + Math.random() * 2.4).fill(s.color);
        streamLayer.addChild(g);
        streams.push({ g, r0: Math.hypot(dx, dy), a0: Math.atan2(dy, dx), p: 0, dur: 0.8 + Math.random() * 0.6, spin: 4 + Math.random() * 4 });
      }
    }
    for (let i = streams.length - 1; i >= 0; i--) {
      const st = streams[i];
      st.p += dt / st.dur;
      const e = st.p * st.p;                 // markazga tezlashish
      const r = st.r0 * (1 - e);             // radius qisqaradi
      const a = st.a0 + st.spin * st.p;      // spiral aylanish
      const wx = BHX + Math.cos(a) * r;
      const wy = BHY + Math.sin(a) * r;
      st.g.x = ox + wx * S;
      st.g.y = oy + wy * S;
      st.g.scale.set(S * (1.2 - e * 0.8));
      st.g.alpha = st.p < 0.12 ? st.p * 8 : (1 - e);
      if (st.p >= 1) {
        if ((popCount++ % 6) === 0) playColorPop(560 + Math.random() * 640);
        st.g.destroy(); streams.splice(i, 1);
      }
    }
  });

  return () => { city.tweens.clear(); streams.forEach((s) => s.g.destroy()); };
}

export default function ColorMixerIntro({ onStart }) {
  const [phase, setPhase] = useState('scene'); // scene | talk
  const ctlRef = useRef({});

  const build = useMemo(
    () => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')),
    []
  );

  return (
    <div className="absolute inset-0 z-30" style={{ background: '#03040c' }}>
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
