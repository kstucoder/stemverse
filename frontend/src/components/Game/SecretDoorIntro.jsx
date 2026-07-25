// SecretDoorIntro — "Yadro seyfga qamaladi" kinematik cutscene.
// Xronika: eshik ochiq → ikki (kattaroq, realistik) soqchi yorqin energiya
// YADROSINI ko'tarib kelib seyf ichiga qo'yadi → eshik aylanib yopiladi va
// rigellar taraslab qulflaydi → soqchilar devordagi tabloga borib LAZER to'rini
// yoqadi → Electra: endi disk-kombinatsiya bilan uni sen ochasan.
import { useMemo, useRef, useState } from 'react';
import { Container, Graphics, Sprite } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import { assembleVault } from './pixi/vaultScene';
import { radialTexture } from './pixi/cityScene';
import DialogueBox from './DialogueBox';
import { playChime, playClunk, playAlarm } from './gameAudio';

const LW = 1000, LH = 560, CX = 500, CY = 268, FY = 432;
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);

const LINES = [
  { text: "Ko'rdingmi? Ikki soqchi o'g'irlangan energiya yadrosini seyfga solib, po'lat eshikni qulfladi.", emotion: 'worried' },
  { text: "So'ng ular devordagi tabloga borib qizil lazer to'rini yoqishdi — endi seyf to'liq qo'riqlanadi.", emotion: 'worried' },
  { text: "Bu seyf disk-kombinatsiya bilan ochiladi. Platangga potensiometr, tugma, LED va buzzer ula.", emotion: 'normal' },
  { text: "Potensiometr — bu disk. Uni 3 ta maxfiy raqamga burab, har birida tugmani bos. Yadroni qaytar, agent!", emotion: 'excited' },
];

