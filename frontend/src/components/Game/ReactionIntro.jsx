// ReactionIntro — "Refleks Arenasi" kinematik cutscene.
// Arena ochiladi, ikki robot yuzma-yuz → namuna raund: signal YASHIL bo'ladi,
// 1-robot tezroq zarba beradi (mexanikani o'rgatadi) → Electra qoidalarni
// tushuntiradi (yakuniy chempionlik ko'rsatilmaydi — bola o'zi o'ynaydi).
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleDuel, duelTick } from './pixi/duelScene';
import DialogueBox from './DialogueBox';
import { playScore, playBlip } from './gameAudio';

const LINES = [
  { text: "Xush kelibsan, Refleks Arenasi'ga! Bu — eng tez qo'l egasini aniqlaydigan duel.", emotion: 'excited' },
  { text: "Markazdagi signal tasodifiy YASHIL bo'ladi. Yashil yonishi bilan — kim birinchi tugmasini bossa, o'sha yutadi!", emotion: 'normal' },
  { text: "Ehtiyot bo'l: yashildan OLDIN bossang — falstart bo'ladi va ochko raqibingga o'tadi. Sabr va tezlik kerak.", emotion: 'worried' },
  { text: "Platangga 2 tugma, LED va buzzer ula. Do'sting bilan bellash — birinchi 5 ta g'alaba to'plagan CHEMPION! Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleDuel(app);
  let t = 0, done = false, rp = 0, resolved = false, blipped = false, wentGo = false;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    scene.particles.tick(dt);

    let state = 'waiting', winner = 0;
    if (t < 2.2) state = 'waiting';
    else if (t < 3.5) { state = 'ready'; if (!blipped) { blipped = true; playBlip(700); } }
    else if (t < 4.1) { state = 'go'; if (!wentGo) { wentGo = true; playBlip(1400); } }
    else { state = 'result'; winner = 1; if (!resolved) { resolved = true; rp++; playScore(); } }

    duelTick(scene, dt, t, { state, winner, p1: resolved ? 1 : 0, p2: 0, connected: true, roundPulse: rp });
    if (!done && t > 5.8) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function ReactionIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#0a0016' }}>
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
            <DialogueBox name="ELECTRA" role="Arena boshlovchisi" lines={LINES} actionLabel="⚔️ Duelni boshla" onAction={onStart} accent="#c77dff" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
