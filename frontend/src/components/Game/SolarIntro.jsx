// SolarIntro — "Quyosh Yelkani" kinematik cutscene (asteroid bazasi sagasi davomi).
// Voqea davomi: aloqa/uplink tayyor, lekin janglardan keyin reaktor zaryadi kritik past.
// Yangi STEPPER motorli quyosh panellarini o'rnatdik — POT bilan aniq burab quyoshni track qilamiz.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleSolar, solarTick } from './pixi/solarScene';
import DialogueBox from './DialogueBox';
import { playScore, playClick } from './gameAudio';

const LINES = [
  { text: "Janglar bazani charchatdi — reaktor zaryadi kritik past. Quvvatsiz hech qaysi tizim ishlamaydi.", emotion: 'worried' },
  { text: "Yangi STEPPER motorli quyosh panellarini o'rnatdim. Stepper servodan aniqroq — qadamba-qadam istalgan burchakka aynan keladi.", emotion: 'normal' },
  { text: "POT bilan panelni bur — u siljiyotgan uzoq quyoshni 'track' qilsin. Panel qancha aniq qarasa — shuncha ko'p quvvat oqadi.", emotion: 'normal' },
  { text: "Quyosh osmonda siljiydi, uni tinmay kuzatib bor. Reaktorni 100% zaryadla — baza yana yonsin! Tayyormisan, energiya muhandisi?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleSolar(app);
  const ctl = { connected: false, mode: 'intro', resetPulse: 0, onCharge: () => playScore(), onNear: () => playClick() };
  let t = 0, done = false, endedAt = 0;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };
  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    solarTick(scene, dt, t, ctl);   // ulanmagan + intro -> demo panel quyoshni kuzatadi, zaryadlanadi
    if (scene.milestone >= 2 && !endedAt) endedAt = t;
    if (!done && ((endedAt && t > endedAt + 0.8) || t > 10)) { done = true; onSceneDone(); }
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
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#f0d9b0', background: 'rgba(14,12,8,0.7)', border: '1px solid rgba(255,200,120,0.25)', cursor: 'pointer' }}>
              O'tkazib yuborish ▸▸
            </button>
          </div>
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
