// RadarIntro — "Osmon Qalqoni" kinematik cutscene (asteroid hikoyasi davomi).
// Asosiy asteroiddan keyin osmon meteor bo'laklariga to'ldi → shahar ustidagi
// energiya gumbazi zaiflashmoqda → bitta meteor teshib o'tib mahallani qoraytiradi
// (stakes) → qalqon operatori namuna sifatida ikki meteorni to'g'ri balandlikda
// kutib olib QAYTARADI (yakun emas) → Electra operatorni tayinlaydi.
// Butun ketma-ketlik FRAME-RATE'DAN mustaqil (skript vaqt bo'yicha).
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleShield, shieldTick, RAIL_TOP, RAIL_BOT } from './pixi/shieldScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playAlarm, playZap, playBoom, playScore } from './gameAudio';

const LINES = [
  { text: "Diqqat! Asosiy asteroid urildi — endi osmon uning bo'laklariga to'ldi. Meteor yomg'iri to'g'ri shahar ustiga yog'moqda!", emotion: 'worried' },
  { text: "Ko'rdingmi? Bitta bo'lak gumbazni teshib o'tib, butun bir mahallani qoraytirdi. Har o'tkazib yuborilgan meteor — yo'qolgan uy.", emotion: 'worried' },
  { text: "Bizda bitta energiya qalqoni bor, lekin u faqat bitta nuqtani qoplaydi. Uni to'g'ri balandlikka surib turish — SENING vazifang, operator!", emotion: 'normal' },
  { text: "Platangga ultrasonik sensor, 4 LED va buzzer ula. Qo'lingni ko'tar-tushir — masofa qalqon balandligini boshqaradi. Har meteorni kutib ol va qaytar. Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleShield(app);
  scene.plateTargetY = (RAIL_TOP + RAIL_BOT) / 2;

  const ctl = { dist: 30, connected: false, demo: false, mode: 'intro', resetPulse: 0,
    onBlock: () => { playZap(); playScore(); },
    onMiss: () => { playBoom(); useGameStore.getState().triggerShake(13); } };

  // skript: [vaqt(s), harakat] — vaqt bo'yicha bir marta ishga tushadi
  const SPD = 340;
  const script = [
    { t: 1.2, fn: () => playAlarm() },
    { t: 1.5, fn: () => scene.spawnMeteor(150, SPD) },                                  // A — o'tib ketadi (stakes)
    { t: 3.6, fn: () => { scene.plateTargetY = 350; scene.spawnMeteor(350, SPD); } },   // B — plita pastga, blok
    { t: 5.35, fn: () => scene.spawnMeteor(120, SPD) },                                 // C — keladi
    { t: 6.1, fn: () => { scene.plateTargetY = 120; } },                               // plita tepaga (B blokdan keyin)
  ];

  let t = 0, done = false, idx = 0;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    while (idx < script.length && t >= script[idx].t) { script[idx].fn(); idx++; }
    shieldTick(scene, dt, t, ctl);
    if (!done && t > 8.6) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function RadarIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#02090c' }}>
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
            <DialogueBox name="ELECTRA" role="Qalqon operatori" lines={LINES} actionLabel="🛡️ Qalqonni yoq" onAction={onStart} accent="#39ffd0" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
