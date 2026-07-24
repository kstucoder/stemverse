// colorCityScene — VOLTRA "Shaharga Rangni Qaytar" o'yin olami.
// Intro'ning davomi: qora tuynuk shahar rangini yutgan → shahar kulrang.
// O'yinchi 3 potensiometr (R/G/B) bilan rangni aralashtirib maqsad rangga
// moslashtiradi; har mos kelganda "rang yadrosi" shaharga rang oqimini yuboradi,
// shahar bosqichma-bosqich jonlanadi, oxirida qora tuynuk yopiladi.
// 1 va 2-o'yin bilan BITTA olam (assembleCity).
import { Container, Graphics, Sprite, ColorMatrixFilter } from 'pixi.js';
import { assembleCity, cityTick, radialTexture, GROUND_Y } from './cityScene';

const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(v || 0)));
export function rgbHex(r, g, b) { return (clamp255(r) << 16) | (clamp255(g) << 8) | clamp255(b); }

const CORE_X = 500, CORE_Y = 150;   // rang yadrosi (osmon)
const BH_X = 726, BH_Y = 112;       // so'nayotgan qora tuynuk

/* olmos/kristall (oq — tint bilan ranglanadi) */
function makeDiamond(s) {
  const g = new Graphics();
  g.poly([0, -s, s * 0.72, -s * 0.18, s * 0.5, s, -s * 0.5, s, -s * 0.72, -s * 0.18]).fill(0xffffff);
  g.poly([0, -s, -s * 0.72, -s * 0.18, 0, s * 0.05]).fill({ color: 0xffffff, alpha: 0.75 });
  g.poly([0, s * 0.05, s * 0.5, s, -s * 0.5, s]).fill({ color: 0xffffff, alpha: 0.4 });
  g.stroke({ width: 1.5, color: 0xffffff, alpha: 0.9 });
  return g;
}

function makeCore() {
  const c = new Container();
  const glow = new Sprite(radialTexture('rgba(255,255,255,0.65)', 512));
  glow.anchor.set(0.5); glow.width = glow.height = 240;
  const crystal = makeDiamond(34);
  c.addChild(glow, crystal);
  return { c, crystal, glow };
}

function makeBlackHole() {
  const c = new Container();
  const halo = new Sprite(radialTexture('rgba(150,90,255,0.4)', 256));
  halo.anchor.set(0.5); halo.width = halo.height = 220;
  const disk = new Container();
  [[60, 0xffb03a, 7], [46, 0xff5a3c, 5], [34, 0x7fd0ff, 4]].forEach(([rr, col, wdt]) => {
    disk.addChild(new Graphics().ellipse(0, 0, rr, rr * 0.34).stroke({ width: wdt, color: col, alpha: 0.7 }));
  });
  const core = new Graphics().circle(0, 0, 24).fill(0x04030a);
  const photon = new Graphics().circle(0, 0, 26).stroke({ width: 2.5, color: 0xffe6b0, alpha: 0.9 });
  c.addChild(halo, disk, core, photon);
  return { c, disk, halo };
}

export function assembleColorCity(app) {
  const city = assembleCity(app, { startLit: true });
  const cm = new ColorMatrixFilter();
  city.root.filters = [cm];

  // filtrsiz ustki qatlam (rang yadrosi, qora tuynuk, rang oqimi — haqiqiy rangda)
  const top = new Container();
  app.stage.addChild(top);
  const bh = makeBlackHole();
  top.addChild(bh.c);
  const core = makeCore();
  top.addChild(core.c);
  const ring = new Graphics();
  top.addChild(ring);
  const streamLayer = new Container();
  top.addChild(streamLayer);

  return { app, city, cm, bh, core, ring, streamLayer, streams: [], lastPulse: 0, satS: -1, popped: 0 };
}

