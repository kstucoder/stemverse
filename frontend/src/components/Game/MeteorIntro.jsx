// MeteorIntro — "Meteor Qalqoni" kinematik cutscene (asteroid sagasining yakuni).
// Asteroidning so'nggi meteor to'dasi bazaga yopiriladi -> zenit to'pi nishonlab
// meteorlarni otib yo'q qiladi (namuna) -> Electra bosh himoyachini tayinlaydi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleMeteorDefense, meteorTick } from './pixi/meteorDefenseScene';
import DialogueBox from './DialogueBox';
import { playZap, playAlarm } from './gameAudio';

const LINES = [
  { text: "Diqqat! Asteroidning so'nggi va eng katta meteor to'dasi to'g'ri bazaga yopirilib kelmoqda!", emotion: 'worried' },
  { text: "Bizda zenit to'pi bor — potensiometr uni nishonlaydi, tugma esa energiya zaryadini otadi.", emotion: 'normal' },
  { text: "Har bir meteorni bazaga yetmasdan yo'q qil. Meteor tegib ketsa — qalqon zaiflashadi.", emotion: 'normal' },
  { text: "Mudofaani ushlab tur, butun to'dani qaytar va biz tiklagan hamma narsani saqlab qol! Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleMeteorDefense(app);
  const ctl = { aimAngle: 0, btn: 0, connected: true, mode: 'intro', resetPulse: 0, onFire: () => playZap() };
  let t = 0, done = false, fireT = 0, spawnT = 0.6, alarmed = false;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    if (!alarmed && t > 0.4) { alarmed = true; playAlarm(); }
    // to'p (joystik) nishonni supuradi va otadi
    ctl.aimAngle = Math.sin(t * 1.6) * 62;
    fireT -= dt; ctl.btn = 0;
    if (fireT <= 0 && t > 1.0) { fireT = 0.34; ctl.btn = 1; }
    // meteorlar tushadi
    spawnT -= dt; if (spawnT <= 0 && t < 5.0) { spawnT = 0.7 + Math.random() * 0.4; scene.spawnMeteor(120 + Math.random() * 760, 95 + Math.random() * 40); }

    meteorTick(scene, dt, t, ctl);
    if (!done && t > 5.8) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function MeteorIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#03040c' }}>
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
            <DialogueBox name="ELECTRA" role="Bosh himoyachi" lines={LINES} actionLabel="☄️ Qalqonni ko'tar" onAction={onStart} accent="#39ffd0" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
