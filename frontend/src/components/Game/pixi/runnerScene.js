// runnerScene — VOLTRA "Tom Ustidan Poyga" PixiJS olami.
// Tungi shahar tomlari bo'ylab yugurish. POT → tezlik, BTN → sakrash.
// Simulyatsiyani sahnaning o'zi yuritadi (silliq 60fps), React'ga callback orqali
// xabar beradi. To'siqqa urilsa — o'yin tugadi; 1000m — g'alaba.
import { Container, Graphics, Sprite } from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { gradTexture, radialTexture, makeParticles, makeSkyline } from './cityScene';

export const LW = 1000;
export const LH = 560;
const GY = 432;          // tom sathi
const PX = 250;          // o'yinchi X (fiksatsiya)
const GRAV = 1500;
const JUMP = 620;
const GOAL = 1000;

function makeRunner() {
  const c = new Container();
  const trail = new Graphics();
  const legB = new Graphics().roundRect(-3, 0, 6, 20, 3).fill(0x0a9fd8); legB.y = -6;
  const legF = new Graphics().roundRect(-3, 0, 6, 20, 3).fill(0x00eeff); legF.y = -6;
  const body = new Graphics().roundRect(-8, -34, 16, 30, 6).fill(0x00d0ff).roundRect(-8, -34, 16, 30, 6).stroke({ width: 1.5, color: 0x7ff4ff });
  const arm = new Graphics().roundRect(-2.5, 0, 5, 16, 2.5).fill(0x00b8e6); arm.y = -30; arm.x = 3;
  const head = new Graphics().circle(0, -42, 7).fill(0xeaf3ff).circle(0, -42, 7).stroke({ width: 1.5, color: 0x00eeff });
  const glow = new Sprite(radialTexture('rgba(0,238,255,0.5)', 128)); glow.anchor.set(0.5); glow.width = glow.height = 80; glow.y = -24;
  c.addChild(glow, trail, legB, legF, body, arm, head);
  return { c, legB, legF, arm, trail };
}

const WIN_ON = [0xffd76a, 0xffe9a0, 0x8ff4ff, 0xffb35a];
// intro uslubidagi har xil realistik bino (fon parallaks qatlami uchun)
function makeMidBuilding(x) {
  const c = new Container(); c.x = x;
  const w = 120 + Math.round(Math.random() * 110);
  const floors = 2 + Math.floor(Math.random() * 5);
  const bh = 60 + floors * 44;
  const top = GY - bh;
  const facade = [0x141c2e, 0x18202f, 0x1a1826, 0x141a24][Math.floor(Math.random() * 4)];
  const g = new Graphics().rect(0, top, w, bh).fill(facade).rect(0, top, w, 5).fill({ color: 0x2a3546, alpha: 0.7 });
  const cols = Math.max(2, Math.floor((w - 14) / 30));
  for (let f = 0; f < floors; f++) for (let cc = 0; cc < cols; cc++) { if (Math.random() < 0.4) continue; const wx = 10 + cc * ((w - 16) / cols), wy = top + 16 + f * 44; g.roundRect(wx, wy, 14, 20, 2).fill(WIN_ON[Math.floor(Math.random() * WIN_ON.length)]); }
  const r = Math.random();
  if (r < 0.3) { for (let i = 0; i < 2; i++) g.roundRect(14 + i * 44, top - 12, 26, 12, 2).fill(0x2a3346); }               // AC
  else if (r < 0.52) { const tx = w * 0.5; g.rect(tx - 16, top - 32, 32, 32).fill(0x3a2a1e); g.ellipse(tx, top - 32, 18, 6).fill(0x4a3626); } // suv baki
  else if (r < 0.7) { const px = w * 0.5; g.moveTo(px, top).lineTo(px, top - 40).stroke({ width: 2, color: 0x3a4658 }); g.arc(px + 18, top - 8, 10, Math.PI * 1.1, Math.PI * 1.9).fill(0x2a3346); } // antenna+dish
  else if (r < 0.86) { const ax = w * 0.5; g.moveTo(ax - 26, top).lineTo(ax, top - 26).lineTo(ax + 26, top).fill(0x3a2a22); g.roundRect(ax - 7, top - 18, 14, 14, 2).fill(0xffdf7a); } // chordoq oshxona
  else { const chx = w * 0.62; g.rect(chx, top - 30, 14, 30).fill(0x3a241a); }                                            // chimnay
  c.addChild(g);
  return { c, x, w };
}

