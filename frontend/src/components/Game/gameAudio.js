// Web Audio API sound effects — premium audio feedback for VOLTRA games
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

export function playTrafficState(state) {
  const freq = { RED: 220, YELLOW: 330, GREEN: 440 }[state] || 300;
  playTone(freq, 0.15, 'triangle', 0.08);
}

export function playTram() {
  playTone(220, 0.5, 'triangle', 0.08);
  setTimeout(() => playTone(330, 0.3, 'triangle', 0.06), 200);
}

export function playZap() {
  // Elektr short-circuit — o'tkir treska + tez pasayuvchi shovqin
  playTone(1400, 0.07, 'sawtooth', 0.13);
  setTimeout(() => playTone(280, 0.14, 'square', 0.11), 40);
  setTimeout(() => playTone(2000, 0.05, 'sawtooth', 0.08), 95);
  setTimeout(() => playTone(180, 0.2, 'sawtooth', 0.07), 150);
}

export function playHorn() {
  // Mashina signali — ikki ohangli "biib"
  playTone(420, 0.16, 'square', 0.07);
  playTone(330, 0.16, 'square', 0.05);
  setTimeout(() => { playTone(420, 0.12, 'square', 0.06); playTone(330, 0.12, 'square', 0.045); }, 180);
}

export function playNote(freq) {
  playTone(freq, 0.3, 'triangle', 0.1);
}

export function playConnect() {
  playTone(440, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(880, 0.12, 'sine', 0.1), 90);
}

export function playDisconnect() {
  playTone(440, 0.1, 'sine', 0.08);
  setTimeout(() => playTone(220, 0.15, 'sine', 0.08), 90);
}

export function playThunder() {
  try {
    const ctx = getContext();
    const dur = 1.8;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.4);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(420, ctx.currentTime);
    filt.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch (e) { /* silent fail */ }
}

// ===== KROMA (Color Mixer) — rang voqeligi ovozlari =====

export function playShimmer() {
  // Yuqoriga ko'tariluvchi sehrli chime — hayot/gullash
  const notes = [523, 659, 784, 988, 1319, 1568];
  notes.forEach((f, i) => setTimeout(() => playTone(f, 0.4, 'sine', 0.07), i * 85));
}

export function playBloom() {
  // Rang tiklanganda yorqin triada
  [659, 831, 988, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.28, 'sine', 0.11), i * 55));
}

export function playColorPop(freq = 700) {
  playTone(freq, 0.12, 'triangle', 0.06);
}

export function playRift() {
  // Chuqur yoriq — o'tkir zarba + past rumble + treska
  playTone(72, 0.6, 'sawtooth', 0.16);
  setTimeout(() => playTone(48, 0.9, 'sine', 0.12), 40);
  try {
    const ctx = getContext();
    const dur = 0.5;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.26, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
  } catch (e) { /* silent */ }
}

export function playDrain() {
  // Ranglar so'rilishi — pasayuvchi bandpass shovqin (whoosh)
  try {
    const ctx = getContext();
    const dur = 1.5;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.4);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.Q.value = 2.2;
    filt.frequency.setValueAtTime(2000, ctx.currentTime);
    filt.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(filt); filt.connect(gain); gain.connect(ctx.destination); src.start();
  } catch (e) { /* silent */ }
}

export function playHollow() {
  // Jonsiz kulrang olam — bo'sh, g'amgin drone
  playTone(110, 1.3, 'sine', 0.05);
  setTimeout(() => playTone(146, 1.1, 'sine', 0.04), 220);
}

// ===== LIVE CONTINUOUS TONE (theremin-style — frequency updates every frame
// instead of a discrete triggered note) =====
let liveOsc = null, liveGain = null;

export function startLiveTone() {
  try {
    const ctx = getContext();
    liveOsc = ctx.createOscillator();
    liveGain = ctx.createGain();
    liveOsc.type = 'sine';
    liveGain.gain.setValueAtTime(0, ctx.currentTime);
    liveOsc.connect(liveGain);
    liveGain.connect(ctx.destination);
    liveOsc.start();
  } catch (e) { /* silent fail */ }
}

export function updateLiveTone(freq, volume = 0.08) {
  if (!liveOsc || !liveGain) return;
  try {
    const ctx = getContext();
    liveOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
    liveGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
  } catch (e) { /* silent fail */ }
}

export function stopLiveTone() {
  if (!liveOsc) return;
  try {
    const ctx = getContext();
    liveGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    liveOsc.stop(ctx.currentTime + 0.2);
  } catch (e) { /* silent fail */ }
  liveOsc = null; liveGain = null;
}
