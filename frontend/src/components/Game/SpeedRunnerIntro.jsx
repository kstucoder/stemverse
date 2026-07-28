// SpeedRunnerIntro — "Tomlar bo'ylab quvish" kinematik cutscene.
// Niqobli o'g'ri o'g'irlangan yorqin energiya YADROSINI ko'tarib, tungi shaharning
// har xil tomlari bo'ylab (ko'p qavatli, past, chimnayli, suv bakli, chordoqli,
// antennali, tom bog'li) sakrab qochadi (~10 bino) → kadrdan chiqib ketadi →
// o'yinchi qahramoni tomga sakrab tushadi, hayron bo'lib atrofga qaraydi va
// foydalanuvchiga qo'l siltaydi → Electra: quvib yet!
import { useMemo, useRef, useState } from 'react';
import { Container, Graphics, Sprite } from 'pixi.js';
import PixiStage from './pixi/PixiStage';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './pixi/cityScene';
import DialogueBox from './DialogueBox';
import { playJump, playScore } from './gameAudio';

const LW = 1000, LH = 560, THX = 400, GRAV = 1750, JUMP = 470, V = 300;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const FACADE = [0x2a2436, 0x27303f, 0x33291f, 0x22303a, 0x2e2530];
const WIN_ON = [0xffd76a, 0xffe9a0, 0x8ff4ff, 0xffb35a];

function makeBuilding(x) {
  const c = new Container();
  const w = Math.round(rnd(130, 210));
  const floors = Math.floor(rnd(1, 7));
  const h = 70 + floors * 46;
  const roofY = LH - h;
  const facade = pick(FACADE);
  const g = new Graphics();
  g.rect(0, roofY, w, h).fill(facade).rect(0, roofY, w, h).stroke({ width: 1.5, color: 0x0a0d14, alpha: 0.7 });
  g.rect(0, roofY, w, 6).fill({ color: 0x3a4658, alpha: 0.7 });           // parapet
  // derazalar (qavatlar bo'yicha)
  const cols = Math.max(2, Math.floor((w - 16) / 34));
  for (let f = 0; f < floors; f++) for (let cc = 0; cc < cols; cc++) {
    const wx = 12 + cc * ((w - 20) / cols), wy = roofY + 20 + f * 46;
    const on = Math.random() < 0.5;
    g.roundRect(wx, wy, 18, 24, 2).fill(on ? pick(WIN_ON) : 0x0e131d);
    if (on) g.roundRect(wx, wy, 18, 24, 2).stroke({ width: 1, color: 0xffe9a0, alpha: 0.3 });
    g.rect(wx, wy + 11, 18, 1.5).fill({ color: 0x0a0d14, alpha: 0.5 });
  }
  c.addChild(g);

  // tom bezaklari (har xil tur)
  const type = pick(['ac', 'tank', 'attic', 'chimney', 'antenna', 'garden', 'laundry']);
  let smoke = null;
  const d = new Graphics();
  if (type === 'ac') {
    for (let i = 0; i < 2 + Math.floor(w / 90); i++) { const bx = 16 + i * 46; d.roundRect(bx, roofY - 16, 30, 16, 2).fill(0x3d4656).roundRect(bx, roofY - 16, 30, 16, 2).stroke({ width: 1, color: 0x59617e }); d.rect(bx + 6, roofY - 13, 18, 2).fill(0x1a2030); }
  } else if (type === 'tank') {
    const tx = w * 0.5; d.rect(tx - 20, roofY - 14, 40, 14).fill(0x2a3346); d.moveTo(tx - 22, roofY - 14).lineTo(tx - 18, roofY - 44).lineTo(tx + 18, roofY - 44).lineTo(tx + 22, roofY - 14).fill(0x4a3a2a); d.ellipse(tx, roofY - 44, 22, 7).fill(0x5a4632).ellipse(tx, roofY - 44, 22, 7).stroke({ width: 1, color: 0x2a1f12 }); for (let i = 0; i < 4; i++) d.rect(tx + 18, roofY - 40 + i * 8, 8, 1.5).fill(0x59617e); // ladder
  } else if (type === 'attic') {
    const ax = w * 0.5; d.moveTo(ax - 40, roofY).lineTo(ax, roofY - 40).lineTo(ax + 40, roofY).fill(0x3a2a22); d.moveTo(ax - 40, roofY).lineTo(ax, roofY - 40).lineTo(ax + 40, roofY).stroke({ width: 2, color: 0x1a120c }); d.roundRect(ax - 9, roofY - 26, 18, 18, 2).fill(0xffdf7a); d.roundRect(ax - 9, roofY - 26, 18, 18, 2).stroke({ width: 1.5, color: 0xffe9a0, alpha: 0.5 }); // oshxona chirog'i
  } else if (type === 'chimney') {
    const chx = w * 0.62; d.rect(chx, roofY - 40, 20, 40).fill(0x4a2f22).rect(chx, roofY - 40, 20, 40).stroke({ width: 1, color: 0x2a1a12 }); d.rect(chx - 3, roofY - 44, 26, 6).fill(0x3a241a); smoke = { x: chx + 10, y: roofY - 44 };
  } else if (type === 'antenna') {
    const px = w * 0.5; d.moveTo(px, roofY).lineTo(px, roofY - 54).stroke({ width: 2, color: 0x59617e }); for (let i = 0; i < 3; i++) d.moveTo(px - 10, roofY - 40 + i * 10).lineTo(px + 10, roofY - 40 + i * 10).stroke({ width: 1.5, color: 0x59617e }); d.arc(px + 24, roofY - 12, 12, Math.PI * 1.1, Math.PI * 1.9).fill(0x3d4656); d.moveTo(px + 24, roofY - 12).lineTo(px + 24, roofY).stroke({ width: 2, color: 0x59617e }); // dish
  } else if (type === 'garden') {
    for (let i = 0; i < w / 18; i++) d.moveTo(4 + i * 18, roofY).lineTo(4 + i * 18, roofY - 8).stroke({ width: 1, color: 0x3a4658 }); // railing
    for (let i = 0; i < 3 + Math.floor(w / 80); i++) { const gx = 20 + i * 44; d.roundRect(gx, roofY - 10, 14, 10, 2).fill(0x5a3a22); d.circle(gx + 7, roofY - 14, 6).fill(0x2f9e4f); }
  } else { // laundry
    d.moveTo(14, roofY).lineTo(14, roofY - 34).stroke({ width: 2, color: 0x3a4658 }); d.moveTo(w - 14, roofY).lineTo(w - 14, roofY - 34).stroke({ width: 2, color: 0x3a4658 }); d.moveTo(14, roofY - 30).quadraticCurveTo(w / 2, roofY - 20, w - 14, roofY - 30).stroke({ width: 1, color: 0x8a94a8 }); for (let i = 0; i < 4; i++) { const lx = 30 + i * (w - 60) / 3; d.roundRect(lx, roofY - 28, 12, 18, 2).fill(pick([0xff6b8a, 0x7fd0ff, 0xffe08a, 0x9adf9a])); }
  }
  c.addChild(d);
  return { c, w, h, roofY, type, smoke };
}

