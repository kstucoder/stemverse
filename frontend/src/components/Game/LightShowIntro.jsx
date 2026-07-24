// LightShowIntro — "Festival boshlanishi" kinematik cutscene.
// Xronika: tiklangan shaharda katta festival — minglab odam qorong'i sahna
// oldida kutmoqda (telefon chiroqlari) → yorug'lik pulti ishga tushmoqchi bo'lib
// bir necha bor chaqnaydi, so'ng KUYADI (uchqun) → Electra chiqib seni yorug'lik
// muhandisi etib tayinlaydi → "Shouni boshla".
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleStage, stageTick } from './pixi/stageScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playBeat, playZap } from './gameAudio';

const LINES = [
  { text: "Shahar tiklandi — bugun katta festival! Lekin qara, minglab odam kutmoqda, sahna esa qop-qorong'i...", emotion: 'worried' },
  { text: "Yorug'lik pulti kuyib qoldi — chiroqlar, lazerlar, hammasi o'lik. Konsert boshlanmayapti!", emotion: 'worried' },
  { text: "Sen yorug'lik muhandisisan! Platangga LED'lar va tugmani ula — bu sahnaning yangi pulti.", emotion: 'normal' },
  { text: "Tugmani musiqa ritmiga bosib sahnani jonlantir. 3 ta qo'shiqni yoritib ber — olomonni portlat! Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleStage(app);
  let t = 0, done = false;
  let phase = 'wait';       // wait → ignite → fail → done
  let beatP = 0, igniteAcc = 0, sparked = false;
  let connected = false;

  ctlRef.current.skip = () => {
    if (done) return;
    done = true; onSceneDone();
  };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.particles.tick(dt);

    if (phase === 'wait') {
      if (t > 2.2) { phase = 'ignite'; igniteAcc = 0; }
    } else if (phase === 'ignite') {
      connected = true;             // chiroqlar ishga tushmoqchi
      igniteAcc += dt;
      if (igniteAcc > 0.16) { igniteAcc = 0; beatP += 1; playBeat(beatP); }
      if (t > 3.0) {
        phase = 'fail'; connected = false; sparked = true;
        playZap();
        scene.strobe.alpha = 0.6;
        scene.particles.burst(480, 100, 0x9adfff, 20, 240);
        useGameStore.getState().triggerShake(9);
      }
    } else if (phase === 'fail') {
      connected = false;
      if (!done && t > 3.4) { done = true; onSceneDone(); }
    }

    stageTick(scene, dt, t, { beatPulse: beatP, dancePulse: 0, intensity: 0, songIndex: 0, ledOn: 0, connected });
  });

  return () => {};
}

export default function LightShowIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});

  const build = useMemo(
    () => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')),
    []
  );

  return (
    <div className="absolute inset-0 z-30" style={{ background: '#03040c' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button
              onClick={() => ctlRef.current.skip?.()}
              className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-colors"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#94a3b8', background: 'rgba(11,17,32,0.7)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
            >
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}

        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox
              name="ELECTRA"
              role="Sahna muhandisi"
              lines={LINES}
              actionLabel="🎆 Shouni boshla"
              onAction={onStart}
              accent="#c77dff"
            />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
