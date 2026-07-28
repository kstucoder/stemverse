// TempGardenIntro — "Oltin zona" kinematik cutscene.
// Bog' goh muzlaydi (qor), goh jazillaydi (so'liydi) → mukammal haroratda gullaydi.
// Electra "oltin zona" (20–30°C) sirini tushuntiradi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleGarden, gardenTick } from './pixi/gardenScene';
import DialogueBox from './DialogueBox';

const LINES = [
  { text: "Bu — sehrli bog'. Lekin harorat noto'g'ri: goh muzlaydi, goh jazillaydi — o'simliklar nobud bo'lyapti!", emotion: 'worried' },
  { text: "O'simliklar faqat 20–30°C oralig'ida — 'oltin zona'da gullaydi. Na juda sovuq, na juda issiq bo'lsin.", emotion: 'normal' },
  { text: "Platangga harorat sensori va 3 ta LED ula — sensor haroratni o'lchaydi, LED zonani ko'rsatadi.", emotion: 'normal' },
  { text: "Haroratni oltin zonada 30 soniya ushlab tur — bog'ni to'liq gullat! Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleGarden(app);
  let t = 0, done = false, grow = 0;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };
  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    scene.particles.tick(dt);
    // harorat ssenariysi: sovuq → issiq → mukammal
    let temp;
    if (t < 1.6) temp = 9;
    else if (t < 3.0) temp = 38;
    else { temp = 25; grow = Math.min(1, grow + dt * 0.5); }
    const zone = temp < 20 ? 'cold' : temp > 30 ? 'hot' : 'perfect';
    if (!done && t > 5.4) { done = true; onSceneDone(); }
    gardenTick(scene, dt, t, { temp, zone, growth: grow, connected: true });
  });
  return () => {};
}

export default function TempGardenIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#0a1a12' }}>
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
            <DialogueBox name="ELECTRA" role="Bog'bon muhandis" lines={LINES} actionLabel="🌱 Bog'ni gullat" onAction={onStart} accent="#39e06a" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