function makeThief() {
  const c = new Container();
  const trail = new Graphics(); c.addChild(trail);
  const legB = new Graphics().roundRect(-4, 0, 8, 22, 3).fill(0x171b26); legB.y = -6;
  const legF = new Graphics().roundRect(-4, 0, 8, 22, 3).fill(0x222838); legF.y = -6;
  const body = new Graphics().roundRect(-11, -40, 22, 36, 7).fill(0x1a1f2c).roundRect(-11, -40, 22, 36, 7).stroke({ width: 1.5, color: 0x3a1f3a });
  const hood = new Graphics().moveTo(-12, -38).quadraticCurveTo(0, -60, 12, -38).lineTo(9, -30).quadraticCurveTo(0, -46, -9, -30).fill(0x241426);
  const head = new Graphics().circle(0, -46, 9).fill(0x2a2036);
  const mask = new Graphics().rect(-9, -49, 18, 6).fill(0x0a0d14).rect(-7, -48, 4, 3).fill(0xff3b6a).rect(3, -48, 4, 3).fill(0xff3b6a);
  const armF = new Graphics().roundRect(0, -3, 20, 7, 3).fill(0x1a1f2c); armF.y = -34; armF.x = 6;
  // o'g'irlangan yadro
  const orb = new Container(); orb.x = 30; orb.y = -34;
  const oGlow = new Sprite(radialTexture('rgba(120,235,255,0.95)', 128)); oGlow.anchor.set(0.5); oGlow.width = oGlow.height = 54;
  const oCore = new Graphics().circle(0, 0, 10).fill(0xbdf5ff).circle(0, 0, 5).fill(0xffffff);
  orb.addChild(oGlow, oCore);
  c.addChild(legB, legF, body, armF, orb, hood, head, mask);
  return { c, legB, legF, armF, orb, oGlow, trail };
}

