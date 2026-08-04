// PianoIntro — "Rezonans Mayog'i: Signal Kaliti" REALISTIK KINEMATIK cutscene.
// Aniq voqelik (kinodek):
//   1) Tong. Jim, vayrona shahar. Uzoqda omon qolgan chiroq JAVOBSIZ miltillaydi.
//   2) Electra o'chgan mayoqda quvvat borligini sezadi -> kamera minoraga yaqinlashadi,
//      mayoq GURILLAB yonishga urinadi (rezonatorlar chirsillab nota chiqaradi).
//   3) Lekin chastota kaliti yo'qligidan mayoq O'CHIB qoladi (muvaffaqiyatsiz).
//   4) Omon qolgan chiroq yana miltillaydi (hali kutmoqda) -> Electra bolani tayinlaydi.
// Letterbox + vignette + grain + kamera push-in + mos ovozlar. FRAME-RATE mustaqil.
import { useMemo, useRef, useState } from 'react';
import { Container, Graphics, Sprite, Texture, TilingSprite } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import { assembleResonance, resonanceTick, NOTES, TUNE, LW, LH, LANE_XS, STRIKE_Y } from './pixi/resonanceScene';
import { radialTexture } from './pixi/cityScene';
import DialogueBox from './DialogueBox';
import { playNote, playBlip, playPowerUp, playPowerDown, startWind } from './gameAudio';

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k * k * (3 - 2 * k);

const LINES = [
  { text: "Xavfli modda muhrlandi... lekin shahar jim qoldi. Qara — anavi omon qolgan hali signal beryapti, biroq unga hech kim javob bermayapti.", emotion: 'worried' },
  { text: "Kutib tur — eski rezonans mayog'ida hali quvvat bor! U hammaga signal uzata oladi, lekin o'zi yonolmayapti — chastota kaliti yo'q.", emotion: 'normal' },
  { text: "Kalit — bu maxsus melodiya. Platangda 4 tugma va buzzer bor, har biri bitta nota. Oqayotgan notalarni o'z vaqtida, to'g'ri tugma bilan chal.", emotion: 'normal' },
  { text: "Rezonans melodiyasini chalib mayoqni yoq, osmonga signal ber — hammani uyga chaqir! Tayyormisan?", emotion: 'excited' },
];

