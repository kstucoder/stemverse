// LightShowIntro — "Festival tunini" kinematik cutscene (~10s, musiqa + raqs).
// Xronika: olomon yig'iladi → musiqa boshlanadi, odamlar raqsga tushadi →
// yorug'lik pulti guldur-guldur yonadi, DISKO AVJIGA CHIQADI (lazerlar, strob,
// raqqoslar, olomon jo'shadi) → to'satdan pult KUYADI (uchqun, musiqa uziladi,
// zulmat) → Electra chiqib seni yorug'lik muhandisi etib tayinlaydi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleStage, stageTick } from './pixi/stageScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { startMusic, stopMusic, setMusicVolume, playZap, playHollow } from './gameAudio';

const LINES = [
  { text: "Festival endigina avjiga chiqqandi — musiqa gumburlab, minglab odam raqsga tushgandi... birdan yorug'lik pulti kuyib, hammayoq zim-ziyo bo'ldi!", emotion: 'worried' },
  { text: "Musiqa to'xtadi, olomon esa hamon kutmoqda. Bu shouni endi faqat sen qutqara olasan!", emotion: 'worried' },
  { text: "Sen yorug'lik muhandisisan — platangga LED'lar va tugmani ula, bu sahnaning yangi pulti.", emotion: 'normal' },
  { text: "Tugmani musiqa ritmiga bosib sahnani jonlantir, 3 ta qo'shiqni yoritib ber — olomonni portlat! Tayyormisan?", emotion: 'excited' },
];

const CONFETTI = [0xff2d78, 0xffd166, 0x00eeff, 0x39e06a];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleStage(app);
  startMusic(124);
  setMusicVolume(0.45);

  let t = 0, done = false, phase = 'gather';
  let beatP = 0, beatAcc = 0, musicUp = false, failed = false;
  let connected = false, groove = 0;

  ctlRef.current.skip = () => {
    if (done) return;
    done = true; stopMusic(); onSceneDone();
  };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.particles.tick(dt);

    if (phase === 'gather') {
      // olomon yig'iladi, musiqa sekin boshlanadi, odamlar chayqala boshlaydi
      connected = false;
      groove = Math.min(0.45, (t / 3.5) * 0.45);
      if (t > 3.5) phase = 'powerup';
    } else if (phase === 'powerup') {
      // chiroqlar guldur-guldur yonadi
      connected = true; groove = 0.7;
      if (!musicUp) { musicUp = true; setMusicVolume(0.8); }
      beatAcc += dt; if (beatAcc > 0.48) { beatAcc = 0; beatP += 1; }
      if (t > 5.0) { phase = 'party'; setMusicVolume(1); }
    } else if (phase === 'party') {
      // DISKO AVJI — lazerlar, strob, raqs
      connected = true; groove = 1;
      beatAcc += dt;
      if (beatAcc > 0.48) {
        beatAcc = 0; beatP += 1;
        if (Math.random() < 0.4) scene.particles.burst(120 + Math.random() * 760, 110, CONFETTI[beatP % 4], 3, 240);
      }
      if (t > 8.4) {
        phase = 'fail'; connected = false; failed = true;
        stopMusic(); playZap();
        scene.strobe.alpha = 0.7;
        scene.particles.burst(480, 100, 0x9adfff, 26, 260);
        useGameStore.getState().triggerShake(12);
        setTimeout(() => playHollow(), 420);
      }
    } else if (phase === 'fail') {
      // pult kuydi — zulmat, olomon hafsalasi pir
      connected = false; groove = 0.18;
      if (!done && t > 9.9) { done = true; onSceneDone(); }
    }

    stageTick(scene, dt, t, {
      beatPulse: beatP, dancePulse: 0, intensity: 0,
      songIndex: Math.floor(t / 2) % 3, ledOn: 0, connected, groove,
    });
  });

  return () => { stopMusic(); };
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
