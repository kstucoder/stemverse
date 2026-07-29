// ReactionIntro — "Ajdaho G'ori" kinematik sarguzasht cutscene.
// Qorong'i g'or, mash'alalar, ulkan uxlab yotgan ajdaho, xazina yilt-yilti →
// namuna: bir ovchi shoshib qo'l cho'zadi → AJDAHO UYG'ONADI (falstart xavfi) →
// keyin gavhar yashil yonganda toza olinadi → Electra qoidalarni tushuntiradi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleDuel, duelTick } from './pixi/dragonScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playBlip, playScore, playError } from './gameAudio';

const LINES = [
  { text: "Sh-sh-sh... Ovoz chiqarma! Bu — Ajdaho g'ori. Bu yerda asrlar davomida to'plangan sehrli gavharlar bor.", emotion: 'normal' },
  { text: "Lekin ularni ulkan ajdaho qo'riqlaydi — hozir u uxlab yotibdi. Gavharni faqat u YASHIL yongandagina olsang bo'ladi!", emotion: 'normal' },
  { text: "Ehtiyot bo'l! Yashildan oldin qo'l cho'zsang — ajdaho uyg'onadi va gavhar raqibingga o'tadi. Sabr va tezlik kerak!", emotion: 'worried' },
  { text: "Platangga 2 tugma, LED va buzzer ula. Do'sting bilan bellash — birinchi 5 ta gavharni olgan G'OLIB! Tayyormisan, sarguzashtchi?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleDuel(app);
  let t = 0, done = false, rp = 0, foulDone = false, winDone = false, b1 = false, b2 = false, b3 = false;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    scene.particles.tick(dt);

    let state = 'waiting', winner = 0, foul = false;
    if (t < 2.6) { state = 'waiting'; }
    else if (t < 3.1) { state = 'ready'; if (!b1) { b1 = true; playBlip(700); } }
    else if (t < 5.4) {                    // FALSTART namunasi — ajdaho uyg'onadi
      state = 'result'; winner = 1; foul = true;
      if (!foulDone) { foulDone = true; rp = 1; playError(); useGameStore.getState().triggerShake(12); }
    }
    else if (t < 6.0) { state = 'ready'; if (!b2) { b2 = true; playBlip(700); } }
    else if (t < 6.6) { state = 'go'; if (!b3) { b3 = true; playBlip(1400); } }
    else {                                 // TOZA olish namunasi
      state = 'result'; winner = 1; foul = false;
      if (!winDone) { winDone = true; rp = 2; playScore(); }
    }

    duelTick(scene, dt, t, { state, winner, p1: 0, p2: 0, connected: true, roundPulse: rp, foul });
    if (!done && t > 7.8) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function ReactionIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#0a0806' }}>
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
            <DialogueBox name="ELECTRA" role="Sarguzasht yo'lboshchisi" lines={LINES} actionLabel="💎 G'orga kir" onAction={onStart} accent="#ffd23f" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
