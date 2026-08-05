// UplinkIntro — "Telemetriya Uplinki" kinematik cutscene (asteroid bazasi sagasi davomi).
// Voqea davomi: aloqa tiklandi (17). Endi ESP8266 WiFi moduli bilan flotga jonli telemetriya
// uzatamiz — POT uplink antennasini o'tayotgan yo'ldoshga nishonlaydi, LOCK'da BTN paket uzatadi.
import { useMemo, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleUplink, uplinkTick } from './pixi/uplinkScene';
import DialogueBox from './DialogueBox';
import { playScore, playClick } from './gameAudio';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const LINES = [
  { text: "Aloqa tiklandi — endi flot bizning holatimizni bilishi shart. Konsolga ESP8266 WiFi modulini uladim: jonli telemetriya uzatamiz.", emotion: 'normal' },
  { text: "Yuqorida flotning o'tuvchi sun'iy yo'ldoshi bor. POT bilan uplink antennasini unga nishonla — signal kuchayadi.", emotion: 'normal' },
  { text: "Signal LOCK bo'lganda tugmani bos — data-paket yo'ldoshga uchadi. Yo'ldosh tez harakatlanadi, aniq nishonla!", emotion: 'excited' },
  { text: "5 telemetriya paketini uzatib, uplinkni o'rnat — flot bizni ko'rsin! Tayyormisan, operator?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleUplink(app);
  const ctl = { pot: 512, btn: 0, temp: 42, connected: true, mode: 'intro', resetPulse: 0, onTransmit: () => playScore(), onNear: () => playClick() };
  let t = 0, done = false, endedAt = 0;
  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };
  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    if (t > 0.8) { ctl.pot = clamp((scene.satX - 120) / 760 * 1023, 0, 1023); }   // antennani yo'ldoshga homing
    ctl.btn = (scene.locked && Math.floor(t * 1.6) % 2 === 0) ? 1 : 0;            // lock'da paket uzat
    uplinkTick(scene, dt, t, ctl);
    if (scene.packets >= 2 && !endedAt) endedAt = t;
    if (!done && ((endedAt && t > endedAt + 0.8) || t > 10)) { done = true; onSceneDone(); }
  });
  return () => {};
}

export default function UplinkIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#05080e' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#a9d0ff', background: 'rgba(8,14,20,0.7)', border: '1px solid rgba(106,176,255,0.25)', cursor: 'pointer' }}>
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox name="ELECTRA" role="Missiya operatori" lines={LINES} actionLabel="📡 Uplinkni boshla" onAction={onStart} accent="#6ab0ff" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
