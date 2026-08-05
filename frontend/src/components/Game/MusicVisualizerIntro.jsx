// MusicVisualizerIntro — "Frekans Sozlash" KO'P-ROLLI kinematik ssenariy.
// Syujet: chuqur-kosmos relesi VOLTRA-7 efirida dushman GLITCH signalni bo'g'moqda.
// Rollar: NOVA (qo'mondon), GLITCH (bosqinchi), ECHO (AI analizator), RIX (bosh muhandis).
// Orqa fonda synthwave signal-tuning demo ishlaydi (marker avto homing -> qulflash).
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleVisualizer, visualizerTick, FMIN, FMAX } from './pixi/visualizerScene';
import MultiDialogueBox from './MultiDialogueBox';
import { playScore, playClick, playError } from './gameAudio';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const CAST = {
  nova: { name: 'NOVA', role: "Missiya qo'mondoni", accent: '#ff2d95', variant: 'nova', side: 'left' },
  glitch: { name: 'GLITCH', role: 'Signal bosqinchisi', accent: '#a24bff', variant: 'glitch', side: 'right' },
  echo: { name: 'ECHO', role: 'AI signal analizatori', accent: '#00e5ff', variant: 'echo', side: 'left' },
  rix: { name: 'RIX', role: 'Bosh muhandis', accent: '#39ff88', variant: 'rix', side: 'left' },
};

const LINES = [
  { speaker: 'nova', text: "Chuqur-kosmos relesi VOLTRA-7. Yer bilan yagona aloqamiz shu minoradan o'tadi. Ammo efirda begona signal paydo bo'ldi...", emotion: 'worried' },
  { speaker: 'glitch', text: "Bu chastota endi MENIKI. Ovozingni shovqinga aylantiraman — hech kim eshitmaydi. Ha-ha!", emotion: 'angry' },
  { speaker: 'nova', text: "Uni bo'sh qo'ymaymiz! Muhandis — konsolga o't. Signalni tozalab, aloqani tiklashimiz shart.", emotion: 'excited' },
  { speaker: 'echo', text: "Konsolda potensiometr bor. Uni bursang — tovush chastotasi o'zgaradi; spektrdagi cho'qqi sening signaling.", emotion: 'normal' },
  { speaker: 'echo', text: "Ekranda SARIQ target chastota bandi chiqadi. Cho'qqini o'shanga MOSLAB, bir zum USHLAB tur — signal QULFLANADI.", emotion: 'normal' },
  { speaker: 'rix', text: "Har tiklangan to'lqinda band torayadi — GLITCH kuchayadi. 3 ta toza signalni qulflasang, efir tozalanadi.", emotion: 'excited' },
  { speaker: 'rix', text: "Konsol seniki, muhandis. Efirni tozala!", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleVisualizer(app);
  const ctl = { pot: 30, connected: true, mode: 'intro', resetPulse: 0, onNear: () => playClick(), onLock: () => playScore() };
  let t = 0, done = false, endedAt = 0;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };
  ctlRef.current.glitch = () => { scene.flashT = 0.5; playError(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
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
            <MultiDialogueBox cast={CAST} lines={LINES} actionLabel="🎚️ Konsolni ol" onAction={onStart} />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
