// SolarIntro — "Quyosh Yelkani" kinematik cutscene (asteroid bazasi sagasi davomi).
// Voqea davomi: aloqa/uplink tayyor, lekin janglardan keyin reaktor zaryadi kritik past.
// Yangi STEPPER motorli quyosh panellarini o'rnatdik — POT bilan aniq burab quyoshni track qilamiz.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleSolar, solarTick } from './pixi/solarScene';
import DialogueBox from './DialogueBox';

// Electra faqat VOQEA sodir bo'lgach gapiradi — muammoni va nima qilish kerakligini tushuntiradi.
const LINES = [
  { text: "Ko'rdingmi? Reaktor zaryadi kritik pastga tushdi — baza chiroqlari birin-ketin o'chdi. Janglar bizni quvvatsiz qoldirdi.", emotion: 'worried' },
  { text: "Quyosh yonimizda, lekin panellar bo'shashib osilib qolgan — hech nimani ushlamayapti, shuning uchun quvvat kelmayapti.", emotion: 'worried' },
  { text: "Yangi STEPPER motor panelni aniq buradi. Sen POT ni burasan — panel o'sha burchakka aynan keladi va quyoshga qaraydi.", emotion: 'normal' },
  { text: "Panelni siljiyotgan quyoshga ANIQ qarat (nishon 85%+) — quvvat oqadi. Kuzatib borib reaktorni 100% zaryadla. Platani ulaganingda boshlaymiz!", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleSolar(app);
  const ctl = { connected: false, mode: 'intro', resetPulse: 0 };   // FAQAT kinematik kriz ko'rsatiladi (o'yin o'ynalmaydi)
  let t = 0, done = false;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };
  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    solarTick(scene, dt, t, ctl);       // kriz: quvvat asta tugaydi, baza qorong'ilashadi
    if (!done && t > 5.4) { done = true; onSceneDone(); }
  });
  return () => {};
}

export default function SolarIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#080610' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8%', background: '#000', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '11%', background: '#000', pointerEvents: 'none' }} />
            <div className="absolute left-4 flex items-center gap-2" style={{ top: '9%', fontFamily: 'Chakra Petch, monospace', fontSize: 10, letterSpacing: '0.16em', color: '#ffd9a0' }}>
              <span className="animate-pulse" style={{ color: '#ff3b46' }}>● REC</span>
              <span>SOLAR-FARM CAM</span>
              <span style={{ color: '#ff5a3a' }}>⚠ POWER CRITICAL</span>
            </div>
            <div className="absolute right-4 pointer-events-auto" style={{ top: '9%' }}>
              <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
                style={{ fontFamily: 'Chakra Petch, monospace', color: '#f0d9b0', background: 'rgba(14,12,8,0.7)', border: '1px solid rgba(255,200,120,0.25)', cursor: 'pointer' }}>
                O'tkazib yuborish ▸▸
              </button>
            </div>
          </>
        )}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox name="ELECTRA" role="Energiya muhandisi" lines={LINES} actionLabel="☀️ Panellarni yo'nalt" onAction={onStart} accent="#ffd23a" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