// ctl = { r, g, b, similarity(0..1), satProgress(0..1), connected, pulse }
export function colorCityTick(scene, dt, t, ctl) {
  const { app, city, cm, bh, core, ring, streamLayer, streams } = scene;

  // shahar animatsiyasi (rang saturatsiya bilan qaytadi)
  cityTick(city, dt, t, {
    litCount: 8,
    energy: 35 + 55 * ctl.satProgress,
    night: true,
    tramOn: ctl.satProgress > 0.05,
    shooting: false,
  });

  // saturatsiya: -1 (kulrang) → 0 (to'liq rang) satProgress bo'yicha
  const satTarget = -1 + Math.min(1, ctl.satProgress);
  scene.satS += (satTarget - scene.satS) * Math.min(dt * 2, 1);
  cm.reset();
  cm.saturate(scene.satS, false);

  const S = city.root.scale.x, ox = city.root.x, oy = city.root.y;
  const w2sx = (wx) => ox + wx * S;
  const w2sy = (wy) => oy + wy * S;

  // qora tuynuk — progress bilan yopiladi
  const open = Math.max(0, 1 - ctl.satProgress * 1.05);
  bh.c.x = w2sx(BH_X); bh.c.y = w2sy(BH_Y);
  bh.c.scale.set(S * open * 0.85);
  bh.c.visible = open > 0.02;
  bh.disk.rotation += dt * 0.7;
  bh.halo.alpha = 0.28 + 0.18 * Math.sin(t * 3);

  // rang yadrosi (joriy aralashma rangi)
  const cur = rgbHex(ctl.r, ctl.g, ctl.b);
  core.c.x = w2sx(CORE_X); core.c.y = w2sy(CORE_Y) + Math.sin(t * 1.6) * 4;
  core.c.scale.set(S * (0.95 + 0.06 * Math.sin(t * 2.4)));
  core.crystal.tint = cur;
  core.crystal.rotation = Math.sin(t * 0.5) * 0.08;
  core.glow.tint = cur;
  core.glow.alpha = 0.35 + 0.15 * Math.sin(t * 2.4);

  // moslik halqasi (yadro atrofida)
  const sim = Math.max(0, Math.min(1, ctl.similarity || 0));
  const rc = sim > 0.9 ? 0x39e06a : sim > 0.6 ? 0xffc21a : 0xff5a5a;
  ring.x = core.c.x; ring.y = core.c.y;
  ring.clear();
  ring.circle(0, 0, 50 * S).stroke({ width: 3, color: 0xffffff, alpha: 0.08 });
  ring.arc(0, 0, 50 * S, -Math.PI / 2, -Math.PI / 2 + Math.max(0.001, sim) * Math.PI * 2)
    .stroke({ width: 5 * S, color: rc, alpha: 0.9 });

  // g'alaba pulsi — yadrodan shaharga rang oqimi
  if (ctl.pulse !== scene.lastPulse) {
    scene.lastPulse = ctl.pulse;
    for (let i = 0; i < 26; i++) {
      const bx = 90 + Math.random() * 820, by = 200 + Math.random() * 250;
      const g = new Graphics().circle(0, 0, 2 + Math.random() * 2.6).fill(cur);
      streamLayer.addChild(g);
      streams.push({ g, x0: CORE_X, y0: CORE_Y, x1: bx, y1: by, p: 0, dur: 0.55 + Math.random() * 0.5 });
    }
  }
  for (let i = streams.length - 1; i >= 0; i--) {
    const st = streams[i];
    st.p += dt / st.dur;
    const e = 1 - Math.pow(1 - st.p, 2);   // sekinlashib tarqaladi
    const wx = st.x0 + (st.x1 - st.x0) * e;
    const wy = st.y0 + (st.y1 - st.y0) * e + Math.sin(st.p * Math.PI) * -18;
    st.g.x = w2sx(wx); st.g.y = w2sy(wy);
    st.g.scale.set(S * (1 - e * 0.4));
    st.g.alpha = st.p < 0.1 ? st.p * 10 : (1 - st.p) * 1.1;
    if (st.p >= 1) { st.g.destroy(); streams.splice(i, 1); }
  }
}
