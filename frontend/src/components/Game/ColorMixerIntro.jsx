// ColorMixerIntro — o'yin oldidan PixiJS "ranglar so'nishi" cutscene + Electra.
// Xronika: Kroma kristali jonli ranglar bilan yonadi → ranglar bittalab so'nadi
// (butun olam kulrangga aylanadi, ColorMatrixFilter desaturatsiya) → Electra
// chiqib RGB bilan rangni qaytarishni so'raydi → "Ranglarni qaytar" → o'yin.
import { useMemo, useRef, useState } from 'react';
import { ColorMatrixFilter } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import { assembleForge, forgeTick } from './pixi/colorScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playThunder, playDisconnect } from './gameAudio';

const LINES = [
  { text: "Qara! Kroma olamidan ranglar bittalab so'nib bormoqda... hammayoq kulrang bo'lyapti!", emotion: 'worried' },
  { text: "Rang yorug'likdan tug'iladi — qizil, yashil va ko'k. Ularsiz dunyo jonsiz qoladi.", emotion: 'worried' },
  { text: "Platangga RGB LED va 3 ta potensiometrni ula. Har biri bitta rang kanalini boshqaradi.", emotion: 'normal' },
  { text: "Endi ranglarni aralashtirib maqsad rangga moslashtir — Kroma'ga hayotni qaytaramiz, tayyormisan?", emotion: 'excited' },
];

// hue (0..360) → {r,g,b}
function hueRGB(h) {
  const c = 1, x = 1 - Math.abs(((h / 60) % 2) - 1);
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleForge(app);
  const cm = new ColorMatrixFilter();
  scene.root.filters = [cm];

  let t = 0;
  let phase = 'vivid';   // vivid → drain → done
  let sat = 1;           // 1 = to'liq rang, 0 = kulrang
  let done = false;
  let escapeT = 0;
  const target = { r: 255, g: 60, b: 200 };

  ctlRef.current.skip = () => {
    if (done) return;
    phase = 'done'; done = true; sat = 0;
    cm.reset(); cm.saturate(-1, false);
    onSceneDone();
  };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.tweens.tick(dt);
    scene.particles.tick(dt);

    // aylanuvchi kamalak rangi (kristall jonli yonadi)
    const col = hueRGB((t * 70) % 360);

    if (phase === 'vivid') {
      if (t >= 2.2) { phase = 'drain'; playThunder(); useGameStore.getState().triggerShake(6); }
    } else if (phase === 'drain') {
      sat -= dt * 0.5;
      // ranglar "uchib" chiqadi
      escapeT -= dt;
      if (escapeT <= 0) {
        escapeT = 0.12;
        const c = hueRGB(Math.random() * 360);
        scene.particles.burst(500, 250, (c.r << 16) | (c.g << 8) | c.b, 6, 200);
      }
      if (sat <= 0) { sat = 0; phase = 'done'; done = true; playDisconnect(); onSceneDone(); }
    }

    cm.reset();
    cm.saturate(sat - 1, false); // 0 → normal, -1 → kulrang

    forgeTick(scene, dt, t, {
      r: col.r, g: col.g, b: col.b,
      target, similarity: 0, connected: true, pulse: 0,
    });
  });

  return () => scene.tweens.clear();
}

export default function ColorMixerIntro({ onStart }) {
  const [phase, setPhase] = useState('scene'); // scene | talk
  const ctlRef = useRef({});

  const build = useMemo(
    () => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')),
    []
  );

  return (
    <div className="absolute inset-0 z-30" style={{ background: '#05060f' }}>
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
              role="Rang muhandisi"
              lines={LINES}
              actionLabel="🎨 Ranglarni qaytar"
              onAction={onStart}
              accent="#c77dff"
            />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
