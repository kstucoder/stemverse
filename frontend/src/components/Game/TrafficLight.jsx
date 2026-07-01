// 🚦 VOLTRA Traffic Light — Premium Edition
import { useEffect, useRef, useState } from 'react';
import { Car, Footprints } from 'lucide-react';
import useGameStore from '../../stores/gameStore';
import { C } from './gameHelpers';

const STATES = {
  GREEN:  { time: 8, label: 'YUR',    color: C.GREEN,  nextState: 'YELLOW' },
  YELLOW: { time: 3, label: 'DIQQAT', color: C.GOLD,   nextState: 'RED' },
  RED:    { time: 6, label: "TO'XT",  color: '#FF2D30', nextState: 'GREEN' },
};
const STATE_ORDER = ['GREEN', 'YELLOW', 'RED'];

export default function TrafficLight() {
  const { serialData, score, incrementScore } = useGameStore();
  const [currentState, setCurrentState] = useState('GREEN');
  const [timer, setTimer] = useState(8);
  const [trafficFlow, setTrafficFlow] = useState(0);
  const [pedestrianWaiting, setPedestrianWaiting] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef(null);
  const winRef = useRef(false);

  useEffect(() => {
    if (cycleCount >= 10 && !winRef.current) {
      winRef.current = true;
      const store = useGameStore.getState();
      if (store.onWin) store.onWin(score);
    }
  }, [cycleCount, score]);

  useEffect(() => {
    const s = STATES[currentState];
    setTimer(s.time);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setCurrentState((prev) => {
            const idx = STATE_ORDER.indexOf(prev);
            const next = STATE_ORDER[(idx + 1) % 3];
            if (prev === 'GREEN') setTrafficFlow((f) => Math.max(0, f - 15));
            if (prev === 'RED') { setCycleCount((c) => c + 1); setTrafficFlow((f) => f + 50); }
            return next;
          });
          return STATES[currentState]?.time || 8;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [currentState]);

  useEffect(() => {
    if (serialData.button === 1 && currentState !== 'RED') {
      setPedestrianWaiting(true);
      incrementScore(5);
      if (currentState === 'GREEN') { setCurrentState('YELLOW'); setTimer(2); }
    }
    if (currentState === 'RED' && pedestrianWaiting) {
      setPedestrianWaiting(false);
      incrementScore(20);
    }
  }, [serialData.button, currentState]);

  const s = STATES[currentState];
  const progress = cycleCount / 10;

  return (
    <div className="relative h-full min-h-[500px] overflow-hidden" style={{ background: 'linear-gradient(180deg, #020617 0%, #0B1120 60%, #060912 100%)', borderRadius: 14 }}>
      
      {/* City silhouette */}
      <div className="absolute bottom-32 left-0 right-0 h-40 opacity-30" style={{ background: `repeating-linear-gradient(90deg, ${C.PANEL} 0px 30px, transparent 30px 36px, #0a0f1c 36px 72px, transparent 72px 80px)` }} />
      
      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: `linear-gradient(180deg, rgba(0,238,255,0.04) 0%, ${C.PANEL} 30%)` }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.CYAN}40, transparent)` }} />
        <div className="absolute top-1/2 left-0 right-0 flex items-center" style={{ transform: 'translateY(-50%)' }}>
          <div className="flex-1 border-t border-dashed" style={{ borderColor: `${C.GOLD}30` }} />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 pt-10">
        
        {/* Traffic Light Body */}
        <div className="p-5 flex flex-col items-center gap-3" style={{
          background: 'linear-gradient(180deg, #1a1a2e, #0d0d1a)',
          border: `2px solid rgba(0,238,255,0.15)`,
          borderRadius: 20,
          boxShadow: `0 0 30px rgba(0,238,255,0.1), inset 0 1px 0 rgba(255,255,255,0.03)`
        }}>
          {/* Red bulb */}
          <div className="w-18 h-18 rounded-full transition-all duration-500 relative" style={{
            width: 64, height: 64,
            background: currentState === 'RED' 
              ? 'radial-gradient(circle at 40% 35%, #ff6060, #cc0000)' 
              : 'radial-gradient(circle at 40% 35%, #2a1a1a, #1a0a0a)',
            boxShadow: currentState === 'RED' ? '0 0 40px rgba(255,0,0,0.6), 0 0 80px rgba(255,0,0,0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {currentState === 'RED' && (
              <div className="absolute inset-3 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 60%)' }} />
            )}
          </div>
          
          {/* Yellow bulb */}
          <div className="w-18 h-18 rounded-full transition-all duration-500 relative" style={{
            width: 64, height: 64,
            background: currentState === 'YELLOW'
              ? 'radial-gradient(circle at 40% 35%, #ffe060, #cc8800)'
              : 'radial-gradient(circle at 40% 35%, #2a2210, #1a1500)',
            boxShadow: currentState === 'YELLOW' ? '0 0 40px rgba(255,200,0,0.6), 0 0 80px rgba(255,200,0,0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {currentState === 'YELLOW' && (
              <div className="absolute inset-3 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 60%)' }} />
            )}
          </div>
          
          {/* Green bulb */}
          <div className="w-18 h-18 rounded-full transition-all duration-500 relative" style={{
            width: 64, height: 64,
            background: currentState === 'GREEN'
              ? 'radial-gradient(circle at 40% 35%, #40ff80, #008840)'
              : 'radial-gradient(circle at 40% 35%, #0a2a10, #051a00)',
            boxShadow: currentState === 'GREEN' ? '0 0 40px rgba(0,255,100,0.6), 0 0 80px rgba(0,255,100,0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {currentState === 'GREEN' && (
              <div className="absolute inset-3 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 60%)' }} />
            )}
          </div>
        </div>

        {/* State label + Timer */}
        <div className="text-center">
          <div className="px-8 py-3" style={{
            background: 'rgba(11,17,32,0.9)',
            border: `1px solid rgba(0,238,255,0.12)`,
            borderRadius: 14,
            backdropFilter: 'blur(12px)',
          }}>
            <span className="text-5xl font-bold" style={{ 
              fontFamily: 'Chakra Petch, monospace', 
              color: s.color,
              textShadow: `0 0 20px ${s.color}80`
            }}>{s.label}</span>
          </div>
          <p className="text-xs mt-2" style={{ color: C.MUTED, fontFamily: 'Chakra Petch, monospace' }}>{timer}s qoldi</p>
        </div>

        {/* Progress bar */}
        <div className="w-64">
          <div className="w-full h-2 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ 
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${C.CYAN}, ${C.CYAN}dd)`,
              boxShadow: `0 0 10px ${C.CYAN}60`
            }} />
          </div>
          <p className="text-xs text-center" style={{ color: C.MUTED, fontFamily: 'Chakra Petch, monospace' }}>{cycleCount}/10 sikl</p>
        </div>
      </div>

      {/* Right panel: traffic flow + pedestrian */}
      <div className="absolute top-5 right-5 p-4 space-y-3" style={{
        background: 'rgba(11,17,32,0.9)',
        border: `1px solid rgba(0,238,255,0.1)`,
        borderRadius: 14,
        backdropFilter: 'blur(12px)',
        minWidth: 140,
      }}>
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4" style={{ color: C.CYAN }} />
          <span className="text-sm font-semibold" style={{ color: C.WHITE, fontFamily: 'Chakra Petch, monospace' }}>{trafficFlow}</span>
        </div>
        <div className="flex items-center gap-2">
          <Footprints className={`w-4 h-4 ${pedestrianWaiting ? 'animate-pulse' : ''}`} style={{ color: pedestrianWaiting ? C.GOLD : C.MUTED }} />
          <span className="text-xs" style={{ color: C.MUTED, fontFamily: 'Chakra Petch, monospace' }}>{pedestrianWaiting ? 'Kutilmoqda...' : 'Toza'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: C.MUTED, fontFamily: 'Chakra Petch, monospace' }}>
          <span>Ball</span>
          <span className="font-bold text-base" style={{ color: C.WHITE }}>{score}</span>
        </div>
      </div>

      {/* LED status indicators */}
      <div className="absolute top-5 left-5 p-3 flex gap-2" style={{
        background: 'rgba(11,17,32,0.9)',
        border: `1px solid rgba(0,238,255,0.1)`,
        borderRadius: 12,
        backdropFilter: 'blur(12px)',
      }}>
        {['#FF2D30', C.GOLD, C.GREEN].map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-full transition-all duration-300" style={{
            background: currentState === STATE_ORDER[i] ? `radial-gradient(circle at 40% 35%, ${c}80, ${c})` : 'rgba(255,255,255,0.06)',
            boxShadow: currentState === STATE_ORDER[i] ? `0 0 12px ${c}80` : 'none',
          }} />
        ))}
      </div>

    </div>
  );
}
