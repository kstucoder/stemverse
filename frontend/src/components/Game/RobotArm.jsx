import { useEffect, useState, useRef } from 'react';
import { Target, Move, RotateCcw } from 'lucide-react';
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
    <div className="relative h-full min-h-[500px] bg-game-gradient rounded-2xl overflow-hidden p-6">
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
        <div className="w-16 h-8 rounded-lg bg-gradient-to-r from-dark-600 to-dark-500 border border-dark-400 flex items-center justify-center">
          <RotateCcw className="w-4 h-4 text-neon-cyan" />
        </div>

        {/* Arm segment 1 */}
        <div className="relative origin-bottom-left transition-all duration-200"
          style={{ transform: `rotate(${baseAngle - 135}deg)` }}>
          <div className="w-24 h-3 rounded bg-gradient-to-r from-brand-500 to-brand-400 ml-8">
            {/* Joint */}
            <div className="absolute -left-1 -top-1 w-5 h-5 rounded-full bg-dark-600 border-2 border-brand-400" />
          </div>

          {/* Arm segment 2 */}
          <div className="relative origin-bottom-left transition-all duration-200 ml-20"
            style={{ transform: `rotate(${armAngle - 90}deg)` }}>
            <div className="w-20 h-2.5 rounded bg-gradient-to-r from-brand-400 to-neon-cyan">
              <div className="absolute -left-1 -top-1 w-4 h-4 rounded-full bg-dark-600 border-2 border-neon-cyan" />
            </div>

            {/* Gripper */}
            <div className="absolute -right-2 -top-2 transition-all duration-200">
              <div className={`flex gap-1 ${gripperOpen ? 'w-6' : 'w-2'}`}>
                <div className="w-1 h-6 rounded bg-neon-green" />
                <div className="w-1 h-6 rounded bg-neon-green" />
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
              ${i === currentTarget ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900' : ''}`}
              style={{ backgroundColor: t.color }}>
              <span className="text-xs font-bold text-dark-900">{t.label}</span>
            </div>
          </div>
        )
      ))}

      {/* Arm Position Indicator */}
      <div className="absolute transition-all duration-200 w-3 h-3 rounded-full bg-neon-yellow shadow-lg shadow-neon-yellow/50"
        style={{ left: `${endX}%`, top: `${endY}%`, transform: 'translate(-50%, -50%)' }} />

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <div className="glass rounded-xl px-4 py-2">
          <p className="text-xs text-dark-400">Burchak</p>
          <p className="font-game text-white text-lg">{baseAngle}°</p>
        </div>
        <div className="glass rounded-xl px-4 py-2">
          <p className="text-xs text-dark-400">Qo'l</p>
          <p className="font-game text-white text-lg">{armAngle}°</p>
        </div>
        <div className="glass rounded-xl px-4 py-2">
          <p className="text-xs text-dark-400">Taymer</p>
          <p className={`font-game text-lg ${timeLeft < 15 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {timeLeft}s
          </p>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between items-center">
          <div className="glass rounded-xl px-4 py-2">
            <p className="text-xs text-dark-400">Yig'ilgan</p>
            <p className="font-game text-white text-lg">{targetsCollected}/3</p>
          </div>
          <div className="glass rounded-xl px-4 py-2">
            <p className="text-xs text-dark-400">Ball</p>
            <p className="font-game text-white text-lg">{score}</p>
          </div>
          <div className="glass rounded-xl px-4 py-2">
            <p className="text-xs text-dark-400">Keyingi</p>
            <p className="font-game text-white text-lg" style={{ color: target?.color }}>{target?.label}</p>
          </div>
        </div>

        {/* Controls hint */}
        <div className="flex gap-2 mt-2 justify-center">
          <span className="text-xs text-dark-500 bg-dark-800/50 px-2 py-1 rounded">POT → Aylanish</span>
          <span className="text-xs text-dark-500 bg-dark-800/50 px-2 py-1 rounded">DIST → Qo'l</span>
          <span className="text-xs text-dark-500 bg-dark-800/50 px-2 py-1 rounded">BTN → Olish</span>
        </div>
      </div>
    </div>
  );
}
