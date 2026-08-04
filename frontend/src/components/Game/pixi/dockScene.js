// dockScene — VOLTRA "Ta'minot Doklash" olami (asteroid sagasi).
// Ultrasonik masofa = ta'minot podining dok bazasigacha bo'lgan oralig'i.
// Podni YASHIL "sweet spot" zonasiga keltirib bir lahza ushlab tur -> doklanadi.
// Juda yaqin -> to'qnashuv. 5 pod doklansa -> ta'minot ta'minlandi.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles } from './cityScene';

export const LW = 1000, LH = 560;
export const DOCK_X = 214, LANE_Y = 322, GAP_MAX = 620;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function assembleDock(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.46, bloomScale: 1.1, brightness: 1.0, blur: 6, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container(); app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#04060f', '#080c1a', '#0a0f1e', '#050810'])); skyC.addChild(sky);
  const starC = new Container(); skyC.addChild(starC); const stars = [];
  for (let i = 0; i < 90; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.3).fill(0xcfe0ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random(), b: 0.3 + Math.random() * 0.5, sp: 0.5 + Math.random() * 2, ph: Math.random() * 6.28 }); }

  const root = new Container(); app.stage.addChild(root);

  // uzoq sayyora/baza shu'lasi
  const planet = new Sprite(radialTexture('rgba(80,140,220,0.35)', 512)); planet.anchor.set(0.5, 1); planet.width = 900; planet.height = 300; planet.x = LW / 2; planet.y = LH; planet.blendMode = 'add'; root.addChild(planet);

  // lane (yo'lak) — chevronlar dokka qarab
  const lane = new Graphics();
  lane.rect(0, LANE_Y - 46, LW, 92).fill({ color: 0x0c1220, alpha: 0.6 });
  lane.moveTo(0, LANE_Y - 46).lineTo(LW, LANE_Y - 46).moveTo(0, LANE_Y + 46).lineTo(LW, LANE_Y + 46).stroke({ width: 2, color: 0x1f3a5a, alpha: 0.5 });
  for (let x = DOCK_X + 60; x < LW; x += 70) lane.moveTo(x, LANE_Y - 22).lineTo(x - 16, LANE_Y).lineTo(x, LANE_Y + 22).stroke({ width: 3, color: 0x2b6cc0, alpha: 0.25 });
  root.addChild(lane);

  // sweet-spot nishoni (yashil zona)
  const target = new Graphics(); root.addChild(target);

  // DOK bazasi (chap)
  const dock = new Container(); dock.x = DOCK_X; dock.y = LANE_Y; root.addChild(dock);
  const dg = new Graphics();
  dg.rect(-150, -120, 120, 240).fill(0x141c28).stroke({ width: 2, color: 0x2c4258 });          // baza tanasi
  dg.rect(-30, -60, 30, 120).fill(0x0c1220);                                                     // dok o'yig'i
  dg.rect(-150, -120, 120, 8).fill(0x2c4258); dg.rect(-150, 112, 120, 8).fill(0x2c4258);
  for (let y = -100; y < 110; y += 24) dg.circle(-140, y, 2).fill(0x3a5a7a);
  dock.addChild(dg);
  // qisqichlar (doklanganda yopiladi)
  const clampT = new Graphics().rect(-6, -60, 26, 12).fill(0x3a5068).stroke({ width: 1, color: 0x5a7a9a }); clampT.y = -60;
  const clampB = new Graphics().rect(-6, 48, 26, 12).fill(0x3a5068).stroke({ width: 1, color: 0x5a7a9a }); clampB.y = 60;
  dock.addChild(clampT, clampB);
  // dok guide chiroqlari
  const lights = [-40, 0, 40].map((y) => { const g = new Graphics().circle(-16, y, 5).fill(0x223); dock.addChild(g); return { g, y }; });

  // POD (ta'minot podi)
  const pod = new Container(); pod.y = LANE_Y; root.addChild(pod);
  const thr = new Sprite(radialTexture('rgba(120,200,255,0.9)', 128)); thr.anchor.set(0, 0.5); thr.width = 90; thr.height = 34; thr.x = 34; thr.blendMode = 'add'; pod.addChild(thr);
  const pg = new Graphics();
  pg.roundRect(-34, -26, 70, 52, 10).fill(0x2a3a4e).stroke({ width: 2, color: 0x6a90b8 });
  pg.roundRect(-24, -18, 34, 36, 6).fill(0x1a2634);                                               // yuk oynasi
  pg.rect(-24, -6, 34, 12).fill({ color: 0x39c06a, alpha: 0.5 });                                 // yuk (oziq)
  pg.circle(-30, -16, 3).fill(0xffd23f).circle(-30, 16, 3).fill(0xffd23f);
  pg.moveTo(34, -14).lineTo(46, 0).lineTo(34, 14).fill(0x1a2634);                                 // burun (dokka qaragan)
  pod.addChild(pg);

  const particles = makeParticles(root);
  const flash = new Graphics().rect(0, 0, 10, 10).fill(0xffffff); flash.alpha = 0; flash.blendMode = 'add'; app.stage.addChild(flash);

  return { app, sky, starC, stars, root, planet, target, dock, clampT, clampB, lights, pod, thr, particles, flash };
}

