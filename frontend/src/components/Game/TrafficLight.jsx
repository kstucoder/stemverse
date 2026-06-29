import { useEffect, useRef, useState } from 'react';
import { Car, Footprints, AlertTriangle } from 'lucide-react';
import useGameStore from '../../stores/gameStore';

const STATES = {
  GREEN: { time: 8, label: 'GO', color: '#00ff88', nextState: 'YELLOW' },
  YELLOW: { time: 3, label: 'CAUTION', color: '#ffdd00', nextState: 'RED' },
  RED: { time: 6, label: 'STOP', color: '#ff4444', nextState: 'GREEN' },
};

const STATE_ORDER = ['GREEN', 'YELLOW', 'RED'];

export default function TrafficLight() {
  const { serialData, score, incrementScore } = useGameStore();
  const [currentState, setCurrentState] = useState('GREEN');
  const [timer, setTimer] = useState(8);
  const [trafficFlow, setTrafficFlow] = useState(0);
  const [pedestrianWaiting, setPedestrianWaiting] = useState(false);
  const [accidents, setAccidents] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef(null);
  const winRef = useRef(false);

  // Check win condition
  useEffect(() => {
    if (cycleCount >= 10 && !winRef.current) {
      winRef.current = true;
      const store = useGameStore.getState();
      if (store.onWin) store.onWin(score);
    }
  }, [cycleCount, score]);

  // State machine timer
  useEffect(() => {
    const state = STATES[currentState];
    setTimer(state.time);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setCurrentState((prev) => {
            const idx = STATE_ORDER.indexOf(prev);
            const next = STATE_ORDER[(idx + 1) % 3];
            if (prev === 'GREEN') {
              setTrafficFlow((f) => Math.max(0, f - 15));
            }
            if (prev === 'RED') {
              setCycleCount((c) => c + 1);
              setTrafficFlow((f) => f + 50);
            }
            return next;
          });
          return STATES[currentState]?.time || 8;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [currentState]);

  // Handle button press (pedestrian wants to cross)
  useEffect(() => {
    if (serialData.button === 1 && currentState !== 'RED') {
      setPedestrianWaiting(true);
      incrementScore(5);
      // Force early yellow if green
      if (currentState === 'GREEN') {
        setCurrentState('YELLOW');
        setTimer(2);
      }
    }
    if (currentState === 'RED' && pedestrianWaiting) {
      setPedestrianWaiting(false);
      incrementScore(20);
    }
  }, [serialData.button, currentState]);

  // LED mapping: Red LED = RED state, etc.
  const ledStatus = {
    red_led: currentState === 'RED' ? 1 : 0,
    yellow_led: currentState === 'YELLOW' ? 1 : 0,
    green_led: currentState === 'GREEN' ? 1 : 0,
  };

  const state = STATES[currentState];

  return (
    <div className="relative h-full min-h-[500px] bg-game-gradient rounded-2xl overflow-hidden p-6">
      {/* City Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-dark-800" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute bottom-24 w-8 bg-dark-700 rounded-t"
            style={{ left: `${10 + i * 15}%`, height: `${40 + Math.random() * 60}px` }} />
        ))}
      </div>

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <div className="h-full bg-dark-800 border-t-2 border-b-2 border-yellow-500/30" />
        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-yellow-500/20" />
      </div>

      {/* Traffic Light Display */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-dark-900 rounded-2xl p-4 border-2 border-dark-600 shadow-2xl inline-flex flex-col items-center gap-2">
          <div className={`w-16 h-16 rounded-full transition-all duration-300 ${currentState === 'RED' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-dark-700'}`} />
          <div className={`w-16 h-16 rounded-full transition-all duration-300 ${currentState === 'YELLOW' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-dark-700'}`} />
          <div className={`w-16 h-16 rounded-full transition-all duration-300 ${currentState === 'GREEN' ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-dark-700'}`} />
        </div>

        <div className="mt-4 text-center">
          <div className="glass rounded-xl px-6 py-3 inline-block">
            <span className="text-4xl font-game" style={{ color: state.color }}>{state.label}</span>
          </div>
          <p className="text-dark-400 text-sm mt-2">{timer}s remaining</p>
        </div>
      </div>

      {/* Traffic Flow Indicator */}
      <div className="absolute top-4 right-4 glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Car className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm text-white font-semibold">{trafficFlow}</span>
        </div>
        <div className="flex items-center gap-2">
          <Footprints className={`w-4 h-4 ${pedestrianWaiting ? 'text-neon-yellow animate-pulse' : 'text-dark-500'}`} />
          <span className="text-sm text-dark-400">{pedestrianWaiting ? 'Waiting...' : 'Clear'}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <AlertTriangle className={`w-4 h-4 ${accidents > 0 ? 'text-red-500' : 'text-dark-500'}`} />
          <span className="text-sm text-dark-400">Accidents: {accidents}</span>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="absolute bottom-40 left-4 right-4 flex justify-between">
        <div className="glass rounded-xl px-4 py-2">
          <p className="text-xs text-dark-400">Cycles</p>
          <p className="font-game text-white text-lg">{cycleCount}/10</p>
        </div>
        <div className="glass rounded-xl px-4 py-2">
          <p className="text-xs text-dark-400">Score</p>
          <p className="font-game text-white text-lg">{score}</p>
        </div>
      </div>

      {/* LEDs Status */}
      <div className="absolute top-4 left-4 glass rounded-xl p-3">
        <p className="text-xs text-dark-400 mb-2">LED Status</p>
        <div className="flex gap-2">
          <div className={`w-4 h-4 rounded-full ${ledStatus.red_led ? 'bg-red-500' : 'bg-dark-600'}`} />
          <div className={`w-4 h-4 rounded-full ${ledStatus.yellow_led ? 'bg-yellow-400' : 'bg-dark-600'}`} />
          <div className={`w-4 h-4 rounded-full ${ledStatus.green_led ? 'bg-green-400' : 'bg-dark-600'}`} />
        </div>
      </div>
    </div>
  );
}
