import { Link } from 'react-router-dom';

// Inline SVG helpers — no emoji, no external deps
const IcoCart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const IcoPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M5 3l14 9-14 9V3z"/>
  </svg>
);
const IcoVideo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="7" width="15" height="10" rx="2"/>
    <path d="m17 9 5-3v12l-5-3V9z"/>
  </svg>
);
const IcoStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" strokeWidth="1" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IcoReturn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>
  </svg>
);
const IcoTruck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

export default function HeroSection({ sceneRef }) {
  return (
    <section className="hero" id="top">
      {/* Background orb */}
      <div className="hero-orb" />

      <div className="wrap">
        {/* ─── Copy ─── */}
        <div className="hero-copy">

          {/* Eyebrow */}
          <div className="hero-tag">
            <span className="eyebrow">
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--energy)', boxShadow: '0 0 8px var(--energy)', animation: 'eyeBlink 3s steps(1) infinite' }} />
              Missiya — 00 · Quvvat ber
            </span>
          </div>

          {/* Headline */}
          <h1>
            Elektronika<br />
            <span className="strike">uy vazifasi emas.</span>
            <br />
            Bu —{' '}
            <span className="blue">sarguzasht.</span>
          </h1>

          {/* Sub */}
          <p className="sub">
            Haqiqiy zanjirlar yig'. Arduino'ni ula.{' '}
            <b>Shaharlarni qutqar.</b>{' '}
            Missiyalarni bajar. Muhandis bo'l — har bir uchqun bilan.
          </p>

          {/* CTAs */}
          <div className="hero-cta">
            <button className="btn btn-amber" data-buy>
              <IcoCart /> To'plamni olish — $49
            </button>
            <Link to="/auth/register" className="btn btn-primary">
              <IcoPlay /> Sarguzashtni boshlash
            </Link>
            <button className="btn btn-ghost">
              <IcoVideo /> Treyler
            </button>
          </div>

          {/* Trust pills */}
          <div className="hero-trust">
            <span className="t-pill"><IcoStar /> <b>4.9</b> ota-ona bahosi</span>
            <span className="t-pill">20 ta o'yin missiyasi</span>
            <span className="t-pill"><IcoReturn /> 30 kun qaytarish</span>
            <span className="t-pill"><IcoTruck /> Bepul yetkazish</span>
          </div>

          {/* Feature badges */}
          <div className="hero-badges" style={{ marginTop: 20 }}>
            {['Arduino Uno', 'Web Serial API', '20 ta dars', 'XP tizimi', 'Teacher panel'].map(tag => (
              <span key={tag}><i />{tag}</span>
            ))}
          </div>
        </div>

        {/* ─── Scene ─── */}
        <div className="scene" id="scene" ref={sceneRef}>

          {/* Kit box photo — two-layer: outer=glow anim, inner=float anim */}
          <div className="hero-product-visual">
            <div className="hero-kit-glow-wrap">
              <img
                src="/images/kit-box.png"
                alt="VOLTRA Arduino STEM to'plami"
                className="hero-kit-main"
              />
            </div>
            {/* Edge fades: blends photo into dark page background */}
            <div className="hero-kit-fade" />
          </div>

          {/* Mascot — floating in front of kit box */}
          <div className="hero-mascot" aria-hidden="true">
            <img src="/images/mascot.png" alt="" />
          </div>

          {/* Label + CTA overlaid at bottom */}
          <div className="hero-kit-card">
            <div className="kit-label">
              <b>VOLTRA to'plami</b>
              20 ta interaktiv missiyani och
            </div>
            <Link to="/activate" className="kit-cta">Hozir faollashtir</Link>
          </div>
        </div>
      </div>

      {/* Scroll hint — icon only, fixed right edge */}
      <div className="scroll-hint">
        <i />
      </div>
    </section>
  );
}
