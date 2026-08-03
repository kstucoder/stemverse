// PianoIntro — "Rezonans Mayog'i: Signal Kaliti" kinematik cutscene (asteroid sagasi).
// Xavfli modda muhrlangach shahar jim qoldi -> eski rezonans mayog'i o'chgan ->
// namuna sifatida bir necha nota yangrab minora qisman jonlanadi (yakun emas) ->
// Electra signal muhandisini tayinlaydi. FRAME-RATE'DAN mustaqil (skript vaqt).
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleResonance, resonanceTick, NOTES, TUNE } from './pixi/resonanceScene';
import DialogueBox from './DialogueBox';
import { playNote } from './gameAudio';

const LINES = [
  { text: "Xavfli modda muhrlandi, lekin shahar jim qoldi — omon qolganlar tarqab ketgan, ular bizni topolmayapti.", emotion: 'worried' },
  { text: "Anavi eski rezonans mayog'i hammaga signal uzata oladi. Lekin uni yoqish uchun chastota kaliti — maxsus melodiya kerak.", emotion: 'normal' },
  { text: "Platangda 4 tugma va buzzer bor — har biri bitta nota. Pastga oqayotgan notalarni o'z vaqtida, to'g'ri tugma bilan chal.", emotion: 'normal' },
  { text: "Rezonans melodiyasini chal, mayoqni yoqib osmonga signal ber — hammani uyga chaqir! Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleResonance(app);
  const ctl = { btn: 0, connected: false, mode: 'intro', resetPulse: 0 };

  // namuna: melodiyaning bir qismi yangrab minora qisman jonlanadi
  const sample = [TUNE[0], TUNE[1], TUNE[2], TUNE[3], TUNE[4]];
  const script = sample.map((lane, i) => ({
    t: 1.5 + i * 0.55,
    fn: () => { scene.pulseResonator(lane); playNote(NOTES[lane].freq); scene.charge = Math.min(46, scene.charge + 10); scene.particles.burst([320, 440, 560, 680][lane], 442, NOTES[lane].col, 12, 130); },
  }));

  let t = 0, done = false, idx = 0;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    while (idx < script.length && t >= script[idx].t) { script[idx].fn(); idx++; }
    // namuna tugagach zaryad sekin so'nadi (hali yoqilmagan)
    if (t > 4.6 && scene.charge > 0) scene.charge = Math.max(0, scene.charge - dt * 14);
    resonanceTick(scene, dt, t, ctl);
    if (!done && t > 6.0) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function PianoIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#140f1e' }}>
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
            <DialogueBox name="ELECTRA" role="Signal muhandisi" lines={LINES} actionLabel="🎵 Mayoqni jonlantir" onAction={onStart} accent="#f5c518" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
