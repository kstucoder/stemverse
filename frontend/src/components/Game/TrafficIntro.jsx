// TrafficIntro — o'yin oldidan PixiJS kinematik cutscene + Electra dialogi.
// Xronika (Energy City bo'roni uslubida):
//   tinch chorraha (yashil, mashinalar oqadi, yengil yomg'ir)
//   → svetafor SHORT-CIRCUIT bo'ladi (uchqun + oq flash + momaqaldiroq)
//   → chiroqlar o'chadi, mashinalar keskin tormozlaydi, tiqilinch
//   → NEAR-MISS: bir mashina o'lik chiroqdan otilib o'tadi (screech + shake)
//   → Electra chiqib missiyani tushuntiradi → "Chorrahani boshqar" → o'yin.
// Bola cutscene'da ko'rgan chorraha — o'yinda o'zi boshqaradigan chorrahaning AYNI O'ZI.
import { useMemo, useRef, useState } from 'react';
import { Graphics } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import {
  assembleIntersection, intersectionTick,
  SIGNAL_X, ROAD_TOP, STOP_X, LANE_Y, CROSS_X0, CROSS_X1,
} from './pixi/trafficScene';
import { makeRain } from './pixi/cityScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playHorn, playZap, playThunder, playCrash } from './gameAudio';

const LINES = [
  { text: "Voy! Ko'rdingmi?! Svetafor short bo'lib ketdi — hamma chiroq bir zumda o'chdi!", emotion: 'worried' },
  { text: "Signal yo'q, mashinalar keskin tormozlab tiqilib qoldi. Yana bir oz — va halokat bo'lardi!", emotion: 'worried' },
  { text: "Menga quloq sol: platangga 3 ta LED ula — qizil, sariq, yashil. Bu chorrahaning yangi miyasi.", emotion: 'normal' },
  { text: "Kodni yukla — har STATE signali chiroqlarni almashtiradi. 10 ta siklni boshqar va tartibni tikla, tayyormisan?", emotion: 'excited' },
];

const MID_X = (CROSS_X0 + CROSS_X1) / 2;

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleIntersection(app);
  const rain = makeRain(scene.root, 140);

  // To'liq ekran oq flash — short-circuit va near-miss uchun.
  // 1x1 rect har kadrda ekran o'lchamiga cho'ziladi (katta statik rect stage
  // chegarasini portlatib bloom framebuffer'ini GPU limitidan oshirmasin).
  const flash = new Graphics().rect(0, 0, 1, 1).fill(0xeaf3ff);
  flash.alpha = 0;
  app.stage.addChild(flash);

  let t = 0;
  let phase = 'calm';        // calm → short → chaos → done
  let done = false;
  let honkTimer = 1.2;
  let sparkTimer = 0;
  let flashA = 0;
  let nearMissDone = false;

  function shortCircuit() {
    phase = 'short';
    flashA = 0.95;
    playZap();
    playThunder();
    useGameStore.getState().triggerShake(13);
    scene.particles.burst(SIGNAL_X, ROAD_TOP - 100, 0x9adfff, 24, 250);
    scene.particles.burst(SIGNAL_X, ROAD_TOP - 100, 0xffe08a, 14, 180);
  }

  // Near-miss: eng oldingi mashina o'lik chiroqdan otilib o'tadi.
  // Uni to'xtash chizig'idan sal oldinga qo'yamiz — intersectionTick x>=STOP_X
  // bo'lgan mashinani to'xtatmaydi, shuning uchun u chorrahani kesib o'tadi.
  function nearMiss() {
    nearMissDone = true;
    flashA = 0.7;
    playCrash();
    playHorn();
    useGameStore.getState().triggerShake(17);
    const runner = scene.cars
      .filter((c) => c.x < STOP_X)
      .sort((a, b) => b.x - a.x)[0];
    if (runner) { runner.x = STOP_X + 6; runner.v = 250; runner.c.x = runner.x; }
    scene.particles.burst(MID_X, LANE_Y, 0xff5a3c, 20, 230);
  }

  ctlRef.current.skip = () => {
    if (done) return;
    phase = 'done'; done = true;
    onSceneDone();
  };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.tweens.tick(dt);
    scene.particles.tick(dt);
    rain.tick(dt);

    flash.width = app.screen.width;
    flash.height = app.screen.height;

    let state = 'GREEN';

    if (phase === 'calm') {
      // tinch tungi chorraha — mashinalar oqadi, yomg'ir sekin kuchayadi
      rain.set(Math.min(t / 2, 1) * 0.3);
      state = 'GREEN';
      if (t >= 2.3) shortCircuit();
    } else if (phase === 'short') {
      state = 'OFF';                    // chiroqlar o'chdi
      rain.set(0.5);
      sparkTimer -= dt;                 // svetafor boshida qisqa uchqunlar
      if (sparkTimer <= 0) {
        sparkTimer = 0.14 + Math.random() * 0.18;
        scene.particles.burst(SIGNAL_X, ROAD_TOP - 100, 0x9adfff, 5, 150);
      }
      if (t >= 3.0) { phase = 'chaos'; honkTimer = 0.25; }
    } else if (phase === 'chaos') {
      state = 'OFF';
      rain.set(0.6);
      honkTimer -= dt;
      if (honkTimer <= 0) { honkTimer = 0.5 + Math.random() * 0.9; playHorn(); }
      if (!nearMissDone && t >= 3.7) nearMiss();
      if (t >= 5.0 && !done) { phase = 'done'; done = true; onSceneDone(); }
    } else if (phase === 'done') {
      state = 'OFF';
      rain.set(0.5);
      sparkTimer -= dt;                 // vaqti-vaqti bilan o'lik svetafor uchquni
      if (sparkTimer <= 0) {
        sparkTimer = 1.6 + Math.random() * 2.2;
        scene.particles.burst(SIGNAL_X, ROAD_TOP - 100, 0x9adfff, 4, 120);
        flashA = Math.max(flashA, 0.1);
      }
    }

    // flash so'nishi
    if (flashA > 0) { flashA = Math.max(0, flashA - dt * 2.2); flash.alpha = flashA; }
    else flash.alpha = 0;

    intersectionTick(scene, dt, t, { state, connected: true, pedestrianCrossing: false });
  });

  return () => scene.tweens.clear();
}

export default function TrafficIntro({ onStart }) {
  const [phase, setPhase] = useState('scene'); // scene | talk
  const ctlRef = useRef({});

  const build = useMemo(
    () => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')),
    []
  );

  return (
    <div className="absolute inset-0 z-30" style={{ background: '#03040c' }}>
      <PixiStage build={build} className="rounded-xl">
        {/* Skip tugmasi — dialog boshlangunicha */}
        {phase === 'scene' && (
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
