// 🎆 VOLTRA "Festival Sahnasi" (PixiJS Premium Edition)
// Digital Twin: bitta tugma (BTN) + LED. Har tugma bosilishi = BEAT — sahna
// prожektorlari yonadi, lazerlar otiladi, ekvalayzer sakraydi, olomon qo'l
// ko'taradi. 8 beat = 1 qo'shiq, 3 qo'shiq = shou. Win: dances_completed=3.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleStage, stageTick } from './pixi/stageScene';
import GuideCharacter from './GuideCharacter';
import useGameStore from '../../stores/gameStore';
import { playBeat, playCheer } from './gameAudio';

const BEATS_PER_SONG = 8;
const SONGS = 3;
const SONG_NAME = ['Ochilish', 'Avj nuqta', 'Final'];

const MILESTONES = {
  1: { text: 'Birinchi qo\'shiq tugadi — olomon jo\'shdi!', emotion: 'excited' },
  2: { text: 'Zo\'r ritm! Oxirgi qo\'shiq qoldi!', emotion: 'normal' },
};

export default function LightShow() {
  const serialBtn = useGameStore((s) => s.serialData.btn);
  const serialLed = useGameStore((s) => s.serialData.led);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [beats, setBeats] = useState(0);
  const [dance, setDance] = useState(0);
  const [guide, setGuide] = useState(null);
  const prevBtn = useRef(0);
  const winRef = useRef(false);
  const beatPulse = useRef(0);
  const dancePulse = useRef(0);
  const guideTimer = useRef(null);

  const ctlRef = useRef({ beatPulse: 0, dancePulse: 0, intensity: 0, songIndex: 0, ledOn: 0, connected: false });
  ctlRef.current.beatPulse = beatPulse.current;
  ctlRef.current.dancePulse = dancePulse.current;
  ctlRef.current.intensity = beats / BEATS_PER_SONG;
  ctlRef.current.songIndex = Math.min(dance, SONGS - 1);
  ctlRef.current.ledOn = serialLed;
  ctlRef.current.connected = arduinoConnected;

  // Tugma — edge-triggered: har bosish bitta beat
  useEffect(() => {
    const btn = serialBtn || 0;
    if (btn === 1 && prevBtn.current === 0 && arduinoConnected && !winRef.current) {
      beatPulse.current += 1;
      incrementScore(15);
      playBeat(beats);
      const nextBeats = beats + 1;
      if (nextBeats >= BEATS_PER_SONG) {
        dancePulse.current += 1;
        playCheer();
        const nextDance = dance + 1;
        setBeats(0);
        setDance(nextDance);
        const m = MILESTONES[nextDance];
        if (m) { setGuide(m); clearTimeout(guideTimer.current); guideTimer.current = setTimeout(() => setGuide(null), 3500); }
        if (nextDance >= SONGS) {
          winRef.current = true;
          const store = useGameStore.getState();
          if (store.onWin) store.onWin(score + 15);
        }
      } else {
        setBeats(nextBeats);
      }
    }
    prevBtn.current = btn;
  }, [serialBtn, arduinoConnected, beats, dance, score, incrementScore]);

  useEffect(() => () => clearTimeout(guideTimer.current), []);

  const build = useCallback((app) => {
    const scene = assembleStage(app);
    let t = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05);
      t += dt;
      scene.particles.tick(dt);
      stageTick(scene, dt, t, ctlRef.current);
    });
    return () => {};
  }, []);

  const panel = {
    background: 'rgba(11,17,32,0.82)', border: '1px solid rgba(155,93,229,0.2)',
    borderRadius: 12, padding: '7px 14px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace',
  };

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* Yuqori-chap: ball + qo'shiq */}
      <div className="absolute top-3 left-3 flex gap-2">
        <div style={panel}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF', textShadow: '0 0 8px rgba(155,93,229,0.5)' }}>⭐ {Math.round(score)}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>Ball</div>
        </div>
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EAF3FF' }}>{Math.min(dance, SONGS)}/{SONGS}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>QO'SHIQ</div>
        </div>
      </div>

      {/* Yuqori-o'ng: joriy qo'shiq nomi */}
      <div className="absolute top-3 right-3" style={{ ...panel, textAlign: 'center', minWidth: 96 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#c77dff', textShadow: '0 0 12px rgba(155,93,229,0.6)' }}>{SONG_NAME[Math.min(dance, SONGS - 1)]}</div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', color: '#64748b' }}>SAHNA</div>
      </div>

      {/* Past-markaz: beat progress + prompt */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, padding: '9px 16px', minWidth: 240 }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 6 }}>
          {Array.from({ length: BEATS_PER_SONG }).map((_, i) => (
            <span key={i} style={{
              width: 20, height: 8, borderRadius: 3,
              background: i < beats ? 'linear-gradient(90deg,#00eeff,#9b5de5)' : 'rgba(255,255,255,0.08)',
              boxShadow: i < beats ? '0 0 8px rgba(0,238,255,0.6)' : 'none',
            }} />
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>
          {arduinoConnected ? '🎵 Tugmani beat\'ga bosing!' : 'Platani ulang'} · {beats}/{BEATS_PER_SONG}
        </div>
      </div>

      {/* Electra izohlari */}
      {guide && (
        <div className="absolute bottom-3 left-3 flex items-end gap-2 animate-slide-up">
          <GuideCharacter emotion={guide.emotion} size={60} />
          <div style={{ ...panel, border: '1px solid rgba(155,93,229,0.35)', maxWidth: 210, marginBottom: 8, fontSize: 11.5, color: '#EAF3FF', fontFamily: 'DM Sans, sans-serif' }}>
            {guide.text}
          </div>
        </div>
      )}

      {/* Ulanish chipi */}
      {!arduinoConnected && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(155,93,229,0.3)' }}>
          <span style={{ fontSize: 11, color: '#c77dff' }}>🎆 Platani ulang — tugma bilan shouni boshqaring</span>
        </div>
      )}
    </PixiStage>
  );
}
