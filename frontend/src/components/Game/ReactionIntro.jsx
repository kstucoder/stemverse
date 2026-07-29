// ReactionIntro — "Chuqurlik Missiyasi" to'liq kinematik voqelik.
// Asteroid krateri → yoriqdan sizib chuqurga ketgan XAVFLI MODDA → qahramon
// kostyum kiyadi (chiroq yonadi) → arqonda yer qa'riga tushadi (tuproq→tosh→
// kristall qatlamlar) → chuqurlikdagi xavfli modda va maxsus idish ko'rinadi →
// Electra missiyani to'liq tushuntiradi.
import { useMemo, useRef, useState } from 'react';
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import PixiStage from './pixi/PixiStage';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './pixi/cityScene';
import DialogueBox from './DialogueBox';
import useGameStore from '../../stores/gameStore';
import { playThunder, playBlip, playRift } from './gameAudio';

const LW = 1000;
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);

const LINES = [
  { text: "Asteroid zarbasi ortidan Yerga g'alati, XAVFLI modda tushdi — u yer qa'riga chuqur kirib ketdi va atrofni zaharlayapti.", emotion: 'worried' },
  { text: "Uni faqat maxsus idishga solib zararsizlantirish mumkin. Buning uchun kimdir chuqurlikka tushishi kerak — bu SEN, muhandis!", emotion: 'normal' },
  { text: "Yo'l xavfli: o'tkir toshlar va past tunnellar bor. Platangga 2 tugma, LED va buzzer ula.", emotion: 'normal' },
  { text: "1-tugma bilan SAKRA, 2-tugma bilan EMAKLA. Moddaga yetganda IKKALA tugmani BIRGA bosib idishga sol. Tayyormisan?", emotion: 'excited' },
];

