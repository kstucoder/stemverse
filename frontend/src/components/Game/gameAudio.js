// Web Audio API sound effects — premium audio feedback for STEMVERSE games
let audioCtx = null;

function getContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Play a tone with envelope
function playTone(freq, duration = 0.2, type = 'square', volume = 0.15) {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* silent fail */ }
}

// ===== GAME SOUNDS =====

export function playScore() {
  playTone(880, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(1100, 0.1, 'sine', 0.1), 80);
}

export function playWin() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.3, 'sine', 0.15), i * 120);
  });
}

export function playCombo(combo) {
  const baseFreq = 440 + combo * 50;
  playTone(baseFreq, 0.15, 'triangle', 0.1 + combo * 0.02);
}

export function playClick() {
  playTone(1200, 0.05, 'square', 0.05);
}

export function playError() {
  playTone(200, 0.3, 'sawtooth', 0.1);
  setTimeout(() => playTone(160, 0.3, 'sawtooth', 0.08), 150);
}

export function playLevelUp() {
  [523, 587, 659, 784, 880, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, 'sine', 0.12), i * 100);
  });
}

export function playJump() {
  playTone(300, 0.1, 'sine', 0.08);
  setTimeout(() => playTone(600, 0.1, 'sine', 0.06), 50);
}

export function playCrash() {
  playTone(100, 0.4, 'sawtooth', 0.15);
  setTimeout(() => playTone(80, 0.3, 'square', 0.1), 100);
}

export function playAlarm() {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      playTone(800, 0.15, 'square', 0.1);
      setTimeout(() => playTone(600, 0.15, 'square', 0.1), 100);
    }, i * 300);
  }
}

export function playCollect() {
  playTone(660, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(880, 0.08, 'sine', 0.08), 60);
  setTimeout(() => playTone(1100, 0.12, 'sine', 0.06), 120);
}

export function playButton() {
  playTone(440, 0.05, 'square', 0.05);
}

export function playTram() {
  playTone(220, 0.5, 'triangle', 0.08);
  setTimeout(() => playTone(330, 0.3, 'triangle', 0.06), 200);
}

export function playNote(freq) {
  playTone(freq, 0.3, 'triangle', 0.1);
}
