// RobotArmIntro — "Xavfli Yuk: Robot Qo'l" kinematik cutscene (asteroid sagasi).
// Chuqurlikdagi xavfli modda idishlari topildi → odam yaqinlashadi, lekin radiatsiya
// uni orqaga qaytaradi (qo'l tekkizib bo'lmaydi) → ROBOT QO'L aktivlashib namuna
// sifatida bitta idishni olib konteynerga muhrlaydi (yakun emas) → Electra tayinlaydi.
// Butun ketma-ketlik FRAME-RATE'DAN mustaqil (skript vaqt bo'yicha).
import { useMemo, useRef, useState } from 'react';
import { Container, Graphics } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import { assembleArm, armTick, PIVOT_Y, CANS, CONTAIN, solveArm } from './pixi/robotArmScene';
import DialogueBox from './DialogueBox';
import { playServo, playGeiger, playClunk, playSeal, playAlarm } from './gameAudio';

const LINES = [
  { text: "Chuqurlikdan asteroid xavfli modda idishlari topildi — lekin ularga qo'l tekkizib bo'lmaydi, radiatsiya o'ldiradi!", emotion: 'worried' },
  { text: "Yagona yo'l — masofadan boshqariladigan robot qo'l. 2 potensiometr ikkita bo'g'imni buradi, tugma esa griperni ochib-yopadi.", emotion: 'normal' },
  { text: "Griperni idish ustiga aniq keltir, tugma bilan ushla, keyin qo'rg'oshin konteynerga olib borib qo'yib yubor.", emotion: 'normal' },
  { text: "3 ta idishni xavfsiz joyla va hududni qutqar. Tayyormisan, operator?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleArm(app);
  scene.introB = 90; scene.introE = 120; scene.introBtn = 0;

  // boshqaruv nuri (odam -> robot asos) — masofadan boshqaruvni ko'rsatadi
  const link = new Graphics(); scene.root.addChild(link);

  // odam figurasi (radiatsiyadan xavfsiz masofaga chekinib, SHU YERDAN boshqaradi)
  const humanC = new Container(); humanC.x = 900; humanC.y = PIVOT_Y + 44; scene.root.addChild(humanC);
  const h = new Graphics();
  h.circle(0, -54, 10).fill(0x2a3a4c).stroke({ width: 1.5, color: 0x4a5a70 });
  h.roundRect(-9, -44, 18, 32, 5).fill(0x233240).stroke({ width: 1.5, color: 0x415066 });
  h.rect(-8, -12, 6, 16).fill(0x2a3a4c); h.rect(2, -12, 6, 16).fill(0x2a3a4c);
  h.roundRect(6, -34, 14, 9, 2).fill(0x14202b).stroke({ width: 1, color: 0x00eaff, alpha: 0.7 });  // qo'ldagi pult
  humanC.addChild(h);
  const warn = new Graphics(); warn.poly([0, -82, 8, -68, -8, -68]).fill(0xff3b46); warn.rect(-1.4, -79, 2.8, 7).fill(0x1a0a0a).circle(0, -70, 1.4).fill(0x1a0a0a); warn.alpha = 0; humanC.addChild(warn);

  const ctl = { a0: 512, a1: 512, btn: 0, connected: false, mode: 'intro', resetPulse: 0,
    onMove: () => { const n = performance.now(); if (n - (ctl._sv || 0) > 130) { ctl._sv = n; playServo(); } },
    onGrab: () => playClunk(), onSeal: () => playSeal(), onGeiger: () => playGeiger() };

  const s0 = solveArm(CANS[0].x, CANS[0].y);       // idish[0] uchun servo burchaklari
  const sc = solveArm(CONTAIN.x, CONTAIN.y);       // konteyner uchun
  const script = [
    { t: 1.0, fn: () => playAlarm() },
    { t: 3.4, fn: () => { scene.introB = s0.B; scene.introE = s0.E; } },    // qo'l idish[0] ustiga
    { t: 4.6, fn: () => { scene.introBtn = 1; } },                         // ushla (rising edge)
    { t: 4.75, fn: () => { scene.introBtn = 0; } },
    { t: 5.0, fn: () => { scene.introB = sc.B; scene.introE = sc.E; } },    // konteynerga
    { t: 6.3, fn: () => { scene.introBtn = 1; } },                         // qo'yib yubor -> muhrlash
    { t: 6.45, fn: () => { scene.introBtn = 0; } },
  ];

  let t = 0, done = false, idx = 0;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    while (idx < script.length && t >= script[idx].t) { script[idx].fn(); idx++; }

    // odam: yaqinlashadi (0.6-2.0) -> radiatsiyadan ogohlanadi -> xavfsiz masofaga
    // chekinadi (2.2-3.2) va SHU YERDA turib pult bilan boshqaradi (sahnadan CHIQMAYDI)
    if (t < 2.0) humanC.x = 900 - clamp01((t - 0.6) / 1.4) * 250;         // 900 -> 650 yaqinlashadi
    else if (t < 3.2) humanC.x = 650 + clamp01((t - 2.2) / 1.0) * 208;    // 650 -> 858 chekinadi
    else humanC.x = 858;                                                  // xavfsiz masofada turadi
    warn.alpha = (t > 1.5 && t < 3.0) ? 0.5 + 0.5 * Math.sin(t * 12) : Math.max(0, warn.alpha - dt * 3);

    // masofaviy boshqaruv nuri (odam pulti -> robot asos), robot ishlaganda ko'rinadi
    link.clear();
    if (t > 3.1) {
      const hx = humanC.x - 6, hy = humanC.y - 30, bx = 500, by = PIVOT_Y - 4;
      for (let i = 0; i < 11; i++) { const a = i / 11, b = (i + 0.45) / 11; link.moveTo(hx + (bx - hx) * a, hy + (by - hy) * a).lineTo(hx + (bx - hx) * b, hy + (by - hy) * b).stroke({ width: 1.5, color: 0x00eaff, alpha: 0.3 + 0.25 * Math.sin(t * 6 - i) }); }
    }

    armTick(scene, dt, t, ctl);
    if (!done && t > 7.6) { done = true; onSceneDone(); }
  });

  return () => {};
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

export default function RobotArmIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#080a0e' }}>
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
            <DialogueBox name="ELECTRA" role="Robototexnik" lines={LINES} actionLabel="🦾 Robot qo'lni yoq" onAction={onStart} accent="#ffb020" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
