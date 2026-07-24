// 🚦 VOLTRA Traffic Light — PixiJS Premium Edition
// Digital Twin: bu o'yin ichki taymer bilan aylanmaydi — u to'liq haqiqiy
// Arduino platasidan kelayotgan "STATE:RED/YELLOW/GREEN" + "BTN" signali bilan
// boshqariladi. Talaba yozgan real kod qanday ishlasa, tungi chorraha ham
// xuddi shundan jonlanadi (Energy City bilan bir xil vizual til).
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleIntersection, intersectionTick } from './pixi/trafficScene';
import ArduinoTwin from './ArduinoTwin';
import GuideCharacter from './GuideCharacter';
import useGameStore from '../../stores/gameStore';
import { playTrafficState, playCollect } from './gameAudio';

const STATE_LABEL = {
  RED:    { label: "TO'XTA", color: '#FF2D30' },
  YELLOW: { label: 'DIQQAT', color: '#FFC21A' },
  GREEN:  { label: 'YUR',    color: '#21E065' },
};

// Electra'ning bosqich izohlari — sikl belgilarida chiqadi
const MILESTONES = {
  3: { text: 'Uch sikl bajarildi — ajoyib ritm!', emotion: 'excited' },
  6: { text: 'Yarim yo\'l! Chorraha silliq ishlayapti.', emotion: 'normal' },
  9: { text: 'Oxirgi sikl qoldi — davom et!', emotion: 'excited' },
};

export default function TrafficLight() {
  const serialData = useGameStore((s) => s.serialData);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [trafficFlow, setTrafficFlow] = useState(0);
  const [pedestrianWaiting, setPedestrianWaiting] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [guide, setGuide] = useState(null);

  const prevStateRef = useRef(null);
  const prevBtnRef = useRef(0);
  const winRef = useRef(false);
  const guideTimer = useRef(null);
  const shownMilestones = useRef(new Set());

  const rawState = typeof serialData.state === 'string' ? serialData.state.toUpperCase() : null;
  const connected = rawState !== null && STATE_LABEL[rawState] != null;
  const currentState = connected ? rawState : 'RED';

  // Sahnaga uzatiladigan boshqaruv (ticker bu ref'ni o'qiydi)
  const ctlRef = useRef({ state: 'RED', connected: false, pedestrianCrossing: false });
  ctlRef.current.state = currentState;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.pedestrianCrossing = pedestrianWaiting && currentState === 'RED';

  // Har bir STATE o'zgarishi: ovoz + oqim + sikl hisobi (GREEN/YELLOW → RED)
  useEffect(() => {
    if (!rawState || !STATE_LABEL[rawState] || rawState === prevStateRef.current) return;
    playTrafficState(rawState);
    if (rawState === 'GREEN') setTrafficFlow((f) => f + 50);
    if (rawState === 'RED' && prevStateRef.current) setTrafficFlow((f) => Math.max(0, f - 15));
    if (rawState === 'RED' && (prevStateRef.current === 'GREEN' || prevStateRef.current === 'YELLOW')) {
      setCycleCount((c) => c + 1);
    }
    prevStateRef.current = rawState;
  }, [rawState]);

  // 10 siklda g'alaba
  useEffect(() => {
    if (cycleCount >= 10 && !winRef.current) {
      winRef.current = true;
      const store = useGameStore.getState();
      if (store.onWin) store.onWin(score);
    }
  }, [cycleCount, score]);

  // Piyoda tugmasi — edge-triggered (bir bosishga bir marta)
  useEffect(() => {
    const btn = serialData.btn || 0;
    if (btn === 1 && prevBtnRef.current === 0 && !pedestrianWaiting) {
      setPedestrianWaiting(true);
      incrementScore(5);
    }
    prevBtnRef.current = btn;
  }, [serialData.btn, pedestrianWaiting, incrementScore]);

  // Qizil chiroqda piyoda zebradan o'tib bo'ladi → bonus
  useEffect(() => {
    if (currentState === 'RED' && pedestrianWaiting) {
      const id = setTimeout(() => {
        incrementScore(20);
        playCollect();
        setPedestrianWaiting(false);
      }, 2400);
      return () => clearTimeout(id);
    }
  }, [currentState, pedestrianWaiting, incrementScore]);

  // Bosqich izohlari (Electra)
  useEffect(() => {
    const m = MILESTONES[cycleCount];
    if (m && !shownMilestones.current.has(cycleCount)) {
      shownMilestones.current.add(cycleCount);
      setGuide(m);
      clearTimeout(guideTimer.current);
      guideTimer.current = setTimeout(() => setGuide(null), 4000);
    }
  }, [cycleCount]);
  useEffect(() => () => clearTimeout(guideTimer.current), []);

  const buildScene = useCallback((app) => {
    const scene = assembleIntersection(app);
    let t = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05);
      t += dt;
      scene.tweens.tick(dt);
      scene.particles.tick(dt);
      intersectionTick(scene, dt, t, ctlRef.current);
    });
    return () => scene.tweens.clear();
  }, []);

  const s = STATE_LABEL[currentState];
  const progress = Math.min(cycleCount / 10, 1);

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
          { icon: '⭐', value: Math.round(score), label: 'Ball', color: '#00EEFF' },
          { icon: '🚗', value: trafficFlow, label: 'Oqim', color: '#FFD700' },
        ].map((it) => (
          <div key={it.label} style={panel}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF', textShadow: `0 0 8px ${it.color}66` }}>
              {it.icon} {it.value}
            </div>
            <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>{it.label}</div>
          </div>
        ))}
      </div>

      {/* Yuqori-o'ng: holat + sikllar */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
        <div style={{ ...panel, textAlign: 'center', minWidth: 108 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: s.color, textShadow: `0 0 14px ${s.color}90`, letterSpacing: '0.04em' }}>
            {s.label}
          </div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>
            {connected ? 'JONLI SIGNAL' : 'DEMO HOLAT'}
          </div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF', textShadow: '0 0 8px rgba(0,238,255,0.4)' }}>
            {cycleCount}/10
          </div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>SIKL</div>
        </div>
      </div>

      {/* Past-markaz: progress */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-56">
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #00EEFF, #21E065)',
            boxShadow: '0 0 12px rgba(0,238,255,0.5)',
            transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 9, marginTop: 3, color: '#64748b', fontFamily: 'Chakra Petch, monospace' }}>
          {cycleCount}/10 sikl yakunlandi
        </div>
      </div>

      {/* Past-o'ng: jonli mini-plata */}
      <div className="absolute bottom-3 right-3">
        <ArduinoTwin showPot={false} />
      </div>

      {/* Electra bosqich izohlari */}
      {guide && (
        <div className="absolute bottom-3 left-3 flex items-end gap-2 animate-slide-up">
          <GuideCharacter emotion={guide.emotion} size={62} />
          <div style={{
            ...panel,
            border: '1px solid rgba(0,238,255,0.3)',
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

      {/* Piyoda kutmoqda chipi */}
      {pedestrianWaiting && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2" style={{ ...panel, border: '1px solid rgba(0,238,255,0.3)' }}>
          <span style={{ fontSize: 11, color: '#00EEFF' }}>🚶 Piyoda o'tishni kutmoqda — qizil chiroqni bering</span>
        </div>
      )}

      {/* Signal kutish chipi — sahnani to'smaydi, demo RED turadi */}
      {!connected && !pedestrianWaiting && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(255,193,7,0.3)' }}>
          <span style={{ fontSize: 11, color: '#FFC21A' }}>🔌 Platani ulang — STATE signali kutilmoqda...</span>
        </div>
      )}
    </PixiStage>
  );
}
