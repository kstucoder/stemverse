import { useEffect, useState, useRef } from 'react';
import { Target, Move, RotateCcw } from 'lucide-react';
import { C } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

const TARGETS = [
  { x: 30, y: 40, size: 8, color: '#00ff88', label: 'A' },
  { x: 60, y: 30, size: 8, color: '#ffdd00', label: 'B' },
  { x: 45, y: 55, size: 8, color: '#ff00e5', label: 'C' },
  { x: 20, y: 60, size: 8, color: '#00f5ff', label: 'D' },
  { x: 70, y: 50, size: 8, color: '#ff6600', label: 'E' },
];

export default function RobotArm() {
  const { serialData, score, incrementScore } = useGameStore();
  const [baseAngle, setBaseAngle] = useState(90);
  const [armAngle, setArmAngle] = useState(90);
  const [gripperOpen, setGripperOpen] = useState(false);
  const [targetsCollected, setTargetsCollected] = useState(0);
  const [collected, setCollected] = useState(new Set());
  const [currentTarget, setCurrentTarget] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const winRef = useRef(false);

  // Win condition
  useEffect(() => {
    if (targetsCollected >= 3 && !winRef.current) {
      winRef.current = true;
      const store = useGameStore.getState();
      if (store.onWin) store.onWin(score);
    }
  }, [targetsCollected, score]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Read servo angles from potentiometers
  useEffect(() => {
    const newBase = Math.round((serialData.potentiometer / 1023) * 180);
    setBaseAngle(Math.max(0, Math.min(180, newBase)));

    // Use distance sensor or second POT for arm angle
    const distAngle = serialData.distance 
      ? Math.round((serialData.distance / 400) * 180)
      : 90;
    setArmAngle(Math.max(0, Math.min(180, distAngle)));
  }, [serialData.potentiometer, serialData.distance]);

  // Collision check with target
  useEffect(() => {
    if (collected.has(currentTarget)) return;
    const target = TARGETS[currentTarget];
    if (!target) return;

    // Simulate arm end position based on angles
    const armX = 50 + Math.cos((baseAngle - 90) * Math.PI / 180) * (armAngle / 180) * 30;
    const armY = 50 - Math.sin((armAngle) * Math.PI / 180) * 25;

    const dx = armX - target.x;
    const dy = armY - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < target.size + 5 && serialData.button === 1) {
      // Gathered!
      setCollected((prev) => new Set([...prev, currentTarget]));
      setTargetsCollected((t) => t + 1);
      setCurrentTarget((t) => (t + 1) % TARGETS.length);
      incrementScore(100);
    }
  }, [baseAngle, armAngle, serialData.button, currentTarget]);

  const target = TARGETS[currentTarget];

  // Calculate arm endpoint
  const endX = 50 + Math.cos((baseAngle - 90) * Math.PI / 180) * (armAngle / 180) * 30;
  const endY = 50 - Math.sin((armAngle) * Math.PI / 180) * 25;

  return (
    <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden p-6"
      style={{ background: `linear-gradient(180deg, ${C.DARK} 0%, ${C.PANEL} 100%)` }}>
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
      </div>

      {/* Robot Arm Base */}
      <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2">
        {/* Base */}
        <div className="w-16 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `linear-gradient(90deg, ${C.PANEL}, #334155)`, border: `1px solid ${C.LINE}` }}>
          <RotateCcw className="w-4 h-4" style={{ color: C.CYAN }} />
        </div>

        {/* Arm segment 1 */}
        <div className="relative origin-bottom-left transition-all duration-200"
          style={{ transform: `rotate(${baseAngle - 135}deg)` }}>
          <div className="w-24 h-3 rounded ml-8"
            style={{ background: `linear-gradient(90deg, ${C.CYAN}, ${C.PURPLE})` }}>
            {/* Joint */}
            <div className="absolute -left-1 -top-1 w-5 h-5 rounded-full border-2"
              style={{ background: C.DARK, borderColor: C.CYAN }} />
          </div>

          {/* Arm segment 2 */}
          <div className="relative origin-bottom-left transition-all duration-200 ml-20"
            style={{ transform: `rotate(${armAngle - 90}deg)` }}>
            <div className="w-20 h-2.5 rounded"
              style={{ background: `linear-gradient(90deg, ${C.PURPLE}, ${C.CYAN})` }}>
              <div className="absolute -left-1 -top-1 w-4 h-4 rounded-full border-2"
                style={{ background: C.DARK, borderColor: C.CYAN }} />
            </div>

            {/* Gripper */}
            <div className="absolute -right-2 -top-2 transition-all duration-200">
              <div className={`flex gap-1 ${gripperOpen ? 'w-6' : 'w-2'}`}>
                <div className="w-1 h-6 rounded" style={{ background: C.GREEN }} />
                <div className="w-1 h-6 rounded" style={{ background: C.GREEN }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Targets */}
      {TARGETS.map((t, i) => (
        !collected.has(i) && (
          <div key={i} className="absolute transition-all duration-300"
            style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center animate-pulse-slow
              ${i === currentTarget ? 'ring-2 ring-white' : ''}`}
              style={{ backgroundColor: t.color, boxShadow: i === currentTarget ? `0 0 10px ${C.CYAN}` : 'none' }}>
              <span className="text-xs font-bold" style={{ color: C.DARK }}>{t.label}</span>
            </div>
          </div>
        )
      ))}

      {/* Arm Position Indicator */}
      <div className="absolute transition-all duration-200 w-3 h-3 rounded-full"
        style={{ left: `${endX}%`, top: `${endY}%`, transform: 'translate(-50%, -50%)',
          background: C.GOLD, boxShadow: `0 0 15px ${C.GOLD}` }} />

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <div className="rounded-xl px-4 py-2" style={{ background: C.GLASS, border: `1px solid ${C.LINE}`, borderRadius: 12 }}>
          <p className="text-xs" style={{ color: C.MUTED }}>Burchak</p>
          <p className="text-white text-lg" style={{ fontFamily: 'Chakra Petch, monospace' }}>{baseAngle}°</p>
        </div>
        <div className="rounded-xl px-4 py-2" style={{ background: C.GLASS, border: `1px solid ${C.LINE}`, borderRadius: 12 }}>
          <p className="text-xs" style={{ color: C.MUTED }}>Qo'l</p>
          <p className="text-white text-lg" style={{ fontFamily: 'Chakra Petch, monospace' }}>{armAngle}°</p>
        </div>
        <div className="rounded-xl px-4 py-2" style={{ background: C.GLASS, border: `1px solid ${C.LINE}`, borderRadius: 12 }}>
          <p className="text-xs" style={{ color: C.MUTED }}>Taymer</p>
          <p className="text-lg" style={{
            fontFamily: 'Chakra Petch, monospace',
            color: timeLeft < 15 ? '#ef4444' : C.WHITE,
            animation: timeLeft < 15 ? 'pulse 1s infinite' : 'none',
          }}>
            {timeLeft}s
          </p>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between items-center">
          <div className="rounded-xl px-4 py-2" style={{ background: C.GLASS, border: `1px solid ${C.LINE}`, borderRadius: 12 }}>
            <p className="text-xs" style={{ color: C.MUTED }}>Yig'ilgan</p>
            <p className="text-white text-lg" style={{ fontFamily: 'Chakra Petch, monospace' }}>{targetsCollected}/3</p>
          </div>
          <div className="rounded-xl px-4 py-2" style={{ background: C.GLASS, border: `1px solid ${C.LINE}`, borderRadius: 12 }}>
            <p className="text-xs" style={{ color: C.MUTED }}>Ball</p>
            <p className="text-white text-lg" style={{ fontFamily: 'Chakra Petch, monospace' }}>{score}</p>
          </div>
          <div className="rounded-xl px-4 py-2" style={{ background: C.GLASS, border: `1px solid ${C.LINE}`, borderRadius: 12 }}>
            <p className="text-xs" style={{ color: C.MUTED }}>Keyingi</p>
            <p className="text-lg" style={{ fontFamily: 'Chakra Petch, monospace', color: target?.color }}>{target?.label}</p>
          </div>
        </div>

        {/* Controls hint */}
        <div className="flex gap-2 mt-2 justify-center">
          <span className="text-xs px-2 py-1 rounded" style={{ color: C.MUTED, background: C.GLASS, border: `1px solid ${C.LINE}` }}>POT → Aylanish</span>
          <span className="text-xs px-2 py-1 rounded" style={{ color: C.MUTED, background: C.GLASS, border: `1px solid ${C.LINE}` }}>DIST → Qo'l</span>
          <span className="text-xs px-2 py-1 rounded" style={{ color: C.MUTED, background: C.GLASS, border: `1px solid ${C.LINE}` }}>BTN → Olish</span>
        </div>
      </div>
    </div>
  );
}
