// MusicVisualizerIntro — "Ovoz Vizualizatori" kinematik cutscene (asteroid bazasi sagasi davomi).
// Voqea davomi: dronlarni qaytarding, lekin ular ketishda aloqa antennasini buzib ketishdi.
// Endi yangi KY-038 MIKROFON o'rnatildi — ovoz sathini flotning uzatish oynasiga moslab
// handshake signalini qulflaymiz. Orqa fonda realistik boshqaruv xonasi ovozga reaksiya beradi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleVisualizer, visualizerTick } from './pixi/visualizerScene';
import DialogueBox from './DialogueBox';
import { playScore, playClick } from './gameAudio';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const LINES = [
  { text: "Dronlarni qaytarding — lekin ular ketishda aloqa antennamizni ishdan chiqarib, flot bilan aloqani uzib ketishdi.", emotion: 'worried' },
  { text: "Konsolga yangi KY-038 mikrofon uladim. U haqiqiy OVOZ sathini o'lchaydi — ovoz chiqarsang (chapak yoki kuy), uzatish sathi ko'tariladi.", emotion: 'normal' },
  { text: "Ekrandagi metrda SARIQ uzatish oynasi bor — bu flotning kutayotgan signal kuchi. Ovoz sathini o'shanga moslab, bir zum USHLAB tur: handshake qulflanadi.", emotion: 'normal' },
  { text: "Har handshake'da oyna torayadi. 3 tasini qulflab, flot bilan aloqani tikla — yordam yo'lga chiqsin! Tayyormisan, aloqachi?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleVisualizer(app);
  const ctl = { level: 0, connected: true, mode: 'intro', resetPulse: 0, onNear: () => playClick(), onLock: () => playScore() };
  let t = 0, done = false, endedAt = 0;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    // demo: ovoz sathini flot uzatish oynasiga homing qildirish -> handshake qulflanadi
    if (t > 0.9) { const tp = clamp(scene.targetC + 0.008 * Math.sin(t * 3), 0, 1); ctl.level += (tp - ctl.level) * Math.min(1, dt * 2); }
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
    <div className="absolute inset-0 z-30" style={{ background: '#05080c' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#9fe0bc', background: 'rgba(8,14,18,0.7)', border: '1px solid rgba(57,255,136,0.25)', cursor: 'pointer' }}>
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox name="ELECTRA" role="Aloqa muhandisi" lines={LINES} actionLabel="🎙️ Mikrofonni yoq" onAction={onStart} accent="#39ff88" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
