// ThereminIntro — "Yorug'lik cholg'usi" kinematik cutscene.
// Tungi shahar maydonidagi sirli cholg'u o'zi kuy chaladi (yorug'lik ustuni
// ko'tarilib-tushadi), Electra tushuntiradi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleTheremin, thereminTick } from './pixi/thereminScene';
import DialogueBox from './DialogueBox';
import { updateLiveTone, startLiveTone, stopLiveTone } from './gameAudio';

const LINES = [
  { text: "Tun. Shahar maydonida sirli bir cholg'u — unga qo'l tegizmasdan, faqat yorug'lik bilan kuy chalinadi.", emotion: 'normal' },
  { text: "Bu — yorug'lik theremini. Qo'ling soyasi sensorga tushsa ovoz pasayadi, yorug'lik ko'paysa — ko'tariladi.", emotion: 'normal' },
  { text: "Platangga LDR sensor, buzzer va LED ula. Yorug'lik chastotani boshqaradi.", emotion: 'normal' },
  { text: "Qo'lingni harakatlantirib 3 ta notaga moslash — kuyni jonlantir. Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleTheremin(app);
  startLiveTone();
  let t = 0, done = false;

  ctlRef.current.skip = () => { if (done) return; done = true; stopLiveTone(); onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.particles.tick(dt);

    // cholg'u o'zi "chaladi" — pitch sekin to'lqinlanadi
    const fn = 0.42 + 0.34 * Math.sin(t * 0.9) + 0.06 * Math.sin(t * 3.1);
    const freq = 200 + fn * 1800;
    updateLiveTone(freq, 0.06);

    if (!done && t > 5.2) { done = true; stopLiveTone(); onSceneDone(); }

    thereminTick(scene, dt, t, {
      freqNorm: fn, targetNorm: 0.55 + 0.2 * Math.sin(t * 0.5), matched: false,
      captureProgress: 0, capturePulse: 0, connected: true, noteIndex: 0,
    });
  });

  return () => { stopLiveTone(); };
}

export default function ThereminIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);

  return (
    <div className="absolute inset-0 z-30" style={{ background: '#06060f' }}>
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
            <DialogueBox name="ELECTRA" role="Musiqa muhandisi" lines={LINES} actionLabel="🎵 Chalishni boshla" onAction={onStart} accent="#a78bfa" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