function makeHero() {
  const c = new Container();
  const legB = new Graphics().roundRect(-3.5, 0, 7, 20, 3).fill(0x0a9fd8); legB.y = -6;
  const legF = new Graphics().roundRect(-3.5, 0, 7, 20, 3).fill(0x00eeff); legF.y = -6;
  const body = new Graphics().roundRect(-9, -36, 18, 32, 6).fill(0x00d0ff).roundRect(-9, -36, 18, 32, 6).stroke({ width: 1.5, color: 0x7ff4ff });
  const arm = new Graphics().roundRect(-2.5, 0, 5, 17, 2.5).fill(0x00b8e6); arm.y = -34; arm.x = 4;
  const head = new Graphics().circle(0, -46, 8).fill(0xeaf3ff).circle(0, -46, 8).stroke({ width: 1.5, color: 0x00eeff });
  const glow = new Sprite(radialTexture('rgba(0,238,255,0.5)', 128)); glow.anchor.set(0.5); glow.width = glow.height = 70; glow.y = -24;
  // hayrat "!" pufakchasi
  const bubble = new Container(); bubble.y = -78; bubble.alpha = 0;
  bubble.addChild(new Graphics().roundRect(-13, -16, 26, 26, 8).fill(0xffffff).moveTo(-4, 8).lineTo(4, 8).lineTo(0, 15).fill(0xffffff));
  bubble.addChild(new Graphics().rect(-2.5, -12, 5, 13, 2).fill(0xff2d55).circle(0, 5, 2.6).fill(0xff2d55));
  c.addChild(glow, legB, legF, body, arm, head, bubble);
  return { c, legB, legF, arm, head, bubble };
}