function vignetteTexture(size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const c = cv.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.32, size / 2, size / 2, size * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.72, 'rgba(0,0,0,0.32)'); g.addColorStop(1, 'rgba(4,3,8,0.92)');
  c.fillStyle = g; c.fillRect(0, 0, size, size); return Texture.from(cv);
}
function noiseTexture(size = 64) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const c = cv.getContext('2d'); const img = c.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  c.putImageData(img, 0, 0); return Texture.from(cv);
}

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleResonance(app);
  scene.laneG.visible = false; scene.strikeG.visible = false;   // o'yin yo'laklarini yashiramiz (kino)
  const ctl = { btn: 0, connected: false, mode: 'intro', resetPulse: 0 };

  // --- omon qolgan chiroq (uzoqda, javobsiz miltillaydi) ---
  const survGlow = new Sprite(radialTexture('rgba(159,232,255,0.8)', 128)); survGlow.anchor.set(0.5); survGlow.width = survGlow.height = 40; survGlow.x = 158; survGlow.y = 334; survGlow.blendMode = 'add'; scene.root.addChild(survGlow);
  const surv = new Graphics().roundRect(-2, -3, 4, 6, 1).fill(0xdff4ff); surv.x = 158; surv.y = 334; scene.root.addChild(surv);

  // --- chang zarralari (atmosfera) ---
  const softTex = radialTexture('rgba(255,240,210,0.6)', 128);
  const dust = [];
  for (let i = 0; i < 22; i++) { const s = new Sprite(softTex); s.anchor.set(0.5); s.width = s.height = 2 + Math.random() * 4; s.x = Math.random() * LW; s.y = Math.random() * LH; s.alpha = 0.05 + Math.random() * 0.12; s.blendMode = 'add'; scene.root.addChild(s); dust.push({ s, vy: -6 - Math.random() * 10, vx: 6 + Math.random() * 10, ph: Math.random() * 6.28 }); }

  // --- ekran-fazoviy kino qatlamlari ---
  const grade = new Graphics().rect(0, 0, 10, 10).fill(0x101a3a); grade.alpha = 0.26; grade.blendMode = 'multiply'; app.stage.addChild(grade);
  const warm = new Graphics().rect(0, 0, 10, 10).fill(0xffb060); warm.alpha = 0; warm.blendMode = 'add'; app.stage.addChild(warm);
  const vign = new Sprite(vignetteTexture()); vign.alpha = 0.82; app.stage.addChild(vign);
  const grain = new TilingSprite({ texture: noiseTexture(), width: 10, height: 10 }); grain.alpha = 0.05; grain.blendMode = 'add'; app.stage.addChild(grain);
  const barTop = new Graphics(); const barBot = new Graphics(); app.stage.addChild(barTop, barBot);

  const stopWind = startWind();

  let t = 0, done = false, idx = 0, survAcc = 0, survFlash = 0, warmA = 0;

  // sample (ishga tushish urinishi) — melodiyaning bir qismi chirsillab yangraydi
  const sample = [TUNE[0], TUNE[1], TUNE[2], TUNE[3]];
  const script = [
    { t: 1.7, fn: () => { playPowerUp(); warmA = 0.25; } },                                   // DETECT: quvvat
    ...sample.map((lane, i) => ({ t: 2.5 + i * 0.36, fn: () => { scene.pulseResonator(lane); playNote(NOTES[lane].freq); scene.particles.burst(LANE_XS[lane], STRIKE_Y, NOTES[lane].col, 10, 120); } })),
    { t: 4.15, fn: () => { playPowerDown(); } },                                              // FAIL: o'chadi
  ];

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    while (idx < script.length && t >= script[idx].t) { script[idx].fn(); idx++; }

    // --- minora zaryadi: 1.7-4.1 ko'tariladi (urinish), 4.15 da o'chadi (fail) ---
    let targetCharge = 0;
    if (t >= 1.7 && t < 4.15) targetCharge = lerp(12, 58, clamp01((t - 1.7) / 2.4));
    scene.charge = lerp(scene.charge, targetCharge, Math.min(dt * (t >= 4.15 ? 3.2 : 1.4), 1));
    // beam faqat urinish avjida bir lahza chirsillab, fail'da so'nadi
    if (t > 3.4 && t < 4.15) scene.beamA = 0.28 * (0.5 + 0.5 * Math.sin(t * 22));
    else scene.beamA = Math.max(0, scene.beamA - dt * 3);

    resonanceTick(scene, dt, t, ctl);

    // --- kamera push-in (minoraga) — resonanceTick layout'ini override qilamiz ---
    const w = app.screen.width, h = app.screen.height;
    const fit = Math.min(w / LW, h / LH);
    const det = smooth(clamp01((t - 1.7) / 1.9));
    let zoom = 1 + det * 0.12;
    let focusY = lerp(285, 205, det);
    if (t > 4.3) { const pull = smooth(clamp01((t - 4.3) / 1.3)); zoom = lerp(1 + 0.12, 1.05, pull); focusY = lerp(205, 240, pull); }
    const z = fit * zoom;
    scene.root.scale.set(z);
    scene.root.x = w / 2 - 500 * z; scene.root.y = h / 2 - focusY * z;

    // --- omon qolgan chiroq: javobsiz miltillaydi (blip ovozi) ---
    survAcc += dt;
    if (survAcc > 1.25) { survAcc = 0; survFlash = 1; playBlip(1500); }
    survFlash = Math.max(0, survFlash - dt * 2.2);
    surv.alpha = 0.25 + survFlash * 0.75; survGlow.alpha = 0.15 + survFlash * 0.6;

    // --- chang drift ---
    dust.forEach((d) => { d.s.x += d.vx * dt; d.s.y += d.vy * dt; d.s.alpha = (0.05 + 0.1 * (0.5 + 0.5 * Math.sin(t + d.ph))); if (d.s.y < -10) { d.s.y = LH + 10; d.s.x = Math.random() * LW; } if (d.s.x > LW + 10) d.s.x = -10; });

    // --- ekran qatlamlari layout ---
    [grade, warm].forEach((o) => { o.width = w; o.height = h; });
    vign.width = w; vign.height = h; grain.width = w; grain.height = h; grain.tilePosition.set(Math.random() * 64, Math.random() * 64);
    warmA = Math.max(0, warmA - dt * 0.25); warm.alpha = Math.min(0.22, warmA * (0.6 + 0.4 * Math.sin(t * 3)));
    const barH = h * 0.09 * smooth(clamp01(t / 0.9));
    barTop.clear().rect(0, 0, w, barH).fill(0x000000);
    barBot.clear().rect(0, h - barH, w, barH).fill(0x000000);

    if (!done && t > 5.8) { done = true; onSceneDone(); }
  });

  return () => { stopWind(0.3); };
}

export default function PianoIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#0c0916' }}>
      <PixiStage build={build} className="rounded-xl">
        {phase === 'scene' && (
          <div className="absolute top-3 right-3 pointer-events-auto">
            <button onClick={() => ctlRef.current.skip?.()} className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ fontFamily: 'Chakra Petch, monospace', color: '#94a3b8', background: 'rgba(11,17,32,0.7)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              O'tkazib yuborish ▸▸
            </button>
          </div>
        )}
        {phase === 'talk' && (
          <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-auto animate-slide-up">
            <DialogueBox name="ELECTRA" role="Signal muhandisi" lines={LINES} actionLabel="🎵 Mayoqni jonlantir" onAction={onStart} accent="#f5c518" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
