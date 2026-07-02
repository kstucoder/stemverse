import { useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas'; import { C, drawGradientBackground, drawVignette, drawScanlines, drawGlassPanel, ParticleSystem } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

export default function MusicVisualizer() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const arduinoConnected = useGameStore(s => s.arduinoConnected);
  const particles = useRef(new ParticleSystem());
  const samples = useRef(new Float32Array(128));
  const winRef = useRef(false);
  const noteHistory = useRef([]);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, ['#050510', '#0a0a2a', '#050510']);

    const pot = serialData.pot ?? 512;
    const freq = (pot / 1023) * 2000 + 50;
    const bars = 32;

    // Frequency samples
    for (let i = 0; i < bars; i++) {
      const phase = (i / bars) * Math.PI * 2 * (freq / 500);
      const sample = Math.sin(t * freq * 0.01 + phase) * 0.5 + 0.5;
      samples.current[i] = samples.current[i] * 0.9 + sample * 0.1;
    }

    // Equalizer bars
    const barW = (w - 40) / bars;
    for (let i = 0; i < bars; i++) {
      const val = samples.current[i] || 0;
      const barH = val * 150;
      const hue = 180 + i * 2.5;
      ctx.fillStyle = `hsl(${hue}, 100%, ${50 + val * 30}%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowBlur = val * 20;
      ctx.fillRect(20 + i * barW, h / 2 - barH / 2, barW - 2, barH);
    }
    ctx.shadowBlur = 0;

    // Oscilloscope line
    ctx.strokeStyle = C.CYAN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w; x += 3) {
      const y = h * 0.75 + Math.sin((x + t * 200) * 0.02 * (freq / 500)) * 30 * (pot / 1023);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Oscilloscope glow
    ctx.strokeStyle = 'rgba(0,245,255,0.1)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = 0; x < w; x += 3) {
      const y = h * 0.75 + Math.sin((x + t * 200) * 0.02 * (freq / 500)) * 30 * (pot / 1023);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Note display
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = Math.round((Math.log2(freq / 440) * 12 + 69) % 12);
    const noteName = noteNames[noteIndex] || '?';

    noteHistory.current.push(noteName);
    if (noteHistory.current.length > 50) noteHistory.current.shift();

    drawGlassPanel(ctx, 10, 10, 150, 70, 10);
    ctx.fillStyle = C.CYAN;
    ctx.font = 'bold 32px Chakra Petch, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(noteName + ' ' + Math.round(freq) + 'Hz', 20, 42);
    ctx.fillStyle = C.MUTED;
    ctx.font = '11px Chakra Petch, monospace';
    ctx.fillText('POT → Chastota', 20, 65);

    // Particle effects on beat
    if (samples.current[16] > 0.6) {
      particles.current.emit(Math.random() * w, Math.random() * h, C.CYAN, 3, 80);
    }

    particles.current.update(0.016);
    particles.current.draw(ctx);

    // Vignette + scanlines
    drawVignette(ctx, w, h);
    drawScanlines(ctx, w, h);

    // Win: get frequency high enough
    if (arduinoConnected && freq > 1800 && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(300);
      if (onWin) onWin(score + 300);
    }
  }, [serialData.pot, score, winConditions, onWin, incrementScore]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      {!arduinoConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl z-10">
          <p className="text-white text-xl font-game animate-pulse" style={{ fontFamily: 'Chakra Petch, monospace' }}>🔌 Arduino'ni ulang</p>
        </div>
      )}
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
      <div className="absolute bottom-4 right-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">LED</p>
        <div className={`w-5 h-5 rounded-full ${arduinoConnected && serialData.led ? 'bg-neon-green shadow-lg animate-pulse' : 'bg-dark-600'}`} />
      </div>
    </GameCanvas>
  );
}
