// BaseIntro — "Aqlli Baza" FINAL kinematik cutscene (asteroid bazasi sagasi YAKUNI).
// Voqea yakuni: doklash, mudofaa, xavfsizlik, aloqa, telemetriya, sensor profili — hammasi tayyor.
// Endi RELAY moduli bilan butun bazani bir tizimga ulab, TO'LIQ ISHGA TUSHIRAMIZ. Demo tizimlarni
// birma-bir onlayn qilib ko'rsatadi. Yangi element: relay (quvvat kalitlash).
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleBase, baseTick } from './pixi/baseScene';
import DialogueBox from './DialogueBox';
import { playScore, playClick } from './gameAudio';

const LINES = [
  { text: "Mana shu daqiqa uchun ishladik, qo'mondon. Doklash, mudofaa, xavfsizlik, aloqa, telemetriya, muhit profili — hammasi tayyor.", emotion: 'excited' },
  { text: "Endi oxirgi qadam: RELAY moduli bilan bazaning har bir quyi-tizimini bitta tarmoqqa ulab, to'liq ishga tushiramiz.", emotion: 'normal' },
  { text: "POT bilan quvvatni tizimning YASHIL oynasiga sozla. Band mos kelganda tugmani bos — relay 'klik' etib tizimni ulaydi, xona yonadi.", emotion: 'normal' },
  { text: "Reaktordan shlyuzgacha — 5 tizimni ham onlayn qil va bazani jonlantirt! Bu — final. Tayyormisan, Bosh Muhandis?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleBase(app);
  const ctl = { connected: false, mode: 'intro', resetPulse: 0, onEngage: () => { playScore(); playClick(); }, onNear: () => playClick() };
  let t = 0, done = false, endedAt = 0;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };
  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    baseTick(scene, dt, t, ctl);   // ulanmagan + intro -> demo tizimlarni onlayn qiladi
    if (scene.online >= 2 && !endedAt) endedAt = t;
    if (!done && ((endedAt && t > endedAt + 0.8) || t > 10)) { done = true; onSceneDone(); }
  });
  return () => {};
}

export default function BaseIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#04080c' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#a9f0cc', background: 'rgba(6,12,18,0.7)', border: '1px solid rgba(107,255,176,0.25)', cursor: 'pointer' }}>
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox name="ELECTRA" role="Baza qo'mondoni" lines={LINES} actionLabel="🏔️ Bazani ishga tushir" onAction={onStart} accent="#6bffb0" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
