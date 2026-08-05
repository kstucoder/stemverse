// StationIntro — "Sirt Sensor Stansiyasi" kinematik cutscene (asteroid bazasi sagasi davomi).
// Voqea davomi: uplink o'rnatildi (18). Endi asteroid muhitini o'lchash uchun avtonom sensor
// mayoq joylaymiz — ESP32 + DHT22 (yangi NAMLIK sensori). Demo o'zi namuna yig'ib ko'rsatadi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleStation, stationTick } from './pixi/stationScene';
import DialogueBox from './DialogueBox';
import { playScore, playClick } from './gameAudio';

const LINES = [
  { text: "Uplink ishlayapti — endi flotga NIMANI uzatishni bilishimiz kerak. Asteroid muhitini o'lchaymiz.", emotion: 'normal' },
  { text: "Bazadan uzoqroqqa avtonom sensor mayoq joyladim: ESP32 va yangi DHT22 sensori — u HARORAT va NAMLIKni birga o'lchaydi.", emotion: 'normal' },
  { text: "Stansiya har safar bitta o'lchovni so'raydi. Real sensorni sozla — DHT22 ga nafas ol (namlik), LDR'ni yop, qo'lni yaqinlashtir — qiymatni SARIQ oynaga moslab USHLAB tur.", emotion: 'normal' },
  { text: "6 ta namunani yig'ib, to'liq muhit profilini bazaga relay qil! Tayyormisan, dala texnigi?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleStation(app);
  const ctl = { connected: false, mode: 'intro', resetPulse: 0, onSample: () => playScore(), onNear: () => playClick() };
  let t = 0, done = false, endedAt = 0;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };
  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    stationTick(scene, dt, t, ctl);   // ulanmagan + intro -> demo o'zi namuna yig'adi
    if (scene.samples >= 2 && !endedAt) endedAt = t;
    if (!done && ((endedAt && t > endedAt + 0.8) || t > 10)) { done = true; onSceneDone(); }
  });
  return () => {};
}

export default function StationIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#080510' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#a9e6ff', background: 'rgba(10,8,14,0.7)', border: '1px solid rgba(0,229,255,0.25)', cursor: 'pointer' }}>
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox name="ELECTRA" role="Dala texnigi" lines={LINES} actionLabel="🛰️ Stansiyani yoq" onAction={onStart} accent="#00e5ff" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
