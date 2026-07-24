// colorScene — VOLTRA "Kroma Rang Forjasi" PixiJS olami.
// 3 ta potensiometr (A0/A1/A2) → R/G/B kanallari → markaziy kristallda
// yorug'lik aralashadi. Suzuvchi maqsad-kristall rangiga moslashtirasan.
// Energy City / Traffic bilan bir xil vizual til: glow, bloom, particle.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';
import { createTweens } from './tween';

export const LW = 1000;
export const LH = 560;

const CX = 500, CY = 250, CS = 92;          // markaziy kristall
const TX = 500, TY = 96, TS = 46;           // maqsad-kristall
const EMIT = [                               // R/G/B emitterlar (past)
  { x: 322, color: 0xff3b3b, key: 'r' },
  { x: 500, color: 0x39e06a, key: 'g' },
  { x: 678, color: 0x3b82ff, key: 'b' },
];
const EMIT_Y = 486;

function clamp255(v) { return Math.max(0, Math.min(255, Math.round(v || 0))); }
export function rgbHex(r, g, b) { return (clamp255(r) << 16) | (clamp255(g) << 8) | clamp255(b); }

/* olmos/kristall shakli (oq — tint bilan ranglanadi) */
function makeCrystal(s) {
  const g = new Graphics();
  g.poly([0, -s, s * 0.72, -s * 0.18, s * 0.5, s, -s * 0.5, s, -s * 0.72, -s * 0.18]).fill(0xffffff);
  // qirralar (ochroq tuslar)
  g.poly([0, -s, s * 0.72, -s * 0.18, 0, s * 0.05]).fill({ color: 0xffffff, alpha: 0.55 });
  g.poly([0, -s, -s * 0.72, -s * 0.18, 0, s * 0.05]).fill({ color: 0xffffff, alpha: 0.8 });
  g.poly([0, s * 0.05, s * 0.5, s, -s * 0.5, s]).fill({ color: 0xffffff, alpha: 0.4 });
  g.stroke({ width: 1.5, color: 0xffffff, alpha: 0.9 });
  return g;
}

export function assembleForge(app) {
  const tweens = createTweens();
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.5, bloomScale: 1.0, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  // osmon
  const skyC = new Container();
  app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#0a0618', '#120a2a', '#0a0a1e', '#05060f']));
  skyC.addChild(sky);

  const starC = new Container();
  skyC.addChild(starC);
  const stars = [];
  for (let i = 0; i < 80; i++) {
    const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.5).fill(0xeaf3ff);
    starC.addChild(g);
    stars.push({ g, fx: Math.random(), fy: Math.random(), b: 0.4 + Math.random() * 0.5, sp: 0.6 + Math.random() * 2, ph: Math.random() * 6.28 });
  }

  // olam
  const root = new Container();
  app.stage.addChild(root);

  // markaziy aura (joriy rangga bo'yaladi)
  const aura = new Sprite(radialTexture('rgba(255,255,255,0.5)', 512));
  aura.anchor.set(0.5);
  aura.width = aura.height = 620;
  aura.x = CX; aura.y = CY;
  aura.alpha = 0.18;
  root.addChild(aura);

  // yer platformasi + reflektor halqa
  const dais = new Graphics()
    .ellipse(CX, 470, 260, 40).fill({ color: 0x141026, alpha: 0.9 })
    .ellipse(CX, 470, 260, 40).stroke({ width: 2, color: 0x2a2350, alpha: 0.6 });
  root.addChild(dais);

  // R/G/B nurlari (emitter → kristall), oq + tint
  const beams = EMIT.map((e) => {
    const g = new Graphics()
      .poly([e.x - 16, EMIT_Y, e.x + 16, EMIT_Y, CX + 10, CY + CS * 0.4, CX - 10, CY + CS * 0.4])
      .fill(0xffffff);
    g.tint = e.color;
    g.alpha = 0;
    root.addChild(g);
    return { g, key: e.key, color: e.color };
  });

  // emitter tugunlari
  const nodes = EMIT.map((e) => {
    const c = new Container();
    c.x = e.x; c.y = EMIT_Y;
    const glow = new Sprite(radialTexture('rgba(255,255,255,0.7)', 128));
    glow.anchor.set(0.5); glow.width = glow.height = 60; glow.tint = e.color; glow.alpha = 0.2;
    const base = new Graphics().circle(0, 0, 13).fill(0x0c1020).circle(0, 0, 13).stroke({ width: 2, color: e.color });
    const core = new Graphics().circle(0, 0, 8).fill(0xffffff); core.tint = e.color;
    c.addChild(glow, base, core);
    root.addChild(c);
    return { c, glow, core, key: e.key, color: e.color };
  });

  // moslik halqasi (markaziy kristall atrofida)
  const ring = new Graphics();
  ring.x = CX; ring.y = CY;
  root.addChild(ring);

  // markaziy kristall + glow
  const cGlow = new Sprite(radialTexture('rgba(255,255,255,0.65)', 512));
  cGlow.anchor.set(0.5); cGlow.width = cGlow.height = 360; cGlow.x = CX; cGlow.y = CY;
  root.addChild(cGlow);
  const crystal = makeCrystal(CS);
  crystal.x = CX; crystal.y = CY;
  root.addChild(crystal);

  const particles = makeParticles(root);

  // maqsad-kristall + halo
  const tHalo = new Sprite(radialTexture('rgba(255,255,255,0.6)', 256));
  tHalo.anchor.set(0.5); tHalo.width = tHalo.height = 150; tHalo.x = TX; tHalo.y = TY;
  root.addChild(tHalo);
  const targetCrystal = makeCrystal(TS);
  targetCrystal.x = TX; targetCrystal.y = TY;
  root.addChild(targetCrystal);

  return {
    app, tweens, particles,
    skyC, sky, starC, stars,
    root, aura, beams, nodes, ring, cGlow, crystal, tHalo, targetCrystal,
    lastPulse: 0,
  };
}

