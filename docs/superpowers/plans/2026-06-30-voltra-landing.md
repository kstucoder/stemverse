# VOLTRA Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port VOLTRA landing page (1136-line standalone HTML/CSS/JS) into a React component that replaces the current Landing.jsx, with all sections, animations, and effects preserved.

**Architecture:** Single-page landing as React component at `/`. 18 section components + 6 hooks. CSS in separate file (no Tailwind mixing). SVG poster inline. Canvas particles via useEffect. Scroll effects via IntersectionObserver hooks.

**Tech Stack:** React 19 + Vite + Tailwind (landing CSS separate), React Router for nav links

---

### Task 1: Directory & scaffolding setup

**Files:**
- Create: `frontend/src/components/landing/` (directory)
- Create: `frontend/src/hooks/` (already exists, verify)

- [ ] **Step 1: Create landing component directory**

```bash
mkdir -p D:/ZCODE/arduwebgame/frontend/src/components/landing
```

- [ ] **Step 2: Create stub files for all 18 components**

```bash
cd D:/ZCODE/arduwebgame/frontend/src/components/landing
touch BootScreen.jsx LandingNav.jsx HeroSection.jsx ParentsSection.jsx StatsSection.jsx MissionsSection.jsx HardwareSection.jsx HowItWorks.jsx LearningPath.jsx ProjectsSection.jsx AchievementsSection.jsx TestimonialsSection.jsx CommunitySection.jsx FaqSection.jsx FinalCta.jsx LandingFooter.jsx StickyBuyBar.jsx MobileModal.jsx
```

- [ ] **Step 3: Create stub files for hooks**

```bash
touch D:/ZCODE/arduwebgame/frontend/src/hooks/useBoot.js D:/ZCODE/arduwebgame/frontend/src/hooks/useParticles.js D:/ZCODE/arduwebgame/frontend/src/hooks/useParallax.js D:/ZCODE/arduwebgame/frontend/src/hooks/useCounters.js D:/ZCODE/arduwebgame/frontend/src/hooks/useReveal.js D:/ZCODE/arduwebgame/frontend/src/hooks/useMediaQuery.js
```

- [ ] **Step 4: Create landing.css**

```bash
touch D:/ZCODE/arduwebgame/frontend/src/landing.css
```

- [ ] **Step 5: Commit scaffolding**

```bash
cd D:/ZCODE/arduwebgame
git add frontend/src/components/landing/ frontend/src/hooks/ frontend/src/landing.css
git commit -m "feat: scaffold VOLTRA landing page directory structure"
```

---

### Task 2: landing.css — Full VOLTRA CSS with `.voltra-landing` wrapper

**Files:**
- Create: `frontend/src/landing.css`

- [ ] **Step 1: Write landing.css**

Copy all CSS from `C:\Users\HP\Downloads\arduino-adventure.html` lines 19-434 into `frontend/src/landing.css`.

Key modifications:
- Wrap ALL CSS rules in `.voltra-landing { ... }` to avoid polluting global styles
- Exception: `.skip-link`, `.toast`, `.modal` — keep these top-level since they're overlay elements
- Add root-level `.voltra-landing { --void:#04060E; --energy:#19E3FF; ... }` CSS variables on the wrapper class (not `:root`)
- Remove `html{scroll-behavior:smooth}` and body styles (handled by React/App)
- Keep `@media (prefers-reduced-motion:reduce)` rules
- Keep all responsive queries

The CSS starts at line 19 of the source HTML and ends at line 434.

- [ ] **Step 2: Commit**

```bash
cd D:/ZCODE/arduwebgame
git add frontend/src/landing.css
git commit -m "feat: add VOLTRA landing CSS (wrapped in .voltra-landing)"
```

---

### Task 3: Hooks — useMediaQuery + useBoot

**Files:**
- Create: `frontend/src/hooks/useMediaQuery.js`
- Create: `frontend/src/hooks/useBoot.js`
- Modify: `frontend/src/hooks/useBoot.js`

- [ ] **Step 1: Write useMediaQuery hook**

