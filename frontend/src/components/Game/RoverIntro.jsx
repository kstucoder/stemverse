// RoverIntro — "Ta'mirlash Roveri" kinematik cutscene (asteroid bazasi sagasi davomi).
// Voqea davomi: reaktor quvvatlandi (18). Endi meteor va janglardan shikastlangan tashqi korpusni
// IR pult bilan boshqariladigan ta'mirlash roveri yordamida payvandlab tuzatamiz. Demo o'zi ko'rsatadi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleRover, roverTick } from './pixi/roverScene';
import DialogueBox from './DialogueBox';

// Electra faqat meteor zarbasidan KEYIN gapiradi — muammoni va yechimni tushuntiradi.
const LINES = [
  { text: "Ko'rdingmi?! Meteor yomg'iri bazamiz tashqi korpusiga urildi — bir necha joyda yoriq ochildi, gaz sizib chiqmoqda. Korpus germetikligi buzildi!", emotion: 'worried' },
  { text: "Tashqariga chiqib bo'lmaydi — juda xavfli. Shuning uchun IR masofadan boshqaruv pultli ta'mirlash roveri bor.", emotion: 'normal' },
  { text: "Pultning ▲▼◄► tugmalari bilan roverni korpus bo'ylab yurit. YASHIL belgilangan shikast ustiga borganda OK ni bosib ushlab tur — payvand qo'li teshikni yopadi.", emotion: 'normal' },
  { text: "5 ta shikastni ham payvandlab, korpusni yana germetik qil! Platani ulaganingda roverni qo'lga olasan. Tayyormisan, ta'mir operatori?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleRover(app);
  const ctl = { ir: 'NONE', connected: false, mode: 'intro', resetPulse: 0 };   // FAQAT meteor zarbasi kinematikasi
  let t = 0, done = false;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };
  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    roverTick(scene, dt, t, ctl);   // meteorlar korpusni shikastlaydi (o'yin o'ynalmaydi)
    if (!done && t > 6.6) { done = true; onSceneDone(); }
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
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8%', background: '#000', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '11%', background: '#000', pointerEvents: 'none' }} />
            <div className="absolute left-4 flex items-center gap-2" style={{ top: '9%', fontFamily: 'Chakra Petch, monospace', fontSize: 10, letterSpacing: '0.16em', color: '#a9f0cc' }}>
              <span className="animate-pulse" style={{ color: '#ff3b46' }}>● REC</span>
              <span>HULL-CAM 07</span>
              <span style={{ color: '#ff5a3a' }}>⚠ HULL BREACH</span>
            </div>
            <div className="absolute right-4 pointer-events-auto" style={{ top: '9%' }}>
              <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
                style={{ fontFamily: 'Chakra Petch, monospace', color: '#a9f0cc', background: 'rgba(10,14,18,0.7)', border: '1px solid rgba(107,255,176,0.25)', cursor: 'pointer' }}>
                O'tkazib yuborish ▸▸
              </button>
            </div>
          </>
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
