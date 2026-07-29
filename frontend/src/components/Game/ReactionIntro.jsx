// ReactionIntro — "Asteroid Zarbasi" kinematik cutscene (realistik, cross-section).
// Tungi shahar → osmondan ASTEROID tushadi → yerga urilib portlaydi (flash,
// shockwave, chang, silkinish) → XAVFLI MODDA chaqmoqday kuch bilan yer qa'riga
// kirib ketadi (yashil elektr nayzasi, tuproq yoriladi) → Electra missiyani aytadi.
// (Introda qahramon va idish yo'q — sof falokat voqeasi.)
import { useMemo, useRef, useState } from 'react';
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import PixiStage from './pixi/PixiStage';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './pixi/cityScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playThunder, playRift, playZap } from './gameAudio';

const LW = 1000, LH = 560, SURF = 300, IX = 520;
const lerp = (a, b, k) => a + (b - a) * k;

const LINES = [
  { text: "Ko'rdingmi?! Asteroid to'g'ridan-to'g'ri shahar chetiga urildi — zarbadan yer larzaga keldi!", emotion: 'worried' },
  { text: "Undan chiqqan XAVFLI modda chaqmoqday kuch bilan yer qa'riga — juda chuqurga kirib ketdi. U atrofni zaharlayapti.", emotion: 'worried' },
  { text: "Uni topib, maxsus idishga solib zararsizlantirish kerak. Buning uchun kimdir chuqurlikka tushishi shart — bu SEN, muhandis!", emotion: 'normal' },
  { text: "Platangga 2 tugma, LED va buzzer ula. 1-tugma bilan SAKRA, 2-tugma bilan EMAKLA, moddaga yetganda IKKALA tugmani BIRGA bos. Tayyormisan?", emotion: 'excited' },
];

function drawBolt(g, ytop, ybot, jitter) {
  let x = IX, y = ytop;
  const segs = Math.max(5, Math.floor((ybot - ytop) / 20));
  const pts = [[x, y]];
  for (let i = 1; i <= segs; i++) { x = IX + (Math.random() - 0.5) * jitter; y = ytop + (ybot - ytop) * (i / segs); pts.push([x, y]); }
  g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.stroke({ width: 5, color: 0x9dff6a, alpha: 0.9 });
  g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.stroke({ width: 2, color: 0xf0ffe0, alpha: 0.9 });
  // shoxchalar
  for (let i = 2; i < pts.length - 1; i += 2) { const [px, py] = pts[i]; g.moveTo(px, py).lineTo(px + (Math.random() - 0.5) * 60, py + 8 + Math.random() * 22).stroke({ width: 2, color: 0x7dff5a, alpha: 0.6 }); }
}