function buildIntroScene(app, ctlRef, onSceneDone) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.0, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const backC = new Container(); app.stage.addChild(backC);
  const back = new Sprite(gradTexture(['#03040a', '#070610', '#04030a'])); backC.addChild(back);

  const world = new Container(); app.stage.addChild(world);

  // osmon (sirt ustida)
  const sky = new Sprite(gradTexture(['#0a1030', '#162150', '#0a0a20'])); sky.x = -200; sky.y = -260; sky.width = LW + 400; sky.height = 320; world.addChild(sky);
  const moon = new Sprite(radialTexture('rgba(200,215,255,0.6)', 256)); moon.anchor.set(0.5); moon.width = moon.height = 120; moon.x = 760; moon.y = -140; world.addChild(moon);
  for (let i = 0; i < 40; i++) world.addChild(new Graphics().circle(Math.random() * LW, -240 + Math.random() * 260, 0.8 + Math.random()).fill({ color: 0xeaf3ff, alpha: 0.4 + Math.random() * 0.4 }));
  const city = makeSkyline(120, 0x0d1730, 23); city.y = 360 - 470; city.alpha = 0.5; world.addChild(city);

  // yer qatlamlari (chuqurlik)
  const LAYERS = [[360, 720, 0x2a1c10], [720, 1100, 0x241a1e], [1100, 1520, 0x141826], [1520, 1720, 0x0a1410]];
  LAYERS.forEach(([y0, y1, col]) => { const g = new Graphics().rect(-200, y0, LW + 400, y1 - y0).fill(col); for (let i = 0; i < 60; i++) g.circle(-100 + Math.random() * (LW + 200), y0 + Math.random() * (y1 - y0), 2 + Math.random() * 5).fill({ color: 0x000000, alpha: 0.25 }); world.addChild(g); });
  // kristall qatlamdagi gavharlar
  for (let i = 0; i < 14; i++) { const g = new Graphics().poly([0, -6, 4, 0, 0, 6, -4, 0]).fill([0x8ff4ff, 0x9b5de5, 0x39e06a][i % 3]); g.x = 100 + Math.random() * 800; g.y = 1120 + Math.random() * 360; g.alpha = 0.6; world.addChild(g); }

  // sirt + krater
  const surface = new Graphics().rect(-200, 360, LW + 400, 20).fill(0x1a1109); world.addChild(surface);
  const crater = new Graphics().ellipse(500, 366, 130, 26).fill(0x0a0603).ellipse(500, 366, 130, 26).stroke({ width: 3, color: 0x3a2a18 }); world.addChild(crater);
  // yashil yoriq (chuqurga ketadi)
  const crack = new Graphics(); world.addChild(crack);
  const crackGlow = new Sprite(radialTexture('rgba(120,255,90,0.5)', 256)); crackGlow.anchor.set(0.5); crackGlow.width = 120; crackGlow.height = 1200; crackGlow.x = 500; crackGlow.y = 950; crackGlow.alpha = 0.3; world.addChild(crackGlow);

  // xavfli modda + idish (chuqurda)
  const hazGlow = new Sprite(radialTexture('rgba(120,255,90,0.9)', 256)); hazGlow.anchor.set(0.5); hazGlow.width = hazGlow.height = 320; hazGlow.x = 500; hazGlow.y = 1560; world.addChild(hazGlow);
  const hazard = new Graphics(); for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; hazard.poly([Math.cos(a) * 20, Math.sin(a) * 20 - 30, Math.cos(a) * 46, Math.sin(a) * 46 - 30, Math.cos(a + 0.4) * 30, Math.sin(a + 0.4) * 30 - 30]).fill(0x7dff5a); } hazard.x = 500; hazard.y = 1560; world.addChild(hazard);
  const canister = new Container(); canister.x = 620; canister.y = 1600; world.addChild(canister);
  canister.addChild(new Graphics().roundRect(-24, -54, 48, 54, 12).fill(0x1c2636).roundRect(-24, -54, 48, 54, 12).stroke({ width: 3, color: 0x39e06a }).roundRect(-28, -64, 56, 12, 6).fill(0x2a3446));

  // arqon + qahramon
  const rope = new Graphics(); world.addChild(rope);
  const hero = new Container();
  hero.addChild(new Graphics().roundRect(-11, -30, 22, 34, 8).fill(0xffb020).roundRect(-11, -30, 22, 34, 8).stroke({ width: 2, color: 0xffd76a })); // kostyum
  hero.addChild(new Graphics().roundRect(-18, -26, 9, 22, 3).fill(0x2a3446)); // ryukzak
  hero.addChild(new Graphics().roundRect(-8, 4, 7, 16, 3).fill(0x1a2130).roundRect(2, 4, 7, 16, 3).fill(0x232c40)); // oyoq
  const hHead = new Graphics().circle(0, -42, 11).fill(0x2a3446).circle(0, -42, 11).stroke({ width: 2, color: 0x59617e }); hero.addChild(hHead);
  const hVisor = new Graphics().arc(0, -42, 7, -Math.PI * 0.9, Math.PI * 0.1).fill(0x8ff4ff); hero.addChild(hVisor);
  const hLamp = new Sprite(radialTexture('rgba(255,244,200,0.4)', 256)); hLamp.anchor.set(0.5, 0); hLamp.width = 150; hLamp.height = 220; hLamp.y = -40; hLamp.alpha = 0; hero.addChild(hLamp);
  world.addChild(hero);

  const particles = makeParticles(world);

  let t = 0, done = false, camY = 300, rumbleAcc = 0, r1 = false, r2 = false;
  let heroY = 320, lampOn = 0;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    const w = app.screen.width, h = app.screen.height;
    back.width = w; back.height = h;
    const sc = Math.min(w / LW, h / 560) * 1.0;
    world.scale.set(sc);
    world.x = (w - LW * sc) / 2;

    // ssenariy fazalari
    let targetCam = 300, targetHero = 320;
    if (t < 2.2) { targetCam = 300; targetHero = 320; if (!r1 && t > 0.4) { r1 = true; playThunder(); } }             // sirt / krater
    else if (t < 3.2) { targetCam = 320; targetHero = 340; lampOn += (1 - lampOn) * Math.min(dt * 2, 1); if (t > 2.3 && t < 2.4) playBlip(900); } // kostyum/chiroq
    else if (t < 7.0) { const k = smooth((t - 3.2) / 3.8); targetCam = lerp(320, 1480, k); targetHero = lerp(340, 1500, k); rumbleAcc += dt; if (rumbleAcc > 0.9) { rumbleAcc = 0; playThunder(); useGameStore.getState().triggerShake(4); } } // tushish
    else { targetCam = 1500; targetHero = 1520; if (!r2 && t > 7.1) { r2 = true; playRift(); } }                       // xavf ko'rinadi

    camY += (targetCam - camY) * Math.min(dt * 2.5, 1);
    heroY += (targetHero - heroY) * Math.min(dt * 2.5, 1);
    world.y = h * 0.52 - camY * sc;

    hero.x = 500 + Math.sin(t * 1.5) * 4; hero.y = heroY;
    hero.rotation = Math.sin(t * 1.2) * 0.05;
    hLamp.alpha = lampOn * 0.5; hVisor.alpha = 0.6 + lampOn * 0.4;
    // arqon
    rope.clear(); rope.moveTo(500, 360).lineTo(hero.x, hero.y - 50).stroke({ width: 2, color: 0x8a94a8, alpha: 0.7 });

    // yoriq (yashil, miltillaydi)
    crack.clear(); let cy = 380; let cx = 500; crack.moveTo(cx, cy);
    for (let i = 0; i < 14; i++) { cx = 500 + Math.sin(i * 1.3 + t) * 22; cy += 80; crack.lineTo(cx, cy); }
    crack.stroke({ width: 3, color: 0x7dff5a, alpha: 0.5 + 0.3 * Math.sin(t * 4) });

    // xavf pulsi + tutun
    hazard.rotation = Math.sin(t * 1.5) * 0.2; hazard.scale.set(1 + 0.08 * Math.sin(t * 3)); hazGlow.alpha = 0.4 + 0.25 * Math.sin(t * 3);
    if (Math.random() < 0.15) particles.burst(490 + Math.random() * 20, 366, 0x6a7488, 1, 40);         // krater tutuni
    if (camY > 1000 && Math.random() < 0.2) particles.burst(500 + (Math.random() - 0.5) * 60, 1540, 0x7dff5a, 1, 60); // xavf zarralari

    particles.tick(dt);
    if (!done && t > 8.4) { done = true; onSceneDone(); }
  });

  return () => {};
}

export default function ReactionIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#03040a' }}>
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
