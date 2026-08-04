// GreenhouseIntro — "Aqlli Issiqxona" kinematik cutscene (asteroid sagasi davomi).
// Mayoq signalidan keyin omon qolganlar qaytdi, lekin dalalar qirov urgan, oziq yo'q ->
// Electra issiqxonani ko'rsatadi -> namuna: iqlim isitiladi, qirov ketadi, purkagich
// ishlaydi, nihol tetiklashib o'sadi (yakun emas) -> Electra bolani tayinlaydi.
import { useMemo, useRef, useState } from 'react';
import { Graphics } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import { assembleGreenhouse, greenhouseTick } from './pixi/greenhouseScene';
import DialogueBox from './DialogueBox';
import { playSpray, playBloom, playLevelUp } from './gameAudio';

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k * k * (3 - 2 * k);

const LINES = [
  { text: "Mayoq signali ish berdi — omon qolganlar qaytmoqda. Lekin qara, dalalar qirov urgan, hosil yo'q. Ular och.", emotion: 'worried' },
  { text: "Mana bu aqlli issiqxona ekin yetishtira oladi. Ammo falokatdan keyin iqlim shafqatsiz — harorat va namlik keskin o'zgarib turadi.", emotion: 'normal' },
  { text: "Platangda 2 potensiometr bor: POT1 — iqlim (isitish/sovutish), POT2 — sug'orish. Ikkovini YASHIL zonada ushlab tur.", emotion: 'normal' },
  { text: "Ob-havoga qarab sozla, ekinlarni sog'lom saqla va hosil yetishtir — butun shaharni to'ydir! Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleGreenhouse(app);
  const s = { temp: 8, humid: 28, growth: 0.03, health: 0.35, irrig: 0, light: 0.15, weather: 'cold' };

  const barTop = new Graphics(); const barBot = new Graphics(); app.stage.addChild(barTop, barBot);
  let t = 0, done = false, sprayed = false, bloomed = false, warmed = false;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;

    // --- scripted voqelik ---
    s.light = clamp01(0.12 + (t - 0.4) / 3.4) * 0.85;           // tong ko'tariladi
    s.weather = t < 2.2 ? 'cold' : 'calm';
    s.temp = lerp(8, 22, smooth(clamp01((t - 2.2) / 1.8)));      // iqlim isitiladi -> zonaga
    s.humid = lerp(28, 58, smooth(clamp01((t - 2.5) / 1.8)));
    s.growth = lerp(0.03, 0.42, smooth(clamp01((t - 2.5) / 2.4)));
    s.health = lerp(0.35, 1, smooth(clamp01((t - 2.2) / 2.3)));
    s.irrig = (t > 2.7 && t < 3.8) ? 0.7 : 0;

    if (!warmed && t > 2.2) { warmed = true; playLevelUp(); }
    if (!sprayed && t > 2.75) { sprayed = true; playSpray(); }
    if (!bloomed && t > 3.6) { bloomed = true; playBloom(); }

    greenhouseTick(scene, dt, t, s);

    // letterbox
    const w = app.screen.width, h = app.screen.height;
    const barH = h * 0.085 * smooth(clamp01(t / 0.9));
    barTop.clear().rect(0, 0, w, barH).fill(0x000000);
    barBot.clear().rect(0, h - barH, w, barH).fill(0x000000);

    if (!done && t > 5.2) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function GreenhouseIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#0a1410' }}>
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
            <DialogueBox name="ELECTRA" role="Issiqxona muhandisi" lines={LINES} actionLabel="🌱 Issiqxonani boshqar" onAction={onStart} accent="#4fae42" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