// ctl = { r, g, b, target:{r,g,b}, similarity(0..1), connected, pulse }
export function forgeTick(scene, dt, t, ctl) {
  const { app, root, sky, starC, stars, aura, beams, nodes, ring, cGlow, crystal, tHalo, targetCrystal, particles } = scene;
  const w = app.screen.width, h = app.screen.height;

  // layout
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc);
  root.x = (w - LW * sc) / 2;
  root.y = (h - LH * sc) / 2;

  stars.forEach((s) => {
    s.g.x = s.fx * w; s.g.y = s.fy * h;
    s.g.alpha = s.b * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
  });

  const r = clamp255(ctl.r), g = clamp255(ctl.g), b = clamp255(ctl.b);
  const cur = rgbHex(r, g, b);
  const tgt = rgbHex(ctl.target?.r, ctl.target?.g, ctl.target?.b);
  const sim = Math.max(0, Math.min(1, ctl.similarity || 0));

  // markaziy kristall
  crystal.tint = cur;
  crystal.rotation = Math.sin(t * 0.5) * 0.08;
  crystal.scale.set(1 + 0.03 * Math.sin(t * 2.4));
  cGlow.tint = cur;
  cGlow.alpha = 0.35 + 0.15 * Math.sin(t * 2.4);
  aura.tint = cur;
  aura.alpha = 0.12 + 0.08 * Math.sin(t * 1.6);

  // R/G/B nurlari
  const vals = { r, g, b };
  beams.forEach((bm) => {
    const v = vals[bm.key] / 255;
    bm.g.alpha = 0.12 + v * 0.5;
  });
  nodes.forEach((nd) => {
    const v = vals[nd.key] / 255;
    nd.glow.alpha = 0.15 + v * 0.7;
    nd.core.scale.set(0.7 + v * 0.6);
  });

  // maqsad-kristall
  targetCrystal.tint = tgt;
  targetCrystal.rotation = -Math.sin(t * 0.6) * 0.1;
  tHalo.tint = tgt;
  tHalo.alpha = 0.35 + 0.15 * Math.sin(t * 1.8);

  // moslik halqasi
  const ringColor = sim > 0.9 ? 0x39e06a : sim > 0.6 ? 0xffc21a : 0xff5a5a;
  ring.clear();
  ring.circle(0, 0, 132).stroke({ width: 4, color: 0xffffff, alpha: 0.06 });
  ring.arc(0, 0, 132, -Math.PI / 2, -Math.PI / 2 + Math.max(0.001, sim) * Math.PI * 2)
    .stroke({ width: 6, color: ringColor, alpha: 0.9 });

  // moslik yaqin bo'lsa kristall atrofida uchqunlar
  if (sim > 0.9 && Math.random() < 0.25) {
    particles.burst(CX + (Math.random() - 0.5) * 60, CY + (Math.random() - 0.5) * 60, cur, 3, 120);
  }

  // g'alaba pulsi (component pulse hisoblagichni oshiradi)
  if (ctl.pulse !== scene.lastPulse) {
    scene.lastPulse = ctl.pulse;
    particles.burst(CX, CY, cur, 70, 260);
    scene.tweens.add({ duration: 0.5, update: (k) => { cGlow.alpha = 0.9 - k * 0.5; } });
  }
}
