import { useState, useRef, useEffect, useCallback } from 'react';
import GameCanvas from './GameCanvas'; import { drawGradientBackground, drawGlow, ParticleSystem } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function LightTheremin() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const time = useRef(0);
  const [freq, setFreq] = useState(200);
  const [volume, setVolume] = useState(0.5);
  const winRef = useRef(false);

  const draw = useCallback((ctx, w, h, t) => {
    time.current = t;
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, ['#0f0015', '#1a0030', '#0d0015']);

    // Frequency waves
    const freqVal = serialData.ldr ? Math.max(100, (serialData.ldr / 1023) * 2000) : 500;
    const amp = (serialData.ldr ? serialData.ldr / 1023 : 0.5) * 80;
    setFreq(freqVal);

    // Draw sound waves
    ctx.strokeStyle = `rgba(0, 245, 255, ${0.3 + amp / 160})`;
    ctx.lineWidth = 2;
    for (let wave = 0; wave < 3; wave++) {
      ctx.beginPath();
      for (let x = 0; x < w; x += 2) {
        const y = h / 2 + Math.sin((x + t * 200 * (freqVal / 500)) * 0.02 * (wave + 1) + wave) * (amp + wave * 20);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Frequency bars
    const bars = Math.floor((freqVal / 2000) * 20);
    for (let i = 0; i < 20; i++) {
      const barH = (i < bars) ? 8 + i * 3 : 4;
      ctx.fillStyle = i < bars ? `hsl(${180 + i * 8}, 100%, ${50 + i * 2}%)` : '#1e293b';
      ctx.fillRect(w / 2 - 100 + i * 10, h - 80 - barH, 6, barH);
    }

    // Glow effect
    drawGlow(ctx, w / 2, h / 2, 40 + amp, `rgba(0,245,255,${0.05 + amp / 500})`);

    // Particles
    if (amp > 30) {
      particles.current.emit(w / 2, h / 2, '#00f5ff', 1, 50 + amp);
      particles.current.emit(w / 2, h / 2, '#9900ff', 1, 30 + amp * 0.5);
    }
    particles.current.update(0.016);
    particles.current.draw(ctx);

    // Win check
    if (freqVal > 1500 && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(50);
      if (onWin) onWin(score + 50);
    }

    // HUD
    ctx.fillStyle = 'rgba(15,23,42,0.7)';
    const note = ['C','D','E','F','G','A','B'][Math.floor((freqVal / 2000) * 7) % 7];
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f5ff';
    ctx.fillText(note + Math.floor(freqVal) + 'Hz', w / 2, 50);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText("☀️ Qo'lingizni LDR sensor ustida harakatlantiring", w / 2, 80);
    ctx.fillText("Yorug'lik → Yuqori ovoz", w / 2, 100);
  }, [serialData.ldr, serialData.led, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
      <div className="absolute bottom-4 right-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">LED</p>
        <div className={`w-5 h-5 rounded-full ${serialData.led ? 'bg-neon-green shadow-lg shadow-neon-green/50 animate-pulse' : 'bg-dark-600'}`} />
      </div>
    </GameCanvas>
  );
}