```jsx
'use client';
import { useState, useEffect } from 'react';

export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') return window.matchMedia(query).matches;
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
```

- [ ] **Step 2: Write useBoot hook**

```jsx
import { useState, useEffect } from 'react';

export default function useBoot(reduceMotion) {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let timer;
    const seen = sessionStorage.getItem('voltra_booted');
    sessionStorage.setItem('voltra_booted', '1');

    if (seen || reduceMotion) {
      setBooting(false);
      document.body.classList.remove('booting');
    } else {
      const duration = 5000; // 5s boot animation
      timer = setTimeout(() => {
        setBooting(false);
        document.body.classList.remove('booting');
      }, duration);
    }

    return () => clearTimeout(timer);
  }, [reduceMotion]);

  const skipBoot = () => {
    setBooting(false);
    document.body.classList.remove('booting');
  };

  return { booting, skipBoot };
}
```

- [ ] **Step 3: Commit hooks**

```bash
cd D:/ZCODE/arduwebgame
git add frontend/src/hooks/useMediaQuery.js frontend/src/hooks/useBoot.js
git commit -m "feat: add useMediaQuery and useBoot hooks"
```

---

### Task 4: Hooks — useReveal + useCounters + useParallax

**Files:**
- Create: `frontend/src/hooks/useReveal.js`
- Create: `frontend/src/hooks/useCounters.js`
- Create: `frontend/src/hooks/useParallax.js`

- [ ] **Step 1: Write useReveal hook**

```jsx
import { useEffect, useRef } from 'react';

export default function useReveal(threshold = 0.16) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    el.querySelectorAll('.reveal').forEach((child) => io.observe(child));
    return () => io.disconnect();
  }, [threshold]);

  return ref;
}
```

- [ ] **Step 2: Write useCounters hook**

```jsx
import { useEffect, useRef } from 'react';

export default function useCounters() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.num span[data-to]').forEach(runCounter);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

function runCounter(el) {
  if (el.dataset.done) return;
  el.dataset.done = 1;
  const to = parseFloat(el.dataset.to);
  const dec = +el.dataset.dec || 0;
  const dur = 1400;
  const start = performance.now();
  function step(t) {
    const p = Math.min((t - start) / dur, 1);
    const v = (1 - Math.pow(1 - p, 3)) * to;
    el.textContent = dec ? v.toFixed(dec) : Math.floor(v);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = dec ? to.toFixed(dec) : to;
  }
  requestAnimationFrame(step);
}
```

- [ ] **Step 3: Write useParallax hook**

```jsx
import { useEffect, useRef } from 'react';

export default function useParallax(reduceMotion, isMobile) {
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || reduceMotion || isMobile) return;

    const layers = scene.querySelectorAll('.layer');
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let raf;

    const onMouse = (e) => {
      const r = scene.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5);
      ty = ((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => { tx = 0; ty = 0; };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      layers.forEach((l) => {
        const d = +l.dataset.depth || 10;
        l.style.transform = `translate(${-cx * d}px, ${-cy * d}px)`;
      });
    };

    scene.addEventListener('mousemove', onMouse);
    scene.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      scene.removeEventListener('mousemove', onMouse);
      scene.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion, isMobile]);

  return sceneRef;
}
```

- [ ] **Step 4: Commit**

```bash
cd D:/ZCODE/arduwebgame
git add frontend/src/hooks/useReveal.js frontend/src/hooks/useCounters.js frontend/src/hooks/useParallax.js
git commit -m "feat: add useReveal, useCounters, useParallax hooks"
```

---

### Task 5: Hooks — useParticles (Canvas)

**Files:**
- Create: `frontend/src/hooks/useParticles.js`

This is the canvas particle system from the VOLTRA HTML (lines 1067-1085). It draws:
- Floating particles (stars)
- Grid lines
- Random lightning bolts

- [ ] **Step 1: Write useParticles hook**

