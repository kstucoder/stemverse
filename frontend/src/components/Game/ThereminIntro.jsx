// ThereminIntro — "Aurora Cholg'usi uyg'onadi" kinematik cutscene.
// Tun, shahar uxlayapti → sehrli cholg'u uyg'onadi, birinchi nota chalinib osmonда
// aurora yoyiladi → cholg'u o'zi 3 notalik demo kuyni chaladi (har nota shahar
// chiroqlarини yoqadi, olovqurtlar uyg'onadi) → Electra seni chorlaydi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleTheremin, thereminTick } from './pixi/thereminScene';
import DialogueBox from './DialogueBox';
import { startLiveTone, updateLiveTone, stopLiveTone, playChime } from './gameAudio';

const TARGETS = [0.28, 0.55, 0.82];
const LINES = [
  { text: "Tun. Shahar uxlayapti, hammayoq jimjit... Lekin maydonda sirli bir cholg'u — Aurora Cholg'usi turibdi.", emotion: 'normal' },
  { text: "Unga qo'l tegizmaysan! Qo'ling soyasi yorug'lik sensoriga tushsa ovoz pasayadi, yorug'lik ko'paysa — ko'tariladi.", emotion: 'normal' },
  { text: "Platangga LDR sensor, buzzer va LED ula — yorug'lik pitch'ni boshqaradi.", emotion: 'normal' },
  { text: "Qo'lingni to'lqinlantirib 3 ta yorug'lik notasini chal — shaharni musiqa bilan uyg'ot! Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleTheremin(app);
  startLiveTone();
  let t = 0, done = false, fn = 0.05, cap = 0, prog = 0, ti = 0;
  const fired = [false, false, false];

  ctlRef.current.skip = () => { if (done) return; done = true; stopLiveTone(); onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    scene.particles.tick(dt);

    // demo kuy: notadan-notaga
    let setPoint = 0.05, targetN = TARGETS[Math.min(ti, 2)];
    if (t < 1.8) { setPoint = 0.06; }
    else if (t < 3.0) { setPoint = TARGETS[0]; ti = 0; if (!fired[0] && t > 2.6) { fired[0] = true; cap++; prog = 1 / 3; playChime(523); } }
    else if (t < 4.2) { setPoint = TARGETS[1]; ti = 1; if (!fired[1] && t > 3.9) { fired[1] = true; cap++; prog = 2 / 3; playChime(659); } }
    else if (t < 5.6) { setPoint = TARGETS[2]; ti = 2; if (!fired[2] && t > 5.2) { fired[2] = true; cap++; prog = 1; playChime(880); } }
    else { setPoint = 0.5 + 0.28 * Math.sin(t * 2.2); ti = 2; }        // flourish

    fn += (setPoint - fn) * Math.min(dt * 4, 1);
    updateLiveTone(200 + fn * 1800, 0.06);
    const matched = Math.abs(fn - targetN) < 0.05;

    if (!done && t > 7.2) { done = true; stopLiveTone(); onSceneDone(); }

    thereminTick(scene, dt, t, {
      freqNorm: fn, targetNorm: TARGETS[Math.min(ti, 2)], matched,
      captureProgress: matched ? 0.6 : 0, capturePulse: cap, progress: prog,
      connected: true, noteIndex: ti,
    });
  });

  return () => { stopLiveTone(); };
}

export default function ThereminIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#04060f' }}>
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
            <DialogueBox name="ELECTRA" role="Yorug'lik sehrgari" lines={LINES} actionLabel="🎵 Chalishni boshla" onAction={onStart} accent="#a78bfa" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