function buildIntroScene(app, ctlRef, onSceneDone) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.05, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const world = new Container(); app.stage.addChild(world);

  // osmon
  const sky = new Sprite(gradTexture(['#060a1a', '#0c1230', '#0a0a1e', '#080612'])); sky.x = -200; sky.y = -200; sky.width = LW + 400; sky.height = SURF + 220; world.addChild(sky);
  const moon = new Sprite(radialTexture('rgba(200,215,255,0.55)', 256)); moon.anchor.set(0.5); moon.width = moon.height = 120; moon.x = 200; moon.y = 90; world.addChild(moon);
  const starC = new Container(); world.addChild(starC); const stars = [];
  for (let i = 0; i < 70; i++) { const g = new Graphics().circle(0, 0, 0.7 + Math.random() * 1.3).fill(0xeaf3ff); g.x = Math.random() * LW; g.y = Math.random() * (SURF - 30); starC.addChild(g); stars.push({ g, b: 0.3 + Math.random() * 0.5, sp: 0.6 + Math.random() * 2, ph: Math.random() * 6.28 }); }
  // ogohlantiruvchi qizil shu'la (osmon)
  const warn = new Sprite(radialTexture('rgba(255,80,40,0.5)', 256)); warn.anchor.set(0.5); warn.width = 500; warn.height = 300; warn.x = 720; warn.y = 60; warn.alpha = 0; world.addChild(warn);

  // shahar silueti
  const city1 = makeSkyline(120, 0x0d1730, 23); city1.y = SURF - 470; city1.alpha = 0.55; world.addChild(city1);
  const city2 = makeSkyline(80, 0x111f3a, 17); city2.y = SURF - 470; city2.alpha = 0.8; world.addChild(city2);

  // yer kesimi (qatlamlar) — chuqurlik ko'rinadi
  const earth = new Graphics();
  earth.rect(-200, SURF, LW + 400, 6).fill(0x2a3446);                            // sirt chizig'i
  [[SURF, SURF + 90, 0x2a1c10], [SURF + 90, SURF + 180, 0x241a1e], [SURF + 180, LH + 40, 0x141826]].forEach(([y0, y1, col]) => { earth.rect(-200, y0, LW + 400, y1 - y0).fill(col); });
  for (let i = 0; i < 120; i++) earth.circle(Math.random() * LW, SURF + 8 + Math.random() * (LH - SURF), 2 + Math.random() * 4).fill({ color: 0x000000, alpha: 0.22 });
  world.addChild(earth);
  // kristall qatlamdagi gavharlar
  for (let i = 0; i < 12; i++) { const g = new Graphics().poly([0, -5, 3, 0, 0, 5, -3, 0]).fill([0x8ff4ff, 0x9b5de5, 0x39e06a][i % 3]); g.x = 80 + Math.random() * 840; g.y = SURF + 190 + Math.random() * 60; g.alpha = 0.5; world.addChild(g); }

  // yoriq (modda kirgan joy) + shu'la
  const crackGlow = new Sprite(radialTexture('rgba(120,255,90,0.7)', 256)); crackGlow.anchor.set(0.5); crackGlow.width = 160; crackGlow.height = 320; crackGlow.x = IX; crackGlow.y = SURF + 130; crackGlow.alpha = 0; world.addChild(crackGlow);
  const crack = new Graphics(); world.addChild(crack);
  const bolt = new Graphics(); world.addChild(bolt);

  // shockwave + asteroid
  const shock = new Graphics(); world.addChild(shock);
  const meteor = new Container(); meteor.visible = false; world.addChild(meteor);
  const mTrail = new Sprite(radialTexture('rgba(255,150,70,0.85)', 256)); mTrail.anchor.set(0.5); mTrail.width = 260; mTrail.height = 40; mTrail.rotation = 0.7; mTrail.x = 70; mTrail.y = -70; meteor.addChild(mTrail);
  const mGlow = new Sprite(radialTexture('rgba(255,190,90,0.95)', 256)); mGlow.anchor.set(0.5); mGlow.width = mGlow.height = 90; meteor.addChild(mGlow);
  meteor.addChild(new Graphics().circle(0, 0, 12).fill(0xfff2d0));

  const particles = makeParticles(world);
  // to'liq ekran flash (screen)
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xfff0d8); flash.alpha = 0; app.stage.addChild(flash);

  let t = 0, done = false, impacted = false, flashA = 0, swR = -1, boltP = 0, zapped = false, rumbleAcc = 0;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    const w = app.screen.width, h = app.screen.height;
    const sc = Math.min(w / LW, h / LH);
    world.scale.set(sc); world.x = (w - LW * sc) / 2; world.y = (h - LH * sc) / 2;
    flash.width = w; flash.height = h;
    stars.forEach((s) => { s.g.alpha = s.b * (0.4 + 0.5 * Math.sin(t * s.sp + s.ph)); });

    // ogohlantiruvchi shu'la kuchayadi
    if (t < 2.0) warn.alpha = Math.min(0.6, t / 2 * 0.6) * (0.6 + 0.4 * Math.sin(t * 8));

    // asteroid
    if (t >= 1.3 && t < 2.4 && !impacted) {
      meteor.visible = true;
      const k = (t - 1.3) / 1.1;
      meteor.x = lerp(1180, IX, k); meteor.y = lerp(-160, SURF - 6, k); meteor.scale.set(0.6 + k * 0.7);
      if (k >= 1) {
        impacted = true; meteor.visible = false; flashA = 1; swR = 0; warn.alpha = 0;
        playRift(); playThunder(); useGameStore.getState().triggerShake(18);
        for (let n = 0; n < 60; n++) particles.burst(IX, SURF, [0xff7a2a, 0x8a6a3a, 0xffb03a, 0x6a7488][n % 4], 2, 260);
      }
    }

    // impactdan keyin: modda chaqmoqday yerga kiradi
    if (impacted) {
      if (!zapped) { zapped = true; playZap(); }
      boltP += dt * 0.9;
      const ybot = SURF + Math.min(1, boltP) * (LH - SURF - 6);
      bolt.clear();
      if (boltP < 1.4) drawBolt(bolt, SURF, ybot, 26 + 20 * Math.sin(t * 20));   // yashil elektr nayza (miltillaydi)
      // yoriq izi (doimiy)
      crack.clear(); let cx = IX, cy = SURF; crack.moveTo(cx, cy);
      for (let i = 0; i < 12; i++) { cx = IX + Math.sin(i * 1.3) * 16; cy = SURF + (i / 12) * Math.min(1, boltP) * (LH - SURF); crack.lineTo(cx, cy); }
      crack.stroke({ width: 3, color: 0x7dff5a, alpha: 0.4 + 0.3 * Math.sin(t * 5) });
      crackGlow.alpha = Math.min(0.5, boltP * 0.5) * (0.7 + 0.3 * Math.sin(t * 4));
      crackGlow.height = 60 + Math.min(1, boltP) * 300;
      // yer titrashi + zarralar
      rumbleAcc += dt; if (boltP < 1.3 && rumbleAcc > 0.5) { rumbleAcc = 0; playThunder(); useGameStore.getState().triggerShake(6); }
      if (boltP < 1.4 && Math.random() < 0.4) particles.burst(IX + (Math.random() - 0.5) * 40, SURF + Math.min(1, boltP) * (LH - SURF), 0x7dff5a, 2, 90);
    }

    // flash + shockwave
    if (flashA > 0) { flashA = Math.max(0, flashA - dt * 2); flash.alpha = flashA; } else flash.alpha = 0;
    shock.clear();
    if (swR >= 0) { swR += 700 * dt; const a = Math.max(0, 1 - swR / 560); shock.circle(IX, SURF, swR).stroke({ width: 9 * a + 1, color: 0xffd0a0, alpha: a * 0.85 }); if (swR > 560) swR = -1; }

    particles.tick(dt);
    if (!done && t > 6.3) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function ReactionIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#060a12' }}>
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
            <DialogueBox name="ELECTRA" role="Qutqaruv muhandisi" lines={LINES} actionLabel="☢️ Chuqurlikka tush" onAction={onStart} accent="#ffb020" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
