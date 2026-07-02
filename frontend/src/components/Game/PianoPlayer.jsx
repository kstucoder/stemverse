import { useState, useRef, useCallback, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import { C, drawGradientBackground, drawVignette, drawScanlines, drawProgressBar, ParticleSystem, drawGlow } from './gameHelpers';
import useGameStore from '../../stores/gameStore';

// The real circuit only wires 4 push buttons (pins 2-5), so the keyboard and
// the tune to play must both stay within 4 notes — anything requiring a 5th+
// note would be impossible to complete with the actual hardware.
const NOTES = [
  { name: 'C4', freq: 262, color: '#ef4444', x: 0 },
  { name: 'D4', freq: 294, color: '#f97316', x: 1 },
  { name: 'E4', freq: 330, color: '#eab308', x: 2 },
  { name: 'F4', freq: 349, color: '#22c55e', x: 3 },
];

const TUNE = [0, 1, 2, 3, 3, 2, 1, 0, 0, 1, 2, 3, 3, 2, 1, 0]; // Do-Re-Mi-Fa scale, up & down twice

export default function PianoPlayer() {
  const { serialData, score, incrementScore, winConditions, onWin } = useGameStore();
  const particles = useRef(new ParticleSystem());
  const [activeNote, setActiveNote] = useState(-1);
  const [tunePos, setTunePos] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const winRef = useRef(false);

  const noteKeys = serialData.btn || 0;

  useEffect(() => {
    if (noteKeys > 0 && noteKeys <= NOTES.length) {
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
  }, [noteKeys, tunePos, incrementScore]);

  useEffect(() => {
    if (tunePos >= TUNE.length && !winRef.current && winConditions) {
      winRef.current = true;
      incrementScore(100);
      if (onWin) onWin(score + 100);
    }
  }, [tunePos, score, winConditions, onWin]);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    drawGradientBackground(ctx, w, h, [C.DARK, C.PANEL]);

    // Piano keys
    const keyW = w / NOTES.length;
    const keyH = h * 0.6;
    const keyY = h * 0.3;

    NOTES.forEach((note, i) => {
      const isActive = i === activeNote;
      ctx.fillStyle = isActive ? note.color : C.PANEL;
      ctx.shadowColor = isActive ? note.color : 'transparent';
      ctx.shadowBlur = isActive ? 30 : 0;
      ctx.fillRect(i * keyW + 4, keyY, keyW - 8, keyH);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(i * keyW + 4, keyY, keyW - 8, keyH);

      // Note name
      ctx.fillStyle = isActive ? C.WHITE : '#64748b';
      ctx.textAlign = 'center';
      ctx.font = isActive ? 'bold 16px Chakra Petch, monospace' : '12px Chakra Petch, monospace';
      ctx.fillText(note.name, i * keyW + keyW / 2, keyY + keyH - 15);

      if (isActive) {
        drawGlow(ctx, i * keyW + keyW / 2, keyY + keyH / 2, 40, note.color + '30');
      }
    });

    // Tune progress
    const progress = tunePos / TUNE.length;
    drawProgressBar(ctx, w / 2 - 150, 35, 300, 6, progress, C.PURPLE);

    // Tune notes
    TUNE.forEach((n, i) => {
      ctx.fillStyle = i < tunePos ? NOTES[n].color : C.PANEL;
      ctx.fillRect(w / 2 - 150 + i * (300 / TUNE.length), 50, 300 / TUNE.length - 2, i === tunePos ? 10 : 6);
    });

    // Info
    ctx.textAlign = 'center';
    ctx.fillStyle = C.MUTED;
    ctx.font = '12px Chakra Petch, monospace';
    ctx.fillText("🎵 Do-Re-Mi-Fa gammasini ijro eting — 4 tugmani tartib bilan bosing!", w / 2, 85);
    ctx.fillStyle = '#ef4444';
    ctx.font = '11px Chakra Petch, monospace';
    ctx.fillText('❌ Xatolar: ' + mistakes, w / 2, 105);

    particles.current.update(0.016);
    particles.current.draw(ctx);

    // Vignette + scanlines
    drawVignette(ctx, w, h);
    drawScanlines(ctx, w, h);
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