// s = { gap, zone, holdFrac, docked, connected, flash }
export function dockTick(scene, dt, t, s) {
  const { app, sky, starC, stars, root, target, clampT, clampB, lights, pod, thr, particles, flash } = scene;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  flash.width = w; flash.height = h;
  stars.forEach((st) => { st.g.x = st.fx * w; st.g.y = st.fy * h; st.g.alpha = st.b * (0.4 + 0.5 * Math.sin(t * st.sp + st.ph)); });

  const zone = s.zone || 'idle';
  const zoneCol = zone === 'sweet' ? 0x39e06a : zone === 'slow' ? 0xffc21a : (zone === 'danger' || zone === 'crash') ? 0xff3b46 : 0x2b6cc0;

  // pod pozitsiyasi
  pod.x = DOCK_X + 24 + (s.gap ?? GAP_MAX);
  thr.alpha = 0.4 + 0.4 * Math.sin(t * 20) + (zone === 'idle' ? 0 : 0.2);

  // sweet-spot nishoni
  target.clear();
  const tx = DOCK_X + 24 + 58;   // ideal pod x (sweet markazi)
  target.rect(tx - 60, LANE_Y - 50, 120, 100).stroke({ width: 2, color: 0x39e06a, alpha: 0.28 + (zone === 'sweet' ? 0.4 : 0) * (0.6 + 0.4 * Math.sin(t * 6)) });
  target.moveTo(tx, LANE_Y - 54).lineTo(tx, LANE_Y - 44).moveTo(tx, LANE_Y + 44).lineTo(tx, LANE_Y + 54).stroke({ width: 2, color: 0x39e06a, alpha: 0.5 });

  // dok chiroqlari + qisqichlar
  lights.forEach((l, i) => { l.g.clear(); const on = zone === 'sweet' || zone === 'slow' || zone === 'danger'; l.g.circle(-16, l.y, 5).fill(on ? zoneCol : 0x223).circle(-16, l.y, 5).stroke({ width: 1, color: on ? zoneCol : 0x2a3a4a, alpha: 0.8 }); });
  const closed = clamp(s.holdFrac ?? 0, 0, 1) * (zone === 'sweet' || s.docked !== undefined ? 1 : 0);
  clampT.y = -60 + closed * 24; clampB.y = 60 - closed * 24;

  // dock/crash effektlari
  if (s.flash > 0) { flash.tint = s.flashCol ?? 0xffffff; flash.alpha = s.flash; }
  else flash.alpha = Math.max(0, flash.alpha - dt * 2);

  particles.tick(dt);
}