```jsx
import { useEffect, useRef } from 'react';

export default function useParticles(reduceMotion) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reduceMotion) return;
    const c = canvasRef.current;
    if (!c) return;
    
    const ctx = c.getContext('2d');
    let W, H;
    const parts = [];
    const lines = [];
    let bolt = null;
    let bt = 0;
    let tick = 0;

    const size = () => {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
    };
    size();
    window.addEventListener('resize', size, { passive: true });

    const N = Math.min(64, Math.floor(window.innerWidth / 24));
    for (let i = 0; i < N; i++) {
      parts.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.7 + 0.4,
        vy: -(Math.random() * 0.4 + 0.1),
        vx: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.5 + 0.2,
      });
    }
    for (let k = 0; k < 12; k++) {
      lines.push({
        x: Math.random() * W, y: Math.random() * H,
        len: Math.random() * 60 + 30,
        dir: Math.random() < 0.5 ? 0 : 1,
        a: Math.random() * 0.1 + 0.03,
      });
    }

    const spawnLightning = () => {
      const sx = Math.random() * W;
      const segs = [];
      let y = 0, xx = sx;
      while (y < H * 0.7) {
        y += Math.random() * 40 + 20;
        xx += (Math.random() - 0.5) * 60;
        segs.push({ x: xx, y });
      }
      bolt = { x: sx, segs };
      bt = 1;
    };

    let raf;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      lines.forEach((l) => {
        ctx.strokeStyle = `rgba(25,227,255,${l.a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (l.dir === 0) {
          ctx.moveTo(l.x, l.y);
          ctx.lineTo(l.x + l.len, l.y);
          ctx.lineTo(l.x + l.len + 10, l.y + 10);
        } else {
          ctx.moveTo(l.x, l.y);
          ctx.lineTo(l.x, l.y + l.len);
          ctx.lineTo(l.x + 10, l.y + l.len + 10);
        }
        ctx.stroke();
      });

      // Particles
      parts.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(25,227,255,${p.a})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(25,227,255,.6)';
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Lightning
      if (bt > 0 && bolt) {
        ctx.strokeStyle = `rgba(180,240,255,${bt})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#19E3FF';
        ctx.beginPath();
        ctx.moveTo(bolt.x, 0);
        bolt.segs.forEach((s) => ctx.lineTo(s.x, s.y));
        ctx.stroke();
        ctx.shadowBlur = 0;
        bt -= 0.06;
      }

      tick++;
      if (tick % 300 === 0 && Math.random() < 0.7) spawnLightning();
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
    };
  }, [reduceMotion]);

  return canvasRef;
}
```

- [ ] **Step 2: Commit**

```bash
cd D:/ZCODE/arduwebgame
git add frontend/src/hooks/useParticles.js
git commit -m "feat: add useParticles canvas hook"
```

---

### Task 6: BootScreen component

**Files:**
- Create: `frontend/src/components/landing/BootScreen.jsx`

- [ ] **Step 1: Write BootScreen component**

```jsx
import { Link } from 'react-router-dom';

export default function BootScreen({ onSkip }) {
  return (
    <div id="boot" className="done" style={{ animation: 'none' }}>
      <div className="boot-city"></div>
      <div className="boot-eyes"><span></span><span></span></div>
      <div className="boot-core">
        <div className="boot-chip"></div>
        <div className="boot-title">VOLTRA</div>
        <div className="boot-bar"><i></i></div>
      </div>
      <div className="boot-flash"></div>
      <button className="boot-skip" onClick={onSkip}>
        Intro-ni o'tkazib yuborish →
      </button>
    </div>
  );
}
```

Note: The `done` class and inline `animation:none` ensure the boot animation shows initially. CSS will handle the animation timing. The `useBoot` hook controls visibility.

- [ ] **Step 2: Commit**

```bash
cd D:/ZCODE/arduwebgame
git add frontend/src/components/landing/BootScreen.jsx
git commit -m "feat: add BootScreen component"
```

---

### Task 7: LandingNav component

**Files:**
- Create: `frontend/src/components/landing/LandingNav.jsx`

- [ ] **Step 1: Write LandingNav**

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <header className={`nav${scrolled ? ' solid' : ''}`} id="nav">
      <div className="wrap">
        <a href="#top" className="brand">
          <span className="brand-mark"></span>VOL<b>TRA</b>
        </a>
        <nav className="menu">
          <a href="#top" onClick={(e) => { e.preventDefault(); scrollTo('#top'); }}>Bosh sahifa</a>
          <a href="#missions" onClick={(e) => { e.preventDefault(); scrollTo('#missions'); }}>O'yinlar</a>
          <a href="#hardware" onClick={(e) => { e.preventDefault(); scrollTo('#hardware'); }}>To'plam</a>
          <a href="#path" onClick={(e) => { e.preventDefault(); scrollTo('#path'); }}>Ta'lim</a>
          <a href="#community" onClick={(e) => { e.preventDefault(); scrollTo('#community'); }}>Hamjamiyat</a>
          <a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('#faq'); }}>Yordam</a>
        </nav>
        <div className="nav-right">
          <Link to="/auth/login" className="login">Kirish</Link>
          <Link to="/activate" className="btn-activate">
            <span className="ico">🔑</span>
            <span className="lbl">To'plamni faollashtirish</span>
          </Link>
          <button
            className="icon-btn nav-toggle"
            onClick={() => document.getElementById('missions')?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Menyu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd D:/ZCODE/arduwebgame
git add frontend/src/components/landing/LandingNav.jsx
git commit -m "feat: add LandingNav component with scroll-aware glass effect"
```

---

### Task 8: HeroSection with SVG poster

**Files:**
- Create: `frontend/src/components/landing/HeroSection.jsx`
- Create: `frontend/src/components/landing/PosterSvg.jsx` (large SVG file)

- [ ] **Step 1: Create PosterSvg component**

Extract the SVG from `C:\Users\HP\Downloads\arduino-adventure.html` lines 493-657 into `PosterSvg.jsx`.

```jsx
export default function PosterSvg() {
  return (
    <svg className="poster-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1250" preserveAspectRatio="xMidYMid meet" aria-label="Yosh muhandis yonayotgan futuristik shahar fonida nurafshon platani ushlab turibdi, ortida ulkan himoyachi robot">
      <defs>
        {/* Copy ALL defs from lines 494-527 exactly */}
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">... 
      </defs>
      {/* Copy ALL SVG paths from lines 529-657 exactly */}
      <rect width="1000" height="1250" fill="url(#sky)"/>
      ...
    </svg>
  );
}
```

**Note:** Copy the FULL SVG content (lines 493-657) from the source HTML. SVG attributes like `stroke-width` become `strokeWidth` in JSX. `class` becomes `className`. Keep ALL filter, gradient, and path definitions.

- [ ] **Step 2: Write HeroSection**

```jsx
import { Link } from 'react-router-dom';
import PosterSvg from './PosterSvg';

export default function HeroSection({ sceneRef }) {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-copy">
          <div className="hero-tag">
            <span className="eyebrow">Missiya 00 · Quvvat ber</span>
          </div>
          <h1>
            Elektronika<br />
            <span className="strike">uy vazifasi emas.</span>
            <br />Bu — <span className="blue">sarguzasht.</span>
          </h1>
          <p className="sub">
            Haqiqiy zanjirlar yig'. Platangni ula. <b>Shaharlarni qutqar.</b>{' '}
            Missiyalarni bajar. Muhandis bo'l — har bir uchqun bilan.
          </p>
          <div className="hero-cta">
            <button className="btn btn-amber" style={{ fontSize: '1rem' }} data-buy>
              <span className="ico">🛒</span> To'plamni olish — $49
            </button>
            <Link to="/auth/register" className="btn btn-primary">
              <span className="ico">▶</span> Sarguzashtni boshlash
            </Link>
            <button className="btn btn-ghost">
              <span className="ico">🎥</span> Treyler
            </button>
          </div>
          <div className="hero-trust">
            <span className="t-pill"><b>★ 4.9</b> ota-ona bahosi</span>
            <span className="t-pill">100+ missiya</span>
            <span className="t-pill">↩ 30 kun ichida qaytarish</span>
            <span className="t-pill">🚚 Bepul yetkazib berish</span>
          </div>
        </div>
        <div className="scene" id="scene" ref={sceneRef}>
          <div className="poster-layer layer" data-depth="16">
            <PosterSvg />
          </div>
          <div className="floating-kit layer" data-depth="40">
            <div className="kit-box">
              <div className="kit-face front">VOLTRA TO'PLAMI</div>
              <div className="kit-face back">100+ MISSIYA</div>
              <div className="kit-face right">USB · PLATA</div>
              <div className="kit-face left">SENSORLAR</div>
            </div>
            <div className="kit-label">
              <b>VOLTRA to'plami</b>100+ interaktiv missiyani och
            </div>
            <Link to="/activate" className="kit-cta">Hozir faollashtir</Link>
          </div>
        </div>
      </div>
      <div className="scroll-hint"><i></i>Pastga aylantiring</div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd D:/ZCODE/arduwebgame
git add frontend/src/components/landing/HeroSection.jsx frontend/src/components/landing/PosterSvg.jsx
git commit -m "feat: add HeroSection with SVG poster and 3D floating kit"
```

---

### Task 9: ParentsSection + StatsSection

**Files:**
- Create: `frontend/src/components/landing/ParentsSection.jsx`
- Create: `frontend/src/components/landing/StatsSection.jsx`

- [ ] **Step 1: Write ParentsSection**

```jsx
export default function ParentsSection() {
  const cards = [
    { icon: '<path d="M9 18h6M10 22h4M12 2a7 7..."/>', title: "Tanqidiy fikrlash", desc: "Har bir missiya — jumboq. Bolalar xatolarni topadi, sinaydi va ishlaydigan yechimga erishadi." },
    { icon: '<path d="m14 7 3 3M5 19l9-9 1-4 4-1-1 4-9 9-4 1z"/><circle cx="6" cy="18" r="1"/>', title: "Haqiqiy muhandislik", desc: "Zanjirlar, sensorlar va motorlar — haqiqiy muhandislar ishlatadigan asoslar." },
    { icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', title: "Kamroq passiv ekran", desc: "Qo'llar ekrandan chiqib, haqiqiy detallarni ushlaydi." },
    { icon: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>', title: "Dasturlash asoslari", desc: "Sikllar, mantiq va o'zgaruvchilar — bosqichma-bosqich." },
    { icon: '<path d="M12 2v3M12 19v3M5 12H2M22 12h-3M5 5l2 2..."/>', title: "Ijodkorlik", desc: "Missiyalardan keyin bolalar o'z mashinalarini ixtiro qiladi." },
    { icon: '<path d="M5 16 3 8l5 3 4-7 4 7 5-3-2 8z"/><path d="M5 16h14v3H5z"/>', title: "Kelajak kasblari", desc: "Robototexnika, IoT va elektronika — ertangi eng yaxshi kasblar." },
  ];
  return (
    <section className="section-pad tint" id="parents">
      <div className="wrap">
        <div className="head center">
          <span className="eyebrow">Ota-onalar uchun</span>
          <h2>Ota-onalar nega VOLTRA'ni tanlaydi</h2>
          <p className="sub">Epik o'yin ko'rinishidagi haqiqiy muhandislik ko'nikmalari.</p>
        </div>
        <div className="pcards">
          {cards.map((c, i) => (
            <div key={i} className="pcard glass reveal">
              <div className="corner"></div>
              <div className="pic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" dangerouslySetInnerHTML={{ __html: c.icon }} />
              </div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write StatsSection**

```jsx
export default function StatsSection({ countersRef }) {
  return (
    <section style={{ padding: '0 0 clamp(40px,6vw,80px)' }} ref={countersRef}>
      <div className="wrap">
        <div className="stats-band">
          <div className="stat glass reveal">
            <div className="num"><span data-to="100">0</span><span className="suf">+</span></div>
            <div className="lbl">Interaktiv missiya</div>
          </div>
          <div className="stat glass reveal">
            <div className="num"><span data-to="50">0</span><span className="suf">+</span></div>
            <div className="lbl">Haqiqiy detal</div>
          </div>
          <div className="stat glass reveal">
            <div className="num"><span data-to="1000">0</span><span className="suf">+</span></div>
            <div className="lbl">Yosh muhandis</div>
          </div>
          <div className="stat glass gold reveal">
            <div className="num"><span data-to="4.9" data-dec="1">0</span><span className="suf">★</span></div>
            <div className="lbl">Ota-ona bahosi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd D:/ZCODE/arduwebgame
git add frontend/src/components/landing/ParentsSection.jsx frontend/src/components/landing/StatsSection.jsx
git commit -m "feat: add ParentsSection and StatsSection components"
```

---

### Task 10: MissionsSection + HardwareSection

**Files:**
- Create: `frontend/src/components/landing/MissionsSection.jsx`
- Create: `frontend/src/components/landing/HardwareSection.jsx`

- [ ] **Step 1: Write MissionsSection**

Copy the mission cards from VOLTRA HTML lines 734-784. Each card is an `<article>` with:
- `.mcard-art` with gradient background
- `.mcard-num` (M.01-M.10)
- `.mcard-diff` (easy/med/hard)
- `.mcard-body` with title, description, chips, XP, time
- Rail navigation buttons (prev/next)

- [ ] **Step 2: Write HardwareSection**

Copy the hardware SVG from VOLTRA HTML lines 794-816. Show the control board with component labels.

- [ ] **Step 3: Commit**

---

### Task 11: HowItWorks + LearningPath + ProjectsSection

**Files:**
- Create: `frontend/src/components/landing/HowItWorks.jsx`
- Create: `frontend/src/components/landing/LearningPath.jsx`
- Create: `frontend/src/components/landing/ProjectsSection.jsx`

- [ ] **Step 1: Write HowItWorks** — 4 steps + USB chain visualization
- [ ] **Step 2: Write LearningPath** — 4 level cards with progress bars
- [ ] **Step 3: Write ProjectsSection** — 8 project grid cards
- [ ] **Step 4: Commit**

---

### Task 12: Achievements + Testimonials + Community Sections

**Files:**
- Create: `frontend/src/components/landing/AchievementsSection.jsx`
- Create: `frontend/src/components/landing/TestimonialsSection.jsx`
- Create: `frontend/src/components/landing/CommunitySection.jsx`

- [ ] **Step 1: Write AchievementsSection** — 6 reward cards
- [ ] **Step 2: Write TestimonialsSection** — 3 testimonial cards
- [ ] **Step 3: Write CommunitySection** — 3 community project cards
- [ ] **Step 4: Commit**

---

### Task 13: FaqSection + FinalCta + LandingFooter

**Files:**
- Create: `frontend/src/components/landing/FaqSection.jsx`
- Create: `frontend/src/components/landing/FinalCta.jsx`
- Create: `frontend/src/components/landing/LandingFooter.jsx`

- [ ] **Step 1: Write FaqSection** — 6 accordion items
- [ ] **Step 2: Write FinalCta** — Pricing, guarantees, CTA buttons
- [ ] **Step 3: Write LandingFooter** — Grid footer with social links
- [ ] **Step 4: Commit**

---

### Task 14: StickyBuyBar + MobileModal

**Files:**
- Create: `frontend/src/components/landing/StickyBuyBar.jsx`
- Create: `frontend/src/components/landing/MobileModal.jsx`

- [ ] **Step 1: Write StickyBuyBar** — Fixed bottom bar, shows on scroll past hero
- [ ] **Step 2: Write MobileModal** — Modal for mobile users clicking "Play"
- [ ] **Step 3: Commit**

---

### Task 15: Main VoltraLanding.jsx component

**Files:**
- Create: `frontend/src/pages/VoltraLanding.jsx` (replaces current Landing.jsx)

- [ ] **Step 1: Write VoltraLanding**

Wire all sections together with hooks:

```jsx
import { useEffect } from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import useBoot from '../hooks/useBoot';
import useReveal from '../hooks/useReveal';
import useCounters from '../hooks/useCounters';
import useParallax from '../hooks/useParallax';
import useParticles from '../hooks/useParticles';

import BootScreen from '../components/landing/BootScreen';
import LandingNav from '../components/landing/LandingNav';
import HeroSection from '../components/landing/HeroSection';
// ... all other sections

import '../landing.css';

export default function VoltraLanding() {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { booting, skipBoot } = useBoot(reduceMotion);
  const revealRef = useReveal();
  const countersRef = useCounters();
  const sceneRef = useParallax(reduceMotion, isMobile);
  const canvasRef = useParticles(reduceMotion);

  useEffect(() => {
    document.body.classList.add('booting');
    return () => document.body.classList.remove('booting', 'is-mobile');
  }, []);

  useEffect(() => {
    if (isMobile) document.body.classList.add('is-mobile');
    else document.body.classList.remove('is-mobile');
  }, [isMobile]);

  // Buy button toast
  useEffect(() => {
    const handler = () => {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = "🛒 To'plam savatga qo'shildi (demo)";
        toast.classList.add('show');
        clearTimeout(toast._h);
        toast._h = setTimeout(() => toast.classList.remove('show'), 3400);
      }
    };
    document.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', handler));
    return () => document.querySelectorAll('[data-buy]').forEach(b => b.removeEventListener('click', handler));
  }, []);

  // Sticky buy bar
  useEffect(() => {
    const buybar = document.getElementById('buybar');
    const hero = document.getElementById('top');
    const onScroll = () => {
      if (hero) buybar?.classList.toggle('show', hero.getBoundingClientRect().bottom < -40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (booting) return <BootScreen onSkip={skipBoot} />;

  return (
    <div className="voltra-landing">
      <canvas id="fx" ref={canvasRef}></canvas>
      <div className="vignette"></div>
      <div className="app">
        <a href="#missions" className="skip-link">Asosiy kontentga o'tish</a>
        <LandingNav />
        <HeroSection sceneRef={sceneRef} />
        <div className="device-banner">
          <div className="inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="3"/><path d="M10 18h4"/>
            </svg>
            <div>
              <b>Siz telefondasiz — bu yerda hammasini ko'rishingiz mumkin.</b>
              <p>Missiyalar kompyuterda, USB orqali ulangan to'plam bilan o'ynaladi.</p>
            </div>
          </div>
        </div>
        <ParentsSection />
        <StatsSection countersRef={countersRef} />
        <div className="wrap"><div className="divider"></div></div>
        <MissionsSection />
        <HardwareSection />
        <HowItWorks />
        <div className="wrap"><div className="divider"></div></div>
        <LearningPath />
        <ProjectsSection />
        <AchievementsSection />
        <TestimonialsSection />
        <CommunitySection />
        <FaqSection />
        <FinalCta />
        <LandingFooter />
      </div>
      <StickyBuyBar />
      <MobileModal />
      <div className="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  );
}
```

- [ ] **Step 2: Update router.jsx** to use `VoltraLanding` instead of `Landing`

```jsx
// In router.jsx, change:
// import Landing from './pages/Landing';
import VoltraLanding from './pages/VoltraLanding';

// Change route:
// { index: true, element: <Landing /> },
{ index: true, element: <VoltraLanding /> },
```

- [ ] **Step 3: Commit**

```bash
cd D:/ZCODE/arduwebgame
git add frontend/src/pages/VoltraLanding.jsx frontend/src/router.jsx
git commit -m "feat: add VoltraLanding page and update router"
```

---

### Task 16: Build verification

**Files:**
- Build: `frontend/`

- [ ] **Step 1: Run production build**

```bash
cd D:/ZCODE/arduwebgame/frontend && npm run build 2>&1
```

- [ ] **Step 2: Fix any build errors**
- [ ] **Step 3: Final commit**

```bash
cd D:/ZCODE/arduwebgame && git add -A && git commit -m "fix: resolve build errors after VOLTRA landing integration"
```