export function assembleRunner(app) {
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.42, bloomScale: 1.05, brightness: 1.0, blur: 5, quality: 4 })];
  app.stage.filterArea = app.renderer.screen;

  const skyC = new Container();
  app.stage.addChild(skyC);
  const sky = new Sprite(gradTexture(['#050a18', '#0a1230', '#161a40', '#0a0d1c']));
  skyC.addChild(sky);
  const starC = new Container(); skyC.addChild(starC);
  const stars = [];
  for (let i = 0; i < 70; i++) { const g = new Graphics().circle(0, 0, 0.6 + Math.random() * 1.3).fill(0xeaf3ff); starC.addChild(g); stars.push({ g, fx: Math.random(), fy: Math.random() * 0.55, b: 0.3 + Math.random() * 0.5, sp: 0.6 + Math.random() * 2, ph: Math.random() * 6.28 }); }
  const moon = new Sprite(radialTexture('rgba(190,215,255,0.5)', 256)); moon.anchor.set(0.5); moon.width = moon.height = 150;
  skyC.addChild(moon);

  const root = new Container();
  app.stage.addChild(root);

  // uzoq dim skyline (chuqurlik) + har xil realistik binolar (mid parallaks)
  const far = new Container(); root.addChild(far);
  for (let k = 0; k < 2; k++) { const sky = makeSkyline(150, 0x0c1526, 23); sky.y = GY - 470; sky.x = k * LW; far.addChild(sky); }
  far.alpha = 0.45;
  const midC = new Container(); root.addChild(midC);
  const midBuildings = [];
  let bx = -100;
  while (bx < LW + 300) { const b = makeMidBuilding(bx); midC.addChild(b.c); midBuildings.push(b); bx += b.w + 26 + Math.random() * 46; }

  // tom yo'lagi (foreground) — ikki nusxa
  const roadC = new Container(); root.addChild(roadC);
  const roadSegs = [];
  for (let k = 0; k < 2; k++) {
    const g = new Graphics()
      .rect(0, GY, LW, LH - GY).fill(0x0a0e18)
      .rect(0, GY, LW, 3).fill({ color: 0x00eeff, alpha: 0.4 });
    for (let x = 0; x < LW; x += 60) g.rect(x, GY + 26, 34, 2).fill({ color: 0x00eeff, alpha: 0.08 });
    g.x = k * LW; roadC.addChild(g); roadSegs.push(g);
  }

  const speedLines = new Graphics(); root.addChild(speedLines);
  const obstaclesG = new Graphics(); root.addChild(obstaclesG);
  const coinsG = new Graphics(); root.addChild(coinsG);
  const particles = makeParticles(root);

  const runner = makeRunner();
  runner.c.x = PX; runner.c.y = GY;
  root.addChild(runner.c);

  const scene = {
    app, root, sky, starC, stars, moon, far, midC, midBuildings, roadSegs, speedLines, obstaclesG, coinsG, particles, runner,
    // simulyatsiya holati
    playerY: 0, vy: 0, grounded: true, distance: 0, gameOver: false, won: false,
    obstacles: [], coins: [], spawnAcc: 0, coinAcc: 0, scroll: 0, distAcc: 0,
    lastJump: 0, lastReset: 0, runCycle: 0,
  };
  return scene;
}

