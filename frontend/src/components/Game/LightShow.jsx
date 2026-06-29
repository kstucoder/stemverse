import { useEffect, useState, useRef } from 'react';
import { Sparkles, Play, Pause } from 'lucide-react';
import useGameStore from '../../stores/gameStore';

const PATTERNS = [
  { name: "To'lqin", sequence: [1,0,1,0], colors: ['#00f5ff', '#9900ff'] },
  { name: 'Miltillash', sequence: [1,1,0,0], colors: ['#ff00e5', '#ffdd00'] },
  { name: 'Suzish', sequence: [1,0,0,1], colors: ['#00ff88', '#6366f1'] },
  { name: 'Tasodifiy', sequence: [], colors: ['#ff6600', '#ff00e5'] },
];

const TARGET_PATTERNS = [
  { name: 'Raqs 1', pattern: [0,1,0,1,0,1,1,0], points: 50 },
  { name: 'Raqs 2', pattern: [1,1,0,0,1,0,1,1], points: 100 },
  { name: 'Raqs 3', pattern: [1,0,1,1,0,0,1,0], points: 150 },
];

export default function LightShow() {
  const { serialData, score, incrementScore } = useGameStore();
  const [currentPattern, setCurrentPattern] = useState(0);
  const [patternPos, setPatternPos] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedPattern, setRecordedPattern] = useState([]);
  const [targetPattern, setTargetPattern] = useState(null);
  const [stage, setStage] = useState('setup'); // setup, play, win
  const [completedDances, setCompletedDances] = useState(0);
  const winRef = useRef(false);
  const playRef = useRef(null);

  // Check win
  useEffect(() => {
    if (completedDances >= 3 && !winRef.current) {
      winRef.current = true;
      const store = useGameStore.getState();
      if (store.onWin) store.onWin(score);
    }
  }, [completedDances, score]);

  // Pattern playback
  useEffect(() => {
    if (!isPlaying) return;
    const pattern = PATTERNS[currentPattern];
    let pos = 0;
    playRef.current = setInterval(() => {
      if (pos >= (pattern.sequence.length * 4)) {
        clearInterval(playRef.current);
        setIsPlaying(false);
        setPatternPos(0);
        return;
      }
      setPatternPos(pos);
      pos++;
    }, 200);
    return () => clearInterval(playRef.current);
  }, [isPlaying, currentPattern]);

  // Handle button press - record pattern
  useEffect(() => {
    if (serialData.button === 1 && stage === 'play') {
      setRecordedPattern((prev) => {
        const newPattern = [...prev, serialData.led];
        if (newPattern.length >= 8) {
          // Check against target
          const target = TARGET_PATTERNS[completedDances];
          let matches = 0;
          for (let i = 0; i < 8; i++) {
            if (newPattern[i] === target.pattern[i]) matches++;
          }
          if (matches >= 6) {
            incrementScore(target.points);
            setCompletedDances((c) => c + 1);
            if (completedDances + 1 >= 3) {
              setStage('win');
            } else {
              setTargetPattern(TARGET_PATTERNS[completedDances + 1]);
            }
          }
          return [];
        }
        return newPattern;
      });
    }
  }, [serialData.button, stage, completedDances]);

  // LED pattern output
  const currentLED = () => {
    if (!isPlaying) return serialData.led;
    const pattern = PATTERNS[currentPattern];
    const idx = Math.floor(patternPos / 4) % pattern.sequence.length;
    return pattern.sequence[idx];
  };

  const currentColor = () => {
    const pattern = PATTERNS[currentPattern];
    return pattern.colors[Math.floor(Math.random() * pattern.colors.length)];
  };

  const startDance = () => {
    setTargetPattern(TARGET_PATTERNS[0]);
    setRecordedPattern([]);
    setStage('play');
  };

  const cyclePattern = () => {
    setCurrentPattern((p) => (p + 1) % PATTERNS.length);
    incrementScore(5);
  };

  return (
    <div className="relative h-full min-h-[500px] bg-game-gradient rounded-2xl overflow-hidden p-6">
      {/* Stage Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-purple-900/20 to-dark-900" />
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5, animationDelay: `${Math.random() * 3}s` }} />
        ))}
      </div>

      {/* Stage Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* LED Effect */}
          <div className="w-32 h-32 rounded-full transition-all duration-200 flex items-center justify-center"
            style={{
              backgroundColor: currentLED() ? currentColor() : '#1e293b',
              boxShadow: currentLED() ? `0 0 60px ${currentColor()}, 0 0 120px ${currentColor()}40` : 'none',
            }}>
            <span className="text-4xl">{currentLED() ? '💡' : '⚫'}</span>
          </div>
          {/* Stage platform */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-4 bg-gradient-to-r from-brand-500/50 to-neon-pink/50 rounded-full blur-sm" />
        </div>
      </div>

      {/* Pattern Display */}
      <div className="absolute top-4 left-4 right-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-game text-white text-lg">
              {stage === 'setup' ? "🎵 Yorug'lik Shousi" : '🎯 Raqs Musobaqasi'}
            </h3>
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          {/* Pattern Bars */}
          {stage === 'setup' && (
            <div className="flex gap-1 mb-3">
              {PATTERNS[currentPattern].sequence.map((val, i) => (
                <div key={i} className={`flex-1 h-8 rounded transition-all ${
                  val ? 'bg-brand-500' : 'bg-dark-600'
                } ${i === Math.floor(patternPos / 4) % PATTERNS[currentPattern].sequence.length ? 'ring-2 ring-white' : ''}`} />
              ))}
            </div>
          )}

          {/* Target Pattern */}
          {stage === 'play' && targetPattern && (
            <div className="mb-3">
              <p className="text-xs text-dark-400 mb-1">Maqsad: {targetPattern.name}</p>
              <div className="flex gap-1">
                {targetPattern.pattern.map((val, i) => (
                  <div key={i} className={`flex-1 h-6 rounded ${val ? 'bg-neon-yellow' : 'bg-dark-600'}`} />
                ))}
              </div>
              <p className="text-xs text-dark-500 mt-1">
                Yozilgan: {recordedPattern.length}/8 bosish
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-400">Pattern: {PATTERNS[currentPattern].name}</span>
            <div className="flex gap-2">
              <button onClick={cyclePattern} className="btn-secondary text-xs py-1 px-3">
                Patternni aylantirish
              </button>
              {stage === 'setup' && (
                <button onClick={startDance} className="btn-primary text-xs py-1 px-3">
                  Raqsni boshlash!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Score + Progress */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <div className="glass rounded-xl px-4 py-2">
          <p className="text-xs text-dark-400">Ball</p>
          <p className="font-game text-white text-lg">{score}</p>
        </div>
        <div className="glass rounded-xl px-4 py-2">
          <p className="text-xs text-dark-400">Raqlar</p>
          <p className="font-game text-white text-lg">{completedDances}/3</p>
        </div>
        <div className="glass rounded-xl px-4 py-2">
          <p className="text-xs text-dark-400">LED</p>
          <div className={`w-5 h-5 rounded-full mt-1 ${currentLED() ? 'bg-neon-green shadow-lg shadow-neon-green/50 animate-pulse' : 'bg-dark-600'}`} />
        </div>
      </div>

      {/* Stage indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <div className="glass rounded-xl px-4 py-2 text-center">
          <Sparkles className={`w-5 h-5 mx-auto ${isPlaying ? 'text-neon-yellow animate-spin' : 'text-dark-400'}`} />
          <p className="text-xs text-dark-400 mt-1">{isPlaying ? 'Ijro etilmoqda' : 'Tayyor'}</p>
        </div>
      </div>
    </div>
  );
}
