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

export function playWhoosh() {
  // Asteroid atmosferani yorib tushishi — pastdan yuqoriga ko'tariluvchi shovqin (roar)
  try {
    const ctx = getContext();
    const dur = 1.7;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.3;
    f.frequency.setValueAtTime(180, ctx.currentTime);
    f.frequency.exponentialRampToValueAtTime(1900, ctx.currentTime + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.24, ctx.currentTime + dur * 0.82);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
  } catch (e) { /* silent */ }
}

export function playBoom() {
  // Chuqur zarba — pastga tushuvchi sub-bas + past chastotali shovqin punchi
  try {
    const ctx = getContext();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(130, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.95);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 1.25);
    const dur = 0.75;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(950, ctx.currentTime);
    f.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + dur);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.42, ctx.currentTime);
    ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(f); f.connect(ng); ng.connect(ctx.destination); src.start();
  } catch (e) { /* silent */ }
}

export function startWind() {
  // Uzluksiz shamol ambiyensi — filtrlangan shovqin + LFO gustlar. stop() qaytaradi.
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    const dur = 3;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 460; f.Q.value = 0.7;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 620; bp.Q.value = 0.4;
    const g = ctx.createGain(); g.gain.value = 0.0001;
    src.connect(f); f.connect(bp); bp.connect(g); g.connect(ctx.destination);
    src.start();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.075, ctx.currentTime + 2.2);
    // gustlar: gain va filtr chastotasini sekin tebratamiz
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.16;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.045;
    lfo.connect(lfoG); lfoG.connect(g.gain); lfo.start();
    const lfo2 = ctx.createOscillator(); lfo2.type = 'sine'; lfo2.frequency.value = 0.09;
    const lfo2G = ctx.createGain(); lfo2G.gain.value = 240;
    lfo2.connect(lfo2G); lfo2G.connect(f.frequency); lfo2.start();
    let stopped = false;
    return (fade = 0.6) => {
      if (stopped) return; stopped = true;
      try {
        const now = ctx.currentTime;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + fade);
        src.stop(now + fade + 0.05); lfo.stop(now + fade + 0.05); lfo2.stop(now + fade + 0.05);
      } catch (e) { /* silent */ }
    };
  } catch (e) { return () => {}; }
}

export function playServo() {
  // Servo motor "wrrr" — qisqa filtrlangan burilish tovushi
  try {
    const ctx = getContext();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(130, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(210, ctx.currentTime + 0.11);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 850; f.Q.value = 7;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.13);
    o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.15);
  } catch (e) { /* silent */ }
}

export function playGeiger() {
  // Geiger hisoblagich "tik" — o'tkir qisqa click
  try {
    const ctx = getContext();
    const dur = 0.03;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3200;
    const g = ctx.createGain(); g.gain.value = 0.06;
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
  } catch (e) { /* silent */ }
}

export function playSizzle() {
  // Elektr chirsillashi — pasayuvchi bandpass shovqin (chaqmoq razryadi)
  try {
    const ctx = getContext();
    const dur = 0.5;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.5);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.14, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
  } catch (e) { /* silent */ }
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

// ===== FESTIVAL (Light Show) ovozlari =====

export function playBeat(i = 0) {
  // kick baraban
  try {
    const ctx = getContext();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(155, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.17);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.18);
  } catch (e) { /* silent */ }
  // sintezator zarbi (nota o'zgaradi)
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
  playTone(notes[i % notes.length], 0.14, 'sawtooth', 0.05);
}

export function playCheer() {
  // olomon qichqirig'i — ko'tariluvchi filtrlangan shovqin
  try {
    const ctx = getContext();
    const dur = 0.9;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
    f.frequency.setValueAtTime(650, ctx.currentTime);
    f.frequency.linearRampToValueAtTime(1500, ctx.currentTime + 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
  } catch (e) { /* silent */ }
  [523, 659, 784, 1047].forEach((fr, i) => setTimeout(() => playTone(fr, 0.4, 'sine', 0.08), i * 45));
}

export function playHollow() {
  // Jonsiz kulrang olam — bo'sh, g'amgin drone
  playTone(110, 1.3, 'sine', 0.05);
  setTimeout(() => playTone(146, 1.1, 'sine', 0.04), 220);
}

// ===== DISKO MUSIQA DVIGATELI (Light Show intro) =====
function kick(vol = 0.2) {
  try {
    const ctx = getContext();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.11);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.18);
  } catch (e) { /* silent */ }
}
function hat(vol = 0.03) {
  try {
    const ctx = getContext();
    const dur = 0.03;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
  } catch (e) { /* silent */ }
}

let musicTimer = null, musicStep = 0, musicVol = 1;
export function startMusic(bpm = 124) {
  stopMusic();
  musicStep = 0;
  const interval = 60000 / bpm / 4; // 16-lik
  const bass = [82, 82, 110, 82, 98, 98, 110, 98];
  const arp = [523, 659, 784, 988];
  musicTimer = setInterval(() => {
    const s = musicStep % 16;
    if (s % 4 === 0) kick(0.2 * musicVol);
    if (s % 2 === 1) hat(0.03 * musicVol);
    if (s % 2 === 0) playTone(bass[(s / 2) % 8], 0.18, 'sawtooth', 0.05 * musicVol);
    if (s === 6 || s === 14) playTone(arp[Math.floor(musicStep / 16) % arp.length], 0.12, 'square', 0.035 * musicVol);
    musicStep++;
  }, interval);
}
export function setMusicVolume(v) { musicVol = Math.max(0, Math.min(1, v)); }
export function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }

// ===== Seyf (Secret Door) + Theremin ovozlari =====
export function playClunk() {
  // og'ir metall qulf tovushi
  try {
    const ctx = getContext();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(120, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.09);
    g.gain.setValueAtTime(0.16, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.15);
  } catch (e) { /* silent */ }
  playTone(220, 0.05, 'square', 0.05);
}

export function playSeal() {
  // xavfli moddani idishga solib zararsizlantirish — pasayuvchi "so'rish" + tasdiq
  playTone(700, 0.18, 'sawtooth', 0.08);
  setTimeout(() => playTone(400, 0.2, 'square', 0.07), 120);
  setTimeout(() => { playTone(523, 0.25, 'sine', 0.1); playTone(784, 0.25, 'sine', 0.08); }, 320);
}

export function playBlip(freq = 1400) {
  // radar beep — qisqa tik
  playTone(freq, 0.045, 'square', 0.045);
}

export function playChime(freq = 880) {
  // toza nota qo'ng'irog'i (theremin nota tutildi)
  playTone(freq, 0.35, 'sine', 0.1);
  setTimeout(() => playTone(freq * 1.5, 0.3, 'sine', 0.06), 70);
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