function reset(s) {
  s.playerY = 0; s.vy = 0; s.grounded = true; s.distance = 0; s.gameOver = false; s.won = false;
  s.obstacles = []; s.coins = []; s.spawnAcc = 0; s.coinAcc = 0; s.scroll = 0;
}

// ctl = { speed, jumpPulse, resetPulse, connected, onCrash, onCoin, onWin, onDistance }
export function runnerTick(scene, dt, t, ctl) {
  const s = scene;
  const { app, root, sky, starC, stars, moon, far, midC, midBuildings, roadSegs, speedLines, obstaclesG, coinsG, runner, particles } = s;
  const w = app.screen.width, h = app.screen.height;
  sky.width = w; sky.height = h;
  const sc = Math.min(w / LW, h / LH);
  root.scale.set(sc); root.x = (w - LW * sc) / 2; root.y = (h - LH * sc) / 2;
  moon.x = w * 0.78; moon.y = h * 0.28;
  stars.forEach((st) => { st.g.x = st.fx * w; st.g.y = st.fy * h; st.g.alpha = st.b * (0.5 + 0.5 * Math.sin(t * st.sp + st.ph)); });

  if (ctl.resetPulse !== s.lastReset) { s.lastReset = ctl.resetPulse; reset(s); }

  const speed = s.gameOver ? 0 : (ctl.connected ? Math.max(0, ctl.speed) : 0);
  const scroll = speed * dt;
  s.scroll += scroll;

  // parallaks
  far.x = -((s.scroll * 0.12) % LW);
  const md = scroll * 0.5;
  midBuildings.forEach((b) => { b.x -= md; b.c.x = b.x; });
  if (midBuildings.length && midBuildings[0].x + midBuildings[0].w < -140) {
    const old = midBuildings.shift(); old.c.destroy({ children: true });
    const rm = midBuildings[midBuildings.length - 1];
    const nb = makeMidBuilding(rm.x + rm.w + 26 + Math.random() * 46); midC.addChild(nb.c); midBuildings.push(nb);
  }
  const rd = -((s.scroll) % LW); roadSegs[0].x = rd; roadSegs[1].x = rd + LW;

  if (!s.gameOver) {
    // masofa
    s.distance += scroll * 0.12;
    s.distAcc += dt;
    if (s.distAcc > 0.1) { s.distAcc = 0; if (ctl.onDistance) ctl.onDistance(s.distance); }
    if (s.distance >= GOAL && !s.won) { s.won = true; if (ctl.onWin) ctl.onWin(); }

    // sakrash
    if (ctl.jumpPulse !== s.lastJump) { s.lastJump = ctl.jumpPulse; if (s.grounded) { s.vy = JUMP; s.grounded = false; } }
    if (!s.grounded) { s.vy -= GRAV * dt; s.playerY += s.vy * dt; if (s.playerY <= 0) { s.playerY = 0; s.vy = 0; s.grounded = true; } }

    // spawn
    if (speed > 5) {
      s.spawnAcc += scroll;
      if (s.spawnAcc > 260 + Math.random() * 120) { s.spawnAcc = 0; s.obstacles.push({ x: LW + 40, hgt: 34 + Math.random() * 46, wd: 26 + Math.random() * 18, type: Math.floor(Math.random() * 3) }); }
      s.coinAcc += scroll;
      if (s.coinAcc > 180 + Math.random() * 160) { s.coinAcc = 0; s.coins.push({ x: LW + 40, y: 40 + Math.random() * 90 }); }
    }
    // harakat + to'qnashuv
    s.obstacles.forEach((o) => { o.x -= scroll; });
    s.obstacles = s.obstacles.filter((o) => o.x > -60);
    s.coins.forEach((o) => { o.x -= scroll; });
    for (const o of s.obstacles) {
      if (Math.abs(o.x - PX) < 24 && s.playerY < o.hgt - 6) { s.gameOver = true; if (ctl.onCrash) ctl.onCrash(Math.round(s.distance)); break; }
    }
    s.coins = s.coins.filter((c) => {
      if (c.x < -40) return false;
      if (Math.abs(c.x - PX) < 26 && Math.abs(s.playerY - c.y) < 30) { particles.burst(PX, GY - c.y, 0xffd700, 10, 160); if (ctl.onCoin) ctl.onCoin(); return false; }
      return true;
    });
  }

  // o'yinchi render
  runner.c.y = GY - s.playerY;
  if (s.grounded && speed > 5) {
    s.runCycle += dt * (6 + speed * 0.02);
    const sw = Math.sin(s.runCycle);
    runner.legF.rotation = sw * 0.7; runner.legB.rotation = -sw * 0.7; runner.arm.rotation = -sw * 0.6;
  } else {
    runner.legF.rotation = 0.5; runner.legB.rotation = -0.3; runner.arm.rotation = -0.4;
  }
  runner.trail.clear();
  if (speed > 40 && s.grounded) { for (let i = 1; i <= 3; i++) runner.trail.roundRect(-8 - i * 14, -30, 12, 24, 5).fill({ color: 0x00eeff, alpha: 0.12 / i }); }

  // to'siqlar — tom ustidagi jihozlar (AC / ventilyatsiya / quti), sakrab o't
  obstaclesG.clear();
  s.obstacles.forEach((o) => {
    const x0 = o.x - o.wd / 2, yTop = GY - o.hgt;
    if (o.type === 0) {          // konditsioner
      obstaclesG.roundRect(x0, yTop, o.wd, o.hgt, 3).fill(0x2a3140).roundRect(x0, yTop, o.wd, o.hgt, 3).stroke({ width: 2, color: 0x00eeff });
      for (let i = 0; i < 3; i++) obstaclesG.rect(x0 + 4, yTop + 5 + i * 7, o.wd - 8, 2).fill({ color: 0x00eeff, alpha: 0.5 });
    } else if (o.type === 1) {   // ventilyatsiya trubasi
      obstaclesG.roundRect(x0, yTop, o.wd, o.hgt, Math.min(o.wd / 2, 8)).fill(0x1a2230).roundRect(x0, yTop, o.wd, o.hgt, Math.min(o.wd / 2, 8)).stroke({ width: 2, color: 0x39e06a });
      obstaclesG.ellipse(o.x, yTop, o.wd / 2, 5).fill(0x2a3546);
    } else {                     // yog'och quti
      obstaclesG.roundRect(x0, yTop, o.wd, o.hgt, 2).fill(0x3a2a1a).roundRect(x0, yTop, o.wd, o.hgt, 2).stroke({ width: 2, color: 0xffc21a });
      obstaclesG.moveTo(x0, yTop).lineTo(x0 + o.wd, yTop + o.hgt).moveTo(x0 + o.wd, yTop).lineTo(x0, yTop + o.hgt).stroke({ width: 1, color: 0xffc21a, alpha: 0.35 });
    }
  });
  // tangalar (energiya orblari)
  coinsG.clear();
  s.coins.forEach((c) => {
    coinsG.circle(c.x, GY - c.y, 8).fill({ color: 0xffd700, alpha: 0.9 }).circle(c.x, GY - c.y, 8).stroke({ width: 2, color: 0xffe08a });
    coinsG.circle(c.x, GY - c.y, 3).fill(0xfff6c8);
  });

  // tezlik chiziqlari
  speedLines.clear();
  if (speed > 120 && !s.gameOver) {
    for (let i = 0; i < 6; i++) { const y = 80 + Math.random() * 300; const len = 40 + speed * 0.3; const x = ((t * speed * 3 + i * 180) % (LW + 200)) - 100; speedLines.moveTo(x, y).lineTo(x - len, y).stroke({ width: 1.5, color: 0x7ff4ff, alpha: 0.25 }); }
  }
}
