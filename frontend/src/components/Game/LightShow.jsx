import { useEffect, useState, useRef } from 'react';
import { Sparkles, Play, Pause } from 'lucide-react';
import useGameStore from '../../stores/gameStore';

import { C } from './gameHelpers';

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
    <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden p-6"
      style={{ background: `linear-gradient(180deg, ${C.DARK} 0%, ${C.PANEL} 100%)` }}>
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
              backgroundColor: currentLED() ? currentColor() : C.PANEL,
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
        <div className="rounded-xl p-4" style={{ background: C.GLASS, border: `1px solid ${C.LINE}`, borderRadius: 12 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-lg" style={{ fontFamily: 'Chakra Petch, monospace' }}>
              {stage === 'setup' ? "🎵 Yorug'lik Shousi" : '🎯 Raqs Musobaqasi'}
            </h3>
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 rounded-lg"
              style={{ background: C.PANEL, border: `1px solid ${C.LINE}` }}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          {/* Pattern Bars */}
          {stage === 'setup' && (
            <div className="flex gap-1 mb-3">
              {PATTERNS[currentPattern].sequence.map((val, i) => (
                <div key={i} className={`flex-1 h-8 rounded transition-all ${
                  i === Math.floor(patternPos / 4) % PATTERNS[currentPattern].sequence.length ? 'ring-2 ring-white' : ''
                }`}
                  style={{ background: val ? C.CYAN : C.PANEL }} />
              ))}
            </div>
          )}

          {/* Target Pattern */}
          {stage === 'play' && targetPattern && (
            <div className="mb-3">
              <p className="text-xs mb-1" style={{ color: C.MUTED }}>Maqsad: {targetPattern.name}</p>
              <div className="flex gap-1">
                {targetPattern.pattern.map((val, i) => (
                  <div key={i} className={`flex-1 h-6 rounded ${val ? 'bg-neon-yellow' : ''}`}
                    style={{ background: val ? C.GOLD : C.PANEL }} />
                ))}
              </div>
              <p className="text-xs mt-1" style={{ color: C.MUTED }}>
                Yozilgan: {recordedPattern.length}/8 bosish
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: C.MUTED }}>Pattern: {PATTERNS[currentPattern].name}</span>
            <div className="flex gap-2">
              <button onClick={cyclePattern} className="text-xs py-1 px-3 rounded-lg"
                style={{ background: C.PANEL, color: C.MUTED, border: `1px solid ${C.LINE}`, fontFamily: 'Chakra Petch, monospace' }}>
                Patternni aylantirish
              </button>
              {stage === 'setup' && (
                <button onClick={startDance} className="text-xs py-1 px-3 rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${C.CYAN}, ${C.PURPLE})`, color: C.DARK, fontFamily: 'Chakra Petch, monospace', fontWeight: 'bold' }}>
                  Raqsni boshlash!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Score + Progress */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <div className="rounded-xl px-4 py-2" style={{ background: C.GLASS, border: `1px solid ${C.LINE}`, borderRadius: 12 }}>
          <p className="text-xs" style={{ color: C.MUTED }}>Ball</p>
          <p className="text-white text-lg" style={{ fontFamily: 'Chakra Petch, monospace' }}>{score}</p>
        </div>
        <div className="rounded-xl px-4 py-2" style={{ background: C.GLASS, border: `1px solid ${C.LINE}`, borderRadius: 12 }}>
          <p className="text-xs" style={{ color: C.MUTED }}>Raqlar</p>
          <p className="text-white text-lg" style={{ fontFamily: 'Chakra Petch, monospace' }}>{completedDances}/3</p>
        </div>
        <div className="rounded-xl px-4 py-2" style={{ background: C.GLASS, border: `1px solid ${C.LINE}`, borderRadius: 12 }}>
          <p className="text-xs" style={{ color: C.MUTED }}>LED</p>
          <div className={`w-5 h-5 rounded-full mt-1 ${currentLED() ? 'animate-pulse' : ''}`}
            style={{ background: currentLED() ? C.GREEN : C.PANEL, boxShadow: currentLED() ? `0 0 10px ${C.GREEN}` : 'none' }} />
        </div>
      </div>

      {/* Stage indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <div className="rounded-xl px-4 py-2 text-center" style={{ background: C.GLASS, border: `1px solid ${C.LINE}`, borderRadius: 12 }}>
          <Sparkles className={`w-5 h-5 mx-auto ${isPlaying ? 'animate-spin' : ''}`}
            style={{ color: isPlaying ? C.GOLD : C.MUTED }} />
          <p className="text-xs mt-1" style={{ color: C.MUTED, fontFamily: 'Chakra Petch, monospace' }}>{isPlaying ? 'Ijro etilmoqda' : 'Tayyor'}</p>
        </div>
      </div>
    </div>
  );
}