// kattaroq, realistik soqchi (~190px bo'y — seyf bilan mutanosib)
function makeGuard(tint, dir) {
  const c = new Container();
  const legL = new Graphics().roundRect(-6.5, 0, 13, 72, 6).fill(0x1a2030); legL.x = -9; legL.y = -72;
  const legR = new Graphics().roundRect(-6.5, 0, 13, 72, 6).fill(0x232c40); legR.x = 9; legR.y = -72;
  c.addChild(new Graphics().roundRect(-11, -6, 24, 10, 4).fill(0x0a0d14).roundRect(11, -6, 24, 10, 4).fill(0x0a0d14));
  c.addChild(legL, legR);
  c.addChild(new Graphics().roundRect(-23, -150, 46, 80, 12).fill(0x222c42).roundRect(-23, -150, 46, 80, 12).stroke({ width: 2, color: tint }));
  c.addChild(new Graphics().roundRect(-23, -86, 46, 9, 3).fill(0x11151f));      // kamar
  c.addChild(new Graphics().circle(-9, -120, 4).fill(tint));                    // nishon
  c.addChild(new Graphics().roundRect(-7, -160, 14, 14, 3).fill(0x2a3550));     // bo'yin
  c.addChild(new Graphics().circle(0, -172, 15).fill(0x2b3856));               // bosh
  c.addChild(new Graphics().arc(0, -172, 16, Math.PI, 2 * Math.PI).fill(0x141a2a)); // dubulg'a
  c.addChild(new Graphics().roundRect(-14, -178, 28, 9, 4).fill(0x0a1420).roundRect(-14, -178, 28, 9, 4).stroke({ width: 1, color: tint })); // vizor
  const armF = new Graphics().roundRect(0, -6, 46, 12, 6).fill(0x222c42).roundRect(0, -6, 46, 12, 6).stroke({ width: 1.5, color: tint });
  armF.y = -140; armF.x = dir * 8; if (dir < 0) armF.scale.x = -1;
  c.addChild(armF);
  return { c, legL, legR, armF };
}

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleVault(app);
  const { bg, root, doorLeaf, bolts, dial, interior, goldGlow, core, particles, lasers, laserPts, panel } = scene;

  doorLeaf.rotation = 1.15;
  bolts.forEach((b) => { b.peg.x = 30; });
  interior.alpha = 1; goldGlow.alpha = 0.45;
  if (core) core.visible = false;

  const orb = new Container();
  const oGlow = new Sprite(radialTexture('rgba(130,235,255,0.95)', 256)); oGlow.anchor.set(0.5); oGlow.width = oGlow.height = 120;
  const oCore = new Graphics().circle(0, 0, 19).fill(0xbdf5ff).circle(0, 0, 11).fill(0xffffff);
  orb.addChild(oGlow, oCore); interior.addChild(orb);

  // tablo ekrani ustidagi qizil porlash (faollashganda)
  const panelGlow = new Graphics().roundRect(-34, -46, 68, 42, 4).fill(0xff3b46); panelGlow.alpha = 0; panel.addChild(panelGlow);

  const gA = makeGuard(0x00eeff, 1), gB = makeGuard(0xff9f1c, -1);
  root.addChild(gA.c, gB.c);
  gA.c.y = gB.c.y = FY;

  let t = 0, done = false, chimed = false, alarmed = false, laserA = 0;
  const clunks = [false, false, false];

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.tweens.tick(dt);
    particles.tick(dt);

    const w = app.screen.width, h = app.screen.height;
    bg.width = w; bg.height = h;
    const scl = Math.min(w / LW, h / LH);
    root.scale.set(scl); root.x = (w - LW * scl) / 2; root.y = (h - LH * scl) / 2;

    oGlow.alpha = 0.5 + 0.2 * Math.sin(t * 5); oCore.scale.set(1 + 0.08 * Math.sin(t * 6));
    const walk = (g, on) => { const s = on ? Math.sin(t * 8) : 0; g.legL.rotation = s * 0.5; g.legR.rotation = -s * 0.5; };

    if (t < 2.6) {                       // 1) kirish
      const k = smooth(t / 2.6);
      const midX = lerp(210, 400, k);
      gA.c.x = midX - 46; gB.c.x = midX + 46;
      walk(gA, true); walk(gB, true);
      orb.x = midX - CX; orb.y = 300 - CY;
      gA.c.alpha = gB.c.alpha = 1;
    } else if (t < 4.2) {                // 2) yadroni joylash
      const k = smooth((t - 2.6) / 1.6);
      gA.c.x = 360; gB.c.x = 452; walk(gA, false); walk(gB, false);
      orb.x = lerp(400 - CX, 0, k); orb.y = lerp(300 - CY, -6, k);
      oGlow.alpha = 0.6 + k * 0.3;
      if (!chimed && k > 0.9) { chimed = true; playChime(660); particles.burst(CX, CY, 0x9adfff, 26, 210); }
    } else if (t < 6.0) {                // 3) eshik yopiladi + qulflanadi
      gA.c.x = 360; gB.c.x = 452;
      const kd = smooth(Math.min((t - 4.2) / 1.3, 1));
      doorLeaf.rotation = 1.15 * (1 - kd);
      goldGlow.alpha = 0.45 * (1 - kd);
      dial.rotation += dt * (kd < 1 ? 5 : 1);
      const kb = Math.min(Math.max((t - 5.4) / 0.5, 0), 1);
      bolts.forEach((b) => { b.peg.x = 30 * (1 - kb); });
      [5.45, 5.65, 5.85].forEach((ti, i) => { if (!clunks[i] && t > ti) { clunks[i] = true; playClunk(); } });
    } else if (t < 7.5) {                // 4) tabloga borish
      const k = smooth((t - 6.0) / 1.5);
      gA.c.x = lerp(360, 748, k); gB.c.x = lerp(452, 800, k);
      walk(gA, k < 0.98); walk(gB, k < 0.98);
    } else if (t < 8.4) {                // 5) lazerni yoqish
      gA.c.x = 748; gB.c.x = 800; walk(gA, false); walk(gB, false);
      gB.armF.rotation = -1.1;                       // tugmani bosadi
      const ka = smooth(Math.min((t - 7.5) / 0.7, 1));
      panelGlow.alpha = ka * (0.5 + 0.4 * Math.sin(t * 12));
      laserA = ka;
      if (!alarmed && t > 7.6) { alarmed = true; playAlarm(); }
    } else {                            // 6) soqchilar sahnadan chiqib ketadi
      panelGlow.alpha = 0.5 + 0.4 * Math.sin(t * 12);
      laserA = 1;
      gB.armF.rotation += (0 - gB.armF.rotation) * Math.min(dt * 6, 1);
      const k = smooth(Math.min((t - 8.4) / 1.4, 1));
      gA.c.x = lerp(748, 1160, k); gB.c.x = lerp(800, 1200, k);
      walk(gA, k < 0.98); walk(gB, k < 0.98);
      if (!done && t > 9.8) { done = true; onSceneDone(); }
    }

    // lazerlarni chizish (faollashganda)
    lasers.clear();
    if (laserA > 0.02) {
      laserPts.forEach((b, i) => {
        const wob = Math.sin(t * 1.4 + i) * 8;
        lasers.moveTo(b[0], b[1] + wob).lineTo(b[2], b[3] - wob).stroke({ width: 1.5, color: 0xff2d40, alpha: laserA * 0.5 });
        lasers.circle(b[0], b[1] + wob, 3).fill({ color: 0xff2d40, alpha: laserA });
      });
    }
  });

  return () => scene.tweens.clear();
}

export default function SecretDoorIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);

  return (
    <div className="absolute inset-0 z-30" style={{ background: '#05070d' }}>
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
            <DialogueBox name="ELECTRA" role="Maxfiy agent" lines={LINES} actionLabel="🔓 Seyfni buz" onAction={onStart} accent="#00eeff" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
