// ReactorIntro — "Reaktor Ishga Tushirish Kodi" FINAL kinematik cutscene (saga YAKUNI).
// Voqea yakuni: dok, mudofaa, xavfsizlik, aloqa, uplink, sensorlar, quvvat, korpus — hammasi tayyor.
// Endi 4x4 KEYPAD orqali ishga tushirish kodini kiritib, bosh reaktorni yoqamiz. Demo o'zi teradi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleReactor, reactorTick } from './pixi/reactorScene';
import DialogueBox from './DialogueBox';

// Electra faqat reaktor ishga tushmagach gapiradi — muammoni va yechimni tushuntiradi.
const LINES = [
  { text: "Mana shu daqiqa uchun ishladik, qo'mondon — quvvat, korpus, hammasi tayyor. Bosh reaktorni yoqamiz...", emotion: 'excited' },
  { text: "Ko'rdingmi? Yadro yonmoqchi bo'ldi-yu, o'chib qoldi — avto-start ishlamadi. Reaktor xavfsizlik qulfida: kodsiz yonmaydi.", emotion: 'worried' },
  { text: "Uni faqat QO'LDA yoqamiz — 4x4 klaviaturada ishga tushirish KODINI kiritib. Ekranda har bosqichda kod chiqadi.", emotion: 'normal' },
  { text: "Kodni keypad'da AYNAN ketma-ket ter — har to'g'ri kod reaktorni bir pog'ona jonlantiradi, xato bo'lsa qaytadan. 5 bosqichni yoq! Platani ulaganingda boshlaymiz. Tayyormisan, Bosh Muhandis?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleReactor(app);
  const ctl = { key: 'NONE', connected: false, mode: 'intro', resetPulse: 0 };   // FAQAT muvaffaqiyatsiz-start kinematikasi
  let t = 0, done = false;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };
  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    reactorTick(scene, dt, t, ctl);   // yadro miltillab o'chadi (o'yin o'ynalmaydi)
    if (!done && t > 6.4) { done = true; onSceneDone(); }
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
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8%', background: '#000', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '11%', background: '#000', pointerEvents: 'none' }} />
            <div className="absolute left-4 flex items-center gap-2" style={{ top: '9%', fontFamily: 'Chakra Petch, monospace', fontSize: 10, letterSpacing: '0.16em', color: '#a9f0cc' }}>
              <span className="animate-pulse" style={{ color: '#ff3b46' }}>● REC</span>
              <span>REACTOR-BAY CAM</span>
              <span style={{ color: '#ff5a3a' }}>⚠ IGNITION LOCKED</span>
            </div>
            <div className="absolute right-4 pointer-events-auto" style={{ top: '9%' }}>
              <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
                style={{ fontFamily: 'Chakra Petch, monospace', color: '#a9f0cc', background: 'rgba(10,8,10,0.7)', border: '1px solid rgba(57,255,136,0.25)', cursor: 'pointer' }}>
                O'tkazib yuborish ▸▸
              </button>
            </div>
          </>
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
