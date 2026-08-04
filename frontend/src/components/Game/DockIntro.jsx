// DockIntro — "Ta'minot Doklash" kinematik cutscene (asteroid sagasi davomi).
// Baza oziq-ovqat yetishtira boshladi (13), endi ta'minot podlari kelmoqda — lekin
// avtomatik doklash ishdan chiqqan. Namuna: pod yaqinlashib, yashil zonada to'xtab
// doklanadi (yakun emas) -> Electra doklash operatorini tayinlaydi. FRAME-RATE mustaqil.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleDock, dockTick, GAP_MAX } from './pixi/dockScene';
import DialogueBox from './DialogueBox';
import { playBlip, playSeal } from './gameAudio';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const zoneOf = (d) => d > 45 ? 'far' : d > 17 ? 'slow' : d >= 7 ? 'sweet' : d >= 4 ? 'danger' : 'crash';

const LINES = [
  { text: "Ta'minot podlari yetib keldi — oziq, suv, ehtiyot qismlar. Lekin avtomatik doklash tizimi falokatdan ishdan chiqqan.", emotion: 'worried' },
  { text: "Ularni QO'LDA doklash kerak. Ultrasonik sensor pod bilan dok orasidagi masofani o'lchaydi.", emotion: 'normal' },
  { text: "Podni sekin yaqinlashtir. YASHIL zonaga kirganda 1 soniya ushlab tur — qisqichlar yopilib doklaydi. Juda tez borsang — to'qnashuv!", emotion: 'normal' },
  { text: "5 ta ta'minot podini dokla va bazani to'la ta'minla. Tayyormisan, operator?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleDock(app);
  let t = 0, done = false, beepAcc = 0, docked = false;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    // scripted masofa: uzoqdan yaqinlashadi -> yashil zonada to'xtaydi
    let dist;
    if (t < 1.0) dist = 80;
    else if (t < 4.0) dist = 80 - ((t - 1.0) / 3.0) * 68;   // 80 -> 12
    else dist = 11;                                          // sweet'da turadi
    const zone = zoneOf(dist);
    const gap = clamp((dist - 4) / 76, 0, 1) * GAP_MAX;
    let holdFrac = 0;
    if (t >= 4.0) { holdFrac = clamp((t - 4.0) / 1.0, 0, 1); if (!docked && holdFrac >= 1) { docked = true; playSeal(); } }
    if (['slow', 'sweet', 'danger'].includes(zone) && t < 4.9) { beepAcc += dt; const iv = zone === 'sweet' ? 0.2 : 0.4; if (beepAcc > iv) { beepAcc = 0; playBlip(zone === 'sweet' ? 1100 : 760); } }

    dockTick(scene, dt, t, { gap, zone, holdFrac, docked: docked ? 1 : undefined, connected: true, flash: docked && holdFrac >= 1 ? 0.4 : 0, flashCol: 0x39e06a });
    if (!done && t > 5.6) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function DockIntro({ onStart }) {
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
            <DialogueBox name="ELECTRA" role="Doklash operatori" lines={LINES} actionLabel="🛰️ Doklashni boshla" onAction={onStart} accent="#2b6cc0" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
