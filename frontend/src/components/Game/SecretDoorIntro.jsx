// SecretDoorIntro — "Josuslik topshirig'i" kinematik cutscene.
// Shahar bankining tungi seyf xonasi: qizil lazer to'ri, spotlight, aylanadigan
// seyf dial'i — Electra topshiriqni tushuntiradi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleVault, vaultTick } from './pixi/vaultScene';
import DialogueBox from './DialogueBox';
import { playAlarm } from './gameAudio';

const LINES = [
  { text: "Yarim tun. Shahar bankining yer ostidagi seyf xonasidamiz — bu yerda o'g'irlangan energiya yadrosi saqlanadi.", emotion: 'worried' },
  { text: "Har tomonda qizil lazerli to'r, shiftda esa aylanuvchi kamera. Bitta xato — va signalizatsiya ishga tushadi!", emotion: 'worried' },
  { text: "Seyfni faqat maxfiy kod ochadi. Platangga tugma, LED va buzzer ula — bu bizning kod kiritish pultimiz.", emotion: 'normal' },
  { text: "Tugmani 5 marta to'g'ri bos — rigellar birin-ketin ochilib, po'lat eshik ochiladi. Diqqat bilan, agent!", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleVault(app);
  let t = 0, done = false, a1 = false, a2 = false;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.tweens.tick(dt);
    scene.particles.tick(dt);
    if (!a1 && t > 0.4) { a1 = true; playAlarm(); }
    if (!a2 && t > 3.0) { a2 = true; playAlarm(); }  // ikkinchi ogohlantirish — tarang muhit
    if (!done && t > 5.4) { done = true; onSceneDone(); }
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
            <DialogueBox name="ELECTRA" role="Maxfiy agent" lines={LINES} actionLabel="🔓 Seyfni buz" onAction={onStart} accent="#00eeff" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
