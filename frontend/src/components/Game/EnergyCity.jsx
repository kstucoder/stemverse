// ⚡ VOLTRA Energy City — PixiJS Premium Edition
// Digital Twin: sahnadagi HAMMA narsa haqiqiy Arduino signallaridan jonlanadi.
//   LED (D13)  → binolar birin-ketin yonadi (kaskadli oynalar, portlash, glow)
//   BTN (D2)   → tramvay harakati
//   POT (A0)   → ko'cha chiroqlari yorqinligi + simlardagi energiya pulslari
// Shahar sahnasi pixi/cityScene.js da — kirish cutscene bilan BITTA olam.
import { useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleCity, cityTick } from './pixi/cityScene';
import ArduinoTwin from './ArduinoTwin';
import GuideCharacter from './GuideCharacter';
import useGameStore from '../../stores/gameStore';
import { playTram, playCollect } from './gameAudio';

function buildScene(app) {
  const city = assembleCity(app);
  let t = 0;
  let winFlash = 0;

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    city.tweens.tick(dt);
    city.particles.tick(dt);

    const st = useGameStore.getState();
    const connected = st.arduinoConnected;
    const cs = st.cityState;

    cityTick(city, dt, t, {
      litCount: connected ? Math.floor(cs.buildingsLit) : 0,
      energy: connected ? cs.energyLevel : 0,
      night: connected ? cs.isNight : true,
      tramOn: connected ? cs.tramActive : false,
      onNewLight: () => { playCollect(); winFlash = 0.35; },
    });

    // yangi bino yonganda butun sahna yengil "flash"
    if (winFlash > 0) {
      winFlash = Math.max(0, winFlash - dt);
      app.stage.alpha = 1 + winFlash * 0.15;
    } else app.stage.alpha = 1;
  });

  return () => city.tweens.clear();
}

// Electra'ning o'yin ichidagi qisqa izohlari — bosqich belgilarida chiqadi
const MILESTONES = {
  1: { text: "Birinchi bino yondi! Ajoyib boshlanish!", emotion: 'excited' },
  4: { text: "Yarim shahar uyg'ondi — davom et!", emotion: 'normal' },
  7: { text: "Oxirgi binolar qoldi, oz qoldi!", emotion: 'excited' },
};

export default function EnergyCity() {
  const score = useGameStore((s) => s.score);
  const cityState = useGameStore((s) => s.cityState);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const led = useGameStore((s) => s.serialData.led);
  const btn = useGameStore((s) => s.serialData.btn);
  const prevLed = useRef(led);
  const prevBtn = useRef(btn);
  const [guide, setGuide] = useState(null);
  const guideTimer = useRef(null);
  const shownMilestones = useRef(new Set());

  // Ball FAQAT haqiqiy signal o'zgarishida (edge-triggered)
  useEffect(() => {
    if (led !== prevLed.current) {
      prevLed.current = led;
      if (led === 1) incrementScore(10);
    }
  }, [led, incrementScore]);
  useEffect(() => {
    if (btn !== prevBtn.current) {
      prevBtn.current = btn;
      if (btn === 1) { incrementScore(5); playTram(); }
    }
  }, [btn, incrementScore]);

  const lit = arduinoConnected ? Math.floor(cityState.buildingsLit) : 0;

  // Bosqich izohlari
  useEffect(() => {
    const m = MILESTONES[lit];
    if (m && !shownMilestones.current.has(lit)) {
      shownMilestones.current.add(lit);
      setGuide(m);
      clearTimeout(guideTimer.current);
      guideTimer.current = setTimeout(() => setGuide(null), 4000);
    }
    return () => {};
  }, [lit]);
  useEffect(() => () => clearTimeout(guideTimer.current), []);

  const energy = arduinoConnected ? cityState.energyLevel : 0;
  const happy = arduinoConnected ? Math.round(cityState.citizenHappiness) : 50;
  const progress = Math.min(lit / cityState.totalBuildings, 1);

  const panel = {
    background: 'rgba(11,17,32,0.82)',
    border: '1px solid rgba(0,238,255,0.12)',
    borderRadius: 12,
    padding: '7px 14px',
    backdropFilter: 'blur(8px)',
    fontFamily: 'Chakra Petch, monospace',
  };

  return (
    <PixiStage build={buildScene} className="rounded-xl">
      {/* Yuqori-chap: statlar */}
      <div className="absolute top-3 left-3 flex gap-2">
        {[
          { icon: '⭐', value: score, label: 'Ball', color: '#00EEFF' },
          { icon: '⚡', value: `${energy}%`, label: 'Quvvat', color: '#FFD700' },
          { icon: '😊', value: `${happy}%`, label: 'Baxt', color: '#FF2D78' },
        ].map((s) => (
          <div key={s.label} style={panel}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF', textShadow: `0 0 8px ${s.color}66` }}>
              {s.icon} {s.value}
            </div>
            <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Yuqori-o'ng: binolar hisobi */}
      <div className="absolute top-3 right-3" style={{ ...panel, textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF', textShadow: '0 0 8px rgba(0,238,255,0.4)' }}>
          {lit}/{cityState.totalBuildings}
        </div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>BINOLAR</div>
      </div>

      {/* Past-markaz: progress */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-56">
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #FFD700, #FF9F1C)',
            boxShadow: '0 0 12px rgba(255,215,0,0.5)',
            transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 9, marginTop: 3, color: '#64748b', fontFamily: 'Chakra Petch, monospace' }}>
          {Math.round(progress * 100)}% yoritildi
        </div>
      </div>

      {/* Past-o'ng: jonli mini-plata (Digital Twin ko'zgusi) */}
      <div className="absolute bottom-3 right-3">
        <ArduinoTwin />
      </div>

      {/* Electra'ning bosqich izohlari */}
      {guide && (
        <div className="absolute bottom-3 left-3 flex items-end gap-2 animate-slide-up">
          <GuideCharacter emotion={guide.emotion} size={62} />
          <div style={{
            ...panel,
            border: '1px solid rgba(255,215,0,0.3)',
            maxWidth: 220,
            marginBottom: 8,
            fontSize: 11.5,
            color: '#EAF3FF',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            {guide.text}
          </div>
        </div>
      )}

      {/* Signal kutish chipi — sahnani to'smaydi, shahar qorong'i turadi */}
      {!arduinoConnected && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(255,215,0,0.3)' }}>
          <span style={{ fontSize: 11, color: '#FFD700' }}>🔌 Arduino signali kutilmoqda — shahar qorong'ida...</span>
        </div>
      )}
    </PixiStage>
  );
}