function buildIntroScene(app, ctlRef, onSceneDone) {
  app.stage.filters = null;
  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#050a18', '#0a1230', '#161a40', '#0a0d1c'])); skyC.addChild(sky);
  const starC = new Container(); skyC.addChild(starC);
  const stars = [];
  for (let i = 0; i < 80; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.3).fill(0xeaf3ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random() * 0.5, b: 0.3 + Math.random() * 0.5, sp: 0.6 + Math.random() * 2, ph: Math.random() * 6.28 }); }
  const moon = new Sprite(radialTexture('rgba(190,215,255,0.55)', 256)); moon.anchor.set(0.5); moon.width = moon.height = 150; skyC.addChild(moon);

  const root = new Container(); app.stage.addChild(root);
  // uzoq parallaks skyline
  const far = new Container(); root.addChild(far);
  for (let k = 0; k < 3; k++) { const s = makeSkyline(150, 0x0d1730, 23); s.y = 0; s.x = k * LW; far.addChild(s); }

  const cityLayer = new Container(); root.addChild(cityLayer);
  const particles = makeParticles(root);

  // binolar zanjiri
  const builds = [];
  let cursor = -120;
  const addBuild = (x) => { const b = makeBuilding(x); b.x = x; b.c.x = x; cityLayer.addChild(b.c); builds.push(b); return b; };
  while (cursor < LW + 400) { const b = addBuild(cursor); cursor += b.w + rnd(38, 74); }

  const thief = makeThief(); thief.c.x = THX; root.addChild(thief.c);
  let ty = builds[0].roofY, tvy = 0, grounded = true;

  const hero = makeHero(); hero.c.visible = false; root.addChild(hero.c);

  let t = 0, done = false, passed = 0, phase = 'chase', farScroll = 0, exitT = 0, heroLandY = 0, heroPhaseT = 0, jumpedFor = null;
  let smokeAcc = 0;

  ctlRef.current.skip = () => { if (done) return; done = true; onSceneDone(); };

  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05); t += dt;
    const w = app.screen.width, h = app.screen.height;
    sky.width = w; sky.height = h;
    const sc = Math.min(w / LW, h / LH);
    root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
    moon.x = w * 0.8; moon.y = h * 0.24;
    stars.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)); });
    particles.tick(dt);

    const scrolling = phase === 'chase' || phase === 'exit';
    if (scrolling) {
      farScroll = (farScroll + V * 0.18 * dt) % LW;
      far.children.forEach((s, i) => { s.x = i * LW - farScroll; });
      builds.forEach((b) => { b.x -= V * dt; b.c.x = b.x; });
      // recycle
      if (builds[0].x + builds[0].w < -140) {
        const old = builds.shift(); old.c.destroy({ children: true });
        const rightmost = builds[builds.length - 1];
        const nb = addBuild(rightmost.x + rightmost.w + rnd(40, 78));
        passed++;
      }
      // chimney tutun
      smokeAcc += dt;
      if (smokeAcc > 0.12) { smokeAcc = 0; builds.forEach((b) => { if (b.smoke && b.x > 0 && b.x < LW) particles.burst(b.x + b.smoke.x, b.smoke.y, 0x6a7488, 2, 26); }); }
    }

    // o'g'ri fizikasi (chase/exit)
    if (phase === 'chase' || phase === 'exit') {
      const under = builds.find((b) => b.x <= THX && THX <= b.x + b.w);
      const groundY = under ? under.roofY : LH + 200;
      if (grounded && under && THX > under.x + under.w - 52 && jumpedFor !== under) { tvy = -JUMP; grounded = false; jumpedFor = under; playJump(); }
      tvy += GRAV * dt; ty += tvy * dt;
      if (under && tvy > 0 && ty >= under.roofY) { ty = under.roofY; tvy = 0; grounded = true; }
      thief.c.y = ty;
      const run = grounded ? Math.sin(t * 16) : 0.4;
      thief.legF.rotation = run * 0.7; thief.legB.rotation = -run * 0.7;
      thief.oGlow.alpha = 0.5 + 0.25 * Math.sin(t * 8);
      // yadro izi
      thief.trail.clear(); for (let i = 1; i <= 4; i++) thief.trail.circle(30 - i * 12, -34, 8 - i * 1.5).fill({ color: 0x7fd0ff, alpha: 0.12 / i });

      if (phase === 'chase' && passed >= 9) { phase = 'exit'; }
      if (phase === 'exit') { thief.c.x += 260 * dt; if (thief.c.x > LW + 100 && !done) { phase = 'heroIn'; hero.c.visible = true; hero.c.x = 470; hero.c.y = -60; heroLandY = (builds.find((b) => b.x <= 470 && 470 <= b.x + b.w) || builds[0]).roofY; } }
    }

    // qahramon tushishi
    if (phase === 'heroIn') {
      hero.c.y += (heroLandY - hero.c.y) * Math.min(dt * 6, 1);
      if (Math.abs(hero.c.y - heroLandY) < 2) { hero.c.y = heroLandY; phase = 'react'; heroPhaseT = 0; particles.burst(470, heroLandY, 0xbfe9ff, 16, 130); playScore(); }
    }
    // qahramon hayrati + qo'l siltashi
    if (phase === 'react') {
      heroPhaseT += dt;
      hero.bubble.alpha = Math.min(1, heroPhaseT * 3) * (heroPhaseT < 1.2 ? 1 : Math.max(0, 1 - (heroPhaseT - 1.2)));
      if (heroPhaseT < 0.9) { hero.head.x = Math.sin(t * 3) * 2; hero.arm.rotation = 0.2; }   // atrofga qaraydi
      else { hero.c.scale.x = 1; hero.arm.rotation = -2.1 + Math.sin(t * 12) * 0.35; hero.head.x = 0; } // qo'l siltaydi
      if (!done && heroPhaseT > 2.6) { done = true; onSceneDone(); }
    }
  });

  return () => {};
}

const LINES = [
  { text: "Ko'rdingmi?! Niqobli o'g'ri energiya yadrosini o'g'irlab, tomlar bo'ylab qochib ketdi!", emotion: 'worried' },
  { text: "U juda tez — bir necha bino ustidan sakrab o'tdi va ko'zdan g'oyib bo'ldi. Uni to'xtatishimiz kerak!", emotion: 'worried' },
  { text: "Sen bizning eng chaqqon yuguruvchimizsan. Platangga potensiometr va tugmani ula — POT tezlik, tugma sakrash.", emotion: 'normal' },
  { text: "Tomlar bo'ylab quvib, 1000 metrda o'g'rini tut va yadroni qaytar! Tayyormisan?", emotion: 'excited' },
];

export default function SpeedRunnerIntro({ onStart }) {
  const [phase, setPhase] = useState('scene');
  const ctlRef = useRef({});
  const build = useMemo(() => (app) => buildIntroScene(app, ctlRef, () => setPhase('talk')), []);
  return (
    <div className="absolute inset-0 z-30" style={{ background: '#050a18' }}>
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
            <DialogueBox name="ELECTRA" role="Poyga muhandisi" lines={LINES} actionLabel="🏃 Quvib yet" onAction={onStart} accent="#00eeff" />
          </div>
        )}
      </PixiStage>
    </div>
  );
}
