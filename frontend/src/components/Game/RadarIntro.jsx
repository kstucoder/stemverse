// RadarIntro — "Meteorit to'dasi" kinematik cutscene (asteroid hikoyasi davomi).
// Asteroid zarbasidan keyin shaharga meteorit bo'laklari yaqinlashmoqda → radar
// yonadi → bitta nishon namuna sifatida qulflanadi (yakun emas) → Electra
// operatorni tayinlaydi va ko'rsatma beradi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleRadar, radarTick } from './pixi/radarScene';
import DialogueBox from './DialogueBox';
import { playAlarm } from './gameAudio';

const LINES = [
  { text: "Diqqat! Asteroid zarbasidan so'ng kosmosdan shaharga meteorit bo'laklari to'dasi yaqinlashmoqda!", emotion: 'worried' },
  { text: "Bizda radar bor — lekin nishonlarni kimdir qo'lda topib qulflashi kerak. Bu vazifa — sening zimmangda, operator!", emotion: 'normal' },
  { text: "Platangga ultrasonik sensor, 4 ta LED va buzzer ula. Sensor masofani o'lchaydi — bu radar kursori.", emotion: 'normal' },
  { text: "Sariq kursor halqasini nishon masofasiga moslab, radar nuri o'tishini kut — 5 ta meteorni qulfla, shaharni qutqar! Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleRadar(app);
  let t = 0, done = false, dist = 200, alarmed = false;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    scene.particles.tick(dt);

    let connected = false;
    if (t < 2) { if (!alarmed && t > 0.4) { alarmed = true; playAlarm(); } }
    else if (t < 3) { /* radar yonadi (sweep aylanmoqda) */ }
    else {
      connected = true;
      const tg = scene.targets[0];
      if (scene.found < 1 && tg) dist += (tg.dist - dist) * Math.min(dt * 2, 1);  // namuna nishonga moslash
      else dist += (390 - dist) * Math.min(dt * 2, 1);                            // qulflagach chetga
    }

    if (!done && t > 7.4) { done = true; onSceneDone(); }
    radarTick(scene, dt, t, { dist, connected, resetPulse: 0, onDetect: () => {}, onWin: () => {} });
  });

  return () => {};
}

export default function RadarIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#02090b' }}>
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
            <DialogueBox name="ELECTRA" role="Radar operatori" lines={LINES} actionLabel="📡 Radarni yoq" onAction={onStart} accent="#39ffd0" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
