// RoverIntro — "Ta'mirlash Roveri" kinematik cutscene (asteroid bazasi sagasi davomi).
// Voqea davomi: reaktor quvvatlandi (18). Endi meteor va janglardan shikastlangan tashqi korpusni
// IR pult bilan boshqariladigan ta'mirlash roveri yordamida payvandlab tuzatamiz. Demo o'zi ko'rsatadi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleRover, roverTick } from './pixi/roverScene';
import DialogueBox from './DialogueBox';
import { playScore, playZap } from './gameAudio';

const LINES = [
  { text: "Reaktor quvvatlandi — ammo tashqi korpusda meteor va jang izlari qoldi: yoriqlar, gaz sizmoqda. Bazamiz germetik emas.", emotion: 'worried' },
  { text: "Tashqariga chiqib bo'lmaydi. Buning uchun IR masofadan boshqaruv pultli ta'mirlash roverini ishga soldim.", emotion: 'normal' },
  { text: "Pultning ▲▼◄► tugmalari bilan roverni korpus bo'ylab yurit. Shikast ustiga borganda OK ni bosib ushlab tur — payvand qo'li teshikni yopadi.", emotion: 'normal' },
  { text: "5 ta shikastni ham payvandlab, korpusni germetik qil! Tayyormisan, ta'mir operatori?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleRover(app);
  const ctl = { ir: 'NONE', connected: false, mode: 'intro', resetPulse: 0, onWeld: () => { playScore(); playZap(); }, onNear: () => {} };
  let t = 0, done = false, endedAt = 0;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };
  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    roverTick(scene, dt, t, ctl);   // ulanmagan + intro -> avto-pilot rover shikastlarni tuzatadi
    if (scene.fixed >= 2 && !endedAt) endedAt = t;
    if (!done && ((endedAt && t > endedAt + 0.8) || t > 11)) { done = true; onSceneDone(); }
  });
  return () => {};
}

export default function RoverIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#05080c' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#a9f0cc', background: 'rgba(10,14,18,0.7)', border: '1px solid rgba(107,255,176,0.25)', cursor: 'pointer' }}>
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox name="ELECTRA" role="Ta'mir operatori" lines={LINES} actionLabel="🛠️ Roverni boshqar" onAction={onStart} accent="#6bffb0" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
