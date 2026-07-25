// thereminScene — VOLTRA "Yorug'lik Cholg'usi" PixiJS olami.
// LDR (yorug'lik sensori) → ovoz balandligi (chastota). Qo'l soyasi bilan
// balandlikni boshqarib, 3 ta nishon-notaga moslashtirasan. Tungi shahar +
// aurora fonida yorug'lik ustuni pitch bilan ko'tariladi.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000;
export const LH = 560;
const X = 500, YB = 486, YT = 96;   // pitch o'qi (past → baland)
const mapY = (n) => YB - Math.max(0, Math.min(1, n)) * (YB - YT);

function hslHex(h, s, l) {
  h /= 360; const a = s * Math.min(l, 1 - l);
  const f = (n) => { const k = (n + h * 12) % 12; return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))); };
  return (Math.round(f(0) * 255) << 16) | (Math.round(f(8) * 255) << 8) | Math.round(f(4) * 255);
}

export function assembleTheremin(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.4, bloomScale: 1.1, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#0a0618', '#160a30', '#0d0a24', '#06060f'])); skyC.addChild(sky);
  const starC = new Container(); skyC.addChild(starC);
  const stars = [];
  for (let i = 0; i < 80; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.4).fill(0xeaf3ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random() * 0.6, b: 0.3 + Math.random() * 0.5, sp: 0.6 + Math.random() * 2, ph: Math.random() * 6.28 }); }

  const root = new Container(); app.stage.addChild(root);

  const aurora = new Sprite(radialTexture('rgba(120,90,255,0.4)', 512)); aurora.anchor.set(0.5); aurora.width = 900; aurora.height = 420; aurora.x = X; aurora.y = 250; aurora.alpha = 0.5;
  root.addChild(aurora);

  const sky1 = makeSkyline(120, 0x120a2a, 19); sky1.y = 486 - 470; sky1.alpha = 0.6; root.addChild(sky1);

  // pitch yo'lagi (faint track)
  const track = new Graphics().roundRect(X - 30, YT, 60, YB - YT, 12).fill({ color: 0xffffff, alpha: 0.03 }).roundRect(X - 30, YT, 60, YB - YT, 12).stroke({ width: 1, color: 0x3a3a6a, alpha: 0.4 });
  root.addChild(track);

  const pillar = new Graphics(); root.addChild(pillar);
  const targetG = new Graphics(); root.addChild(targetG);

  const indicator = new Container(); indicator.x = X;
  const iGlow = new Sprite(radialTexture('rgba(255,255,255,0.7)', 256)); iGlow.anchor.set(0.5); iGlow.width = iGlow.height = 120;
  const iCore = new Graphics().circle(0, 0, 16).fill(0xffffff).circle(0, 0, 16).stroke({ width: 2, color: 0xffffff, alpha: 0.6 });
  indicator.addChild(iGlow, iCore);
  root.addChild(indicator);

  const waveG = new Graphics(); root.addChild(waveG);
  const particles = makeParticles(root);

  return { app, root, sky, starC, stars, aurora, pillar, targetG, indicator, iGlow, iCore, waveG, particles, lastCapture: 0 };
}

// ctl = { freqNorm, targetNorm, matched, captureProgress, capturePulse, connected, noteIndex }
export function thereminTick(scene, dt, t, ctl) {
  const { app, root, sky, starC, stars, aurora, pillar, targetG, indicator, iGlow, iCore, waveG, particles } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  stars.forEach((s) => { s.g.x = s.fx * w; s.g.y = s.fy * h; s.g.alpha = s.b * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)); });

  const fn = ctl.connected ? (ctl.freqNorm || 0) : 0.05;
  const fy = mapY(fn);
  const hue = 190 + fn * 150;
  const col = hslHex(hue, 0.85, 0.6);

  aurora.tint = col; aurora.alpha = 0.35 + fn * 0.35 + 0.08 * Math.sin(t * 1.5);

  // yorug'lik ustuni
  pillar.clear();
  pillar.roundRect(X - 22, fy, 44, YB - fy, 12).fill({ color: col, alpha: 0.85 });
  pillar.roundRect(X - 22, fy, 44, 8, 4).fill({ color: 0xffffff, alpha: 0.6 });

  // indikator
  indicator.y = fy;
  iCore.tint = col; iGlow.tint = col;
  iGlow.alpha = 0.4 + 0.2 * Math.sin(t * 4);
  indicator.scale.set(1 + 0.08 * Math.sin(t * 5));

  // nishon chizig'i + ushlash halqasi
  const ty = mapY(ctl.targetNorm || 0.5);
  const matched = ctl.matched;
  const tcol = matched ? 0x39e06a : 0xffc21a;
  targetG.clear();
  targetG.moveTo(X - 130, ty).lineTo(X + 130, ty).stroke({ width: 2.5, color: tcol, alpha: 0.9 });
  targetG.moveTo(X - 150, ty).lineTo(X - 132, ty).stroke({ width: 4, color: tcol });
  targetG.moveTo(X + 132, ty).lineTo(X + 150, ty).stroke({ width: 4, color: tcol });
  // ushlash progressi (halqa)
  const cp = Math.max(0, Math.min(1, ctl.captureProgress || 0));
  if (cp > 0.01) targetG.arc(X, ty, 26, -Math.PI / 2, -Math.PI / 2 + cp * Math.PI * 2).stroke({ width: 4, color: 0x39e06a, alpha: 0.95 });

  // to'lqin
  waveG.clear();
  const amp = 8 + fn * 46;
  const freqScale = 0.5 + fn * 3;
  for (let k = 0; k < 2; k++) {
    let started = false;
    for (let px = 40; px < LW - 40; px += 6) {
      const yy = 520 + Math.sin((px + t * 300 * freqScale) * 0.03) * amp * (1 - k * 0.4);
      if (!started) { waveG.moveTo(px, yy); started = true; } else waveG.lineTo(px, yy);
    }
    waveG.stroke({ width: 2, color: col, alpha: 0.5 - k * 0.2 });
  }

  // nota tutildi — portlash
  if (ctl.capturePulse !== scene.lastCapture) {
    scene.lastCapture = ctl.capturePulse;
    particles.burst(X, ty, 0x39e06a, 30, 220);
    for (let i = 0; i < 6; i++) particles.burst(X + (Math.random() - 0.5) * 120, ty - Math.random() * 40, col, 3, 160);
  }
}
