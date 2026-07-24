// TrafficIntro — o'yin oldidan PixiJS "buzuq chorraha" sahnasi + Electra dialogi.
// Xronika: tungi chorraha → svetafor ishdan chiqadi (qizil miltillaydi) →
// mashinalar tiqilib, signal chaladi → Electra chiqib missiyani tushuntiradi →
// "Chorrahani boshqar" → o'yin boshlanadi.
// Bola cutscene'da ko'rgan chorraha — o'yinda o'zi boshqaradigan chorrahaning AYNI O'ZI.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleIntersection, intersectionTick } from './pixi/trafficScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playHorn } from './gameAudio';

const LINES = [
  { text: "Voy! Ko'rdingmi? Chorrahaning svetafori ishdan chiqdi — hamma chiroq o'chdi!", emotion: 'worried' },
  { text: "Signal yo'q, mashinalar tiqilib qoldi. Hech kim qachon yurishni bilmayapti — bir zumda halokat bo'ladi!", emotion: 'worried' },
  { text: "Menga quloq sol: platangga 3 ta LED ula — qizil, sariq, yashil. Bu chorrahaning yangi miyasi.", emotion: 'normal' },
  { text: "Kodni yukla — har STATE signali chiroqlarni almashtiradi. 10 ta siklni boshqar va tartibni tikla, tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleIntersection(app);

  let t = 0;
  let phase = 'chaos';   // chaos → done
  let done = false;
  let honkTimer = 0.8;

  // Skip: to'g'ridan-to'g'ri dialogga
  ctlRef.current.skip = () => {
    if (done) return;
    phase = 'done';
    done = true;
    onSceneDone();
  };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.tweens.tick(dt);
    scene.particles.tick(dt);

    // Buzuq svetafor — qizil chiroq miltillaydi (yonadi/o'chadi), demak
    // hech qachon GREEN bo'lmaydi → mashinalar to'xtash chizig'ida tiqiladi.
    const flickerOn = Math.floor(t * 2.2) % 2 === 0;
    const state = flickerOn ? 'RED' : 'OFF';

    // tiqilinchda mashinalar signal chaladi
    if (phase === 'chaos') {
      honkTimer -= dt;
      if (honkTimer <= 0) {
        honkTimer = 1.1 + Math.random() * 1.4;
        playHorn();
        useGameStore.getState().triggerShake(3);
      }
      if (t >= 4.2 && !done) {
        phase = 'done';
        done = true;
        onSceneDone();
      }
    }

    intersectionTick(scene, dt, t, { state, connected: true, pedestrianCrossing: false });
  });

  return () => scene.tweens.clear();
}

export default function TrafficIntro({ onStart }) {
  const [phase, setPhase] = useState('chaos'); // chaos | talk
  const ctlRef = useRef({});

  const build = useMemo(
    () => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')),
    []
  );

  return (
    <div className="absolute inset-0 z-30" style={{ background: '#03040c' }}>
      <PixiStage build={build} className="rounded-xl">
        {/* Skip tugmasi — faqat tiqilinch fazasida */}
        {phase === 'chaos' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button
              onClick={() => ctlRef.current.skip?.()}
              className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-colors"
              style={{
                fontFamily: 'Chakra Petch, monospace',
                color: '#94a3b8',
                background: 'rgba(11,17,32,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
              }}
            >
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}

        {/* Electra dialogi — buzuq chorraha ustida */}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox
              name="ELECTRA"
              role="Trafik muhandisi"
              lines={LINES}
              actionLabel="🚦 Chorrahani boshqar"
              onAction={onStart}
              accent="#00EEFF"
            />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
