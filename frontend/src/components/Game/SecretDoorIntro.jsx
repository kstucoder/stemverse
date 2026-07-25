// SecretDoorIntro — "Josuslik topshirig'i" kinematik cutscene.
// Shahar bankining tungi seyf xonasi: qizil lazer to'ri, spotlight, aylanadigan
// seyf dial'i — Electra topshiriqni tushuntiradi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleVault, vaultTick } from './pixi/vaultScene';
import DialogueBox from './DialogueBox';
import { playAlarm } from './gameAudio';

const LINES = [
  { text: "Josuslik topshirig'i! Shahar bankining seyfida o'g'irlangan energiya yadrosi yashiringan — uni qaytarishimiz shart.", emotion: 'worried' },
  { text: "Seyf qizil lazerlar bilan qo'riqlanadi. Uni faqat maxfiy kod ochadi — tugmani to'g'ri ritmda bosish kerak.", emotion: 'normal' },
  { text: "Platangga tugma, LED va buzzer ula. Har bosishda bitta qulf shtifti ochiladi.", emotion: 'normal' },
  { text: "Tugmani 5 marta bos — shtiftlar birin-ketin ochilib, seyf eshigi ochiladi. Tayyormisan, agent?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleVault(app);
  let t = 0, done = false, alarmed = false;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.tweens.tick(dt);
    scene.particles.tick(dt);
    if (!alarmed && t > 0.4) { alarmed = true; playAlarm(); }
    if (!done && t > 4.2) { done = true; onSceneDone(); }
    vaultTick(scene, dt, t, { pins: 0, openPulse: false, connected: false });
  });

  return () => scene.tweens.clear();
}

export default function SecretDoorIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);

  return (
    <div className="absolute inset-0 z-30" style={{ background: '#05070d' }}>
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
            <DialogueBox name="ELECTRA" role="Agent muhandis" lines={LINES} actionLabel="🔓 Seyfni buz" onAction={onStart} accent="#00eeff" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
