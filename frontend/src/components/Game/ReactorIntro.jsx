// ReactorIntro — "Reaktor Ishga Tushirish Kodi" FINAL kinematik cutscene (saga YAKUNI).
// Voqea yakuni: dok, mudofaa, xavfsizlik, aloqa, uplink, sensorlar, quvvat, korpus — hammasi tayyor.
// Endi 4x4 KEYPAD orqali ishga tushirish kodini kiritib, bosh reaktorni yoqamiz. Demo o'zi teradi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleReactor, reactorTick } from './pixi/reactorScene';
import DialogueBox from './DialogueBox';
import { playScore, playClick } from './gameAudio';

const LINES = [
  { text: "Mana shu daqiqa uchun ishladik, qo'mondon. Reaktor quvvatlangan, korpus germetik — baza ishga tushishga tayyor.", emotion: 'excited' },
  { text: "Oxirgi qadam eng muhimi: bosh reaktorni yoqish. Buning uchun 4x4 klaviaturada ishga tushirish KODINI kiritamiz.", emotion: 'normal' },
  { text: "Ekranda har bosqichda kod chiqadi. Uni keypad'da AYNAN ketma-ket ter — har to'g'ri kod reaktorni bir pog'ona jonlantiradi. Xato bo'lsa — kod qaytadan.", emotion: 'normal' },
  { text: "5 bosqichni ham kiritib, reaktorni gumburlatib yoq — butun baza jonlanadi! Bu — final. Tayyormisan, Bosh Muhandis?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleReactor(app);
  const ctl = { key: 'NONE', connected: false, mode: 'intro', resetPulse: 0, onDigit: () => playClick(), onStage: () => playScore() };
  let t = 0, done = false, endedAt = 0;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };
  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    reactorTick(scene, dt, t, ctl);   // ulanmagan + intro -> demo kodni avto-teradi, reaktor jonlanadi
    if (scene.stage >= 2 && !endedAt) endedAt = t;
    if (!done && ((endedAt && t > endedAt + 0.9) || t > 11)) { done = true; onSceneDone(); }
  });
  return () => {};
}

export default function ReactorIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#08050a' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#a9f0cc', background: 'rgba(10,8,10,0.7)', border: '1px solid rgba(57,255,136,0.25)', cursor: 'pointer' }}>
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox name="ELECTRA" role="Baza qo'mondoni" lines={LINES} actionLabel="🔴 Reaktorni yoq" onAction={onStart} accent="#6bffb0" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
