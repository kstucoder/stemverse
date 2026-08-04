// 🌱 VOLTRA "Aqlli Issiqxona" — qo'sh sensor regulyatsiya o'yini.
// Digital Twin: POT1 = Iqlim (sovutish↔isitish), POT2 = Sug'orish (quruq↔nam).
// Ob-havo drift qiladi; HARORAT (18-26°C) va NAMLIK (45-70%) ni yashil zonada
// ushlab tur -> ekin o'sadi. 60s sog'lom ushlab tursang -> hosil. Sog'liq 0 -> mag'lub.
import { useCallback, useEffect, useRef, useState } from 'react';
import PixiStage from './pixi/PixiStage';
import { assembleGreenhouse, greenhouseTick } from './pixi/greenhouseScene';
import useGameStore from '../../stores/gameStore';
import { playAlarm, playSpray, playBloom, playCheer, playHollow } from './gameAudio';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const WEATHER = { calm: '☁️ Tinch', sun: '☀️ Jazirama', cold: '❄️ Sovuq', dry: '🌬️ Quruq shamol', rain: '🌧️ Yomg\'ir' };

export default function SmartGreenhouse() {
  const pot = useGameStore((s) => s.serialData.pot);
  const pot2 = useGameStore((s) => s.serialData.pot2);
  const score = useGameStore((s) => s.score);
  const arduinoConnected = useGameStore((s) => s.arduinoConnected);

  const [hud, setHud] = useState({ temp: 22, humid: 58, growth: 0, health: 1, alive: 0, weather: 'calm' });
  const [status, setStatus] = useState('play');
  const winRef = useRef(false), loseRef = useRef(false), resetRef = useRef(0);

  const ctlRef = useRef({ pot1: 512, pot2: 512, connected: false, resetPulse: 0 });
  ctlRef.current.pot1 = arduinoConnected ? (pot ?? 512) : 512;
  ctlRef.current.pot2 = arduinoConnected ? (pot2 ?? 512) : 512;
  ctlRef.current.connected = arduinoConnected;
  ctlRef.current.resetPulse = resetRef.current;
  ctlRef.current.onAlarm = () => playAlarm();
  ctlRef.current.onSpray = () => playSpray();
  ctlRef.current.onGrow = () => playBloom();
  ctlRef.current.onWin = () => { if (winRef.current) return; winRef.current = true; setStatus('won'); playCheer(); const st = useGameStore.getState(); if (st.onWin) st.onWin(st.score + 150); };
  ctlRef.current.onLose = () => { if (loseRef.current) return; loseRef.current = true; setStatus('lost'); playHollow(); };

  useEffect(() => { resetRef.current += 1; winRef.current = false; loseRef.current = false; setStatus('play'); }, [arduinoConnected]);
  const restart = () => { resetRef.current += 1; winRef.current = false; loseRef.current = false; setStatus('play'); };

  const build = useCallback((app) => {
    const scene = assembleGreenhouse(app);
    const sim = { temp: 22, humid: 58, growth: 0, health: 1, alive: 0, irrig: 0, light: 0.7, weather: 'calm', wTimer: 5, wOff: 0, wDry: 0, wRain: 0, prevCrit: false, mile: 0, lastReset: 0 };
    let t = 0, hudAcc = 0, sprayAcc = 0;
    app.ticker.add((tk) => {
      const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
      const c = ctlRef.current;
      if (c.resetPulse !== sim.lastReset) { sim.lastReset = c.resetPulse; Object.assign(sim, { temp: 22, humid: 58, growth: 0, health: 1, alive: 0, irrig: 0, weather: 'calm', wTimer: 5, wOff: 0, wDry: 0, wRain: 0, prevCrit: false, mile: 0 }); }
      sim.light = 0.5 + 0.5 * Math.sin(t * 0.16 - 1.3);

      const active = c.connected && !winRef.current && !loseRef.current;
      if (active) {
        sim.wTimer -= dt;
        if (sim.wTimer <= 0) { sim.wTimer = 8 + Math.random() * 6; const r = Math.random(); sim.weather = r < 0.24 ? 'sun' : r < 0.44 ? 'cold' : r < 0.61 ? 'dry' : r < 0.77 ? 'rain' : 'calm'; }
        const targetTemp = 8 + (c.pot1 / 1023) * 28;                 // iqlim disk (8..36°C)
        const irrig = clamp(c.pot2 / 1023, 0, 1);                    // sug'orish
        const woT = sim.weather === 'sun' ? 8 : sim.weather === 'cold' ? -9 : 0;
        const woDry = sim.weather === 'dry' ? 26 : 0;
        const woRain = sim.weather === 'rain' ? 30 : 0;
        sim.wOff = lerp(sim.wOff, woT, Math.min(dt * 0.6, 1));
        sim.wDry = lerp(sim.wDry, woDry, Math.min(dt * 0.6, 1));
        sim.wRain = lerp(sim.wRain, woRain, Math.min(dt * 0.6, 1));
        const envTemp = targetTemp + sim.wOff + (sim.light - 0.5) * 7;
        const envHumid = 25 + irrig * 68 - sim.wDry + sim.wRain;
        sim.temp = lerp(sim.temp, envTemp, Math.min(dt * 0.5, 1));
        sim.humid = clamp(lerp(sim.humid, envHumid, Math.min(dt * 0.5, 1)), 0, 100);
        sim.irrig = irrig;

        const tOK = sim.temp >= 18 && sim.temp <= 26;
        const hOK = sim.humid >= 45 && sim.humid <= 70;
        const crit = sim.temp < 10 || sim.temp > 32 || sim.humid < 25 || sim.humid > 88;
        if (tOK && hOK) { sim.growth = clamp(sim.growth + dt / 45, 0, 1); sim.health = clamp(sim.health + dt * 0.08, 0, 1); }
        else if (crit) { sim.health = clamp(sim.health - dt * 0.11, 0, 1); }
        else { sim.health = clamp(sim.health - dt * 0.035, 0, 1); }

        if (crit && !sim.prevCrit) c.onAlarm?.(); sim.prevCrit = crit;
        if (irrig > 0.4) { sprayAcc += dt; if (sprayAcc > 0.9) { sprayAcc = 0; c.onSpray?.(); } }
        const m = Math.floor(sim.growth * 4); if (m > sim.mile) { sim.mile = m; c.onGrow?.(); }

        sim.alive += dt;
        if (sim.health <= 0) c.onLose?.();
        else if (sim.alive >= 60) c.onWin?.();
      } else { sim.irrig = 0; }

      greenhouseTick(scene, dt, t, sim);
      hudAcc += dt;
      if (hudAcc > 0.12) { hudAcc = 0; setHud({ temp: Math.round(sim.temp), humid: Math.round(sim.humid), growth: sim.growth, health: sim.health, alive: sim.alive, weather: sim.weather }); }
    });
    return () => {};
  }, []);

  const panel = { background: 'rgba(10,20,14,0.82)', border: '1px solid rgba(79,174,66,0.25)', borderRadius: 12, padding: '7px 12px', backdropFilter: 'blur(8px)', fontFamily: 'Chakra Petch, monospace' };
  const tempZone = hud.temp < 18 ? 'cold' : hud.temp > 26 ? 'hot' : 'ok';
  const humZone = hud.humid < 45 ? 'dry' : hud.humid > 70 ? 'wet' : 'ok';
  const gauge = (label, val, unit, pct, bandLo, bandHi, zone) => (
    <div style={{ ...panel, textAlign: 'center', width: 78 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: zone === 'ok' ? '#4fae42' : '#ff7a4a' }}>{val}<span style={{ fontSize: 9 }}>{unit}</span></div>
      <div style={{ position: 'relative', height: 56, width: 12, margin: '4px auto', borderRadius: 6, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: `${bandLo}%`, height: `${bandHi - bandLo}%`, width: '100%', background: 'rgba(79,174,66,0.25)' }} />
        <div style={{ position: 'absolute', bottom: 0, height: `${clamp(pct, 0, 100)}%`, width: '100%', background: zone === 'ok' ? '#4fae42' : '#ff7a4a', transition: 'height 0.15s' }} />
      </div>
      <div style={{ fontSize: 7.5, letterSpacing: '0.1em', color: '#7fa88a' }}>{label}</div>
    </div>
  );

  return (
    <PixiStage build={build} className="rounded-xl">
      {/* chap: gauge'lar */}
      <div className="absolute top-3 left-3 flex gap-2">
        {gauge('HARORAT', hud.temp, '°', ((hud.temp - 8) / 28) * 100, ((18 - 8) / 28) * 100, ((26 - 8) / 28) * 100, tempZone)}
        {gauge('NAMLIK', hud.humid, '%', hud.humid, 45, 70, humZone)}
      </div>

      {/* o'ng: ob-havo + o'sish + taymer */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
        <div style={{ ...panel, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#dfe8d8' }}>{WEATHER[hud.weather]}</div>
          <div style={{ fontSize: 7.5, letterSpacing: '0.1em', color: '#7fa88a' }}>OB-HAVO</div>
        </div>
        <div style={{ ...panel, minWidth: 128 }}>
          <div style={{ fontSize: 7.5, letterSpacing: '0.1em', color: '#7fa88a', marginBottom: 3 }}>HOSIL · {Math.round(hud.growth * 100)}% · {Math.max(0, Math.ceil(60 - hud.alive))}s</div>
          <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round(hud.growth * 100)}%`, background: 'linear-gradient(90deg,#4fae42,#a8e05a)', transition: 'width 0.2s' }} />
          </div>
          <div style={{ marginTop: 4, fontSize: 12 }}>{'💚'.repeat(Math.max(0, Math.ceil(hud.health * 3)))}{'🤍'.repeat(3 - Math.max(0, Math.ceil(hud.health * 3)))}</div>
        </div>
      </div>

      {/* pastki maslahat */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ ...panel, textAlign: 'center', minWidth: 330 }}>
        <div style={{ fontSize: 10.5, color: '#cfe0c4' }}>
          {status === 'won' ? '🌾 Hosil yetildi — omon qolganlar uchun oziq tayyor!'
            : status === 'lost' ? '🥀 Ekinlar nobud bo\'ldi — qaytadan urin!'
              : !arduinoConnected ? 'Platani ulang — POT1 iqlim, POT2 sug\'orish'
                : '🎯 Harorat va namlikni YASHIL zonada ushla — ob-havoga qarab sozla'}
        </div>
        {arduinoConnected && status === 'play' && (
          <div className="flex gap-2 justify-center mt-1.5">
            <span style={{ fontSize: 9, color: '#cfe0c4', background: 'rgba(10,20,14,0.7)', border: '1px solid rgba(79,174,66,0.2)', borderRadius: 6, padding: '3px 8px' }}>POT1 → Iqlim 🔥❄️</span>
            <span style={{ fontSize: 9, color: '#cfe0c4', background: 'rgba(10,20,14,0.7)', border: '1px solid rgba(79,174,66,0.2)', borderRadius: 6, padding: '3px 8px' }}>POT2 → Sug'orish 💧</span>
          </div>
        )}
      </div>

      {!arduinoConnected && status === 'play' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ ...panel, border: '1px solid rgba(79,174,66,0.35)' }}>
          <span style={{ fontSize: 12, color: '#4fae42' }}>🔌 Platani ulang — issiqxona iqlimini boshqar</span>
        </div>
      )}

      {(status === 'won' || status === 'lost') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(6,14,10,0.5)' }}>
          <div style={{ ...panel, textAlign: 'center', padding: '22px 30px' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>{status === 'won' ? '🌾' : '🥀'}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: status === 'won' ? '#a8e05a' : '#ff7a6a', marginBottom: 4 }}>{status === 'won' ? 'Hosil yetildi!' : 'Ekinlar nobud bo\'ldi'}</div>
            <div style={{ fontSize: 11, color: '#cfe0c4', marginBottom: 14 }}>O'sish: {Math.round(hud.growth * 100)}%</div>
            <button onClick={restart} className="px-5 py-2 rounded-lg" style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 12, color: '#0a140e', background: '#4fae42', border: 'none', cursor: 'pointer', fontWeight: 800 }}>🔄 Qaytadan</button>
          </div>
        </div>
      )}
    </PixiStage>
  );
}
