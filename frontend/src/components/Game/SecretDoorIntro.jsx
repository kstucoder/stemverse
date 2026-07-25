// SecretDoorIntro — "Yadro seyfga qamaladi" kinematik cutscene.
// Xronika: seyf eshigi ochiq turadi → ikki soqchi yorqin energiya YADROSINI
// ko'tarib kelib seyf ichiga qo'yadi → orqaga chekinadi → po'lat eshik aylanib
// yopiladi, rigellar taraslab qulflaydi → Electra: endi uni sen ochib olasan.
import { useMemo, useRef, useState } from 'react';
import { Container, Graphics, Sprite } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import { assembleVault } from './pixi/vaultScene';
import { radialTexture } from './pixi/cityScene';
import DialogueBox from './DialogueBox';
import { playChime, playClunk, playAlarm } from './gameAudio';

const LW = 1000, LH = 560, CX = 500, CY = 268;
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);

const LINES = [
  { text: "Ko'rdingmi? Ikki soqchi o'g'irlangan energiya yadrosini seyfga solib, po'lat eshikni qulfladi.", emotion: 'worried' },
  { text: "Bu yadro shaharga tegishli — uni qaytarib olishimiz shart. Ammo seyf qizil lazerlar bilan qo'riqlanadi.", emotion: 'worried' },
  { text: "Seyfni faqat maxfiy kod ochadi. Platangga tugma, LED va buzzer ula — bu kod kiritish pultimiz.", emotion: 'normal' },
  { text: "Tugmani 5 marta to'g'ri bos — rigellar ochilib, eshik ochiladi va yadroni qaytarib olamiz. Tayyormisan, agent?", emotion: 'excited' },
];

function makeGuard(tint) {
  const c = new Container();
  const legL = new Graphics().roundRect(-2, 0, 4.2, 19, 2).fill(0x0d1220); legL.x = -4; legL.y = -4;
  const legR = new Graphics().roundRect(-2, 0, 4.2, 19, 2).fill(0x11182a); legR.x = 4; legR.y = -4;
  const body = new Graphics().roundRect(-9, -32, 18, 28, 5).fill(0x1a2236).roundRect(-9, -32, 18, 28, 5).stroke({ width: 1.5, color: tint });
  const arm = new Graphics().roundRect(0, -2, 18, 4.5, 2).fill(0x223049); arm.y = -26;
  const head = new Graphics().circle(0, -40, 6.5).fill(0x223049).circle(0, -40, 6.5).stroke({ width: 1.2, color: tint });
  c.addChild(legL, legR, body, arm, head);
  return { c, legL, legR };
}

function buildIntroScene(app, ctlRef, onSceneDone) {
  const scene = assembleVault(app);
  const { bg, root, doorLeaf, bolts, dial, interior, goldGlow, core, particles } = scene;

  // boshlang'ich holat: eshik OCHIQ, rigellar ichkariga tortilgan, ichki ko'rinadi
  doorLeaf.rotation = 1.15;
  bolts.forEach((b) => { b.peg.x = 30; });
  interior.alpha = 1;
  goldGlow.alpha = 0.45;
  if (core) core.visible = false; // built-in yadro o'rniga olib kelinadigan yadro

  // olib kelinadigan yorqin yadro (interior farzandi — eshik ortida qoladi)
  const orb = new Container();
  const oGlow = new Sprite(radialTexture('rgba(130,235,255,0.95)', 256)); oGlow.anchor.set(0.5); oGlow.width = oGlow.height = 110;
  const oCore = new Graphics().circle(0, 0, 17).fill(0xbdf5ff).circle(0, 0, 10).fill(0xffffff);
  orb.addChild(oGlow, oCore);
  interior.addChild(orb);

  // ikki soqchi (eng ustki qatlam)
  const gA = makeGuard(0x00eeff), gB = makeGuard(0xff9f1c);
  root.addChild(gA.c, gB.c);

  let t = 0, done = false, chimed = false;
  const clunks = [false, false, false];

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);
    t += dt;
    scene.tweens.tick(dt);
    particles.tick(dt);

    // layout (vaultTick chaqirmaymiz — hammasi qo'lda boshqariladi)
    const w = app.screen.width, h = app.screen.height;
    bg.width = w; bg.height = h;
    const scl = Math.min(w / LW, h / LH);
    root.scale.set(scl); root.x = (w - LW * scl) / 2; root.y = (h - LH * scl) / 2;

    oGlow.alpha = 0.5 + 0.2 * Math.sin(t * 5);
    oCore.scale.set(1 + 0.08 * Math.sin(t * 6));

    // ---- 1) kirish (0-2.4): soqchilar yadroni ko'tarib keladi ----
    if (t < 2.4) {
      const k = smooth(t / 2.4);
      const midX = lerp(215, 405, k);
      const step = Math.sin(t * 8);
      gA.c.x = midX - 30; gB.c.x = midX + 30; gA.c.y = gB.c.y = 432;
      gA.legL.rotation = step * 0.6; gA.legR.rotation = -step * 0.6;
      gB.legL.rotation = -step * 0.6; gB.legR.rotation = step * 0.6;
      orb.x = midX - CX; orb.y = 388 - CY;
      gA.c.alpha = gB.c.alpha = 1;
    }
    // ---- 2) joylash (2.4-3.9): yadro seyf markaziga ko'tariladi ----
    else if (t < 3.9) {
      const k = smooth((t - 2.4) / 1.5);
      gA.c.x = 375; gB.c.x = 435; gA.legL.rotation = gA.legR.rotation = gB.legL.rotation = gB.legR.rotation = 0;
      orb.x = lerp(405 - CX, 0, k); orb.y = lerp(388 - CY, -6, k);
      oGlow.alpha = 0.6 + k * 0.3;
      if (!chimed && k > 0.9) { chimed = true; playChime(660); particles.burst(CX, CY, 0x9adfff, 24, 200); }
    }
    // ---- 3) chekinish (3.9-4.9) ----
    else if (t < 4.9) {
      const k = smooth((t - 3.9) / 1.0);
      gA.c.x = lerp(375, 250, k); gB.c.x = lerp(435, 320, k);
      gA.c.alpha = gB.c.alpha = 1 - k * 0.85;
      const step = Math.sin(t * 8);
      gA.legL.rotation = step * 0.5; gA.legR.rotation = -step * 0.5;
      gB.legL.rotation = -step * 0.5; gB.legR.rotation = step * 0.5;
    }
    // ---- 4) qulflash (4.9-7.0): eshik yopiladi + rigellar taraslaydi ----
    else {
      gA.c.alpha = gB.c.alpha = 0.15;
      const kd = smooth(Math.min((t - 4.9) / 1.3, 1));
      doorLeaf.rotation = 1.15 * (1 - kd);
      goldGlow.alpha = 0.45 * (1 - kd);
      dial.rotation += dt * (kd < 1 ? 5 : 1.5);
      // eshik yopilgach rigellar ichkariga taraslaydi
      const kb = Math.min(Math.max((t - 6.1) / 0.7, 0), 1);
      bolts.forEach((b) => { b.peg.x = 30 * (1 - kb); });
      // qulf tovushlari
      [6.15, 6.4, 6.65].forEach((ti, i) => { if (!clunks[i] && t > ti) { clunks[i] = true; playClunk(); } });
      if (!done && t > 7.0) { done = true; playAlarm(); onSceneDone(); }
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
