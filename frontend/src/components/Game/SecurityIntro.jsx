// SecurityIntro — "Xavfsizlik Tizimi" (PIR) kinematik cutscene (asteroid sagasi).
// Tunda skavenjer dronlar perimetrga yaqinlashadi — biri darvozaga yetib buzilish
// keltiradi (stakes), keyin PIR aniqlash zonasida boshqasini signal bilan qaytaradi
// (namuna) -> Electra xavfsizlik boshlig'ini tayinlaydi. FRAME-RATE mustaqil.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleSecurity, securityTick } from './pixi/securityScene';
import DialogueBox from './DialogueBox';
import { playAlarm, playScore, playCrash } from './gameAudio';

const LINES = [
  { text: "Tun tushdi. Skavenjer dronlar bazamiz perimetriga yaqinlashmoqda — ta'minotimizni o'g'irlamoqchi.", emotion: 'worried' },
  { text: "PIR harakat sensori mana bu aniqlash zonasini kuzatadi. Dron zonaga kirganda — qo'lingni sensor ustida SILT: signal va projektor yonib, dronni qaytaradi.", emotion: 'normal' },
  { text: "Bo'sh zonada siltama — soxta signal bo'ladi. Va hech bir dronni darvozaga yetkazma!", emotion: 'normal' },
  { text: "10 ta dronni qaytar va perimetrni xavfsiz saqla. Tayyormisan, qo'riqchi?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleSecurity(app);
  const ctl = { pir: 0, connected: true, mode: 'intro', resetPulse: 0, onTrigger: () => playAlarm(), onCatch: () => playScore(), onBreach: () => playCrash() };
  let t = 0, done = false, idx = 0;
  const script = [
    { t: 0.6, fn: () => scene.spawnDrone(520, 250, 130) },   // A -> darvozaga yetadi (buzilish)
    { t: 2.0, fn: () => scene.spawnDrone(940, 300, 150) },   // B -> ushlanadi
    { t: 4.6, fn: () => { ctl.pir = 1; } },                  // signal (PIR HIGH)
    { t: 4.78, fn: () => { ctl.pir = 0; } },
  ];

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    while (idx < script.length && t >= script[idx].t) { script[idx].fn(); idx++; }
    securityTick(scene, dt, t, ctl);
    if (!done && t > 5.8) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function SecurityIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#03100a' }}>
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
            <DialogueBox name="ELECTRA" role="Xavfsizlik boshlig'i" lines={LINES} actionLabel="🛡️ Postni ol" onAction={onStart} accent="#39e06a" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
