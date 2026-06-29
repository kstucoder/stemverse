import { useEffect, useRef, useState, useCallback } from 'react';
import useGameStore from '../../stores/gameStore';

export default function SpeedRunner() {
  const { serialData, score, incrementScore } = useGameStore();
  const [playerY, setPlayerY] = useState(0);
  const [playerX, setPlayerX] = useState(50);
  const [isJumping, setIsJumping] = useState(false);
  const [distance, setDistance] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const frameRef = useRef(null);
  const jumpRef = useRef(null);
  const obstacleCounter = useRef(0);
  const winRef = useRef(false);

  // Check win condition
  useEffect(() => {
    if (distance >= 1000 && !winRef.current && !gameOver) {
      winRef.current = true;
      const store = useGameStore.getState();
      if (store.onWin) store.onWin(score);
    }
  }, [distance, score, gameOver]);

  // Speed from potentiometer
  const speed = Math.max(1, Math.round((serialData.potentiometer / 1023) * 10));

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameOver) return;

      // Move forward
      setDistance((d) => {
        const newDist = d + speed * 0.5;
        incrementScore(Math.round(speed * 0.1));
        return newDist;
      });

      // Spawn obstacles
      obstacleCounter.current += speed;
      if (obstacleCounter.current > 30) {
        obstacleCounter.current = 0;
        const obstacleHeight = 10 + Math.random() * 20;
        setObstacles((prev) => [
          ...prev,
          { id: Date.now(), x: 100, height: obstacleHeight, width: 8 },
        ]);
      }

      // Move obstacles left
      setObstacles((prev) => {
        const moved = prev
          .map((o) => ({ ...o, x: o.x - speed * 0.8 }))
          .filter((o) => o.x > -10);
        return moved;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [speed, gameOver]);

  // Jump on button press
  useEffect(() => {
    if (serialData.button === 1 && !isJumping && !gameOver) {
      setIsJumping(true);
      jumpRef.current = 0;
      incrementScore(2);

      const jumpInterval = setInterval(() => {
        jumpRef.current += 1;
        if (jumpRef.current < 15) {
          setPlayerY((prev) => prev - 3);
        } else if (jumpRef.current < 30) {
          setPlayerY((prev) => prev + 3);
        } else {
          clearInterval(jumpInterval);
          setPlayerY(0);
          setIsJumping(false);
        }
      }, 20);
    }
  }, [serialData.button]);

  // Collision detection
  useEffect(() => {
    obstacles.forEach((o) => {
      const playerLeft = playerX - 5;
      const playerRight = playerX + 5;
      const obstacleLeft = o.x;
      const obstacleRight = o.x + o.width;
      const obstacleBottom = 30 - o.height;

      if (playerRight > obstacleLeft && playerLeft < obstacleRight) {
        if (playerY < o.height) {
          setGameOver(true);
        }
      }
    });
  }, [obstacles, playerX, playerY]);

  const restart = () => {
    setPlayerY(0);
    setDistance(0);
    setObstacles([]);
    setGameOver(false);
    // speed from POT
    obstacleCounter.current = 0;
    useGameStore.getState().startGame();
    winRef.current = false;
  };

  return (
    <div className="relative h-full min-h-[500px] bg-game-gradient rounded-2xl overflow-hidden">
      {/* Sky gradient based on speed */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        speed > 7 ? 'bg-gradient-to-b from-orange-900 via-purple-900 to-dark-800' :
        speed > 4 ? 'bg-gradient-to-b from-brand-900 via-purple-900 to-dark-800' :
        'bg-gradient-to-b from-sky-900 via-blue-900 to-dark-800'
      }`} />

      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute w-1 h-1 bg-white rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 40}%`, opacity: Math.random() * 0.8 }} />
      ))}

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%]">
        <div className="h-full bg-gradient-to-t from-dark-900 via-dark-800 to-dark-700" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-neon-green/30" />

        {/* Ground texture */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute top-0 w-4 h-1 bg-dark-600"
            style={{ left: `${((distance * 0.2 + i * 10) % 200)}px`, top: `${5 + Math.sin(i) * 3}px` }} />
        ))}
      </div>

      {/* Player Character */}
      <div className="absolute transition-all duration-100"
        style={{
          left: `${playerX}%`,
          bottom: `${30 + playerY}%`,
          transform: 'translateX(-50%)',
        }}>
        <div className="relative">
          <div className={`w-8 h-10 rounded-lg ${isJumping ? 'bg-neon-cyan' : 'bg-brand-400'} flex items-center justify-center`}>
            <span className="text-lg">{isJumping ? '⬆' : '🏃'}</span>
          </div>
          {isJumping && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/30 rounded-full animate-ping" />
          )}
        </div>
      </div>

      {/* Obstacles */}
      {obstacles.map((o) => (
        <div key={o.id} className="absolute transition-all duration-75"
          style={{
            left: `${o.x}%`,
            bottom: '30%',
            width: `${o.width}px`,
            height: `${o.height * 4}px`,
          }}>
          <div className="w-full h-full rounded-t bg-gradient-to-t from-orange-600 to-orange-400 border border-orange-300/30">
            <div className="absolute top-0 left-0 right-0 h-2 bg-neon-yellow/50 rounded-t" />
          </div>
        </div>
      ))}

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="text-center">
            <h2 className="text-4xl font-game text-red-500 mb-2">HALOKAT!</h2>
            <p className="text-dark-300 mb-4">Siz {Math.round(distance)}m yugurdingiz</p>
            <button onClick={restart} className="btn-primary">Qayta urinish</button>
          </div>
        </div>
      )}

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="glass rounded-xl px-4 py-2">
          <p className="text-xs text-dark-400">Masofa</p>
          <p className="font-game text-white text-lg">{Math.round(distance)}m</p>
        </div>
        <div className="glass rounded-xl px-4 py-2">
          <p className="text-xs text-dark-400">Tezlik</p>
          <p className="font-game text-white text-lg">{speed}x</p>
        </div>
        <div className="glass rounded-xl px-4 py-2">
          <p className="text-xs text-dark-400">Ball</p>
          <p className="font-game text-white text-lg">{score}</p>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-[35%] left-4 z-10">
        <div className="glass rounded-xl px-3 py-2">
          <p className="text-xs text-neon-cyan">{'POT → Tezlik'}</p>
          <p className="text-xs text-neon-yellow">{'BTN → Sakrash'}</p>
        </div>
      </div>

      {/* Win progress bar */}
      <div className="absolute bottom-[32%] left-4 right-4 z-10">
        <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
          <div className="h-full bg-neon-green rounded-full transition-all duration-300"
            style={{ width: `${Math.min(distance / 10, 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
