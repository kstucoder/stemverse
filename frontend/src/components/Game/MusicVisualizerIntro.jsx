// MusicVisualizerIntro — "Frekans Sozlash" kinematik cutscene (asteroid bazasi sagasi davomi).
// Voqea davomi: dronlarni qaytarding (16-dars), lekin ular ketishda uzoq aloqa antennasini
// ishdan chiqarib, chastotani buzib ketishdi -> flot bilan aloqa uzildi. Endi antennani
// QO'LDA sozlab (potensiometr), flotning mayoq chastotasiga moslab 3 signalni qulflaymiz.
// Orqa fonda synthwave signal-tuning demo ishlaydi. FRAME-RATE mustaqil.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleVisualizer, visualizerTick, FMIN, FMAX } from './pixi/visualizerScene';
import DialogueBox from './DialogueBox';
import { playScore, playClick } from './gameAudio';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const LINES = [
  { text: "Perimetrni saqlab qolding — dronlar chekindi. Ammo ular ketishdan oldin uzoq aloqa antennamizni ishdan chiqarib, chastotani buzib ketishdi. Flot bilan aloqamiz uzildi.", emotion: 'worried' },
  { text: "Antennani QO'LDA sozlashimiz kerak. Potensiometrni bur — qabul chastotasi o'zgaradi, spektrdagi cho'qqi bizning signalimiz.", emotion: 'normal' },
  { text: "Ekranda SARIQ target chiqadi — bu flotning mayoq chastotasi. Cho'qqini o'shanga moslab, bir zum USHLAB tur — signal qulflanadi. Har to'lqinda band torayadi.", emotion: 'normal' },
  { text: "3 ta signalni qulflab, flot bilan aloqani tikla — yordam yo'lga chiqsin! Tayyormisan, aloqachi?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleVisualizer(app);
  const ctl = { pot: 30, connected: true, mode: 'intro', resetPulse: 0, onNear: () => playClick(), onLock: () => playScore() };
  let t = 0, done = false, endedAt = 0;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    // demo: markerni flot mayoq chastotasiga sekin homing qildirish
    if (t > 0.9) { const tp = clamp(((scene.targetFreq - FMIN) / (FMAX - FMIN)) * 1023, 0, 1023); ctl.pot += (tp - ctl.pot) * Math.min(1, dt * 1.7); }
    visualizerTick(scene, dt, t, ctl);
    if (scene.wave >= 1 && !endedAt) endedAt = t;
    if (!done && ((endedAt && t > endedAt + 0.9) || t > 9.5)) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function MusicVisualizerIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#0a0320' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#c9a9ef', background: 'rgba(10,6,26,0.7)', border: '1px solid rgba(255,45,149,0.25)', cursor: 'pointer' }}>
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox name="ELECTRA" role="Aloqa muhandisi" lines={LINES} actionLabel="📡 Antennani sozla" onAction={onStart} accent="#00e5ff" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
