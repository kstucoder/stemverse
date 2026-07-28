// TempGardenIntro — "Asteroid va izdan chiqqan iqlim" kinematik cutscene.
// Shaharga asteroid qulaydi → iqlim jinni bo'lib qoladi: goh qahraton sovuq
// (qor bo'ron), goh jazirama issiq. Gullar endi ochilay deganda muzlaydi yoki
// qovjiraydi — LEKIN to'liq ochilmaydi (yakunni bola o'zi quradi). Electra
// asteroidni tushuntiradi va ko'rsatma beradi.
import { useMemo, useRef, useState } from 'react';
import { Container, Graphics, Sprite } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import { assembleGarden, gardenTick } from './pixi/gardenScene';
import { radialTexture } from './pixi/cityScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playThunder, playRift } from './gameAudio';

const lerp = (a, b, k) => a + (b - a) * k;
const LINES = [
  { text: "Falokat! Shahar chetiga ulkan asteroid qulab tushdi — zarba to'lqinidan butun iqlim izdan chiqdi!", emotion: 'worried' },
  { text: "Endi ob-havo jinni bo'lib qoldi: goh qahraton sovuq muzlatadi, goh jazirama issiq kuydiradi.", emotion: 'worried' },
  { text: "Qara — gullar endigina ochilay deganda muzlab yoki qovjirab qolyapti. Bog' nobud bo'lmoqda!", emotion: 'worried' },
  { text: "Platangga harorat sensori va 3 ta LED ula. Haroratni 20–30°C 'oltin zona'da 30 soniya barqaror ushla — gullarni o'zing qutqar! Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleGarden(app);

  // asteroid + zarba (ekran qatlami — bloom qo'llanadi)
  const meteor = new Container(); meteor.visible = false; app.stage.addChild(meteor);
  const mGlow = new Sprite(radialTexture('rgba(255,180,90,0.95)', 256)); mGlow.anchor.set(0.5); mGlow.width = mGlow.height = 90;
  const mTrail = new Sprite(radialTexture('rgba(255,140,60,0.8)', 256)); mTrail.anchor.set(0.5, 0.5); mTrail.width = 220; mTrail.height = 34; mTrail.rotation = -0.5; mTrail.x = 80; mTrail.y = -80;
  const mCore = new Graphics().circle(0, 0, 11).fill(0xfff2d0);
  meteor.addChild(mTrail, mGlow, mCore);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffe6c0); flash.alpha = 0; app.stage.addChild(flash);
  const sw = new Graphics(); app.stage.addChild(sw);

  let t = 0, done = false, impacted = false, flashA = 0, swR = -1;
  let ix = 700, iy = 240;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    const w = app.screen.width, h = app.screen.height;

    // ---- harorat ssenariysi (asteroiddan keyin jinni bo'ladi) ----
    let temp = 24;
    if (t >= 2.5) temp = 25 + 34 * Math.sin((t - 2.5) * 0.82);
    const zone = temp < 20 ? 'cold' : temp > 30 ? 'hot' : 'perfect';
    gardenTick(scene, dt, t, { temp, zone, growth: 0, connected: true });   // growth=0 → gullar ochilmaydi

    // ---- meteor ----
    ix = w * 0.7; iy = h * 0.4;
    if (t >= 1.4 && t < 2.5 && !impacted) {
      meteor.visible = true;
      const k = (t - 1.4) / 1.1;
      meteor.x = lerp(w * 1.15, ix, k); meteor.y = lerp(-h * 0.18, iy, k);
      meteor.scale.set(0.7 + k * 0.6);
      if (k >= 1) { impacted = true; meteor.visible = false; flashA = 1; swR = 0; playRift(); playThunder(); useGameStore.getState().triggerShake(16); for (let n = 0; n < 40; n++) scene.particles.burst(700, 300, [0xff7a2a, 0x8a6a3a, 0xffb03a][n % 3], 2, 240); }
    }

    // flash
    flash.width = w; flash.height = h;
    if (flashA > 0) { flashA = Math.max(0, flashA - dt * 1.8); flash.alpha = flashA; } else flash.alpha = 0;

    // shockwave
    sw.clear();
    if (swR >= 0) { swR += 640 * dt; const a = Math.max(0, 1 - swR / 520); sw.circle(ix, iy, swR).stroke({ width: 8 * a + 1, color: 0xffd0a0, alpha: a * 0.8 }); if (swR > 520) swR = -1; }

    if (!done && t > 9.5) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function TempGardenIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#0a1220' }}>
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
            <DialogueBox name="ELECTRA" role="Iqlim muhandisi" lines={LINES} actionLabel="🌱 Bog'ni qutqar" onAction={onStart} accent="#39e06a" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
