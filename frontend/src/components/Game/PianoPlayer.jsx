import { useState, useRef, useCallback, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import { ParticleSystem, drawGlow } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

const NOTES = [
  { name: 'C4', freq: 262, color: '#ef4444', x: 0 },
  { name: 'D4', freq: 294, color: '#f97316', x: 1 },
  { name: 'E4', freq: 330, color: '#eab308', x: 2 },
  { name: 'F4', freq: 349, color: '#22c55e', x: 3 },
  { name: 'G4', freq: 392, color: '#06b6d4', x: 4 },
  { name: 'A4', freq: 440, color: '#3b82f6', x: 5 },
  { name: 'B4', freq: 494, color: '#8b5cf6', x: 6 },
  { name: 'C5', freq: 523, color: '#ec4899', x: 7 },
];

const TUNE = [0, 2, 4, 0, 0, 2, 4, 0, 4, 5, 7, 4, 5, 7]; // Twinkle Twinkle

export default function PianoPlayer() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const [activeNote, setActiveNote] = useState(-1);
  const [tunePos, setTunePos] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const winRef = useRef(false);

  const noteKeys = serialData.button || 0;

  useEffect(() => {
    if (noteKeys > 0 && noteKeys <= 8) {
      const idx = noteKeys - 1;
      setActiveNote(idx);
      particles.current.emit(200 + idx * 60, 300, NOTES[idx].color, 5, 80);

      if (idx === TUNE[tunePos % TUNE.length]) {
        setTunePos(p => p + 1);
        incrementScore(10);
      } else {
        setMistakes(m => m + 1);
        setTunePos(0);
      }
      setTimeout(() => setActiveNote(-1), 300);
    }
  }, [noteKeys]);

  useEffect(() => {
    if (tunePos >= TUNE.length && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(100);
      if (onWin) onWin(score + 100);
    }
  }, [tunePos, score, winConditions, onWin]);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(1, '#1a1020');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Piano keys
    const keyW = w / 8;
    const keyH = h * 0.6;
    const keyY = h * 0.3;

    NOTES.forEach((note, i) => {
      const isActive = i === activeNote;
      ctx.fillStyle = isActive ? note.color : '#1e293b';
      ctx.shadowColor = isActive ? note.color : 'transparent';
      ctx.shadowBlur = isActive ? 30 : 0;
      ctx.fillRect(i * keyW + 4, keyY, keyW - 8, keyH);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(i * keyW + 4, keyY, keyW - 8, keyH);

      // Note name
      ctx.fillStyle = isActive ? '#fff' : '#64748b';
      ctx.textAlign = 'center';
      ctx.font = isActive ? 'bold 16px sans-serif' : '12px sans-serif';
      ctx.fillText(note.name, i * keyW + keyW / 2, keyY + keyH - 15);

      if (isActive) {
        drawGlow(ctx, i * keyW + keyW / 2, keyY + keyH / 2, 40, note.color + '30');
      }
    });

    // Tune progress
    const progress = tunePos / TUNE.length;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w / 2 - 150, 35, 300, 6);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(w / 2 - 150, 35, 300 * progress, 6);

    // Tune notes
    TUNE.forEach((n, i) => {
      ctx.fillStyle = i < tunePos ? NOTES[n].color : '#1e293b';
      ctx.fillRect(w / 2 - 150 + i * (300 / TUNE.length), 50, 300 / TUNE.length - 2, i === tunePos ? 10 : 6);
    });

    // Info
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
	    ctx.fillText('🎵 "Twinkle Twinkle" ni ijro eting — notalarni tartib bilan bosing!', w / 2, 85);
    ctx.fillStyle = '#ef4444';
    ctx.font = '11px sans-serif';
	    ctx.fillText('❌ Xatolar: ' + mistakes, w / 2, 105);

    particles.current.update(0.016);
    particles.current.draw(ctx);
  }, [activeNote, tunePos, mistakes]);

  return (
    <GameCanvas draw={draw} className="rounded-2xl">
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2">
        <p className="text-xs text-dark-400">Score</p>
        <p className="font-game text-white text-lg">{score}</p>
      </div>
    </GameCanvas>
  );
}
