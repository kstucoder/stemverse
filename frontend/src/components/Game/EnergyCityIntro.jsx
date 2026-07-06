// EnergyCityIntro — o'yin oldidan PixiJS bo'ron sahnasi + Electra dialogi.
// Xronika: yorug' tinch shahar → yomg'ir kuchayadi → YASHIN uradi →
// binolar birin-ketin o'chadi → zulmatdagi shahar ustida Electra chiqib,
// missiyani tushuntiradi → "Shaharni qutqarish" → o'yin boshlanadi.
// Bola cutscene'da ko'rgan shahar — o'yinda o'zi yoqadigan shaharning AYNI O'ZI.
import { useMemo, useRef, useState } from 'react';
import { Graphics } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import { assembleCity, cityTick, makeRain, LW, GROUND_Y } from './pixi/cityScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playThunder } from './gameAudio';

const LINES = [
  { text: "Voy-do'st! Ko'rdingmi?! Yashin to'g'ridan-to'g'ri elektr stansiyaga urildi!", emotion: 'worried' },
  { text: "Butun Energy City zulmatda qoldi... 8 ta bino, minglab odamlar chiroqsiz o'tiribdi!", emotion: 'worried' },
  { text: "Menga quloq sol: stolingdagi LED — bu shaharning yangi yuragi. Uni platangning 13-piniga ula.", emotion: 'normal' },
  { text: "Kodni yukla — LED har miltillaganda bitta bino uyg'onadi. Shaharni birga yoritamiz, tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const city = assembleCity(app, { startLit: true });
  const rain = makeRain(city.root);

  // Yashin nayzasi (olam koordinatasida) + to'liq ekran flash.
  // DIQQAT: flash 1x1 birlik to'rtburchak — har kadrda ekran o'lchamiga
  // cho'ziladi. Katta statik rect (4000x3000) stage chegarasini portlatib,
  // bloom filtri GPU tekstura limitidan oshadigan framebuffer so'raydi va
  // ba'zi mashinalarda "setResource ... null" crash beradi.
  const bolt = new Graphics();
  bolt.alpha = 0;
  city.root.addChild(bolt);
  const flash = new Graphics().rect(0, 0, 1, 1).fill(0xeaf3ff);
  flash.alpha = 0;
  app.stage.addChild(flash);

  let t = 0;
  let phase = 'calm';         // calm → strike → blackout → done
  let litCount = 8;
  let energy = 85;
  let tramOn = true;
  let blackoutTimer = 0;
  let boltLife = 0;
  let flashA = 0;
  let done = false;
  let ambientFlashTimer = 5;

  function drawBolt() {
    // Eng baland binoga uriladigan siniq chiziq
    const target = city.specs.reduce((a, b) => (b.h > a.h ? b : a));
    bolt.clear();
    let x = target.x + 60, y = -40;
    bolt.moveTo(x, y);
    const ty = GROUND_Y - target.h;
    while (y < ty - 20) {
      x += (Math.random() - 0.5) * 60;
      y += 40 + Math.random() * 40;
      bolt.lineTo(x, y);
    }
    bolt.lineTo(target.x, ty);
    bolt.stroke({ width: 3, color: 0xeaf3ff });
    // yon shoxcha
    bolt.moveTo(x, y - 60).lineTo(x - 50 - Math.random() * 40, y + 10);
    bolt.stroke({ width: 1.5, color: 0xcfe6ff, alpha: 0.8 });
    bolt.alpha = 1;
    boltLife = 0.22;
  }

  function strike() {
    if (phase !== 'calm') return;
    phase = 'strike';
    drawBolt();
    flashA = 0.95;
    playThunder();
    useGameStore.getState().triggerShake(14);
    city.particles.burst(city.specs.reduce((a, b) => (b.h > a.h ? b : a)).x, 140, 0xeaf3ff, 26, 260);
  }

  // Skip: to'g'ridan-to'g'ri qorong'i holat + dialog
  ctlRef.current.skip = () => {
    if (done) return;
    phase = 'done';
    litCount = 0; energy = 0; tramOn = false;
    city.buildings.forEach((b) => b.setLit(false, true));
    rain.set(0.3);
    done = true;
    onSceneDone();
  };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    city.tweens.tick(dt);
    city.particles.tick(dt);
    rain.tick(dt);

    // flash har doim ekran o'lchamida (stage chegarasini oshirmasdan)
    flash.width = app.screen.width;
    flash.height = app.screen.height;

    // ssenariy
    if (phase === 'calm') {
      rain.set(Math.min(t / 3, 1) * 0.8);
      if (t > 2.6 && t < 2.7 && flashA <= 0) flashA = 0.25; // uzoqdagi ogohlantiruvchi yaltirash
      if (t >= 4.2) strike();
    } else if (phase === 'strike') {
      if (boltLife <= 0 && flashA < 0.3) {
        phase = 'blackout';
        blackoutTimer = 0;
      }
    } else if (phase === 'blackout') {
      blackoutTimer += dt;
      // har 90ms da bitta bino o'chadi
      const targetLit = Math.max(0, 8 - Math.floor(blackoutTimer / 0.09));
      litCount = targetLit;
      energy = Math.max(0, 85 * (targetLit / 8));
      if (targetLit <= 4) tramOn = false;
      if (targetLit === 0 && blackoutTimer > 1.4 && !done) {
        phase = 'done';
        rain.set(0.3);
        done = true;
        onSceneDone();
      }
    } else if (phase === 'done') {
      // zulmat ambiyenti: vaqti-vaqti bilan uzoq chaqnash
      ambientFlashTimer -= dt;
      if (ambientFlashTimer <= 0) {
        ambientFlashTimer = 6 + Math.random() * 6;
        flashA = 0.12;
      }
    }

    // bolt + flash so'nishi
    if (boltLife > 0) {
      boltLife -= dt;
      bolt.alpha = Math.max(0, boltLife / 0.22);
      if (boltLife <= 0.1 && boltLife + dt > 0.1) { flashA = Math.max(flashA, 0.5); } // ikkinchi chaqnash
    } else bolt.alpha = 0;
    if (flashA > 0) {
      flashA = Math.max(0, flashA - dt * 2.2);
      flash.alpha = flashA;
    } else flash.alpha = 0;

    cityTick(city, dt, t, {
      litCount,
      energy,
      night: true,
      tramOn,
      shooting: false, // bo'ronda uchar yulduz bo'lmaydi
    });
  });

  return () => city.tweens.clear();
}

export default function EnergyCityIntro({ onStart }) {
  const [phase, setPhase] = useState('storm'); // storm | talk
  const ctlRef = useRef({});

  const build = useMemo(
    () => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')),
    []
  );

  return (
    <div className="absolute inset-0 z-30" style={{ background: '#03040c' }}>
      <PixiStage build={build} className="rounded-xl">
        {/* Skip tugmasi — faqat bo'ron fazasida */}
        {phase === 'storm' && (
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

        {/* Electra dialogi — zulmatdagi shahar ustida */}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox
              lines={LINES}
              actionLabel="⚡ Shaharni qutqarish"
              onAction={onStart}
            />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
