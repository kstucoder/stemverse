// SpeedRunnerIntro — "Tom ustidagi quvish" kinematik cutscene.
// Neon yuguruvchi tungi shahar tomlari bo'ylab avtomatik chopib, to'siqlardan
// mohirona sakraydi (demo) — Electra topshiriqni tushuntiradi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleRunner, runnerTick } from './pixi/runnerScene';
import DialogueBox from './DialogueBox';

const LINES = [
  { text: "Energiya o'g'risi shahar tomlari bo'ylab qochyapti! Uni quvib yetishimiz kerak.", emotion: 'worried' },
  { text: "Bu — parkur poygasi: tez yugur, to'siqlardan sakrab o't, yo'ldagi energiya orblarini yig'.", emotion: 'normal' },
  { text: "Platangga potensiometr va tugma ula — POT tezlikni, tugma sakrashni boshqaradi.", emotion: 'normal' },
  { text: "1000 metr yugurib o'g'rini quvib yet! Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleRunner(app);
  let t = 0, done = false, jp = 0, rp = 0;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.particles.tick(dt);

    // avtomatik sakrash — yaqinlashgan to'siq ustidan
    const near = scene.obstacles.find((o) => o.x > 250 && o.x < 380);
    if (near && scene.grounded) jp += 1;

    if (!done && t > 5.6) { done = true; onSceneDone(); }

    runnerTick(scene, dt, t, {
      speed: 195, jumpPulse: jp, resetPulse: rp, connected: true,
      onCrash: () => { rp += 1; }, onCoin: () => {}, onWin: () => {}, onDistance: () => {},
    });
  });

  return () => {};
}

export default function SpeedRunnerIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);

  return (
    <div className="absolute inset-0 z-30" style={{ background: '#050a18' }}>
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
            <DialogueBox name="ELECTRA" role="Poyga muhandisi" lines={LINES} actionLabel="🏃 Poygani boshla" onAction={onStart} accent="#00eeff" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
