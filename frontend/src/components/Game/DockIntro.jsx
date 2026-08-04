// DockIntro — "Ta'minot Doklash" (rotary enkoder) kinematik cutscene.
// Ta'minot podlari keldi, avto-doklash ishdan chiqqan -> namuna: kalit aylanuvchi
// slotga tekislanib mahkamlanadi (yakun emas) -> Electra doklash operatorini tayinlaydi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleDock, dockTick, TOL, angleDiff } from './pixi/dockScene';
import DialogueBox from './DialogueBox';
import { playBlip, playSeal } from './gameAudio';

const wrap = (a) => ((a % 360) + 360) % 360;

const LINES = [
  { text: "Ta'minot podlari yetib keldi — oziq, suv, ehtiyot qismlar. Lekin avtomatik doklash tizimi falokatdan ishdan chiqqan.", emotion: 'worried' },
  { text: "Ularni QO'LDA doklaymiz. Rotary enkoder ulash kalitini buradi — uni dokning aylanuvchi SLOTiga tekisla.", emotion: 'normal' },
  { text: "Kalit yashil slotga to'g'ri kelganda — tugmani bos, qisqichlar yopilib podni mahkamlaydi.", emotion: 'normal' },
  { text: "5 ta ta'minot podini dokla va bazani to'la ta'minla. Tayyormisan, operator?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleDock(app);
  let t = 0, done = false, collar = 120, target = 40, beepAcc = 0, lockPulse = 0, docked = 0;
  const lockTimes = [2.4, 4.2]; let li = 0;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    target = wrap(40 + t * 22);                              // slot aylanadi
    // kalit slotga yetib oladi (chase)
    let d = ((target - collar + 540) % 360) - 180;
    collar = wrap(collar + Math.sign(d) * Math.min(Math.abs(d), 150 * dt));
    const diff = angleDiff(collar, target), aligned = diff < TOL;
    if (li < lockTimes.length && t >= lockTimes[li]) { if (aligned) { lockPulse = 1; docked++; playSeal(); li++; } }
    lockPulse = Math.max(0, lockPulse - dt * 1.6);
    if (aligned && t < 5) { beepAcc += dt; if (beepAcc > 0.14) { beepAcc = 0; playBlip(1400); } }

    dockTick(scene, dt, t, { collarAngle: collar, targetAngle: target, aligned, lockPulse, docked, connected: true, flash: lockPulse > 0.5 ? 0.4 : 0, flashCol: 0x39e06a });
    if (!done && t > 5.4) { done = true; onSceneDone(); }
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
            <DialogueBox name="ELECTRA" role="Doklash operatori" lines={LINES} actionLabel="🛰️ Doklashni boshla" onAction={onStart} accent="#00c8e0" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
